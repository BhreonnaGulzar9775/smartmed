import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import InventoryPage from './pages/InventoryPage'
import PrescriptionsPage from './pages/PrescriptionsPage'

export default function App() {
    return (
        <AuthProvider>
        <BrowserRouter>
        <Navbar />
        < Routes >
        <Route path= "/login" element = {< LoginPage />} />
            < Route path = "/register" element = {< RegisterPage />} />
                < Route path = "/dashboard" element = {< ProtectedRoute > <DashboardPage /></ProtectedRoute >} />
                    < Route path = "/inventory" element = {< ProtectedRoute > <InventoryPage /></ProtectedRoute >} />
    < Route path = "/" element = {< Navigate to = "/dashboard" replace />} />
    < Route path = "/prescriptions" element = {< ProtectedRoute > <PrescriptionsPage /></ProtectedRoute >} />
                            </Routes>
                            </BrowserRouter>
                            </AuthProvider>
  )
}