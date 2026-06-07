'use client'

import Icon from '../ui/Icon'
import { compactINR } from '@/lib/utils'
import type { ActivityEntry } from '@/lib/types'

const TYPE_META: Record<string, { icon: string; color: string }> = {
  roi:        { icon: 'roi',         color: '#22d3ee' },
  referral:   { icon: 'income',      color: '#a78bfa' },
  investment: { icon: 'investments', color: '#34d399' },
}

const CARD: React.CSSProperties = {
  background: 'rgba(var(--surface-rgb),0.92)',
  border: '1px solid rgba(var(--veil-rgb),0.08)',
  borderRadius: 14,
  backdropFilter: 'blur(24px)',
  padding: 20,
}

export default function ActivityFeed({ entries = [] }: { entries?: ActivityEntry[] }) {
  return (
    <div style={CARD}>
      <p style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 14 }}>
        Recent Activity
      </p>
      {entries.length === 0 && (
        <p style={{ fontSize: 13, color: 'var(--dim)', textAlign: 'center', padding: '20px 0' }}>No recent activity</p>
      )}
      <div>
        {entries.map((a, i) => {
          const meta = TYPE_META[a.type] ?? TYPE_META.roi
          return (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 0',
              borderBottom: i < entries.length - 1 ? '1px solid rgba(var(--veil-rgb),0.05)' : 'none',
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: `${meta.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={meta.icon as any} size={15} color={meta.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.label}
                </p>
                <p style={{ fontSize: 11, color: 'var(--dim)', marginTop: 1 }}>{a.time}</p>
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: meta.color, fontFamily: 'var(--font-jetbrains-mono), monospace', flexShrink: 0 }}>
                +{compactINR(a.amount)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
