import { useState, useRef, useEffect } from 'react'

const QUICK_EVENTS = [
  {
    label: 'US-Iran Conflict',
    text: 'US launches airstrikes on Iranian nuclear facilities. Iran threatens to close the Strait of Hormuz, cutting off 20% of global oil supply. Oil spikes to $140/barrel. Global markets open sharply lower.',
  },
  {
    label: 'Fed Rate Cut',
    text: 'Federal Reserve cuts interest rates by 50 basis points in an emergency meeting citing slowing economic growth. Dollar weakens sharply against major currencies. Risk assets rally.',
  },
  {
    label: 'BTC All-Time High',
    text: 'Bitcoin breaks $200,000 for the first time, driven by massive institutional ETF inflows and sovereign wealth fund allocations. Total crypto market cap crosses $8 trillion.',
  },
  {
    label: 'Trump Tariffs',
    text: 'Trump administration announces sweeping 50% tariffs on all Chinese goods and 25% on European imports, escalating global trade war. Stock markets fall 5%. Dollar initially spikes.',
  },
  {
    label: 'BRICS Payment System',
    text: 'BRICS nations launch a new cross-border payment system to replace SWIFT for member country trade. Saudi Arabia and UAE announce they will accept the new system for oil transactions.',
  },
  {
    label: 'Ripple CBDC Deal',
    text: 'Ripple announces CBDC platform partnerships with 5 central banks, including a G20 nation. ODL volume reported up 400% year-over-year. XRP ETF application filed with SEC.',
  },
]

function parseSignal(text) {
  const upper = text.toUpperCase()
  if (upper.includes('BULLISH')) return 'bullish'
  if (upper.includes('BEARISH')) return 'bearish'
  return 'neutral'
}

export function MacroAnalyzer({ pendingEvent, onClearPending }) {
  const [input, setInput] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState(null)
  const [hasApiKey, setHasApiKey] = useState(true)
  const responseRef = useRef(null)
  const abortRef = useRef(null)

  // When a news item sends a pending event, populate and auto-analyze
  useEffect(() => {
    if (pendingEvent) {
      setInput(pendingEvent)
      onClearPending()
      // slight delay so the input renders first
      setTimeout(() => runAnalysis(pendingEvent), 100)
    }
  }, [pendingEvent]) // eslint-disable-line react-hooks/exhaustive-deps

  // Check API key on mount
  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setHasApiKey(d.apiKey))
      .catch(() => setHasApiKey(false))
  }, [])

  // Auto-scroll response
  useEffect(() => {
    if (responseRef.current && analysis) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight
    }
  }, [analysis])

  const runAnalysis = async (eventText) => {
    const text = (eventText || input).trim()
    if (!text) return
    if (abortRef.current) abortRef.current.abort()

    const controller = new AbortController()
    abortRef.current = controller

    setAnalyzing(true)
    setAnalysis('')
    setError(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: text }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6)
          if (payload === '[DONE]') break
          try {
            const parsed = JSON.parse(payload)
            if (parsed.error) throw new Error(parsed.error)
            if (parsed.text) setAnalysis(prev => prev + parsed.text)
          } catch (e) {
            if (e.message !== 'Unexpected end of JSON input') throw e
          }
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        setError(e.message)
      }
    } finally {
      setAnalyzing(false)
      abortRef.current = null
    }
  }

  const signal = analysis ? parseSignal(analysis) : null

  return (
    <div className="card analyzer-card">
      <div className="card-header">
        <div>
          <span className="card-title">Macro Impact Analyzer</span>
          <span className="card-subtitle">
            Contextualizes world events through your XRP structural thesis
          </span>
        </div>
        {signal && (
          <div className={`signal-badge ${signal}`}>
            {signal.toUpperCase()}
          </div>
        )}
      </div>

      {!hasApiKey && (
        <div className="api-key-notice">
          <strong>Setup required:</strong> Add your Anthropic API key to a <code>.env</code> file
          in the project root: <code>ANTHROPIC_API_KEY=sk-ant-...</code> then restart the server.
        </div>
      )}

      <div className="analyzer-body">
        <div className="quick-events">
          <span className="quick-label">Quick scenarios:</span>
          {QUICK_EVENTS.map(e => (
            <button
              key={e.label}
              className="quick-chip"
              onClick={() => { setInput(e.text); runAnalysis(e.text) }}
              disabled={analyzing}
            >
              {e.label}
            </button>
          ))}
        </div>

        <div className="input-row">
          <textarea
            className="event-input"
            placeholder="Describe any macro event, geopolitical development, or market movement — and get a structural XRP impact analysis..."
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={3}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) runAnalysis()
            }}
          />
          <button
            className={`analyze-submit ${analyzing ? 'loading' : ''}`}
            onClick={() => analyzing ? abortRef.current?.abort() : runAnalysis()}
            disabled={!input.trim() && !analyzing}
          >
            {analyzing ? (
              <>
                <span className="btn-spinner" />
                Stop
              </>
            ) : (
              'Analyze Impact'
            )}
          </button>
        </div>

        {error && (
          <div className="analysis-error">{error}</div>
        )}

        {(analysis || analyzing) && (
          <div className="analysis-response" ref={responseRef}>
            <AnalysisContent text={analysis} streaming={analyzing} />
          </div>
        )}
      </div>
    </div>
  )
}

function AnalysisContent({ text, streaming }) {
  if (!text && streaming) {
    return <div className="analysis-thinking">Analyzing through XRP thesis...</div>
  }

  // Split into sections by ** headings
  const sections = text.split(/(\*\*[^*]+\*\*)/).filter(Boolean)

  return (
    <div className="analysis-text">
      {sections.map((section, i) => {
        if (section.startsWith('**') && section.endsWith('**')) {
          const heading = section.slice(2, -2)
          const sectionClass = heading.toUpperCase().includes('SIGNAL') ? 'signal' :
            heading.toUpperCase().includes('DOMINO') ? 'domino' :
            heading.toUpperCase().includes('STRUCTURAL') ? 'structural' : 'immediate'
          return (
            <div key={i} className={`analysis-section-heading ${sectionClass}`}>
              {heading}
            </div>
          )
        }
        return <span key={i} className="analysis-paragraph">{section}</span>
      })}
      {streaming && <span className="cursor-blink" />}
    </div>
  )
}
