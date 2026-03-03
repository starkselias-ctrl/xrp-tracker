import ThesisTier from '../components/ui/ThesisTier'
import RadialArc from '../components/ui/RadialArc'
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

const tiers = [
  { tier:1, name:'Supply Sinks', status:'green', signal:'ETF holdings at 523M XRP and climbing. Exchange balances declining 9.2% over 30d — supply squeeze conditions forming.', confidence:82, bull:true },
  { tier:2, name:'Cash Layer', status:'green', signal:'RLUSD at $485M mcap (+38% MTD) and accelerating. Transfer volume $18.5M/day. Approaching critical Phase 2 L2 threshold ($500M).', confidence:88, bull:true },
  { tier:3, name:'Tokenized Assets', status:'yellow', signal:'Tokenized AUM at $180M — early pilot stage. Only 2 repeat issuers. DvP not yet in production. Significant growth needed.', confidence:62, bull:false },
  { tier:4, name:'Liquidity Venue', status:'yellow', signal:'Order book depth at $42M (2%), functional but below institutional threshold. DEX volume $6.8M/day — growing but well below $50M target.', confidence:80, bull:false },
  { tier:5, name:'Bridge / Routing', status:'gray', signal:'Bridge proxy at $0.7M/day — approaching the $1M "Emerging" threshold. High uncertainty (proxy metric). No confirmed ODL corridor data.', confidence:42, bull:false },
]
const bullSignals = [
  'RLUSD mcap up 38% month-to-date — strongest growth rate since launch',
  'ETF/ETP holdings grew 14.2% over 30d — institutional accumulation continuing',
  'Exchange balances declined 9.2% in 30d — supply being absorbed from exchanges',
  'XRPL AMM TVL up 22.5% in 30d — DEX infrastructure deepening',
  'RLUSD transfer volume growing 61% over 30 days — velocity improving',
]
const bearSignals = [
  'Bridge proxy volume flat-to-slight at $0.7M/day — Phase 5 remains distant',
  'Tokenized AUM only 2 repeat issuers — institutional issuance not yet at scale',
  'DEX volume $6.8M/day — ~7x growth needed for Phase 4 liquidity venue status',
  'DvP production milestone unconfirmed — Phase 3 remains in early stage',
]
const prerequisites = [
  ['Supply Sinks', 'Regulated ETFs absorb supply. Exchange balances drain. Professional capital with long time horizons.'],
  ['Cash Layer', 'RLUSD provides the dollar-denominated settlement instrument that makes XRP bridge economics viable.'],
  ['Tokenized Capital Markets', 'Real assets issued and settled on XRPL create structural, recurring XRP settlement demand.'],
  ['Liquidity Venue', "Deep books and DEX volume mean large settlements don't move price — the institutional floor."],
  ['Global Routing', 'XRP routes actual payment corridors — the final confirmation of the demand mechanism working at scale.'],
]

