// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/AccountPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { apiFetch, useAuth, useToast } from '../App.jsx'

export default function AccountPage() {
  const { user, login } = useAuth()
  const { addToast }    = useToast()
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [newAddr, setNewAddr]     = useState({ full_name: '', phone: '', town: '', street: '', county: '' })
  const [counties, setCounties]   = useState([])

  useEffect(() => {
    if (user) setForm({ first_name: user.first_name, last_name: user.last_name, phone: user.phone || '' })
    apiFetch('/addresses/').then(setAddresses).catch(() => {})
    apiFetch('/counties/').then(setCounties).catch(() => {})
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    try {
      const updated = await apiFetch('/auth/profile/', { method: 'PATCH', body: JSON.stringify(form) })
      addToast('Profile updated!')
      login(updated, {
        access: localStorage.getItem('access_token'),
        refresh: localStorage.getItem('refresh_token'),
      })
    } catch { 
      addToast('Update failed.', 'error') 
    } finally { 
      setSaving(false) 
    }
  }

  const addAddress = async () => {
    try {
      const a = await apiFetch('/addresses/', { method: 'POST', body: JSON.stringify(newAddr) })
      setAddresses(prev => [...prev, a])
      addToast('Address added!')
      setNewAddr({ full_name: '', phone: '', town: '', street: '', county: '' })
    } catch { 
      addToast('Failed to add address.', 'error') 
    }
  }

  return (
    <div className="account-page">
      <div className="container">
        <h1 className="page-title">My Account</h1>
        <div className="account-layout">
          {/* Sidebar nav */}
          <aside className="account-nav">
            <a href="/account" className="account-nav-link active">
              <i className="bi bi-person me-2"></i>Profile
            </a>
            <a href="/account/orders" className="account-nav-link">
              <i className="bi bi-box-seam me-2"></i>Orders
            </a>
            <a href="/wishlist" className="account-nav-link">
              <i className="bi bi-heart me-2"></i>Wishlist
            </a>
          </aside>

          {/* Content */}
          <div className="account-content">
            <div className="account-section">
              <h4>Personal Information</h4>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">First Name</label>
                  <input 
                    className="form-control" 
                    value={form.first_name}
                    onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} 
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Last Name</label>
                  <input 
                    className="form-control" 
                    value={form.last_name}
                    onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} 
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input className="form-control" value={user?.email} disabled />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone</label>
                  <input 
                    className="form-control" 
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} 
                  />
                </div>
              </div>
              <button className="btn-save mt-3" onClick={saveProfile} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>

            <div className="account-section">
              <h4>Saved Addresses</h4>
              {addresses.map(a => (
                <div key={a.id} className="saved-address">
                  <i className="bi bi-geo-alt-fill me-2"></i>
                  <span>
                    <strong>{a.full_name}</strong> — {a.town}, {a.county_name} — {a.phone}
                  </span>
                  {a.is_default && <span className="badge bg-primary ms-2">Default</span>}
                </div>
              ))}

              <div className="add-address-form mt-3">
                <h6>Add New Address</h6>
                <div className="row g-2">
                  <div className="col-md-6">
                    <input 
                      className="form-control" 
                      placeholder="Full Name" 
                      value={newAddr.full_name}
                      onChange={e => setNewAddr(a => ({ ...a, full_name: e.target.value }))} 
                    />
                  </div>
                  <div className="col-md-6">
                    <input 
                      className="form-control" 
                      placeholder="Phone" 
                      value={newAddr.phone}
                      onChange={e => setNewAddr(a => ({ ...a, phone: e.target.value }))} 
                    />
                  </div>
                  <div className="col-md-6">
                    <input 
                      className="form-control" 
                      placeholder="Town" 
                      value={newAddr.town}
                      onChange={e => setNewAddr(a => ({ ...a, town: e.target.value }))} 
                    />
                  </div>
                  <div className="col-md-6">
                    <input 
                      className="form-control" 
                      placeholder="Street" 
                      value={newAddr.street}
                      onChange={e => setNewAddr(a => ({ ...a, street: e.target.value }))} 
                    />
                  </div>
                  <div className="col-md-6">
                    <select 
                      className="form-select" 
                      value={newAddr.county}
                      onChange={e => setNewAddr(a => ({ ...a, county: e.target.value }))}
                    >
                      <option value="">Select County</option>
                      {counties.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <button className="btn-save mt-2" onClick={addAddress}>Add Address</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}