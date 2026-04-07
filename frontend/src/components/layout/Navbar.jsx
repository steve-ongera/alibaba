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
  const [cats,    setCats]   = useState([])
  const [sticky,  setSticky] = useState(false)

  useEffect(() => {
    apiFetch('/categories/').then(setCats).catch(() => {})
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
      <div className="topbar d-none d-md-block">
        <div className="container d-flex justify-content-between align-items-center">
          <span className="topbar-text">
            <i className="bi bi-telephone-fill me-1" /> +254 700 000 000
            &nbsp;|&nbsp;
            <i className="bi bi-envelope-fill me-1" /> support@alibabakenya.co.ke
          </span>
          <span className="topbar-text">
            <i className="bi bi-truck me-1" /> Free delivery on orders over KES 2,000
          </span>
        </div>
      </div>

      {/* Main navbar */}
      <nav className={`navbar-main ${sticky ? 'sticky' : ''}`}>
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
                <i className="bi bi-search" />
              </button>
            </form>

            {/* Actions */}
            <div className="navbar-actions">
              {user ? (
                <div className="nav-action dropdown">
                  <button className="nav-action-btn dropdown-toggle" data-bs-toggle="dropdown">
                    <i className="bi bi-person-circle" />
                    <span className="d-none d-lg-inline ms-1">{user.first_name || 'Account'}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><Link className="dropdown-item" to="/account"><i className="bi bi-person me-2" />My Account</Link></li>
                    <li><Link className="dropdown-item" to="/account/orders"><i className="bi bi-box-seam me-2" />My Orders</Link></li>
                    <li><Link className="dropdown-item" to="/wishlist"><i className="bi bi-heart me-2" />Wishlist</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item text-danger" onClick={logout}><i className="bi bi-box-arrow-right me-2" />Logout</button></li>
                  </ul>
                </div>
              ) : (
                <Link to="/login" className="nav-action-btn">
                  <i className="bi bi-person" />
                  <span className="d-none d-lg-inline ms-1">Login</span>
                </Link>
              )}

              <Link to="/wishlist" className="nav-action-btn">
                <i className="bi bi-heart" />
              </Link>

              <Link to="/cart" className="nav-action-btn cart-btn">
                <i className="bi bi-cart3" />
                {cart.item_count > 0 && (
                  <span className="cart-badge">{cart.item_count}</span>
                )}
                <span className="d-none d-lg-inline ms-1">
                  KES {Number(cart.total || 0).toLocaleString()}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Category bar */}
        <div className="cat-bar">
          <div className="container">
            <ul className="cat-list">
              <li><Link to="/store" className="cat-all"><i className="bi bi-grid me-1" />All Categories</Link></li>
              {cats.slice(0, 8).map(cat => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug}`} className="cat-link">
                    {cat.icon && <i className={`bi bi-${cat.icon} me-1`} />}
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  src/components/layout/Footer.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="footer-brand">
                <span className="logo-ali">alibaba</span><span className="logo-kenya">KENYA</span>
              </div>
              <p className="footer-tagline">Kenya's trusted online marketplace. Millions of products, guaranteed quality.</p>
              <div className="social-links">
                {['facebook', 'twitter-x', 'instagram', 'tiktok', 'youtube'].map(s => (
                  <a key={s} href="#" className="social-link"><i className={`bi bi-${s}`} /></a>
                ))}
              </div>
            </div>

            <div className="col-lg-2 col-md-6">
              <h6 className="footer-heading">Shop</h6>
              <ul className="footer-links">
                {['Electronics','Fashion','Home & Living','Beauty','Sports','Groceries'].map(l => (
                  <li key={l}><a href="#">{l}</a></li>
                ))}
              </ul>
            </div>

            <div className="col-lg-2 col-md-6">
              <h6 className="footer-heading">Help</h6>
              <ul className="footer-links">
                {['FAQs','Track Order','Returns & Refunds','Delivery Info','Contact Us'].map(l => (
                  <li key={l}><a href="#">{l}</a></li>
                ))}
              </ul>
            </div>

            <div className="col-lg-2 col-md-6">
              <h6 className="footer-heading">Account</h6>
              <ul className="footer-links">
                {['Login','Register','My Orders','Wishlist','Seller Portal'].map(l => (
                  <li key={l}><a href="#">{l}</a></li>
                ))}
              </ul>
            </div>

            <div className="col-lg-3 col-md-6">
              <h6 className="footer-heading">Payment Methods</h6>
              <div className="payment-badges">
                <span className="pay-badge"><i className="bi bi-phone" /> M-Pesa</span>
                <span className="pay-badge"><i className="bi bi-credit-card" /> Visa</span>
                <span className="pay-badge"><i className="bi bi-credit-card-2-front" /> Mastercard</span>
              </div>
              <h6 className="footer-heading mt-3">Newsletter</h6>
              <div className="footer-newsletter">
                <input type="email" placeholder="Your email" className="newsletter-input" />
                <button className="newsletter-btn">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container d-flex flex-wrap justify-content-between align-items-center">
          <span>© {new Date().getFullYear()} Alibaba Kenya. All rights reserved.</span>
          <span><a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a></span>
        </div>
      </div>
    </footer>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  src/components/ui/ProductCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function ProductCard({ product }) {
  const { addToCart }  = useCart()
  const navigate       = useNavigate()
  const { addToast }   = useToast ? useToast() : { addToast: () => {} }

  const img    = product.primary_image || '/placeholder.jpg'
  const onSale = product.discount_percent > 0

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product.slug}`)}>
      <div className="product-card-img-wrap">
        <img src={img} alt={product.name} className="product-card-img" loading="lazy" />
        {onSale && <span className="badge-discount">-{product.discount_percent}%</span>}
        {product.is_flash_sale && <span className="badge-flash"><i className="bi bi-lightning-charge-fill" /> Flash</span>}
        <button
          className="btn-wishlist"
          onClick={e => { e.stopPropagation(); /* toggle wishlist */ }}
          title="Add to wishlist"
        >
          <i className="bi bi-heart" />
        </button>
      </div>
      <div className="product-card-body">
        <p className="product-card-category">{product.category_name}</p>
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-rating">
          {[1,2,3,4,5].map(s => (
            <i key={s} className={`bi bi-star${s <= Math.round(product.rating_avg) ? '-fill' : ''}`} />
          ))}
          <span className="rating-count">({product.rating_count})</span>
        </div>
        <div className="product-card-price">
          <span className="price-current">KES {Number(product.price).toLocaleString()}</span>
          {onSale && (
            <span className="price-original">KES {Number(product.original_price).toLocaleString()}</span>
          )}
        </div>
        <button
          className="btn-add-cart"
          onClick={e => { e.stopPropagation(); addToCart(product.id) }}
        >
          <i className="bi bi-cart-plus me-1" /> Add to Cart
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  src/components/ui/Toast.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast-item toast-${t.type}`}>
          <i className={`bi bi-${t.type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'} me-2`} />
          {t.message}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  src/components/ui/Spinner.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="spinner-wrap">
      <div className="spinner-ring" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  src/components/home/HeroBanner.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function HeroBanner({ banners }) {
  return (
    <div id="heroBannerCarousel" className="carousel slide hero-carousel" data-bs-ride="carousel">
      <div className="carousel-indicators">
        {banners.map((_, i) => (
          <button key={i} type="button" data-bs-target="#heroBannerCarousel"
            data-bs-slide-to={i} className={i === 0 ? 'active' : ''} />
        ))}
      </div>
      <div className="carousel-inner">
        {banners.map((b, i) => (
          <div key={b.id} className={`carousel-item ${i === 0 ? 'active' : ''}`}>
            <a href={b.link || '#'}>
              <img src={b.image} className="hero-banner-img" alt={b.title} />
            </a>
            <div className="carousel-caption d-none d-md-block banner-caption">
              <h2>{b.title}</h2>
              <p>{b.subtitle}</p>
              {b.link && <a href={b.link} className="btn btn-hero">Shop Now</a>}
            </div>
          </div>
        ))}
      </div>
      <button className="carousel-control-prev" type="button" data-bs-target="#heroBannerCarousel" data-bs-slide="prev">
        <span className="carousel-control-prev-icon" />
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#heroBannerCarousel" data-bs-slide="next">
        <span className="carousel-control-next-icon" />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  src/components/home/FlashSaleTimer.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function FlashSaleTimer({ endTime }) {
  const [time, setTime] = React.useState({ h: 0, m: 0, s: 0 })

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(endTime) - Date.now())
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endTime])

  const pad = n => String(n).padStart(2, '0')

  return (
    <div className="flash-timer">
      <span className="timer-block">{pad(time.h)}<small>hrs</small></span>
      <span className="timer-sep">:</span>
      <span className="timer-block">{pad(time.m)}<small>min</small></span>
      <span className="timer-sep">:</span>
      <span className="timer-block">{pad(time.s)}<small>sec</small></span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  src/components/ui/SectionHeader.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, link, linkText = 'See All' }) {
  return (
    <div className="section-header">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {link && <Link to={link} className="section-see-all">{linkText} <i className="bi bi-arrow-right" /></Link>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  src/components/ui/Pagination.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function Pagination({ page, total, pageSize = 24, onPageChange }) {
  const pages = Math.ceil(total / pageSize)
  if (pages <= 1) return null
  return (
    <nav className="pagination-wrap">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(page - 1)}>&laquo;</button>
        </li>
        {Array.from({ length: pages }, (_, i) => i + 1)
          .filter(p => Math.abs(p - page) <= 2 || p === 1 || p === pages)
          .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
            acc.push(p)
            return acc
          }, [])
          .map((p, i) =>
            p === '...'
              ? <li key={`e${i}`} className="page-item disabled"><span className="page-link">…</span></li>
              : <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => onPageChange(p)}>{p}</button>
                </li>
          )}
        <li className={`page-item ${page >= pages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(page + 1)}>&raquo;</button>
        </li>
      </ul>
    </nav>
  )
}

// re-export useToast from App
import { useToast } from '../../App.jsx'