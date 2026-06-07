'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import Icon from './Icon'

type ToastType = 'success' | 'error' | 'info' | 'warn'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

const ICONS: Record<ToastType, string> = {
  success: 'check',
  error:   'x',
  warn:    'alert',
  info:    'alert',
}

const COLORS: Record<ToastType, { border: string; text: string; bg: string }> = {
  success: { border: '#34d399', text: '#34d399', bg: 'rgba(52,211,153,0.08)' },
  error:   { border: '#fb7185', text: '#fb7185', bg: 'rgba(251,113,133,0.08)' },
  warn:    { border: '#fbbf24', text: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
  info:    { border: '#a78bfa', text: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++counter.current
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="toast-stack"
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          zIndex: 9999,
        }}
      >
        {toasts.map((t) => {
          const c = COLORS[t.type]
          return (
            <div
              key={t.id}
              className="animate-slide-up"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 16px',
                borderRadius: 10,
                border: `1px solid ${c.border}`,
                background: c.bg,
                backdropFilter: 'blur(16px)',
                color: '#eceef6',
                fontSize: 14,
                fontWeight: 500,
                minWidth: 240,
                maxWidth: 360,
              }}
            >
              <Icon name={ICONS[t.type] as any} size={16} color={c.text} />
              <span>{t.message}</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
