// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/HomePage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../App.jsx'
import { ProductCard } from '../components/index.jsx'
import { HeroBanner, FlashSaleTimer, SectionHeader } from '../components/index.jsx'
import { Spinner } from '../components/index.jsx'

export default function HomePage() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/home/').then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div className="home-page">
      {/* Hero carousel */}
      {data?.banners?.length > 0 && <HeroBanner banners={data.banners} />}

      {/* Category chips */}
      <section className="section categories-section">
        <div className="container">
          <SectionHeader title="Shop by Category" link="/store" />
          <div className="category-chips">
            {data?.categories?.map(cat => (
              <Link key={cat.id} to={`/category/${cat.slug}`} className="category-chip">
                {cat.icon && <i className={`bi bi-${cat.icon}`} />}
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale */}
      {data?.flash_sale?.length > 0 && (
        <section className="section flash-section">
          <div className="container">
            <div className="flash-header">
              <div className="d-flex align-items-center gap-3">
                <i className="bi bi-lightning-charge-fill flash-icon" />
                <SectionHeader title="Flash Sale" subtitle="Deals ending soon!" />
              </div>
              <FlashSaleTimer endTime={data.flash_sale[0]?.flash_sale_end} />
            </div>
            <div className="products-grid">
              {data.flash_sale.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      {data?.featured?.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeader title="Featured Products" link="/store?featured=true" />
            <div className="products-grid">
              {data.featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Promo strip */}
      <section className="promo-strip">
        <div className="container">
          <div className="row g-3">
            {[
              { icon: 'truck', title: 'Free Delivery', sub: 'Orders over KES 2,000' },
              { icon: 'shield-check', title: 'Secure Payment', sub: 'M-Pesa & Card' },
              { icon: 'arrow-counterclockwise', title: 'Easy Returns', sub: '14-day return policy' },
              { icon: 'headset', title: '24/7 Support', sub: 'Always here for you' },
            ].map(p => (
              <div key={p.icon} className="col-6 col-md-3">
                <div className="promo-card">
                  <i className={`bi bi-${p.icon} promo-icon`} />
                  <strong>{p.title}</strong>
                  <span>{p.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {data?.new_arrivals?.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeader title="New Arrivals" link="/store?ordering=-created_at" />
            <div className="products-grid">
              {data.new_arrivals.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/StorePage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiFetch } from '../App.jsx'
import { ProductCard, Pagination, Spinner } from '../components/index.jsx'

export default function StorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [count,    setCount]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [brands,   setBrands]   = useState([])
  const [cats,     setCats]     = useState([])

  const page     = Number(searchParams.get('page')     || 1)
  const ordering = searchParams.get('ordering')        || '-created_at'
  const minPrice = searchParams.get('min_price')       || ''
  const maxPrice = searchParams.get('max_price')       || ''
  const brand    = searchParams.get('brand__slug')     || ''
  const category = searchParams.get('category__slug')  || ''

  useEffect(() => {
    apiFetch('/brands/').then(setBrands).catch(() => {})
    apiFetch('/categories/').then(setCats).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const qs = new URLSearchParams({ page, ordering })
    if (minPrice) qs.set('min_price', minPrice)
    if (maxPrice) qs.set('max_price', maxPrice)
    if (brand)    qs.set('brand__slug', brand)
    if (category) qs.set('category__slug', category)
    apiFetch(`/products/?${qs}`).then(res => {
      setProducts(res.results || res)
      setCount(res.count || (res.results || res).length)
    }).finally(() => setLoading(false))
  }, [searchParams])

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val); else p.delete(key)
    p.set('page', '1')
    setSearchParams(p)
  }

  return (
    <div className="store-page">
      <div className="container">
        <div className="store-layout">
          {/* Sidebar */}
          <aside className="store-sidebar">
            <div className="sidebar-section">
              <h5 className="sidebar-heading">Categories</h5>
              {cats.map(c => (
                <div key={c.id} className="sidebar-check">
                  <input type="radio" name="cat" id={`cat-${c.slug}`}
                    checked={category === c.slug}
                    onChange={() => setParam('category__slug', c.slug)} />
                  <label htmlFor={`cat-${c.slug}`}>{c.name}</label>
                </div>
              ))}
              {category && <button className="btn-clear-filter" onClick={() => setParam('category__slug', '')}>Clear</button>}
            </div>

            <div className="sidebar-section">
              <h5 className="sidebar-heading">Brands</h5>
              {brands.map(b => (
                <div key={b.id} className="sidebar-check">
                  <input type="radio" name="brand" id={`br-${b.slug}`}
                    checked={brand === b.slug}
                    onChange={() => setParam('brand__slug', b.slug)} />
                  <label htmlFor={`br-${b.slug}`}>{b.name}</label>
                </div>
              ))}
            </div>

            <div className="sidebar-section">
              <h5 className="sidebar-heading">Price Range (KES)</h5>
              <div className="price-range-inputs">
                <input type="number" placeholder="Min" value={minPrice}
                  onChange={e => setParam('min_price', e.target.value)} className="price-input" />
                <span>–</span>
                <input type="number" placeholder="Max" value={maxPrice}
                  onChange={e => setParam('max_price', e.target.value)} className="price-input" />
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="store-main">
            <div className="store-toolbar">
              <p className="store-count">{count} products found</p>
              <div className="store-sort">
                <label>Sort: </label>
                <select value={ordering} onChange={e => setParam('ordering', e.target.value)} className="sort-select">
                  <option value="-created_at">Newest First</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="-rating_avg">Best Rated</option>
                  <option value="-sold_count">Best Selling</option>
                </select>
              </div>
            </div>

            {loading ? <Spinner /> : (
              <>
                <div className="products-grid">
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                  {products.length === 0 && <p className="no-products">No products found.</p>}
                </div>
                <Pagination page={page} total={count} onPageChange={p => setParam('page', p)} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/CategoryPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { apiFetch } from '../App.jsx'
import { ProductCard, Pagination, Spinner } from '../components/index.jsx'

export default function CategoryPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [count,    setCount]    = useState(0)
  const [category, setCategory] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const page     = Number(searchParams.get('page') || 1)
  const ordering = searchParams.get('ordering') || '-created_at'

  useEffect(() => {
    apiFetch('/categories/').then(cats => {
      setCategory(cats.find(c => c.slug === slug) || null)
    }).catch(() => {})
  }, [slug])

  useEffect(() => {
    setLoading(true)
    const qs = new URLSearchParams({ 'category__slug': slug, page, ordering })
    apiFetch(`/products/?${qs}`).then(res => {
      setProducts(res.results || res)
      setCount(res.count || (res.results || res).length)
    }).finally(() => setLoading(false))
  }, [slug, page, ordering])

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    p.set(key, val); p.set('page', '1')
    setSearchParams(p)
  }

  return (
    <div className="category-page">
      <div className="category-hero">
        <div className="container">
          <h1 className="category-title">{category?.name || 'Category'}</h1>
          {category?.description && <p className="category-desc">{category.description}</p>}
        </div>
      </div>
      <div className="container">
        <div className="store-toolbar">
          <p className="store-count">{count} products</p>
          <select value={ordering} onChange={e => setParam('ordering', e.target.value)} className="sort-select">
            <option value="-created_at">Newest</option>
            <option value="price">Price ↑</option>
            <option value="-price">Price ↓</option>
            <option value="-rating_avg">Best Rated</option>
          </select>
        </div>
        {loading ? <Spinner /> : (
          <>
            <div className="products-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            <Pagination page={page} total={count} onPageChange={p => setParam('page', p)} />
          </>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/ProductDetail.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiFetch, useCart, useToast } from '../App.jsx'
import { Spinner } from '../components/index.jsx'

export default function ProductDetail() {
  const { slug }          = useParams()
  const { addToCart }     = useCart()
  const { addToast }      = useToast()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mainImg, setMainImg] = useState(null)
  const [qty,     setQty]     = useState(1)
  const [selVariant, setSelVariant] = useState(null)

  useEffect(() => {
    apiFetch(`/products/${slug}/`).then(p => {
      setProduct(p)
      const primary = p.images?.find(i => i.is_primary) || p.images?.[0]
      setMainImg(primary?.image || null)
    }).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <Spinner />
  if (!product) return <div className="container py-5">Product not found.</div>

  const handleAddToCart = () => {
    addToCart(product.id, qty, selVariant)
    addToast(`${product.name} added to cart!`)
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="pd-layout">
          {/* Gallery */}
          <div className="pd-gallery">
            <div className="pd-main-img-wrap">
              <img src={mainImg || '/placeholder.jpg'} alt={product.name} className="pd-main-img" />
              {product.discount_percent > 0 && (
                <span className="badge-discount lg">-{product.discount_percent}%</span>
              )}
            </div>
            <div className="pd-thumbs">
              {product.images?.map(img => (
                <img key={img.id} src={img.image} alt={img.alt_text}
                  className={`pd-thumb ${mainImg === img.image ? 'active' : ''}`}
                  onClick={() => setMainImg(img.image)} />
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="pd-info">
            <p className="pd-brand">{product.brand?.name}</p>
            <h1 className="pd-name">{product.name}</h1>
            <div className="pd-rating">
              {[1,2,3,4,5].map(s => (
                <i key={s} className={`bi bi-star${s <= Math.round(product.rating_avg) ? '-fill' : ''}`} />
              ))}
              <span className="ms-2">{product.rating_avg} ({product.rating_count} reviews)</span>
            </div>

            <div className="pd-price-block">
              <span className="pd-price">KES {Number(product.price).toLocaleString()}</span>
              {product.original_price && (
                <span className="pd-original">KES {Number(product.original_price).toLocaleString()}</span>
              )}
              {product.discount_percent > 0 && (
                <span className="pd-save">Save {product.discount_percent}%</span>
              )}
            </div>

            <p className={`pd-stock ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
              <i className={`bi bi-${product.stock > 0 ? 'check-circle-fill' : 'x-circle-fill'} me-1`} />
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </p>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className="pd-variants">
                <p className="pd-label">Options:</p>
                <div className="variant-chips">
                  {product.variants.map(v => (
                    <button key={v.id}
                      className={`variant-chip ${selVariant === v.id ? 'active' : ''}`}
                      onClick={() => setSelVariant(v.id)}>
                      {v.name}: {v.value}
                      {v.price_adjustment !== 0 && ` (+KES ${v.price_adjustment})`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Cart */}
            <div className="pd-actions">
              <div className="qty-selector">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <button className="btn-pd-cart" onClick={handleAddToCart} disabled={product.stock === 0}>
                <i className="bi bi-cart-plus me-2" /> Add to Cart
              </button>
              <button className="btn-pd-wishlist" title="Add to Wishlist">
                <i className="bi bi-heart" />
              </button>
            </div>

            {/* Description */}
            <div className="pd-description">
              <h5>Description</h5>
              <p>{product.description}</p>
            </div>

            {/* Sold by */}
            <p className="pd-seller">Sold by: <strong>{product.seller_name}</strong></p>
          </div>
        </div>

        {/* Reviews */}
        <div className="pd-reviews-section">
          <h3 className="pd-reviews-title">Customer Reviews ({product.reviews?.length || 0})</h3>
          {product.reviews?.length === 0 && <p>No reviews yet. Be the first!</p>}
          <div className="reviews-list">
            {product.reviews?.map(r => (
              <div key={r.id} className="review-card">
                <div className="review-header">
                  <strong>{r.user_name}</strong>
                  <div className="review-stars">
                    {[1,2,3,4,5].map(s => (
                      <i key={s} className={`bi bi-star${s <= r.rating ? '-fill' : ''}`} />
                    ))}
                  </div>
                </div>
                {r.title && <p className="review-title">{r.title}</p>}
                <p className="review-body">{r.body}</p>
                {r.is_verified_purchase && (
                  <span className="review-verified"><i className="bi bi-patch-check-fill me-1" />Verified Purchase</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

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
        <i className="bi bi-cart-x empty-cart-icon" />
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
                <img src={item.product_image || '/placeholder.jpg'} alt={item.product_name} className="cart-item-img" />
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
                    <i className="bi bi-trash3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row"><span>Subtotal</span><span>KES {Number(cart.total).toLocaleString()}</span></div>
            <div className="summary-row"><span>Delivery</span><span className="text-success">Calculated at checkout</span></div>
            <div className="summary-row total"><span>Total</span><span>KES {Number(cart.total).toLocaleString()}</span></div>
            <button className="btn-checkout" onClick={() => navigate('/checkout')}>
              Proceed to Checkout <i className="bi bi-arrow-right ms-1" />
            </button>
            <Link to="/store" className="btn-continue-shopping">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/CheckoutPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, useCart, useToast } from '../App.jsx'
import { Spinner } from '../components/index.jsx'

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
      setCouponMsg({ valid: true, msg: `✓ ${res.discount_type === 'percent' ? res.discount_value + '% off' : 'KES ' + res.discount_value + ' off'}` })
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
          {['Address', 'Review', 'Payment', 'Done'].map((s, i) => (
            <div key={s} className={`checkout-step ${step >= i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}>
              <div className="step-circle">{step > i + 1 ? <i className="bi bi-check" /> : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="checkout-panel">
            <h4>Select Delivery Address</h4>
            <div className="address-list">
              {addresses.map(a => (
                <label key={a.id} className={`address-card ${form.address_id === a.id ? 'selected' : ''}`}>
                  <input type="radio" name="addr" value={a.id}
                    onChange={() => setForm(f => ({ ...f, address_id: a.id }))} />
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
            <select className="form-select mb-3"
              onChange={e => setForm(f => ({ ...f, pickup_station_id: e.target.value }))}>
              <option value="">Home delivery</option>
              {pickups.map(p => (
                <option key={p.id} value={p.id}>{p.name} — KES {p.delivery_fee}</option>
              ))}
            </select>

            <textarea placeholder="Order notes (optional)" className="form-control mb-3" rows={2}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />

            <div className="coupon-row">
              <input type="text" placeholder="Coupon code" className="coupon-input"
                value={coupon} onChange={e => setCoupon(e.target.value)} />
              <button className="btn-apply-coupon" onClick={validateCoupon}>Apply</button>
              {couponMsg && <span className={`coupon-msg ${couponMsg.valid ? 'valid' : 'invalid'}`}>{couponMsg.msg}</span>}
            </div>

            <button className="btn-checkout mt-3" onClick={() => setStep(2)} disabled={!form.address_id}>
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
            <i className="bi bi-check-circle-fill checkout-success-icon" />
            <h3>Order Placed!</h3>
            <p>Order <strong>#{order.order_number}</strong> created. Pay via M-Pesa below.</p>
            <div className="mpesa-form">
              <input type="tel" placeholder="07XXXXXXXX" className="mpesa-input"
                value={phone} onChange={e => setPhone(e.target.value)} />
              <button className="btn-mpesa" onClick={initiateMpesa} disabled={loading}>
                <i className="bi bi-phone me-2" />{loading ? 'Sending…' : 'Pay with M-Pesa'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="checkout-panel text-center">
            <i className="bi bi-phone-fill checkout-success-icon" />
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
    } catch { addToast('Update failed.', 'error') }
    finally { setSaving(false) }
  }

  const addAddress = async () => {
    try {
      const a = await apiFetch('/addresses/', { method: 'POST', body: JSON.stringify(newAddr) })
      setAddresses(prev => [...prev, a])
      addToast('Address added!')
    } catch { addToast('Failed to add address.', 'error') }
  }

  return (
    <div className="account-page">
      <div className="container">
        <h1 className="page-title">My Account</h1>
        <div className="account-layout">
          {/* Sidebar nav */}
          <aside className="account-nav">
            <a href="/account"        className="account-nav-link active"><i className="bi bi-person me-2" />Profile</a>
            <a href="/account/orders" className="account-nav-link"><i className="bi bi-box-seam me-2" />Orders</a>
            <a href="/wishlist"       className="account-nav-link"><i className="bi bi-heart me-2" />Wishlist</a>
          </aside>

          {/* Content */}
          <div className="account-content">
            <div className="account-section">
              <h4>Personal Information</h4>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">First Name</label>
                  <input className="form-control" value={form.first_name}
                    onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Last Name</label>
                  <input className="form-control" value={form.last_name}
                    onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input className="form-control" value={user?.email} disabled />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone</label>
                  <input className="form-control" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
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
                  <i className="bi bi-geo-alt-fill me-2" />
                  <span><strong>{a.full_name}</strong> — {a.town}, {a.county_name} — {a.phone}</span>
                  {a.is_default && <span className="badge bg-primary ms-2">Default</span>}
                </div>
              ))}

              <div className="add-address-form mt-3">
                <h6>Add New Address</h6>
                <div className="row g-2">
                  <div className="col-md-6"><input className="form-control" placeholder="Full Name" onChange={e => setNewAddr(a => ({ ...a, full_name: e.target.value }))} /></div>
                  <div className="col-md-6"><input className="form-control" placeholder="Phone" onChange={e => setNewAddr(a => ({ ...a, phone: e.target.value }))} /></div>
                  <div className="col-md-6"><input className="form-control" placeholder="Town" onChange={e => setNewAddr(a => ({ ...a, town: e.target.value }))} /></div>
                  <div className="col-md-6"><input className="form-control" placeholder="Street" onChange={e => setNewAddr(a => ({ ...a, street: e.target.value }))} /></div>
                  <div className="col-md-6">
                    <select className="form-select" onChange={e => setNewAddr(a => ({ ...a, county: e.target.value }))}>
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
    setLoading(true); setError('')
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
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-ali">alibaba</span><span className="logo-kenya">KENYA</span>
        </div>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-sub">Login to your account</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username or Email</label>
            <input type="text" className="form-control" required
              value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" required
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p className="auth-switch">Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  )
}

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
  const [form, setForm] = useState({ username: '', email: '', first_name: '', last_name: '', phone: '', password: '', password2: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) { setError('Passwords do not match.'); return }
    setLoading(true); setError('')
    try {
      const res = await apiFetch('/auth/register/', { method: 'POST', body: JSON.stringify(form) })
      login(res.user, { access: res.access, refresh: res.refresh })
      addToast('Account created! Welcome!')
      navigate('/')
    } catch (e) {
      const msgs = e.data ? Object.values(e.data).flat().join(' ') : 'Registration failed.'
      setError(msgs)
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-logo">
          <span className="logo-ali">alibaba</span><span className="logo-kenya">KENYA</span>
        </div>
        <h2 className="auth-title">Create Account</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">First Name</label>
              <input className="form-control" required value={form.first_name}
                onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Last Name</label>
              <input className="form-control" required value={form.last_name}
                onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Username</label>
              <input className="form-control" required value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Phone (M-Pesa)</label>
              <input className="form-control" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-control" required value={form.password2}
                onChange={e => setForm(f => ({ ...f, password2: e.target.value }))} />
            </div>
          </div>
          <button type="submit" className="btn-auth mt-3" disabled={loading}>
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/WishlistPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { apiFetch, useToast } from '../App.jsx'
import { ProductCard, Spinner } from '../components/index.jsx'

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading]   = useState(true)
  const { addToast }            = useToast()

  useEffect(() => {
    apiFetch('/wishlist/').then(setWishlist).finally(() => setLoading(false))
  }, [])

  const removeItem = async (id) => {
    await apiFetch(`/wishlist/${id}/`, { method: 'DELETE' })
    setWishlist(prev => prev.filter(i => i.id !== id))
    addToast('Removed from wishlist')
  }

  if (loading) return <Spinner />

  return (
    <div className="wishlist-page">
      <div className="container">
        <h1 className="page-title">My Wishlist ({wishlist.length})</h1>
        {wishlist.length === 0
          ? <p className="text-center py-5">Your wishlist is empty.</p>
          : <div className="products-grid">
              {wishlist.map(w => <ProductCard key={w.id} product={w.product} />)}
            </div>
        }
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/OrdersPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { apiFetch } from '../App.jsx'
import { Spinner } from '../components/index.jsx'

const STATUS_COLOR = {
  pending: 'warning', paid: 'info', processing: 'info',
  shipped: 'primary', out_for_delivery: 'primary',
  delivered: 'success', cancelled: 'danger', refunded: 'secondary',
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
                  <span className="ms-3 text-muted">{new Date(order.created_at).toLocaleDateString()}</span>
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
                  <span className="ms-3">Est. Delivery: {new Date(order.estimated_delivery).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/SearchPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiFetch } from '../App.jsx'
import { ProductCard, Pagination, Spinner } from '../components/index.jsx'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query    = searchParams.get('q') || ''
  const page     = Number(searchParams.get('page') || 1)
  const [results, setResults]  = useState([])
  const [count,   setCount]    = useState(0)
  const [loading, setLoading]  = useState(false)

  useEffect(() => {
    if (!query) return
    setLoading(true)
    apiFetch(`/products/?search=${encodeURIComponent(query)}&page=${page}`).then(res => {
      setResults(res.results || res)
      setCount(res.count || (res.results || res).length)
    }).finally(() => setLoading(false))
  }, [query, page])

  const setPage = (p) => {
    const sp = new URLSearchParams(searchParams)
    sp.set('page', p)
    setSearchParams(sp)
  }

  return (
    <div className="search-page">
      <div className="container">
        <h1 className="page-title">Results for "<em>{query}</em>" <span>({count} found)</span></h1>
        {loading ? <Spinner /> : (
          <>
            <div className="products-grid">
              {results.map(p => <ProductCard key={p.id} product={p} />)}
              {results.length === 0 && <p className="no-products">No products match your search.</p>}
            </div>
            <Pagination page={page} total={count} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/NotFoundPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="notfound-page">
      <h1 className="notfound-code">404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary-cta">Go Home</Link>
    </div>
  )
}