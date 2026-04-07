// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/StorePage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiFetch } from '../App.jsx'
import { ProductCard } from '../components/ui/ProductCard'
import { Pagination } from '../components/ui/Pagination'
import { Spinner } from '../components/ui/Spinner'

export default function StorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [count,    setCount]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [brands,   setBrands]   = useState([])
  const [cats,     setCats]     = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
        {/* Mobile filter toggle */}
        <button 
          className="filter-toggle-btn" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <i className="bi bi-filters"></i> Filters
        </button>

        <div className="store-layout">
          {/* Sidebar */}
          <aside className={`store-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-section">
              <h5 className="sidebar-heading">Categories</h5>
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
              {category && (
                <button className="btn-clear-filter" onClick={() => setParam('category__slug', '')}>
                  Clear
                </button>
              )}
            </div>

            <div className="sidebar-section">
              <h5 className="sidebar-heading">Brands</h5>
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

            <div className="sidebar-section">
              <h5 className="sidebar-heading">Price Range (KES)</h5>
              <div className="price-range-inputs">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minPrice}
                  onChange={e => setParam('min_price', e.target.value)} 
                  className="price-input" 
                />
                <span>–</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPrice}
                  onChange={e => setParam('max_price', e.target.value)} 
                  className="price-input" 
                />
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="store-main">
            <div className="store-toolbar">
              <p className="store-count">{count} products found</p>
              <div className="store-sort">
                <label>Sort: </label>
                <select 
                  value={ordering} 
                  onChange={e => setParam('ordering', e.target.value)} 
                  className="sort-select"
                >
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