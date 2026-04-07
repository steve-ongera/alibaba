// ─────────────────────────────────────────────────────────────────────────────
//  src/components/ui/Toast.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'

export function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast-item ${t.type === 'error' ? 'toast-error' : ''}`}>
          <i className={`bi bi-${t.type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'} me-2`}></i>
          {t.message}
        </div>
      ))}
    </div>
  )
}