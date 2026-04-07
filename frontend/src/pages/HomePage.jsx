// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/HomePage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../App.jsx'
import { ProductCard } from '../components/ui/ProductCard'
import { HeroBanner } from '../components/home/HeroBanner'
import { FlashSaleTimer } from '../components/home/FlashSaleTimer'
import { SectionHeader } from '../components/ui/SectionHeader'
import { Spinner } from '../components/ui/Spinner'

export default function HomePage() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/home/').then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <>
      {/* Hero carousel */}
      {data?.banners?.length > 0 && <HeroBanner banners={data.banners} />}

      {/* Category chips */}
      <section className="section categories-section">
        <div className="container">
          <SectionHeader title="Shop by Category" link="/store" />
          <div className="category-chips">
            {data?.categories?.map(cat => (
              <Link key={cat.id} to={`/category/${cat.slug}`} className="category-chip">
                {cat.icon && <i className={`bi bi-${cat.icon}`}></i>}
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
                <i className="bi bi-lightning-charge-fill flash-icon"></i>
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
            <div className="col-6 col-md-3">
              <div className="promo-card">
                <i className="bi bi-truck promo-icon"></i>
                <strong>Free Delivery</strong>
                <span>Orders over KES 2,000</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="promo-card">
                <i className="bi bi-shield-check promo-icon"></i>
                <strong>Secure Payment</strong>
                <span>M-Pesa & Card</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="promo-card">
                <i className="bi bi-arrow-counterclockwise promo-icon"></i>
                <strong>Easy Returns</strong>
                <span>14-day return policy</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="promo-card">
                <i className="bi bi-headset promo-icon"></i>
                <strong>24/7 Support</strong>
                <span>Always here for you</span>
              </div>
            </div>
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
    </>
  )
}