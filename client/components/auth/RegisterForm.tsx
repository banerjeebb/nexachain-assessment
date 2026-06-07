'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Icon from '../ui/Icon'
import { Button } from '../ui/button'
import { useAuth } from '@/hooks/useAuth'
import { AuthFormShell, Label } from './AuthFormShell'

function passwordStrength(pw: string): { level: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score === 0) return { level: 0, label: '', color: 'transparent' }
  if (score === 1) return { level: 1, label: 'Weak',   color: '#fb7185' }
  if (score === 2) return { level: 2, label: 'Fair',   color: '#fbbf24' }
  if (score === 3) return { level: 3, label: 'Good',   color: '#34d399' }
  return             { level: 4, label: 'Strong', color: '#22d3ee' }
}

export default function RegisterForm() {
  const params = useSearchParams()
  const { register, loading, error } = useAuth()

  const [form, setForm] = useState({
    fullName: '', email: '', mobile: '', password: '',
    referralCode: params.get('ref') ?? '',
  })
  const [showPw, setShowPw] = useState(false)
  const strength = passwordStrength(form.password)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await register({
      fullName: form.fullName,
      email: form.email,
      mobile: form.mobile,
      password: form.password,
      referralCode: form.referralCode || undefined,
    })
  }

  return (
    <AuthFormShell
      title="Create Account"
      footerText="Already have an account?"
      footerLinkHref="/login"
      footerLinkText="Sign in"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <Label>Full Name</Label>
          <input className="input" type="text" placeholder="Arjun Sharma"
            value={form.fullName} onChange={set('fullName')} required />
        </div>

        <div>
          <Label>Email</Label>
          <input className="input" type="email" placeholder="you@example.com"
            value={form.email} onChange={set('email')} required />
        </div>

        <div>
          <Label>Mobile</Label>
          <input className="input" type="tel" placeholder="9876543210"
            value={form.mobile} onChange={set('mobile')} required />
        </div>

        <div>
          <Label>Password</Label>
          <div className="relative">
            <input
              className="input pr-11"
              type={showPw ? 'text' : 'password'}
              placeholder="Min 8 characters"
              value={form.password}
              onChange={set('password')}
              required
            />
            <button type="button" onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer"
              style={{ color: 'var(--dim)' }}>
              <Icon name={showPw ? 'eyeOff' : 'eye'} size={16} color="var(--dim)" />
            </button>
          </div>

          {form.password.length > 0 && (
            <div className="flex items-center gap-2.5 mt-3">
              <div className="flex gap-1.5 flex-1">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex-1 h-1 rounded-full transition-colors duration-300"
                    style={{ background: n <= strength.level ? strength.color : 'var(--faint)' }} />
                ))}
              </div>
              <span className="text-[11px] font-semibold whitespace-nowrap" style={{ color: strength.color }}>
                {strength.label}
              </span>
            </div>
          )}
        </div>

        <div>
          <Label>Referral Code <span className="normal-case font-normal" style={{ color: 'var(--faint)' }}>(optional)</span></Label>
          <input className="input uppercase" type="text" placeholder="e.g. ARJN8K2X"
            value={form.referralCode} onChange={set('referralCode')}
            style={{ fontFamily: 'JetBrains Mono, monospace' }} />
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px]"
            style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', color: '#fb7185' }}>
            <Icon name="alert" size={14} color="#fb7185" />
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full mt-1 h-11 text-[15px]">
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Creating account...
            </span>
          ) : 'Create Account'}
        </Button>
      </form>
    </AuthFormShell>
  )
}
