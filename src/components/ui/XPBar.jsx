const TICKS = [0, 25, 50, 75, 100]

export default function XPBar({ current, max, height = 8 }) {
  const pct = Math.min((current / max) * 100, 100)

  return (
    <div>
      {/* Values */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span style={{
          color: 'var(--macro)', fontSize: 28, fontWeight: 700,
          fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.03em', lineHeight: 1,
        }}>
          {current.toLocaleString()}
          <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-3)', marginLeft: 6 }}>XP</span>
        </span>
        <span style={{ color: 'var(--text-4)', fontSize: 12, fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums' }}>
          / {max.toLocaleString()}
        </span>
      </div>

      {/* Track + tick marks */}
      <div style={{ position: 'relative', paddingBottom: 16 }}>
        <div style={{
          height, borderRadius: 99,
          background: 'oklch(1 0 0 / 0.06)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${pct}%`, borderRadius: 99,
            background: 'linear-gradient(90deg, oklch(0.50 0.24 278), oklch(0.72 0.18 278))',
            position: 'relative', overflow: 'hidden',
            transition: 'width 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}>
            <div className="xp-shimmer" style={{
              position: 'absolute', inset: 0, width: '45%',
              background: 'linear-gradient(90deg, transparent, oklch(1 0 0 / 0.28), transparent)',
            }} />
          </div>
        </div>

        {/* Tick marks */}
        {TICKS.map(t => (
          <div key={t} style={{
            position: 'absolute',
            left: `${t}%`,
            top: height + 4,
            transform: 'translateX(-50%)',
            width: 1,
            height: 6,
            background: t <= pct ? 'var(--macro-dim)' : 'oklch(1 0 0 / 0.10)',
          }} />
        ))}
      </div>

      {/* Labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ color: 'var(--text-4)', fontSize: 11, fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums' }}>
          {pct.toFixed(1)}%
        </span>
        <span style={{ color: 'var(--text-4)', fontSize: 11, fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums' }}>
          {(max - current).toLocaleString()} remaining
        </span>
      </div>
    </div>
  )
}
