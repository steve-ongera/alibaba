// ─────────────────────────────────────────────────────────────────────────────
//  src/components/ui/SectionHeader.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { Link } from 'react-router-dom'

export function SectionHeader({ title, subtitle, link, linkText = 'See All' }) {
  return (
    <div className="section-header">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {link && <Link to={link} className="section-see-all">{linkText} <i className="bi bi-arrow-right"></i></Link>}
    </div>
  )
}