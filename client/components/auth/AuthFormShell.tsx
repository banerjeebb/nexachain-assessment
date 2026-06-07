'use client'

import Link from 'next/link'

export const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--dim)', letterSpacing: '0.12em' }}>
    {children}
  </label>
)

export function AuthFormShell({
  title,
  footerText,
  footerLinkHref,
  footerLinkText,
  children,
}: {
  title: string
  footerText: string
  footerLinkHref: string
  footerLinkText: string
  children: React.ReactNode
}) {
  return (
    <div className="w-full max-w-md auth-form-card" style={{ position: 'relative' }}>
      <div className="auth-form-card-glow" aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="flex items-center gap-2.5" style={{ marginBottom: 24, width: 'fit-content' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #a78bfa, #22d3ee)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="font-bold text-[17px]" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text)' }}>
              NexaChain AI
            </span>
          </Link>
          <h1 className="font-bold text-[26px]" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text)' }}>
            {title}
          </h1>
        </div>

        {children}

        <p className="text-center text-[13px] mt-6" style={{ color: 'var(--dim)' }}>
          {footerText}{' '}
          <Link href={footerLinkHref} className="font-semibold" style={{ color: 'var(--accent)' }}>
            {footerLinkText}
          </Link>
        </p>
      </div>
    </div>
  )
}
