import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Award, Star, RefreshCw } from 'lucide-react'
import { fetchWeeklyHistory } from '../lib/api'

// Hardcoded historical snapshots (older than API data range)
const historicalSnapshots = [
  { week:'2026-02-17', label:'Week of Feb 17', xp_start:1780, xp_end:1877, xp_delta:97, phase_start:2, phase_end:2, new_badges:[], summary:'RLUSD market cap climbed 7.1% to $485M — approaching Phase 2 L2 unlock threshold. ETF holdings added 12M XRP. Exchange balance decline continued for 14th consecutive day.', highlights:[{type:'metric',text:'RLUSD mcap: $452M → $485M (+7.1%)',positive:true},{type:'metric',text:'ETF Holdings: 511M → 523M XRP (+2.3%)',positive:true},{type:'metric',text:'RLUSD daily volume reached $19.1M (new record)',positive:true},{type:'metric',text:'Bridge proxy volume flat at $0.7M/day',positive:false}] },
  { week:'2026-02-10', label:'Week of Feb 10', xp_start:1690, xp_end:1780, xp_delta:90, phase_start:2, phase_end:2, new_badges:[], summary:'Exchange balances broke below 13.5B XRP for the first time in 18 months — a meaningful supply floor signal. RLUSD continued its rapid growth trajectory.', highlights:[{type:'metric',text:'Exchange balances: 13.7B → 13.2B XRP (-3.6%)',positive:true},{type:'metric',text:'RLUSD mcap: $415M → $452M (+8.9%)',positive:true},{type:'metric',text:'AMM TVL reached $36M (+12% WoW)',positive:true},{type:'metric',text:'DEX volume soft — $5.8M avg/day',positive:false}] },
  { week:'2026-02-03', label:'Week of Feb 3', xp_start:1555, xp_end:1690, xp_delta:135, phase_start:2, phase_end:2, new_badges:['B04'], summary:'B04 "Cash Layer Forming" badge unlocked — RLUSD crossed $100M and sustained it. RLUSD at $393M by week end with no signs of slowing. Major week for Phase 2 progression.', highlights:[{type:'badge',text:'Badge unlocked: Cash Layer Forming',positive:true},{type:'metric',text:'RLUSD mcap crossed $100M → sustained → badge triggered',positive:true},{type:'metric',text:'ETF holdings crossed 500M XRP (Phase 1 L3 approach)',positive:true},{type:'metric',text:'Tokenized AUM up to $162M (+7% WoW)',positive:true}] },
  { week:'2026-01-27', label:'Week of Jan 27', xp_start:1420, xp_end:1555, xp_delta:135, phase_start:1, phase_end:2, new_badges:['B03'], summary:'Phase 2 "Cash Layer Forms" unlocked — the single biggest progression event since launch. Exchange balance 30d decline exceeded 5%, triggering the "Supply Draining" badge. RLUSD growth accelerating.', highlights:[{type:'phase',text:'Phase 2 UNLOCKED: Cash Layer Forms',positive:true},{type:'badge',text:'Badge unlocked: Supply Draining',positive:true},{type:'metric',text:'30d exchange balance decline crossed -5% threshold',positive:true},{type:'metric',text:'RLUSD mcap hit $88M (approaching $100M badge)',positive:true}] },
  { week:'2026-01-20', label:'Week of Jan 20', xp_start:1350, xp_end:1420, xp_delta:70, phase_start:1, phase_end:1, new_badges:['B02'], summary:'ETF/ETP holdings crossed 250M XRP with 7 days of sustained accumulation — triggering the "ETF Adoption Igniting" badge. ETF structure continues maturing.', highlights:[{type:'badge',text:'Badge unlocked: ETF Adoption Igniting',positive:true},{type:'metric',text:'ETF holdings: 247M → 268M XRP (sustained 7d above 250M)',positive:true},{type:'metric',text:'RLUSD launched on 3 additional exchange platforms',positive:true},{type:'metric',text:'Order book depth at 2% reached $39M',positive:true}] },
]

