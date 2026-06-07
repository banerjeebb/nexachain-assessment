'use client'

import { formatINR, formatDate } from '@/lib/utils'
import type { ReferralIncome, IncomePagination } from '@/lib/types'

const LEVEL_COLOR = ['#34d399', '#22d3ee', '#a78bfa', '#e7b84a', '#fb7185']

interface Props {
  income: ReferralIncome[]
  pagination: IncomePagination
  onPageChange: (page: number) => void
}

export default function LevelIncomeTable({ income, pagination, onPageChange }: Props) {
  if (income.length === 0) return (
    <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--dim)', fontSize: 13 }}>
      No level income yet — your referrals haven&apos;t invested yet.
    </div>
  )

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(var(--veil-rgb),0.06)' }}>
              {['Date', 'From Member', 'Code', 'Level', 'Income'].map(h => (
                <th key={h} style={{
                  padding: '12px 24px', textAlign: 'left',
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'var(--dim)', whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {income.map((row, idx) => {
              const c = LEVEL_COLOR[(row.level - 1) % 5]
              const gen = row.generatorId
              return (
                <tr key={row._id} style={{
                  borderBottom: idx < income.length - 1 ? '1px solid rgba(var(--veil-rgb),0.04)' : 'none',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(var(--veil-rgb),0.025)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <td style={{ padding: '14px 24px', fontSize: 12, color: 'var(--dim)' }}>
                    {formatDate(row.date)}
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                    {gen?.fullName ?? '—'}
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{
                      fontFamily: 'var(--font-jetbrains-mono), monospace',
                      fontSize: 11, color: '#22d3ee',
                      background: 'rgba(34,211,238,0.08)', borderRadius: 6, padding: '2px 7px',
                    }}>{gen?.referralCode ?? '—'}</span>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: c,
                      background: `${c}18`, borderRadius: 6, padding: '3px 9px',
                    }}>L{row.level}</span>
                  </td>
                  <td style={{ padding: '14px 24px', fontFamily: 'var(--font-space-grotesk)', fontSize: 14, fontWeight: 700, color: '#34d399' }}>
                    +{formatINR(row.amount)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(var(--veil-rgb),0.06)' }}>
          <span style={{ fontSize: 12, color: 'var(--dim)' }}>
            Page {pagination.page} of {pagination.pages} · {pagination.total} records
          </span>
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
