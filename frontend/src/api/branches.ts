import api from './client'

export interface Branch {
    id: string
    name: string
    address?: string
    phoneNumber?: string
    isActive: boolean
}

export const getBranches = async () => {
    const { data } = await api.get<Branch[]>('/branches')
    return data
}