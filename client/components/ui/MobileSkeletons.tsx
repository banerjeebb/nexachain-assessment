'use client'

import { Skeleton } from './SkeletonLoader'

const CARD: React.CSSProperties = {
  background: 'rgba(var(--surface-rgb),0.92)',
  border: '1px solid rgba(var(--veil-rgb),0.08)',
  borderRadius: 12,
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
}

/* ── 2-column stat grid wrapper — mirrors `.stat-grid` mobile layout ───────── */
export function MobileStatGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
      {children}
    </div>
  )
}

/* ── Compact stat card — mirrors `.stat-card` mobile dimensions (no spark) ─── */
export function MobileStatCardSkeleton() {
  return (
    <div style={{ ...CARD, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 108 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Skeleton height={9} width={56} />
        <Skeleton width={28} height={28} className="rounded-lg" />
      </div>
      <Skeleton height={18} width="60%" />
      <Skeleton height={9} width={72} />
    </div>
  )
}

/* ── Full-width 2/3-segment stat card — mirrors Portfolio Status / Today's Earnings ── */
export function MobileFullWidthStatSkeleton({ segments = 3 }: { segments?: number }) {
  return (
    <div style={{
      ...CARD, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 108,
      gridColumn: '1 / -1',
    }}>
      <Skeleton height={9} width={88} />
      <div style={{ display: 'flex', gap: 10 }}>
        {Array.from({ length: segments }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Skeleton height={18} width={28} />
            <Skeleton height={9} width={48} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Referral metrics row — mirrors `.referral-metrics` compacted layout ───── */
export function MobileReferralMetricsSkeleton({ items = 4 }: { items?: number }) {
  return (
    <div style={{ ...CARD, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 0, overflow: 'hidden' }}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 92 }}>
          {i > 0 && <div style={{ width: 1, height: 28, background: 'rgba(var(--veil-rgb),0.07)', margin: '0 14px' }} />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Skeleton height={9} width={60} />
            <Skeleton height={17} width={44} />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Level rates banner — mirrors `.referral-level-rates` compacted layout ─── */
export function MobileLevelRatesSkeleton({ levels = 5 }: { levels?: number }) {
  return (
    <div style={{ ...CARD, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14, overflow: 'hidden' }}>
      <Skeleton height={10} width={64} />
      {Array.from({ length: levels }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Skeleton height={18} width={26} className="rounded-md" />
          <Skeleton height={12} width={26} />
        </div>
      ))}
    </div>
  )
}
