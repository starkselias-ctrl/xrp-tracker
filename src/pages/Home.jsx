import { useState } from 'react'
import { CheckCircle, Lock } from 'lucide-react'
import { currentScore, phases, xpHistory } from '../data/score'
import { quests } from '../data/quests'
import { badges } from '../data/badges'
import { useLiveData } from '../context/LiveDataContext'
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

const TC = {
  t1: 'oklch(0.72 0.19 145)',
  t2: 'oklch(0.68 0.17 215)',
  t3: 'oklch(0.65 0.22 278)',
  t4: 'oklch(0.78 0.17 70)',
  t5: 'oklch(0.65 0.22 25)',
}

function signalStrength(pct) {
  if (pct >= 80) return { label: 'Strong',   color: 'var(--positive)' }
  if (pct >= 50) return { label: 'Forming',  color: 'var(--live)' }
  if (pct >= 20) return { label: 'Early',    color: 'var(--warning)' }
  return              { label: 'Inactive',  color: 'var(--text-4)' }
}

export default function Home() {
  const { total_xp, max_xp, phase, level, level_label, tier_scores } = currentScore
  const activeThresholds = quests.filter(q => q.status === 'active')
  const earnedSignals = badges.filter(b => b.earned)
  const pendingSignals = badges.filter(b => !b.earned)
  const overallPct = (total_xp / max_xp) * 100

  const { metrics: live, loading: liveLoading } = useLiveData()
  const xrpPrice = live?.xrp_price ?? null
  const xrpChange = live?.xrp_24h_change ?? null
  const xrpMcap = live?.xrp_market_cap ?? null
  const priceUp = xrpChange != null ? xrpChange >= 0 : null

  const [holdings, setHoldings] = useState(() => {
    const stored = localStorage.getItem('xrt_holdings')
    return stored ? stored : ''
  })
  const holdingsNum = parseFloat(holdings) || 0
  const holdingsUsd = xrpPrice != null && holdingsNum > 0 ? holdingsNum * xrpPrice : null
  const holdings24hPnl = holdingsUsd != null && xrpChange != null
    ? holdingsUsd * (xrpChange / (100 + xrpChange))
    : null

  function handleHoldingsChange(e) {
    const val = e.target.value.replace(/[^0-9.]/g, '')
    setHoldings(val)
    localStorage.setItem('xrt_holdings', val)
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px' }}>

      {/* Live price + portfolio row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>

        {/* XRP Price panel */}
        <div className="g2" style={{
          border: '1px solid var(--border)',
          borderRadius: 16, padding: '20px 24px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div className="scanline" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{
              color: 'var(--text-4)', fontSize: 9, fontWeight: 600,
              fontFamily: 'var(--font-data)', letterSpacing: '0.10em',
            }}>XRP / USD</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: liveLoading ? 'var(--neutral)' : 'var(--positive)',
                boxShadow: liveLoading ? 'none' : '0 0 6px var(--positive-glow)',
                animation: !liveLoading ? 'pulse-live 2s ease-in-out infinite' : 'none',
              }} />
              <span style={{
                fontSize: 8, fontWeight: 700, fontFamily: 'var(--font-data)',
                letterSpacing: '0.10em', color: 'var(--positive)',
              }}>LIVE</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
            <span style={{
              fontSize: 48, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1,
              fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums',
              color: 'var(--text-1)',
              textShadow: xrpPrice ? '0 0 24px oklch(0.93 0.008 72 / 0.35)' : 'none',
            }}>
              {xrpPrice != null ? `$${xrpPrice.toFixed(4)}` : '———'}
            </span>
            {xrpChange != null && (
              <span style={{
                fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-data)',
                letterSpacing: '-0.01em',
                color: priceUp ? 'var(--positive)' : 'var(--negative)',
                textShadow: priceUp ? '0 0 12px var(--positive-glow)' : '0 0 12px var(--negative-glow)',
              }}>
                {priceUp ? '+' : ''}{xrpChange.toFixed(2)}%
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 20 }}>
            {xrpMcap != null && (
              <div>
                <div style={{ color: 'var(--text-4)', fontSize: 9, fontFamily: 'var(--font-data)', letterSpacing: '0.07em', marginBottom: 2 }}>MARKET CAP</div>
                <div style={{ color: 'var(--text-2)', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums' }}>
                  ${xrpMcap.toFixed(1)}B
                </div>
              </div>
            )}
            {live?.rlusd_market_cap != null && (
              <div>
                <div style={{ color: 'var(--text-4)', fontSize: 9, fontFamily: 'var(--font-data)', letterSpacing: '0.07em', marginBottom: 2 }}>RLUSD MCAP</div>
                <div style={{ color: 'var(--text-2)', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums' }}>
                  ${live.rlusd_market_cap >= 1000
                    ? `${(live.rlusd_market_cap / 1000).toFixed(2)}B`
                    : `${live.rlusd_market_cap.toFixed(0)}M`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio panel */}
        <div className="g2" style={{
          border: '1px solid var(--border)',
          borderRadius: 16, padding: '20px 24px',
        }}>
          <div style={{
            color: 'var(--text-4)', fontSize: 9, fontWeight: 600,
            fontFamily: 'var(--font-data)', letterSpacing: '0.10em', marginBottom: 16,
          }}>MY HOLDINGS</div>

          <div className="inset-well" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', marginBottom: 14,
          }}>
            <span style={{ color: 'var(--text-4)', fontSize: 11, fontFamily: 'var(--font-data)', letterSpacing: '0.05em', flexShrink: 0 }}>XRP</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={holdings}
              onChange={handleHoldingsChange}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-1)', fontSize: 28, fontWeight: 700,
                fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em', lineHeight: 1,
                caretColor: 'var(--live)',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
            <span style={{
              fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em',
              fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums',
              color: holdingsUsd != null ? 'var(--text-1)' : 'var(--text-4)',
              textShadow: holdingsUsd ? '0 0 20px oklch(0.93 0.008 72 / 0.25)' : 'none',
            }}>
              {holdingsUsd != null
                ? `$${holdingsUsd >= 1e6
                    ? `${(holdingsUsd / 1e6).toFixed(2)}M`
                    : holdingsUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : xrpPrice != null ? '$0.00' : '——'}
            </span>
            <span style={{ color: 'var(--text-4)', fontSize: 12 }}>USD</span>
          </div>

          {holdings24hPnl != null && Math.abs(holdings24hPnl) > 0.01 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-data)',
                color: holdings24hPnl >= 0 ? 'var(--positive)' : 'var(--negative)',
                textShadow: holdings24hPnl >= 0 ? '0 0 8px var(--positive-glow)' : '0 0 8px var(--negative-glow)',
              }}>
                {holdings24hPnl >= 0 ? '+' : ''}{holdings24hPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span style={{ color: 'var(--text-4)', fontSize: 10 }}>24h</span>
            </div>
          )}

          {!xrpPrice && (
            <p style={{ color: 'var(--text-4)', fontSize: 10, marginTop: 8, fontFamily: 'var(--font-data)' }}>
              FETCHING PRICE...
            </p>
          )}
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: 'var(--text-1)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
          Milestone Tracker
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: 14 }}>
          Structural adoption signals for XRP — tracking the market infrastructure thesis in real time.
        </p>
      </div>

      {/* Horizontal Phase Track */}
      <div className="g1" style={{
        border: '1px solid var(--border)', borderRadius: 16,
        padding: '20px 28px', marginBottom: 28,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {phases.map((p, i) => {
            const isLast = i === phases.length - 1
            const isActive = p.status === 'active'
            const isComplete = p.status === 'complete'
            const nodeColor = isComplete ? 'var(--positive)' : isActive ? 'var(--live)' : 'oklch(0.28 0 0)'
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'flex-start', flex: isLast ? 0 : 1 }}>
                {/* Node + label */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 90 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', marginBottom: 9,
                    background: isActive ? 'var(--live-tint)' : isComplete ? 'oklch(0.72 0.19 145 / 0.12)' : 'oklch(0.10 0 0)',
                    border: `2px solid ${nodeColor}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isActive ? '0 0 16px var(--live-glow)' : isComplete ? '0 0 8px oklch(0.72 0.19 145 / 0.3)' : 'none',
                    flexShrink: 0,
                  }}>
                    {isComplete ? (
                      <CheckCircle size={14} style={{ color: 'var(--positive)' }} />
                    ) : isActive ? (
                      <span style={{ color: 'var(--live)', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-data)' }}>P{p.id}</span>
                    ) : (
                      <Lock size={11} style={{ color: 'oklch(0.35 0 0)' }} />
                    )}
                  </div>
                  <div style={{
                    color: isComplete ? 'var(--positive)' : isActive ? 'var(--text-1)' : 'var(--text-4)',
                    fontSize: 11, fontWeight: isActive ? 600 : 400,
                    textAlign: 'center', lineHeight: 1.3, maxWidth: 80,
                  }}>
                    {p.name}
                  </div>
                  <div style={{
                    marginTop: 4, fontSize: 9, fontFamily: 'var(--font-data)', letterSpacing: '0.05em',
                    color: isComplete ? 'var(--positive)' : isActive ? 'var(--live)' : 'var(--text-4)',
                  }}>
                    {isComplete ? 'COMPLETE' : isActive ? `ACTIVE · L${p.level}` : 'LOCKED'}
                  </div>
                </div>
                {/* Connector line */}
                {!isLast && (
                  <div style={{
                    flex: 1, height: 2, marginTop: 16,
                    background: isComplete ? 'var(--positive)' : 'var(--border)',
                    opacity: isComplete ? 0.6 : 1,
                  }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Main instrument row: Phase Hero + Adoption Momentum */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 16, marginBottom: 16, alignItems: 'stretch' }}>

        {/* Phase status hero */}
        <div className="g2" style={{
          borderRadius: 16, padding: '24px 28px',
          border: '1px solid var(--live-border)',
          boxShadow: '0 0 40px var(--live-glow), var(--shadow-2)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '3px 10px', borderRadius: 6, marginBottom: 12,
              background: 'var(--live-tint)',
              border: '1px solid var(--live-border)',
            }}>
              <span style={{ color: 'var(--live)', fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', fontFamily: 'var(--font-data)' }}>
                PHASE {phase} · {level_label?.toUpperCase()}
              </span>
            </div>
            <h2 style={{ color: 'var(--text-1)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 10 }}>
              Cash Layer Forms
            </h2>
            <p style={{ color: 'var(--text-3)', fontSize: 13, lineHeight: 1.55 }}>
              RLUSD approaching $500M — Phase 2 Level 2 threshold. ETF supply absorption confirmed.
              Exchange balances declining for 14 consecutive days.
            </p>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ color: 'var(--text-4)', fontSize: 9, fontFamily: 'var(--font-data)', letterSpacing: '0.07em', marginBottom: 7 }}>
              NEXT MILESTONE CONDITIONS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--live)', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-3)', fontSize: 12 }}>RLUSD market cap sustained above $500M</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--live)', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-3)', fontSize: 12 }}>Transfer volume exceeds $10M / day avg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Adoption Momentum chart */}
        <div className="g2" style={{
          border: '1px solid var(--border)', borderRadius: 16, padding: '20px 22px',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <div>
              <div style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600 }}>Adoption Momentum</div>
              <div style={{ color: 'var(--text-4)', fontSize: 10, marginTop: 2, fontFamily: 'var(--font-data)' }}>30-day signal trend</div>
            </div>
            <div style={{
              color: 'var(--live)', fontSize: 18, fontWeight: 700,
              fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums',
              textShadow: '0 0 12px var(--live-glow)',
            }}>
              {overallPct.toFixed(0)}%
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={xpHistory}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'oklch(0.38 0 0)', fontSize: 9, fontFamily: 'var(--font-data)' }}
                  tickLine={false} axisLine={false}
                  tickFormatter={v => v.slice(5)} interval={3}
                />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="g4" style={{
                      border: '1px solid var(--border-mid)', borderRadius: 8, padding: '8px 12px', fontSize: 12,
                    }}>
                      <div style={{ color: 'var(--text-3)', fontSize: 10, marginBottom: 2 }}>{payload[0].payload.date}</div>
                      <div style={{
                        color: 'var(--macro)', fontWeight: 700,
                        fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums',
                      }}>
                        {((payload[0].value / 10000) * 100).toFixed(1)}% signal strength
                      </div>
                    </div>
                  )
                }} />
                <Line
                  type="monotone" dataKey="xp"
                  stroke="oklch(0.65 0.22 278)" strokeWidth={2} dot={false}
                  activeDot={{ r: 4, fill: 'oklch(0.65 0.22 278)', strokeWidth: 0, style: { filter: 'drop-shadow(0 0 4px oklch(0.65 0.22 278 / 0.6))' } }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Signal Tiers — compact strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 16 }}>
        {Object.entries(tier_scores).map(([key, t]) => {
          const c = TC[key]
          const pct = (t.xp / t.max) * 100
          const sig = signalStrength(pct)
          return (
            <div key={key} className="g2" style={{
              border: '1px solid var(--border)',
              borderRadius: 12, padding: '12px 14px',
              transition: 'border-color 200ms var(--ease-snap)',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ color: 'var(--text-4)', fontSize: 9, marginBottom: 6, lineHeight: 1.3, letterSpacing: '0.03em' }}>{t.label}</div>
              <div style={{
                color: sig.color, fontSize: 12, fontWeight: 700,
                fontFamily: 'var(--font-data)',
                lineHeight: 1, marginBottom: 6,
                textShadow: sig.color !== 'var(--text-4)' ? `0 0 10px ${sig.color}55` : 'none',
              }}>
                {sig.label}
              </div>
              <div style={{ height: 3, borderRadius: 99, background: 'oklch(1 0 0 / 0.06)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: c, boxShadow: `0 0 6px ${c}` }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Key Thresholds */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ color: 'var(--text-4)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          Key Thresholds
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
          {activeThresholds.map(q => (
            <div key={q.id} className="g2" style={{
              border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px',
              transition: 'border-color 200ms var(--ease-snap)',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ color: 'var(--text-1)', fontSize: 12, fontWeight: 500 }}>{q.name}</span>
                <span style={{
                  color: 'var(--live)', fontSize: 10, fontWeight: 700,
                  fontFamily: 'var(--font-data)', letterSpacing: '0.04em',
                }}>
                  {q.pct_complete.toFixed(0)}%
                </span>
              </div>
              <div style={{ color: 'var(--text-4)', fontSize: 10, marginBottom: 8, lineHeight: 1.4 }}>{q.description}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 3, borderRadius: 99, background: 'oklch(1 0 0 / 0.06)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${Math.min(q.pct_complete, 100)}%`,
                    borderRadius: 99, background: 'var(--live)',
                    boxShadow: '0 0 6px var(--live-glow)',
                  }} />
                </div>
                <span style={{ color: 'var(--text-4)', fontSize: 10, fontFamily: 'var(--font-data)', flexShrink: 0 }}>
                  {q.current_value} / {q.target_value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmed Signals */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ color: 'var(--text-4)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Confirmed Signals ({earnedSignals.length} / {badges.length})
          </div>
          <span style={{ color: 'var(--positive)', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-data)' }}>
            {earnedSignals.length} milestones reached
          </span>
        </div>

        {/* Earned — milestone cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {earnedSignals.map(b => (
            <div key={b.id} className="g2" style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 16px', borderRadius: 10,
              border: '1px solid var(--border-mid)',
              boxShadow: '0 0 8px var(--live-glow)',
            }}>
              <span style={{
                fontFamily: 'var(--font-data)', fontSize: 9, fontWeight: 700,
                letterSpacing: '0.06em',
                color: 'var(--live)',
                textShadow: '0 0 8px var(--live-glow)',
                flexShrink: 0, width: 28, textAlign: 'center',
              }}>
                {b.icon}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{b.name}</div>
                <div style={{ color: 'var(--text-4)', fontSize: 11 }}>{b.description}</div>
              </div>
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <div style={{ color: 'var(--positive)', fontSize: 10, fontFamily: 'var(--font-data)', letterSpacing: '0.04em' }}>
                  CONFIRMED
                </div>
                <div style={{ color: 'var(--text-4)', fontSize: 10, marginTop: 2 }}>
                  {new Date(b.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pending signals */}
        <div style={{ color: 'var(--text-4)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', marginBottom: 10 }}>
          PENDING ({pendingSignals.length})
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {pendingSignals.map(b => (
            <div key={b.id} title={b.unlock_hint} className="g1" style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '6px 11px', borderRadius: 6,
              border: '1px solid var(--border)',
              opacity: 0.4,
            }}>
              <span style={{
                fontFamily: 'var(--font-data)', fontSize: 9, fontWeight: 500,
                letterSpacing: '0.06em', color: 'var(--text-4)',
              }}>
                {b.icon}
              </span>
              <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{b.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
