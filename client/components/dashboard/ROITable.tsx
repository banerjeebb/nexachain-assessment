'use client'

import type { ROIHistory, ROIPagination } from '@/lib/types'
import { formatINR, formatDate } from '@/lib/utils'

const CARD_STYLE: React.CSSProperties = {
  background: 'rgba(var(--surface-rgb),0.92)',
  border: '1px solid rgba(var(--veil-rgb),0.08)',
  borderRadius: 14,
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
}

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  credited: { bg: 'rgba(52,211,153,0.12)',  text: '#34d399' },
  pending:  { bg: 'rgba(231,184,74,0.12)',  text: '#e7b84a' },
  failed:   { bg: 'rgba(251,113,133,0.12)', text: '#fb7185' },
}

const PLAN_COLOR: Record<string, string> = {
  Starter: '#34d399',
  Growth:  '#22d3ee',
  Elite:   '#a78bfa',
}

interface Props {
  history: ROIHistory[]
  pagination: ROIPagination
  onPageChange: (page: number) => void
}

export default function ROITable({ history, pagination, onPageChange }: Props) {
  return (
    <div style={{ ...CARD_STYLE, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(var(--veil-rgb),0.06)' }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>ROI History</h3>
        <span style={{ fontSize: 12, color: 'var(--dim)' }}>{pagination.total} records</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(var(--veil-rgb),0.06)' }}>
              {['Date', 'Plan', 'Invested Amount', 'ROI Earned', 'Status'].map(h => (
                <th key={h} style={{
                  padding: '12px 24px', textAlign: 'left',
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'var(--dim)', whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--dim)', fontSize: 13 }}>No ROI records yet</td></tr>
            )}
            {history.map((row, idx) => {
              const st  = STATUS_COLOR[row.status] ?? STATUS_COLOR.credited
              const inv = row.investmentId  // populated object from API
              const planName = inv?.planName ?? '—'
              const pc  = PLAN_COLOR[planName] ?? 'var(--accent)'
              return (
                <tr key={row._id} style={{
                  borderBottom: idx < history.length - 1 ? '1px solid rgba(var(--veil-rgb),0.04)' : 'none',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(var(--veil-rgb),0.025)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <td style={{ padding: '14px 24px', fontSize: 12, color: 'var(--dim)' }}>
                    {formatDate(row.date)}
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: pc,
                      background: `${pc}18`, borderRadius: 6, padding: '3px 10px',
                    }}>{planName}</span>
                  </td>
                  <td style={{ padding: '14px 24px', fontFamily: 'var(--font-space-grotesk)', fontSize: 14, fontWeight: 600, color: 'var(--text-2)' }}>
                    {inv?.amount ? formatINR(inv.amount) : '—'}
                  </td>
                  <td style={{ padding: '14px 24px', fontFamily: 'var(--font-space-grotesk)', fontSize: 14, fontWeight: 700, color: '#34d399' }}>
                    +{formatINR(row.amount)}
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{
                      background: st.bg, color: st.text,
                      borderRadius: 6, padding: '4px 10px',
                      fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
                    }}>{row.status}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(var(--veil-rgb),0.06)' }}>
          <span style={{ fontSize: 12, color: 'var(--dim)' }}>Page {pagination.page} of {pagination.pages}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {[...Array(pagination.pages)].map((_, i) => (
              <button key={i} onClick={() => onPageChange(i + 1)} style={{
                width: 30, height: 30, borderRadius: 8,
                background: pagination.page === i + 1 ? 'var(--accent)' : 'rgba(var(--veil-rgb),0.05)',
                border: 'none', cursor: 'pointer',
                color: pagination.page === i + 1 ? '#fff' : 'var(--dim)',
                fontSize: 12, fontWeight: 600,
              }}>{i + 1}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
