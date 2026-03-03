import { clsx } from 'clsx'

export function cn(...inputs) {
  return clsx(inputs)
}

export function fmt(value, unit) {
  if (value === null || value === undefined) return '—'
  if (unit === 'binary') return value === 1 ? 'Live' : 'Pending'
  if (unit === 'count') return Math.round(value).toLocaleString()
  if (typeof value !== 'number') return value

  if (unit?.includes('M XRP') || unit?.includes('B XRP')) {
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} ${unit}`
  }
  if (unit?.includes('M USD') || unit?.includes('B USD')) {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}${unit.includes('day') ? '/d' : ''}`
  }
  if (unit === '%') return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  if (unit === 'ratio') return value.toFixed(3)

  return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export function fmtShort(value, unit) {
  if (value === null || value === undefined) return '—'
  if (unit === 'binary') return value === 1 ? '✓ Live' : '○ Pending'
  if (typeof value !== 'number') return String(value)

  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 })
}

export function trendColor(pct, invert = false) {
  if (pct === 0) return 'text-[#5B7099]'
  const positive = invert ? pct < 0 : pct > 0
  return positive ? 'text-[#10B981]' : 'text-[#EF4444]'
}

export function trendArrow(pct, invert = false) {
  if (Math.abs(pct) < 0.1) return '→'
  const positive = invert ? pct < 0 : pct > 0
  return positive ? '↑' : '↓'
}

export function confidenceColor(score) {
  if (score >= 80) return '#10B981'
  if (score >= 60) return '#F59E0B'
  if (score >= 40) return '#F97316'
  return '#EF4444'
}

export function confidenceLabel(score) {
  if (score >= 80) return 'High'
  if (score >= 60) return 'Medium'
  if (score >= 40) return 'Low'
  return 'Very Low'
}

export function statusColor(status) {
  if (status === 'positive') return '#10B981'
  if (status === 'negative') return '#EF4444'
  return '#5B7099'
}

export function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function pctBar(pct) {
  return Math.min(100, Math.max(0, pct))
}
