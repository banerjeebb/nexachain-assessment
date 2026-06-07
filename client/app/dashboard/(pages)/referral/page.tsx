'use client'

import { useState } from 'react'
import ReferralLinkCard from '@/components/dashboard/ReferralLinkCard'
import ReferralTree from '@/components/dashboard/ReferralTree'
import Leaderboard from '@/components/dashboard/Leaderboard'
import DirectReferralsTable from '@/components/dashboard/DirectReferralsTable'
import LevelIncomeTable from '@/components/dashboard/LevelIncomeTable'
import { ErrorState } from '@/components/ui/StateScreen'
import { BannerPanelSkeleton, TabPanelSkeleton } from '@/components/ui/PageSkeletons'
import { MobileReferralMetricsSkeleton, MobileLevelRatesSkeleton } from '@/components/ui/MobileSkeletons'
import { useIsMobile } from '@/hooks/useIsMobile'
import { Skeleton } from '@/components/ui/SkeletonLoader'
import { compactINR } from '@/lib/utils'
import { useReferrals } from '@/hooks/useReferrals'
import { useUser } from '@/components/dashboard/UserContext'
import type { TreeNode } from '@/lib/types'

const TABS = [
  { id: 'direct',  label: 'Direct Referrals' },
  { id: 'income',  label: 'Level Income' },
  { id: 'tree',    label: 'Network Tree' },
]

function countTree(node: TreeNode): number {
  return node.children.reduce((s, c) => s + 1 + countTree(c), 0)
}

export default function ReferralPage() {
  const isMobile = useIsMobile()
  const [tab, setTab] = useState('direct')
  const { stats } = useUser()
  const { directReferrals, referralIncome, incomePagination, referralTree, loading, error, loadIncome, refresh } = useReferrals()

  const networkSize = referralTree ? countTree(referralTree) : 0

  if (loading && directReferrals.length === 0 && !referralTree) {
    if (isMobile) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <MobileReferralMetricsSkeleton items={4} />
          <div style={{
            background: 'rgba(var(--surface-rgb),0.92)', border: '1px solid rgba(var(--veil-rgb),0.08)',
            borderRadius: 12, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            padding: 16, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center',
          }}>
            <Skeleton height={12} width={130} />
            <Skeleton height={40} className="rounded-xl" />
          </div>
          <MobileLevelRatesSkeleton levels={5} />
          <TabPanelSkeleton tabs={3} rows={6} />
        </div>
      )
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="grid-link" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'stretch' }}>
          <BannerPanelSkeleton segments={4} />
          <div style={{
            background: 'rgba(var(--surface-rgb),0.92)', border: '1px solid rgba(var(--veil-rgb),0.08)',
            borderRadius: 14, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            padding: 20, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 260, justifyContent: 'center',
          }}>
            <Skeleton height={12} width={130} />
            <Skeleton height={40} className="rounded-xl" />
          </div>
        </div>
        <BannerPanelSkeleton segments={5} />
        <TabPanelSkeleton tabs={3} rows={6} />
      </div>
    )
  }

  if (error && directReferrals.length === 0 && !referralTree) {
    return <ErrorState message={error} onRetry={refresh} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Top row: compact metrics + referral link */}
      <div className="grid-link" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'stretch' }}>
        <div className="scroll-x-mobile referral-metrics" style={{
          background: 'rgba(var(--surface-rgb),0.92)',
          border: '1px solid rgba(var(--veil-rgb),0.08)',
          borderRadius: 14,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          padding: '20px 28px',
          display: 'flex', alignItems: 'center', gap: 0,
        }}>
          {[
            { label: 'Level Income',     value: compactINR(stats?.totalLevelIncome ?? 0), color: '#34d399', delta: null },
            { label: 'Direct Referrals', value: String(directReferrals.length),           color: '#22d3ee', delta: null },
            { label: 'Total Network',    value: String(networkSize),                      color: '#a78bfa', delta: null },
            { label: 'Wallet Balance',   value: compactINR(stats?.walletBalance ?? 0),    color: '#e7b84a', delta: null },
          ].map((m, i) => (
            <div key={m.label} className="referral-metric-item" style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              {i > 0 && <div className="referral-metric-divider" style={{ width: 1, background: 'rgba(var(--veil-rgb),0.07)', alignSelf: 'stretch', margin: '0 28px' }} />}
              <div>
                <p className="referral-metric-label" style={{ margin: 0, fontSize: 11, fontWeight: 600, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {m.label}
                </p>
                <p className="referral-metric-value" style={{ margin: '6px 0 0', fontSize: 24, fontWeight: 800, color: m.color, fontFamily: 'var(--font-space-grotesk)', letterSpacing: '-0.02em' }}>
                  {m.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <ReferralLinkCard />
      </div>

      {/* Level rates banner */}
      <div className="scroll-x-mobile referral-level-rates" style={{
        background: 'rgba(var(--surface-rgb),0.92)',
        border: '1px solid rgba(var(--veil-rgb),0.08)',
        borderRadius: 14,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        padding: '18px 24px',
        display: 'flex', alignItems: 'center', gap: 0,
      }}>
        <span className="referral-level-rates-title" style={{ fontSize: 12, fontWeight: 700, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 24, whiteSpace: 'nowrap' }}>
          Level Rates
        </span>
        {[
          { level: 'L1', pct: '5%',   color: '#34d399' },
          { level: 'L2', pct: '3%',   color: '#22d3ee' },
          { level: 'L3', pct: '2%',   color: '#a78bfa' },
          { level: 'L4', pct: '1%',   color: '#e7b84a' },
          { level: 'L5', pct: '0.5%', color: '#fb7185' },
        ].map((l, i) => (
          <div key={l.level} className="referral-level-item" style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {i > 0 && <span className="referral-level-sep" style={{ color: 'rgba(var(--veil-rgb),0.1)', margin: '0 16px' }}>|</span>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="referral-level-badge" style={{ fontSize: 11, fontWeight: 700, color: l.color, background: `${l.color}18`, borderRadius: 6, padding: '3px 8px' }}>{l.level}</span>
              <span className="referral-level-pct" style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-space-grotesk)' }}>{l.pct}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        background: 'rgba(var(--surface-rgb),0.92)',
        border: '1px solid rgba(var(--veil-rgb),0.08)',
        borderRadius: 14,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', padding: '0 20px', borderBottom: '1px solid rgba(var(--veil-rgb),0.06)' }}>
          {TABS.map(t => {
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                color: active ? 'var(--accent)' : 'var(--dim)',
                fontSize: 13, fontWeight: active ? 600 : 500,
                fontFamily: 'var(--font-inter), sans-serif',
                transition: 'all 0.15s',
              }}>{t.label}</button>
            )
          })}
        </div>

        <div style={{ padding: 0 }}>
          {tab === 'direct' && <DirectReferralsTable referrals={directReferrals} />}
          {tab === 'income' && (
            <LevelIncomeTable
              income={referralIncome}
              pagination={incomePagination}
              onPageChange={loadIncome}
            />
          )}
          {tab === 'tree' && (
            <div style={{ padding: 24 }}>
              <ReferralTree tree={referralTree} />
            </div>
          )}
        </div>
      </div>

      {/* <Leaderboard /> */}
    </div>
  )
}
