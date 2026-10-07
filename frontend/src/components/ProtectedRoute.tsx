import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ReactNode } from 'react'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const { token, loading } = useAuth()
    if (loading) return <div className="text-center mt-5" > Loading...</div>
    if (!token) return <Navigate to="/login" replace />
  return <>{ children } </>
}