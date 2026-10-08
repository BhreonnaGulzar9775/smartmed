import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getBranches } from '../api/branches'
import { getInventoryByBranch, updateInventory } from '../api/inventory'
import { getMedicines, createMedicine } from '../api/medicines'
import api from '../api/client'
import type { Branch } from '../api/branches'
import type { InventoryItem } from '../api/inventory'
import type { Medicine } from '../api/medicines'

export default function InventoryPage() {
    const { user } = useAuth()
    const isStaff = user?.role === 'Admin' || user?.role === 'Pharmacist'

    const [branches, setBranches] = useState<Branch[]>([])
    const [selectedBranch, setSelectedBranch] = useState('')
    const [items, setItems] = useState<InventoryItem[]>([])
    const [medicines, setMedicines] = useState<Medicine[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [showAddMedicine, setShowAddMedicine] = useState(false)
    const [showAddStock, setShowAddStock] = useState(false)

    const [newMed, setNewMed] = useState({
        name: '',
        genericName: '',
        description: '',
        requiresPrescription: true,
        isColdChain: false,
    })

    const [newStock, setNewStock] = useState({
        medicineId: '',
        quantity: 10,
        parLevel: 20,
        expiryDate: '',
        batchNumber: '',
    })

    const loadAll = async () => {
        try {
            const [b, m] = await Promise.all([getBranches(), getMedicines()])
            setBranches(b)
            setMedicines(m)
            if (b.length && !selectedBranch) setSelectedBranch(b[0].id)
            if (m.length && !newStock.medicineId) setNewStock((s) => ({ ...s, medicineId: m[0].id }))
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to load data')
        }
    }

    const loadInventory = async (branchId: string) => {
        if (!branchId) return
        setLoading(true)
        try {
            const data = await getInventoryByBranch(branchId)
            setItems(data)
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to load inventory')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadAll()
    }, [])

    useEffect(() => {
        loadInventory(selectedBranch)
    }, [selectedBranch])

    const handleUpdate = async (id: string, quantity: number) => {
        try {
            await updateInventory(id, quantity)
            await loadInventory(selectedBranch)
        } catch (e: any) {
            alert(e.response?.data?.message || 'Update failed')
        }
    }

    const handleCreateMedicine = async () => {
        if (!newMed.name.trim()) {
            alert('Medicine name is required')
            return
        }
        try {
            await createMedicine(newMed)
            setShowAddMedicine(false)
            setNewMed({
                name: '',
                genericName: '',
                description: '',
                requiresPrescription: true,
                isColdChain: false,
            })
            await loadAll()
        } catch (e: any) {
            alert(e.response?.data?.message || 'Failed to create medicine')
        }
    }

    const handleAddStock = async () => {
        if (!selectedBranch || !newStock.medicineId) {
            alert('Medicine and branch are required')
            return
        }
        try {
            await api.post('/inventory', {
                branchId: selectedBranch,
                medicineId: newStock.medicineId,
                quantity: Number(newStock.quantity),
                parLevel: Number(newStock.parLevel),
                expiryDate: newStock.expiryDate || null,
                batchNumber: newStock.batchNumber || null,
            })
            setShowAddStock(false)
            setNewStock({
                medicineId: medicines[0]?.id || '',
                quantity: 10,
                parLevel: 20,
                expiryDate: '',
                batchNumber: '',
            })
            await loadInventory(selectedBranch)
        } catch (e: any) {
            alert(e.response?.data?.message || 'Failed to add stock')
        }
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Inventory</h2>
                {isStaff && (
                    <div className="d-flex gap-2">
                        {user?.role === 'Admin' && (
                            <button
                                className="btn btn-outline-primary"
                                onClick={() => setShowAddMedicine(true)}
                            >
                                + Medicine
                            </button>
                        )}
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowAddStock(true)}
                            disabled={!medicines.length || !branches.length}
                        >
                            + Add Stock
                        </button>
                    </div>
                )}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-3" style={{ maxWidth: 320 }}>
                <label className="form-label">Branch</label>
                <select
                    className="form-select"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                >
                    {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                            {b.name}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : items.length === 0 ? (
                <div className="alert alert-info">
                    No stock in this branch yet.{' '}
                    {isStaff && <span>Click &quot;Add Stock&quot; to create one.</span>}
                </div>
            ) : (
                <table className="table table-striped table-hover">
                    <thead className="table-dark">
                        <tr>
                            <th>Medicine</th>
                            <th>Quantity</th>
                            <th>Par Level</th>
                            <th>Expiry</th>
                            <th>Batch</th>
                            {isStaff && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((i) => (
                            <tr key={i.id}>
                                <td>{i.medicineName}</td>
                                <td>
                                    <span
                                        className={`badge ${i.quantity <= i.parLevel ? 'bg-danger' : 'bg-success'
                                            }`}
                                    >
                                        {i.quantity}
                                    </span>
                                </td>
                                <td>{i.parLevel}</td>
                                <td>{i.expiryDate?.slice(0, 10) || '-'}</td>
                                <td>{i.batchNumber || '-'}</td>
                                {isStaff && (
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => {
                                                const q = prompt('New quantity:', String(i.quantity))
                                                if (q !== null) handleUpdate(i.id, parseInt(q))
                                            }}
                                        >
                                            Update
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showAddMedicine && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}
                    onClick={() => setShowAddMedicine(false)}
                >
                    <div
                        className="card shadow-lg"
                        style={{ width: 480 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="card-body p-4">
                            <h4 className="mb-3">Add Medicine</h4>

                            <div className="mb-3">
                                <label className="form-label">Name</label>
                                <input
                                    className="form-control"
                                    value={newMed.name}
                                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Generic Name</label>
                                <input
                                    className="form-control"
                                    value={newMed.genericName}
                                    onChange={(e) => setNewMed({ ...newMed, genericName: e.target.value })}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-control"
                                    rows={2}
                                    value={newMed.description}
                                    onChange={(e) => setNewMed({ ...newMed, description: e.target.value })}
                                />
                            </div>

                            <div className="form-check mb-2">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="reqRx"
                                    checked={newMed.requiresPrescription}
                                    onChange={(e) =>
                                        setNewMed({ ...newMed, requiresPrescription: e.target.checked })
                                    }
                                />
                                <label className="form-check-label" htmlFor="reqRx">
                                    Requires Prescription
                                </label>
                            </div>

                            <div className="form-check mb-3">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="coldChain"
                                    checked={newMed.isColdChain}
                                    onChange={(e) =>
                                        setNewMed({ ...newMed, isColdChain: e.target.checked })
                                    }
                                />
                                <label className="form-check-label" htmlFor="coldChain">
                                    Cold Chain
                                </label>
                            </div>

                            <div className="d-flex justify-content-end gap-2">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowAddMedicine(false)}
                                >
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={handleCreateMedicine}>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showAddStock && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}
                    onClick={() => setShowAddStock(false)}
                >
                    <div
                        className="card shadow-lg"
                        style={{ width: 480 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="card-body p-4">
                            <h4 className="mb-3">Add Stock</h4>

                            <div className="mb-3">
                                <label className="form-label">Medicine</label>
                                <select
                                    className="form-select"
                                    value={newStock.medicineId}
                                    onChange={(e) => setNewStock({ ...newStock, medicineId: e.target.value })}
                                >
                                    {medicines.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Quantity</label>
                                <input
                                    type="number"
                                    min={1}
                                    className="form-control"
                                    value={newStock.quantity}
                                    onChange={(e) =>
                                        setNewStock({ ...newStock, quantity: Number(e.target.value) })
                                    }
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Par Level</label>
                                <input
                                    type="number"
                                    min={0}
                                    className="form-control"
                                    value={newStock.parLevel}
                                    onChange={(e) =>
                                        setNewStock({ ...newStock, parLevel: Number(e.target.value) })
                                    }
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Expiry Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={newStock.expiryDate}
                                    onChange={(e) => setNewStock({ ...newStock, expiryDate: e.target.value })}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Batch Number</label>
                                <input
                                    className="form-control"
                                    value={newStock.batchNumber}
                                    onChange={(e) =>
                                        setNewStock({ ...newStock, batchNumber: e.target.value })
                                    }
                                />
                            </div>

                            <div className="d-flex justify-content-end gap-2">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowAddStock(false)}
                                >
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={handleAddStock}>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}