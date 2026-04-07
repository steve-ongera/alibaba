// ─────────────────────────────────────────────────────────────────────────────
//  src/components/ui/ProductCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart, useToast } from '../../App.jsx'

export function ProductCard({ product }) {
  const { addToCart }  = useCart()
  const navigate       = useNavigate()
  const { addToast }   = useToast ? useToast() : { addToast: () => {} }

  const img    = product.primary_image || '/placeholder.jpg'
  const onSale = product.discount_percent > 0

  const handleWishlist = (e) => {
    e.stopPropagation()
    // toggle wishlist functionality
    addToast && addToast('Added to wishlist', 'success')
  }

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addToCart(product.id)
  }

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product.slug}`)}>
      <div className="product-card-img-wrap">
        <img src={img} alt={product.name} className="product-card-img" loading="lazy" />
        {onSale && <span className="badge-discount">-{product.discount_percent}%</span>}
        {product.is_flash_sale && <span className="badge-flash"><i className="bi bi-lightning-charge-fill"></i> Flash</span>}
        <button
          className="btn-wishlist"
          onClick={handleWishlist}
          title="Add to wishlist"
        >
          <i className="bi bi-heart"></i>
        </button>
      </div>
      <div className="product-card-body">
        <p className="product-card-category">{product.category_name}</p>
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-rating">
          {[1,2,3,4,5].map(s => (
            <i key={s} className={`bi bi-star${s <= Math.round(product.rating_avg) ? '-fill' : ''}`}></i>
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
          onClick={handleAddToCart}
        >
          <i className="bi bi-cart-plus me-1"></i> Add to Cart
        </button>
      </div>
    </div>
  )
}