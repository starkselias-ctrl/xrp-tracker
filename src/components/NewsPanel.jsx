import { useEffect, useState, useCallback } from 'react'

const TABS = [
  { label: 'XRP / Ripple', categories: 'XRP,Ripple,RippleNet' },
  { label: 'Macro', categories: 'Trading,Market,Regulation,Blockchain,Geopolitics' },
]

function timeAgo(unixSec) {
  const diff = Math.floor(Date.now() / 1000) - unixSec
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function NewsPanel({ onAnalyze }) {
  const [tab, setTab] = useState(0)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const cat = TABS[tab].categories
      const res = await fetch(
        `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=${encodeURIComponent(cat)}&sortOrder=latest&extraParams=xrp-tracker`
      )
      const json = await res.json()
      if (Array.isArray(json.Data)) {
        setArticles(json.Data.slice(0, 20))
      } else {
        throw new Error(json.Message || 'No data returned from news API')
      }
    } catch (e) {
      setError('Could not load news. ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => {
    fetchNews()
    const interval = setInterval(fetchNews, 5 * 60_000) // refresh every 5 min
    return () => clearInterval(interval)
  }, [fetchNews])

  return (
    <div className="card news-card">
      <div className="card-header">
        <span className="card-title">Daily Updates</span>
        <div className="tab-selector">
          {TABS.map((t, i) => (
            <button
              key={t.label}
              className={`tab-btn ${tab === i ? 'active' : ''}`}
              onClick={() => setTab(i)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="news-body">
        {loading && (
          <div className="news-loading">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="news-skeleton">
                <div className="skeleton-line short" />
                <div className="skeleton-line" />
                <div className="skeleton-line medium" />
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="news-error">
            <span>{error}</span>
            <button className="retry-btn" onClick={fetchNews}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <div className="news-list">
            {articles.map(article => (
              <NewsItem
                key={article.id}
                article={article}
                onAnalyze={onAnalyze}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function NewsItem({ article, onAnalyze }) {
  const categories = article.categories
    ? article.categories.split('|').filter(Boolean).slice(0, 3)
    : []

  const handleAnalyze = () => {
    onAnalyze(`${article.title}\n\nSource: ${article.source_info?.name || article.source}\n\nSummary: ${article.body?.slice(0, 400) || ''}`)
  }

  return (
    <div className="news-item">
      <div className="news-item-content">
        <div className="news-meta">
          <span className="news-source">{article.source_info?.name || article.source}</span>
          <span className="news-dot">·</span>
          <span className="news-time">{timeAgo(article.published_on)}</span>
        </div>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="news-title"
        >
          {article.title}
        </a>
        {categories.length > 0 && (
          <div className="news-tags">
            {categories.map(c => (
              <span key={c} className="news-tag">{c.trim()}</span>
            ))}
          </div>
        )}
      </div>
      <button
        className="analyze-btn"
        onClick={handleAnalyze}
        title="Analyze XRP impact with AI"
      >
        Analyze XRP Impact
      </button>
    </div>
  )
}
