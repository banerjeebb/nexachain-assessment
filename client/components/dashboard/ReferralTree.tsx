'use client'

import { useState } from 'react'
import Icon from '../ui/Icon'
import { avFor, initials, levelColor } from '@/lib/utils'
import type { TreeNode } from '@/lib/types'

function countTree(node: TreeNode): number {
  return 1 + node.children.reduce((s, c) => s + countTree(c), 0)
}

function TreeNodeItem({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 2)
  const hasChildren = node.children.length > 0
  const color = depth === 0 ? '#a78bfa' : levelColor(depth)

  return (
    <div style={{
      marginLeft: depth === 0 ? 0 : 20,
      borderLeft: depth > 0 ? '1px solid rgba(var(--veil-rgb),0.07)' : 'none',
      paddingLeft: depth > 0 ? 16 : 0,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 10px', borderRadius: 10, marginBottom: 2,
        background: open && hasChildren ? `${color}08` : 'transparent',
        transition: 'background 0.15s',
      }}>
        {/* Avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: avFor(node.fullName),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff',
          border: depth === 0 ? `2px solid ${color}` : 'none',
        }}>
          {initials(node.fullName)}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
            {node.fullName}
            {depth > 0 && (
              <span style={{
                display: 'inline-flex', padding: '1px 6px', borderRadius: 99,
                background: `${color}18`, color, fontSize: 10, fontWeight: 700,
                textTransform: 'uppercase',
              }}>
                L{depth}
              </span>
            )}
          </p>
          <p style={{ fontSize: 10, color: 'var(--dim)', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
            {node.referralCode}
          </p>
        </div>

        {/* Toggle */}
        {hasChildren && (
          <button
            onClick={() => setOpen((o) => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 9px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: `${color}14`, color,
              fontSize: 12, fontWeight: 600,
              fontFamily: 'var(--font-inter), sans-serif',
              transition: 'all 0.15s',
            }}
          >
            {node.children.length}
            <Icon name={open ? 'chevronUp' : 'chevronDown'} size={12} color={color} />
          </button>
        )}
      </div>

      {open && hasChildren && (
        <div className="animate-fade-in">
          {node.children.map((child) => (
            <TreeNodeItem key={child._id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ReferralTree({ tree }: { tree: TreeNode | null }) {
  if (!tree) return (
    <p style={{ fontSize: 13, color: 'var(--dim)', textAlign: 'center', padding: '24px 0' }}>
      No network data yet
    </p>
  )

  const total = countTree(tree) - 1

  return (
    <div style={{
      background: 'rgba(var(--surface-rgb),0.92)',
      border: '1px solid rgba(var(--veil-rgb),0.08)',
      borderRadius: 14,
      backdropFilter: 'blur(24px)',
      padding: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
          Referral Tree
        </p>
        <span style={{
          padding: '3px 10px', borderRadius: 99,
          background: 'rgba(167,139,250,0.13)', color: '#a78bfa',
          fontSize: 12, fontWeight: 700,
        }}>
          {total} members
        </span>
      </div>
      <TreeNodeItem node={tree} depth={0} />
    </div>
  )
}
