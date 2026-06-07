'use client'

import { useState } from 'react'
import Icon from '../ui/Icon'
import { Button } from '../ui/button'
import { useAuth } from '@/hooks/useAuth'
import { AuthFormShell, Label } from './AuthFormShell'

export default function LoginForm() {
  const { login, loading, error } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await login({ email: form.email, password: form.password })
  }

  return (
    <AuthFormShell
      title="Welcome Back"
      footerText="Don't have an account?"
      footerLinkHref="/register"
      footerLinkText="Create one"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <Label>Email</Label>
          <input className="input" type="email" placeholder="you@example.com"
            value={form.email} onChange={set('email')} required />
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
              Signing in...
            </span>
          ) : 'Sign In'}
        </Button>
      </form>
    </AuthFormShell>
  )
}
