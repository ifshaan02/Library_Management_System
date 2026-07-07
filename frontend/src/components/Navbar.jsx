import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (!isAuthenticated) return null

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark">§</span>
        <span className="brand-name">Athenaeum</span>
      </div>
      <nav className="app-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Dashboard</NavLink>
        <NavLink to="/books" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Catalog</NavLink>
        <NavLink to="/borrowers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Borrowers</NavLink>
        <NavLink to="/loans" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Circulation</NavLink>
      </nav>
      <div className="user-pill">
        <span className="user-name">{user?.username}</span>
        <span className="user-role">{user?.role}</span>
        <button className="btn-ghost" onClick={handleLogout}>Sign out</button>
      </div>
    </header>
  )
}