export default function Thesis() {
  const bullCount = tiers.filter(t => t.status === 'green').length
  const overall = bullCount >= 3 ? 'strengthening' : bullCount >= 2 ? 'mixed' : 'weakening'
  const overallColor = overall === 'strengthening' ? 'oklch(0.72 0.19 145)' : overall === 'mixed' ? 'oklch(0.78 0.17 70)' : 'oklch(0.65 0.22 25)'
  const cv = overall === 'strengthening' ? 'var(--positive)' : overall === 'mixed' ? 'var(--neutral)' : 'var(--negative)'
  const ct = overall === 'strengthening' ? 'var(--positive-tint)' : overall === 'mixed' ? 'var(--neutral-tint)' : 'var(--negative-tint)'
  const cb = overall === 'strengthening' ? 'var(--positive-border)' : overall === 'mixed' ? 'var(--neutral-border)' : 'var(--negative-border)'
  const cg = overall === 'strengthening' ? 'var(--positive-glow)' : overall === 'mixed' ? 'var(--neutral-glow)' : 'var(--negative-glow)'

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ color: 'var(--text-1)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Thesis Health</h1>
        <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Are the structural prerequisites for the XRP bull case strengthening or weakening?</p>
      </div>

      {/* Overall status */}
      <div className="g2" style={{
        borderRadius: 16, border: `1px solid ${cb}`,
        padding: '24px 28px', marginBottom: 32,
        boxShadow: `0 0 48px ${cg}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          <RadialArc value={(bullCount / 5) * 100} size={56} color={overallColor} strokeWidth={4} label={`${bullCount}/5`} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <TrendingUp size={16} style={{ color: cv }} />
              <span style={{ color: 'var(--text-1)', fontSize: 18, fontWeight: 700, textTransform: 'capitalize' }}>Thesis {overall}</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 10px', borderRadius: 99, color: cv, background: ct, border: `1px solid ${cb}` }}>
              {bullCount} of 5 tiers positive
            </span>
          </div>
        </div>
        <p style={{ color: 'var(--text-3)', fontSize: 13, lineHeight: 1.7 }}>
          Supply and cash layer signals are the strongest indicators this cycle. Tokenization and DEX liquidity are the critical next prerequisites. Bridge routing remains nascent — the ultimate confirmation metric for the XRP payments thesis.
        </p>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-4)', fontSize: 11 }}>
          <AlertTriangle size={10} /> Market structure tracking only — not financial advice or a price prediction.
        </div>
      </div>

      {/* Tier panels */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ color: 'var(--text-4)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Tier-by-Tier Status</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tiers.map(t => <ThesisTier key={t.tier} {...t} />)}
        </div>
      </div>

      {/* Signals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
        <div className="g2" style={{ borderRadius: 14, padding: 20, border: '1px solid var(--positive-border)', borderLeft: '3px solid var(--positive)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <TrendingUp size={13} style={{ color: 'var(--positive)', filter: 'drop-shadow(0 0 3px var(--positive-glow))' }} />
            <span style={{ color: 'var(--positive)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Bull Signals</span>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bullSignals.map((s, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
                <span style={{ color: 'var(--positive)', flexShrink: 0, marginTop: 1 }}>↑</span>{s}
              </li>
            ))}
          </ul>
        </div>
        <div className="g2" style={{ borderRadius: 14, padding: 20, border: '1px solid var(--negative-border)', borderLeft: '3px solid var(--negative)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <TrendingDown size={13} style={{ color: 'var(--negative)' }} />
            <span style={{ color: 'var(--negative)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Gaps & Risks</span>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bearSignals.map((s, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
                <span style={{ color: 'var(--negative)', flexShrink: 0, marginTop: 1 }}>→</span>{s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Prerequisites */}
      <div className="g2" style={{ border: '1px solid var(--border)', borderRadius: 16, padding: '28px 28px' }}>
        <h2 style={{ color: 'var(--text-1)', fontSize: 15, fontWeight: 700, marginBottom: 12 }}>The Bull Case Prerequisites</h2>
        <p style={{ color: 'var(--text-3)', fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
          XRP&apos;s structural case rests on five things happening in sequence — not price speculation, not hype. Just the infrastructure that would need to exist for XRP to function as a global settlement asset at scale.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {prerequisites.map(([title, desc], i) => (
            <div key={i} style={{ display: 'flex', gap: 14 }}>
              <div className="g3" style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1, border: '1px solid var(--live-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--live)', fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-data)' }}>{i + 1}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-2)', fontSize: 12, fontWeight: 600 }}>{title}: </span>
                <span style={{ color: 'var(--text-3)', fontSize: 12, lineHeight: 1.6 }}>{desc}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="scan-divider" style={{ marginTop: 20, marginBottom: 14 }} />
        <p style={{ color: 'var(--text-4)', fontSize: 11, lineHeight: 1.6 }}>
          Each metric is a brick. The XP score is the building. Confidence scores tell you how much to trust each brick. Not financial advice — structural market tracking for informed analysis.
        </p>
      </div>
    </div>
  )
}
