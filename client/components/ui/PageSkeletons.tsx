'use client'

import { Skeleton } from './SkeletonLoader'

const PANEL: React.CSSProperties = {
  background: 'rgba(var(--surface-rgb),0.92)',
  border: '1px solid rgba(var(--veil-rgb),0.08)',
  borderRadius: 14,
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card" style={{ ...PANEL, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, minHeight: 148 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Skeleton className="stat-label" height={11} width={92} />
        <Skeleton className="stat-icon rounded-xl" width={34} height={34} />
      </div>
      <Skeleton className="stat-value" height={26} width="65%" />
      <span className="stat-spark" style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 28 }}>
        {[14, 22, 17, 26, 19, 24, 16].map((h, i) => (
          <Skeleton key={i} width={8} height={h} className="rounded-sm" />
        ))}
      </span>
    </div>
  )
}

export function ChartPanelSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div style={{ ...PANEL, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Skeleton height={14} width={160} />
        <Skeleton height={28} width={120} className="rounded-full" />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height }}>
        {[42, 58, 38, 70, 52, 64, 46, 80, 56, 68, 44, 72].map((h, i) => (
          <Skeleton key={i} className="rounded-sm" width="100%" height={`${h}%`} />
        ))}
      </div>
    </div>
  )
}

export function TablePanelSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div style={{ ...PANEL, overflow: 'hidden' }}>
      <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(var(--veil-rgb),0.06)', display: 'flex', gap: 32 }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} height={11} width={70} />
        ))}
      </div>
      <div style={{ padding: '4px 24px' }}>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 32, padding: '14px 0', borderBottom: r < rows - 1 ? '1px solid rgba(var(--veil-rgb),0.04)' : 'none' }}>
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} height={12} width={c === 0 ? 130 : 80} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function DonutPanelSkeleton() {
  return (
    <div style={{ ...PANEL, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
      <div style={{ alignSelf: 'flex-start' }}>
        <Skeleton height={14} width={140} />
      </div>
      <Skeleton width={150} height={150} className="rounded-full" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Skeleton width={10} height={10} className="rounded-full" />
            <Skeleton height={11} width="60%" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ListPanelSkeleton({ title, rows = 4 }: { title?: boolean; rows?: number }) {
  return (
    <div style={{ ...PANEL, padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
      {title !== false && <Skeleton height={13} width={130} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Skeleton width={32} height={32} className="rounded-full" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skeleton height={11} width="55%" />
              <Skeleton height={9} width="35%" />
            </div>
            <Skeleton height={11} width={48} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function BannerPanelSkeleton({ segments = 4 }: { segments?: number }) {
  return (
    <div style={{ ...PANEL, padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 0 }}>
      {Array.from({ length: segments }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          {i > 0 && <div style={{ width: 1, height: 36, background: 'rgba(var(--veil-rgb),0.07)', margin: '0 28px' }} />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton height={10} width={90} />
            <Skeleton height={22} width={70} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TabPanelSkeleton({ tabs = 3, rows = 5 }: { tabs?: number; rows?: number }) {
  return (
    <div style={{ ...PANEL, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 28, padding: '18px 24px', borderBottom: '1px solid rgba(var(--veil-rgb),0.06)' }}>
        {Array.from({ length: tabs }).map((_, i) => (
          <Skeleton key={i} height={13} width={110} />
        ))}
      </div>
      <div style={{ padding: '8px 24px' }}>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: r < rows - 1 ? '1px solid rgba(var(--veil-rgb),0.04)' : 'none' }}>
            <Skeleton width={32} height={32} className="rounded-full" />
            <Skeleton height={12} width={140} />
            <div style={{ flex: 1 }} />
            <Skeleton height={12} width={90} />
            <Skeleton height={12} width={70} />
          </div>
        ))}
      </div>
    </div>
  )
}
