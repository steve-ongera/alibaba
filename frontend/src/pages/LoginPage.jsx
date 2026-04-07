// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/LoginPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch, useAuth, useToast } from '../App.jsx'

export default function LoginPage() {
  const { login }    = useAuth()
  const { addToast } = useToast()
  const navigate     = useNavigate()
  const [form, setForm]   = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await apiFetch('/auth/login/', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      const profile = await apiFetch('/auth/profile/', {
        headers: { Authorization: `Bearer ${res.access}` }
      })
      login(profile, res)
      addToast('Welcome back!')
      navigate('/')
    } catch (e) {
      setError(e.data?.detail || 'Login failed. Check credentials.')
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-ali">alibaba</span>
          <span className="logo-kenya">KENYA</span>
        </div>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-sub">Login to your account</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username or Email</label>
            <input 
              type="text" 
              className="form-control" 
              required
              value={form.username} 
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))} 
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              required
              value={form.password} 
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
            />
          </div>
          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}