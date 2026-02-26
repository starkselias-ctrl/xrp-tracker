import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { useRef } from 'react'

export default function SparklineChart({ data, color, invert = false }) {
  const idRef = useRef(`sp-${Math.random().toString(36).slice(2, 8)}`)

  if (!data?.length) {
    return (
      <div style={{ height: 64, background: 'oklch(1 0 0 / 0.03)', borderRadius: 6 }} />
    )
  }

  const chartData = data.map((v, i) => ({ i, v }))
  const trend = data[data.length - 1] - data[0]
  const isPositive = invert ? trend < 0 : trend > 0
  const resolvedColor = color || (isPositive ? 'oklch(0.72 0.19 145)' : 'oklch(0.65 0.22 25)')

  return (
    <div style={{ position: 'relative' }}>
      <ResponsiveContainer width="100%" height={64}>
        <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={idRef.current} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={resolvedColor} stopOpacity={0.25} />
              <stop offset="100%" stopColor={resolvedColor} stopOpacity={0.00} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={resolvedColor}
            strokeWidth={2}
            fill={`url(#${idRef.current})`}
            dot={false}
            isAnimationActive={false}
            activeDot={{
              r: 3,
              fill: resolvedColor,
              strokeWidth: 0,
              style: { filter: `drop-shadow(0 0 3px ${resolvedColor})` },
            }}
          />
          <Tooltip
            cursor={{ stroke: 'oklch(1 0 0 / 0.06)', strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="g4" style={{
                  border: '1px solid var(--border-mid)',
                  borderRadius: 6, padding: '3px 8px',
                  fontSize: 11, color: 'var(--text-1)',
                  fontFamily: 'var(--font-data)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {Number(payload[0].value).toFixed(2)}
                </div>
              )
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
      {/* Scanline overlay */}
      <div className="scanline" />
    </div>
  )
}
