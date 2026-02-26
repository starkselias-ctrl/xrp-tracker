/**
 * Live data API module — XRP Tracker
 *
 * Sources:
 *   CoinGecko       — XRP price, RLUSD market cap + volume (free, no key)
 *   DefiLlama       — XRPL DEX 24h volume, AMM TVL (free, no key)
 *   XRPScan         — RLUSD on-chain data, exchange balances (free, no key)
 *
 * Manual / no free API:
 *   etf_xrp_holdings   — No unified free API for US XRP ETF holdings
 *   tokenized_aum      — Tracked manually
 *   repeat_issuers     — Tracked manually
 *   orderbook_depth    — Multi-venue aggregation not yet implemented
 *   bridge_proxy_volume — XRPL payment volume aggregation not yet implemented
 */

const CG       = 'https://api.coingecko.com/api/v3'
const LLAMA    = 'https://api.llama.fi'
const XRPSCAN  = 'https://api.xrpscan.com/api/v1'
const RLUSD_ISSUER = 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De'

// Known exchange name substrings (XRPScan rich list)
const EXCHANGE_NAMES = [
  'binance', 'coinbase', 'kraken', 'bitstamp', 'bithumb', 'huobi',
  'okx', 'bybit', 'uphold', 'bitfinex', 'gemini', 'kucoin', 'gate',
  'crypto.com', 'mexc', 'bitget', 'poloniex', 'bittrex', 'lbank',
  'bitbank', 'zaif', 'liquid', 'independentreserve', 'coinhako',
]

async function get(url) {
  const r = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  return r.json()
}

// Normalize XRPScan balance: auto-detect drops vs XRP
// XRP total supply ~100B; if balance > 1e11 it must be in drops
function dropsToXrp(raw) {
  const n = Number(raw)
  return n > 1e11 ? n / 1e6 : n
}

/**
 * Fast metrics — CoinGecko + DefiLlama + XRPScan token
 * Returns values keyed by metric ID (matching metrics.js ids)
 */
export async function fetchFastMetrics() {
  const [cg, vol, tvl, rlusdChain] = await Promise.allSettled([
    get(`${CG}/simple/price?ids=ripple,ripple-usd&vs_currencies=usd` +
        `&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`),
    get(`${LLAMA}/summary/dexs/xrpl-dex`),
    get(`${LLAMA}/tvl/xrpl-dex`),
    get(`${XRPSCAN}/token/RLUSD.${RLUSD_ISSUER}`),
  ])

  const out = {
    // XRP price data (not a metric ID but used by sidebar/other components)
    xrp_price:      null,
    xrp_24h_change: null,
    xrp_market_cap: null, // billions USD
    // Metric IDs
    rlusd_market_cap:      null, // M USD
    rlusd_transfer_volume: null, // M USD/day
    dex_volume:            null, // M USD/day
    amm_tvl:               null, // M USD
  }

  if (cg.status === 'fulfilled') {
    const d = cg.value
    out.xrp_price      = d.ripple?.usd ?? null
    out.xrp_24h_change = d.ripple?.usd_24h_change ?? null
    out.xrp_market_cap = d.ripple?.usd_market_cap
      ? +(d.ripple.usd_market_cap / 1e9).toFixed(2) : null

    if (d['ripple-usd']?.usd_market_cap) {
      out.rlusd_market_cap = +(d['ripple-usd'].usd_market_cap / 1e6).toFixed(1) // M USD
    }
    // Use CoinGecko volume as fallback for transfer volume
    if (d['ripple-usd']?.usd_24h_vol) {
      out.rlusd_transfer_volume = +(d['ripple-usd'].usd_24h_vol / 1e6).toFixed(1)
    }
  }

  if (vol.status === 'fulfilled' && vol.value?.total24h) {
    out.dex_volume = +(vol.value.total24h / 1e6).toFixed(2)
  }

  if (tvl.status === 'fulfilled') {
    const n = typeof tvl.value === 'number' ? tvl.value
      : typeof tvl.value?.tvl === 'number' ? tvl.value.tvl : null
    if (n !== null) out.amm_tvl = +(n / 1e6).toFixed(2)
  }

  // XRPScan on-chain RLUSD data — prefer this for transfer volume
  if (rlusdChain.status === 'fulfilled') {
    const d = rlusdChain.value
    const v = Number(d.volume24h ?? 0)
    if (v > 0) out.rlusd_transfer_volume = +(v / 1e6).toFixed(2) // M USD
  }

  return out
}

/**
 * Exchange balances — XRPScan rich list
 * Slower (large payload). Fetched separately after fast metrics.
 */
export async function fetchExchangeBalances() {
  const raw = await get(`${XRPSCAN}/balances`)
  const accounts = Array.isArray(raw) ? raw : (raw.accounts ?? raw.data ?? [])

  let totalXrp = 0
  for (const a of accounts) {
    const name = String(a.name?.name ?? a.name ?? '').toLowerCase()
    if (!EXCHANGE_NAMES.some(k => name.includes(k))) continue
    const xrp = dropsToXrp(a.balance ?? 0)
    totalXrp += xrp
  }

  return {
    // Convert to billions
    exchange_balances: totalXrp > 0 ? +(totalXrp / 1e9).toFixed(2) : null,
  }
}

/**
 * Fetch all live metric data.
 * Returns { metrics, xrp_price, xrp_24h_change, xrp_market_cap }
 */
export async function fetchAllMetrics() {
  const fast = await fetchFastMetrics()
  return fast
}
