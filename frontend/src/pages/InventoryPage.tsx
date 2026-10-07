import { useEffect, useState } from 'react'
import { getBranches } from '../api/branches'
import type { Branch } from '../api/branches'
import { getInventoryByBranch, updateInventory } from '../api/inventory'
import type { InventoryItem } from '../api/inventory'
export default function InventoryPage() {
    const [branches, setBranches] = useState<Branch[]>([])
    const [selectedBranch, setSelectedBranch] = useState<string>('')
    const [items, setItems] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        getBranches().then((b) => {
            setBranches(b)
            if (b.length) setSelectedBranch(b[0].id)
        })
    }, [])

    useEffect(() => {
        if (!selectedBranch) return
        setLoading(true)
        getInventoryByBranch(selectedBranch)
            .then(setItems)
            .finally(() => setLoading(false))
    }, [selectedBranch])

    const handleUpdate = async (id: string, quantity: number) => {
        await updateInventory(id, quantity)
        setItems(await getInventoryByBranch(selectedBranch))
    }

    return (
        <div className= "container mt-4" >
        <h2>Inventory Management </h2>
            < div className = "mb-3" style = {{ maxWidth: 300 }
}>
    <label className="form-label" > Select Branch </label>
        < select
className = "form-select"
value = { selectedBranch }
onChange = {(e) => setSelectedBranch(e.target.value)}
        >
{
    branches.map((b) => (
        <option key= { b.id } value = { b.id } > { b.name } </option>
    ))
}
    </select>
    </div>

{
    loading ? (
        <p>Loading...</p>
      ) : (
        <table className= "table table-striped table-hover" >
        <thead className="table-dark" >
            <tr>
            <th>Medicine </th>
            < th > Qty </th>
            < th > Par </th>
            < th > Expiry </th>
            < th > Batch </th>
            < th > Actions </th>
            </tr>
            </thead>
            <tbody>
    {
        items.map((i) => (
            <tr key= { i.id } >
            <td>{ i.medicineName } </td>
            < td >
            <span className={`badge ${i.quantity <= i.parLevel ? 'bg-danger' : 'bg-success'}`}>
            { i.quantity }
                </span>
                </td>
                < td > { i.parLevel } </td>
                < td > { i.expiryDate?.slice(0, 10) || '-' } </td>
                < td > { i.batchNumber || '-' } </td>
                < td >
                <button 
                    className="btn btn-sm btn-outline-primary"
    onClick = {() => {
        const q = prompt('New quantity:', String(i.quantity))
        if (q !== null) handleUpdate(i.id, parseInt(q))
    }
}
                  >
    Update
    </button>
    </td>
    </tr>
            ))}
</tbody>
    </table>
      )}
</div>
  )
}