// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/ProductDetail.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiFetch, useCart, useToast } from '../App.jsx'
import { Spinner } from '../components/ui/Spinner'

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
                <img 
                  key={img.id} 
                  src={img.image} 
                  alt={img.alt_text}
                  className={`pd-thumb ${mainImg === img.image ? 'active' : ''}`}
                  onClick={() => setMainImg(img.image)} 
                />
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
                    <button
                      key={v.id}
                      className={`variant-chip ${selVariant === v.id ? 'active' : ''}`}
                      onClick={() => setSelVariant(v.id)}
                    >
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
              <button 
                className="btn-pd-cart" 
                onClick={handleAddToCart} 
                disabled={product.stock === 0}
              >
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
                  <span className="review-verified">
                    <i className="bi bi-patch-check-fill me-1" />Verified Purchase
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}