import { useId } from 'react'

// 270° gauge arc — starts at 7-o'clock, sweeps clockwise to 5-o'clock
// Props: value (0-100), size (px), color (css string), strokeWidth, label, glowColor
export default function RadialArc({
  value = 0,
  size = 72,
  color = 'oklch(0.65 0.22 278)',
  trackColor = 'oklch(1 0 0 / 0.08)',
  strokeWidth = 3,
  label = null,
  glowColor = null,
}) {
  const id = useId()
  const cx = size / 2
  const cy = size / 2
  const r  = (size - strokeWidth * 2) / 2 - 1
  const circ = 2 * Math.PI * r

  // 270° arc = 75% of circumference
  const trackLen = circ * 0.75
  const trackGap = circ * 0.25

  const pct = Math.min(Math.max(value, 0), 100)
  const fillLen = trackLen * (pct / 100)

  // Rotate so the arc starts at 7-o'clock (135° from SVG's 3-o'clock default)
  const rot = `rotate(135, ${cx}, ${cy})`

  const glow = glowColor || color

  return (
    <svg
      width={size}
      height={size}
      style={{ display: 'block', overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={strokeWidth * 0.8} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Track */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
        strokeDasharray={`${trackLen} ${trackGap}`}
        strokeLinecap="round"
        transform={rot}
      />

      {/* Fill */}
      {fillLen > 0 && (
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${fillLen} ${circ}`}
          strokeLinecap="round"
          transform={rot}
          style={{
            transition: 'stroke-dasharray 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            filter: pct > 0 ? `url(#${id}-glow)` : 'none',
          }}
        />
      )}

      {/* Center label */}
      {label !== null && (
        <text
          x={cx}
          y={cy + (size < 48 ? 3 : 4)}
          textAnchor="middle"
          style={{
            fontSize: size < 48 ? 8 : size < 80 ? 10 : 12,
            fontFamily: 'var(--font-data)',
            fontVariantNumeric: 'tabular-nums',
            fill: 'var(--text-2)',
          }}
        >
          {label}
        </text>
      )}
    </svg>
  )
}
