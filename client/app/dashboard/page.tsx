'use client'


import StatCard from '@/components/dashboard/StatCard'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import EarningsChart from '@/components/charts/EarningsChart'
import PortfolioPie from '@/components/charts/PortfolioPie'
import ReferralSnapshot from '@/components/dashboard/ReferralSnapshot'
import { ErrorState } from '@/components/ui/StateScreen'
import { StatCardSkeleton, ChartPanelSkeleton, DonutPanelSkeleton, ListPanelSkeleton } from '@/components/ui/PageSkeletons'
import { MobileStatGrid, MobileStatCardSkeleton } from '@/components/ui/MobileSkeletons'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useUser } from '@/components/dashboard/UserContext'
import { useInvestments } from '@/hooks/useInvestments'
import { useROI } from '@/hooks/useROI'
import { useReferrals } from '@/hooks/useReferrals'
import { STAT_SPARKS } from '@/lib/mock'
import type { ChartPoint, ActivityEntry } from '@/lib/types'

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

function buildActivity(
  roiHistory: ReturnType<typeof useROI>['history'],
  referralIncome: ReturnType<typeof useReferrals>['referralIncome'],
): ActivityEntry[] {
  const entries: ActivityEntry[] = []
  for (const r of roiHistory.slice(0, 4)) {
    entries.push({
      id: r._id,
      type: 'roi',
      label: `ROI credited — ${r.investmentId?.planName ?? 'Investment'}`,
      amount: r.amount,
      time: new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    })
  }
  for (const i of referralIncome.slice(0, 3)) {
    entries.push({
      id: i._id,
      type: 'referral',
      label: `L${i.level} income from ${i.generatorId?.fullName ?? 'referral'}`,
      amount: i.amount,
      time: new Date(i.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    })
  }
  return entries.sort((a, b) => b.id.localeCompare(a.id)).slice(0, 6)
}

const STAT_CONFIGS = [
  { key: 'totalInvestments', label: 'Total Invested', icon: 'investments', color: '#a78bfa', sparkKey: 'totalInvestments' as const, delta: 12 },
  { key: 'totalROIEarned',   label: 'Total ROI',      icon: 'roi',         color: '#22d3ee', sparkKey: 'totalROIEarned'   as const, delta: 8  },
  { key: 'totalLevelIncome', label: 'Level Income',   icon: 'income',      color: '#34d399', sparkKey: 'totalLevelIncome' as const, delta: 15 },
  { key: 'walletBalance',    label: 'Wallet Balance', icon: 'wallet',      color: '#e7b84a', sparkKey: 'walletBalance'    as const, delta: 6  },
]

export default function OverviewPage() {
  const isMobile = useIsMobile()
  const { stats, loading: userLoading, error: userError, refresh: refreshUser } = useUser()
  const { investments } = useInvestments()
  const { history: roiHistory }          = useROI(1, 30)
  const { referralIncome, directReferrals } = useReferrals()

  const series   = buildSeries(roiHistory, referralIncome)
  const activity = buildActivity(roiHistory, referralIncome)

  if (userLoading) {
    if (isMobile) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <MobileStatGrid>
            {[1, 2, 3, 4].map(i => <MobileStatCardSkeleton key={i} />)}
          </MobileStatGrid>
          <ChartPanelSkeleton />
          <ListPanelSkeleton rows={3} />
          <ListPanelSkeleton rows={3} />
        </div>
      )
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
        </div>
        <ChartPanelSkeleton />
        <div className="grid-aside-3" style={{ display: 'grid', gridTemplateColumns: '1fr 300px 280px', gap: 16 }}>
          <DonutPanelSkeleton />
          <ListPanelSkeleton rows={3} />
          <ListPanelSkeleton rows={4} />
        </div>
      </div>
    )
  }

  if (userError) {
    return <ErrorState message={userError} onRetry={refreshUser} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Stat cards */}
      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {STAT_CONFIGS.map((c) => (
          <StatCard
            key={c.key}
            label={c.label}
            value={stats?.[c.key as keyof typeof stats] ?? 0}
            icon={c.icon}
            delta={c.delta}
            spark={STAT_SPARKS[c.sparkKey]}
            color={c.color}
          />
        ))}
      </div>

      {/* Earnings chart — series derived from real ROI + referral income */}
      <EarningsChart series={series} />

      {/* Bottom row: portfolio pie + referral snapshot + activity feed */}
      <div className="grid-aside-3" style={{ display: 'grid', gridTemplateColumns: '1fr 300px 280px', gap: 16 }}>
        <PortfolioPie investments={investments} />
        <ReferralSnapshot directReferrals={directReferrals} />
        <ActivityFeed entries={activity} />
      </div>
    </div>
  )
}
