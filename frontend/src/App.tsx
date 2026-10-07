import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

export default function App() {
    return (
        <AuthProvider>
        <BrowserRouter>
        <Navbar />
        < Routes >
        <Route path= "/login" element = {< LoginPage />} />
            < Route path = "/register" element = {< RegisterPage />} />
                < Route path = "/" element = {< Navigate to = "/login" replace />} />
                    </Routes>
                    </BrowserRouter>
                    </AuthProvider>
  )
}