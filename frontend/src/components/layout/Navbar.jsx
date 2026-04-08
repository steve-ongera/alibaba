// ─────────────────────────────────────────────────────────────────────────────
//  src/components/layout/Navbar.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, useCart, apiFetch } from '../../App.jsx'

export default function Navbar() {
  const { user, logout }        = useAuth()
  const { cart }                = useCart()
  const navigate                = useNavigate()
  const [query,   setQuery]     = useState('')
  const [cats,    setCats]      = useState([])
  const [sticky,  setSticky]    = useState(false)
  const [drawerOpen, setDrawer] = useState(false)

  useEffect(() => {
    apiFetch('/categories/')
      .then(data => setCats(Array.isArray(data) ? data : []))
      .catch(() => setCats([]))

    const onScroll = () => setSticky(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
      setQuery('')
    }
  }

  return (
    <>
      {/* ── Top Bar ──────────────────────────────────────────────── */}
      <div className="topbar">
        <div className="container">
          <span className="topbar-text">
            <i className="bi bi-telephone-fill"></i>
            +254 700 000 000 &nbsp;|&nbsp;
            <i className="bi bi-envelope-fill"></i>
            support@alibabakenya.co.ke
          </span>
          <div className="topbar-links">
            <a href="#"><i className="bi bi-truck me-1"></i>Free delivery over KES 2,000</a>
            <a href="#"><i className="bi bi-shield-check me-1"></i>Buyer Protection</a>
            <a href="#"><i className="bi bi-question-circle me-1"></i>Help</a>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ──────────────────────────────────────────── */}
      <nav className={`navbar-main${sticky ? ' scrolled' : ''}`}>
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
                <span className="d-none d-md-inline">Search</span>
              </button>
            </form>

            {/* Action buttons */}
            <div className="navbar-actions">
              {user ? (
                <div className="nav-action dropdown">
                  <button
                    className="nav-action-btn dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle"></i>
                    <span className="d-none d-lg-block">{user.first_name || 'Account'}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link className="dropdown-item" to="/account">
                        <i className="bi bi-person me-2"></i>My Account
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/account/orders">
                        <i className="bi bi-box-seam me-2"></i>My Orders
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/wishlist">
                        <i className="bi bi-heart me-2"></i>Wishlist
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={logout}>
                        <i className="bi bi-box-arrow-right me-2"></i>Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link to="/login" className="nav-action-btn">
                  <i className="bi bi-person"></i>
                  <span className="d-none d-lg-block">Login</span>
                </Link>
              )}

              <Link to="/wishlist" className="nav-action-btn">
                <i className="bi bi-heart"></i>
                <span className="d-none d-lg-block">Wishlist</span>
              </Link>

              <Link to="/cart" className="nav-action-btn cart-btn" style={{ position: 'relative' }}>
                <i className="bi bi-cart3"></i>
                {cart?.item_count > 0 && (
                  <span className="cart-badge">{cart.item_count}</span>
                )}
                <span className="d-none d-lg-block">
                  KES {Number(cart?.total || 0).toLocaleString()}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Category Bar ─────────────────────────────────────── */}
        <div className="cat-bar">
          <div className="container">
            {/* Mobile drawer toggle */}
            <button
              className="cat-drawer-toggle"
              onClick={() => setDrawer(true)}
              aria-label="Open categories"
            >
              <i className="bi bi-grid-fill"></i>
              All Categories
              <i className="bi bi-chevron-right"></i>
            </button>

            {/* Desktop category list */}
            <ul className="cat-list">
              <li>
                <Link to="/store" className="cat-all">
                  <i className="bi bi-grid-fill"></i>All Categories
                </Link>
              </li>
              {cats.slice(0, 8).map(cat => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug}`} className="cat-link">
                    {cat.icon && <i className={`bi bi-${cat.icon}`}></i>}
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* ── Mobile Sidebar Drawer ─────────────────────────────── */}
      <div
        className={`sidebar-drawer-overlay${drawerOpen ? ' open' : ''}`}
        onClick={() => setDrawer(false)}
        aria-hidden="true"
      />

      <aside className={`sidebar-drawer${drawerOpen ? ' open' : ''}`} aria-label="Category navigation">
        <div className="sidebar-drawer-header">
          <h5><i className="bi bi-grid-fill me-2"></i>All Categories</h5>
          <button
            className="btn-close-drawer"
            onClick={() => setDrawer(false)}
            aria-label="Close"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* User section */}
        <div className="drawer-user-section">
          {user ? (
            <p>Hello, <strong>{user.first_name || user.email}</strong> 👋</p>
          ) : (
            <>
              <p>Sign in for a personalised experience</p>
              <Link to="/login" className="btn-drawer-login" onClick={() => setDrawer(false)}>
                Login / Register
              </Link>
            </>
          )}
        </div>

        <nav className="sidebar-drawer-body">
          <Link to="/store" className="drawer-cat-link" onClick={() => setDrawer(false)}>
            <i className="bi bi-grid"></i>All Products
          </Link>
          {cats.map(cat => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="drawer-cat-link"
              onClick={() => setDrawer(false)}
            >
              <i className={`bi bi-${cat.icon || 'tag'}`}></i>
              {cat.name}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}