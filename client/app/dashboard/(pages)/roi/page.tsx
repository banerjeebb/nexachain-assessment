'use client'

import StatCard from '@/components/dashboard/StatCard'
import EarningsChart from '@/components/charts/EarningsChart'
import ROITable from '@/components/dashboard/ROITable'
import { ErrorState } from '@/components/ui/StateScreen'
import { StatCardSkeleton, ChartPanelSkeleton, TablePanelSkeleton } from '@/components/ui/PageSkeletons'
import { MobileStatGrid, MobileStatCardSkeleton, MobileFullWidthStatSkeleton } from '@/components/ui/MobileSkeletons'
import { useIsMobile } from '@/hooks/useIsMobile'
import { STAT_SPARKS } from '@/lib/mock'
import { compactINR } from '@/lib/utils'
import { useROI } from '@/hooks/useROI'
import { useUser } from '@/components/dashboard/UserContext'
import { useReferrals } from '@/hooks/useReferrals'
import type { ChartPoint } from '@/lib/types'

function buildSeries(
  roiHistory: ReturnType<typeof useROI>['history'],
  referralIncome: ReturnType<typeof useReferrals>['referralIncome'],
): ChartPoint[] {
  const map: Record<string, ChartPoint> = {}
  for (const r of roiHistory) {
    const d = r.date.slice(0, 10)
    if (!map[d]) map[d] = { date: d, roi: 0, levelIncome: 0 }
    map[d].roi += r.amount
  }
  for (const i of referralIncome) {
    const d = i.date.slice(0, 10)
    if (!map[d]) map[d] = { date: d, roi: 0, levelIncome: 0 }
    map[d].levelIncome += i.amount
  }
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
}

export default function ROIPage() {
  const isMobile = useIsMobile()
  const { stats } = useUser()
  const { history, pagination, loading, error, goToPage } = useROI(1, 10)
  const { referralIncome } = useReferrals()

  const todayDate = history[0]?.date.slice(0, 10)
  const todayROI  = history
    .filter(r => r.date.slice(0, 10) === todayDate)
    .reduce((s, r) => s + r.amount, 0)

  const series = buildSeries(history, referralIncome)

  const avgDailyROI = series.length
    ? Math.round(series.reduce((s, d) => s + d.roi, 0) / series.length)
    : 0

  if (loading && history.length === 0) {
    if (isMobile) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <MobileStatGrid>
            <MobileStatCardSkeleton />
            <MobileStatCardSkeleton />
            <MobileFullWidthStatSkeleton segments={2} />
          </MobileStatGrid>
          <ChartPanelSkeleton />
          <TablePanelSkeleton rows={6} cols={5} />
        </div>
      )
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[1, 2, 3].map(i => <StatCardSkeleton key={i} />)}
        </div>
        <ChartPanelSkeleton />
        <TablePanelSkeleton rows={6} cols={5} />
      </div>
    )
  }

  if (error && history.length === 0) {
    return <ErrorState message={error} onRetry={() => goToPage(pagination.page)} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Stat cards */}
      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard
          label="Total ROI Earned"
          value={stats?.totalROIEarned ?? 0}
          icon="roi"
          color="#22d3ee"
          spark={STAT_SPARKS.totalROIEarned}
          delta={8}
        />
        <StatCard
          label="Wallet Balance"
          value={stats?.walletBalance ?? 0}
          icon="wallet"
          color="#e7b84a"
          spark={STAT_SPARKS.walletBalance}
          delta={6}
        />

        {/* Today's ROI card */}
        <div className="stat-grid-full" style={{
          background: 'rgba(var(--surface-rgb),0.92)',
          border: '1px solid rgba(var(--veil-rgb),0.08)',
          borderRadius: 14,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          padding: 20,
          display: 'flex', flexDirection: 'column', gap: 14, minHeight: 148,
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--dim)' }}>
            Today&apos;s Earnings
          </span>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#34d399', margin: 0, fontFamily: 'var(--font-space-grotesk)' }}>
                {compactINR(todayROI)}
              </p>
              <p style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4 }}>Avg {compactINR(avgDailyROI)}/day (30d)</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#e7b84a', margin: 0, fontFamily: 'var(--font-space-grotesk)' }}>
                🔥 {history.length}
              </p>
              <p style={{ fontSize: 10, color: 'var(--dim)', marginTop: 2 }}>ROI credits</p>
            </div>
          </div>
        </div>
      </div>

      <EarningsChart series={series} />

      <ROITable history={history} pagination={pagination} onPageChange={goToPage} />
    </div>
  )
}
