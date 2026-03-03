import { useState } from 'react'
import { CheckCircle, Lock } from 'lucide-react'
import { currentScore, phases } from '../data/score'
import { quests } from '../data/quests'
import { badges } from '../data/badges'
import { useLiveData } from '../context/LiveDataContext'
import { PriceChart } from '../components/PriceChart'
import { NewsPanel } from '../components/NewsPanel'
import { MacroAnalyzer } from '../components/MacroAnalyzer'
import '../App.css'

const TC = {
  t1: 'oklch(0.72 0.19 145)',
  t2: 'oklch(0.68 0.17 215)',
  t3: 'oklch(0.65 0.22 278)',
  t4: 'oklch(0.78 0.17 70)',
  t5: 'oklch(0.65 0.22 25)',
}

function signalStrength(pct) {
  if (pct >= 80) return { label: 'Strong',   color: 'var(--positive)' }
  if (pct >= 50) return { label: 'Forming',  color: 'var(--live)'     }
  if (pct >= 20) return { label: 'Early',    color: 'var(--warning)'  }
  return              { label: 'Inactive', color: 'var(--text-4)'   }
}

function TopStat({ label, value }) {
  return (
    <div>
      <div style={{ color: 'var(--text-4)', fontSize: 8, fontFamily: 'var(--font-data)', letterSpacing: '0.07em', marginBottom: 1 }}>{label}</div>
      <div style={{ color: 'var(--text-2)', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  )
}

export default function Home() {
  const { total_xp, max_xp, phase, level_label, tier_scores } = currentScore
  const activeThresholds = quests.filter(q => q.status === 'active')
  const earnedSignals    = badges.filter(b => b.earned)
  const pendingSignals   = badges.filter(b => !b.earned)

  const { metrics: live, loading: liveLoading } = useLiveData()
  const xrpPrice  = live?.xrp_price        ?? null
  const xrpChange = live?.xrp_24h_change   ?? null
  const xrpMcap   = live?.xrp_market_cap   ?? null
  const priceUp   = xrpChange != null ? xrpChange >= 0 : null

  const [holdings, setHoldings] = useState(() => localStorage.getItem('xrt_holdings') ?? '')
  const [pendingEvent, setPendingEvent] = useState(null)

  const holdingsNum   = parseFloat(holdings) || 0
  const holdingsUsd   = xrpPrice != null && holdingsNum > 0 ? holdingsNum * xrpPrice : null
  const holdings24hPnl = holdingsUsd != null && xrpChange != null
    ? holdingsUsd * (xrpChange / (100 + xrpChange))
    : null

  function handleHoldingsChange(e) {
    const val = e.target.value.replace(/[^0-9.]/g, '')
    setHoldings(val)
    localStorage.setItem('xrt_holdings', val)
  }

  return (
    /* root — scopes --t-* vars for tracker components, fills viewport */
    <div
      className="app"
      style={{
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── TOP BAR ──────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        height: 64,
        padding: '0 14px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--glass-1)',
        overflow: 'hidden',
      }}>

        {/* Price */}
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 10,
          paddingRight: 18, borderRight: '1px solid var(--border)', marginRight: 18,
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em',
            fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums',
            color: 'var(--text-1)',
            textShadow: xrpPrice ? '0 0 20px oklch(0.93 0.008 72 / 0.3)' : 'none',
          }}>
            {xrpPrice != null ? `$${xrpPrice.toFixed(4)}` : '———'}
          </span>
          {xrpChange != null && (
            <span style={{
              fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-data)',
              color: priceUp ? 'var(--positive)' : 'var(--negative)',
              textShadow: priceUp ? '0 0 8px var(--positive-glow)' : '0 0 8px var(--negative-glow)',
            }}>
              {priceUp ? '+' : ''}{xrpChange.toFixed(2)}%
            </span>
          )}
          <span style={{ color: 'var(--text-4)', fontSize: 9, fontFamily: 'var(--font-data)', letterSpacing: '0.07em' }}>
            XRP/USD
          </span>
        </div>

        {/* Market stats */}
        <div style={{
          display: 'flex', gap: 18,
          paddingRight: 18, borderRight: '1px solid var(--border)', marginRight: 18,
          flexShrink: 0,
        }}>
          {xrpMcap != null && <TopStat label="MARKET CAP" value={`$${xrpMcap.toFixed(1)}B`} />}
          {live?.rlusd_market_cap != null && (
            <TopStat label="RLUSD MCAP" value={
              live.rlusd_market_cap >= 1000
                ? `$${(live.rlusd_market_cap / 1000).toFixed(2)}B`
                : `$${live.rlusd_market_cap.toFixed(0)}M`
            } />
          )}
          {live?.dex_volume != null && (
            <TopStat label="DEX VOL" value={`$${(live.dex_volume / 1e6).toFixed(1)}M`} />
          )}
        </div>

        {/* Portfolio */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          paddingRight: 18, borderRight: '1px solid var(--border)', marginRight: 18,
          flexShrink: 0,
        }}>
          <div className="inset-well" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 10px',
          }}>
            <span style={{ color: 'var(--text-4)', fontSize: 9, fontFamily: 'var(--font-data)', letterSpacing: '0.05em', flexShrink: 0 }}>XRP</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={holdings}
              onChange={handleHoldingsChange}
              style={{
                width: 80, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-1)', fontSize: 16, fontWeight: 700,
                fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em', caretColor: 'var(--live)',
              }}
            />
          </div>
          <div>
            <div style={{
              fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em',
              fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums',
              color: holdingsUsd != null ? 'var(--text-1)' : 'var(--text-4)',
            }}>
              {holdingsUsd != null
                ? `$${holdingsUsd >= 1e6
                    ? `${(holdingsUsd / 1e6).toFixed(2)}M`
                    : holdingsUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : xrpPrice != null ? '$0.00' : '——'}
            </div>
            {holdings24hPnl != null && Math.abs(holdings24hPnl) > 0.01 && (
              <div style={{
                fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-data)',
                color: holdings24hPnl >= 0 ? 'var(--positive)' : 'var(--negative)',
              }}>
                {holdings24hPnl >= 0 ? '+' : ''}{holdings24hPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 24h
              </div>
            )}
          </div>
        </div>

        {/* Phase badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', flexShrink: 0,
            padding: '4px 10px', borderRadius: 6,
            background: 'var(--live-tint)', border: '1px solid var(--live-border)',
          }}>
            <span style={{ color: 'var(--live)', fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', fontFamily: 'var(--font-data)' }}>
              P{phase} · {level_label?.toUpperCase()}
            </span>
          </div>
          <span style={{ color: 'var(--text-3)', fontSize: 11, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            Cash Layer Forms
          </span>
          <div style={{
            fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-data)', letterSpacing: '0.04em',
            color: 'var(--text-4)',
          }}>
            {((total_xp / max_xp) * 100).toFixed(0)}% overall
          </div>
        </div>

        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: liveLoading ? 'var(--neutral)' : 'var(--positive)',
            boxShadow: !liveLoading ? '0 0 6px var(--positive-glow)' : 'none',
            animation: !liveLoading ? 'pulse-live 2s ease-in-out infinite' : 'none',
          }} />
          <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-data)', letterSpacing: '0.10em', color: 'var(--positive)' }}>
            LIVE
          </span>
        </div>
      </div>

      {/* ── MAIN GRID ─────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: '248px 1fr 290px',
        gap: 10,
        padding: 10,
        overflow: 'hidden',
      }}>

        {/* ── LEFT: Milestone tracker ─────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden', minHeight: 0 }}>

          {/* Phase Track */}
          <div className="g1" style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', flexShrink: 0 }}>
            <div style={{ color: 'var(--text-4)', fontSize: 8, fontWeight: 600, fontFamily: 'var(--font-data)', letterSpacing: '0.08em', marginBottom: 8 }}>
              PHASE TRACK
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {phases.map((p, i) => {
                const isLast     = i === phases.length - 1
                const isActive   = p.status === 'active'
                const isComplete = p.status === 'complete'
                const nodeColor  = isComplete ? 'var(--positive)' : isActive ? 'var(--live)' : 'oklch(0.28 0 0)'
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', flex: isLast ? 0 : 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%', marginBottom: 5,
                        background: isActive ? 'var(--live-tint)' : isComplete ? 'oklch(0.72 0.19 145 / 0.12)' : 'oklch(0.10 0 0)',
                        border: `2px solid ${nodeColor}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: isActive ? '0 0 10px var(--live-glow)' : 'none',
                        flexShrink: 0,
                      }}>
                        {isComplete ? (
                          <CheckCircle size={10} style={{ color: 'var(--positive)' }} />
                        ) : isActive ? (
                          <span style={{ color: 'var(--live)', fontSize: 8, fontWeight: 700, fontFamily: 'var(--font-data)' }}>P{p.id}</span>
                        ) : (
                          <Lock size={8} style={{ color: 'oklch(0.35 0 0)' }} />
                        )}
                      </div>
                      <div style={{
                        color: isComplete ? 'var(--positive)' : isActive ? 'var(--text-1)' : 'var(--text-4)',
                        fontSize: 9, fontWeight: isActive ? 600 : 400,
                        textAlign: 'center', lineHeight: 1.2, maxWidth: 46,
                      }}>
                        {p.name}
                      </div>
                    </div>
                    {!isLast && (
                      <div style={{
                        flex: 1, height: 2, marginBottom: 20,
                        background: isComplete ? 'var(--positive)' : 'var(--border)',
                        opacity: isComplete ? 0.6 : 1,
                      }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Signal Tiers */}
          <div className="g1" style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', flexShrink: 0 }}>
            <div style={{ color: 'var(--text-4)', fontSize: 8, fontWeight: 600, fontFamily: 'var(--font-data)', letterSpacing: '0.08em', marginBottom: 8 }}>
              SIGNAL TIERS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              {Object.entries(tier_scores).map(([key, t]) => {
                const c   = TC[key]
                const pct = (t.xp / t.max) * 100
                const sig = signalStrength(pct)
                return (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ color: 'var(--text-4)', fontSize: 8, lineHeight: 1.2 }}>{t.label}</span>
                      <span style={{ color: sig.color, fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-data)' }}>{sig.label}</span>
                    </div>
                    <div style={{ height: 3, borderRadius: 99, background: 'oklch(1 0 0 / 0.06)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: c, boxShadow: `0 0 5px ${c}55` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Scrollable milestone content */}
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>

            {/* Key Thresholds */}
            <div style={{ color: 'var(--text-4)', fontSize: 8, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Key Thresholds
            </div>
            {activeThresholds.map(q => (
              <div key={q.id} className="g1" style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-1)', fontSize: 11, fontWeight: 500 }}>{q.name}</span>
                  <span style={{ color: 'var(--live)', fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-data)' }}>
                    {q.pct_complete.toFixed(0)}%
                  </span>
                </div>
                <div style={{ color: 'var(--text-4)', fontSize: 10, marginBottom: 5, lineHeight: 1.3 }}>{q.description}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 2, borderRadius: 99, background: 'oklch(1 0 0 / 0.06)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${Math.min(q.pct_complete, 100)}%`,
                      borderRadius: 99, background: 'var(--live)', boxShadow: '0 0 5px var(--live-glow)',
                    }} />
                  </div>
                  <span style={{ color: 'var(--text-4)', fontSize: 9, fontFamily: 'var(--font-data)', flexShrink: 0 }}>
                    {q.current_value} / {q.target_value}
                  </span>
                </div>
              </div>
            ))}

            {/* Confirmed signals */}
            <div style={{ color: 'var(--text-4)', fontSize: 8, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>
              Confirmed Signals ({earnedSignals.length}/{badges.length})
            </div>
            {earnedSignals.map(b => (
              <div key={b.id} className="g1" style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '7px 10px', borderRadius: 7,
                border: '1px solid var(--border-mid)',
              }}>
                <span style={{ fontFamily: 'var(--font-data)', fontSize: 10, color: 'var(--live)', flexShrink: 0 }}>{b.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'var(--text-1)', fontSize: 11, fontWeight: 500 }}>{b.name}</div>
                  <div style={{ color: 'var(--text-4)', fontSize: 9 }}>{b.description}</div>
                </div>
                <span style={{ color: 'var(--positive)', fontSize: 9, fontFamily: 'var(--font-data)', flexShrink: 0 }}>✓</span>
              </div>
            ))}

            {/* Pending signals */}
            {pendingSignals.length > 0 && (
              <>
                <div style={{ color: 'var(--text-4)', fontSize: 8, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
                  Pending ({pendingSignals.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {pendingSignals.map(b => (
                    <div key={b.id} title={b.unlock_hint} className="g1" style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '4px 8px', borderRadius: 5,
                      border: '1px solid var(--border)', opacity: 0.4,
                    }}>
                      <span style={{ fontFamily: 'var(--font-data)', fontSize: 9, color: 'var(--text-4)' }}>{b.icon}</span>
                      <span style={{ color: 'var(--text-3)', fontSize: 10 }}>{b.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Bottom spacer so last item isn't flush against edge */}
            <div style={{ height: 4 }} />
          </div>
        </div>

        {/* ── CENTER: Chart + Analyzer ──────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden', minHeight: 0 }}>
          {/* Chart — compact fixed height */}
          <div style={{ flex: '0 0 260px' }}>
            <PriceChart />
          </div>
          {/* Analyzer — takes remaining space */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <MacroAnalyzer
              pendingEvent={pendingEvent}
              onClearPending={() => setPendingEvent(null)}
            />
          </div>
        </div>

        {/* ── RIGHT: News ───────────────────────────────────────────── */}
        <div style={{ overflow: 'hidden', minHeight: 0 }}>
          <NewsPanel onAnalyze={setPendingEvent} />
        </div>
      </div>
    </div>
  )
}
