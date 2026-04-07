// ─────────────────────────────────────────────────────────────────────────────
//  src/pages/NotFoundPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="notfound-page">
      <h1 className="notfound-code">404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary-cta">Go Home</Link>
    </div>
  )
}