'use client'

import { formatDate } from '@/lib/utils'
import type { DirectReferral } from '@/lib/types'

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  active:    { bg: 'rgba(52,211,153,0.12)',  text: '#34d399' },
  inactive:  { bg: 'rgba(231,184,74,0.12)',  text: '#e7b84a' },
  suspended: { bg: 'rgba(251,113,133,0.12)', text: '#fb7185' },
}

export default function DirectReferralsTable({ referrals = [] }: { referrals?: DirectReferral[] }) {
  if (referrals.length === 0) return (
    <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--dim)', fontSize: 13 }}>
      No direct referrals yet — share your link to start earning!
    </div>
  )

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(var(--veil-rgb),0.06)' }}>
            {['Member', 'Referral Code', 'Joined', 'Status'].map(h => (
              <th key={h} style={{
                padding: '12px 24px', textAlign: 'left',
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--dim)', whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {referrals.map((ref, idx) => {
            const st = STATUS_COLOR[ref.accountStatus] ?? STATUS_COLOR.inactive
            return (
              <tr key={ref._id} style={{
                borderBottom: idx < referrals.length - 1 ? '1px solid rgba(var(--veil-rgb),0.04)' : 'none',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(var(--veil-rgb),0.025)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                <td style={{ padding: '14px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'rgba(167,139,250,0.18)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: '#a78bfa',
                    }}>
                      {ref.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{ref.fullName}</p>
                      <p style={{ margin: 0, fontSize: 11, color: 'var(--dim)' }}>{ref.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 24px' }}>
                  <span style={{
                    fontFamily: 'var(--font-jetbrains-mono), monospace',
                    fontSize: 12, color: '#22d3ee',
                    background: 'rgba(34,211,238,0.08)', borderRadius: 6, padding: '3px 8px',
                  }}>{ref.referralCode}</span>
                </td>
                <td style={{ padding: '14px 24px', fontSize: 12, color: 'var(--dim)' }}>
                  {formatDate(ref.createdAt)}
                </td>
                <td style={{ padding: '14px 24px' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: st.text,
                    background: st.bg, borderRadius: 6, padding: '4px 10px', textTransform: 'capitalize',
                  }}>
                    {ref.accountStatus}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
