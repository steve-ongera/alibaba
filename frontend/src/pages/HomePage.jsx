// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/HomePage.jsx  — Jumia-inspired, blue & white, fully detailed
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../App.jsx'
import { ProductCard } from '../components/ui/ProductCard'
import { HeroBanner } from '../components/home/HeroBanner'
import { FlashSaleTimer } from '../components/home/FlashSaleTimer'
import { SectionHeader } from '../components/ui/SectionHeader'
import { Spinner } from '../components/ui/Spinner'

/* ─── static fallback data (shown while API loads / offline) ─────────────── */
const FALLBACK_CATEGORIES = [
  { id: 1,  slug: 'phones',       icon: 'phone',         name: 'Phones' },
  { id: 2,  slug: 'computers',    icon: 'laptop',        name: 'Computers' },
  { id: 3,  slug: 'fashion',      icon: 'bag',           name: 'Fashion' },
  { id: 4,  slug: 'home-living',  icon: 'house',         name: 'Home & Living' },
  { id: 5,  slug: 'appliances',   icon: 'plug',          name: 'Appliances' },
  { id: 6,  slug: 'beauty',       icon: 'stars',         name: 'Beauty' },
  { id: 7,  slug: 'sports',       icon: 'bicycle',       name: 'Sports' },
  { id: 8,  slug: 'baby-kids',    icon: 'balloon-heart', name: 'Baby & Kids' },
  { id: 9,  slug: 'automotive',   icon: 'car-front',     name: 'Automotive' },
  { id: 10, slug: 'gaming',       icon: 'controller',    name: 'Gaming' },
  { id: 11, slug: 'groceries',    icon: 'cart3',         name: 'Groceries' },
  { id: 12, slug: 'books',        icon: 'book',          name: 'Books' },
  { id: 13, slug: 'health',       icon: 'heart-pulse',   name: 'Health' },
  { id: 14, slug: 'garden',       icon: 'flower1',       name: 'Garden' },
  { id: 15, slug: 'tools',        icon: 'tools',         name: 'Tools' },
  { id: 16, slug: 'more',         icon: 'grid',          name: 'More' },
]

const BRANDS = [
  'Samsung', 'Apple', 'Tecno', 'Infinix', 'HP', 'Dell', 'Nike', 'Adidas',
  'LG', 'Sony', 'Xiaomi', 'Itel', 'Hisense', 'Bruhm', 'Canon', 'Epson',
]

const DUO_PROMOS = [
  {
    id: 1,
    title: 'Back to School',
    sub: 'Up to 40% off stationery & bags',
    btn: 'Shop Now',
    link: '/category/back-to-school',
    bg: '#0068c9',
    icon: 'mortarboard',
  },
  {
    id: 2,
    title: 'Kitchen Deals',
    sub: 'Best prices on appliances',
    btn: 'Explore',
    link: '/category/appliances',
    bg: '#003f7d',
    icon: 'egg-fried',
  },
]

const TRENDING_SEARCHES = [
  'iPhone 15', 'Wireless Earbuds', 'Smart Watch', 'Air Fryer',
  'Gaming Chair', 'HP Laptop', 'Running Shoes', 'Baby Stroller',
]


/* ─── Sub-components ─────────────────────────────────────────────────────── */

