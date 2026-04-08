// ─────────────────────────────────────────────────────────────────────────────
//  src/components/ui/ProductCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart, useToast } from '../../App.jsx'

export function ProductCard({ product }) {
  const { addToCart }       = useCart()
  const { addToast }        = useToast()
  const navigate            = useNavigate()
  const [wishlisted, setWishlisted] = useState(false)

  const img    = product.primary_image || '/placeholder.jpg'
  const onSale = product.discount_percent > 0

  const handleWishlist = (e) => {
    e.stopPropagation()
    setWishlisted(prev => !prev)
    addToast?.(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️')
  }

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addToCart(product.id)
    addToast?.(`${product.name} added to cart!`)
  }

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/product/${product.slug}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/product/${product.slug}`)}
      aria-label={`View ${product.name}`}
    >
      {/* Image */}
      <div className="product-card-img-wrap">
        <img
          src={img}
          alt={product.name}
          className="product-card-img"
          loading="lazy"
        />

        {/* Badges */}
        {onSale && (
          <span className="badge-discount">-{product.discount_percent}%</span>
        )}
        {product.is_new && !onSale && (
          <span className="badge-new">NEW</span>
        )}
        {product.is_flash_sale && (
          <span className="badge-flash">
            <i className="bi bi-lightning-charge-fill"></i> Flash
          </span>
        )}

        {/* Wishlist */}
        <button
          className={`btn-wishlist${wishlisted ? ' active' : ''}`}
          onClick={handleWishlist}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <i className={`bi bi-heart${wishlisted ? '-fill' : ''}`}></i>
        </button>
      </div>

      {/* Body */}
      <div className="product-card-body">
        {product.category_name && (
          <p className="product-card-category">{product.category_name}</p>
        )}

        <h3 className="product-card-name">{product.name}</h3>

        {/* Rating */}
        <div className="product-card-rating">
          {[1, 2, 3, 4, 5].map(s => (
            <i
              key={s}
              className={`bi bi-star${s <= Math.round(product.rating_avg ?? 0) ? '-fill' : ''}`}
            ></i>
          ))}
          {product.rating_count > 0 && (
            <span className="rating-count">({product.rating_count})</span>
          )}
        </div>

        {/* Price */}
        <div className="product-card-price">
          <span className="price-current">
            KES {Number(product.price).toLocaleString()}
          </span>
          {onSale && product.original_price && (
            <span className="price-original">
              KES {Number(product.original_price).toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          className="btn-add-cart"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          aria-label={`Add ${product.name} to cart`}
        >
          {product.stock === 0 ? (
            <>
              <i className="bi bi-x-circle me-1"></i> Out of Stock
            </>
          ) : (
            <>
              <i className="bi bi-cart-plus me-1"></i> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  )
}