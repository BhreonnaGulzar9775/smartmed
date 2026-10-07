import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
    const [form, setForm] = useState({
        email: '',
        password: '',
        fullName: '',
        role: 'Patient',
        phoneNumber: '',
    })
    const [error, setError] = useState('')
    const { register } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        try {
            await register(form)
            navigate('/dashboard')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed')
        }
    }

    return (
        <div className= "container mt-5" style = {{ maxWidth: 480 }
}>
    <div className="card shadow" >
        <div className="card-body p-4" >
            <h3 className="text-center mb-4" > Create SmartMed Account </h3>
{ error && <div className="alert alert-danger" > { error } </div> }
<form onSubmit={ handleSubmit }>
    <div className="mb-3" >
        <label className="form-label" > Full Name </label>
            < input
className = "form-control"
value = { form.fullName }
onChange = {(e) => setForm({ ...form, fullName: e.target.value })}
required
    />
    </div>
    < div className = "mb-3" >
        <label className="form-label" > Email </label>
            < input
type = "email"
className = "form-control"
value = { form.email }
onChange = {(e) => setForm({ ...form, email: e.target.value })}
required
    />
    </div>
    < div className = "mb-3" >
        <label className="form-label" > Password </label>
            < input
type = "password"
className = "form-control"
value = { form.password }
onChange = {(e) => setForm({ ...form, password: e.target.value })}
required
minLength = { 6}
    />
    </div>
    < div className = "mb-3" >
        <label className="form-label" > Phone Number </label>
            < input
className = "form-control"
value = { form.phoneNumber }
onChange = {(e) => setForm({ ...form, phoneNumber: e.target.value })}
              />
    </div>
    < div className = "mb-3" >
        <label className="form-label" > Role </label>
            < select
className = "form-select"
value = { form.role }
onChange = {(e) => setForm({ ...form, role: e.target.value })}
              >
    <option value="Patient" > Patient </option>
        < option value = "Pharmacist" > Pharmacist </option>
            < option value = "Admin" > Admin </option>
                </select>
                </div>
                < button className = "btn btn-primary w-100" type = "submit" >
                    Register
                    </button>
                    </form>
                    < p className = "text-center mt-3 mb-0" >
                        Have an account ? <Link to="/login" > Login </Link>
                            </p>
                            </div>
                            </div>
                            </div>
  )
}