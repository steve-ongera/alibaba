// ─────────────────────────────────────────────────────────────────────────────
//  src/components/layout/Footer.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="footer-brand">
                <span className="logo-ali">alibaba</span><span className="logo-kenya">KENYA</span>
              </div>
              <p className="footer-tagline">Kenya's trusted online marketplace. Millions of products, guaranteed quality.</p>
              <div className="social-links">
                <a href="#" className="social-link"><i className="bi bi-facebook"></i></a>
                <a href="#" className="social-link"><i className="bi bi-twitter-x"></i></a>
                <a href="#" className="social-link"><i className="bi bi-instagram"></i></a>
                <a href="#" className="social-link"><i className="bi bi-tiktok"></i></a>
                <a href="#" className="social-link"><i className="bi bi-youtube"></i></a>
              </div>
            </div>

            <div className="col-lg-2 col-md-6">
              <h6 className="footer-heading">Shop</h6>
              <ul className="footer-links">
                <li><a href="#">Electronics</a></li>
                <li><a href="#">Fashion</a></li>
                <li><a href="#">Home & Living</a></li>
                <li><a href="#">Beauty</a></li>
                <li><a href="#">Sports</a></li>
                <li><a href="#">Groceries</a></li>
              </ul>
            </div>

            <div className="col-lg-2 col-md-6">
              <h6 className="footer-heading">Help</h6>
              <ul className="footer-links">
                <li><a href="#">FAQs</a></li>
                <li><a href="#">Track Order</a></li>
                <li><a href="#">Returns & Refunds</a></li>
                <li><a href="#">Delivery Info</a></li>
                <li><a href="#">Contact Us</a></li>
              </ul>
            </div>

            <div className="col-lg-2 col-md-6">
              <h6 className="footer-heading">Account</h6>
              <ul className="footer-links">
                <li><a href="#">Login</a></li>
                <li><a href="#">Register</a></li>
                <li><a href="#">My Orders</a></li>
                <li><a href="#">Wishlist</a></li>
                <li><a href="#">Seller Portal</a></li>
              </ul>
            </div>

            <div className="col-lg-3 col-md-6">
              <h6 className="footer-heading">Payment Methods</h6>
              <div className="payment-badges">
                <span className="pay-badge"><i className="bi bi-phone"></i> M-Pesa</span>
                <span className="pay-badge"><i className="bi bi-credit-card"></i> Visa</span>
                <span className="pay-badge"><i className="bi bi-credit-card-2-front"></i> Mastercard</span>
              </div>
              <h6 className="footer-heading mt-3">Newsletter</h6>
              <div className="footer-newsletter">
                <input type="email" placeholder="Your email" className="newsletter-input" />
                <button className="newsletter-btn">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <span>© {new Date().getFullYear()} Alibaba Kenya. All rights reserved.</span>
          <span><a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a></span>
        </div>
      </div>
    </footer>
  )
}