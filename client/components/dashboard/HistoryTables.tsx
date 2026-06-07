'use client'

import { useState } from 'react'
import { MOCK_INVESTMENTS, MOCK_ROI_HISTORY, MOCK_REFERRAL_INCOME } from '@/lib/mock'
import { formatDate, formatINR, levelColor } from '@/lib/utils'
import Icon from '../ui/Icon'

const CARD: React.CSSProperties = {
  background: 'rgba(var(--surface-rgb),0.92)',
  border: '1px solid rgba(var(--veil-rgb),0.08)',
  borderRadius: 14,
  backdropFilter: 'blur(24px)',
  overflow: 'hidden',
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string }> = {
    active:    { bg: 'rgba(52,211,153,0.13)',  color: '#34d399' },
    completed: { bg: 'rgba(167,139,250,0.13)', color: '#a78bfa' },
    cancelled: { bg: 'rgba(251,113,133,0.13)', color: '#fb7185' },
    credited:  { bg: 'rgba(52,211,153,0.13)',  color: '#34d399' },
    pending:   { bg: 'rgba(251,191,36,0.13)',  color: '#fbbf24' },
    failed:    { bg: 'rgba(251,113,133,0.13)', color: '#fb7185' },
  }
  const { bg, color } = cfg[status] ?? { bg: 'rgba(136,141,163,0.1)', color: '#888da3' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 99,
      background: bg, color, fontSize: 11, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {status}
    </span>
  )
}

// ─── Table primitives ─────────────────────────────────────────────────────────
const TH = ({ children }: { children: React.ReactNode }) => (
  <th style={{
    padding: '10px 14px', textAlign: 'left',
    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.07em', color: 'var(--dim)',
    borderBottom: '1px solid rgba(var(--veil-rgb),0.07)',
    whiteSpace: 'nowrap',
  }}>
    {children}
  </th>
)

const TD = ({ children, mono }: { children: React.ReactNode; mono?: boolean }) => (
  <td style={{
    padding: '12px 14px',
    fontSize: 13, color: 'var(--text-2)',
    borderBottom: '1px solid rgba(var(--veil-rgb),0.04)',
    fontFamily: mono ? 'var(--font-jetbrains-mono), monospace' : undefined,
  }}>
    {children}
  </td>
)

// ─── Paginated wrapper ────────────────────────────────────────────────────────
function Paginated<T>({
  data, pageSize = 8, renderHeader, renderRow,
}: {
  data: T[]
  pageSize?: number
  renderHeader: () => React.ReactNode
  renderRow: (item: T, i: number) => React.ReactNode
}) {
  const [page, setPage] = useState(0)
  const total = Math.ceil(data.length / pageSize)
  const slice = data.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse' }}>
          <thead><tr>{renderHeader()}</tr></thead>
          <tbody>{slice.map((item, i) => renderRow(item, i))}</tbody>
        </table>
      </div>

      {total > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: '12px 14px' }}>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              background: 'rgba(var(--veil-rgb),0.05)', border: '1px solid rgba(var(--veil-rgb),0.1)',
              borderRadius: 7, padding: '4px 10px', cursor: page === 0 ? 'not-allowed' : 'pointer',
              opacity: page === 0 ? 0.4 : 1, color: 'var(--dim)',
              display: 'flex', alignItems: 'center',
            }}
          >
            <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}>
              <Icon name="chevronRight" size={14} color="var(--dim)" />
            </span>
          </button>
          <span style={{ fontSize: 12, color: 'var(--dim)' }}>{page + 1} / {total}</span>
          <button
            onClick={() => setPage((p) => Math.min(total - 1, p + 1))}
            disabled={page === total - 1}
            style={{
              background: 'rgba(var(--veil-rgb),0.05)', border: '1px solid rgba(var(--veil-rgb),0.1)',
              borderRadius: 7, padding: '4px 10px', cursor: page === total - 1 ? 'not-allowed' : 'pointer',
              opacity: page === total - 1 ? 0.4 : 1, color: 'var(--dim)',
              display: 'flex', alignItems: 'center',
            }}
          >
            <Icon name="chevronRight" size={14} color="var(--dim)" />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Investment Table ─────────────────────────────────────────────────────────
