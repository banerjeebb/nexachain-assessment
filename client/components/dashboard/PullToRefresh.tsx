'use client'

import { useRef, useState, useEffect } from 'react'
import Icon from '../ui/Icon'

const THRESHOLD = 70
const MAX_PULL  = 110

export default function PullToRefresh({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const startY  = useRef(0)
  const pulling = useRef(false)
  const [pull, setPull]       = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function onTouchStart(e: TouchEvent) {
      if (el!.scrollTop <= 0 && !refreshing) {
        startY.current = e.touches[0].clientY
        pulling.current = true
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (!pulling.current || refreshing) return
      const delta = e.touches[0].clientY - startY.current
      if (delta <= 0) {
        pulling.current = false
        setPull(0)
        return
      }
      if (el!.scrollTop > 0) {
        pulling.current = false
        setPull(0)
        return
      }
      e.preventDefault()
      setPull(Math.min(delta * 0.5, MAX_PULL))
    }

    function onTouchEnd() {
      if (!pulling.current) return
      pulling.current = false
      setPull((p) => {
        if (p >= THRESHOLD && !refreshing) {
          setRefreshing(true)
          setTimeout(() => window.location.reload(), 350)
          return THRESHOLD
        }
        return 0
      })
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [refreshing])

  const indicatorOpacity = Math.min(pull / THRESHOLD, 1)
  const ready = pull >= THRESHOLD

  return (
    <div ref={containerRef} className="dash-main pull-refresh-container" style={{ flex: 1, padding: '28px', overflowY: 'auto', position: 'relative' }}>
      <div
        className="pull-refresh-indicator"
        style={{
          position: 'absolute', top: 0, left: '50%', transform: `translate(-50%, ${pull - 40}px)`,
          width: 34, height: 34, borderRadius: '50%',
          background: 'rgba(var(--surface-rgb),0.95)',
          border: '1px solid rgba(var(--veil-rgb),0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: indicatorOpacity, zIndex: 5,
          transition: pulling.current ? 'none' : 'transform 0.25s ease, opacity 0.25s ease',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}
      >
        {refreshing ? (
          <span style={{
            display: 'block', width: 16, height: 16, borderRadius: '50%',
            border: '2px solid rgba(167,139,250,0.25)', borderTopColor: 'var(--accent)',
            animation: 'spin 0.7s linear infinite',
          }} />
        ) : (
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `rotate(${ready ? 180 : pull * 2.5}deg)`,
            transition: 'transform 0.2s ease',
          }}>
            <Icon name="chevronDown" size={16} color="var(--accent)" />
          </span>
        )}
      </div>
      <div style={{ transform: `translateY(${pull}px)`, transition: pulling.current ? 'none' : 'transform 0.25s ease' }}>
        {children}
      </div>
    </div>
  )
}
