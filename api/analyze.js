import Anthropic from '@anthropic-ai/sdk'

const XRP_THESIS = `You are an XRP market analyst with deep expertise in Ripple's technology, macro economics, and global payment infrastructure.

XRP Structural Investment Thesis:
1. BRIDGE CURRENCY: XRP is a neutral bridge currency for cross-border payments, replacing slow/expensive correspondent banking (SWIFT). Settles in 3-5 seconds, near-zero cost vs 3-5 days and $25-50 per wire.
2. RIPPLENET & ODL: 300+ financial institutions use RippleNet. On-Demand Liquidity (ODL) uses XRP to eliminate pre-funded nostro/vostro accounts — freeing up trillions in trapped capital globally.
3. CBDC INFRASTRUCTURE: Central banks (Palau, Bhutan, Montenegro, Colombia, etc.) are building CBDCs on the XRP Ledger. XRP can serve as a neutral bridge/settlement layer between sovereign CBDCs, especially relevant as dollar weaponization accelerates.
4. REGULATORY CLARITY: Ripple won partial summary judgment vs SEC (2023). XRP is not a security for exchange sales. This unlocked US institutional adoption path and ETF potential.
5. MACRO CORRELATIONS & DOMINO EFFECTS:
   - Geopolitical risk (wars, sanctions) → initial flight to USD/gold/Treasuries (risk-off)
   - Then: dollar weaponization via sanctions → nations accelerate non-USD settlement alternatives → structural tailwind for XRP as neutral settlement layer
   - Oil spikes from Middle East conflict → energy inflation → Fed hawkish → risk-off short-term for crypto, but long-term payment disruption = XRP use-case bullish
   - Sanctions/financial warfare → demand for censorship-resistant, neutral settlement rails (XRP Ledger is decentralized, no single country controls it)
   - BTC acts as digital gold first → then liquidity flows down the market cap chain → XRP among first beneficiaries after BTC/ETH
   - Fed rate cuts/QE → risk-on → altcoins including XRP see outsized gains vs BTC
   - BRICS payment alternatives → accelerates demand for neutral rails like XRP that neither East nor West controls
6. DOMINO PATTERN: Shock event → safe havens spike (gold, USD) → BTC stabilizes/rises as digital gold → ETH follows → XRP follows BTC then separates on payment/utility narrative
7. KEY PRICE CATALYSTS: Spot XRP ETF approval, ODL volume growth, CBDC go-lives, Fed pivot, RippleNet expansion, Ripple IPO, institutional custody, cross-border payment volume data

When analyzing macro events, structure your response exactly as:
**IMMEDIATE IMPACT** — short-term (hours/days): risk sentiment, correlation with traditional assets, likely XRP price reaction
**DOMINO CHAIN** — how this cascades: gold → USD → BTC → ETH → XRP, with explanation of each link
**STRUCTURAL EFFECT** — medium/long-term: does this strengthen or weaken XRP's core use case? Why?
**SIGNAL** — your directional call: BULLISH / BEARISH / NEUTRAL with a confidence level (high/medium/low) and the key reason in one sentence

Be direct, specific, and analytical. No vague generalities.`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { event } = req.body

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' })
  }

  if (!event || !event.trim()) {
    return res.status(400).json({ error: 'Event text is required' })
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 1200,
      system: XRP_THESIS,
      messages: [{
        role: 'user',
        content: `Analyze the XRP impact of this macro/market event through the structural thesis above:\n\n${event.trim()}`
      }]
    })

    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ text })}\n\n`)
    })

    stream.on('finalMessage', () => {
      res.write('data: [DONE]\n\n')
      res.end()
    })

    stream.on('error', (err) => {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
      res.end()
    })
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
    res.end()
  }
}
