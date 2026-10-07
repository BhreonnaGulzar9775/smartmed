import api from './client'

export interface InventoryItem {
    id: string
    branchId: string
    branchName: string
    medicineId: string
    medicineName: string
    quantity: number
    parLevel: number
    expiryDate?: string
    batchNumber?: string
}

export const getInventoryByBranch = async (branchId: string) => {
    const { data } = await api.get<InventoryItem[]>(`/inventory/branch/${branchId}`)
    return data
}

export const getLowStock = async () => {
    const { data } = await api.get<InventoryItem[]>('/inventory/low-stock')
    return data
}

export const getExpiring = async () => {
    const { data } = await api.get<InventoryItem[]>('/inventory/expiring')
    return data
}

export const updateInventory = async (id: string, quantity: number) => {
    await api.put(`/inventory/${id}`, { quantity })
}