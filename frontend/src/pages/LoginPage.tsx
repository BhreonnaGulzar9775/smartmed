import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        try {
            await login(email, password)
            navigate('/dashboard')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed')
        }
    }

    return (
        <div className= "container mt-5" style = {{ maxWidth: 420 }
}>
    <div className="card shadow" >
        <div className="card-body p-4" >
            <h3 className="text-center mb-4" >💊 SmartMed Login </h3>
{ error && <div className="alert alert-danger" > { error } </div> }
<form onSubmit={ handleSubmit }>
    <div className="mb-3" >
        <label className="form-label" > Email </label>
            < input
type = "email"
className = "form-control"
value = { email }
onChange = {(e) => setEmail(e.target.value)}
required
    />
    </div>
    < div className = "mb-3" >
        <label className="form-label" > Password </label>
            < input
type = "password"
className = "form-control"
value = { password }
onChange = {(e) => setPassword(e.target.value)}
required
    />
    </div>
    < button className = "btn btn-primary w-100" type = "submit" >
        Login
        </button>
        </form>
        < p className = "text-center mt-3 mb-0" >
            No account ? <Link to="/register" > Register </Link>
                </p>
                </div>
                </div>
                </div>
  )
}