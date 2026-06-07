'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Icon from '../ui/Icon'
import { useToast } from '../ui/Toast'
import { compactINR, formatINR } from '@/lib/utils'
import { useUser } from './UserContext'
import { useSidebar } from './SidebarContext'

const TITLES: Record<string, string> = {
  '/dashboard':             'Overview',
  '/dashboard/investments': 'Investments',
  '/dashboard/roi':         'ROI History',
  '/dashboard/referral':    'Referrals',
}

export default function Topbar() {
  const pathname  = usePathname()
  const [copied, setCopied]     = useState(false)
  const [walletOpen, setWalletOpen] = useState(false)
  const walletRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { user, stats } = useUser()
  const { openMobile } = useSidebar()
  const title = TITLES[pathname] ?? 'Dashboard'

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (walletRef.current && !walletRef.current.contains(e.target as Node)) {
        setWalletOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  function copyRef() {
    if (!user) return
    navigator.clipboard.writeText(user.referralCode).then(() => {
      setCopied(true)
      toast('Referral code copied!', 'success')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleWithdraw() {
    setWalletOpen(false)
    toast('Withdrawal feature is under development 🚧', 'warn')
  }

  const walletBalance    = stats?.walletBalance    ?? 0
  const totalROIEarned   = stats?.totalROIEarned   ?? 0
  const totalLevelIncome = stats?.totalLevelIncome ?? 0

  return (
    <header className="dash-topbar" style={{
      height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', gap: 16,
      background: 'rgba(var(--chrome-rgb),0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(var(--veil-rgb),0.08)',
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <button
          onClick={openMobile}
          className="dash-hamburger"
          aria-label="Open navigation menu"
          style={{
            display: 'none', alignItems: 'center', justifyContent: 'center',
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: 'rgba(var(--veil-rgb),0.05)', border: '1px solid var(--border)',
            cursor: 'pointer',
          }}
        >
          <Icon name="menu" size={18} color="var(--text-2)" />
        </button>
        <h1 style={{
          fontFamily: 'var(--font-space-grotesk), sans-serif',
          fontSize: 19, fontWeight: 700, color: 'var(--text)', margin: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {title}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Referral pill */}
        {user && (
          <button onClick={copyRef} className="topbar-chip" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 99, cursor: 'pointer',
            border: '1px solid rgba(167,139,250,0.3)',
            background: 'rgba(167,139,250,0.09)',
            color: 'var(--accent)', fontSize: 12, fontWeight: 700,
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            transition: 'all 0.15s',
          }}>
            <Icon name={copied ? 'check' : 'link'} size={13} color="var(--accent)" />
            <span className="topbar-chip-text">{user.referralCode}</span>
          </button>
        )}

        {/* Wallet chip — clickable popover */}
        <div ref={walletRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setWalletOpen(v => !v)}
            className="topbar-chip"
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 14px', borderRadius: 99,
              border: `1px solid ${walletOpen ? 'rgba(52,211,153,0.6)' : 'rgba(52,211,153,0.25)'}`,
              background: walletOpen ? 'rgba(52,211,153,0.14)' : 'rgba(52,211,153,0.08)',
              color: 'var(--pos)', fontSize: 13, fontWeight: 700,
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <Icon name="wallet" size={14} color="var(--pos)" />
            {compactINR(walletBalance)}
            <Icon name={walletOpen ? 'chevronUp' : 'chevronDown'} size={12} color="var(--pos)" />
          </button>

          {walletOpen && (
            <div className="wallet-popover" style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: 280,
              background: 'rgba(var(--surface-rgb),0.98)',
              border: '1px solid rgba(var(--veil-rgb),0.1)',
              borderRadius: 16,
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(var(--veil-rgb),0.04)',
              overflow: 'hidden',
              zIndex: 100,
            }}>
              <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid rgba(var(--veil-rgb),0.07)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--dim)', margin: '0 0 4px' }}>
                  Wallet Balance
                </p>
                <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-space-grotesk)', margin: 0, letterSpacing: '-0.02em' }}>
                  {formatINR(walletBalance)}
                </p>
                <p style={{ fontSize: 11, color: 'var(--dim)', marginTop: 2 }}>Available balance — built from ROI &amp; level income credits</p>
              </div>

              <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'ROI Earned (lifetime)',   value: totalROIEarned,   color: '#22d3ee', icon: 'roi'    as const },
                  { label: 'Level Income (lifetime)', value: totalLevelIncome, color: '#a78bfa', icon: 'income' as const },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                      background: `${row.color}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name={row.icon} size={14} color={row.color} />
                    </div>
                    <p style={{ flex: 1, margin: 0, fontSize: 12, color: 'var(--dim)' }}>{row.label}</p>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: row.color, fontFamily: 'var(--font-space-grotesk)' }}>
                      {formatINR(row.value)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Proportion bar — how lifetime earnings contributed to the wallet */}
              <div style={{ padding: '0 18px 14px' }}>
                {(totalROIEarned + totalLevelIncome) > 0 && (
                  <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 4, gap: 1 }}>
                    {[totalROIEarned, totalLevelIncome].map((v, i) => (
                      <div key={i} style={{
                        flex: v / (totalROIEarned + totalLevelIncome),
                        background: ['#22d3ee', '#a78bfa'][i],
                        borderRadius: 3,
                      }} />
                    ))}
                  </div>
                )}
              </div>

              <div style={{ padding: '0 18px 16px' }}>
                <button onClick={handleWithdraw} style={{
                  width: '100%', padding: '11px',
                  background: 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(34,211,238,0.1))',
                  border: '1px solid rgba(52,211,153,0.3)',
                  borderRadius: 10, cursor: 'pointer',
                  color: '#34d399', fontSize: 13, fontWeight: 700,
                  fontFamily: 'var(--font-inter), sans-serif',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(52,211,153,0.25), rgba(34,211,238,0.15))')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(34,211,238,0.1))')}
                >
                  <Icon name="withdraw" size={15} color="#34d399" />
                  Withdraw Funds
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
