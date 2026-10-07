import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getLowStock, getExpiring } from '../api/inventory'
import type { InventoryItem } from '../api/inventory'

export default function DashboardPage() {
    const { user } = useAuth()
    const [lowStock, setLowStock] = useState<InventoryItem[]>([])
    const [expiring, setExpiring] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([getLowStock().catch(() => []), getExpiring().catch(() => [])])
            .then(([low, exp]) => { setLowStock(low); setExpiring(exp) })
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className= "container mt-4" >
        <h2>Welcome, { user?.fullName } </h2>
        < p className = "text-muted" > Role: { user?.role } </p>
    {
        loading ? <p>Loading dashboard...</p> : (
            < div className = "row mt-4" >
                <div className="col-md-6" >
                    <div className="card shadow-sm" >
                        <div className="card-header bg-warning text-dark" >
                            <strong>⚠️ Low Stock({ lowStock.length }) </strong>
                                </div>
                                < ul className = "list-group list-group-flush" >
                                    { lowStock.length === 0 ? <li className="list-group-item text-muted"> No low stock items</ li > :
        lowStock.map((i) => (
            <li key= { i.id } className = "list-group-item d-flex justify-content-between" >
            <span>{ i.medicineName } @{ i.branchName } </span>
        < span className = "badge bg-danger" > { i.quantity } / { i.parLevel } </span>
        </li>
        ))
    }
    </ul>
        </div>
        </div>
        < div className = "col-md-6" >
            <div className="card shadow-sm" >
                <div className="card-header bg-danger text-white" >
                    <strong>🗓️ Expiring({ expiring.length }) </strong>
                        </div>
                        < ul className = "list-group list-group-flush" >
                            { expiring.length === 0 ? <li className="list-group-item text-muted"> No expiring items</ li > :
    expiring.map((i) => (
        <li key= { i.id } className = "list-group-item d-flex justify-content-between" >
        <span>{ i.medicineName } @{ i.branchName } </span>
    < span className = "badge bg-warning text-dark" > { i.expiryDate?.slice(0, 10) } </span>
    </li>
    ))
}
</ul>
    </div>
    </div>
    </div>
      )}
</div>
  )
}