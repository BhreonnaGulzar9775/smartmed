import api from './client'

export interface UserSummary {
    id: string
    email: string
    fullName: string
    role: string
    phoneNumber?: string
}

export const getUsers = async (role?: string) => {
    const { data } = await api.get<UserSummary[]>('/users', { params: { role } })
    return data
}