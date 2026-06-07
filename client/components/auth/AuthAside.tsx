'use client'

import { useEffect, useState } from 'react'

const LEVELS = [
  { level: 'L1', pct: '5%',   color: '#a78bfa' },
  { level: 'L2', pct: '3%',   color: '#22d3ee' },
  { level: 'L3', pct: '2%',   color: '#34d399' },
  { level: 'L4', pct: '1%',   color: '#e7b84a' },
  { level: 'L5', pct: '0.5%', color: '#fb7185' },
]

const FEATURES = [
  { icon: '⚡', text: 'Daily ROI credited automatically at midnight IST' },
  { icon: '🔗', text: '5-level referral income up to ₹50 per ₹1K invested' },
  { icon: '🛡️', text: 'Full transparency with on-chain audit trail' },
  { icon: '💸', text: 'Withdraw anytime to your linked bank account' },
]

const TICKER = [
  '🟢 Arjun S. just earned ₹1,240 in daily ROI',
  '🟣 Priya M. unlocked Level 3 referral income',
  '🔵 New investment of ₹50,000 in Elite Plan',
  '🟢 Rohan K. withdrew ₹8,500 to bank',
  '🟣 Sneha R. referred 3 new investors today',
]

function useCountUp(target: number, durationMs = 1400) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let raf: number
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(target * eased)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])
  return value
}

function StatChip({ label, value, suffix, prefix, color, delay }: {
  label: string; value: number; suffix?: string; prefix?: string; color: string; delay: number
}) {
  const animated = useCountUp(value)
  return (
    <div
      className="animate-float-card"
      style={{
        animationDelay: `${delay}s`,
        background: 'rgba(var(--surface-rgb),0.7)',
        border: '1px solid rgba(var(--veil-rgb),0.09)',
        borderRadius: 14,
        padding: '14px 18px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        minWidth: 132,
      }}
    >
      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dim)' }}>
        {label}
      </p>
      <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800, color, fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.02em' }}>
        {prefix}{animated.toLocaleString('en-IN', { maximumFractionDigits: suffix ? 1 : 0 })}{suffix}
      </p>
    </div>
  )
}

export default function AuthAside() {
  const [tickerIdx, setTickerIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTickerIdx((i) => (i + 1) % TICKER.length), 3200)
    return () => clearInterval(id)
  }, [])

  return (
    <aside
      className="auth-aside"
      style={{
        flex: 1,
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        borderRight: '1px solid var(--border)',
        background: 'var(--bg)',
        padding: '60px 48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 36,
      }}
    >
      {/* Animated gradient mesh background */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <div className="animate-orb-1" style={{
          position: 'absolute', top: '-10%', left: '-10%', width: 420, height: 420, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.22) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div className="animate-orb-2" style={{
          position: 'absolute', bottom: '-15%', right: '-10%', width: 460, height: 460, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', top: '35%', right: '15%', width: 220, height: 220, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52,211,153,0.10) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }} />
        {/* Grid pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(var(--veil-rgb),0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--veil-rgb),0.025) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at 30% 40%, black 0%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 30% 40%, black 0%, transparent 75%)',
        }} />
      </div>

      {/* Content (above background) */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 36 }}>

        {/* Hero text */}
        <div>
          <div
            className="animate-pulse-glow"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '5px 13px', borderRadius: 99,
              border: '1px solid rgba(167,139,250,0.32)',
              background: 'rgba(167,139,250,0.08)',
              color: 'var(--accent)', fontSize: 12, fontWeight: 600,
              marginBottom: 22, letterSpacing: '0.04em',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 8px #34d399' }} />
            AI-Powered Investment Platform
          </div>
          <h2
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 38, fontWeight: 800, color: 'var(--text)',
              lineHeight: 1.14, marginBottom: 14, letterSpacing: '-0.02em',
            }}
          >
            Grow Your Wealth
            <br />
            <span style={{
              background: 'linear-gradient(90deg, #a78bfa, #22d3ee, #34d399)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmer 6s linear infinite',
            }}>
              Intelligently
            </span>
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.6, maxWidth: 380 }}>
            Invest in curated plans, earn daily ROI, and grow your network with our 5-level referral program.
          </p>
        </div>

        {/* Floating live stat chips */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <StatChip label="Avg. Daily ROI"   value={1.8}   suffix="%"  color="#22d3ee" delay={0} />
          <StatChip label="Active Investors" value={4280}  prefix=""   color="#a78bfa" delay={0.6} />
          <StatChip label="Total Payouts"    value={92}    suffix="L+" prefix="₹" color="#34d399" delay={1.2} />
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {FEATURES.map((f) => (
            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: 9, fontSize: 13, flexShrink: 0,
                background: 'rgba(var(--veil-rgb),0.04)', border: '1px solid rgba(var(--veil-rgb),0.07)',
              }}>
                {f.icon}
              </span>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)' }}>{f.text}</p>
            </div>
          ))}
        </div>

        {/* Referral levels — glass panel */}
        {/* <div style={{
          background: 'rgba(var(--surface-rgb),0.7)',
          border: '1px solid rgba(var(--veil-rgb),0.08)',
          borderRadius: 16,
          padding: 20,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--dim)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
            Referral Income Levels
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LEVELS.map((l) => (
              <div key={l.level} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  className="badge"
                  style={{ background: `${l.color}18`, color: l.color, minWidth: 32, justifyContent: 'center' }}
                >
                  {l.level}
                </span>
                <div style={{ flex: 1, height: 4, borderRadius: 99, background: 'var(--border-strong)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%', borderRadius: 99,
                      background: `linear-gradient(90deg, ${l.color}, ${l.color}aa)`,
                      width: parseFloat(l.pct) * 20 + '%',
                      boxShadow: `0 0 10px ${l.color}66`,
                    }}
                  />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: l.color, fontFamily: 'JetBrains Mono, monospace', minWidth: 36, textAlign: 'right' }}>
                  {l.pct}
                </span>
              </div>
            ))}
          </div>
        </div> */}

        {/* Live activity ticker */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 16px', borderRadius: 12,
          background: 'rgba(52,211,153,0.05)',
          border: '1px solid rgba(52,211,153,0.14)',
          overflow: 'hidden',
        }}>
          <span className="animate-pulse-glow" style={{
            width: 7, height: 7, borderRadius: '50%', background: '#34d399', flexShrink: 0,
            boxShadow: '0 0 8px #34d399',
          }} />
          <p key={tickerIdx} className="animate-fade-in" style={{
            margin: 0, fontSize: 12.5, color: 'var(--text-2)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {TICKER[tickerIdx]}
          </p>
        </div>
      </div>
    </aside>
  )
}
