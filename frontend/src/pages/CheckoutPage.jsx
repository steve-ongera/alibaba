// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/CheckoutPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, useCart, useToast } from '../App.jsx'
import { Spinner } from '../components/ui/Spinner'

export default function CheckoutPage() {
  const { cart, refreshCart } = useCart()
  const { addToast }          = useToast()
  const navigate              = useNavigate()
  const [addresses,  setAddresses]  = useState([])
  const [counties,   setCounties]   = useState([])
  const [pickups,    setPickups]     = useState([])
  const [step,       setStep]        = useState(1)
  const [loading,    setLoading]     = useState(false)
  const [coupon,     setCoupon]      = useState('')
  const [couponMsg,  setCouponMsg]   = useState(null)
  const [phone,      setPhone]       = useState('')
  const [order,      setOrder]       = useState(null)
  const [form, setForm] = useState({
    address_id: '', pickup_station_id: '', notes: '', coupon_code: ''
  })

  useEffect(() => {
    apiFetch('/addresses/').then(setAddresses).catch(() => {})
    apiFetch('/counties/').then(setCounties).catch(() => {})
    apiFetch('/pickup-stations/').then(setPickups).catch(() => {})
  }, [])

  const validateCoupon = async () => {
    try {
      const res = await apiFetch('/coupons/validate/', {
        method: 'POST',
        body: JSON.stringify({ code: coupon, order_amount: cart.total }),
      })
      setCouponMsg({ 
        valid: true, 
        msg: `✓ ${res.discount_type === 'percent' ? res.discount_value + '% off' : 'KES ' + res.discount_value + ' off'}` 
      })
      setForm(f => ({ ...f, coupon_code: coupon }))
    } catch (e) {
      setCouponMsg({ valid: false, msg: e.data?.detail || 'Invalid coupon' })
    }
  }

  const placeOrder = async () => {
    if (!form.address_id) return addToast('Please select a delivery address.', 'error')
    setLoading(true)
    try {
      const o = await apiFetch('/orders/create/', { method: 'POST', body: JSON.stringify(form) })
      setOrder(o)
      setStep(3)
      refreshCart()
    } catch (e) {
      addToast(e.data?.detail || 'Order failed.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const initiateMpesa = async () => {
    if (!phone) return addToast('Enter M-Pesa phone number.', 'error')
    setLoading(true)
    try {
      await apiFetch('/mpesa/initiate/', {
        method: 'POST',
        body: JSON.stringify({ order_id: order.id, phone_number: phone }),
      })
      addToast('STK Push sent! Check your phone to confirm payment.')
      setStep(4)
    } catch {
      addToast('M-Pesa initiation failed.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="page-title">Checkout</h1>

        {/* Steps indicator */}
        <div className="checkout-steps">
          <div className={`checkout-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
            <div className="step-circle">{step > 1 ? <i className="bi bi-check" /> : 1}</div>
            <span>Address</span>
          </div>
          <div className={`checkout-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>
            <div className="step-circle">{step > 2 ? <i className="bi bi-check" /> : 2}</div>
            <span>Review</span>
          </div>
          <div className={`checkout-step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'done' : ''}`}>
            <div className="step-circle">{step > 3 ? <i className="bi bi-check" /> : 3}</div>
            <span>Payment</span>
          </div>
          <div className={`checkout-step ${step >= 4 ? 'active' : ''} ${step > 4 ? 'done' : ''}`}>
            <div className="step-circle">{step > 4 ? <i className="bi bi-check" /> : 4}</div>
            <span>Done</span>
          </div>
        </div>

        {step === 1 && (
          <div className="checkout-panel">
            <h4>Select Delivery Address</h4>
            <div className="address-list">
              {addresses.map(a => (
                <label key={a.id} className={`address-card ${form.address_id === a.id ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="addr" 
                    value={a.id}
                    onChange={() => setForm(f => ({ ...f, address_id: a.id }))} 
                  />
                  <div>
                    <strong>{a.full_name}</strong> — {a.phone}<br />
                    {a.street}, {a.town}, {a.county_name}
                    {a.is_default && <span className="badge bg-primary ms-2">Default</span>}
                  </div>
                </label>
              ))}
              {addresses.length === 0 && <p>No saved addresses. <a href="/account">Add one</a>.</p>}
            </div>

            <h4 className="mt-4">Pickup Station (optional)</h4>
            <select 
              className="form-select mb-3"
              onChange={e => setForm(f => ({ ...f, pickup_station_id: e.target.value }))}
            >
              <option value="">Home delivery</option>
              {pickups.map(p => (
                <option key={p.id} value={p.id}>{p.name} — KES {p.delivery_fee}</option>
              ))}
            </select>

            <textarea 
              placeholder="Order notes (optional)" 
              className="form-control mb-3" 
              rows={2}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} 
            />

            <div className="coupon-row">
              <input 
                type="text" 
                placeholder="Coupon code" 
                className="coupon-input"
                value={coupon} 
                onChange={e => setCoupon(e.target.value)} 
              />
              <button className="btn-apply-coupon" onClick={validateCoupon}>Apply</button>
              {couponMsg && (
                <span className={`coupon-msg ${couponMsg.valid ? 'valid' : 'invalid'}`}>
                  {couponMsg.msg}
                </span>
              )}
            </div>

            <button 
              className="btn-checkout mt-3" 
              onClick={() => setStep(2)} 
              disabled={!form.address_id}
            >
              Continue to Review
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="checkout-panel">
            <h4>Review Your Order</h4>
            <div className="order-review">
              {cart.items.map(item => (
                <div key={item.id} className="review-item">
                  <img src={item.product_image || '/placeholder.jpg'} alt={item.product_name} />
                  <div>
                    <p>{item.product_name}</p>
                    <span>× {item.quantity}</span>
                  </div>
                  <strong>KES {Number(item.subtotal).toLocaleString()}</strong>
                </div>
              ))}
              <div className="review-total">
                <span>Total</span>
                <strong>KES {Number(cart.total).toLocaleString()}</strong>
              </div>
            </div>
            <div className="d-flex gap-3 mt-3">
              <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-checkout" onClick={placeOrder} disabled={loading}>
                {loading ? 'Placing…' : 'Place Order'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && order && (
          <div className="checkout-panel text-center">
            <i className="bi bi-check-circle-fill checkout-success-icon"></i>
            <h3>Order Placed!</h3>
            <p>Order <strong>#{order.order_number}</strong> created. Pay via M-Pesa below.</p>
            <div className="mpesa-form">
              <input 
                type="tel" 
                placeholder="07XXXXXXXX" 
                className="mpesa-input"
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
              />
              <button className="btn-mpesa" onClick={initiateMpesa} disabled={loading}>
                <i className="bi bi-phone me-2"></i>{loading ? 'Sending…' : 'Pay with M-Pesa'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="checkout-panel text-center">
            <i className="bi bi-phone-fill checkout-success-icon"></i>
            <h3>Payment Request Sent!</h3>
            <p>Check your phone and enter your M-Pesa PIN to complete payment.</p>
            <button className="btn-primary-cta" onClick={() => navigate('/account/orders')}>
              View My Orders
            </button>
          </div>
        )}
      </div>
    </div>
  )
}