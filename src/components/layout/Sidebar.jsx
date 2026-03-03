import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Map, Shield, BookOpen, Clock, Bell, Activity } from 'lucide-react'
import { currentScore } from '../../data/score'
import RadialArc from '../ui/RadialArc'
import { useLiveData } from '../../context/LiveDataContext'

const nav = [
  { to: '/',          label: 'Progress Map',  icon: Map },
  { to: '/dashboard', label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/quests',    label: 'Quests',        icon: BookOpen },
  { to: '/thesis',    label: 'Thesis Health', icon: Shield },
  { to: '/timeline',  label: 'Timeline',      icon: Clock },
  { to: '/alerts',    label: 'Alerts',        icon: Bell },
  { to: '/live',      label: 'Live Tracker',  icon: Activity },
]

export default function Sidebar() {
  const { total_xp, max_xp, phase, level } = currentScore
  const pct = (total_xp / max_xp) * 100
  const { metrics: live } = useLiveData()
  const xrpPrice = live?.xrp_price ?? null
  const xrpChange = live?.xrp_24h_change ?? null
  const priceUp = xrpChange != null ? xrpChange >= 0 : null

  return (
    <aside className="g1" style={{
      width: 240, flexShrink: 0,
      borderRight: '1px solid var(--border)',
      height: '100vh', position: 'sticky', top: 0,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 18px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: 'var(--live-tint)',
          border: '1px solid var(--live-border)',
          boxShadow: '0 0 16px var(--live-glow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            color: 'var(--live)', fontWeight: 800, fontSize: 13,
            fontFamily: 'var(--font-data)',
          }}>X</span>
        </div>
        <div>
          <div style={{ color: 'var(--text-1)', fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>
            XRP Tracker
          </div>
          <div style={{ color: 'var(--text-4)', fontSize: 11, lineHeight: 1.3 }}>
            Market Structure
          </div>
        </div>
      </div>

      {/* XRP Price ticker */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color: 'var(--text-4)', fontSize: 9, fontFamily: 'var(--font-data)', letterSpacing: '0.09em' }}>XRP / USD</span>
          {xrpChange != null && (
            <span style={{
              fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-data)',
              letterSpacing: '0.03em',
              color: priceUp ? 'var(--positive)' : 'var(--negative)',
              textShadow: priceUp ? '0 0 8px var(--positive-glow)' : '0 0 8px var(--negative-glow)',
            }}>
              {priceUp ? '+' : ''}{xrpChange.toFixed(2)}%
            </span>
          )}
        </div>
        <span style={{
          color: 'var(--text-1)', fontSize: 20, fontWeight: 700,
          fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em', display: 'block',
          textShadow: xrpPrice ? '0 0 16px oklch(0.93 0.008 72 / 0.45)' : 'none',
        }}>
          {xrpPrice != null ? `$${xrpPrice.toFixed(4)}` : '———'}
        </span>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1, padding: '10px 8px',
        display: 'flex', flexDirection: 'column', gap: 1,
        overflowY: 'auto',
      }}>
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 10px', borderRadius: 7, fontSize: 13,
              fontWeight: isActive ? 500 : 400,
              color: isActive ? 'var(--live)' : 'var(--text-3)',
              background: isActive ? 'var(--live-tint)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--live)' : '2px solid transparent',
              borderTop: '1px solid transparent',
              borderRight: '1px solid transparent',
              borderBottom: '1px solid transparent',
              textDecoration: 'none',
              transition: 'color 200ms var(--ease-snap), background 200ms var(--ease-snap), border-color 200ms var(--ease-snap), transform 200ms var(--ease-snap)',
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.style.borderLeftColor.includes('var(--live)')) {
                e.currentTarget.style.transform = 'translateX(2px)'
                e.currentTarget.style.color = 'var(--text-2)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateX(0)'
            }}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={14}
                  style={{
                    color: isActive ? 'var(--live)' : 'var(--text-4)',
                    flexShrink: 0,
                    filter: isActive ? 'drop-shadow(0 0 4px var(--live-glow))' : 'none',
                  }}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer: XP gauge + phase info */}
      <div className="micro-grid" style={{
        padding: '16px 20px 20px',
        borderTop: '1px solid var(--border)',
      }}>
        {/* Radial XP gauge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <RadialArc
            value={pct}
            size={64}
            color="oklch(0.65 0.22 278)"
            strokeWidth={3}
            label={`${pct.toFixed(0)}%`}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 3 }}>
              <span style={{
                color: 'var(--macro)', fontSize: 16, fontWeight: 700,
                fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em',
              }}>
                {total_xp.toLocaleString()}
              </span>
              <span style={{ color: 'var(--text-4)', fontSize: 10 }}>XP</span>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-data)',
              color: 'var(--live)', background: 'var(--live-tint)',
              border: '1px solid var(--live-border)',
              borderRadius: 4, padding: '2px 6px',
            }}>
              P{phase} · L{level}
            </div>
          </div>
        </div>

        {/* Phase label */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ color: 'var(--text-1)', fontSize: 11, fontWeight: 500, marginBottom: 1 }}>
            Cash Layer Forms
          </div>
          <div style={{ color: 'var(--text-4)', fontSize: 10 }}>Level {level} · Emerging</div>
        </div>

        <p style={{ color: 'var(--text-4)', fontSize: 10, lineHeight: 1.5 }}>
          Market structure tracking — not financial advice.
        </p>
      </div>
    </aside>
  )
}
