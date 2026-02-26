// Current score snapshot — mock data representing early Phase 2
export const currentScore = {
  total_xp: 1877,
  max_xp: 10000,
  phase: 2,
  level: 1,
  level_name: 'Cash Layer Forms',
  level_label: 'Emerging',
  xp_to_next_level: 423, // need Phase 2 L2: RLUSD > $500M sustained + vol > $10M/day
  computed_at: '2026-02-24T00:20:00Z',
  tier_scores: {
    t1: { xp: 1291, max: 2500, trend: 'up', label: 'Supply Sinks' },
    t2: { xp: 263,  max: 2500, trend: 'up', label: 'Cash Layer' },
    t3: { xp: 77,   max: 2000, trend: 'up', label: 'Tokenized Assets' },
    t4: { xp: 244,  max: 1500, trend: 'up', label: 'Liquidity Venue' },
    t5: { xp: 2,    max: 1500, trend: 'flat', label: 'Bridge / Routing' },
  },
  badges_earned: ['B01', 'B02', 'B03', 'B04'],
}

export const phases = [
  {
    id: 1,
    name: 'Investable Asset',
    status: 'complete', // complete | active | locked
    level: 3,
    description: 'XRP recognized as a structured financial asset',
    color: '#10B981',
  },
  {
    id: 2,
    name: 'Cash Layer Forms',
    status: 'active',
    level: 1,
    description: 'Native stablecoin achieving real utility',
    color: '#00AAE4',
  },
  {
    id: 3,
    name: 'Tokenized Capital Markets',
    status: 'locked',
    level: 0,
    description: 'XRPL as issuance and settlement infrastructure',
    color: '#8B5CF6',
  },
  {
    id: 4,
    name: 'Liquidity Venue',
    status: 'locked',
    level: 0,
    description: 'XRPL functioning as a live market venue',
    color: '#F59E0B',
  },
  {
    id: 5,
    name: 'Global Routing',
    status: 'locked',
    level: 0,
    description: 'XRP routing real-world payment corridors at scale',
    color: '#EF4444',
  },
]

// 30-day XP history for trend chart
export const xpHistory = [
  { date: '2026-01-26', xp: 1420 },
  { date: '2026-01-28', xp: 1445 },
  { date: '2026-01-30', xp: 1480 },
  { date: '2026-02-01', xp: 1510 },
  { date: '2026-02-03', xp: 1555 },
  { date: '2026-02-05', xp: 1580 },
  { date: '2026-02-07', xp: 1620 },
  { date: '2026-02-09', xp: 1648 },
  { date: '2026-02-11', xp: 1690 },
  { date: '2026-02-13', xp: 1712 },
  { date: '2026-02-15', xp: 1745 },
  { date: '2026-02-17', xp: 1780 },
  { date: '2026-02-19', xp: 1800 },
  { date: '2026-02-21', xp: 1836 },
  { date: '2026-02-24', xp: 1877 },
]
