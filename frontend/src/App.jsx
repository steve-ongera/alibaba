import React, { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Pages
import HomePage       from './pages/HomePage.jsx'
import StorePage      from './pages/StorePage.jsx'
import CategoryPage   from './pages/CategoryPage.jsx'
import ProductDetail  from './pages/ProductDetail.jsx'
import CartPage       from './pages/CartPage.jsx'
import CheckoutPage   from './pages/CheckoutPage.jsx'
import AccountPage    from './pages/AccountPage.jsx'
import LoginPage      from './pages/LoginPage.jsx'
import RegisterPage   from './pages/RegisterPage.jsx'
import WishlistPage   from './pages/WishlistPage.jsx'
import OrdersPage     from './pages/OrdersPage.jsx'
import SearchPage     from './pages/SearchPage.jsx'
import NotFoundPage   from './pages/NotFoundPage.jsx'

// Layout - FIXED IMPORTS
import Navbar from './components/layout/Navbar.jsx'
import { Footer } from './components/layout/Footer.jsx'  // Named import, not default
import { Toast } from './components/ui/Toast.jsx'        // Named import, not default

// ─── API base ────────────────────────────────────────────────────────────────
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// ─── Auth Context ────────────────────────────────────────────────────────────
export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

// ─── Cart Context ─────────────────────────────────────────────────────────────
export const CartContext = createContext(null)
export const useCart = () => useContext(CartContext)

// ─── Toast Context ────────────────────────────────────────────────────────────
export const ToastContext = createContext(null)
export const useToast = () => useContext(ToastContext)

// ─── Axios-like fetch wrapper ─────────────────────────────────────────────────
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('access_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw Object.assign(new Error(err.detail || 'Request failed'), { status: res.status, data: err })
  }
  if (res.status === 204) return null
  return res.json()
}

// ─── Protected Route ──────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [cart,    setCart]    = useState({ items: [], total: 0, item_count: 0 })
  const [toasts,  setToasts]  = useState([])

  // Auth helpers
  const login = (userData, tokens) => {
    localStorage.setItem('access_token',  tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }
  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // Toast helpers
  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }

  // Load cart
  useEffect(() => {
    apiFetch('/cart/').then(setCart).catch(() => {})
  }, [user])

  const refreshCart = () => apiFetch('/cart/').then(setCart).catch(() => {})

  const addToCart = async (productId, quantity = 1, variantId = null) => {
    const body = { product_id: productId, quantity }
    if (variantId) body.variant_id = variantId
    const updated = await apiFetch('/cart/', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    setCart(updated)
    addToast('Item added to cart 🛒')
  }

  const removeFromCart = async (itemId) => {
    const updated = await apiFetch('/cart/', {
      method: 'DELETE',
      body: JSON.stringify({ item_id: itemId }),
    })
    setCart(updated)
  }

  const updateCartQty = async (itemId, quantity) => {
    const updated = await apiFetch('/cart/', {
      method: 'PATCH',
      body: JSON.stringify({ item_id: itemId, quantity }),
    })
    setCart(updated)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateCartQty, refreshCart }}>
        <ToastContext.Provider value={{ addToast }}>
          <BrowserRouter>
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/"                element={<HomePage />} />
                <Route path="/store"           element={<StorePage />} />
                <Route path="/category/:slug"  element={<CategoryPage />} />
                <Route path="/product/:slug"   element={<ProductDetail />} />
                <Route path="/cart"            element={<CartPage />} />
                <Route path="/search"          element={<SearchPage />} />
                <Route path="/login"           element={<LoginPage />} />
                <Route path="/register"        element={<RegisterPage />} />
                <Route path="/checkout"        element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="/account"         element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                <Route path="/account/orders"  element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/wishlist"        element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                <Route path="*"               element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
            <Toast toasts={toasts} />
          </BrowserRouter>
        </ToastContext.Provider>
      </CartContext.Provider>
    </AuthContext.Provider>
  )
}