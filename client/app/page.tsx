'use client'

import Link from 'next/link'
import { useState } from 'react'
import ShaderBackground from '@/components/landing/ShaderBackground'
import Sparkline from '@/components/ui/Sparkline'
import { genSpark, compactINR, formatINR } from '@/lib/utils'

// ─── Data ─────────────────────────────────────────────────────────────────────

const TRUST_STATS = [
  { label: 'Total Invested', value: '₹12.4Cr', spark: genSpark(16, 1, 50, 100) },
  { label: 'ROI Paid Out',   value: '₹3.8Cr',  spark: genSpark(16, 2, 40, 90)  },
  { label: 'Active Members', value: '8,420+',   spark: genSpark(16, 3, 30, 95)  },
  { label: 'Uptime',         value: '99.9%',    spark: genSpark(16, 4, 80, 100) },
]

const FEATURES = [
  {
    icon: '⚡',
    title: 'Daily ROI, Automatically',
    desc: 'Returns are calculated and credited to your wallet every midnight IST — no manual claims, no waiting.',
    color: '#22d3ee',
  },
  {
    icon: '🌐',
    title: '5-Level Referral Network',
    desc: 'Earn passive income across 5 levels of your network — up to 5% per level, distributed instantly on new investments.',
    color: '#a78bfa',
  },
  {
    icon: '🔒',
    title: 'Secure & Transparent',
    desc: 'JWT-authenticated API, bcrypt-secured passwords, Mongoose transactions — every rupee is traceable on the ledger.',
    color: '#34d399',
  },
  {
    icon: '📊',
    title: 'Real-Time Dashboard',
    desc: 'Monitor ROI performance, referral tree, and wallet balance in a live interactive dashboard with chart analytics.',
    color: '#e7b84a',
  },
]

const LEVELS = [
  { level: 'L1', label: 'Direct Referral',      pct: 5,   color: '#a78bfa', eg: '₹500 per ₹10K' },
  { level: 'L2', label: "Referral's Referral",   pct: 3,   color: '#22d3ee', eg: '₹300 per ₹10K' },
  { level: 'L3', label: 'Level 3 Network',       pct: 2,   color: '#34d399', eg: '₹200 per ₹10K' },
  { level: 'L4', label: 'Level 4 Network',       pct: 1,   color: '#e7b84a', eg: '₹100 per ₹10K' },
  { level: 'L5', label: 'Level 5 Network',       pct: 0.5, color: '#fb7185', eg: '₹50 per ₹10K'  },
]

