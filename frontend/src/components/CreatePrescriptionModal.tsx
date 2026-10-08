import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { getBranches } from '../api/branches'
import { getMedicines } from '../api/medicines'
import { getUsers } from '../api/users'
import { createPrescription } from '../api/prescriptions'
import type { Branch } from '../api/branches'
import type { Medicine } from '../api/medicines'
import type { UserSummary } from '../api/users'

interface Props {
    onClose: () => void
    onCreated: () => void
}

interface LineItem {
    medicineId: string
    dosage: string
    quantity: number
    instructions: string
}

export default function CreatePrescriptionModal({ onClose, onCreated }: Props) {
    const [patients, setPatients] = useState<UserSummary[]>([])
    const [branches, setBranches] = useState<Branch[]>([])
    const [medicines, setMedicines] = useState<Medicine[]>([])
    const [patientId, setPatientId] = useState('')
    const [branchId, setBranchId] = useState('')
    const [notes, setNotes] = useState('')
    const [items, setItems] = useState<LineItem[]>([])
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        Promise.all([getUsers('Patient'), getBranches(), getMedicines()])
            .then(([p, b, m]) => {
                setPatients(p)
                setBranches(b)
                setMedicines(m)
                if (p.length) setPatientId(p[0].id)
                if (b.length) setBranchId(b[0].id)
            })
            .catch((e) => setError(e.message || 'Failed to load data'))
    }, [])

    const addLine = () => {
        if (!medicines.length) return
        setItems([
            ...items,
            { medicineId: medicines[0].id, dosage: '', quantity: 1, instructions: '' },
        ])
    }

    const updateLine = (index: number, patch: Partial<LineItem>) => {
        setItems(items.map((it, i) => (i === index ? { ...it, ...patch } : it)))
    }

    const removeLine = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')

        if (!patientId || !branchId) {
            setError('Patient and branch are required')
            return
        }
        if (items.length === 0) {
            setError('Add at least one medicine')
            return
        }

        setSaving(true)
        try {
            await createPrescription({
                patientId,
                branchId,
                notes: notes || undefined,
                items: items.map((i) => ({
                    medicineId: i.medicineId,
                    dosage: i.dosage || undefined,
                    quantity: i.quantity,
                    instructions: i.instructions || undefined,
                })),
            })
            onCreated()
        } catch (e: any) {
            setError(e.response?.data?.message || e.message || 'Create failed')
        } finally {
            setSaving(false)
        }
    }

    return (
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
            onClick={onClose}
        >
            <div
                className="card shadow-lg"
                style={{ width: 640, maxHeight: '90vh', overflow: 'auto' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="card-body p-4">
                    <h4 className="mb-3">New Prescription</h4>

                    {error && <div className="alert alert-danger">{error}</div>}

                    {patients.length === 0 || branches.length === 0 || medicines.length === 0 ? (
                        <div className="alert alert-warning">
                            You need at least one patient, one branch, and one medicine before creating a
                            prescription.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Patient</label>
                                <select
                                    className="form-select"
                                    value={patientId}
                                    onChange={(e) => setPatientId(e.target.value)}
                                >
                                    {patients.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.fullName} ({p.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Branch</label>
                                <select
                                    className="form-select"
                                    value={branchId}
                                    onChange={(e) => setBranchId(e.target.value)}
                                >
                                    {branches.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Notes</label>
                                <textarea
                                    className="form-control"
                                    rows={2}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <strong>Items</strong>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={addLine}
                                >
                                    + Add Medicine
                                </button>
                            </div>

                            {items.map((item, i) => (
                                <div key={i} className="border rounded p-2 mb-2">
                                    <div className="row g-2">
                                        <div className="col-md-5">
                                            <select
                                                className="form-select form-select-sm"
                                                value={item.medicineId}
                                                onChange={(e) => updateLine(i, { medicineId: e.target.value })}
                                            >
                                                {medicines.map((m) => (
                                                    <option key={m.id} value={m.id}>
                                                        {m.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <input
                                                className="form-control form-control-sm"
                                                placeholder="Dosage"
                                                value={item.dosage}
                                                onChange={(e) => updateLine(i, { dosage: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-2">
                                            <input
                                                type="number"
                                                className="form-control form-control-sm"
                                                min={1}
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    updateLine(i, { quantity: Number(e.target.value) })
                                                }
                                            />
                                        </div>
                                        <div className="col-md-2">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger w-100"
                                                onClick={() => removeLine(i)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="col-12">
                                            <input
                                                className="form-control form-control-sm"
                                                placeholder="Instructions"
                                                value={item.instructions}
                                                onChange={(e) => updateLine(i, { instructions: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="d-flex justify-content-end gap-2 mt-3">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Creating...' : 'Create Prescription'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}