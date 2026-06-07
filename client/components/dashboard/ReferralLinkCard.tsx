'use client'

import { useState } from 'react'
import Icon from '../ui/Icon'
import { useToast } from '../ui/Toast'
import { useUser } from './UserContext'

const CARD: React.CSSProperties = {
  background: 'rgba(var(--surface-rgb),0.92)',
  border: '1px solid rgba(var(--veil-rgb),0.08)',
  borderRadius: 14,
  backdropFilter: 'blur(24px)',
  padding: 20,
}

export default function ReferralLinkCard() {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const { user } = useUser()
  const refCode = user?.referralCode ?? '—'
  const link = user
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://nexachain.ai'}/register?ref=${refCode}`
    : ''

  function copy() {
    if (!link) return
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      toast('Referral link copied!', 'success')
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div style={CARD}>
      <p style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 16 }}>
        Your Referral Link
      </p>

      {/* QR placeholder */}
      <div style={{
        width: 80, height: 80, borderRadius: 12, marginBottom: 14,
        border: '1px solid rgba(167,139,250,0.2)',
        background: 'rgba(167,139,250,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="qr" size={40} color="#a78bfa" />
      </div>

      {/* Link box */}
      <div style={{
        background: 'rgba(var(--veil-rgb),0.03)',
        border: '1px solid rgba(var(--veil-rgb),0.1)',
        borderRadius: 8, padding: '8px 12px',
        fontSize: 11, color: 'var(--dim)',
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        wordBreak: 'break-all', marginBottom: 12,
        lineHeight: 1.5,
      }}>
        {link}
      </div>

      <button
        onClick={copy}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: copied ? 'rgba(52,211,153,0.15)' : 'var(--accent)',
          color: copied ? 'var(--pos)' : '#fff',
          fontSize: 14, fontWeight: 600,
          fontFamily: 'var(--font-inter), sans-serif',
          transition: 'all 0.2s',
        }}
      >
        <Icon name={copied ? 'check' : 'copy'} size={15} color={copied ? 'var(--pos)' : '#fff'} />
        {copied ? 'Copied!' : 'Copy Referral Link'}
      </button>

      <p style={{ marginTop: 10, fontSize: 11, color: 'var(--dim)', textAlign: 'center' }}>
        Code:{' '}
        <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-jetbrains-mono), monospace', fontWeight: 600 }}>
          {refCode}
        </span>
      </p>
    </div>
  )
}
