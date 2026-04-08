// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/StorePage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiFetch } from '../App.jsx'
import { ProductCard } from '../components/ui/ProductCard'
import { Pagination } from '../components/ui/Pagination'
import { Spinner } from '../components/ui/Spinner'

const toArray = (data) => {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (Array.isArray(data.results)) return data.results
  return []
}

// ── Shared style objects ──────────────────────────────────────────────────────
const S = {
  sidebarSection: {
    marginBottom: 20,
  },
  sidebarHeading: {
    fontFamily: 'var(--font-display)',
    fontSize: '.76rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'var(--clr-secondary)',
    marginBottom: 10,
    paddingBottom: 7,
    borderBottom: '1.5px solid var(--clr-border)',
    display: 'block',
  },
  sidebarCheck: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 7,
    cursor: 'pointer',
  },
  sidebarRadio: {
    accentColor: 'var(--clr-primary)',
    width: 14,
    height: 14,
    cursor: 'pointer',
    flexShrink: 0,
  },
  sidebarLabel: {
    fontSize: '.83rem',
    color: 'var(--clr-text-sub)',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    margin: 0,
  },
  priceRangeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  priceInput: {
    flex: 1,
    minWidth: 0,
    border: '1.5px solid var(--clr-border)',
    borderRadius: 'var(--r-sm)',
    padding: '6px 8px',
    fontSize: '.82rem',
    outline: 'none',
    fontFamily: 'var(--font-body)',
    color: 'var(--clr-text)',
    background: 'var(--clr-surface)',
  },
  clearBtn: {
    fontSize: '.75rem',
    color: 'var(--clr-primary)',
    fontWeight: 700,
    padding: 0,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    display: 'inline-block',
  },
  activeFilterBox: {
    background: 'var(--clr-primary-light)',
    borderRadius: 'var(--r-sm)',
    padding: '10px 12px',
    marginBottom: 16,
    border: '1px solid var(--clr-primary-mid)',
  },
  activeFilterRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeFilterLabel: {
    fontSize: '.78rem',
    fontWeight: 700,
    color: 'var(--clr-primary)',
    fontFamily: 'var(--font-body)',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
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

  useEffect(() => {
    apiFetch('/brands/')
      .then(data => setBrands(toArray(data)))
      .catch(() => setBrands([]))
    apiFetch('/categories/')
      .then(data => setCats(toArray(data)))
      .catch(() => setCats([]))
  }, [])

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
      .catch(() => { setProducts([]); setCount(0) })
      .finally(() => setLoading(false))
  }, [searchParams])

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val); else p.delete(key)
    p.set('page', '1')
    setSearchParams(p)
  }

  const clearAllFilters = () => setSearchParams({ page: '1', ordering })

  const activeFilterCount = [brand, category, minPrice, maxPrice].filter(Boolean).length

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  // ── Fully self-contained sidebar filter UI ────────────────────────────────
  const SidebarContent = () => (
    <div style={{ padding: '4px 0' }}>

      {/* Active filters summary */}
      {activeFilterCount > 0 && (
        <div style={S.activeFilterBox}>
          <div style={S.activeFilterRow}>
            <span style={S.activeFilterLabel}>
              <i className="bi bi-funnel-fill" style={{ fontSize: '.78rem' }}></i>
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
            </span>
            <button style={S.clearBtn} onClick={clearAllFilters}>
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Categories */}
      <div style={S.sidebarSection}>
        <span style={S.sidebarHeading}>Categories</span>

        <label style={S.sidebarCheck}>
          <input
            type="radio"
            name="cat"
            style={S.sidebarRadio}
            checked={!category}
            onChange={() => setParam('category__slug', '')}
          />
          <span style={S.sidebarLabel}>All Categories</span>
        </label>

        {cats.map(c => (
          <label key={c.id} style={S.sidebarCheck}>
            <input
              type="radio"
              name="cat"
              style={S.sidebarRadio}
              checked={category === c.slug}
              onChange={() => setParam('category__slug', c.slug)}
            />
            <span style={S.sidebarLabel}>{c.name}</span>
          </label>
        ))}
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div style={S.sidebarSection}>
          <span style={S.sidebarHeading}>Brands</span>

          <label style={S.sidebarCheck}>
            <input
              type="radio"
              name="brand"
              style={S.sidebarRadio}
              checked={!brand}
              onChange={() => setParam('brand__slug', '')}
            />
            <span style={S.sidebarLabel}>All Brands</span>
          </label>

          {brands.map(b => (
            <label key={b.id} style={S.sidebarCheck}>
              <input
                type="radio"
                name="brand"
                style={S.sidebarRadio}
                checked={brand === b.slug}
                onChange={() => setParam('brand__slug', b.slug)}
              />
              <span style={S.sidebarLabel}>{b.name}</span>
            </label>
          ))}
        </div>
      )}

      {/* Price Range */}
      <div style={{ ...S.sidebarSection, marginBottom: 0 }}>
        <span style={S.sidebarHeading}>Price Range (KES)</span>

        <div style={S.priceRangeRow}>
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            min={0}
            onChange={e => setParam('min_price', e.target.value)}
            style={S.priceInput}
          />
          <span style={{
            color: 'var(--clr-text-muted)',
            flexShrink: 0,
            fontFamily: 'var(--font-body)',
            fontSize: '.82rem',
          }}>–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            min={0}
            onChange={e => setParam('max_price', e.target.value)}
            style={S.priceInput}
          />
        </div>

        {(minPrice || maxPrice) && (
          <button
            style={{ ...S.clearBtn, marginTop: 8 }}
            onClick={() => { setParam('min_price', ''); setParam('max_price', '') }}
          >
            Clear price
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="store-page">
      <div className="container">

        {/* Page title row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 0 8px',
          flexWrap: 'wrap',
          gap: 8,
        }}>
          <h1 className="page-title" style={{ margin: 0, padding: 0 }}>
            {category
              ? cats.find(c => c.slug === category)?.name || 'Products'
              : 'All Products'}
            {' '}
            <span>{count > 0 ? `${count} items` : ''}</span>
          </h1>

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
                fontFamily: 'var(--font-display)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 4,
                lineHeight: 1,
                flexShrink: 0,
              }}>
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="store-layout">

          {/* Desktop Sidebar */}
          <aside
            className="store-sidebar open"
            style={{
              background: 'var(--clr-surface)',
              borderRadius: 'var(--r-md)',
              border: '1px solid var(--clr-border)',
              padding: 16,
            }}
          >
            <SidebarContent />
          </aside>

          {/* Main content */}
          <div className="store-main">

            {/* Toolbar */}
            <div className="store-toolbar">
              <p className="store-count">
                <i className="bi bi-grid me-1" style={{ color: 'var(--clr-primary)' }}></i>
                <strong style={{ color: 'var(--clr-text)', fontFamily: 'var(--font-display)' }}>
                  {count}
                </strong>
                &nbsp;product{count !== 1 ? 's' : ''} found
              </p>
              <div className="store-sort">
                <label style={{
                  color: 'var(--clr-text-muted)',
                  whiteSpace: 'nowrap',
                  fontSize: '.82rem',
                  fontFamily: 'var(--font-body)',
                }}>
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

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
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
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Products */}
            {loading ? (
              <Spinner />
            ) : products.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                padding: '64px 20px',
                background: 'var(--clr-surface)',
                borderRadius: 'var(--r-lg)',
                border: '1px solid var(--clr-border)',
                textAlign: 'center',
              }}>
                <i className="bi bi-search" style={{ fontSize: '3rem', color: 'var(--clr-border)', lineHeight: 1 }}></i>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--clr-secondary)',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  margin: 0,
                }}>No products found</h3>
                <p style={{ color: 'var(--clr-text-muted)', fontSize: '.88rem', margin: 0, fontFamily: 'var(--font-body)' }}>
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
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
                <div className="pagination-wrap">
                  <Pagination page={page} total={count} onPageChange={p => setParam('page', p)} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      <div
        className={`filter-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile sidebar drawer */}
      <aside
        className={`store-sidebar${sidebarOpen ? ' open' : ''}`}
        aria-label="Filters"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {/* Drawer header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: 'var(--clr-primary)',
          flexShrink: 0,
        }}>
          <h5 style={{
            color: '#fff',
            fontFamily: 'var(--font-display)',
            fontSize: '.95rem',
            fontWeight: 700,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <i className="bi bi-funnel"></i>
            Filters
            {activeFilterCount > 0 && (
              <span style={{
                background: 'rgba(255,255,255,.2)',
                borderRadius: 'var(--r-pill)',
                padding: '1px 8px',
                fontSize: '.72rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
              }}>
                {activeFilterCount}
              </span>
            )}
          </h5>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close filters"
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,.85)',
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 'var(--r-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Drawer body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          <SidebarContent />
        </div>

        {/* Apply button */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--clr-border)',
          background: 'var(--clr-surface)',
          flexShrink: 0,
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

// ── Filter chip ───────────────────────────────────────────────────────────────
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
      fontFamily: 'var(--font-body)',
    }}>
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--clr-primary)',
          padding: 0,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <i className="bi bi-x" style={{ fontSize: '.85rem' }}></i>
      </button>
    </span>
  )
}