const PLANS = [
  {
    name: 'Starter',
    min: 1_000,
    max: 25_000,
    roi: 0.5,
    duration: 30,
    color: '#a78bfa',
    popular: false,
    perks: ['Daily ROI credited', 'Referral income', 'Dashboard access', 'Email support'],
  },
  {
    name: 'Growth',
    min: 25_001,
    max: 1_00_000,
    roi: 0.8,
    duration: 60,
    color: '#22d3ee',
    popular: true,
    perks: ['Daily ROI credited', 'Referral income', 'Advanced analytics', 'Priority support', 'Early plan access'],
  },
  {
    name: 'Elite',
    min: 1_00_001,
    max: 10_00_000,
    roi: 1.2,
    duration: 90,
    color: '#34d399',
    popular: false,
    perks: ['Daily ROI credited', 'Referral income', 'Dedicated manager', 'Custom reports', 'VIP community', 'Cashback on entry'],
  },
]

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  const [open, setOpen] = useState(false)
  const links = ['Features', 'Referral Levels', 'Plans']
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        height: 64,
        background: 'rgba(var(--bg-rgb),0.88)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(var(--veil-rgb),0.07)',
      }}
      className="landing-nav"
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>
          NexaChain AI
        </span>
      </div>

      {/* Links (desktop) */}
      <div className="landing-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {links.map((l) => (
          <a
            key={l}
            href={`#${l.toLowerCase().replace(' ', '-')}`}
            style={{ fontSize: 14, color: 'var(--dim)', fontWeight: 500, transition: 'color 0.18s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--dim)')}
          >
            {l}
          </a>
        ))}
      </div>

      {/* CTA (desktop) */}
      <div className="landing-nav-cta" style={{ display: 'flex', gap: 10 }}>
        <Link href="/login" className="btn btn-ghost" style={{ padding: '8px 18px', fontSize: 13 }}>
          Sign In
        </Link>
        <Link href="/register" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
          Get Started
        </Link>
      </div>

      {/* Hamburger (mobile) */}
      <button
        onClick={() => setOpen(v => !v)}
        className="landing-nav-burger"
        aria-label="Toggle navigation menu"
        style={{
          display: 'none', alignItems: 'center', justifyContent: 'center',
          width: 40, height: 40, borderRadius: 10,
          background: 'rgba(var(--veil-rgb),0.05)', border: '1px solid var(--border)',
          cursor: 'pointer',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2" strokeLinecap="round">
          {open ? (
            <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
          ) : (
            <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>
          )}
        </svg>
      </button>

      {/* Mobile menu panel */}
      {open && (
        <div
          className="landing-nav-mobile"
          style={{
            position: 'absolute', top: 64, left: 0, right: 0,
            background: 'rgba(var(--bg-rgb),0.97)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(var(--veil-rgb),0.08)',
            flexDirection: 'column', gap: 4, padding: 16,
          }}
        >
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(' ', '-')}`}
              onClick={() => setOpen(false)}
              style={{
                fontSize: 15, color: 'var(--text-2)', fontWeight: 500,
                padding: '12px 14px', borderRadius: 10,
              }}
            >
              {l}
            </a>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <Link href="/login" className="btn btn-ghost" onClick={() => setOpen(false)} style={{ padding: '12px 14px', fontSize: 14, textAlign: 'center', minHeight: 44 }}>
              Sign In
            </Link>
            <Link href="/register" className="btn btn-primary" onClick={() => setOpen(false)} style={{ padding: '12px 14px', fontSize: 14, textAlign: 'center', minHeight: 44 }}>
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      style={{
        paddingTop: 140,
        paddingBottom: 80,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* WebGL shader background */}
      <ShaderBackground />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(7,8,12,0.35) 0%, rgba(7,8,12,0.2) 40%, var(--bg) 96%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
        {/* Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            maxWidth: '100%',
            gap: 8,
            padding: '5px 14px',
            borderRadius: 99,
            border: '1px solid rgba(167,139,250,0.3)',
            background: 'rgba(167,139,250,0.08)',
            color: 'var(--accent)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.04em',
            marginBottom: 28,
          }}
        >
          <span style={{ fontSize: 16 }}>✦</span> AI-Powered Investment & Referral Platform
        </div>

        <h1
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 800,
            color: 'var(--text)',
            lineHeight: 1.1,
            marginBottom: 20,
          }}
        >
          Invest Smarter.
          <br />
          <span
            style={{
              background: 'linear-gradient(90deg, #a78bfa 0%, #22d3ee 60%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Earn Every Day.
          </span>
        </h1>

        <p
          style={{
            fontSize: 17,
            color: 'var(--text-2)',
            lineHeight: 1.7,
            maxWidth: 560,
            margin: '0 auto 36px',
          }}
        >
          Daily ROI credited automatically. Earn across 5 levels of your referral network.
          Full transparency, zero hidden fees.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/register"
            className="btn btn-primary"
            style={{ padding: '13px 28px', fontSize: 15, borderRadius: 12 }}
          >
            Start Investing
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
          <Link
            href="/login"
            className="btn btn-ghost"
            style={{ padding: '13px 28px', fontSize: 15, borderRadius: 12 }}
          >
            View Dashboard
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Trust Bar ────────────────────────────────────────────────────────────────

function TrustBar() {
  return (
    <section className="land-section " style={{ padding: '40px 40px', marginTop:'80px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div
        className="trust-grid"
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 24,
        }}
      >
        {TRUST_STATS.map((s) => (
          <div key={s.label} className="trust-item" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div>
              <p
                className="trust-item-value"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 28,
                  fontWeight: 800,
                  color: 'var(--text)',
                  lineHeight: 1.1,
                }}
              >
                {s.value}
              </p>
              <p style={{ fontSize: 13, color: 'var(--dim)', marginTop: 2 }}>{s.label}</p>
            </div>
            <span className="trust-item-spark"><Sparkline data={s.spark} color="#a78bfa" width={72} height={36} /></span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────

function Features() {
  return (
    <section id="features" className="land-section" style={{ padding: '80px 40px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            Why NexaChain
          </p>
          <h2
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              color: 'var(--text)',
            }}
          >
            Built for Serious Investors
          </h2>
        </div>

        <div
          className="features-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="panel feature-card"
              style={{ padding: 28, transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = `0 0 40px ${f.color}18`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = ''
              }}
            >
              <div
                className="feature-card-icon"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: `${f.color}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  marginBottom: 18,
                }}
              >
                {f.icon}
              </div>
              <h3
                className="feature-card-title"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 17,
                  fontWeight: 700,
                  color: 'var(--text)',
                  marginBottom: 10,
                }}
              >
                {f.title}
              </h3>
              <p className="feature-card-desc" style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Referral Levels ──────────────────────────────────────────────────────────

