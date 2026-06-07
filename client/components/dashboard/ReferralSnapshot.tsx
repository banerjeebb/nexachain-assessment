'use client'

import { useState } from 'react'
import Icon from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { compactINR } from '@/lib/utils'
import { useUser } from './UserContext'
import type { DirectReferral } from '@/lib/types'

interface Props {
  directReferrals: DirectReferral[]
}

export default function ReferralSnapshot({ directReferrals }: Props) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const { user, stats } = useUser()

  function copy() {
    if (!user) return
    const link = `${window.location.origin}/register?ref=${user.referralCode}`
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      toast('Referral link copied!', 'success')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const activeReferrals = directReferrals.filter(r => r.accountStatus === 'active').length

  return (
    <div style={{
      background: 'rgba(var(--surface-rgb),0.92)',
      border: '1px solid rgba(var(--veil-rgb),0.08)',
      borderRadius: 14,
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      padding: 20,
      display: 'flex', flexDirection: 'column', gap: 18,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-space-grotesk)' }}>
            Referral Network
          </p>
          <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--dim)' }}>Your affiliate overview</p>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(52,211,153,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="referrals" size={16} color="#34d399" />
        </div>
      </div>

      {/* Mini stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { label: 'Level Income', value: compactINR(stats?.totalLevelIncome ?? 0), color: '#34d399' },
          { label: 'Direct Refs',  value: String(directReferrals.length),           color: '#22d3ee' },
          { label: 'Active Refs',  value: String(activeReferrals),                  color: '#a78bfa' },
          { label: 'Wallet',       value: compactINR(stats?.walletBalance ?? 0),    color: '#e7b84a' },
        ].map(m => (
          <div key={m.label} style={{
            background: 'rgba(var(--veil-rgb),0.03)',
            border: '1px solid rgba(var(--veil-rgb),0.06)',
            borderRadius: 10, padding: '10px 12px',
          }}>
            <p style={{ margin: 0, fontSize: 10, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{m.label}</p>
            <p style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 800, color: m.color, fontFamily: 'var(--font-space-grotesk)' }}>
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Top referrer from direct list */}
      {directReferrals.length > 0 && (
        <div style={{
          background: 'rgba(231,184,74,0.06)',
          border: '1px solid rgba(231,184,74,0.12)',
          borderRadius: 10, padding: '10px 12px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 20 }}>🏅</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--dim)' }}>Latest direct referral</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 600, color: 'var(--gold)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {directReferrals[0].fullName}
            </p>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: directReferrals[0].accountStatus === 'active' ? '#34d399' : '#e7b84a',
            background: directReferrals[0].accountStatus === 'active' ? 'rgba(52,211,153,0.12)' : 'rgba(231,184,74,0.12)',
            borderRadius: 6, padding: '3px 8px', textTransform: 'capitalize',
          }}>
            {directReferrals[0].accountStatus}
          </span>
        </div>
      )}

      {/* Copy link */}
      <button onClick={copy} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '10px',
        background: copied ? 'rgba(52,211,153,0.12)' : 'rgba(167,139,250,0.1)',
        border: `1px solid ${copied ? 'rgba(52,211,153,0.3)' : 'rgba(167,139,250,0.25)'}`,
        borderRadius: 10, cursor: 'pointer',
        color: copied ? '#34d399' : 'var(--accent)',
        fontSize: 13, fontWeight: 600,
        fontFamily: 'var(--font-inter), sans-serif',
        transition: 'all 0.2s',
      }}>
        <Icon name={copied ? 'check' : 'copy'} size={14} color={copied ? '#34d399' : 'var(--accent)'} />
        {copied ? 'Copied!' : 'Copy Referral Link'}
      </button>
    </div>
  )
}
