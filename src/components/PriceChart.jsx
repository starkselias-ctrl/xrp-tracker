import { useEffect, useState, useCallback } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'

const PERIODS = [
  { label: '1D', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
]

function formatDate(ts, days) {
  const d = new Date(ts)
  if (days <= 1) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  if (days <= 7) return d.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="tooltip-price">${payload[0].value.toFixed(4)}</div>
      <div className="tooltip-date">{label}</div>
    </div>
  )
}

export function PriceChart() {
  const [period, setPeriod] = useState(PERIODS[1])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isUp, setIsUp] = useState(true)

  const fetchChart = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/ripple/market_chart?vs_currency=usd&days=${period.days}`
      )
      if (!res.ok) throw new Error('Rate limited — try again in a moment')
      const json = await res.json()

      const prices = json.prices ?? []
      // downsample for 90D to avoid dense chart
      const step = period.days >= 90 ? 3 : 1
      const data = prices
        .filter((_, i) => i % step === 0)
        .map(([ts, price]) => ({
          date: formatDate(ts, period.days),
          price: parseFloat(price.toFixed(4)),
        }))

      setChartData(data)
      if (data.length >= 2) {
        setIsUp(data[data.length - 1].price >= data[0].price)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchChart()
  }, [fetchChart])

  const color = isUp ? '#3fb950' : '#f85149'
  const gradientId = isUp ? 'greenGrad' : 'redGrad'

  const minPrice = chartData.length ? Math.min(...chartData.map(d => d.price)) : 0
  const maxPrice = chartData.length ? Math.max(...chartData.map(d => d.price)) : 0
  const range = maxPrice - minPrice
  const yDomain = [
    parseFloat((minPrice - range * 0.05).toFixed(4)),
    parseFloat((maxPrice + range * 0.05).toFixed(4)),
  ]

  return (
    <div className="card chart-card">
      <div className="card-header">
        <span className="card-title">Price Chart</span>
        <div className="period-selector">
          {PERIODS.map(p => (
            <button
              key={p.label}
              className={`period-btn ${period.label === p.label ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-body">
        {loading && (
          <div className="chart-loading">
            <div className="spinner" />
            <span>Loading price data...</span>
          </div>
        )}
        {error && !loading && (
          <div className="chart-error">
            <span>{error}</span>
            <button className="retry-btn" onClick={fetchChart}>Retry</button>
          </div>
        )}
        {!loading && !error && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#8b949e', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={yDomain}
                tick={{ fill: '#8b949e', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `$${v.toFixed(3)}`}
                width={65}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 4, fill: color, stroke: '#0d1117', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
