'use client'

import { avFor, compactINR, initials } from '@/lib/utils'
import { MOCK_LEADERBOARD } from '@/lib/mock'

const MEDALS = ['🥇', '🥈', '🥉']

const CARD_STYLE: React.CSSProperties = {
  background: 'rgba(var(--surface-rgb),0.92)',
  border: '1px solid rgba(var(--veil-rgb),0.08)',
  borderRadius: 14,
  backdropFilter: 'blur(24px)',
  padding: 20,
}

export default function Leaderboard() {
  return (
    <div style={CARD_STYLE}>
      <p style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 16 }}>
        Leaderboard
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {MOCK_LEADERBOARD.map((entry) => (
          <div key={entry.rank} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16, minWidth: 24, textAlign: 'center' }}>
              {MEDALS[entry.rank - 1] ?? `#${entry.rank}`}
            </span>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: avFor(entry.fullName),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff',
            }}>
              {initials(entry.fullName)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.fullName}
              </p>
              <p style={{ fontSize: 11, color: 'var(--dim)' }}>{entry.totalReferrals} referrals</p>
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--pos)', fontFamily: 'var(--font-jetbrains-mono), monospace', flexShrink: 0 }}>
              {compactINR(entry.totalEarned)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
