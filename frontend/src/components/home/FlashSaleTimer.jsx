// ─────────────────────────────────────────────────────────────────────────────
//  src/components/home/FlashSaleTimer.jsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react'

export function FlashSaleTimer({ endTime }) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 })

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(endTime) - Date.now())
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endTime])

  const pad = n => String(n).padStart(2, '0')

  return (
    <div className="flash-timer">
      <div className="timer-block">{pad(time.h)}<small>hrs</small></div>
      <span className="timer-sep">:</span>
      <div className="timer-block">{pad(time.m)}<small>min</small></div>
      <span className="timer-sep">:</span>
      <div className="timer-block">{pad(time.s)}<small>sec</small></div>
    </div>
  )
}