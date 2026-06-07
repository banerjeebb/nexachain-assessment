'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatINR, compactINR } from '@/lib/utils'
import type { Investment } from '@/lib/types'

const PLAN_COLORS: Record<string, string> = {
  Starter:   '#34d399',
  Growth:    '#22d3ee',
  Elite:     '#a78bfa',
  Cancelled: '#fb7185',
}

const CARD: React.CSSProperties = {
  background: 'rgba(var(--surface-rgb),0.92)',
  border: '1px solid rgba(var(--veil-rgb),0.08)',
  borderRadius: 14,
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  padding: 24,
}

interface TooltipPayload {
  payload: { name: string; value: number; color: string }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: 'rgba(var(--surface-rgb),0.98)',
      border: '1px solid rgba(var(--veil-rgb),0.1)',
      borderRadius: 10, padding: '10px 14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: d.color }}>{d.name} Plan</p>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-space-grotesk)' }}>
        {formatINR(d.value)}
      </p>
    </div>
  )
}

export default function PortfolioPie({ investments = [] }: { investments?: Investment[] }) {
  const active = investments.filter(i => i.status === 'active')
  const total  = active.reduce((s, i) => s + i.amount, 0)

  // Merge same plan names
  const planMap: Record<string, number> = {}
  for (const inv of active) {
    planMap[inv.planName] = (planMap[inv.planName] ?? 0) + inv.amount
  }
  const data = Object.entries(planMap).map(([name, value]) => ({ name, value }))

  if (data.length === 0) {
    return (
      <div style={{ ...CARD, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 280 }}>
        <p style={{ color: 'var(--dim)', fontSize: 14 }}>No active investments</p>
      </div>
    )
  }

  return (
    <div style={CARD}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, fontSize: 15, color: 'var(--text)', margin: 0 }}>
          Portfolio Allocation
        </p>
        <p style={{ fontSize: 12, color: 'var(--dim)', marginTop: 4 }}>Active investment distribution</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        {/* Pie */}
        <div style={{ position: 'relative', flexShrink: 0, width: 180, height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={82}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
                animationBegin={0}
                animationDuration={700}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={PLAN_COLORS[entry.name] ?? '#888'}
                    opacity={0.92}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center', pointerEvents: 'none',
          }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: 0, fontFamily: 'var(--font-space-grotesk)', letterSpacing: '-0.02em' }}>
              {compactINR(total)}
            </p>
            <p style={{ fontSize: 10, color: 'var(--dim)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Active
            </p>
          </div>
        </div>

        {/* Legend */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {data.map((entry) => {
            const color = PLAN_COLORS[entry.name] ?? '#888'
            const pct   = total > 0 ? (entry.value / total) * 100 : 0
            return (
              <div key={entry.name}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>{entry.name} Plan</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'var(--font-jetbrains-mono)', minWidth: 36, textAlign: 'right' }}>
                    {pct.toFixed(0)}%
                  </span>
                </div>
                {/* Mini bar */}
                <div style={{ height: 3, borderRadius: 2, background: 'rgba(var(--veil-rgb),0.06)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.6s ease' }} />
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--dim)', fontFamily: 'var(--font-jetbrains-mono)' }}>
                  {formatINR(entry.value)}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 18, paddingTop: 14,
        borderTop: '1px solid rgba(var(--veil-rgb),0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, color: 'var(--dim)' }}>Total deployed capital</span>
        <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-space-grotesk)', letterSpacing: '-0.02em' }}>
          {formatINR(total)}
        </span>
      </div>
    </div>
  )
}
