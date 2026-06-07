'use client'

import Icon from './Icon'

interface StateScreenProps {
  icon: 'alert' | 'investments' | 'history' | 'referrals' | 'wallet'
  title: string
  message?: string
  tone?: 'error' | 'neutral'
  action?: { label: string; onClick: () => void }
}

export function StateScreen({ icon, title, message, tone = 'neutral', action }: StateScreenProps) {
  const color = tone === 'error' ? '#fb7185' : 'var(--dim)'
  const bg    = tone === 'error' ? 'rgba(251,113,133,0.08)' : 'rgba(var(--veil-rgb),0.04)'
  const border = tone === 'error' ? 'rgba(251,113,133,0.2)' : 'rgba(var(--veil-rgb),0.08)'

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', gap: 14, padding: '56px 24px',
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: bg, border: `1px solid ${border}`,
      }}>
        <Icon name={icon} size={22} color={color} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{title}</p>
        {message && (
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--dim)', maxWidth: 340 }}>{message}</p>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="btn"
          style={{
            marginTop: 4,
            background: tone === 'error' ? 'rgba(251,113,133,0.12)' : 'rgba(167,139,250,0.12)',
            color: tone === 'error' ? '#fb7185' : 'var(--accent)',
            border: `1px solid ${tone === 'error' ? 'rgba(251,113,133,0.3)' : 'rgba(167,139,250,0.3)'}`,
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <StateScreen
      icon="alert"
      tone="error"
      title="Couldn't load this data"
      message={message}
      action={{ label: 'Try again', onClick: onRetry }}
    />
  )
}

export function EmptyState({ icon, title, message }: { icon: StateScreenProps['icon']; title: string; message?: string }) {
  return <StateScreen icon={icon} title={title} message={message} tone="neutral" />
}
