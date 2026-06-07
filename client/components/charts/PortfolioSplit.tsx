'use client'

import { MOCK_INVESTMENTS } from '@/lib/mock'
import { compactINR } from '@/lib/utils'

const COLORS = ['#a78bfa', '#22d3ee', '#34d399', '#e7b84a', '#fb7185']

const CARD: React.CSSProperties = {
  background: 'rgba(var(--surface-rgb),0.92)',
  border: '1px solid rgba(var(--veil-rgb),0.08)',
  borderRadius: 14,
  backdropFilter: 'blur(24px)',
  padding: 20,
}

export default function PortfolioSplit() {
  const active = MOCK_INVESTMENTS.filter((i) => i.status === 'active')
  const total = active.reduce((s, i) => s + i.amount, 0)
  const segments = active.map((inv, idx) => ({
    name: inv.planName, amount: inv.amount,
    pct: total > 0 ? (inv.amount / total) * 100 : 0,
    color: COLORS[idx % COLORS.length],
  }))

  return (
    <div style={CARD}>
      <p style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 16 }}>
        Portfolio Split
      </p>

      {/* Segmented bar */}
      <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', height: 8, marginBottom: 18, background: 'rgba(var(--veil-rgb),0.06)' }}>
        {segments.map((s) => (
          <div key={s.name} style={{ width: `${s.pct}%`, background: s.color, transition: 'width 0.5s ease' }} />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {segments.map((s) => (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, color: 'var(--text-2)' }}>{s.name} Plan</span>
            <span style={{ fontSize: 11, color: 'var(--dim)', minWidth: 30, textAlign: 'right' }}>{s.pct.toFixed(0)}%</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: s.color, fontFamily: 'var(--font-jetbrains-mono), monospace', minWidth: 52, textAlign: 'right' }}>
              {compactINR(s.amount)}
            </span>
          </div>
        ))}
        {segments.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--dim)' }}>No active investments</p>
        )}
      </div>

      {total > 0 && (
        <div style={{
          marginTop: 14, paddingTop: 12,
          borderTop: '1px solid rgba(var(--veil-rgb),0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: 'var(--dim)' }}>Total Active</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
            {compactINR(total)}
          </span>
        </div>
      )}
    </div>
  )
}
