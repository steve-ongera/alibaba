// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/OrdersPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { apiFetch } from '../App.jsx'
import { Spinner } from '../components/ui/Spinner'

const STATUS_COLOR = {
  pending: 'warning', 
  paid: 'info', 
  processing: 'info',
  shipped: 'primary', 
  out_for_delivery: 'primary',
  delivered: 'success', 
  cancelled: 'danger', 
  refunded: 'secondary',
}

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/orders/').then(res => setOrders(res.results || res)).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="page-title">My Orders</h1>
        {orders.length === 0
          ? <p className="text-center py-5">No orders yet.</p>
          : orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <strong>#{order.order_number}</strong>
                    <span className="ms-3 text-muted">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`badge bg-${STATUS_COLOR[order.status] || 'secondary'}`}>
                    {order.status_display}
                  </span>
                </div>
                <div className="order-items-list">
                  {order.items?.map(item => (
                    <div key={item.id} className="order-item-row">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span>KES {Number(item.subtotal).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="order-card-footer">
                  <span>Total: <strong>KES {Number(order.total).toLocaleString()}</strong></span>
                  {order.estimated_delivery && (
                    <span className="ms-3">
                      Est. Delivery: {new Date(order.estimated_delivery).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))
        }
      </div>
    </div>
  )
}