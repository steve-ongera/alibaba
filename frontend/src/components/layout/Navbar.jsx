// ─────────────────────────────────────────────────────────────────────────────
//  src/components/layout/Navbar.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, useCart, apiFetch } from '../../App.jsx'

export default function Navbar() {
  const { user, logout }     = useAuth()
  const { cart }             = useCart()
  const navigate             = useNavigate()
  const [query,   setQuery]  = useState('')
  const [cats,    setCats]   = useState([])  // Initialize as empty array
  const [sticky,  setSticky] = useState(false)

  useEffect(() => {
    // Ensure we always set an array
    apiFetch('/categories/')
      .then(data => {
        // Check if data is an array, if not, use empty array
        setCats(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        setCats([])  // Set empty array on error
      })
    
    const onScroll = () => setSticky(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <>
      {/* Top bar */}
      <div className="topbar">
        <div className="container">
          <span className="topbar-text">
            <i className="bi bi-telephone-fill me-1"></i> +254 700 000 000
            &nbsp;|&nbsp;
            <i className="bi bi-envelope-fill me-1"></i> support@alibabakenya.co.ke
          </span>
          <span className="topbar-text">
            <i className="bi bi-truck me-1"></i> Free delivery on orders over KES 2,000
          </span>
        </div>
      </div>

      {/* Main navbar */}
      <nav className={`navbar-main ${sticky ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="navbar-inner">
            {/* Logo */}
            <Link to="/" className="navbar-logo">
              <span className="logo-ali">alibaba</span>
              <span className="logo-kenya">KENYA</span>
            </Link>

            {/* Search */}
            <form className="navbar-search" onSubmit={handleSearch}>
              <input
                type="text"
                className="search-input"
                placeholder="Search for products, brands, categories…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="search-btn">
                <i className="bi bi-search"></i>
              </button>
            </form>

            {/* Actions */}
            <div className="navbar-actions">
              {user ? (
                <div className="nav-action dropdown">
                  <button className="nav-action-btn dropdown-toggle" data-bs-toggle="dropdown">
                    <i className="bi bi-person-circle"></i>
                    <span className="d-none d-lg-inline ms-1">{user.first_name || 'Account'}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><Link className="dropdown-item" to="/account"><i className="bi bi-person me-2"></i>My Account</Link></li>
                    <li><Link className="dropdown-item" to="/account/orders"><i className="bi bi-box-seam me-2"></i>My Orders</Link></li>
                    <li><Link className="dropdown-item" to="/wishlist"><i className="bi bi-heart me-2"></i>Wishlist</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item text-danger" onClick={logout}><i className="bi bi-box-arrow-right me-2"></i>Logout</button></li>
                  </ul>
                </div>
              ) : (
                <Link to="/login" className="nav-action-btn">
                  <i className="bi bi-person"></i>
                  <span className="d-none d-lg-inline ms-1">Login</span>
                </Link>
              )}

              <Link to="/wishlist" className="nav-action-btn">
                <i className="bi bi-heart"></i>
              </Link>

              <Link to="/cart" className="nav-action-btn cart-btn">
                <i className="bi bi-cart3"></i>
                {cart?.item_count > 0 && (
                  <span className="cart-badge">{cart.item_count}</span>
                )}
                <span className="d-none d-lg-inline ms-1">
                  KES {Number(cart?.total || 0).toLocaleString()}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Category bar - only show if cats is an array and has items */}
        {Array.isArray(cats) && cats.length > 0 && (
          <div className="cat-bar">
            <div className="container">
              <ul className="cat-list">
                <li><Link to="/store" className="cat-all"><i className="bi bi-grid me-1"></i>All Categories</Link></li>
                {cats.slice(0, 8).map(cat => (
                  <li key={cat.id}>
                    <Link to={`/category/${cat.slug}`} className="cat-link">
                      {cat.icon && <i className={`bi bi-${cat.icon} me-1`}></i>}
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}