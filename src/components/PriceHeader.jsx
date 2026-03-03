import { useEffect, useState, useCallback } from 'react'

function fmt(n, decimals = 2) {
  if (n == null) return '—'
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

function fmtPrice(n) {
  if (n == null) return '—'
  return `$${n.toFixed(4)}`
}

export function PriceHeader() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [pulse, setPulse] = useState(false)

  const fetchPrice = useCallback(async () => {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?ids=ripple&vs_currency=usd&price_change_percentage=24h,7d'
      )
      const json = await res.json()
      if (json[0]) {
        setData(json[0])
        setLastUpdated(new Date())
        setPulse(true)
        setTimeout(() => setPulse(false), 600)
      }
    } catch {
      // keep previous data on error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPrice()
    const interval = setInterval(fetchPrice, 60_000)
    return () => clearInterval(interval)
  }, [fetchPrice])

  const change = data?.price_change_percentage_24h ?? 0
  const isUp = change >= 0

  return (
    <header className="price-header">
      <div className="header-left">
        <div className="xrp-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="#00aef9" opacity="0.15" />
            <circle cx="16" cy="16" r="12" fill="#00aef9" opacity="0.2" />
            <text x="16" y="21" textAnchor="middle" fill="#00aef9" fontSize="12" fontWeight="700" fontFamily="sans-serif">XRP</text>
          </svg>
        </div>
        <div>
          <div className="header-name">XRP / USD</div>
          <div className="header-subtitle">Ripple — CoinGecko</div>
        </div>
      </div>

      <div className={`header-price ${pulse ? 'pulse' : ''}`}>
        {loading ? <span className="skeleton-text" style={{ width: 120 }} /> : (
          <span className="price-value">{fmtPrice(data?.current_price)}</span>
        )}
        {!loading && (
          <span className={`change-badge ${isUp ? 'up' : 'down'}`}>
            {isUp ? '+' : ''}{change.toFixed(2)}%
          </span>
        )}
      </div>

      <div className="header-stats">
        <Stat label="24h High" value={fmt(data?.high_24h)} />
        <Stat label="24h Low" value={fmt(data?.low_24h)} />
        <Stat label="Market Cap" value={fmt(data?.market_cap)} />
        <Stat label="Volume 24h" value={fmt(data?.total_volume)} />
        <Stat label="Rank" value={data?.market_cap_rank ? `#${data.market_cap_rank}` : '—'} />
        <Stat label="ATH" value={fmt(data?.ath)} dim={data?.ath_change_percentage?.toFixed(1) + '%'} />
      </div>

      <div className="live-indicator">
        <span className="live-dot" />
        <span>LIVE</span>
        {lastUpdated && (
          <span className="last-updated">
            {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
      </div>
    </header>
  )
}

function Stat({ label, value, dim }) {
  return (
    <div className="header-stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value}
        {dim && <span className="stat-dim"> ({dim})</span>}
      </div>
    </div>
  )
}
