'use client'

interface SparklineProps {
  data: number[]
  color?: string
  width?: number
  height?: number
  filled?: boolean
}

export default function Sparkline({
  data,
  color = '#a78bfa',
  width = 80,
  height = 32,
  filled = true,
}: SparklineProps) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pad = 2

  const xs = data.map((_, i) => pad + (i / (data.length - 1)) * (width - pad * 2))
  const ys = data.map((v) => pad + ((max - v) / range) * (height - pad * 2))

  const linePath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ')
  const areaPath = `${linePath} L${xs[xs.length - 1]},${height} L${xs[0]},${height} Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      {filled && (
        <path d={areaPath} fill={color} opacity={0.15} />
      )}
      <path d={linePath} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
