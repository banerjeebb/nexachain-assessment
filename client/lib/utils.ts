// ─── Formatters ──────────────────────────────────────────────────────────────

export function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(n)
}

export function compactINR(n: number): string {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)}Cr`
  if (n >= 1_00_000)    return `₹${(n / 1_00_000).toFixed(2)}L`
  if (n >= 1_000)       return `₹${(n / 1_000).toFixed(2)}K`
  return `₹${n.toFixed(2)}`
}

export function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateShort(d: string | Date): string {
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  })
}

// ─── Avatar helpers ───────────────────────────────────────────────────────────

export function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function avFor(name: string): string {
  const colors = ['#a78bfa', '#22d3ee', '#34d399', '#e7b84a', '#fb7185', '#60a5fa']
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff
  return colors[Math.abs(h) % colors.length]
}

// ─── Sparkline generator ──────────────────────────────────────────────────────

export function seedRand(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

export function genSpark(n: number, seed: number, min = 40, max = 100): number[] {
  const rand = seedRand(seed)
  const pts: number[] = []
  let v = min + (max - min) * 0.5
  for (let i = 0; i < n; i++) {
    v = Math.max(min, Math.min(max, v + (rand() - 0.48) * (max - min) * 0.25))
    pts.push(Math.round(v))
  }
  return pts
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function round2(n: number) {
  return Math.round(n * 100) / 100
}

export function statusColor(status: string): string {
  switch (status) {
    case 'active':    return 'badge-pos'
    case 'completed': return 'badge-accent'
    case 'cancelled': return 'badge-neg'
    case 'credited':  return 'badge-pos'
    case 'pending':   return 'badge-warn'
    case 'failed':    return 'badge-neg'
    default:          return 'badge-dim'
  }
}

export function levelColor(level: number): string {
  const colors = ['#a78bfa', '#22d3ee', '#34d399', '#e7b84a', '#fb7185']
  return colors[(level - 1) % colors.length]
}