/** Horizontal scrollable product row (Jumia-style) */
function ProductRow({ products = [], loading }) {
  const rowRef = useRef(null)

  const scroll = (dir) => {
    if (!rowRef.current) return
    rowRef.current.scrollBy({ left: dir * 260, behavior: 'smooth' })
  }

  if (loading) return (
    <div style={{ display: 'flex', gap: 10, overflow: 'hidden' }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          minWidth: 170, height: 260,
          background: 'var(--clr-border)',
          borderRadius: 'var(--r-md)',
          flexShrink: 0,
          animation: `pulse 1.4s ease-in-out ${i * 0.1}s infinite`,
        }} />
      ))}
    </div>
  )

  return (
    <div style={{ position: 'relative' }}>
      {/* Scroll arrows — only desktop */}
      <button
        className="row-scroll-btn row-scroll-prev"
        onClick={() => scroll(-1)}
        aria-label="Scroll left"
      >
        <i className="bi bi-chevron-left"></i>
      </button>

      <div className="product-scroll-row" ref={rowRef}>
        {products.map(p => (
          <div key={p.id} className="product-scroll-item">
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      <button
        className="row-scroll-btn row-scroll-next"
        onClick={() => scroll(1)}
        aria-label="Scroll right"
      >
        <i className="bi bi-chevron-right"></i>
      </button>
    </div>
  )
}

/** Deal of the Day card */
function DealCard({ product }) {
  if (!product) return null
  const img    = product.primary_image || '/placeholder.jpg'
  const onSale = product.discount_percent > 0
  const navigate = useNavigate()

  return (
    <div className="deal-card" onClick={() => navigate(`/product/${product.slug}`)}>
      <div className="deal-card-img-wrap">
        <img src={img} alt={product.name} />
        {onSale && (
          <span className="deal-badge">-{product.discount_percent}%</span>
        )}
      </div>
      <div className="deal-card-body">
        <p className="deal-card-name">{product.name}</p>
        <div className="deal-card-price">
          <span className="price-current">KES {Number(product.price).toLocaleString()}</span>
          {onSale && (
            <span className="price-original">KES {Number(product.original_price).toLocaleString()}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 1, fontSize: '.7rem', marginTop: 3 }}>
          {[1,2,3,4,5].map(s => (
            <i key={s} style={{ color: 'var(--clr-accent)' }}
               className={`bi bi-star${s <= Math.round(product.rating_avg || 4) ? '-fill' : ''}`}></i>
          ))}
          <span style={{ color: 'var(--clr-text-muted)', fontSize: '.68rem', marginLeft: 3 }}>
            ({product.rating_count || 0})
          </span>
        </div>
      </div>
    </div>
  )
}

/** Top categories sidebar (Jumia left-menu style) */
function CatSidebar({ categories }) {
  return (
    <div className="cat-sidebar-box">
      <div className="cat-sidebar-header">
        <i className="bi bi-grid-fill me-2"></i>
        All Categories
      </div>
      <ul className="cat-sidebar-list">
        {categories.map(cat => (
          <li key={cat.id}>
            <Link to={`/category/${cat.slug}`} className="cat-sidebar-link">
              <i className={`bi bi-${cat.icon}`}></i>
              <span>{cat.name}</span>
              <i className="bi bi-chevron-right cat-sidebar-arrow"></i>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Banners — mini grid (3 tiles) */
function MiniBannerRow() {
  const banners = [
    { bg: 'linear-gradient(135deg,#003f7d,#0068c9)', icon: 'truck', title: 'Free Delivery', sub: 'On orders over KES 2,000', link: '/store' },
    { bg: 'linear-gradient(135deg,#11a75c,#059669)', icon: 'shield-check', title: 'Verified Sellers', sub: '100% genuine products', link: '/store' },
    { bg: 'linear-gradient(135deg,#b45309,#d97706)', icon: 'phone-vibrate', title: 'Pay via M-Pesa', sub: 'Quick & secure checkout', link: '/checkout' },
  ]
  return (
    <div className="mini-banner-row">
      {banners.map((b, i) => (
        <Link key={i} to={b.link} className="mini-banner-card" style={{ background: b.bg }}>
          <i className={`bi bi-${b.icon} mini-banner-icon`}></i>
          <div>
            <strong>{b.title}</strong>
            <span>{b.sub}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}


/* ─── Main HomePage ───────────────────────────────────────────────────────── */
export default function HomePage() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate              = useNavigate()

  useEffect(() => {
    apiFetch('/home/')
      .then(setData)
      .catch(() => setData({}))
      .finally(() => setLoading(false))
  }, [])

  const categories  = data?.categories?.length ? data.categories : FALLBACK_CATEGORIES
  const flashSale   = data?.flash_sale   || []
  const featured    = data?.featured     || []
  const newArrivals = data?.new_arrivals || []
  const topPicks    = data?.top_picks    || featured.slice(0, 8)

  return (
    <div className="homepage">

      {/* ─── Trending searches pill bar ─────────────────────────────────── */}
      <div className="trending-bar">
        <div className="container">
          <div className="trending-inner">
            <span className="trending-label">
              <i className="bi bi-graph-up-arrow me-1"></i>Trending:
            </span>
            <div className="trending-pills">
              {TRENDING_SEARCHES.map(q => (
                <button
                  key={q}
                  className="trending-pill"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(q)}`)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Hero layout: category sidebar + carousel + mini tiles ────── */}
      <div className="hero-layout-wrap">
        <div className="container">
          <div className="hero-layout-grid">

            {/* Category sidebar (desktop only) */}
            <div className="hero-cat-col">
              <CatSidebar categories={categories} />
            </div>

            {/* Main carousel */}
            <div className="hero-carousel-col">
              {data?.banners?.length > 0
                ? <HeroBanner banners={data.banners} />
                : (
                  /* Fallback placeholder hero */
                  <div className="hero-placeholder">
                    <div className="hero-placeholder-content">
                      <span className="hero-placeholder-tag">
                        <i className="bi bi-lightning-charge-fill me-1"></i>Hot Deals
                      </span>
                      <h1>Kenya's #1 Online Marketplace</h1>
                      <p>Discover millions of products at unbeatable prices — delivered to your door.</p>
                      <Link to="/store" className="btn-hero">
                        Shop Now <i className="bi bi-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                )
              }
            </div>

            {/* Right mini tiles */}
            <div className="hero-tiles-col">
              <Link to="/store?tag=new" className="hero-tile hero-tile-blue">
                <i className="bi bi-stars hero-tile-icon"></i>
                <div>
                  <strong>New Arrivals</strong>
                  <span>Just landed</span>
                </div>
              </Link>
              <Link to="/store?featured=true" className="hero-tile hero-tile-dark">
                <i className="bi bi-fire hero-tile-icon"></i>
                <div>
                  <strong>Best Sellers</strong>
                  <span>Top rated</span>
                </div>
              </Link>
              <Link to="/store?tag=clearance" className="hero-tile hero-tile-orange">
                <i className="bi bi-percent hero-tile-icon"></i>
                <div>
                  <strong>Clearance</strong>
                  <span>Up to 70% off</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Mini info banner row ────────────────────────────────────────── */}
      <div className="container">
        <MiniBannerRow />
      </div>

      {/* ─── Category Chips grid ─────────────────────────────────────────── */}
      <section className="section categories-section">
        <div className="container">
          <SectionHeader title="Shop by Category" link="/store" />
          <div className="category-chips">
            {categories.map(cat => (
              <Link key={cat.id} to={`/category/${cat.slug}`} className="category-chip">
                <i className={`bi bi-${cat.icon}`}></i>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Flash Sale ──────────────────────────────────────────────────── */}
      {(flashSale.length > 0 || loading) && (
        <section className="section flash-section">
          <div className="container">
            <div className="flash-header">
              <div className="d-flex align-items-center gap-3">
                <i className="bi bi-lightning-charge-fill flash-icon"></i>
                <div>
                  <SectionHeader title="Flash Sale" subtitle="Hurry — deals end soon!" />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FlashSaleTimer endTime={flashSale[0]?.flash_sale_end} />
                <Link to="/store?flash=true" className="section-see-all">
                  See All <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
            <ProductRow products={flashSale} loading={loading} />
          </div>
        </section>
      )}

      {/* ─── Duo Promo Banners ───────────────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 8 }}>
        <div className="container">
          <div className="duo-promo-grid">
            {DUO_PROMOS.map(promo => (
              <Link key={promo.id} to={promo.link} className="duo-promo-card">
                {/* Solid colour fallback since we don't have images */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: promo.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                  paddingRight: 24,
                }}>
                  <i className={`bi bi-${promo.icon}`} style={{
                    fontSize: '5rem',
                    color: 'rgba(255,255,255,.12)',
                  }}></i>
                </div>
                <div className="duo-promo-overlay">
                  <h4>{promo.title}</h4>
                  <span>{promo.sub}</span>
                  <div className="btn-promo">
                    {promo.btn} <i className="bi bi-arrow-right"></i>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Products ───────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <SectionHeader title="Featured Products" link="/store?featured=true" />
          <ProductRow products={featured} loading={loading} />
        </div>
      </section>

      {/* ─── Brand Strip ─────────────────────────────────────────────────── */}
      <section className="brand-strip-section">
        <div className="container">
          <div style={{ fontSize: '.74rem', fontWeight: 700, color: 'var(--clr-text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Top Brands
          </div>
          <div className="brand-strip-list">
            {BRANDS.map(b => (
              <Link key={b} to={`/search?q=${encodeURIComponent(b)}`} className="brand-chip">
                {b}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4-col Promo strip ───────────────────────────────────────────── */}
      <section className="promo-strip">
        <div className="container">
          <div className="row g-2 g-md-3">
            {[
              { icon: 'truck',                 title: 'Free Delivery',    sub: 'Orders over KES 2,000' },
              { icon: 'shield-check',          title: 'Secure Payment',   sub: 'M-Pesa & Card accepted' },
              { icon: 'arrow-counterclockwise',title: 'Easy Returns',     sub: '14-day return policy'  },
              { icon: 'headset',               title: '24/7 Support',     sub: 'We\'re always here'    },
            ].map((p, i) => (
              <div key={i} className="col-6 col-md-3">
                <div className="promo-card">
                  <i className={`bi bi-${p.icon} promo-icon`}></i>
                  <strong>{p.title}</strong>
                  <span>{p.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Top Picks for You ───────────────────────────────────────────── */}
      {(topPicks.length > 0 || loading) && (
        <section className="section">
          <div className="container">
            <SectionHeader title="Top Picks for You" subtitle="Based on what's popular" link="/store" />
            <div className="products-grid">
              {loading
                ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
                : topPicks.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)
              }
            </div>
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Link to="/store" className="btn-primary-cta">
                View All Products <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── New Arrivals row ────────────────────────────────────────────── */}
      {(newArrivals.length > 0 || loading) && (
        <section className="section" style={{ background: 'var(--clr-surface)', paddingTop: 24, paddingBottom: 24 }}>
          <div className="container">
            <SectionHeader title="New Arrivals" subtitle="Fresh in stock" link="/store?ordering=-created_at" />
            <ProductRow products={newArrivals} loading={loading} />
          </div>
        </section>
      )}

      {/* ─── Deal of the Day block ───────────────────────────────────────── */}
      {featured.length >= 4 && (
        <section className="section">
          <div className="container">
            <SectionHeader title="Deal of the Day" subtitle="Grab these while they last!" link="/store?featured=true" />
            <div className="deal-grid">
              {featured.slice(0, 6).map(p => (
                <DealCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Newsletter CTA strip ────────────────────────────────────────── */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-cta-card">
            <div className="newsletter-cta-text">
              <h3>Subscribe & Save More</h3>
              <p>Get exclusive deals, new arrivals, and flash sale alerts straight to your inbox.</p>
            </div>
            <form
              className="newsletter-cta-form"
              onSubmit={e => { e.preventDefault() }}
            >
              <input
                type="email"
                placeholder="Enter your email address"
                className="newsletter-cta-input"
              />
              <button type="submit" className="btn-primary-cta">
                <i className="bi bi-envelope-check me-1"></i> Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ─── Inline CSS for HomePage-only components ─────────────────────── */}
      <style>{`
        /* ── Trending Bar ──────────────────────────────────────── */
        .trending-bar {
          background: var(--clr-surface);
          border-bottom: 1px solid var(--clr-border);
          padding: 8px 0;
          overflow: hidden;
        }
        .trending-inner {
          display: flex;
          align-items: center;
          gap: 10px;
          overflow: hidden;
        }
        .trending-label {
          font-size: .73rem;
          font-weight: 700;
          color: var(--clr-text-muted);
          white-space: nowrap;
          flex-shrink: 0;
          font-family: var(--font-body);
        }
        .trending-pills {
          display: flex;
          gap: 7px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 2px;
          flex: 1;
        }
        .trending-pills::-webkit-scrollbar { display: none; }
        .trending-pill {
          flex-shrink: 0;
          background: var(--clr-primary-light);
          color: var(--clr-primary);
          border: 1px solid var(--clr-primary-mid);
          border-radius: var(--r-pill);
          padding: 3px 11px;
          font-size: .71rem;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          transition: all var(--transition);
          font-family: var(--font-body);
        }
        .trending-pill:hover {
          background: var(--clr-primary);
          color: #fff;
          border-color: var(--clr-primary);
        }

        /* ── Hero Layout ───────────────────────────────────────── */
        .hero-layout-wrap {
          background: var(--clr-surface);
          padding: 14px 0 0;
        }
        .hero-layout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .hero-cat-col { display: none; }
        .hero-tiles-col { display: none; }

        @media (min-width: 1024px) {
          .hero-layout-grid {
            grid-template-columns: 220px 1fr 160px;
            gap: 14px;
          }
          .hero-cat-col  { display: block; }
          .hero-tiles-col { display: flex; flex-direction: column; gap: 10px; }
        }

        /* ── Category Sidebar ──────────────────────────────────── */
        .cat-sidebar-box {
          background: var(--clr-surface);
          border: 1px solid var(--clr-border);
          border-radius: var(--r-md);
          overflow: hidden;
          height: 100%;
        }
        .cat-sidebar-header {
          background: var(--clr-primary);
          color: #fff;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: .85rem;
          padding: 12px 14px;
          display: flex;
          align-items: center;
        }
        .cat-sidebar-list { margin: 0; padding: 4px 0; }
        .cat-sidebar-link {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 14px;
          font-size: .81rem;
          font-weight: 500;
          color: var(--clr-text-sub);
          transition: background var(--transition), color var(--transition);
          font-family: var(--font-body);
          border-bottom: 1px solid var(--clr-border);
        }
        .cat-sidebar-link:last-child { border-bottom: none; }
        .cat-sidebar-link i:first-child { color: var(--clr-primary); font-size: .9rem; width: 18px; }
        .cat-sidebar-link span { flex: 1; }
        .cat-sidebar-arrow { color: var(--clr-text-light); font-size: .65rem; }
        .cat-sidebar-link:hover {
          background: var(--clr-primary-light);
          color: var(--clr-primary);
        }
        .cat-sidebar-link:hover .cat-sidebar-arrow { color: var(--clr-primary); }

        /* ── Hero placeholder ──────────────────────────────────── */
        .hero-placeholder {
          background: linear-gradient(135deg, var(--clr-secondary) 0%, var(--clr-secondary-light) 100%);
          border-radius: var(--r-md);
          overflow: hidden;
          height: 260px;
          display: flex;
          align-items: center;
          position: relative;
        }
        .hero-placeholder::before {
          content: '';
          position: absolute;
          right: -40px; top: -40px;
          width: 280px; height: 280px;
          border-radius: 50%;
          background: rgba(255,255,255,.05);
        }
        .hero-placeholder::after {
          content: '';
          position: absolute;
          right: 60px; bottom: -60px;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: rgba(255,255,255,.04);
        }
        .hero-placeholder-content {
          padding: 32px;
          position: relative;
          z-index: 1;
          max-width: 480px;
        }
        .hero-placeholder-tag {
          display: inline-flex;
          align-items: center;
          background: var(--clr-accent);
          color: #fff;
          font-size: .72rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--r-pill);
          font-family: var(--font-display);
          margin-bottom: 12px;
        }
        .hero-placeholder-content h1 {
          font-family: var(--font-display);
          font-size: 1.7rem;
          font-weight: 900;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 10px;
        }
        .hero-placeholder-content p {
          color: rgba(255,255,255,.78);
          font-size: .88rem;
          margin-bottom: 18px;
          line-height: 1.65;
        }
        @media (max-width: 767px) {
          .hero-placeholder { height: 200px; }
          .hero-placeholder-content { padding: 20px; }
          .hero-placeholder-content h1 { font-size: 1.2rem; }
          .hero-placeholder-content p { display: none; }
        }

        /* ── Hero tiles (right col) ────────────────────────────── */
        .hero-tile {
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: var(--r-md);
          padding: 12px 14px;
          color: #fff;
          flex: 1;
          min-height: 0;
          text-decoration: none;
          transition: filter var(--transition);
        }
        .hero-tile:hover { filter: brightness(1.08); color: #fff; }
        .hero-tile-blue  { background: linear-gradient(135deg, #0068c9, #0284c7); }
        .hero-tile-dark  { background: linear-gradient(135deg, #003f7d, #0055a6); }
        .hero-tile-orange{ background: linear-gradient(135deg, #b45309, #d97706); }
        .hero-tile-icon {
          font-size: 1.6rem;
          opacity: .9;
          flex-shrink: 0;
        }
        .hero-tile div strong {
          display: block;
          font-family: var(--font-display);
          font-size: .82rem;
          font-weight: 700;
          color: #fff;
        }
        .hero-tile div span {
          font-size: .7rem;
          color: rgba(255,255,255,.75);
          font-family: var(--font-body);
        }

        /* ── Mini Banner Row ───────────────────────────────────── */
        .mini-banner-row {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 10px;
          margin: 14px 0 0;
        }
        .mini-banner-card {
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: var(--r-md);
          padding: 12px 14px;
          color: #fff;
          transition: filter var(--transition);
        }
        .mini-banner-card:hover { filter: brightness(1.1); }
        .mini-banner-icon {
          font-size: 1.6rem;
          opacity: .85;
          flex-shrink: 0;
        }
        .mini-banner-card strong {
          display: block;
          font-family: var(--font-display);
          font-size: .82rem;
          font-weight: 700;
          color: #fff;
        }
        .mini-banner-card span {
          font-size: .7rem;
          color: rgba(255,255,255,.78);
          font-family: var(--font-body);
        }
        @media (max-width: 600px) {
          .mini-banner-row { grid-template-columns: 1fr; gap: 8px; }
        }

        /* ── Horizontal scroll product row ────────────────────── */
        .product-scroll-row {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 4px;
          scroll-snap-type: x mandatory;
        }
        .product-scroll-row::-webkit-scrollbar { display: none; }
        .product-scroll-item {
          flex-shrink: 0;
          width: 178px;
          scroll-snap-align: start;
        }
        @media (min-width: 480px) { .product-scroll-item { width: 190px; } }
        @media (min-width: 768px) { .product-scroll-item { width: 210px; } }
        @media (min-width: 1024px){ .product-scroll-item { width: 220px; } }

        .row-scroll-btn {
          display: none;
          position: absolute;
          top: 50%; transform: translateY(-50%);
          width: 36px; height: 36px;
          background: var(--clr-surface);
          border: 1.5px solid var(--clr-border);
          border-radius: 50%;
          align-items: center;
          justify-content: center;
          color: var(--clr-secondary);
          font-size: .9rem;
          z-index: 5;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition);
        }
        .row-scroll-btn:hover {
          background: var(--clr-primary);
          color: #fff;
          border-color: var(--clr-primary);
        }
        .row-scroll-prev { left: -18px; }
        .row-scroll-next { right: -18px; }
        @media (min-width: 1024px) {
          .row-scroll-btn { display: flex; }
        }

        /* ── Deal of the Day grid ──────────────────────────────── */
        .deal-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        @media (max-width: 600px) { .deal-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .deal-grid { grid-template-columns: repeat(6, 1fr); gap: 12px; } }

        .deal-card {
          background: var(--clr-surface);
          border: 1px solid var(--clr-border);
          border-radius: var(--r-md);
          overflow: hidden;
          cursor: pointer;
          transition: transform var(--transition), box-shadow var(--transition);
        }
        .deal-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-sm); }
        .deal-card-img-wrap {
          position: relative;
          aspect-ratio: 1/1;
          background: var(--clr-surface-2);
          overflow: hidden;
        }
        .deal-card-img-wrap img {
          width: 100%; height: 100%;
          object-fit: contain;
          padding: 8px;
          transition: transform 280ms ease;
        }
        .deal-card:hover .deal-card-img-wrap img { transform: scale(1.06); }
        .deal-badge {
          position: absolute;
          top: 6px; left: 6px;
          background: var(--clr-danger);
          color: #fff;
          font-size: .62rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 2px;
          font-family: var(--font-display);
        }
        .deal-card-body { padding: 8px 10px 10px; }
        .deal-card-name {
          font-size: .77rem;
          font-weight: 600;
          color: var(--clr-text);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 4px;
          font-family: var(--font-body);
        }
        .deal-card-price {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .deal-card-price .price-current { font-size: .88rem; }
        .deal-card-price .price-original { font-size: .68rem; }

        /* ── Newsletter CTA ────────────────────────────────────── */
        .newsletter-section {
          padding: 28px 0;
          background: var(--clr-primary-light);
          border-top: 1px solid var(--clr-primary-mid);
        }
        .newsletter-cta-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }
        .newsletter-cta-text h3 {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--clr-secondary);
          margin-bottom: 4px;
        }
        .newsletter-cta-text p {
          font-size: .84rem;
          color: var(--clr-text-muted);
        }
        .newsletter-cta-form {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          flex: 1;
          max-width: 480px;
          min-width: 260px;
        }
        .newsletter-cta-input {
          flex: 1;
          min-width: 0;
          border: 1.5px solid var(--clr-primary-mid);
          border-radius: var(--r-sm);
          padding: 10px 14px;
          font-size: .88rem;
          outline: none;
          font-family: var(--font-body);
          background: #fff;
          transition: border-color var(--transition), box-shadow var(--transition);
        }
        .newsletter-cta-input:focus {
          border-color: var(--clr-primary);
          box-shadow: 0 0 0 3px rgba(0,104,201,.1);
        }
        @media (max-width: 640px) {
          .newsletter-cta-card { flex-direction: column; align-items: flex-start; }
          .newsletter-cta-form { max-width: 100%; width: 100%; }
          .newsletter-cta-input { min-height: 42px; }
        }

        /* ── Skeleton loader animation ─────────────────────────── */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .4; }
        }
      `}</style>
    </div>
  )
}

/* ── Skeleton card ──────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--clr-surface)',
      borderRadius: 'var(--r-md)',
      border: '1px solid var(--clr-border)',
      overflow: 'hidden',
    }}>
      <div style={{
        aspectRatio: '1/1',
        background: 'var(--clr-border)',
        animation: 'pulse 1.4s ease-in-out infinite',
      }} />
      <div style={{ padding: '10px 10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ height: 10, borderRadius: 4, background: 'var(--clr-border)', width: '40%', animation: 'pulse 1.4s ease-in-out infinite' }} />
        <div style={{ height: 12, borderRadius: 4, background: 'var(--clr-border)', animation: 'pulse 1.4s ease-in-out .1s infinite' }} />
        <div style={{ height: 12, borderRadius: 4, background: 'var(--clr-border)', width: '75%', animation: 'pulse 1.4s ease-in-out .15s infinite' }} />
        <div style={{ height: 14, borderRadius: 4, background: 'var(--clr-border)', width: '55%', marginTop: 2, animation: 'pulse 1.4s ease-in-out .2s infinite' }} />
        <div style={{ height: 30, borderRadius: 6, background: 'var(--clr-border)', marginTop: 4, animation: 'pulse 1.4s ease-in-out .25s infinite' }} />
      </div>
    </div>
  )
}