function ReferralLevels() {
  return (
    <section
      id="referral-levels"
      className="land-section"
      style={{
        padding: '80px 40px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(167,139,250,0.04) 50%, transparent 100%)',
      }}
    >
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            Referral Program
          </p>
          <h2
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              color: 'var(--text)',
              marginBottom: 14,
            }}
          >
            Earn Across 5 Levels
          </h2>
          <p style={{ fontSize: 15, color: 'var(--dim)', maxWidth: 520, margin: '0 auto' }}>
            Every time someone in your network invests, you earn a percentage — instantly credited to your wallet.
          </p>
        </div>

        <div className="referral-levels-list" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {LEVELS.map((l) => (
            <div
              key={l.level}
              className="panel referral-level-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                padding: '18px 24px',
                transition: 'transform 0.18s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(6px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = '' }}
            >
              {/* Level badge */}
              <div
                className="referral-level-card-badge"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `${l.color}18`,
                  border: `1px solid ${l.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 800,
                  color: l.color,
                  fontFamily: 'Space Grotesk, sans-serif',
                  flexShrink: 0,
                }}
              >
                {l.level}
              </div>

              {/* Label */}
              <div className="referral-level-card-label" style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{l.label}</p>
                <p style={{ fontSize: 12, color: 'var(--dim)', marginTop: 2 }}>{l.eg} invested</p>
              </div>

              {/* Progress bar */}
              <div className="referral-level-card-bar" style={{ flex: 2, minWidth: 120 }}>
                <div style={{ height: 6, borderRadius: 99, background: 'var(--border-strong)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(l.pct / 5) * 100}%`,
                      borderRadius: 99,
                      background: l.color,
                      transition: 'width 1s ease',
                    }}
                  />
                </div>
              </div>

              {/* Percentage */}
              <div className="referral-level-card-pct" style={{ textAlign: 'right', minWidth: 48 }}>
                <p
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 20,
                    fontWeight: 700,
                    color: l.color,
                  }}
                >
                  {l.pct}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Plans ────────────────────────────────────────────────────────────────────

function Plans() {
  return (
    <section id="plans" className="land-section" style={{ padding: '80px 40px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            Investment Plans
          </p>
          <h2
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              color: 'var(--text)',
            }}
          >
            Choose Your Plan
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 20,
            alignItems: 'start',
          }}
        >
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="panel"
              style={{
                padding: 28,
                position: 'relative',
                border: plan.popular ? `1px solid ${plan.color}40` : undefined,
                transform: plan.popular ? 'scale(1.03)' : undefined,
                boxShadow: plan.popular ? `0 0 48px ${plan.color}18` : undefined,
              }}
            >
              {plan.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: plan.color,
                    color: 'var(--bg)',
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 14px',
                    borderRadius: 99,
                    letterSpacing: '0.06em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  MOST POPULAR
                </div>
              )}

              {/* Header */}
              <div style={{ marginBottom: 20 }}>
                <p
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 22,
                    fontWeight: 800,
                    color: plan.color,
                    marginBottom: 6,
                  }}
                >
                  {plan.name}
                </p>
                <p style={{ fontSize: 13, color: 'var(--dim)' }}>
                  {formatINR(plan.min)} – {compactINR(plan.max)}
                </p>
              </div>

              {/* ROI display */}
              <div
                style={{
                  background: `${plan.color}10`,
                  border: `1px solid ${plan.color}20`,
                  borderRadius: 12,
                  padding: '16px',
                  marginBottom: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <p style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 4 }}>Daily ROI</p>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 32, fontWeight: 800, color: plan.color }}>
                    {plan.roi}%
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 4 }}>Duration</p>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
                    {plan.duration}d
                  </p>
                </div>
              </div>

              {/* Perks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {plan.perks.map((perk) => (
                  <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16, color: plan.color }}>✓</span>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{perk}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/register"
                className="btn"
                style={{
                  width: '100%',
                  background: plan.popular ? plan.color : 'transparent',
                  color: plan.popular ? 'var(--bg)' : plan.color,
                  border: plan.popular ? 'none' : `1px solid ${plan.color}40`,
                  fontWeight: 700,
                }}
              >
                Start with {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="land-section" style={{ padding: '80px 40px' }}>
      <div
        className="panel land-cta-panel"
        style={{
          maxWidth: 800,
          margin: '0 auto',
          padding: '60px 48px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(34,211,238,0.05) 100%)',
          border: '1px solid rgba(167,139,250,0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 400,
            height: 200,
            background: 'radial-gradient(ellipse, rgba(167,139,250,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
          Ready to Grow?
        </p>
        <h2
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(26px, 4vw, 40px)',
            fontWeight: 800,
            color: 'var(--text)',
            marginBottom: 16,
            lineHeight: 1.15,
          }}
        >
          Join 8,400+ investors already earning daily
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-2)', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.65 }}>
          Create your account in under 60 seconds. No KYC, no paperwork — just your email and a plan.
        </p>
        <Link
          href="/register"
          className="btn btn-primary"
          style={{ padding: '14px 36px', fontSize: 16, borderRadius: 12 }}
        >
          Create Free Account →
        </Link>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer
      className="landing-footer"
      style={{
        borderTop: '1px solid var(--border)',
        padding: '32px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}
    >
      <div className="landing-footer-brand" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: 'var(--text)' }}>NexaChain AI</span>
        <span style={{ color: 'var(--faint)', fontSize: 13 }}>© 2026. All rights reserved.</span>
      </div>
      <div className="landing-footer-links" style={{ display: 'flex', gap: 24 }}>
        {['Privacy', 'Terms', 'Contact'].map((l) => (
          <a key={l} href="#" style={{ fontSize: 13, color: 'var(--dim)' }}>{l}</a>
        ))}
        <Link href="/login" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>Sign In</Link>
        <Link href="/register" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>Register</Link>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <Nav />
      <Hero />
      <TrustBar />
      <Features />
      <ReferralLevels />
      <Plans />
      <CTA />
      <Footer />
    </div>
  )
}
