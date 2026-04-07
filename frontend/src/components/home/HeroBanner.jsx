// ─────────────────────────────────────────────────────────────────────────────
//  src/components/home/HeroBanner.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'

export function HeroBanner({ banners }) {
  if (!banners || banners.length === 0) return null

  return (
    <div id="heroBannerCarousel" className="carousel slide hero-carousel" data-bs-ride="carousel">
      <div className="carousel-indicators">
        {banners.map((_, i) => (
          <button key={i} type="button" data-bs-target="#heroBannerCarousel"
            data-bs-slide-to={i} className={i === 0 ? 'active' : ''} aria-label={`Slide ${i + 1}`}></button>
        ))}
      </div>
      <div className="carousel-inner">
        {banners.map((b, i) => (
          <div key={b.id} className={`carousel-item ${i === 0 ? 'active' : ''}`}>
            <a href={b.link || '#'}>
              <img src={b.image} className="hero-banner-img" alt={b.title} />
            </a>
            <div className="carousel-caption d-none d-md-block banner-caption">
              <h2>{b.title}</h2>
              <p>{b.subtitle}</p>
              {b.link && <a href={b.link} className="btn-hero">Shop Now <i className="bi bi-arrow-right"></i></a>}
            </div>
          </div>
        ))}
      </div>
      <button className="carousel-control-prev" type="button" data-bs-target="#heroBannerCarousel" data-bs-slide="prev">
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#heroBannerCarousel" data-bs-slide="next">
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  )
}