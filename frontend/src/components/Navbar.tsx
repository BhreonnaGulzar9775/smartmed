import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    return (
        <nav className= "navbar navbar-expand-lg navbar-dark bg-primary" >
        <div className="container" >
            <Link className="navbar-brand fw-bold" to = "/" >💊 SmartMed </Link>
                < div className = "navbar-nav ms-auto d-flex flex-row gap-3 align-items-center" >
                { user?(<>
                    <Link className="nav-link text-white" to = "/dashboard" > Dashboard </Link>
                        < Link className = "nav-link text-white" to = "/inventory" > Inventory </Link>
                            < Link className = "nav-link text-white" to = "/prescriptions" > Prescriptions </Link>
                                < span className = "text-white-50 small" > { user.fullName }({ user.role }) </span>
                                    < button className = "btn btn-outline-light btn-sm"
    onClick = {() => { logout(); navigate('/login') }
}> Logout </button>
    </>) : (<>
        <Link className= "nav-link text-white" to = "/login" > Login </Link>
            < Link className = "nav-link text-white" to = "/register" > Register </Link>
                </>)}
</div>
    </div>
    </nav>
  )
}