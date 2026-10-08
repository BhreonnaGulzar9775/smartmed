import api from './client'

export interface Medicine {
    id: string
    name: string
    genericName?: string
    description?: string
    requiresPrescription: boolean
    isColdChain: boolean
}

export const getMedicines = async () => {
    const { data } = await api.get<Medicine[]>('/medicines')
    return data
}

export const createMedicine = async (payload: {
    name: string
    genericName?: string
    description?: string
    requiresPrescription: boolean
    isColdChain: boolean
}) => {
    const { data } = await api.post('/medicines', payload)
    return data
}

export const deleteMedicine = async (id: string) => {
    await api.delete(`/medicines/${id}`)
}