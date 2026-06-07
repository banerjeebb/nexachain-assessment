'use client'

import { useEffect, useState } from 'react'

const TIPS = [
  'Reinvest your daily ROI to compound returns over time.',
  'Diversify across plans — Starter, Growth, and Elite — to balance risk and reward.',
  'Your Level 1 referrals earn you 5% of every investment they make.',
  'Consistent daily ROI compounds significantly over a 90-day Elite plan.',
  'Referring active investors multiplies your passive income across 5 levels.',
  'A ₹1 lakh Elite plan yields ₹1,080/day — before any referral income.',
  'Check ROI History daily to track your portfolio performance streak.',
  'The longer the plan duration, the higher the daily ROI percentage.',
  'Level income flows automatically — no action needed once referrals invest.',
  'Small, regular investments in Starter plans build consistent daily cashflow.',
]

const INTERVAL = 5000

export default function TipOfDay() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % TIPS.length)
        setVisible(true)
      }, 350)
    }, INTERVAL)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{
      margin: '0 8px',
      padding: '12px 12px',
      borderRadius: 10,
      background: 'rgba(var(--veil-rgb),0.025)',
      border: '1px solid rgba(var(--veil-rgb),0.05)',
    }}>
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'rgba(167,139,250,0.4)',
          fontFamily: 'var(--font-inter), sans-serif',
        }}>
          Tip
        </span>
      </div>

      {/* Tip text */}
      <p style={{
        margin: 0,
        fontSize: 11,
        lineHeight: 1.55,
        color: 'rgba(183,187,204,0.45)',
        fontFamily: 'var(--font-inter), sans-serif',
        fontWeight: 400,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.35s ease',
      }}>
        {TIPS[idx]}
      </p>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 3, marginTop: 9, justifyContent: 'center' }}>
        {TIPS.map((_, i) => (
          <div key={i} style={{
            width: i === idx ? 12 : 3,
            height: 3,
            borderRadius: 99,
            background: i === idx ? 'rgba(167,139,250,0.35)' : 'rgba(var(--veil-rgb),0.08)',
            transition: 'all 0.35s ease',
          }} />
        ))}
      </div>
    </div>
  )
}
