import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
    getAllPrescriptions,
    getMyPrescriptions,
    dispensePrescription,
} from '../api/prescriptions'
import type { Prescription } from '../api/prescriptions'
import CreatePrescriptionModal from '../components/CreatePrescriptionModal'

export default function PrescriptionsPage() {
    const { user } = useAuth()
    const [items, setItems] = useState<Prescription[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showCreate, setShowCreate] = useState(false)

    const isStaff = user?.role === 'Admin' || user?.role === 'Pharmacist'

    const load = async () => {
        setLoading(true)
        setError('')
        try {
            const data = isStaff ? await getAllPrescriptions() : await getMyPrescriptions()
            setItems(data)
        } catch (e: any) {
            setError(e.response?.data?.message || e.message || 'Failed to load')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [user?.role])

    const handleDispense = async (id: string) => {
        if (!confirm('Mark this prescription as dispensed?')) return
        try {
            await dispensePrescription(id)
            await load()
        } catch (e: any) {
            alert(e.response?.data?.message || 'Dispense failed')
        }
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Prescriptions</h2>
                {isStaff && (
                    <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                        + New Prescription
                    </button>
                )}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <p>Loading...</p>
            ) : items.length === 0 ? (
                <div className="alert alert-info">
                    {isStaff
                        ? 'No prescriptions yet. Click "New Prescription" to create one.'
                        : "You don't have any prescriptions yet."}
                </div>
            ) : (
                <table className="table table-striped table-hover">
                    <thead className="table-dark">
                        <tr>
                            <th>Number</th>
                            <th>Patient</th>
                            <th>Branch</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Items</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((p) => (
                            <tr key={p.id}>
                                <td>{p.prescriptionNumber}</td>
                                <td>{p.patientName}</td>
                                <td>{p.branchName}</td>
                                <td>
                                    <span
                                        className={`badge ${p.status === 'Dispensed' ? 'bg-success' : 'bg-warning text-dark'
                                            }`}
                                    >
                                        {p.status}
                                    </span>
                                </td>
                                <td>{p.createdAt.slice(0, 10)}</td>
                                <td>
                                    {p.items.map((i) => `${i.medicineName} x${i.quantity}`).join(', ')}
                                </td>
                                <td>
                                    {isStaff && p.status !== 'Dispensed' && (
                                        <button
                                            className="btn btn-sm btn-success"
                                            onClick={() => handleDispense(p.id)}
                                        >
                                            Dispense
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showCreate && (
                <CreatePrescriptionModal
                    onClose={() => setShowCreate(false)}
                    onCreated={async () => {
                        setShowCreate(false)
                        await load()
                    }}
                />
            )}
        </div>
    )
}