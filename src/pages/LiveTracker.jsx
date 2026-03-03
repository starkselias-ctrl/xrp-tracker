import { useState } from 'react'
import '../App.css'
import { PriceHeader } from '../components/PriceHeader'
import { PriceChart } from '../components/PriceChart'
import { NewsPanel } from '../components/NewsPanel'
import { MacroAnalyzer } from '../components/MacroAnalyzer'

export default function LiveTracker() {
  const [pendingEvent, setPendingEvent] = useState(null)

  return (
    <div className="app">
      <PriceHeader />

      <main className="main-grid">
        <div className="col-left">
          <PriceChart />
        </div>
        <div className="col-right">
          <NewsPanel onAnalyze={setPendingEvent} />
        </div>
      </main>

      <div className="analyzer-section">
        <MacroAnalyzer
          pendingEvent={pendingEvent}
          onClearPending={() => setPendingEvent(null)}
        />
      </div>

      <footer className="app-footer">
        Price data: CoinGecko · News: CryptoCompare · Analysis: Claude AI (Anthropic)
      </footer>
    </div>
  )
}
