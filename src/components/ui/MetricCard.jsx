import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowUpRight } from 'lucide-react'
import SparklineChart from './SparklineChart'
import ConfidenceBadge from './ConfidenceBadge'
import { timeAgo } from '../../lib/utils'
import { tierMeta } from '../../data/metrics'

const TIER_COLORS = {
  1: 'oklch(0.72 0.19 145)',
  2: 'oklch(0.68 0.17 215)',
  3: 'oklch(0.65 0.22 278)',
  4: 'oklch(0.78 0.17 70)',
  5: 'oklch(0.65 0.22 25)',
}

function fmt(value) {
  if (value === null || value === undefined) return '—'
  if (typeof value !== 'number') return String(value)
  if (Math.abs(value) >= 1000) return (value / 1000).toFixed(1) + 'K'
  if (Math.abs(value) < 1 && value !== 0) return value.toFixed(3)
  if (Math.abs(value) >= 100) return Math.round(value).toLocaleString()
  return value.toFixed(1)
}

export default function MetricCard({ metric, liveValue }) {
  const { id, name, short_name, tier, unit, current_value, trend_30d_pct,
    confidence, last_updated, is_proxy, sparkline } = metric

  const color = TIER_COLORS[tier]
  const meta = tierMeta[tier]
  const isInvert = id === 'exchange_balances'
  const trendPositive = isInvert ? trend_30d_pct < 0 : trend_30d_pct > 0
  const displayValue = liveValue != null ? liveValue : current_value
  const isLive = liveValue != null

  return (
    <Link
      to={`/metric/${id}`}
      className="g2 card-lift"
      style={{
        display: 'flex', flexDirection: 'column',
        border: '1px solid var(--border)',
        borderRadius: 16, padding: 20,
        textDecoration: 'none',
        transition: 'border-color 200ms var(--ease-snap), transform 200ms var(--ease-snap), box-shadow 200ms var(--ease-snap)',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-mid)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0,
            boxShadow: `0 0 6px ${color}`,
          }} />
          <span style={{ color: 'var(--text-4)', fontSize: 10, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            T{tier} · {meta.label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {is_proxy && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 3,
              color: 'var(--warning)', fontSize: 9, fontWeight: 600,
              background: 'var(--warning-tint)', border: '1px solid var(--warning-border)',
              borderRadius: 4, padding: '2px 5px',
            }}>
              <AlertTriangle size={8} /> PROXY
            </span>
          )}
          {isLive && (
            <span style={{
              fontSize: 8, fontWeight: 700, letterSpacing: '0.10em',
              fontFamily: 'var(--font-data)',
              color: 'var(--positive)', background: 'var(--positive-tint)',
              border: '1px solid var(--positive-border)',
              borderRadius: 3, padding: '2px 5px',
            }}>
              LIVE
            </span>
          )}
          <ArrowUpRight size={12} style={{ color: 'var(--text-4)' }} />
        </div>
      </div>

      {/* Name */}
      <div style={{ color: 'var(--text-2)', fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
        {short_name || name}
      </div>

      {/* Hero number — inset data well */}
      <div className="inset-well" style={{ marginBottom: 10, padding: '10px 14px' }}>
        <span style={{
          fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1,
          color: isLive ? 'var(--text-1)' : 'var(--text-2)',
          fontFamily: 'var(--font-data)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {fmt(displayValue)}
        </span>
        <span style={{ color: 'var(--text-3)', fontSize: 13, marginLeft: 6 }}>{unit}</span>
      </div>

      {/* Trend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '2px 8px', borderRadius: 5,
          fontSize: 11, fontWeight: 600,
          fontFamily: 'var(--font-data)',
          fontVariantNumeric: 'tabular-nums',
          color: trendPositive ? 'var(--positive)' : 'var(--negative)',
          background: trendPositive ? 'var(--positive-tint)' : 'var(--negative-tint)',
          border: `1px solid ${trendPositive ? 'var(--positive-border)' : 'var(--negative-border)'}`,
          boxShadow: trendPositive ? '0 0 8px var(--positive-glow)' : 'none',
        }}>
          {trendPositive ? '↑' : '↓'} {Math.abs(trend_30d_pct).toFixed(1)}%
        </span>
        <span style={{ color: 'var(--text-4)', fontSize: 11 }}>vs 30d ago</span>
      </div>

      {/* Sparkline */}
      <div style={{ flex: 1 }}>
        <SparklineChart data={sparkline} color={color} invert={isInvert} />
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 12, marginTop: 12,
      }}>
        <div className="scan-divider" style={{ display: 'none' }} />
        <ConfidenceBadge score={confidence} />
        <span style={{ color: 'var(--text-4)', fontSize: 10, fontFamily: 'var(--font-data)' }}>
          {timeAgo(last_updated)}
        </span>
      </div>
    </Link>
  )
}
