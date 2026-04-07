// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/WishlistPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { apiFetch, useToast } from '../App.jsx'
import { ProductCard } from '../components/ui/ProductCard'
import { Spinner } from '../components/ui/Spinner'

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