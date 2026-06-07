'use client'

import { useState, useMemo, Fragment } from 'react'
import StatCard from '@/components/dashboard/StatCard'
import InvestmentsTable from '@/components/dashboard/InvestmentsTable'
import { ErrorState } from '@/components/ui/StateScreen'
import { StatCardSkeleton, TablePanelSkeleton } from '@/components/ui/PageSkeletons'
import { MobileStatGrid, MobileStatCardSkeleton, MobileFullWidthStatSkeleton } from '@/components/ui/MobileSkeletons'
import { useIsMobile } from '@/hooks/useIsMobile'
import { Skeleton } from '@/components/ui/SkeletonLoader'
import Icon from '@/components/ui/Icon'
import { formatINR } from '@/lib/utils'
import { STAT_SPARKS, PLANS } from '@/lib/mock'
import { useInvestments } from '@/hooks/useInvestments'
import { useUser } from '@/components/dashboard/UserContext'

const CARD_STYLE: React.CSSProperties = {
  background: 'rgba(var(--surface-rgb),0.92)',
  border: '1px solid rgba(var(--veil-rgb),0.08)',
  borderRadius: 14,
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  background: 'rgba(var(--veil-rgb),0.04)',
  border: '1px solid rgba(var(--veil-rgb),0.1)',
  borderRadius: 10,
  padding: '12px 16px',
  fontSize: 15,
  color: 'var(--text)',
  fontFamily: 'var(--font-space-grotesk), sans-serif',
  fontWeight: 600,
  outline: 'none',
  boxSizing: 'border-box',
}

