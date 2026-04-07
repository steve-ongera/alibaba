// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/CartPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../App.jsx'

export default function CartPage() {
  const { cart, removeFromCart, updateCartQty } = useCart()
  const navigate = useNavigate()

  if (cart.items.length === 0) {
    return (
      <div className="empty-cart">
        <i className="bi bi-cart-x empty-cart-icon"></i>
        <h2>Your cart is empty</h2>
        <p>Add some items and they'll appear here.</p>
        <Link to="/store" className="btn-primary-cta">Continue Shopping</Link>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">Shopping Cart <span>({cart.item_count} items)</span></h1>
        <div className="cart-layout">
          <div className="cart-items">
            {cart.items.map(item => (
              <div key={item.id} className="cart-item">
                <img 
                  src={item.product_image || '/placeholder.jpg'} 
                  alt={item.product_name} 
                  className="cart-item-img" 
                />
                <div className="cart-item-info">
                  <h4 className="cart-item-name">{item.product_name}</h4>
                  <p className="cart-item-price">KES {Number(item.product_price).toLocaleString()}</p>
                  <div className="cart-item-qty">
                    <button onClick={() => updateCartQty(item.id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateCartQty(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <div className="cart-item-right">
                  <p className="cart-item-subtotal">KES {Number(item.subtotal).toLocaleString()}</p>
                  <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>
                    <i className="bi bi-trash3"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>KES {Number(cart.total).toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span className="text-success">Calculated at checkout</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>KES {Number(cart.total).toLocaleString()}</span>
            </div>
            <button className="btn-checkout" onClick={() => navigate('/checkout')}>
              Proceed to Checkout <i className="bi bi-arrow-right ms-1"></i>
            </button>
            <Link to="/store" className="btn-continue-shopping">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  )
}