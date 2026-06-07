'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Icon from '../ui/Icon'
import { initials, avFor } from '@/lib/utils'
import { useUser } from './UserContext'

const NAV = [
  { href: '/dashboard',             label: 'Overview',    icon: 'dashboard'   },
  { href: '/dashboard/investments', label: 'Investments', icon: 'investments' },
  { href: '/dashboard/roi',         label: 'ROI',         icon: 'roi'         },
  { href: '/dashboard/referral',    label: 'Referrals',   icon: 'referrals'   },
] as const

export default function BottomNav() {
  const pathname = usePathname()
  const router   = useRouter()
  const { user } = useUser()
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  function logout() {
    localStorage.removeItem('nexa_token')
    router.push('/login')
  }

  const displayName = user?.fullName ?? '—'

  return (
    <nav className="dash-bottom-nav" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(var(--chrome-rgb),0.97)',
      borderTop: '1px solid rgba(var(--veil-rgb),0.08)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      alignItems: 'stretch',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {NAV.map(item => {
        const active = isActive(item.href)
        return (
          <Link key={item.href} href={item.href} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 3, padding: '8px 4px 10px', textDecoration: 'none',
            color: active ? 'var(--accent)' : 'var(--dim)',
          }}>
            <Icon name={item.icon} size={18} color={active ? 'var(--accent)' : 'var(--dim)'} />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, fontFamily: 'var(--font-inter), sans-serif' }}>
              {item.label}
            </span>
          </Link>
        )
      })}

      <div ref={accountRef} style={{ position: 'relative', flex: 1, display: 'flex' }}>
        <button onClick={() => setAccountOpen(v => !v)} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 3, padding: '8px 4px 10px', background: 'none', border: 'none', cursor: 'pointer',
          color: accountOpen ? 'var(--accent)' : 'var(--dim)',
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: '50%',
            background: avFor(displayName),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 8, fontWeight: 700, color: '#fff',
          }}>
            {initials(displayName)}
          </div>
          <span style={{ fontSize: 10, fontWeight: accountOpen ? 700 : 500, fontFamily: 'var(--font-inter), sans-serif' }}>
            Account
          </span>
        </button>

        {accountOpen && (
          <div style={{
            position: 'absolute', bottom: 'calc(100% + 8px)', right: 6,
            minWidth: 160,
            background: 'rgba(var(--surface-rgb),0.98)',
            border: '1px solid rgba(var(--veil-rgb),0.1)',
            borderRadius: 14,
            backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(var(--veil-rgb),0.07)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                {displayName}
              </p>
            </div>
            <button
              onClick={() => { setAccountOpen(false); logout() }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--neg)', fontSize: 13, fontWeight: 600,
                fontFamily: 'var(--font-inter), sans-serif',
              }}
            >
              <Icon name="logout" size={15} color="var(--neg)" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
