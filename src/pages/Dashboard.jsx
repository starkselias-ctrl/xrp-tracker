import { useState } from 'react'
import { metrics, tierMeta } from '../data/metrics'
import MetricCard from '../components/ui/MetricCard'
import { useLiveData } from '../context/LiveDataContext'

const TIER_COLORS = {
  1:'oklch(0.72 0.19 145)', 2:'oklch(0.68 0.17 215)',
  3:'oklch(0.65 0.22 278)', 4:'oklch(0.78 0.17 70)', 5:'oklch(0.65 0.22 25)',
}

export default function Dashboard() {
  const [activeTier, setActiveTier] = useState(0)
  const filtered = activeTier === 0 ? metrics : metrics.filter(m => m.tier === activeTier)
  const { metrics: live, loading: liveLoading, lastUpdated } = useLiveData()

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ color: 'var(--text-1)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
          Dashboard
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <p style={{ color: 'var(--text-3)', fontSize: 14 }}>
            {metrics.length} market structure metrics — live signals with source citations and confidence scores.
          </p>
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
              background: liveLoading ? 'var(--neutral)' : 'var(--positive)',
              boxShadow: liveLoading ? 'none' : '0 0 6px var(--positive-glow)',
              animation: liveLoading ? 'none' : 'pulse-live 2s ease-in-out infinite',
            }} />
            <span style={{
              color: 'var(--text-4)', fontSize: 10, fontFamily: 'var(--font-data)',
              letterSpacing: '0.06em',
            }}>
              {liveLoading ? 'FETCHING...' : lastUpdated
                ? `LIVE · ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'LIVE'}
            </span>
          </div>
        </div>
      </div>

      {/* Tier filter — instrument panel */}
      <div className="g1" style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32,
        padding: '8px 10px', borderRadius: 12,
        border: '1px solid var(--border)',
        flexWrap: 'wrap',
      }}>
        {[0,1,2,3,4,5].map(t => {
          const isActive = activeTier === t
          const color = t === 0 ? 'var(--live)' : TIER_COLORS[t]
          return (
            <button key={t} onClick={() => setActiveTier(t)} style={{
              padding: '5px 12px', borderRadius: 7,
              fontSize: 12, fontWeight: isActive ? 600 : 400, cursor: 'pointer',
              color: isActive ? color : 'var(--text-4)',
              background: isActive ? `${TIER_COLORS[t] ?? 'oklch(0.68 0.17 215)'} / 0)`.replace(' / 0)', ' / 0.12)') : 'transparent',
              border: `1px solid ${isActive ? color : 'transparent'}`,
              boxShadow: isActive ? `0 0 10px ${color}28` : 'none',
              fontFamily: isActive ? 'var(--font-data)' : 'var(--font)',
              transition: 'all 150ms var(--ease-snap)',
            }}>
              {t === 0 ? 'All' : `T${t} · ${tierMeta[t].label}`}
            </button>
          )
        })}
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {filtered.map(m => (
          <MetricCard key={m.id} metric={m} liveValue={live[m.id] ?? null} />
        ))}
      </div>

      {/* Footer note */}
      <div className="g1" style={{
        marginTop: 40, padding: '16px 20px', borderRadius: 12,
        border: '1px solid var(--border)',
      }}>
        <p style={{ color: 'var(--text-3)', fontSize: 12, lineHeight: 1.6 }}>
          <span style={{ color: 'var(--warning)', fontWeight: 500 }}>PROXY metrics</span> are derived calculations, not direct measurements.
          Confidence scores below 50 carry high uncertainty — treat as directional signals only.
          Market structure tracking only — not financial advice.
        </p>
      </div>
    </div>
  )
}
