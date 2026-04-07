// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/CategoryPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { apiFetch } from '../App.jsx'
import { ProductCard } from '../components/ui/ProductCard'
import { Pagination } from '../components/ui/Pagination'
import { Spinner } from '../components/ui/Spinner'

export default function CategoryPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [count,    setCount]    = useState(0)
  const [category, setCategory] = useState(null)
  const [loading,  setLoading]  = useState(true)
  
  const page     = Number(searchParams.get('page') || 1)
  const ordering = searchParams.get('ordering') || '-created_at'

  useEffect(() => {
    apiFetch('/categories/').then(cats => {
      setCategory(cats.find(c => c.slug === slug) || null)
    }).catch(() => {})
  }, [slug])

  useEffect(() => {
    setLoading(true)
    const qs = new URLSearchParams({ 'category__slug': slug, page, ordering })
    apiFetch(`/products/?${qs}`).then(res => {
      setProducts(res.results || res)
      setCount(res.count || (res.results || res).length)
    }).finally(() => setLoading(false))
  }, [slug, page, ordering])

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    p.set(key, val)
    p.set('page', '1')
    setSearchParams(p)
  }

  return (
    <div className="category-page">
      <div className="category-hero">
        <div className="container">
          <h1 className="category-title">{category?.name || 'Category'}</h1>
          {category?.description && <p className="category-desc">{category.description}</p>}
        </div>
      </div>
      <div className="container">
        <div className="store-toolbar">
          <p className="store-count">{count} products</p>
          <select 
            value={ordering} 
            onChange={e => setParam('ordering', e.target.value)} 
            className="sort-select"
          >
            <option value="-created_at">Newest</option>
            <option value="price">Price ↑</option>
            <option value="-price">Price ↓</option>
            <option value="-rating_avg">Best Rated</option>
          </select>
        </div>
        {loading ? <Spinner /> : (
          <>
            <div className="products-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            <Pagination page={page} total={count} onPageChange={p => setParam('page', p)} />
          </>
        )}
      </div>
    </div>
  )
}