// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/RegisterPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch, useAuth, useToast } from '../App.jsx'

export default function RegisterPage() {
  const { login }    = useAuth()
  const { addToast } = useToast()
  const navigate     = useNavigate()
  const [form, setForm] = useState({ 
    username: '', email: '', first_name: '', last_name: '', phone: '', password: '', password2: '' 
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) { 
      setError('Passwords do not match.') 
      return 
    }
    setLoading(true)
    setError('')
    try {
      const res = await apiFetch('/auth/register/', { method: 'POST', body: JSON.stringify(form) })
      login(res.user, { access: res.access, refresh: res.refresh })
      addToast('Account created! Welcome!')
      navigate('/')
    } catch (e) {
      const msgs = e.data ? Object.values(e.data).flat().join(' ') : 'Registration failed.'
      setError(msgs)
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-logo">
          <span className="logo-ali">alibaba</span>
          <span className="logo-kenya">KENYA</span>
        </div>
        <h2 className="auth-title">Create Account</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">First Name</label>
              <input 
                className="form-control" 
                required 
                value={form.first_name}
                onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Last Name</label>
              <input 
                className="form-control" 
                required 
                value={form.last_name}
                onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Username</label>
              <input 
                className="form-control" 
                required 
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))} 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-control" 
                required 
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Phone (M-Pesa)</label>
              <input 
                className="form-control" 
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-control" 
                required 
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Confirm Password</label>
              <input 
                type="password" 
                className="form-control" 
                required 
                value={form.password2}
                onChange={e => setForm(f => ({ ...f, password2: e.target.value }))} 
              />
            </div>
          </div>
          <button type="submit" className="btn-auth mt-3" disabled={loading}>
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}