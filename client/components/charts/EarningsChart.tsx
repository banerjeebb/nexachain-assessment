'use client'

import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { compactINR, formatDateShort } from '@/lib/utils'
import type { ChartPoint } from '@/lib/types'

const RANGES: Record<string, number> = { '7D': 7, '14D': 14, '30D': 30 }

const CARD: React.CSSProperties = {
  background: 'rgba(var(--surface-rgb),0.92)',
  border: '1px solid rgba(var(--veil-rgb),0.08)',
  borderRadius: 14,
  backdropFilter: 'blur(24px)',
  padding: 20,
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(12,14,22,0.98)', border: '1px solid rgba(var(--veil-rgb),0.12)',
      borderRadius: 10, padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: 'var(--dim)', marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600, fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
          {p.name === 'roi' ? 'ROI' : 'Level Income'}: +{compactINR(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function EarningsChart({ series = [] }: { series?: ChartPoint[] }) {
  const [range, setRange] = useState('30D')
  const days = RANGES[range]
  const data = series.slice(-days).map((d) => ({ ...d, dateLabel: formatDateShort(d.date) }))

  return (
    <div style={CARD}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <p style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
            Earnings Overview
          </p>
          <p style={{ fontSize: 12, color: 'var(--dim)', marginTop: 3 }}>ROI vs Level Income</p>
        </div>

        {/* Range selector */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(var(--veil-rgb),0.04)', padding: 4, borderRadius: 9, border: '1px solid rgba(var(--veil-rgb),0.07)' }}>
          {Object.keys(RANGES).map((r) => {
            const active = range === r
            return (
              <button key={r} onClick={() => setRange(r)} style={{
                padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: active ? 'rgba(167,139,250,0.18)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--dim)',
                fontSize: 12, fontWeight: 600,
                fontFamily: 'var(--font-inter), sans-serif',
                transition: 'all 0.15s',
              }}>
                {r}
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
        {[{ color: '#22d3ee', label: 'Daily ROI' }, { color: '#a78bfa', label: 'Level Income' }].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
            <span style={{ fontSize: 12, color: 'var(--dim)' }}>{l.label}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="roiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="levelGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--veil-rgb),0.04)" />
          <XAxis dataKey="dateLabel" tick={{ fill: '#888da3', fontSize: 11 }} tickLine={false} axisLine={false} interval={Math.floor(days / 6)} />
          <YAxis tick={{ fill: '#888da3', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => compactINR(v)} width={54} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="roi" stroke="#22d3ee" strokeWidth={2} fill="url(#roiGrad)" dot={false} activeDot={{ r: 4, fill: '#22d3ee' }} />
          <Area type="monotone" dataKey="levelIncome" stroke="#a78bfa" strokeWidth={2} fill="url(#levelGrad)" dot={false} activeDot={{ r: 4, fill: '#a78bfa' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