export default function InvestmentsPage() {
  const isMobile = useIsMobile()
  const { stats } = useUser()
  const { investments, loading, error, creating, createInvestment, refresh } = useInvestments()

  const [showForm, setShowForm]         = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null)
  const [amount, setAmount]             = useState('')
  const [success, setSuccess]           = useState(false)
  const [apiError, setApiError]         = useState<string | null>(null)

  const activeCount    = investments.filter(i => i.status === 'active').length
  const completedCount = investments.filter(i => i.status === 'completed').length
  const cancelledCount = investments.filter(i => i.status === 'cancelled').length

  const amtNum = parseFloat(amount) || 0

  const amountError = useMemo(() => {
    if (!selectedPlan || !amount) return ''
    if (amtNum < selectedPlan.minAmount) return `Minimum ₹${selectedPlan.minAmount.toLocaleString('en-IN')}`
    if (amtNum > selectedPlan.maxAmount) return `Maximum ₹${selectedPlan.maxAmount.toLocaleString('en-IN')}`
    return ''
  }, [selectedPlan, amount, amtNum])

  const projection = useMemo(() => {
    if (!selectedPlan || amtNum < selectedPlan.minAmount) return null
    const daily = (amtNum * selectedPlan.dailyROI) / 100
    const total = daily * selectedPlan.duration
    return { daily, total, maturity: amtNum + total }
  }, [selectedPlan, amtNum])

  function handlePlanSelect(plan: typeof PLANS[0]) {
    setSelectedPlan(plan)
    setAmount('')
    setApiError(null)
    setSuccess(false)
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedPlan || amountError || !amount) return
    setApiError(null)
    try {
      await createInvestment({
        amount: amtNum,
        planName: selectedPlan.name,
        planDurationDays: selectedPlan.duration,
        dailyROIPercent: selectedPlan.dailyROI,
      })
      setSuccess(true)
      setAmount('')
      setTimeout(() => { setShowForm(false); setSuccess(false); setSelectedPlan(null) }, 2000)
    } catch (e: any) {
      setApiError(e.response?.data?.message ?? 'Investment failed. Please try again.')
    }
  }

  if (loading && investments.length === 0) {
    if (isMobile) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <MobileStatGrid>
            <MobileStatCardSkeleton />
            <MobileStatCardSkeleton />
            <MobileFullWidthStatSkeleton segments={3} />
          </MobileStatGrid>
          <Skeleton height={52} className="rounded-2xl" />
          <TablePanelSkeleton rows={5} cols={5} />
        </div>
      )
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[1, 2].map(i => <StatCardSkeleton key={i} />)}
          <div style={{ ...CARD_STYLE, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, minHeight: 148 }}>
            <Skeleton height={11} width={110} />
            <div style={{ display: 'flex', gap: 20 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Skeleton height={26} width={36} />
                  <Skeleton height={10} width={56} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <Skeleton height={52} className="rounded-2xl" />
        <TablePanelSkeleton rows={5} cols={5} />
      </div>
    )
  }

  if (error && investments.length === 0) {
    return <ErrorState message={error} onRetry={refresh} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Stat cards */}
      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard label="Total Invested" value={stats?.totalInvestments ?? 0} icon="investments" color="#a78bfa" spark={STAT_SPARKS.totalInvestments} delta={12} />
        <StatCard label="Total ROI Earned" value={stats?.totalROIEarned ?? 0} icon="roi" color="#22d3ee" spark={STAT_SPARKS.totalROIEarned} delta={8} />
        <div className="portfolio-status-card stat-grid-full" style={{ ...CARD_STYLE, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 148 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--dim)' }}>
            Portfolio Status
          </span>
          <div className="portfolio-status-row" style={{ display: 'flex', gap: 20 }}>
            {[
              { label: 'Active',    value: activeCount,    color: '#34d399' },
              { label: 'Completed', value: completedCount, color: '#a78bfa' },
              { label: 'Cancelled', value: cancelledCount, color: '#fb7185' },
            ].map((s, i) => (
              <Fragment key={s.label}>
                {i > 0 && <div style={{ width: 1, background: 'rgba(var(--veil-rgb),0.06)', alignSelf: 'stretch' }} />}
                <div>
                  <p className="portfolio-status-value" style={{ fontSize: 28, fontWeight: 800, color: s.color, margin: 0, fontFamily: 'var(--font-space-grotesk)' }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: 'var(--dim)', marginTop: 2 }}>{s.label}</p>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* New Investment toggle */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '14px 24px',
          background: 'linear-gradient(135deg, rgba(167,139,250,0.18), rgba(34,211,238,0.1))',
          border: '1px dashed rgba(167,139,250,0.4)',
          borderRadius: 14, cursor: 'pointer',
          color: 'var(--accent)', fontSize: 14, fontWeight: 600,
          fontFamily: 'var(--font-inter), sans-serif', transition: 'all 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(167,139,250,0.7)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)')}
        >
          <Icon name="investments" size={18} color="var(--accent)" />
          New Investment
        </button>
      ) : (
        <div style={{ ...CARD_STYLE, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Create Investment</h3>
              <p style={{ fontSize: 13, color: 'var(--dim)', marginTop: 4 }}>Choose a plan and enter your amount.</p>
            </div>
            <button onClick={() => { setShowForm(false); setSelectedPlan(null); setAmount(''); setApiError(null) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <Icon name="close" size={18} color="var(--dim)" />
            </button>
          </div>

          {/* Plan cards */}
          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            {PLANS.map((plan) => {
              const active = selectedPlan?.name === plan.name
              const colors: Record<string, string> = { Starter: '#34d399', Growth: '#22d3ee', Elite: '#a78bfa' }
              const c = colors[plan.name]
              return (
                <button key={plan.name} onClick={() => handlePlanSelect(plan)} style={{
                  background: active ? `${c}15` : 'rgba(var(--veil-rgb),0.03)',
                  border: `1px solid ${active ? c : 'rgba(var(--veil-rgb),0.07)'}`,
                  borderRadius: 12, padding: 16, cursor: 'pointer', textAlign: 'left', outline: 'none', transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: c }}>{plan.name}</span>
                    {active && <span style={{ fontSize: 10, fontWeight: 700, background: c, color: 'var(--bg)', borderRadius: 6, padding: '2px 8px' }}>SELECTED</span>}
                  </div>
                  <p style={{ fontSize: 22, fontWeight: 800, color: c, margin: '0 0 4px', fontFamily: 'var(--font-space-grotesk)' }}>{plan.dailyROI}%</p>
                  <p style={{ fontSize: 11, color: 'var(--dim)', margin: 0 }}>daily ROI</p>
                  <div style={{ borderTop: '1px solid rgba(var(--veil-rgb),0.06)', marginTop: 12, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <p style={{ fontSize: 11, color: 'var(--dim)', margin: 0 }}><span style={{ color: 'var(--text-2)' }}>{plan.duration} days</span> lock period</p>
                    <p style={{ fontSize: 11, color: 'var(--dim)', margin: 0 }}>₹{plan.minAmount.toLocaleString('en-IN')} – ₹{plan.maxAmount.toLocaleString('en-IN')}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {selectedPlan && (
            <form onSubmit={handleSubmit}>
              <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--dim)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Investment Amount (₹)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: 'var(--dim)', fontWeight: 600 }}>₹</span>
                      <input type="number" placeholder={String(selectedPlan.minAmount)} value={amount}
                        onChange={e => setAmount(e.target.value)}
                        min={selectedPlan.minAmount} max={selectedPlan.maxAmount}
                        style={{ ...INPUT_STYLE, paddingLeft: 32 }} />
                    </div>
                    {amountError && <p style={{ fontSize: 11, color: 'var(--neg)', marginTop: 6 }}>{amountError}</p>}
                    {apiError  && <p style={{ fontSize: 11, color: 'var(--neg)', marginTop: 6 }}>{apiError}</p>}
                  </div>
                  <button type="submit" disabled={!amount || !!amountError || creating || success} style={{
                    padding: '13px 24px',
                    background: success ? 'rgba(52,211,153,0.2)' : 'linear-gradient(135deg, #a78bfa, #818cf8)',
                    border: success ? '1px solid #34d399' : 'none',
                    borderRadius: 10, cursor: !amount || !!amountError ? 'not-allowed' : 'pointer',
                    color: success ? '#34d399' : '#fff', fontSize: 14, fontWeight: 700,
                    opacity: !amount || !!amountError ? 0.5 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontFamily: 'var(--font-inter), sans-serif', transition: 'all 0.3s',
                  }}>
                    {success ? '✓ Investment Created!' : creating ? 'Processing…' : `Invest in ${selectedPlan.name} Plan`}
                  </button>
                </div>

                <div style={{ background: 'rgba(var(--veil-rgb),0.03)', border: '1px solid rgba(var(--veil-rgb),0.06)', borderRadius: 12, padding: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--dim)', marginBottom: 14 }}>
                    Projected Returns
                  </p>
                  {projection ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        { label: 'Daily ROI',                        value: formatINR(projection.daily),   color: '#34d399' },
                        { label: `Total ROI (${selectedPlan.duration}d)`, value: formatINR(projection.total), color: '#22d3ee' },
                        { label: 'Maturity Value',                   value: formatINR(projection.maturity), color: '#a78bfa' },
                      ].map(row => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: 'var(--dim)' }}>{row.label}</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: row.color, fontFamily: 'var(--font-space-grotesk)' }}>{row.value}</span>
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid rgba(var(--veil-rgb),0.06)', paddingTop: 10, marginTop: 2 }}>
                        <p style={{ fontSize: 11, color: 'var(--faint)', textAlign: 'center' }}>
                          Returns at {selectedPlan.dailyROI}% daily
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: 'var(--faint)', textAlign: 'center', marginTop: 20 }}>Enter amount to see projection</p>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      <InvestmentsTable investments={investments} />
    </div>
  )
}
