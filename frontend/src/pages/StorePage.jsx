// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/StorePage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiFetch } from '../App.jsx'
import { ProductCard } from '../components/ui/ProductCard'
import { Pagination } from '../components/ui/Pagination'
import { Spinner } from '../components/ui/Spinner'

// ── Helper: always return an array regardless of API shape ────────────────────
const toArray = (data) => {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (Array.isArray(data.results)) return data.results
  return []
}

export default function StorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products,    setProducts]    = useState([])
  const [count,       setCount]       = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [brands,      setBrands]      = useState([])
  const [cats,        setCats]        = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const page     = Number(searchParams.get('page')    || 1)
  const ordering = searchParams.get('ordering')       || '-created_at'
  const minPrice = searchParams.get('min_price')      || ''
  const maxPrice = searchParams.get('max_price')      || ''
  const brand    = searchParams.get('brand__slug')    || ''
  const category = searchParams.get('category__slug') || ''

  // ── Fetch filter data ───────────────────────────────────────────────────────
  useEffect(() => {
    apiFetch('/brands/')
      .then(data => setBrands(toArray(data)))
      .catch(() => setBrands([]))

    apiFetch('/categories/')
      .then(data => setCats(toArray(data)))
      .catch(() => setCats([]))
  }, [])

  // ── Fetch products ──────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true)
    const qs = new URLSearchParams({ page, ordering })
    if (minPrice) qs.set('min_price', minPrice)
    if (maxPrice) qs.set('max_price', maxPrice)
    if (brand)    qs.set('brand__slug', brand)
    if (category) qs.set('category__slug', category)

    apiFetch(`/products/?${qs}`)
      .then(res => {
        setProducts(toArray(res))
        setCount(res?.count ?? toArray(res).length)
      })
      .catch(() => {
        setProducts([])
        setCount(0)
      })
      .finally(() => setLoading(false))
  }, [searchParams])

  // ── URL param helpers ───────────────────────────────────────────────────────
  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val); else p.delete(key)
    p.set('page', '1')
    setSearchParams(p)
  }

  const clearAllFilters = () => {
    setSearchParams({ page: '1', ordering })
  }

  const activeFilterCount = [brand, category, minPrice, maxPrice].filter(Boolean).length

  // ── Lock body scroll when mobile sidebar is open ────────────────────────────
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  // ── Sidebar content (shared between desktop + mobile drawer) ────────────────
  const SidebarContent = () => (
    <>
      {/* Active filter summary */}
      {activeFilterCount > 0 && (
        <div className="sidebar-section" style={{
          background: 'var(--clr-primary-light)',
          borderRadius: 'var(--r-sm)',
          padding: '10px 12px',
          marginBottom: '6px',
          border: '1px solid var(--clr-primary-mid)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--clr-primary)' }}>
              <i className="bi bi-funnel-fill me-1"></i>
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
            </span>
            <button className="btn-clear-filter" onClick={clearAllFilters}>
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="sidebar-section">
        <h5 className="sidebar-heading">Categories</h5>
        <div className="sidebar-check">
          <input
            type="radio"
            name="cat"
            id="cat-all"
            checked={!category}
            onChange={() => setParam('category__slug', '')}
          />
          <label htmlFor="cat-all">All Categories</label>
        </div>
        {cats.map(c => (
          <div key={c.id} className="sidebar-check">
            <input
              type="radio"
              name="cat"
              id={`cat-${c.slug}`}
              checked={category === c.slug}
              onChange={() => setParam('category__slug', c.slug)}
            />
            <label htmlFor={`cat-${c.slug}`}>{c.name}</label>
          </div>
        ))}
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div className="sidebar-section">
          <h5 className="sidebar-heading">Brands</h5>
          <div className="sidebar-check">
            <input
              type="radio"
              name="brand"
              id="brand-all"
              checked={!brand}
              onChange={() => setParam('brand__slug', '')}
            />
            <label htmlFor="brand-all">All Brands</label>
          </div>
          {brands.map(b => (
            <div key={b.id} className="sidebar-check">
              <input
                type="radio"
                name="brand"
                id={`br-${b.slug}`}
                checked={brand === b.slug}
                onChange={() => setParam('brand__slug', b.slug)}
              />
              <label htmlFor={`br-${b.slug}`}>{b.name}</label>
            </div>
          ))}
        </div>
      )}

      {/* Price Range */}
      <div className="sidebar-section">
        <h5 className="sidebar-heading">Price Range (KES)</h5>
        <div className="price-range-inputs">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            min={0}
            onChange={e => setParam('min_price', e.target.value)}
            className="price-input"
          />
          <span style={{ color: 'var(--clr-text-muted)', flexShrink: 0 }}>–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            min={0}
            onChange={e => setParam('max_price', e.target.value)}
            className="price-input"
          />
        </div>
        {(minPrice || maxPrice) && (
          <button
            className="btn-clear-filter"
            style={{ marginTop: 8 }}
            onClick={() => { setParam('min_price', ''); setParam('max_price', '') }}
          >
            Clear price
          </button>
        )}
      </div>
    </>
  )

  return (
    <div className="store-page">
      <div className="container">

        {/* ── Page title row ──────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 0 8px',
          flexWrap: 'wrap',
          gap: 8
        }}>
          <h1 className="page-title" style={{ margin: 0, padding: 0 }}>
            {category
              ? cats.find(c => c.slug === category)?.name || 'Products'
              : 'All Products'}
            {' '}
            <span>{count > 0 ? `${count} items` : ''}</span>
          </h1>

          {/* Mobile: filter toggle */}
          <button
            className="filter-toggle-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open filters"
          >
            <i className="bi bi-funnel"></i>
            Filters
            {activeFilterCount > 0 && (
              <span style={{
                background: 'var(--clr-accent)',
                color: '#fff',
                borderRadius: '50%',
                width: 18,
                height: 18,
                fontSize: '.65rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 4
              }}>
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="store-layout">

          {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
          <aside className="store-sidebar open">
            <SidebarContent />
          </aside>

          {/* ── Main content ─────────────────────────────────────────────── */}
          <div className="store-main">

            {/* Toolbar */}
            <div className="store-toolbar">
              <p className="store-count">
                <i className="bi bi-grid me-1" style={{ color: 'var(--clr-primary)' }}></i>
                <strong style={{ color: 'var(--clr-text)' }}>{count}</strong>
                &nbsp;product{count !== 1 ? 's' : ''} found
              </p>
              <div className="store-sort">
                <label style={{ color: 'var(--clr-text-muted)', whiteSpace: 'nowrap' }}>
                  Sort by:
                </label>
                <select
                  value={ordering}
                  onChange={e => setParam('ordering', e.target.value)}
                  className="sort-select"
                  aria-label="Sort products"
                >
                  <option value="-created_at">Newest First</option>
                  <option value="price">Price: Low → High</option>
                  <option value="-price">Price: High → Low</option>
                  <option value="-rating_avg">Best Rated</option>
                  <option value="-sold_count">Best Selling</option>
                </select>
              </div>
            </div>

            {/* Active filter chips (desktop) */}
            {activeFilterCount > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                marginBottom: 12
              }}>
                {category && (
                  <FilterChip
                    label={`Category: ${cats.find(c => c.slug === category)?.name || category}`}
                    onRemove={() => setParam('category__slug', '')}
                  />
                )}
                {brand && (
                  <FilterChip
                    label={`Brand: ${brands.find(b => b.slug === brand)?.name || brand}`}
                    onRemove={() => setParam('brand__slug', '')}
                  />
                )}
                {minPrice && (
                  <FilterChip
                    label={`Min: KES ${Number(minPrice).toLocaleString()}`}
                    onRemove={() => setParam('min_price', '')}
                  />
                )}
                {maxPrice && (
                  <FilterChip
                    label={`Max: KES ${Number(maxPrice).toLocaleString()}`}
                    onRemove={() => setParam('max_price', '')}
                  />
                )}
                <button
                  onClick={clearAllFilters}
                  style={{
                    fontSize: '.74rem',
                    fontWeight: 700,
                    color: 'var(--clr-danger)',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 'var(--r-pill)',
                    padding: '3px 10px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)'
                  }}
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Products grid */}
            {loading ? (
              <Spinner />
            ) : products.length === 0 ? (
              <div className="no-products" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                padding: '64px 20px',
                background: 'var(--clr-surface)',
                borderRadius: 'var(--r-lg)',
                border: '1px solid var(--clr-border)'
              }}>
                <i className="bi bi-search" style={{
                  fontSize: '3rem',
                  color: 'var(--clr-border)'
                }}></i>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--clr-secondary)',
                  fontSize: '1.1rem'
                }}>No products found</h3>
                <p style={{ color: 'var(--clr-text-muted)', fontSize: '.88rem' }}>
                  Try adjusting your filters or search terms
                </p>
                {activeFilterCount > 0 && (
                  <button className="btn-primary-cta" onClick={clearAllFilters}>
                    <i className="bi bi-x-circle me-2"></i>Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
                <div className="pagination-wrap">
                  <Pagination
                    page={page}
                    total={count}
                    onPageChange={p => setParam('page', p)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter overlay + drawer ──────────────────────────── */}
      <div
        className={`filter-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile sidebar slides in from right */}
      <aside
        className={`store-sidebar${sidebarOpen ? ' open' : ''}`}
        style={{ display: undefined }} // let the CSS media query control this
        aria-label="Filters"
      >
        {/* Mobile header */}
        <div className="sidebar-drawer-header-inner">
          <h5>
            <i className="bi bi-funnel me-2"></i>Filters
            {activeFilterCount > 0 && ` (${activeFilterCount})`}
          </h5>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,.85)',
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 'var(--r-sm)'
            }}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close filters"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="sidebar-filter-body">
          <SidebarContent />
        </div>

        {/* Apply button (mobile) */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--clr-border)',
          background: 'var(--clr-surface)',
          flexShrink: 0
        }}>
          <button
            className="btn-primary-cta"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setSidebarOpen(false)}
          >
            <i className="bi bi-check2 me-2"></i>
            Show {count} result{count !== 1 ? 's' : ''}
          </button>
        </div>
      </aside>
    </div>
  )
}

// ── Small reusable filter chip ────────────────────────────────────────────────
function FilterChip({ label, onRemove }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      background: 'var(--clr-primary-light)',
      border: '1px solid var(--clr-primary-mid)',
      color: 'var(--clr-primary)',
      borderRadius: 'var(--r-pill)',
      padding: '3px 10px',
      fontSize: '.74rem',
      fontWeight: 700,
      fontFamily: 'var(--font-body)'
    }}>
      {label}
      <button
        onClick={onRemove}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--clr-primary)',
          padding: 0,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center'
        }}
        aria-label={`Remove ${label} filter`}
      >
        <i className="bi bi-x" style={{ fontSize: '.85rem' }}></i>
      </button>
    </span>
  )
}