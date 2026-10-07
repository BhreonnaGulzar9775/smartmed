import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getPrescriptionsByPatient, dispensePrescription } from '../api/prescriptions'
import type { Prescription } from '../api/prescriptions'

export default function PrescriptionsPage() {
    const { user } = useAuth()
    const [items, setItems] = useState<Prescription[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        setLoading(true)
        getPrescriptionsByPatient('00000000-0000-0000-0000-000000000000')
            .then(setItems)
            .catch((e) => setError(e.response?.data?.message || 'Failed to load'))
            .finally(() => setLoading(false))
    }, [])

    const handleDispense = async (id: string) => {
        try {
            await dispensePrescription(id)
            setItems((prev) =>
                prev.map((p) => (p.id === id ? { ...p, status: 'Dispensed' } : p))
            )
        } catch (e: any) {
            alert(e.response?.data?.message || 'Dispense failed')
        }
    }

    return (
        <div className= "container mt-4" >
        <h2>Prescriptions </h2>

    {
        loading ? (
            <p>Loading...</p>
      ) : error ? (
            <div className= "alert alert-info" >
            No prescriptions found.Create one via the API.
        </div>
      ) : (
            <table className= "table table-striped" >
            <thead className="table-dark" >
                <tr>
                <th>Number </th>
                < th > Patient </th>
                < th > Status </th>
                < th > Created </th>
                < th > Items </th>
                < th > </th>
                </tr>
                </thead>
                <tbody>
        {
            items.map((p) => (
                <tr key= { p.id } >
                <td>{ p.prescriptionNumber } </td>
                < td > { p.patientName } </td>
                < td >
                <span
                    className={`badge ${p.status === 'Dispensed'
                    ? 'bg-success'
                    : 'bg-warning text-dark'
                }`}
                  >
        { p.status }
            </span>
            </td>
            < td > { p.createdAt.slice(0, 10) } </td>
            <td>
        {
            p.items
            .map((i) => `${i.medicineName} x${i.quantity}`)
            .join(', ')
        }
        </td>
            <td>
        {
            p.status !== 'Dispensed' && user?.role !== 'Patient' && (
                <button
                      className="btn btn-sm btn-success"
            onClick = {() => handleDispense(p.id)
        }
                    >
            Dispense
            </button>
                  )
    }
    </td>
        </tr>
            ))
}
</tbody>
    </table>
      )}
</div>
  )
}