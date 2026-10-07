import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import * as authApi from '../api/auth'

interface User { email: string; fullName: string; role: string }

interface AuthContextType {
    user: User | null
    token: string | null
    login: (email: string, password: string) => Promise<void>
    register: (payload: any) => Promise<void>
    logout: () => void
    loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const savedToken = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user')
        if (savedToken && savedUser) {
            setToken(savedToken)
            setUser(JSON.parse(savedUser))
        }
        setLoading(false)
    }, [])

    const handleAuth = (res: authApi.AuthResponse) => {
        localStorage.setItem('token', res.token)
        localStorage.setItem('user', JSON.stringify({
            email: res.email, fullName: res.fullName, role: res.role,
        }))
        setToken(res.token)
        setUser({ email: res.email, fullName: res.fullName, role: res.role })
    }

    const login = async (email: string, password: string) => {
        handleAuth(await authApi.login(email, password))
    }
    const register = async (payload: any) => {
        handleAuth(await authApi.register(payload))
    }
    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value= {{ user, token, login, register, logout, loading }
}>
{ children }
    </AuthContext.Provider>
  )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}