function pct(start, end) {
  if (!start || !end) return null
  return +(((end - start) / start) * 100).toFixed(1)
}

function DeltaRow({ label, start, end, unit = '', positive_direction = 'up' }) {
  if (start == null || end == null) return null
  const delta = pct(start, end)
  const up = end >= start
  const isPositive = positive_direction === 'up' ? up : !up
  const color = isPositive ? 'var(--positive)' : 'var(--negative)'
  const Icon = up ? TrendingUp : TrendingDown

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icon size={11} style={{ color, flexShrink: 0 }} />
      <span style={{ fontSize: 12, lineHeight: 1.4, color: 'var(--text-3)' }}>
        {label}:{' '}
        <span style={{ color: 'var(--text-2)', fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums' }}>
          {start}{unit} → {end}{unit}
        </span>
        {delta !== null && (
          <span style={{ color, marginLeft: 5, fontSize: 11 }}>
            ({delta > 0 ? '+' : ''}{delta}%)
          </span>
        )}
      </span>
    </div>
  )
}

function LiveWeekCard({ snap }) {
  const xrpDelta = pct(snap.xrp_start, snap.xrp_end)

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute', left: -33, top: 20,
        width: 12, height: 12, borderRadius: '50%',
        background: 'var(--accent)',
        border: '2px solid var(--accent)',
        boxShadow: '0 0 8px var(--accent)',
      }} />

      <div className="g2" style={{
        border: '1px solid var(--border)',
        borderRadius: 16, padding: '20px 24px',
        transition: 'border-color 200ms var(--ease-snap)',
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--text-4)', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{snap.label}</span>
            <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 5, color: 'var(--accent)', background: 'oklch(0.55 0.20 215 / 0.12)', border: '1px solid oklch(0.55 0.20 215 / 0.25)' }}>
              Live
            </span>
          </div>
          {xrpDelta !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {xrpDelta >= 0
                ? <TrendingUp size={12} style={{ color: 'var(--positive)' }} />
                : <TrendingDown size={12} style={{ color: 'var(--negative)' }} />}
              <span style={{
                color: xrpDelta >= 0 ? 'var(--positive)' : 'var(--negative)',
                fontSize: 13, fontWeight: 700,
                fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums',
              }}>
                XRP {xrpDelta > 0 ? '+' : ''}{xrpDelta}%
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <DeltaRow label="XRP price" start={snap.xrp_start != null ? `$${snap.xrp_start}` : null} end={snap.xrp_end != null ? `$${snap.xrp_end}` : null} unit="" positive_direction="up" />
          <DeltaRow label="RLUSD mcap" start={snap.rlusd_mcap_start != null ? `$${snap.rlusd_mcap_start}M` : null} end={snap.rlusd_mcap_end != null ? `$${snap.rlusd_mcap_end}M` : null} unit="" positive_direction="up" />
          <DeltaRow label="AMM TVL" start={snap.amm_tvl_start != null ? `$${snap.amm_tvl_start}M` : null} end={snap.amm_tvl_end != null ? `$${snap.amm_tvl_end}M` : null} unit="" positive_direction="up" />
          {snap.dex_vol_avg != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: 'var(--text-4)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                DEX volume avg:{' '}
                <span style={{ color: 'var(--text-2)', fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums' }}>
                  ${snap.dex_vol_avg}M/day
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function HistoricalWeekCard({ snap }) {
  const isMilestone = snap.new_badges.length > 0 || snap.phase_end > snap.phase_start
  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute', left: -33, top: 20,
        width: 12, height: 12, borderRadius: '50%',
        background: isMilestone ? 'var(--macro)' : 'var(--bg-raised)',
        border: `2px solid ${isMilestone ? 'var(--macro)' : 'var(--border-mid)'}`,
        boxShadow: isMilestone ? '0 0 10px var(--macro-glow)' : 'none',
      }} />

      <div className="g2" style={{
        border: '1px solid var(--border)',
        borderRadius: 16, padding: '20px 24px',
        transition: 'border-color 200ms var(--ease-snap)',
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--text-4)', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{snap.label}</span>
            {snap.phase_end > snap.phase_start && (
              <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 5, color: 'var(--live)', background: 'var(--live-tint)', border: '1px solid var(--live-border)' }}>
                Phase {snap.phase_end} Unlocked
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <TrendingUp size={12} style={{ color: 'var(--macro)' }} />
            <span style={{ color: 'var(--macro)', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums' }}>
              +{snap.xp_delta} XP
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ color: 'var(--text-4)', fontSize: 11, fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums', minWidth: 32 }}>{snap.xp_start.toLocaleString()}</span>
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ height: 3, borderRadius: 99, background: 'oklch(1 0 0 / 0.06)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 99, width: `${(snap.xp_end / 10000) * 100}%`, background: 'linear-gradient(90deg, oklch(0.50 0.24 278), oklch(0.72 0.18 278))' }} />
            </div>
          </div>
          <span style={{ color: 'var(--macro)', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums', minWidth: 32, textAlign: 'right' }}>{snap.xp_end.toLocaleString()}</span>
        </div>

        <p style={{ color: 'var(--text-3)', fontSize: 12, lineHeight: 1.7, marginBottom: 14 }}>{snap.summary}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          {snap.highlights.map((h, j) => (
            <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {h.type === 'badge' ? (
                <Award size={11} style={{ color: 'var(--macro)', flexShrink: 0, filter: 'drop-shadow(0 0 3px var(--macro-glow))' }} />
              ) : h.type === 'phase' ? (
                <Star size={11} style={{ color: 'var(--live)', flexShrink: 0, filter: 'drop-shadow(0 0 3px var(--live-glow))' }} />
              ) : (
                <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: h.positive ? 'var(--positive)' : 'var(--negative)', boxShadow: h.positive ? '0 0 4px var(--positive-glow)' : 'none' }} />
              )}
              <span style={{ fontSize: 12, lineHeight: 1.4, color: h.type === 'badge' ? 'var(--macro)' : h.type === 'phase' ? 'var(--live)' : h.positive ? 'var(--text-3)' : 'var(--negative)' }}>
                {h.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Timeline() {
  const [liveWeeks, setLiveWeeks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchWeeklyHistory(8)
      setLiveWeeks(data)
      setLastUpdated(new Date())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Deduplicate: hide hardcoded snapshots whose week key appears in live data
  const liveKeys = new Set(liveWeeks.map(w => w.week))
  const olderSnapshots = historicalSnapshots.filter(s => !liveKeys.has(s.week))

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
        <div>
          <h1 style={{ color: 'var(--text-1)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Timeline</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Weekly snapshots — what changed, XP progression, and milestone events.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 8, padding: '6px 12px',
            color: 'var(--text-3)', fontSize: 12, cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 24, padding: '10px 14px', borderRadius: 8, background: 'oklch(0.45 0.22 25 / 0.12)', border: '1px solid oklch(0.45 0.22 25 / 0.3)', color: 'var(--negative)', fontSize: 12 }}>
          Failed to load live data: {error}. Showing historical snapshots only.
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 19, top: 0, bottom: 0, width: 1,
          background: 'linear-gradient(to bottom, transparent, oklch(1 0 0 / 0.08) 5%, oklch(1 0 0 / 0.08) 95%, transparent)',
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingLeft: 52 }}>
          {loading && liveWeeks.length === 0 && (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ height: 120, borderRadius: 16, background: 'oklch(1 0 0 / 0.03)', border: '1px solid var(--border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))
          )}

          {liveWeeks.map(snap => (
            <LiveWeekCard key={snap.week} snap={snap} />
          ))}

          {olderSnapshots.length > 0 && liveWeeks.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ color: 'var(--text-4)', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0 }}>Historical</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
          )}

          {olderSnapshots.map(snap => (
            <HistoricalWeekCard key={snap.week} snap={snap} />
          ))}
        </div>
      </div>
    </div>
  )
}
