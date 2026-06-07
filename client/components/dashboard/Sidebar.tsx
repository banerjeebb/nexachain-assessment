'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Icon from '../ui/Icon'
import TipOfDay from './TipOfDay'
import { initials, avFor } from '@/lib/utils'
import { useUser } from './UserContext'
import { useSidebar } from './SidebarContext'

const NAV = [
  { href: '/dashboard',             label: 'Overview',    icon: 'dashboard'   },
  { href: '/dashboard/investments', label: 'Investments', icon: 'investments' },
  { href: '/dashboard/roi',         label: 'ROI History', icon: 'roi'         },
  { href: '/dashboard/referral',    label: 'Referrals',   icon: 'referrals'   },
] as const

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { user } = useUser()
  const { collapsed, toggle, mobileOpen, closeMobile } = useSidebar()
  const W = collapsed ? 64 : 240

  function navigate(href: string) {
    closeMobile()
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  function logout() {
    localStorage.removeItem('nexa_token')
    router.push('/login')
  }

  const displayName = user?.fullName ?? '—'
  const refCode     = user?.referralCode ?? '—'

  return (
    <>
    {mobileOpen && <div className="dash-overlay" data-open="true" onClick={closeMobile} />}
    <aside
      className="dash-sidebar"
      data-open={mobileOpen ? 'true' : 'false'}
      style={{
        width: W,
        background: 'rgba(var(--chrome-rgb),0.97)',
        borderRight: '1px solid rgba(var(--veil-rgb),0.08)',
        height: '100vh',
        position: 'fixed', top: 0, left: 0,
        display: 'flex', flexDirection: 'column',
        zIndex: 40,
        transition: 'width 0.25s ease, transform 0.25s ease',
        overflow: 'hidden',
      }}>

      {/* Logo + toggle */}
      <div style={{
        padding: '18px 14px', borderBottom: '1px solid rgba(var(--veil-rgb),0.07)',
        flexShrink: 0, display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #a78bfa 0%, #22d3ee 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                NexaChain
              </p>
              <p style={{ fontSize: 10, color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                AI Investment
              </p>
            </div>
          )}
        </div>
        <button onClick={toggle} title={collapsed ? 'Expand' : 'Collapse'} className="dash-collapse-btn" style={{
          background: 'rgba(var(--veil-rgb),0.05)', border: '1px solid rgba(var(--veil-rgb),0.08)',
          borderRadius: 8, width: 28, height: 28, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'background 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(167,139,250,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(var(--veil-rgb),0.05)')}
        >
          <Icon name={collapsed ? 'menu' : 'chevronLeft'} size={14} color="var(--dim)" />
        </button>
      </div>

      {/* Nav */}
      <nav style={{
        flex: 1, padding: '12px 8px',
        overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        {NAV.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => navigate(item.href)}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex', alignItems: 'center',
                gap: collapsed ? 0 : 10,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '10px' : '9px 12px',
                borderRadius: 10,
                background: active ? 'rgba(167,139,250,0.13)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--dim)',
                fontSize: 13, fontWeight: active ? 600 : 500,
                fontFamily: 'var(--font-inter), sans-serif',
                transition: 'all 0.15s ease',
                textDecoration: 'none',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(var(--veil-rgb),0.04)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon name={item.icon} size={16} color={active ? 'var(--accent)' : 'var(--dim)'} />
              {!collapsed && (
                <>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)' }} />}
                </>
              )}
              {collapsed && active && (
                <span style={{
                  position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                  width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)',
                }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Tip of the day */}
      {!collapsed && (
        <div style={{ padding: '0 0 10px', flexShrink: 0 }}>
          <TipOfDay />
        </div>
      )}

      {/* Bottom */}
      <div style={{
        padding: '10px 8px', borderTop: '1px solid rgba(var(--veil-rgb),0.07)',
        display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0,
      }}>
        {/* User chip */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: collapsed ? 0 : 8,
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: '4px',
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: avFor(displayName),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff',
          }} title={collapsed ? displayName : undefined}>
            {initials(displayName)}
          </div>
          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </p>
                <p style={{ fontSize: 10, color: 'var(--dim)', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
                  {refCode}
                </p>
              </div>
              <button
                onClick={logout}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 7, transition: 'background 0.15s', flexShrink: 0 }}
                title="Logout"
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(var(--veil-rgb),0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <Icon name="logout" size={15} color="var(--faint)" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
    </>
  )
}
