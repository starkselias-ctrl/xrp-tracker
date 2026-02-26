import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { fetchAllMetrics, fetchExchangeBalances } from '../lib/api'

const LiveDataContext = createContext(null)

const CACHE_KEY = 'xrt_live_v1'
const TTL = 5 * 60 * 1000 // 5 minutes

function readCache() {
  try {
    const c = JSON.parse(sessionStorage.getItem(CACHE_KEY) ?? 'null')
    if (c && Date.now() - c.ts < TTL) return c
  } catch {}
  return null
}

export function LiveDataProvider({ children }) {
  const cached = readCache()
  const [metrics, setMetrics] = useState(cached?.data ?? {})
  const [loading, setLoading] = useState(!cached)
  const [lastUpdated, setLastUpdated] = useState(cached ? new Date(cached.ts) : null)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Fast metrics first (CoinGecko + DefiLlama + XRPScan token)
      const fast = await fetchAllMetrics()
      setMetrics(prev => {
        const next = { ...prev, ...fast }
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: next, ts: Date.now() }))
        return next
      })
      setLastUpdated(new Date())

      // Exchange balances separately — larger payload, non-blocking
      fetchExchangeBalances()
        .then(ex => {
          setMetrics(prev => {
            const next = { ...prev, ...ex }
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: next, ts: Date.now() }))
            return next
          })
        })
        .catch(() => { /* exchange balances unavailable — keep previous */ })
    } catch (e) {
      console.warn('[LiveData] fetch failed:', e.message)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (cached) return // already have fresh data
    refresh()
    const t = setInterval(refresh, TTL)
    return () => clearInterval(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <LiveDataContext.Provider value={{ metrics, loading, lastUpdated, error, refresh }}>
      {children}
    </LiveDataContext.Provider>
  )
}

export function useLiveData() {
  return useContext(LiveDataContext)
}
