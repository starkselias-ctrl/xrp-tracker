import { quests } from '../data/quests'
import QuestCard from '../components/ui/QuestCard'
import { Zap } from 'lucide-react'

const phaseLabels = {
  1: 'Investable Asset',
  2: 'Cash Layer Forms',
  3: 'Tokenized Capital Markets',
  4: 'Liquidity Venue',
  5: 'Global Routing',
}

const PHASE_COLORS = {
  1: 'oklch(0.72 0.19 145)',
  2: 'oklch(0.68 0.17 215)',
  3: 'oklch(0.65 0.22 278)',
  4: 'oklch(0.78 0.17 70)',
  5: 'oklch(0.65 0.22 25)',
}

export default function Quests() {
  const completed = quests.filter(q => q.status === 'complete')
  const active    = quests.filter(q => q.status === 'active')
  const locked    = quests.filter(q => q.status === 'locked')
  const totalReward  = quests.reduce((s, q) => s + q.xp_reward, 0)
  const earnedReward = completed.reduce((s, q) => s + q.xp_reward, 0)
  const rewardPct = (earnedReward / totalReward) * 100

  const byPhase = [1, 2, 3, 4, 5].map(p => ({
    phase: p,
    quests: quests.filter(q => q.phase_relevance === p),
  }))

  const stats = [
    { label: 'Total',     value: quests.length,   color: 'var(--text-3)' },
    { label: 'Active',    value: active.length,    color: 'var(--live)' },
    { label: 'Completed', value: completed.length, color: 'var(--positive)' },
    { label: 'Locked',    value: locked.length,    color: 'var(--text-4)' },
  ]

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ color: 'var(--text-1)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Quests</h1>
        <p style={{ color: 'var(--text-3)', fontSize: 14 }}>
          Threshold-based milestones that track the structural prerequisites for the XRP thesis.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} className="g2" style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 6 }}>
              {s.value}
            </div>
            <div style={{ color: 'var(--text-4)', fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* XP Progress */}
      <div className="g2" style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', marginBottom: 40, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: 'var(--macro-tint)', border: '1px solid var(--macro-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px var(--macro-glow)' }}>
          <Zap size={18} style={{ color: 'var(--macro)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: 'var(--text-2)', fontSize: 13, fontWeight: 500 }}>Quest XP Progress</span>
            <span style={{ color: 'var(--macro)', fontSize: 12, fontFamily: 'var(--font-data)', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
              {earnedReward.toLocaleString()} / {totalReward.toLocaleString()} XP
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ height: 6, borderRadius: 99, background: 'oklch(1 0 0 / 0.06)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${rewardPct}%`, borderRadius: 99, background: 'linear-gradient(90deg, oklch(0.50 0.24 278), oklch(0.72 0.18 278))', transition: 'width 0.6s var(--ease-silk)' }} />
            </div>
            {[0,25,50,75,100].map(t => (
              <div key={t} style={{ position: 'absolute', left: `${t}%`, top: 8, transform: 'translateX(-50%)', width: 1, height: 5, background: t <= rewardPct ? 'var(--macro-dim)' : 'oklch(1 0 0 / 0.10)' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Quests by phase */}
      {byPhase.map(({ phase, quests: pq }) => {
        if (pq.length === 0) return null
        const color = PHASE_COLORS[phase]
        return (
          <div key={phase} style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div className="g3" style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, border: `1px solid ${color.slice(0,-1)} / 0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color, fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-data)' }}>P{phase}</span>
              </div>
              <span style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600 }}>{phaseLabels[phase]}</span>
              <div className="scan-divider" style={{ flex: 1 }} />
              <span style={{ color: 'var(--text-4)', fontSize: 10 }}>{pq.length} quest{pq.length !== 1 ? 's' : ''}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pq.map(q => <QuestCard key={q.id} quest={q} />)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
