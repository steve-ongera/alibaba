// ─────────────────────────────────────────────────────────────────────────────
//  src/components/ui/Pagination.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'

export function Pagination({ page, total, pageSize = 24, onPageChange }) {
  const pages = Math.ceil(total / pageSize)
  if (pages <= 1) return null

  const getPageNumbers = () => {
    const items = []
    for (let i = 1; i <= pages; i++) {
      if (Math.abs(i - page) <= 2 || i === 1 || i === pages) {
        if (items.length > 0 && items[items.length - 1] !== '...' && i - items[items.length - 1] > 1) {
          items.push('...')
        }
        items.push(i)
      }
    }
    return items
  }

  return (
    <nav className="pagination-wrap">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(page - 1)}>&laquo;</button>
        </li>
        {getPageNumbers().map((p, i) => (
          p === '...' 
            ? <li key={`ellipsis-${i}`} className="page-item disabled"><span className="page-link">…</span></li>
            : <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                <button className="page-link" onClick={() => onPageChange(p)}>{p}</button>
              </li>
        ))}
        <li className={`page-item ${page >= pages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(page + 1)}>&raquo;</button>
        </li>
      </ul>
    </nav>
  )
}