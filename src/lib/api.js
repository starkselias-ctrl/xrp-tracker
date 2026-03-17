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

// Group a CoinGecko [timestamp, value] series into ISO-week buckets (keyed by Monday date string)
function groupCgToWeeks(series) {
  if (!Array.isArray(series)) return {}
  const weeks = {}
  for (const [ts, val] of series) {
    const date = new Date(ts)
    const day = date.getUTCDay()
    const monday = new Date(date)
    monday.setUTCDate(date.getUTCDate() - (day === 0 ? 6 : day - 1))
    monday.setUTCHours(0, 0, 0, 0)
    const key = monday.toISOString().slice(0, 10)
    if (!weeks[key]) weeks[key] = []
    weeks[key].push(val)
  }
  return Object.fromEntries(
    Object.entries(weeks).map(([k, vals]) => [k, {
      start: vals[0],
      end: vals[vals.length - 1],
      avg: vals.reduce((a, b) => a + b, 0) / vals.length,
    }])
  )
}

// Group a DefiLlama [{date (unix seconds), totalLiquidityUSD}] TVL series into weekly buckets
function groupLlamaTvlToWeeks(tvlArray) {
  if (!Array.isArray(tvlArray)) return {}
  const weeks = {}
  for (const entry of tvlArray) {
    const ts = (entry.date ?? 0) * 1000
    const val = entry.totalLiquidityUSD ?? entry.tvl ?? 0
    const date = new Date(ts)
    const day = date.getUTCDay()
    const monday = new Date(date)
    monday.setUTCDate(date.getUTCDate() - (day === 0 ? 6 : day - 1))
    monday.setUTCHours(0, 0, 0, 0)
    const key = monday.toISOString().slice(0, 10)
    if (!weeks[key]) weeks[key] = []
    weeks[key].push(val)
  }
  return Object.fromEntries(
    Object.entries(weeks).map(([k, vals]) => [k, {
      start: vals[0],
      end: vals[vals.length - 1],
      avg: vals.reduce((a, b) => a + b, 0) / vals.length,
    }])
  )
}

// Group a DefiLlama totalDataChart [[timestamp (unix seconds), value]] into weekly buckets
function groupLlamaChartToWeeks(chart) {
  if (!Array.isArray(chart)) return {}
  const weeks = {}
  for (const [ts, val] of chart) {
    const date = new Date(ts * 1000)
    const day = date.getUTCDay()
    const monday = new Date(date)
    monday.setUTCDate(date.getUTCDate() - (day === 0 ? 6 : day - 1))
    monday.setUTCHours(0, 0, 0, 0)
    const key = monday.toISOString().slice(0, 10)
    if (!weeks[key]) weeks[key] = []
    weeks[key].push(val)
  }
  return Object.fromEntries(
    Object.entries(weeks).map(([k, vals]) => [k, {
      start: vals[0],
      end: vals[vals.length - 1],
      avg: vals.reduce((a, b) => a + b, 0) / vals.length,
    }])
  )
}

const TIMELINE_CACHE_KEY = 'xrt_timeline_v1'
const TIMELINE_TTL = 60 * 60 * 1000 // 1 hour

/**
 * Fetch weekly historical snapshots for the Timeline.
 * Returns array of weeks (newest first), each with:
 *   { week, label, xrp_start, xrp_end, rlusd_mcap_start, rlusd_mcap_end,
 *     amm_tvl_start, amm_tvl_end, dex_vol_avg }
 */
export async function fetchWeeklyHistory(numWeeks = 8) {
  // Check cache
  try {
    const c = JSON.parse(localStorage.getItem(TIMELINE_CACHE_KEY) ?? 'null')
    if (c && Date.now() - c.ts < TIMELINE_TTL) return c.data
  } catch {}

  const [cgXrp, cgRlusd, llamaProtocol, llamaDex] = await Promise.allSettled([
    get(`${CG}/coins/ripple/market_chart?vs_currency=usd&days=90`),
    get(`${CG}/coins/ripple-usd/market_chart?vs_currency=usd&days=90`),
    get(`${LLAMA}/protocol/xrpl-dex`),
    get(`${LLAMA}/summary/dexs/xrpl-dex?dataType=dailyVolume`),
  ])

  const xrpWeeks    = cgXrp.status    === 'fulfilled' ? groupCgToWeeks(cgXrp.value?.prices)         : {}
  const rlusdWeeks  = cgRlusd.status  === 'fulfilled' ? groupCgToWeeks(cgRlusd.value?.market_caps)  : {}
  const tvlWeeks    = llamaProtocol.status === 'fulfilled'
    ? groupLlamaTvlToWeeks(llamaProtocol.value?.tvl ?? llamaProtocol.value?.chainTvls?.XRPL?.tvl ?? [])
    : {}
  const dexWeeks    = llamaDex.status === 'fulfilled'
    ? groupLlamaChartToWeeks(llamaDex.value?.totalDataChart ?? [])
    : {}

  // Collect all week keys, sort descending, take last N complete weeks
  const allKeys = [...new Set([
    ...Object.keys(xrpWeeks),
    ...Object.keys(rlusdWeeks),
    ...Object.keys(tvlWeeks),
    ...Object.keys(dexWeeks),
  ])].sort().reverse()

  // Skip the current (incomplete) week — it's the first key if today isn't Sunday
  const today = new Date()
  const todayDay = today.getUTCDay()
  const thisMonday = new Date(today)
  thisMonday.setUTCDate(today.getUTCDate() - (todayDay === 0 ? 6 : todayDay - 1))
  thisMonday.setUTCHours(0, 0, 0, 0)
  const thisMondayKey = thisMonday.toISOString().slice(0, 10)

  const weeks = allKeys
    .filter(k => k < thisMondayKey) // only complete weeks
    .slice(0, numWeeks)

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const result = weeks.map(mondayKey => {
    const d = new Date(mondayKey + 'T00:00:00Z')
    const label = `Week of ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`

    const xrp   = xrpWeeks[mondayKey]
    const rlusd = rlusdWeeks[mondayKey]
    const tvl   = tvlWeeks[mondayKey]
    const dex   = dexWeeks[mondayKey]

    return {
      week: mondayKey,
      label,
      xrp_start:        xrp   ? +xrp.start.toFixed(4)                    : null,
      xrp_end:          xrp   ? +xrp.end.toFixed(4)                      : null,
      rlusd_mcap_start: rlusd ? +(rlusd.start / 1e6).toFixed(1)          : null,
      rlusd_mcap_end:   rlusd ? +(rlusd.end   / 1e6).toFixed(1)          : null,
      amm_tvl_start:    tvl   ? +(tvl.start   / 1e6).toFixed(2)          : null,
      amm_tvl_end:      tvl   ? +(tvl.end     / 1e6).toFixed(2)          : null,
      dex_vol_avg:      dex   ? +(dex.avg     / 1e6).toFixed(2)          : null,
    }
  })

  try {
    localStorage.setItem(TIMELINE_CACHE_KEY, JSON.stringify({ data: result, ts: Date.now() }))
  } catch {}

  return result
}
