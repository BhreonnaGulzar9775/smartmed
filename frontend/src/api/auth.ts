import api from './client'

export interface AuthResponse {
    token: string
    email: string
    fullName: string
    role: string
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
    return data
}

export const register = async (payload: {
    email: string
    password: string
    fullName: string
    role: string
    phoneNumber?: string
}): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    return data
}