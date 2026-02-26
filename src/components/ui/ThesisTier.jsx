import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import RadialArc from './RadialArc'

const STATUS = {
  green:  { color: 'oklch(0.72 0.19 145)', label: 'Strengthening', Icon: TrendingUp,   glow: true },
  yellow: { color: 'oklch(0.78 0.17 70)',  label: 'Mixed',         Icon: Minus,        glow: false },
  red:    { color: 'oklch(0.65 0.22 25)',  label: 'Weakening',     Icon: TrendingDown, glow: false },
  gray:   { color: 'oklch(0.32 0.006 264)', label: 'Inactive',     Icon: Minus,        glow: false },
}

export default function ThesisTier({ tier, name, status, signal, confidence }) {
  const s = STATUS[status] || STATUS.gray
  const { color, label, Icon, glow } = s

  return (
    <div className="g2" style={{
      display: 'flex', alignItems: 'flex-start', gap: 16,
      padding: 20, borderRadius: 14,
      border: '1px solid var(--border)',
      borderLeft: `3px solid ${color}`,
      boxShadow: glow
        ? `0 0 0 1px ${color}20, 0 0 20px ${color}12, var(--shadow-2)`
        : undefined,
    }}>
      {/* Tier badge */}
      <div className="g3" style={{
        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          color: 'var(--text-3)', fontSize: 11, fontWeight: 700,
          fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums',
        }}>T{tier}</span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ color: 'var(--text-1)', fontSize: 14, fontWeight: 500 }}>{name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon size={13} style={{
              color,
              filter: glow ? `drop-shadow(0 0 3px ${color})` : 'none',
            }} />
            <span style={{ color, fontSize: 11, fontWeight: 500 }}>{label}</span>
          </div>
        </div>

        <p style={{ color: 'var(--text-3)', fontSize: 12, lineHeight: 1.6, marginBottom: 10 }}>
          {signal}
        </p>

        {confidence !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <RadialArc
              value={confidence}
              size={32}
              color={color}
              strokeWidth={2.5}
              label={null}
            />
            <span style={{
              color: 'var(--text-4)', fontSize: 10,
              fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums',
            }}>
              {confidence}% confidence
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
