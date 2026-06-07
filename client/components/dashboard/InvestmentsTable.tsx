'use client'

import { useState } from 'react'
import type { Investment } from '@/lib/mock'
import { formatINR, formatDate } from '@/lib/utils'

const CARD_STYLE: React.CSSProperties = {
  background: 'rgba(var(--surface-rgb),0.92)',
  border: '1px solid rgba(var(--veil-rgb),0.08)',
  borderRadius: 14,
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
}

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  active:    { bg: 'rgba(52,211,153,0.12)',  text: '#34d399' },
  completed: { bg: 'rgba(167,139,250,0.12)', text: '#a78bfa' },
  cancelled: { bg: 'rgba(251,113,133,0.12)', text: '#fb7185' },
}

const PLAN_COLOR: Record<string, string> = {
  Starter: '#34d399',
  Growth:  '#22d3ee',
  Elite:   '#a78bfa',
}

const PAGE_SIZE = 5

interface Props { investments: Investment[] }

export default function InvestmentsTable({ investments }: Props) {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')

  const filtered = filter === 'all' ? investments : investments.filter(i => i.status === filter)
  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const slice  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const TABS = [
    { id: 'all',       label: 'All',       count: investments.length },
    { id: 'active',    label: 'Active',    count: investments.filter(i => i.status === 'active').length },
    { id: 'completed', label: 'Completed', count: investments.filter(i => i.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: investments.filter(i => i.status === 'cancelled').length },
  ] as const

  return (
    <div style={{ ...CARD_STYLE, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Investment History</h3>
        <span style={{ fontSize: 12, color: 'var(--dim)' }}>{total} records</span>
      </div>

      {/* Filter tabs */}
      <div style={{ padding: '0 24px', display: 'flex', gap: 0, borderBottom: '1px solid rgba(var(--veil-rgb),0.06)', marginTop: 16 }}>
        {TABS.map(t => {
          const active = filter === t.id
          return (
            <button key={t.id} onClick={() => { setFilter(t.id); setPage(1) }} style={{
              padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
              color: active ? 'var(--accent)' : 'var(--dim)',
              fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-inter), sans-serif',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {t.label}
              <span style={{
                background: active ? 'rgba(167,139,250,0.2)' : 'rgba(var(--veil-rgb),0.06)',
                color: active ? 'var(--accent)' : 'var(--faint)',
                borderRadius: 20, padding: '1px 6px', fontSize: 10, fontWeight: 700,
              }}>{t.count}</span>
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(var(--veil-rgb),0.06)' }}>
              {['Plan', 'Amount', 'Daily ROI', 'Duration', 'Started', 'Matures', 'Status'].map(h => (
                <th key={h} style={{
                  padding: '12px 24px', textAlign: 'left',
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'var(--dim)', whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((inv, idx) => {
              const st = STATUS_COLOR[inv.status]
              const pc = PLAN_COLOR[inv.planName] ?? 'var(--accent)'
              return (
                <tr key={inv._id} style={{
                  borderBottom: idx < slice.length - 1 ? '1px solid rgba(var(--veil-rgb),0.04)' : 'none',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(var(--veil-rgb),0.025)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: pc,
                      background: `${pc}18`, borderRadius: 6, padding: '3px 10px',
                    }}>{inv.planName}</span>
                  </td>
                  <td style={{ padding: '14px 24px', fontFamily: 'var(--font-space-grotesk)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                    {formatINR(inv.amount)}
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: 13, fontWeight: 600, color: '#34d399' }}>
                    {inv.dailyROIPercent}% / day
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: 13, color: 'var(--text-2)' }}>
                    {inv.planDurationDays}d
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: 12, color: 'var(--dim)' }}>
                    {formatDate(inv.startDate)}
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: 12, color: 'var(--dim)' }}>
                    {formatDate(inv.endDate)}
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{
                      background: st.bg, color: st.text,
                      borderRadius: 6, padding: '4px 10px',
                      fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
                    }}>{inv.status}</span>
                  </td>
                </tr>
              )
            })}
            {slice.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--dim)', fontSize: 13 }}>
                  No investments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(var(--veil-rgb),0.06)' }}>
          <span style={{ fontSize: 12, color: 'var(--dim)' }}>
            Page {page} of {pages}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {[...Array(pages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} style={{
                width: 30, height: 30, borderRadius: 8,
                background: page === i + 1 ? 'var(--accent)' : 'rgba(var(--veil-rgb),0.05)',
                border: 'none', cursor: 'pointer',
                color: page === i + 1 ? '#fff' : 'var(--dim)',
                fontSize: 12, fontWeight: 600,
              }}>{i + 1}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
