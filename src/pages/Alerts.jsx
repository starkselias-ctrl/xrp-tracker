import { Bell, Plus, Info } from 'lucide-react'

const suggestedAlerts = [
  { metric: 'RLUSD Market Cap', condition: 'crosses $500M', importance: 'Phase 2 L2 unlock', color: 'var(--live)' },
  { metric: 'RLUSD Market Cap', condition: 'crosses $1B', importance: 'Phase 2 L3 unlock', color: 'var(--live)' },
  { metric: 'ETF Holdings', condition: 'crosses 1B XRP', importance: 'Quest Q01 complete', color: 'var(--positive)' },
  { metric: 'Exchange Balances', condition: '90d decline > 15%', importance: 'Quest Q02 complete', color: 'var(--positive)' },
  { metric: 'DvP Production', condition: 'flips to Live', importance: 'Quest Q06 complete — institutional milestone', color: 'var(--macro)' },
  { metric: 'Bridge Proxy Volume', condition: 'crosses $1M/day (7d avg)', importance: 'Bridge Signals Emerging badge', color: 'var(--negative)' },
]

const alertTypes = [
  'Threshold crossing (e.g. RLUSD mcap crosses $1B)',
  'Trend change (e.g. exchange balances up 5% over 7d)',
  'Milestone events (new issuer launches tokenized fund on XRPL)',
  'Weekly snapshot digest with XP delta and quest progress',
]

export default function Alerts() {
  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ color: 'var(--text-1)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
          Alerts
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: 14 }}>
          Get notified when metrics cross thresholds or milestones trigger.
        </p>
      </div>

      {/* Auth gate notice */}
      <div className="g2" style={{
        border: '1px solid var(--live-border)',
        borderLeft: '3px solid var(--live)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24,
        display: 'flex', gap: 16,
        boxShadow: '0 0 32px var(--live-glow), var(--shadow-2)',
      }}>
        <Bell size={22} style={{ color: 'var(--live)', flexShrink: 0, marginTop: 2, filter: 'drop-shadow(0 0 4px var(--live-glow))' }} />
        <div>
          <h2 style={{ color: 'var(--text-1)', fontSize: 15, fontWeight: 700, marginBottom: 10 }}>
            Email Alerts — Coming in MVP
          </h2>
          <p style={{ color: 'var(--text-3)', fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
            Configure threshold alerts for any metric. Get emailed when RLUSD crosses $1B,
            when exchange balances drop 15%, or when any binary milestone triggers.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alertTypes.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--text-3)' }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--live)', flexShrink: 0, marginTop: 4,
                  boxShadow: '0 0 4px var(--live-glow)',
                }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alert builder preview */}
      <div className="g2" style={{
        border: '1px solid var(--border)',
        borderRadius: 16, padding: '20px 24px', marginBottom: 24,
      }}>
        <h2 style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={14} style={{ color: 'var(--live)' }} />
          Create Alert (Preview)
        </h2>

        <div style={{ opacity: 0.45, pointerEvents: 'none', userSelect: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ color: 'var(--text-4)', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>
              Metric
            </label>
            <div className="g3" style={{
              border: '1px solid var(--border)',
              borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--text-3)',
            }}>
              RLUSD Market Cap
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ color: 'var(--text-4)', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>
                Condition
              </label>
              <div className="g3" style={{
                border: '1px solid var(--border)',
                borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--text-3)',
              }}>
                Crosses above
              </div>
            </div>
            <div>
              <label style={{ color: 'var(--text-4)', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>
                Value
              </label>
              <div className="g3" style={{
                border: '1px solid var(--border)',
                borderRadius: 8, padding: '10px 14px', fontSize: 13,
                color: 'var(--text-3)', fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums',
              }}>
                $1,000M
              </div>
            </div>
          </div>

          <div>
            <label style={{ color: 'var(--text-4)', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>
              Notify via
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="g3" style={{
                padding: '8px 14px', borderRadius: 8,
                border: '1px solid var(--live-border)',
                fontSize: 12, color: 'var(--live)',
              }}>
                Email
              </div>
            </div>
          </div>

          <button style={{
            width: '100%', padding: '10px 0', borderRadius: 8,
            background: 'var(--live)', color: 'var(--void)',
            fontSize: 13, fontWeight: 600, border: 'none', cursor: 'not-allowed',
          }}>
            Create Alert
          </button>
        </div>
      </div>

      {/* Suggested alerts */}
      <div>
        <div style={{ color: 'var(--text-4)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          Suggested Alert Presets
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {suggestedAlerts.map((a, i) => (
            <div key={i} className="g2" style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 18px', borderRadius: 12,
              border: '1px solid var(--border)',
              transition: 'border-color 200ms var(--ease-snap)',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: a.color,
                boxShadow: `0 0 6px ${a.color}`,
              }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>
                  {a.metric}{' '}
                  <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>{a.condition}</span>
                </p>
                <p style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 2 }}>{a.importance}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-4)', fontSize: 10 }}>
                <Info size={10} />
                MVP soon
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
