import { Lock, CheckCircle, Zap } from 'lucide-react'

const PHASE_COLORS = {
  1: 'oklch(0.72 0.19 145)',
  2: 'oklch(0.68 0.17 215)',
  3: 'oklch(0.65 0.22 278)',
  4: 'oklch(0.78 0.17 70)',
  5: 'oklch(0.65 0.22 25)',
}

export default function QuestCard({ quest, compact = false }) {
  const { name, description, pct_complete = 0, days_sustained = 0, condition,
    xp_reward, status, phase_relevance, why_it_matters } = quest

  const color = PHASE_COLORS[phase_relevance] || 'var(--text-3)'
  const isComplete = status === 'complete'
  const isLocked   = status === 'locked'
  const pct        = Math.min(100, Math.max(0, pct_complete))

  return (
    <div
      className={isLocked ? 'g1' : 'g2'}
      style={{
        borderRadius: 14,
        padding: 20,
        border: isComplete
          ? `1px solid oklch(0.72 0.19 145 / 0.30)`
          : '1px solid var(--border)',
        borderLeft: `3px solid ${color}`,
        opacity: isLocked ? 0.42 : 1,
        filter: isLocked ? 'blur(0.3px)' : 'none',
        boxShadow: isComplete
          ? `0 0 0 1px oklch(0.72 0.19 145 / 0.20), 0 0 24px oklch(0.72 0.19 145 / 0.10), var(--shadow-2)`
          : undefined,
        transition: 'transform 200ms var(--ease-snap), box-shadow 200ms var(--ease-snap)',
        cursor: isLocked ? 'default' : 'pointer',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: compact ? 0 : 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
          {/* Status icon */}
          <div style={{ flexShrink: 0, marginTop: 1 }}>
            {isComplete ? (
              <CheckCircle size={16} style={{
                color: 'var(--positive)',
                filter: 'drop-shadow(0 0 4px var(--positive-glow))',
              }} />
            ) : isLocked ? (
              <Lock size={15} style={{ color: 'var(--text-4)' }} />
            ) : (
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                border: `2px solid ${color}`,
                boxShadow: `0 0 6px ${color}60`,
              }} />
            )}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ color: 'var(--text-1)', fontSize: 14, fontWeight: 500, lineHeight: 1.3, marginBottom: 3 }}>
              {name}
            </div>
            {!compact && (
              <div style={{ color: 'var(--text-3)', fontSize: 12, lineHeight: 1.5 }}>
                {description}
              </div>
            )}
          </div>
        </div>

        {/* XP badge */}
        <div className="g3" style={{
          flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '4px 10px', borderRadius: 8,
          fontSize: 12, fontWeight: 700,
          fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums',
          color,
          border: `1px solid ${color.slice(0, -1)} / 0.28)`,
        }}>
          <Zap size={10} />
          {xp_reward}
        </div>
      </div>

      {/* Progress */}
      {!compact && !isLocked && !isComplete && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ color: 'var(--text-3)', fontSize: 11 }}>
              {condition?.type === 'binary_equal'
                ? 'Awaiting milestone'
                : `${pct.toFixed(1)}% of target`}
            </span>
            {condition?.days && (
              <span style={{ color: 'var(--text-4)', fontSize: 11, fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums' }}>
                {days_sustained} / {condition.days}d
              </span>
            )}
          </div>
          <div style={{ height: 4, borderRadius: 99, background: 'oklch(1 0 0 / 0.06)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct}%`, borderRadius: 99,
              background: color,
              transition: 'width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }} />
          </div>
        </div>
      )}

      {/* Why it matters */}
      {!compact && !isLocked && (
        <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <div style={{ color: 'var(--text-4)', fontSize: 10, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>
            Why it matters
          </div>
          <p style={{ color: 'var(--text-3)', fontSize: 12, lineHeight: 1.6 }}>
            {why_it_matters}
          </p>
        </div>
      )}

      {/* Phase tag */}
      <div style={{ marginTop: compact ? 8 : 12, display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{
          fontSize: 10, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase',
          padding: '2px 7px', borderRadius: 4,
          color: `${color.slice(0, -1)} / 0.80)`,
          background: `${color.slice(0, -1)} / 0.10)`,
          fontFamily: 'var(--font-data)',
        }}>
          Phase {phase_relevance}
        </span>
      </div>
    </div>
  )
}
