import { confidenceColor, confidenceLabel } from '../../lib/utils'

export default function ConfidenceBadge({ score }) {
  const color = confidenceColor(score)
  const label = confidenceLabel(score)

  return (
    <span className="g3" style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 8px', borderRadius: 6,
      fontSize: 10, fontWeight: 500,
      border: `1px solid ${color}38`,
      color,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
        background: color,
        boxShadow: `0 0 5px ${color}`,
      }} />
      <span style={{ color: 'var(--text-3)' }}>{label}</span>
      {' · '}
      <span style={{ fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums' }}>{score}</span>
    </span>
  )
}
