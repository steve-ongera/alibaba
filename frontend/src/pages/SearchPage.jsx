// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/SearchPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiFetch } from '../App.jsx'
import { ProductCard } from '../components/ui/ProductCard'
import { Pagination } from '../components/ui/Pagination'
import { Spinner } from '../components/ui/Spinner'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query    = searchParams.get('q') || ''
  const page     = Number(searchParams.get('page') || 1)
  const [results, setResults]  = useState([])
  const [count,   setCount]    = useState(0)
  const [loading, setLoading]  = useState(false)

  useEffect(() => {
    if (!query) return
    setLoading(true)
    apiFetch(`/products/?search=${encodeURIComponent(query)}&page=${page}`).then(res => {
      setResults(res.results || res)
      setCount(res.count || (res.results || res).length)
    }).finally(() => setLoading(false))
  }, [query, page])

  const setPage = (p) => {
    const sp = new URLSearchParams(searchParams)
    sp.set('page', p)
    setSearchParams(sp)
  }

  return (
    <div className="search-page">
      <div className="container">
        <h1 className="page-title">
          Results for "<em>{query}</em>" <span>({count} found)</span>
        </h1>
        {loading ? <Spinner /> : (
          <>
            <div className="products-grid">
              {results.map(p => <ProductCard key={p.id} product={p} />)}
              {results.length === 0 && <p className="no-products">No products match your search.</p>}
            </div>
            <Pagination page={page} total={count} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}