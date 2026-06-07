'use client'

import { useCountUp } from '../ui/useCountUp'
import Sparkline from '../ui/Sparkline'
import Icon from '../ui/Icon'
import { compactINR } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: number
  icon: string
  delta?: number
  spark?: number[]
  color?: string
}

const GLOW: Record<string, string> = {
  '#a78bfa': 'rgba(167,139,250,0.15)',
  '#22d3ee': 'rgba(34,211,238,0.15)',
  '#34d399': 'rgba(52,211,153,0.15)',
  '#e7b84a': 'rgba(231,184,74,0.15)',
}

export default function StatCard({ label, value, icon, delta, spark, color = '#a78bfa' }: StatCardProps) {
  const animated = useCountUp(value)
  const up = delta !== undefined && delta >= 0
  const glow = GLOW[color] ?? 'rgba(167,139,250,0.15)'

  return (
    <div
      className="stat-card"
      style={{
        background: 'rgba(var(--surface-rgb),0.92)',
        border: '1px solid rgba(var(--veil-rgb),0.09)',
        borderRadius: 14,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: `0 0 0 1px rgba(var(--veil-rgb),0.05), 0 4px 24px ${glow}`,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        minHeight: 148,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = '' }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span className="stat-label" style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--dim)', minWidth: 0,
        }}>
          {label}
        </span>
        <div className="stat-icon" style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={icon as any} size={17} color={color} />
        </div>
      </div>

      {/* Value + spark */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <p className="stat-value" style={{
            fontFamily: 'var(--font-space-grotesk), sans-serif',
            fontSize: 28, fontWeight: 800, lineHeight: 1.05,
            color: 'var(--text)', letterSpacing: '-0.02em',
          }}>
            {compactINR(animated)}
          </p>
          {delta !== undefined && (
            <p style={{
              marginTop: 5, fontSize: 11, fontWeight: 600,
              color: up ? 'var(--pos)' : 'var(--neg)',
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              <Icon name={up ? 'arrowUp' : 'arrowDown'} size={11} color={up ? 'var(--pos)' : 'var(--neg)'} />
              {Math.abs(delta)}% this month
            </p>
          )}
        </div>
        {spark && <span className="stat-spark"><Sparkline data={spark} color={color} width={76} height={38} /></span>}
      </div>
    </div>
  )
}
