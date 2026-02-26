import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, AlertTriangle, Clock } from 'lucide-react'
import { metrics, tierMeta } from '../data/metrics'
import ConfidenceBadge from '../components/ui/ConfidenceBadge'
import RadialArc from '../components/ui/RadialArc'
import { trendArrow, timeAgo, confidenceColor } from '../lib/utils'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts'

function displayValue(val) {
  if (val === null || val === undefined) return '—'
  if (typeof val !== 'number') return String(val)
  if (val < 1) return val.toFixed(3)
  if (val >= 1000) return `${(val / 1000).toFixed(2)}K`
  return val.toFixed(val >= 100 ? 1 : 2)
}

export default function MetricDrilldown() {
  const { id } = useParams()
  const metric = metrics.find(m => m.id === id)

  if (!metric) {
    return (
      <div style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-3)', marginBottom: 16 }}>Metric not found: {id}</p>
        <Link to="/dashboard" style={{ color: 'var(--live)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
      </div>
    )
  }

  const {
    name, tier, unit, current_value, trend_30d_pct, confidence, last_updated,
    is_proxy, proxy_note, definition, why_it_matters, sources, thresholds,
    confidence_factors, series, update_frequency, sub_indicators,
  } = metric

  const meta = tierMeta[tier]
  const isInvert = id === 'exchange_balances'
  const trendPositive = isInvert ? trend_30d_pct < 0 : trend_30d_pct > 0
  const confColor = confidenceColor(confidence)

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '40px 32px' }}>
      <Link to="/dashboard" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        color: 'var(--text-3)', fontSize: 13, textDecoration: 'none', marginBottom: 32,
        transition: 'color 150ms',
      }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--live)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
      >
        <ArrowLeft size={14} /> Back to dashboard
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, flexShrink: 0, boxShadow: `0 0 6px ${meta.color}` }} />
          <span style={{ color: 'var(--text-4)', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Tier {tier} · {meta.label}
          </span>
          {is_proxy && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              color: 'var(--warning)', fontSize: 9, fontWeight: 600,
              background: 'var(--warning-tint)', border: '1px solid var(--warning-border)',
              borderRadius: 4, padding: '2px 6px',
            }}>
              <AlertTriangle size={9} /> PROXY — HIGH UNCERTAINTY
            </span>
          )}
        </div>
        <h1 style={{ color: 'var(--text-1)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'var(--font)' }}>
          {name}
        </h1>
      </div>

      {is_proxy && (
        <div className="g2" style={{
          marginBottom: 24, padding: '16px 20px',
          border: '1px solid var(--neutral-border)', borderLeft: '3px solid var(--neutral)',
          borderRadius: 12, display: 'flex', gap: 12,
        }}>
          <AlertTriangle size={16} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ color: 'var(--warning)', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Proxy Metric — Treat as Directional Only</p>
            <p style={{ color: 'var(--text-3)', fontSize: 12, lineHeight: 1.6 }}>{proxy_note}</p>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
        {/* Hero — wider */}
        <div className="g2 inset-well" style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ color: 'var(--text-4)', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Current</div>
          <div style={{
            color: 'var(--text-1)', fontSize: 48, fontWeight: 700,
            fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 4,
          }}>
            {displayValue(current_value)}
          </div>
          <div style={{ color: 'var(--text-3)', fontSize: 13 }}>{unit}</div>
        </div>

        <div className="g2" style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ color: 'var(--text-4)', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>30d Trend</div>
          <div style={{
            fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-data)',
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 4,
            color: trendPositive ? 'var(--positive)' : 'var(--negative)',
          }}>
            {trendArrow(trend_30d_pct, isInvert)} {Math.abs(trend_30d_pct).toFixed(1)}%
          </div>
          <div style={{ color: 'var(--text-3)', fontSize: 11 }}>{isInvert ? 'decline = positive' : 'change'}</div>
        </div>

        <div className="g2" style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <RadialArc value={confidence} size={56} color={confColor} strokeWidth={3} label={`${confidence}`} />
          <div style={{ color: 'var(--text-4)', fontSize: 10, textAlign: 'center' }}>Confidence</div>
        </div>

        <div className="g2" style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ color: 'var(--text-4)', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Updated</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-1)', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
            <Clock size={12} style={{ color: 'var(--text-4)' }} />{timeAgo(last_updated)}
          </div>
          <div style={{ color: 'var(--text-4)', fontSize: 11, textTransform: 'capitalize' }}>{update_frequency}</div>
        </div>
      </div>

      {series && (
        <div className="g2" style={{ border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
          <h2 style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>90-Day History</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={series} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="oklch(1 0 0 / 0.04)" strokeDasharray="none" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'oklch(0.30 0.006 264)', fontSize: 9, fontFamily: 'var(--font-data)' }} tickLine={false} axisLine={false} tickFormatter={v => v.slice(5)} interval={14} />
              <YAxis tick={{ fill: 'oklch(0.30 0.006 264)', fontSize: 9, fontFamily: 'var(--font-data)' }} tickLine={false} axisLine={false} width={40} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v.toFixed(0)} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="g4" style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ color: 'var(--text-4)', fontSize: 10, marginBottom: 4 }}>{payload[0].payload.date}</div>
                    <div style={{ color: meta.color, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums' }}>
                      {payload[0].value?.toFixed(2)} {unit}
                    </div>
                  </div>
                )
              }} />
              {thresholds?.map((t, i) => (
                <ReferenceLine key={i} y={t.value} stroke={meta.color} strokeDasharray="3 3" strokeOpacity={0.45}
                  label={{ value: t.label, fill: meta.color, fontSize: 9, position: 'right' }}
                />
              ))}
              <Line type="monotone" dataKey="value" stroke={meta.color} strokeWidth={2} dot={false}
                activeDot={{ r: 4, fill: meta.color, strokeWidth: 0, style: { filter: `drop-shadow(0 0 4px ${meta.color})` } }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {sub_indicators && (
        <div className="g2" style={{ border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
          <h2 style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Milestone Status</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sub_indicators.map(s => (
              <div key={s.id} className="g3" style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 16px', borderRadius: 10,
                border: s.value === 1 ? '1px solid var(--positive-border)' : '1px solid var(--border)',
                boxShadow: s.value === 1 ? '0 0 12px var(--positive-glow)' : 'none',
              }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: s.value === 1 ? 'var(--positive)' : 'var(--border-strong)', boxShadow: s.value === 1 ? '0 0 5px var(--positive-glow)' : 'none' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--text-2)', fontSize: 13 }}>{s.label}</p>
                  <p style={{ color: 'var(--text-4)', fontSize: 11, marginTop: 2 }}>{s.notes}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6, color: s.value === 1 ? 'var(--positive)' : 'var(--text-4)', background: s.value === 1 ? 'var(--positive-tint)' : 'oklch(1 0 0 / 0.04)' }}>
                  {s.value === 1 ? 'Live' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="g2" style={{ border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px' }}>
          <h2 style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Definition</h2>
          <p style={{ color: 'var(--text-3)', fontSize: 13, lineHeight: 1.7 }}>{definition}</p>
        </div>
        <div className="g2" style={{ border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px' }}>
          <h2 style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Why It Matters</h2>
          <p style={{ color: 'var(--text-3)', fontSize: 13, lineHeight: 1.7 }}>{why_it_matters}</p>
        </div>
      </div>

      {thresholds && thresholds.length > 0 && (
        <div className="g2" style={{ border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', marginBottom: 16 }}>
          <h2 style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Threshold Lines</h2>
          {thresholds.map((t, i) => {
            const hit = t.direction === 'above' ? current_value >= t.value : current_value <= t.value
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < thresholds.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: hit ? 'var(--positive)' : 'var(--border-strong)', boxShadow: hit ? '0 0 5px var(--positive-glow)' : 'none' }} />
                <span style={{ color: 'var(--text-2)', fontSize: 12, flex: 1 }}>{t.label}</span>
                <span style={{ color: 'var(--text-4)', fontSize: 11, fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums' }}>
                  {t.direction === 'above' ? '≥' : '≤'} {t.value} {unit}{t.sustained_days ? ` (${t.sustained_days}d)` : ''}
                </span>
                <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 5, color: hit ? 'var(--positive)' : 'var(--text-4)', background: hit ? 'var(--positive-tint)' : 'oklch(1 0 0 / 0.04)' }}>
                  {hit ? 'Met' : 'Pending'}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="g2" style={{ border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px' }}>
          <h2 style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Data Sources</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sources?.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 4, background: s.reliability === 'high' ? 'var(--positive)' : s.reliability === 'medium' ? 'var(--neutral)' : 'var(--negative)' }} />
                <div>
                  <a href={s.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--live)', fontSize: 12, textDecoration: 'none' }}>
                    {s.source_name} <ExternalLink size={9} />
                  </a>
                  <div style={{ color: 'var(--text-4)', fontSize: 10, marginTop: 2, textTransform: 'capitalize' }}>{s.reliability} reliability</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="g2" style={{ border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px' }}>
          <h2 style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Confidence Factors</h2>
          <div style={{ marginBottom: 14 }}><ConfidenceBadge score={confidence} /></div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {confidence_factors?.map((f, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-3)', fontSize: 12 }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border-strong)', flexShrink: 0 }} />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
