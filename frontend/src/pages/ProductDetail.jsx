// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/ProductDetail.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiFetch, useCart, useToast } from '../App.jsx'
import { Spinner } from '../components/ui/Spinner'

export default function ProductDetail() {
  const { slug }              = useParams()
  const { addToCart }         = useCart()
  const { addToast }          = useToast()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mainImg, setMainImg] = useState(null)
  const [qty,     setQty]     = useState(1)
  const [selVariant, setSelVariant] = useState(null)
  const [wishlisted, setWishlisted] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    apiFetch(`/products/${slug}/`)
      .then(p => {
        setProduct(p)
        const primary = p.images?.find(i => i.is_primary) || p.images?.[0]
        setMainImg(primary?.image || null)
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <Spinner />
  if (!product) return (
    <div className="container py-5 text-center">
      <i className="bi bi-exclamation-circle" style={{ fontSize: '3rem', color: 'var(--clr-text-light)' }}></i>
      <h2 className="mt-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-secondary)' }}>
        Product not found
      </h2>
      <Link to="/store" className="btn-primary-cta mt-3 d-inline-flex">
        <i className="bi bi-arrow-left me-2"></i> Back to Store
      </Link>
    </div>
  )

  const handleAddToCart = () => {
    addToCart(product.id, qty, selVariant)
    addToast?.(`${product.name} added to cart!`)
  }

  const handleWishlist = () => {
    setWishlisted(prev => !prev)
    addToast?.(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️')
  }

  const inStock = product.stock > 0

  return (
    <div className="product-detail-page">
      <div className="container">

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" style={{ padding: '12px 0 4px' }}>
          <ol className="breadcrumb" style={{ fontSize: '.8rem', marginBottom: 0 }}>
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            {product.category_name && (
              <li className="breadcrumb-item">
                <Link to={`/category/${product.category_slug}`}>{product.category_name}</Link>
              </li>
            )}
            <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        {/* ── Main layout ──────────────────────────────────────── */}
        <div className="pd-layout">

          {/* Gallery */}
          <div className="pd-gallery">
            <div className="pd-main-img-wrap">
              <img
                src={mainImg || '/placeholder.jpg'}
                alt={product.name}
                className="pd-main-img"
              />
              {product.discount_percent > 0 && (
                <span className="badge-discount lg">-{product.discount_percent}%</span>
              )}
              {product.is_flash_sale && (
                <span className="badge-flash">
                  <i className="bi bi-lightning-charge-fill"></i> Flash Sale
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="pd-thumbs">
                {product.images.map(img => (
                  <img
                    key={img.id}
                    src={img.image}
                    alt={img.alt_text || product.name}
                    className={`pd-thumb${mainImg === img.image ? ' active' : ''}`}
                    onClick={() => setMainImg(img.image)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pd-info">
            {product.brand?.name && (
              <p className="pd-brand">{product.brand.name}</p>
            )}
            <h1 className="pd-name">{product.name}</h1>

            {/* Rating */}
            <div className="pd-rating">
              {[1, 2, 3, 4, 5].map(s => (
                <i
                  key={s}
                  className={`bi bi-star${s <= Math.round(product.rating_avg ?? 0) ? '-fill' : ''}`}
                />
              ))}
              <span className="ms-2">
                {product.rating_avg ?? '0.0'} ({product.rating_count ?? 0} reviews)
              </span>
            </div>

            {/* Price block */}
            <div className="pd-price-block">
              <span className="pd-price">KES {Number(product.price).toLocaleString()}</span>
              {product.original_price && product.discount_percent > 0 && (
                <span className="pd-original">
                  KES {Number(product.original_price).toLocaleString()}
                </span>
              )}
              {product.discount_percent > 0 && (
                <span className="pd-save">Save {product.discount_percent}%</span>
              )}
            </div>

            {/* Stock status */}
            <p className={`pd-stock ${inStock ? 'in-stock' : 'out-stock'}`}>
              <i className={`bi bi-${inStock ? 'check-circle-fill' : 'x-circle-fill'} me-1`} />
              {inStock
                ? `In Stock (${product.stock} available)`
                : 'Out of Stock'}
            </p>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className="pd-variants">
                <p className="pd-label">Options:</p>
                <div className="variant-chips">
                  {product.variants.map(v => (
                    <button
                      key={v.id}
                      className={`variant-chip${selVariant === v.id ? ' active' : ''}`}
                      onClick={() => setSelVariant(prev => prev === v.id ? null : v.id)}
                    >
                      {v.name}: {v.value}
                      {v.price_adjustment > 0 && (
                        <span style={{ opacity: .7 }}> +KES {Number(v.price_adjustment).toLocaleString()}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Cart */}
            <div className="pd-actions">
              <div className="qty-selector">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >−</button>
                <span>{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  disabled={!inStock}
                  aria-label="Increase quantity"
                >+</button>
              </div>

              <button
                className="btn-pd-cart"
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                <i className="bi bi-cart-plus"></i>
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>

              <button
                className={`btn-pd-wishlist${wishlisted ? ' active' : ''}`}
                onClick={handleWishlist}
                title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-label="Wishlist"
                style={wishlisted ? { borderColor: 'var(--clr-danger)', color: 'var(--clr-danger)' } : {}}
              >
                <i className={`bi bi-heart${wishlisted ? '-fill' : ''}`} />
              </button>
            </div>

            {/* Description */}
            <div className="pd-description">
              <h5>Description</h5>
              <p>{product.description}</p>
            </div>

            {product.seller_name && (
              <p className="pd-seller">
                Sold by: <strong>{product.seller_name}</strong>
              </p>
            )}
          </div>
        </div>

        {/* ── Reviews ──────────────────────────────────────────── */}
        <div className="pd-reviews-section">
          <h3 className="pd-reviews-title">
            <i className="bi bi-chat-square-text me-2"></i>
            Customer Reviews ({product.reviews?.length || 0})
          </h3>

          {(!product.reviews || product.reviews.length === 0) ? (
            <p style={{ color: 'var(--clr-text-muted)', fontSize: '.9rem' }}>
              No reviews yet — be the first to review this product!
            </p>
          ) : (
            <div className="reviews-list">
              {product.reviews.map(r => (
                <div key={r.id} className="review-card">
                  <div className="review-header">
                    <strong>{r.user_name}</strong>
                    <div className="review-stars">
                      {[1, 2, 3, 4, 5].map(s => (
                        <i
                          key={s}
                          className={`bi bi-star${s <= r.rating ? '-fill' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                  {r.title && <p className="review-title">{r.title}</p>}
                  <p className="review-body">{r.body}</p>
                  {r.is_verified_purchase && (
                    <span className="review-verified">
                      <i className="bi bi-patch-check-fill"></i> Verified Purchase
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}