function InvestmentTable() {
  return (
    <Paginated
      data={MOCK_INVESTMENTS}
      renderHeader={() => <><TH>Plan</TH><TH>Amount</TH><TH>Daily ROI</TH><TH>Start</TH><TH>End</TH><TH>Status</TH></>}
      renderRow={(inv) => (
        <tr key={inv._id}>
          <TD><span style={{ fontWeight: 600, color: 'var(--text)' }}>{inv.planName}</span></TD>
          <TD mono>{formatINR(inv.amount)}</TD>
          <TD mono>{inv.dailyROIPercent}%</TD>
          <TD>{formatDate(inv.startDate)}</TD>
          <TD>{formatDate(inv.endDate)}</TD>
          <TD><StatusBadge status={inv.status} /></TD>
        </tr>
      )}
    />
  )
}

// ─── ROI History Table ────────────────────────────────────────────────────────
function ROIHistoryTable() {
  return (
    <Paginated
      data={MOCK_ROI_HISTORY}
      renderHeader={() => <><TH>Date</TH><TH>Plan</TH><TH>Investment</TH><TH>ROI Amount</TH><TH>Status</TH></>}
      renderRow={(r) => (
        <tr key={r._id}>
          <TD>{formatDate(r.date)}</TD>
          <TD>{r.planName}</TD>
          <TD mono>{formatINR(r.amount)}</TD>
          <TD mono><span style={{ color: 'var(--pos)' }}>+{formatINR(r.roiAmount)}</span></TD>
          <TD><StatusBadge status={r.status} /></TD>
        </tr>
      )}
    />
  )
}

// ─── Referral Income Table ────────────────────────────────────────────────────
function ReferralIncomeTable() {
  return (
    <Paginated
      data={MOCK_REFERRAL_INCOME}
      renderHeader={() => <><TH>Date</TH><TH>From</TH><TH>Level</TH><TH>Amount</TH></>}
      renderRow={(r) => {
        const lc = levelColor(r.level)
        return (
          <tr key={r._id}>
            <TD>{formatDate(r.date)}</TD>
            <TD>
              <p style={{ fontWeight: 600, color: 'var(--text)' }}>{r.generatorName}</p>
              <p style={{ fontSize: 11, color: 'var(--dim)', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
                {r.generatorCode}
              </p>
            </TD>
            <TD>
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '2px 8px', borderRadius: 99,
                background: `${lc}18`, color: lc,
                fontSize: 11, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                L{r.level}
              </span>
            </TD>
            <TD mono><span style={{ color: 'var(--accent)' }}>+{formatINR(r.amount)}</span></TD>
          </tr>
        )
      }}
    />
  )
}

// ─── Tabbed HistoryTables ─────────────────────────────────────────────────────
const TABS = [
  { id: 'investments', label: 'Investments',  Component: InvestmentTable    },
  { id: 'roi',         label: 'ROI History',  Component: ROIHistoryTable    },
  { id: 'income',      label: 'Level Income', Component: ReferralIncomeTable },
]

export default function HistoryTables({ defaultTab }: { defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab ?? 'investments')
  const { Component } = TABS.find((t) => t.id === active) ?? TABS[0]

  return (
    <div style={CARD}>
      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 0, padding: '0 20px',
        borderBottom: '1px solid rgba(var(--veil-rgb),0.07)',
      }}>
        {TABS.map((t) => {
          const isActive = t.id === active
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              style={{
                padding: '14px 16px',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                color: isActive ? 'var(--accent)' : 'var(--dim)',
                fontSize: 13, fontWeight: isActive ? 600 : 500,
                fontFamily: 'var(--font-inter), sans-serif',
                marginBottom: -1, transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <Component />
    </div>
  )
}
