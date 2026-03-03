# XRP Market Structure Tracker — Complete Technical & Product Spec

---

## 1. ASSUMPTIONS

1. **Auth model**: Public read for Progress Map + dashboard; email/password auth (NextAuth) required for alerts, watchlists, snapshot subscriptions.
2. **User base**: MVP targets 1–50 power users (analysts, investors). No multi-tenancy; single schema.
3. **RLUSD**: Ripple's USD stablecoin on XRPL. Primary "cash layer" indicator. Market cap + transfer volume obtained from XRPL native APIs + DEX data.
4. **ETF/ETP Holdings**: ProShares, WisdomTree, or any approved XRP ETP. Data from CoinGlass API + public fund issuer pages + SEC filings. If no spot ETF exists, metric shows "Pending — tracking launch" and contributes 0 XP.
5. **Exchange balances**: Aggregated XRP in known exchange hot/cold wallets via XRPScan/Bithomp labeled address dataset + XRPL RPC.
6. **Tokenized asset AUM**: Limited on-chain verifiable data at launch. Primary source = Ripple/XRPL Foundation press releases + on-chain trust line analysis. Manual curator entry accepted for binary milestones.
7. **Bridge routing proxy**: `(Daily XRPL payment volume XRP × spot price) − XRPL DEX volume USD` = gross bridge proxy. Labeled explicitly as PROXY-METRIC with caveat throughout.
8. **DvP + Prime Brokerage**: Binary milestone indicators; manually curated with citation links. No automated scraping for MVP.
9. **Confidence scores**: Rule-based, not ML. Based on source reliability, data freshness, and whether metric is directly observed vs. derived/proxy.
10. **Stack**: The existing Vite/React project can prototype UI components quickly. Production spec calls for Next.js 14 (App Router). Treat Vite app as throwaway sandbox or migrate.
11. **Notifications**: Email-only via Resend for MVP. Web push in V2.
12. **Cron/ETL**: Python workers using APScheduler or Celery Beat. Most metrics: daily aggregation at 00:05 UTC. Price/exchange metrics: hourly.
13. **No financial advice**: All content framed as "market structure signal tracking," not investment advice.
14. **XP system**: Deterministic. XP earned by metric crossing thresholds + sustained time above threshold. No random elements.

---

## 2. PRODUCT SPEC

### 2.1 User Stories

| ID | As a... | I want to... | Acceptance Criteria |
|----|---------|--------------|---------------------|
| U1 | Visitor | See current Phase/Level and XP score at a glance | Home renders Progress Map with phase, level, XP bar, next 3 quests — no login required |
| U2 | Visitor | Understand what each metric means | Each metric card has a "Why it matters" tooltip/modal with plain-English explanation |
| U3 | Analyst | Drill into any metric's time series | Drilldown shows chart, raw values, threshold lines, sources with timestamps |
| U4 | Registered user | Set alerts on metric thresholds | POST /alerts sends email when condition triggered |
| U5 | Registered user | Receive weekly snapshot summary | Monday email: "what changed, XP delta, quests progressed" |
| U6 | Analyst | See overall "thesis health" | Thesis Health panel shows green/yellow/red per tier with trend arrows |
| U7 | Visitor | See data source citations | Every metric value links to source(s) with URL + last_fetched timestamp |
| U8 | Analyst | Know when confidence is low | Confidence badge (0–100) on every card; below 50 shows warning |

### 2.2 Pages

| Route | Name | Key Content |
|-------|------|-------------|
| `/` | Progress Map | Phase hero banner, level bar, XP counter, active quests, badge showcase |
| `/dashboard` | Dashboard | Filterable metric cards grid by Tier, sparkline, 30d trend %, confidence badge |
| `/metric/[id]` | Metric Drilldown | Full time series, threshold lines, definition, sources table, confidence breakdown |
| `/thesis` | Thesis Health | Tier-by-tier status, bull/bear signals, confidence-weighted health score |
| `/timeline` | Timeline | Weekly/monthly snapshot feed, milestone event log |
| `/quests` | Quests | Active/completed/locked quests, XP rewards, why-it-matters |
| `/alerts` | Alerts (auth) | Alert configuration UI |
| `/settings` | Settings (auth) | Email preferences, notification frequency |
| `/methodology` | Methodology | Confidence rubric, proxy explanations, data sources |

---

## 3. DATA DICTIONARY

### 3.1 Metric Schema

```typescript
interface Metric {
  id: string;                    // e.g. "etf_xrp_holdings"
  tier: 1 | 2 | 3 | 4 | 5;
  name: string;
  short_name: string;
  definition: string;
  why_it_matters: string;
  unit: string;                  // "XRP", "USD", "count", "bps", "%", "binary"
  sources: MetricSource[];
  update_frequency: "realtime" | "hourly" | "daily" | "weekly" | "manual";
  is_proxy: boolean;
  proxy_note?: string;
  confidence_factors: string[];
  thresholds: Threshold[];
  tags: string[];
}

interface Threshold {
  label: string;
  value: number;
  direction: "above" | "below";
  sustained_days?: number;
}

interface MetricSource {
  name: string;
  url: string;
  api_endpoint?: string;
  reliability: "high" | "medium" | "low";
  notes?: string;
}
```

### 3.2 MVP Metric Set (11 Metrics)

---

#### M01 — ETF/ETP XRP Holdings
- **Tier**: 1 (Supply/Float)
- **Unit**: XRP (millions)
- **Definition**: Total XRP held across all approved spot/futures ETPs globally, as reported by fund issuers and aggregators.
- **Why it matters**: ETP inflows permanently remove XRP from circulating supply. Each 100M XRP absorbed by ETFs represents $300M+ in structured demand with no near-term sell pressure. This is the clearest demand-side structural signal.
- **Sources**: CoinGlass ETP tracker (primary), fund issuer pages, SEC EDGAR filings (weekly lag)
- **Update freq**: Daily (09:00 UTC, after NAV reports)
- **Is proxy**: No (direct holding reports)
- **Confidence factors**: `multi_source`, `regulated_disclosure`, `1d_lag`
- **Thresholds**:
  - 250M XRP (above, 7d sustained): "ETF Adoption Igniting" badge
  - 500M XRP (above, 30d sustained): Phase 1 Level 3 unlock
  - 1B XRP (above, 30d sustained): Q01 quest complete

**Example value record**:
```json
{
  "metric_id": "etf_xrp_holdings",
  "timestamp": "2026-02-24T00:00:00Z",
  "raw_value": 312500000,
  "transformed_value": 312.5,
  "unit_display": "M XRP",
  "confidence": 85,
  "source_id": "coinglass_etp",
  "notes": "Includes Biwise XRPF + WisdomTree XRPW as of 2026-02-23"
}
```

---

#### M02 — Exchange XRP Balances
- **Tier**: 1 (Supply/Float)
- **Unit**: XRP (billions)
- **Definition**: Total XRP held in wallets labeled as exchange hot/cold wallets on XRPL, aggregated across top 15 venues by volume.
- **Why it matters**: Declining exchange balances = reduced sell-side supply and potential supply shock. Rising balances = increasing sell pressure risk.
- **Sources**: XRPScan labeled address API, Bithomp API, XRPL RPC
- **Update freq**: Hourly
- **Is proxy**: No (direct on-chain)
- **Confidence factors**: `direct_on_chain`, `label_completeness_risk` (some wallets may be unlabeled; coverage ~80%)
- **Thresholds**:
  - 30d decline > 5%: "Supply Draining" positive signal
  - 30d decline > 15%: Phase 1 Level 2 quest
  - Rising > 10%: Negative signal flag

---

#### M03 — XRPL AMM/DEX Locked XRP
- **Tier**: 1 (Supply/Float)
- **Unit**: XRP (millions) + USD equivalent
- **Definition**: XRP locked in XRPL native AMM pools and CLOB liquidity positions.
- **Why it matters**: XRP in DEX/AMM pools is illiquid and non-circulating. Growing DEX TVL signals on-chain market depth maturation and an additional supply sink.
- **Sources**: XRPL AMM RPC (`amm_info`), XRPScan DEX API
- **Update freq**: Daily
- **Is proxy**: Partial (AMM balances directly queryable; CLOB liquidity requires order book aggregation)
- **Thresholds**:
  - $50M TVL: DEX maturing signal
  - $200M TVL (30d sustained): Phase 4 Level 1 trigger

---

#### M04 — RLUSD Market Cap
- **Tier**: 2 (Cash Layer)
- **Unit**: USD (millions)
- **Definition**: Total circulating RLUSD supply × $1 peg. Includes XRPL and Ethereum chain supply.
- **Why it matters**: RLUSD market cap is the primary signal for whether XRP's native stablecoin is gaining adoption. Without a viable stablecoin, the XRP settlement hypothesis cannot function at scale.
- **Sources**: CoinMarketCap RLUSD, CoinGecko RLUSD, XRPL `gateway_balances` RPC
- **Update freq**: Hourly
- **Confidence**: 90 (highly verifiable on-chain)
- **Thresholds**:
  - $100M: "Cash Layer Forming" badge
  - $500M: Phase 2 Level 1
  - $1B (30d sustained): Phase 2 Level 2
  - $3B (30d sustained): Q03 quest "Cash Layer Established"
  - $10B: Phase 2 complete

---

#### M05 — RLUSD 24h Transfer Volume
- **Tier**: 2 (Cash Layer)
- **Unit**: USD (millions/day)
- **Definition**: Total USD value of RLUSD transferred on XRPL in the past 24 hours (rolling). Includes DEX trades, payments, and cross-border transfers.
- **Why it matters**: Volume proves utility. Idle stablecoins = speculative minting. High transfer volume = active cash layer usage. Velocity (vol/mcap) > 0.1 daily is a strong confirmation signal.
- **Sources**: XRPL `account_tx` for RLUSD issuer, XRPScan token API
- **Update freq**: Daily
- **Is proxy**: No (direct on-chain)
- **Thresholds**:
  - $10M/day: "RLUSD Activating"
  - $100M/day (7d avg): Phase 2 Level 2 trigger
  - velocity (vol/mcap) > 0.1: "Velocity Confirmed" badge

---

#### M06 — Tokenized Asset AUM on XRPL
- **Tier**: 3 (Tokenized Assets)
- **Unit**: USD (millions)
- **Definition**: Total AUM of verifiably tokenized real-world assets (funds, treasuries, bonds, equities) issued on XRPL. Excludes stablecoins and wrapped crypto.
- **Why it matters**: Tokenized asset AUM drives structural XRP demand for settlement. Each tokenized fund settling in XRP requires XRP liquidity. This is the linchpin of the "capital markets on XRPL" thesis.
- **Sources**: Ripple press releases (manual curation), XRPL Foundation announcements, on-chain trust line issuer analysis, RWA.xyz where available
- **Update freq**: Weekly (manual) + automated daily trust line scan
- **Is proxy**: Partial (AUM self-reported; on-chain trust line count is verifiable)
- **Confidence**: 55–70
- **Thresholds**:
  - $100M: "Tokenization Pilot Live" badge
  - $1B: Phase 3 Level 1
  - $10B (sustained): Q05 quest / Phase 3 Level 3

---

#### M07 — Repeat Tokenized Issuers (Count)
- **Tier**: 3 (Tokenized Assets)
- **Unit**: Count (integer)
- **Definition**: Number of distinct institutional issuers who have issued ≥2 tokenized asset series on XRPL.
- **Why it matters**: Repeat issuance signals issuer confidence and infrastructure maturity. A single experiment is noise; repeat issuance by multiple institutions is signal.
- **Sources**: Curated issuer registry (manual + semi-automated trust line analysis)
- **Update freq**: Weekly
- **Confidence**: 70
- **Thresholds**:
  - 3 issuers: "Institutional Pattern Forming"
  - 10 issuers (30d sustained): Phase 3 Level 2

---

#### M08 — XRPL DEX Volume (CLOB + AMM)
- **Tier**: 4 (Liquidity Venue)
- **Unit**: USD (millions/day)
- **Definition**: Total 24h trading volume across XRPL native CLOB and AMM pools. All pairs, USD-denominated.
- **Why it matters**: DEX volume demonstrates XRPL functioning as a live trading venue, not just a settlement rail. Volume growth enables tighter spreads and deeper books.
- **Sources**: XRPScan DEX API, XRPL `offer` transaction analysis, Bithomp
- **Update freq**: Daily
- **Confidence**: 80
- **Thresholds**:
  - $5M/day: Baseline
  - $50M/day: Phase 4 Level 1
  - $200M/day (30d avg): Phase 4 Level 2

---

#### M09 — XRP Order Book Depth (Top Venues)
- **Tier**: 4 (Liquidity Venue)
- **Unit**: USD depth at 1%/2%/5% from mid; spread in bps
- **Definition**: Aggregated bid+ask depth within 1%, 2%, and 5% of mid-price across top 5 XRP/USD and XRP/USDT pairs on Binance, Coinbase, Kraken, and Bitstamp.
- **Why it matters**: Deep order books reduce slippage for large settlements. Bridge use at scale requires that $1M+ can be settled with <0.5% slippage.
- **Sources**: Exchange REST APIs — Binance `/depth`, Coinbase `/products/XRP-USD/book`, Kraken `/Depth`
- **Update freq**: Hourly
- **Confidence**: 90
- **Thresholds**:
  - $10M depth at 2%: Functional
  - $50M depth at 2% (7d avg): Phase 4 Level 2
  - $100M depth at 1%: "Deep Market" badge

---

#### M10 — XRPL Bridge Routing Proxy Volume
- **Tier**: 5 (Bridge/Routing)
- **Unit**: USD (millions/day) — **PROXY METRIC**
- **Definition**: **[PROXY]** Estimated daily USD value routed using XRP as a bridge currency. Formula: `(Total XRPL XRP payment volume in USD) − (XRPL DEX volume USD)`. Positive residual attributed to probable bridge activity.
- **Proxy note**: Direct measurement of "XRP used as bridge" requires RippleNet corridor data that is not publicly available. This proxy is a reasonable lower-bound estimate with high uncertainty. Treat as directional signal only.
- **Why it matters**: Bridge routing is the demand mechanism for XRP in the payments thesis. ODL/CBDC bridge volume creates direct buy+sell pressure absorbed by market makers, driving structural demand.
- **Sources**: XRPL RPC ledger transaction analysis, XRPScan payment volume data
- **Update freq**: Daily
- **Is proxy**: **Yes**
- **Confidence**: 35–50 (capped; labeled prominently everywhere)
- **Thresholds**:
  - $1M/day proxy: "Bridge Signals Emerging"
  - $50M/day (7d avg): Phase 5 Level 1
  - $500M/day (30d avg): "Routing at Scale" badge

---

#### M11 — DvP + Prime Brokerage Binary Milestones
- **Tier**: 3 + 4 (combined binary)
- **Unit**: Binary (0/1) per sub-indicator
- **Sub-indicators**:
  - `dvp_production`: DvP settlement in production on XRPL (0/1) + evidence link
  - `prime_brokerage_live`: XRP accepted as prime brokerage collateral (0/1) + evidence link
  - `cbdc_integration`: Any CBDC piloted with XRPL bridge (0/1) + evidence link
- **Why it matters**: Each binary flip represents an institutional infrastructure milestone that is difficult to reverse and signals category expansion.
- **Sources**: Ripple press releases, XRPL Foundation, Bloomberg/Reuters citations
- **Update freq**: Manual (event-driven)
- **Confidence**: 95 when flipped (citation required)

---

## 4. GAMIFICATION SYSTEM

### 4.1 Phases

| Phase | Name | Core Prerequisite | Summary |
|-------|------|------------------|---------|
| 1 | Investable Asset | ETF exists + exchange balance declining | XRP recognized as structured financial asset |
| 2 | Cash Layer Forms | RLUSD > $500M + velocity > 0.05 | Native stablecoin achieving real utility |
| 3 | Tokenized Capital Markets | Tokenized AUM > $1B + repeat issuers > 5 | XRPL as issuance and settlement infrastructure |
| 4 | Liquidity Venue | DEX TVL > $200M + depth at 2% > $50M | XRPL functioning as a live market venue |
| 5 | Global Routing | Bridge proxy > $50M/day + ODL evidence | XRP routing real-world payment corridors at scale |

### 4.2 Level Thresholds (3 levels × 5 phases = 15 total)

```
Phase 1 — Investable Asset
  L1 (Emerging):    ETF approved OR holdings > 50M XRP
  L2 (Developing):  ETF holdings > 250M XRP (7d sustained) + exchange balance 30d trend < 0
  L3 (Established): ETF holdings > 500M XRP (30d sustained) + exchange balance down 10%+ over 90d

Phase 2 — Cash Layer Forms
  L1 (Emerging):    RLUSD mcap > $100M
  L2 (Developing):  RLUSD mcap > $500M (7d) + transfer volume > $10M/day
  L3 (Established): RLUSD mcap > $1B (30d) + velocity > 0.05 + ≥5 exchange listings

Phase 3 — Tokenized Capital Markets
  L1 (Emerging):    Tokenized AUM > $100M + ≥1 repeat issuer
  L2 (Developing):  Tokenized AUM > $1B + repeat issuers ≥ 5
  L3 (Established): Tokenized AUM > $5B (30d) + DvP production = 1 + issuers ≥ 10

Phase 4 — Liquidity Venue
  L1 (Emerging):    XRPL DEX vol > $5M/day + AMM TVL > $50M
  L2 (Developing):  DEX vol > $50M/day (30d avg) + depth at 2% > $50M
  L3 (Established): DEX vol > $200M/day (30d avg) + prime_brokerage_live = 1

Phase 5 — Global Routing
  L1 (Emerging):    Bridge proxy > $1M/day (7d avg)
  L2 (Developing):  Bridge proxy > $50M/day (30d avg) OR confirmed ODL corridor data
  L3 (Established): Bridge proxy > $500M/day (30d avg) + CBDC integration = 1
```

### 4.3 XP Scoring Model

**Total XP Range**: 0–10,000

| Tier | Category | Max XP | Weight Rationale |
|------|----------|--------|-----------------|
| T1 | Supply Sinks (ETF + Exchange) | 2,500 | Direct demand/supply mechanic |
| T2 | Cash Layer (RLUSD mcap + volume) | 2,500 | Stablecoin = usage infrastructure |
| T3 | Tokenized Assets (AUM + issuers) | 2,000 | Capital markets thesis core |
| T4 | Liquidity Venue (depth + DEX) | 1,500 | Enabler metric |
| T5 | Bridge/Routing | 1,500 | Confirmation metric |

**Scoring engine pseudocode**:

```python
def calculate_xp(metrics: dict, history: dict) -> float:
    """
    metrics: {metric_id: current_value}
    history: {metric_id: [TimeSeries last 90d]}
    Returns: float XP (0–10000)
    """
    xp = 0.0

    # T1a: ETF Holdings (max 1500 XP)
    etf = metrics.get("etf_xrp_holdings", 0)  # millions XRP
    etf_xp = min(etf / 1000 * 1500, 1500)     # 1000M XRP = full score
    if is_sustained(history["etf_xrp_holdings"], threshold=500, days=30):
        etf_xp = min(etf_xp + 200, 1500)      # sustained bonus
    xp += etf_xp

    # T1b: Exchange Balance Trend (max 1000 XP)
    # Reward declining balances (negative trend = good)
    ex_trend_30d = trend_pct(history["exchange_balances"], days=30)
    ex_xp = max(0, min(-ex_trend_30d / 30 * 1000, 1000))  # -30% = full
    xp += ex_xp

    # T2a: RLUSD Market Cap (max 1500 XP)
    rlusd_mcap = metrics.get("rlusd_market_cap", 0)  # millions USD
    rlusd_xp = min(rlusd_mcap / 10000 * 1500, 1500)  # $10B = full
    if is_sustained(history["rlusd_market_cap"], threshold=1000, days=30):
        rlusd_xp = min(rlusd_xp + 150, 1500)
    xp += rlusd_xp

    # T2b: RLUSD Velocity (max 1000 XP)
    velocity = metrics.get("rlusd_velocity", 0)  # vol/mcap ratio
    vel_xp = min(velocity / 0.2 * 1000, 1000)   # 0.2 velocity = full
    xp += vel_xp

    # T3a: Tokenized AUM (max 1500 XP)
    tok_aum = metrics.get("tokenized_aum", 0)  # millions USD
    tok_xp = min(tok_aum / 10000 * 1500, 1500) # $10B = full
    xp += tok_xp

    # T3b: Repeat Issuers (max 500 XP)
    issuers = metrics.get("repeat_issuers", 0)
    iss_xp = min(issuers / 20 * 500, 500)      # 20 issuers = full
    xp += iss_xp

    # T3c: DvP binary (250 XP)
    if metrics.get("dvp_production") == 1:
        xp += 250

    # T4a: DEX Volume (max 1000 XP)
    dex_vol = metrics.get("dex_volume_24h", 0)  # millions USD/day
    dex_xp = min(dex_vol / 200 * 1000, 1000)   # $200M/day = full
    xp += dex_xp

    # T4b: Order Book Depth at 2% (max 500 XP)
    depth_2pct = metrics.get("orderbook_depth_2pct", 0)  # millions USD
    depth_xp = min(depth_2pct / 100 * 500, 500)
    xp += depth_xp

    # T4c: Prime Brokerage binary (250 XP)
    if metrics.get("prime_brokerage_live") == 1:
        xp += 250

    # T5: Bridge Routing (max 1500 XP)
    bridge = metrics.get("bridge_proxy_volume", 0)  # millions USD/day
    bridge_xp = min(bridge / 500 * 1500, 1500)     # $500M/day = full
    if is_sustained(history["bridge_proxy_volume"], threshold=50, days=30):
        bridge_xp = min(bridge_xp + 200, 1500)
    xp += bridge_xp

    # T5b: CBDC integration binary (250 XP)
    if metrics.get("cbdc_integration") == 1:
        xp += 250

    # Daily XP change cap: prevent spike manipulation
    # xp = min(xp, prev_day_xp * 1.15)  # max 15% daily increase

    return round(xp, 1)


def is_sustained(series: list, threshold: float, days: int) -> bool:
    """True if metric has been >= threshold for `days` consecutive days"""
    if len(series) < days:
        return False
    return all(v >= threshold for v in series[-days:])


def trend_pct(series: list, days: int) -> float:
    """% change over last N days"""
    if len(series) < days or series[-days] == 0:
        return 0.0
    return (series[-1] - series[-days]) / series[-days] * 100
```

### 4.4 Badges

| Badge ID | Name | Trigger | XP Bonus |
|----------|------|---------|----------|
| B01 | First Signal | Any T1 metric crosses L1 threshold | +50 |
| B02 | ETF Adoption Igniting | ETF holdings > 250M XRP (7d) | +100 |
| B03 | Supply Draining | Exchange balance 30d decline > 5% | +100 |
| B04 | Cash Layer Forming | RLUSD mcap > $100M | +150 |
| B05 | Cash Layer Active | RLUSD velocity > 0.05 | +150 |
| B06 | Tokenization Pilot Live | Tokenized AUM > $100M | +200 |
| B07 | Institutional Pattern | Repeat issuers ≥ 3 | +150 |
| B08 | DvP Goes Live | dvp_production flips to 1 | +250 |
| B09 | Deep Market | Depth at 1% > $100M | +200 |
| B10 | Liquidity Venue Online | DEX vol > $50M/day (30d avg) | +200 |
| B11 | Bridge Signals Emerging | Bridge proxy > $1M/day (7d) | +150 |
| B12 | Routing at Scale | Bridge proxy > $500M/day (30d) | +500 |
| B13 | Prime Collateral | prime_brokerage_live = 1 | +250 |
| B14 | CBDC Connected | cbdc_integration = 1 | +300 |
| B15 | Full Thesis | Phase 5 L3 reached | +1000 |

### 4.5 Quests (10 MVP Quests)

```json
[
  {
    "id": "Q01",
    "name": "ETF Billion Club",
    "description": "XRP ETF/ETP holdings exceed 1 billion XRP",
    "metric_id": "etf_xrp_holdings",
    "condition": {"type": "sustained_above", "value": 1000, "unit": "M XRP", "days": 30},
    "xp_reward": 400,
    "why_it_matters": "1 billion XRP in ETFs removes ~1% of total supply from liquid circulation. At current prices this represents $2–3B+ in structural absorption — analogous to Bitcoin ETF impact on BTC supply float.",
    "phase_relevance": 1
  },
  {
    "id": "Q02",
    "name": "Supply Drain Confirmed",
    "description": "Exchange XRP balances decline >15% over 90 days",
    "metric_id": "exchange_balances",
    "condition": {"type": "trend_below", "value": -15, "unit": "%", "window_days": 90},
    "xp_reward": 300,
    "why_it_matters": "Exchange balance decline means XRP is moving to cold storage or productive use. Fewer coins on exchanges reduces sell-side overhang — historically a precondition for sustained price appreciation.",
    "phase_relevance": 1
  },
  {
    "id": "Q03",
    "name": "RLUSD $3B Sustained",
    "description": "RLUSD market cap exceeds $3B for 30 consecutive days",
    "metric_id": "rlusd_market_cap",
    "condition": {"type": "sustained_above", "value": 3000, "unit": "M USD", "days": 30},
    "xp_reward": 500,
    "why_it_matters": "$3B RLUSD would make it a top-10 stablecoin globally. At this scale, RLUSD provides genuine settlement liquidity for institutional XRP-denominated transactions and validates the XRP-stablecoin demand pair thesis.",
    "phase_relevance": 2
  },
  {
    "id": "Q04",
    "name": "RLUSD Velocity Active",
    "description": "RLUSD 30-day average transfer volume/market cap ratio exceeds 0.1",
    "metric_id": "rlusd_velocity",
    "condition": {"type": "sustained_above", "value": 0.1, "unit": "ratio", "days": 30},
    "xp_reward": 300,
    "why_it_matters": "Velocity > 0.1 means each RLUSD turns over at least 10% of its value daily — consistent with active payment/settlement usage rather than speculative holding. It is the difference between a currency and a store of value.",
    "phase_relevance": 2
  },
  {
    "id": "Q05",
    "name": "Tokenized $10B",
    "description": "Tokenized real-world asset AUM on XRPL exceeds $10B",
    "metric_id": "tokenized_aum",
    "condition": {"type": "sustained_above", "value": 10000, "unit": "M USD", "days": 30},
    "xp_reward": 600,
    "why_it_matters": "$10B in tokenized assets settling on XRPL requires proportional XRP liquidity for DvP settlement. At 2% settlement liquidity requirement, that is $200M+ in XRP demand for settlement operations alone — sustained, structural buy pressure.",
    "phase_relevance": 3
  },
  {
    "id": "Q06",
    "name": "DvP Production",
    "description": "Delivery-vs-Payment settlement confirmed in production on XRPL",
    "metric_id": "dvp_production",
    "condition": {"type": "binary_equal", "value": 1},
    "xp_reward": 400,
    "why_it_matters": "DvP in production means institutional securities settlement is using XRPL infrastructure. This is an irreversible infrastructure commitment — once a custodian/broker integrates DvP, they are structurally dependent on XRPL liquidity.",
    "phase_relevance": 3
  },
  {
    "id": "Q07",
    "name": "Deep Order Books",
    "description": "Aggregated XRP/USD depth at 2% exceeds $100M on major venues",
    "metric_id": "orderbook_depth_2pct",
    "condition": {"type": "sustained_above", "value": 100, "unit": "M USD", "days": 7},
    "xp_reward": 300,
    "why_it_matters": "$100M depth at 2% means a $2M XRP trade moves price less than 2 basis points. This is the liquidity floor required for ODL corridors to operate efficiently at scale without prohibitive FX slippage.",
    "phase_relevance": 4
  },
  {
    "id": "Q08",
    "name": "DEX Volume $50M",
    "description": "XRPL DEX 30-day average daily volume exceeds $50M",
    "metric_id": "dex_volume_24h",
    "condition": {"type": "sustained_above", "value": 50, "unit": "M USD/day", "days": 30},
    "xp_reward": 350,
    "why_it_matters": "$50M/day on the XRPL native DEX rivals mid-tier centralized exchange volume. It signals XRPL is evolving from a settlement rail to a genuine trading venue, attracting market makers and tightening spreads for bridge operations.",
    "phase_relevance": 4
  },
  {
    "id": "Q09",
    "name": "Bridge Goes Live",
    "description": "Bridge routing proxy exceeds $50M/day for 30 consecutive days",
    "metric_id": "bridge_proxy_volume",
    "condition": {"type": "sustained_above", "value": 50, "unit": "M USD/day", "days": 30},
    "xp_reward": 500,
    "why_it_matters": "$50M/day in bridge routing would make XRP a measurable global payment rail — a real, verifiable use case generating structural buy-and-sell demand rather than speculative narrative.",
    "phase_relevance": 5
  },
  {
    "id": "Q10",
    "name": "Prime Collateral",
    "description": "XRP accepted as prime brokerage collateral by a regulated institution",
    "metric_id": "prime_brokerage_live",
    "condition": {"type": "binary_equal", "value": 1},
    "xp_reward": 350,
    "why_it_matters": "Prime brokerage collateral acceptance means institutional desks can use XRP holdings productively without selling. It unlocks leveraged XRP demand, reduces sell pressure, and signals regulatory comfort from a compliance-heavy sector.",
    "phase_relevance": 4
  }
]
```

---

## 5. ARCHITECTURE

### 5.1 Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR for SEO, API routes for BFF, excellent DX |
| UI Components | shadcn/ui + Tailwind CSS | Rapid, accessible, minimal bundle |
| Charts | Recharts + TradingView Lightweight Charts | Time series, free, lightweight |
| Backend API | FastAPI (Python 3.12) | Async, fast, clean auto-generated OpenAPI |
| Data ingestion | Python workers (APScheduler + httpx async) | Matches backend, async-native |
| Database | PostgreSQL 16 + TimescaleDB extension | Efficient hypertable time-series queries |
| Cache | Redis (Upstash serverless) | Rate limit guards, response caching, job deduplication |
| Auth | NextAuth.js (email magic link + GitHub OAuth) | Simple, extensible |
| Email | Resend + React Email templates | Modern, reliable, React-native |
| Hosting | Vercel (frontend) + Railway (backend + DB + Redis) | Zero-ops, fast iteration |
| Monitoring | Sentry (errors) + Vercel Analytics | Free tier sufficient for MVP |

### 5.2 System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│            Next.js 14 App (Vercel CDN + Edge)                   │
│  [Progress Map] [Dashboard] [Drilldown] [Quests] [Alerts]      │
└─────────────────────────┬────────────────────────────────────────┘
                          │ HTTPS/REST
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│               FastAPI Backend (Railway)                         │
│   /api/metrics  /api/score  /api/quests  /api/alerts  /thesis   │
│   Auth middleware │ Rate limiting │ Response caching (Redis)    │
└───────┬──────────────────────────────────────────┬──────────────┘
        │ SQL (asyncpg)                            │ Redis pub/sub
        ▼                                          ▼
┌───────────────┐                       ┌──────────────────────┐
│  PostgreSQL   │                       │  Redis (Upstash)     │
│ + TimescaleDB │                       │  Cache + Job state   │
│  (Railway)    │                       └──────────┬───────────┘
└───────────────┘                                  │
                                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│               ETL Workers (Python, APScheduler)                 │
│                                                                  │
│  ┌────────────┐  ┌───────────┐  ┌──────────────┐  ┌─────────┐  │
│  │ XRPL RPC   │  │CoinGlass  │  │ Exchange APIs│  │ Manual  │  │
│  │ Adapter    │  │ Adapter   │  │(Binance etc) │  │ Entry   │  │
│  └────────────┘  └───────────┘  └──────────────┘  └─────────┘  │
└──────────────────────────────────────────────────────────────────┘
                          │ Email
                          ▼
                 ┌─────────────────┐
                 │   Resend API    │
                 │ (Alerts + snaps)│
                 └─────────────────┘
```

### 5.3 Data Model (PostgreSQL + TimescaleDB)

```sql
-- Metric definitions (static, seeded)
CREATE TABLE metrics (
  id               VARCHAR(64) PRIMARY KEY,
  tier             SMALLINT NOT NULL,
  name             TEXT NOT NULL,
  short_name       VARCHAR(64),
  definition       TEXT,
  why_it_matters   TEXT,
  unit             VARCHAR(32),
  is_proxy         BOOLEAN DEFAULT FALSE,
  proxy_note       TEXT,
  update_frequency VARCHAR(16),  -- 'hourly','daily','weekly','manual'
  tags             TEXT[],
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Source definitions per metric
CREATE TABLE metric_sources (
  id           SERIAL PRIMARY KEY,
  metric_id    VARCHAR(64) REFERENCES metrics(id),
  source_name  TEXT NOT NULL,
  source_url   TEXT,
  api_endpoint TEXT,
  reliability  VARCHAR(8),  -- 'high','medium','low'
  notes        TEXT
);

-- Time-series values (TimescaleDB hypertable)
CREATE TABLE metric_values (
  time        TIMESTAMPTZ NOT NULL,
  metric_id   VARCHAR(64) NOT NULL REFERENCES metrics(id),
  raw_value   DOUBLE PRECISION,
  value       DOUBLE PRECISION,  -- transformed/normalized
  confidence  SMALLINT,          -- 0-100
  source_id   INTEGER REFERENCES metric_sources(id),
  notes       TEXT
);
SELECT create_hypertable('metric_values', 'time');
CREATE INDEX ON metric_values (metric_id, time DESC);

-- Daily computed scores
CREATE TABLE score_snapshots (
  id          SERIAL PRIMARY KEY,
  date        DATE NOT NULL UNIQUE,
  total_xp    DOUBLE PRECISION,
  phase       SMALLINT,
  level       SMALLINT,
  tier_scores JSONB,  -- {t1: 980, t2: 620, t3: 450, t4: 597, t5: 200}
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Binary milestone events
CREATE TABLE milestones (
  id            SERIAL PRIMARY KEY,
  metric_id     VARCHAR(64) REFERENCES metrics(id),
  name          TEXT NOT NULL,
  description   TEXT,
  triggered_at  TIMESTAMPTZ,
  evidence_url  TEXT,
  is_triggered  BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Quest definitions
CREATE TABLE quests (
  id              VARCHAR(8) PRIMARY KEY,
  name            TEXT NOT NULL,
  description     TEXT,
  metric_id       VARCHAR(64) REFERENCES metrics(id),
  condition_json  JSONB NOT NULL,  -- {type, value, unit, days}
  xp_reward       INTEGER,
  badge_reward    VARCHAR(8),
  why_it_matters  TEXT,
  phase_relevance SMALLINT,
  status          VARCHAR(16) DEFAULT 'locked'
);

CREATE TABLE quest_progress (
  quest_id       VARCHAR(8) REFERENCES quests(id),
  date           DATE NOT NULL,
  current_value  DOUBLE PRECISION,
  days_sustained INTEGER DEFAULT 0,
  pct_complete   DOUBLE PRECISION,
  PRIMARY KEY (quest_id, date)
);

-- Badges
CREATE TABLE badges (
  id                  VARCHAR(8) PRIMARY KEY,
  name                TEXT NOT NULL,
  description         TEXT,
  icon                TEXT,
  trigger_description TEXT,
  xp_reward           INTEGER
);

CREATE TABLE badge_unlocks (
  badge_id    VARCHAR(8) REFERENCES badges(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (badge_id)
);

-- Users (auth required for alerts/watchlist)
CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  name       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Alerts
CREATE TABLE alerts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id),
  metric_id        VARCHAR(64) REFERENCES metrics(id),
  condition_type   VARCHAR(16),  -- 'above','below','trend_change'
  threshold_value  DOUBLE PRECISION,
  threshold_unit   VARCHAR(32),
  is_active        BOOLEAN DEFAULT TRUE,
  last_triggered   TIMESTAMPTZ,
  email_enabled    BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE alert_events (
  id           SERIAL PRIMARY KEY,
  alert_id     UUID REFERENCES alerts(id),
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  metric_value DOUBLE PRECISION,
  email_sent   BOOLEAN DEFAULT FALSE
);

-- Weekly snapshots
CREATE TABLE weekly_snapshots (
  id              SERIAL PRIMARY KEY,
  week_start      DATE NOT NULL UNIQUE,
  xp_start        DOUBLE PRECISION,
  xp_end          DOUBLE PRECISION,
  xp_delta        DOUBLE PRECISION,
  phase_start     SMALLINT,
  phase_end       SMALLINT,
  changed_metrics JSONB,   -- [{metric_id, old_val, new_val, pct_change}]
  new_badges      TEXT[],
  quest_progress  JSONB,
  summary_text    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.4 API Contract

```
BASE URL: https://api.xrptracker.app/v1
AUTH: Bearer JWT (NextAuth) for protected routes

────────────────────────────────────────────────────────────────

GET /metrics
→ 200: MetricSummary[]
[{
  "id": "rlusd_market_cap",
  "tier": 2,
  "name": "RLUSD Market Cap",
  "unit": "M USD",
  "current_value": 412.5,
  "prev_value_24h": 408.1,
  "trend_30d_pct": 12.4,
  "confidence": 88,
  "last_updated": "2026-02-24T01:00:00Z",
  "is_proxy": false,
  "sparkline": [380, 390, 395, 408, 412]
}]

GET /metrics/:id
→ 200: MetricDetail
{
  "id": "rlusd_market_cap",
  "definition": "...",
  "why_it_matters": "...",
  "sources": [{"name": "CoinGecko", "url": "...", "reliability": "high"}],
  "thresholds": [{"label": "Phase 2 L1", "value": 500, "direction": "above"}],
  "confidence_factors": ["multi_source", "on_chain_verifiable"],
  "current_value": 412.5,
  "confidence": 88
}

GET /metrics/:id/series?from=2025-01-01&to=2026-02-24&interval=1d
→ 200: TimeSeriesResponse
{
  "metric_id": "rlusd_market_cap",
  "interval": "1d",
  "data": [
    {"time": "2025-01-01T00:00:00Z", "value": 45.2, "confidence": 85},
    ...
  ]
}

GET /score
→ 200: ScoreResponse
{
  "total_xp": 2847.5,
  "max_xp": 10000,
  "phase": 2,
  "level": 1,
  "level_name": "Cash Layer Forms — Emerging",
  "tier_scores": {
    "t1": {"xp": 980, "max": 2500, "trend": "up"},
    "t2": {"xp": 620, "max": 2500, "trend": "up"},
    "t3": {"xp": 450, "max": 2000, "trend": "flat"},
    "t4": {"xp": 597, "max": 1500, "trend": "up"},
    "t5": {"xp": 200, "max": 1500, "trend": "flat"}
  },
  "badges_earned": ["B01", "B02", "B04"],
  "xp_to_next_level": 153,
  "computed_at": "2026-02-24T00:05:00Z"
}

GET /quests
→ 200: Quest[]
[{
  "id": "Q03",
  "name": "RLUSD $3B Sustained",
  "status": "active",
  "current_value": 412.5,
  "target_value": 3000,
  "pct_complete": 13.75,
  "days_sustained": 0,
  "days_required": 30,
  "xp_reward": 500,
  "why_it_matters": "..."
}]

GET /thesis
→ 200: ThesisHealth
{
  "overall": "strengthening",
  "tiers": [
    {
      "tier": 1, "name": "Supply Sinks",
      "status": "green",
      "signal": "Exchange balances declining 8% over 30d; ETF holdings growing",
      "confidence": 82
    }
  ],
  "bull_signals": ["RLUSD mcap up 12% MTD", "ETF inflows positive 14d streak"],
  "bear_signals": ["Bridge proxy volume flat 60d"],
  "updated_at": "2026-02-24T00:05:00Z"
}

GET /snapshots?limit=12
→ 200: WeeklySnapshot[]

GET /milestones
→ 200: Milestone[]

POST /alerts  [AUTH REQUIRED]
Body: {
  "metric_id": "rlusd_market_cap",
  "condition_type": "above",
  "threshold_value": 1000,
  "threshold_unit": "M USD",
  "email_enabled": true
}
→ 201: Alert

GET  /alerts  [AUTH REQUIRED] → 200: Alert[]
DELETE /alerts/:id  [AUTH REQUIRED] → 204

GET /badges → 200: {all: Badge[], earned: string[]}
```

---

## 6. ETL / INGESTION PLAN

### 6.1 Source Adapters

```python
class BaseAdapter:
    source_id: str
    metric_ids: list[str]
    rate_limit: dict  # {calls_per_minute: int, calls_per_day: int}

    async def fetch(self) -> list[MetricValue]:
        raise NotImplementedError

    async def run_with_retry(self, max_retries=3) -> list[MetricValue]:
        for attempt in range(max_retries):
            try:
                return await self.fetch()
            except RateLimitError:
                await asyncio.sleep(60 * (attempt + 1))
            except DataUnavailableError as e:
                log.warning(f"{self.source_id}: data unavailable — {e}")
                return []  # graceful empty; no crash, no stale overwrite
            except Exception as e:
                log.error(f"{self.source_id}: attempt {attempt+1} failed — {e}")
                if attempt == max_retries - 1:
                    alert_ops(f"Adapter {self.source_id} failed {max_retries}x")
        return []
```

**Adapter registry**:

```
1. XRPLRPCAdapter
   Metrics: M02, M03, M05, M10
   Endpoint: wss://xrplcluster.com / https://s1.ripple.com:51234
   Schedule: Hourly (M02, M09); daily (M03, M10)
   Auth: None (public)
   Key calls: account_info, amm_info, account_tx, server_info

2. CoinGlassAdapter
   Metrics: M01 (ETF holdings)
   Endpoint: https://open-api.coinglass.com/public/v2/
   Schedule: Daily 09:00 UTC
   Auth: COINGLASS_API_KEY (env)
   Rate limit: 30 req/min

3. CoinGeckoAdapter
   Metrics: M04 (RLUSD mcap), M08 (DEX volume proxy)
   Endpoint: https://api.coingecko.com/api/v3
   Schedule: Hourly
   Auth: COINGECKO_API_KEY (Pro tier; free fallback)
   Rate limit: 50 req/min pro / 15 req/min free

4. ExchangeOrderBookAdapter
   Metrics: M09 (order book depth)
   Exchanges: Binance, Coinbase, Kraken, Bitstamp
   Schedule: Hourly (staggered: t+0, t+15, t+30, t+45 min)
   Normalization: Compute depth at 1/2/5% from mid; aggregate bids+asks

5. XRPScanAdapter
   Metrics: M02 (supplement), M08 (DEX volume)
   Endpoint: https://api.xrpscan.com/api/v1/
   Schedule: Daily
   Auth: None (public)

6. ManualMilestoneAdapter
   Metrics: M06, M07, M11 (binary flags)
   Input: Admin API — POST /admin/milestone with citation_url (required)
   Validation: Requires citation_url; logs submitter + timestamp
   Schedule: Event-driven
```

### 6.2 Normalization + Confidence

```python
async def normalize_and_store(raw: RawMetricValue, metric: Metric):
    # 1. Unit conversion
    value = convert_units(raw.value, raw.unit, metric.unit)

    # 2. Outlier detection (reject > 5 sigma from 30d rolling mean)
    mean, std = await get_rolling_stats(metric.id, days=30)
    if std > 0 and abs(value - mean) > 5 * std:
        log.warning(f"Outlier rejected: {metric.id} = {value} (mean={mean})")
        value = None  # Store as null; never silently interpolate

    # 3. Confidence scoring
    confidence = compute_confidence(
        source_reliability=raw.source.reliability,
        data_age_minutes=minutes_since(raw.fetched_at),
        is_proxy=metric.is_proxy,
        has_multiple_sources=len(metric.sources) > 1,
        outlier_flag=(value is None)
    )

    # 4. Idempotent upsert (bucketed to hour)
    await db.upsert_metric_value(
        metric_id=metric.id,
        time=floor_to_hour(raw.timestamp),
        value=value,
        raw_value=raw.value,
        confidence=confidence,
        source_id=raw.source.id
    )


def compute_confidence(source_reliability, data_age_minutes,
                       is_proxy, has_multiple_sources, outlier_flag) -> int:
    base = {"high": 85, "medium": 65, "low": 45}[source_reliability]
    if is_proxy:                        base -= 25
    if data_age_minutes > 1440:         base -= 15  # > 24h stale
    elif data_age_minutes > 120:        base -= 5
    if not has_multiple_sources:        base -= 5
    if outlier_flag:                    base -= 30
    if has_multiple_sources:            base += 5
    return max(0, min(100, base))
```

**Confidence rubric published at `/methodology`**:

| Scenario | Score range |
|----------|-------------|
| Direct on-chain, multi-source, fresh | 85–95 |
| Regulated disclosure, 1d lag | 80–90 |
| Single reliable API, < 2h old | 70–80 |
| Self-reported AUM, weekly lag | 55–70 |
| Proxy metric (derived calculation) | 25–50 |
| Stale data (> 24h) | −15 penalty |
| Outlier detected / null value | −30 penalty |

### 6.3 Cron Schedule

```
*/60 * * * *   exchange_orderbook_adapter      # Hourly
0  * * * *     xrpl_rpc_adapter (balances)    # Hourly
5  0 * * *     coinglass_adapter               # Daily 00:05 UTC
10 0 * * *     coingecko_adapter               # Daily 00:10 UTC
15 0 * * *     xrpscan_adapter                 # Daily 00:15 UTC
20 0 * * *     scoring_engine_worker           # Daily 00:20 UTC
25 0 * * *     alert_checker_worker            # Daily 00:25 UTC
30 0 * * *     quest_progress_updater          # Daily 00:30 UTC
0  8 * * 1     weekly_snapshot_generator       # Weekly Mon 08:00 UTC
```

---

## 7. MVP BUILD PLAN

### Week 1 — Foundation

**Days 1–2: Repo + Infrastructure**
- Init monorepo: `apps/web` (Next.js 14), `apps/api` (FastAPI), `packages/shared` (TS types + Python models)
- Provision Railway: PostgreSQL 16 + TimescaleDB extension, Redis
- Run DB migrations; seed `metrics`, `quests`, `badges` tables
- Configure env vars, Vercel project, Railway services, Sentry DSN

**Days 3–4: Data Layer + Core Adapters**
- Implement `BaseAdapter`, retry logic, normalization pipeline
- Implement `XRPLRPCAdapter` (M02 exchange balances + M05 RLUSD volume)
- Implement `CoinGeckoAdapter` (M04 RLUSD mcap)
- Unit tests: scoring engine, `is_sustained()`, `trend_pct()`, `compute_confidence()`
- Manual seed: M11 binary flags, M06/M07 initial values

**Day 5: Scoring Engine**
- Implement `calculate_xp()` in Python
- Daily cron: scoring engine → writes `score_snapshots`
- Quest progress calculator → updates `quest_progress`

### Week 2 — API + Core UI

**Days 6–7: FastAPI Endpoints**
- `GET /metrics`, `GET /metrics/:id`, `GET /metrics/:id/series`
- `GET /score`, `GET /quests`, `GET /thesis`
- Auth middleware (NextAuth JWT validation)
- Redis caching: 5min TTL for `/score`, 1h TTL for metric series

**Days 8–9: Frontend — Dashboard + Progress Map**
- Next.js App Router setup, shadcn/ui + Tailwind install
- Home page: Phase hero, animated XP bar, level display, top 3 quests
- Dashboard: metric cards grid (Recharts sparklines), confidence badges, tier filter
- Mobile-first responsive layout

**Day 10: Metric Drilldown**
- `/metric/[id]` page: full time series chart, threshold lines, sources table
- "Why it matters" expandable section
- Confidence breakdown tooltip
- Proxy metric warning banner (prominent, red border when `is_proxy=true`)

### Week 3 — Gamification + Alerts

**Days 11–12: Gamification UI**
- Quests page: quest cards with progress bars, XP rewards, why-it-matters
- Badges page: earned vs locked badges, CSS unlock animation
- Thesis Health panel: tier-by-tier status, bull/bear signal lists

**Days 13–14: Alerts System**
- Auth flow (NextAuth — email magic link for MVP)
- `POST/GET/DELETE /alerts` API endpoints
- Alert checker cron: runs after daily ingestion
- Resend integration: alert email + weekly snapshot templates (React Email)

**Day 15: Remaining Adapters**
- `CoinGlassAdapter` (M01 ETF)
- `ExchangeOrderBookAdapter` (M09 depth — all 4 exchanges)
- `XRPScanAdapter` (M08 DEX volume)
- Integration tests for all adapters (mocked HTTP via `respx`)

### Week 4 — Polish + Launch

**Days 16–17: Timeline + Snapshots**
- Weekly snapshot generator (cron)
- `/timeline` page: snapshot feed, "what changed" diffs
- Milestone event log (manual entry + auto-detected badge unlocks)

**Days 18–19: Testing + Hardening**
- Playwright smoke tests: home, dashboard, drilldown, quests
- Empty state + error boundary pages (graceful "no data" display)
- All proxy metrics prominently labeled throughout app
- Confidence < 50 warning states + staleness banners
- Non-financial-advice disclaimer banner (persistent)

**Day 20: Launch**
- Final Vercel + Railway deploy with production env vars
- Backfill 90 days of historical data via adapter batch scripts
- Smoke test all 11 metrics, scoring engine, 3 alert trigger rules
- Confirm weekly snapshot email fires on schedule

---

## 8. RISKS & MITIGATIONS

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| API sources change or break | High | High | Adapter abstraction + ops alert on failure; show stale + staleness flag; never fail silently |
| RLUSD data unavailable | Medium | Medium | Multi-source (CoinGecko + on-chain RPC); if all fail: show stale, low confidence, no scoring update |
| ETF data unavailable (no spot ETF exists yet) | High | Medium | Metric shows "Pending" state; XP for M01 = 0 until activated; no phantom scoring |
| Bridge proxy metric misleads users | High | High | Bold "PROXY — HIGH UNCERTAINTY" label; confidence capped at 50; no major quest tied solely to proxy |
| Outlier data causes false XP jumps | Medium | Medium | 5-sigma rejection; XP updates on sustained windows only; daily XP increase capped at 15% over previous day |
| Users interpret XP as financial signal | High | Medium | Persistent "market structure tracking — not financial advice" banner; no price targets anywhere |
| Confidence scores feel arbitrary | Medium | Medium | Full confidence rubric documented at `/methodology`; show exact contributing factors per metric |
| Manual milestone entry is delayed/biased | Medium | High | Citation URL required; submitter + timestamp logged; GitHub issues link for community flagging |
| Exchange wallet labeling incomplete | Medium | High | Show coverage estimate ("~80% of known exchange volume"); confidence deducted for label risk |
| Tokenized AUM figures show false precision | High | Medium | Show AUM as range ("$100M–$500M estimated") when self-reported; never show 2+ decimal precision on estimates |
| TimescaleDB query performance degrades | Low | Low | Partition by month; index on (metric_id, time DESC); Redis cache for hot aggregated queries |

---

## 9. INVESTOR VIEW — PANEL COPY

---

### The Bull Case Prerequisites

*What structural evidence would need to exist for XRP to function as a global settlement asset at scale?*

Not price prediction. Not hype. Just the preconditions — tracked, scored, and updated daily.

---

**The thesis in plain English:**

XRP's bull case is not about speculation — it is about infrastructure adoption. For XRP to capture meaningful value, five things need to happen in sequence:

**1. It becomes a legitimate investable asset.** Regulated ETFs absorb supply, exchange balances drain, and professional capital enters with long time horizons. This is the entry condition — without it, institutional capital cannot participate at scale.

**2. A native stablecoin (RLUSD) forms a cash layer.** You cannot settle dollar-denominated transactions without a dollar-denominated instrument. RLUSD is the on/off ramp that makes the XRP bridge plausible. A $3B+ RLUSD is not a nice-to-have — it is a technical prerequisite.

**3. Real assets get issued and settled on XRPL.** Funds, bonds, and treasuries tokenized on-chain create structural, recurring demand for settlement liquidity. $10B in tokenized assets does not sit still — it settles, pays dividends, and rebalances — all requiring XRP liquidity at each step.

**4. The XRPL becomes a real liquidity venue.** Deep order books and meaningful DEX volume mean large settlements do not move price. This is the precondition for institutional-scale bridge operations. Without it, slippage costs make the economics unworkable.

**5. XRP routes actual value.** The final confirmation: payment corridors using XRP as a bridge currency, generating observable on-chain flow. This is the demand mechanism — each routed payment is a structural buy-and-sell cycle absorbed by market makers.

---

**This app tracks exactly that.** Not sentiment. Not social mentions. The structural plumbing — as it gets built, piece by piece.

Each metric is a brick. The XP score is the building.

*Confidence scores tell you how much to trust each brick. Quests tell you what needs to happen next. Badges mark what has already happened — irreversibly.*

---

## APPENDIX: V2 / V3 ROADMAP

### V2 (months 2–3)
- Multi-user support with personal XP history and watchlists
- Web push notifications (service worker)
- Automated tokenized issuer detection via on-chain trust line clustering
- ODL corridor data if Ripple publishes it; otherwise RippleNet ODL proxy via corridors
- On-chain RLUSD active address tracking
- Social share cards: "Phase 3 unlocked — share your milestone"
- CoinMarketCap and Messari integrations for additional data redundancy

### V3 (months 4–6)
- Community curator model: flagging + verifying milestones with DAO-lite voting
- Comparative tracker: XRP vs. other settlement-layer L1s (Stellar, Solana, Ethereum L2s)
- Predictive threshold alerts: "At current trajectory, RLUSD will cross $1B in ~47 days"
- PDF snapshot reports (weekly/monthly) for institutional sharing
- Public API for third-party dashboards
- Mobile app (React Native, shared component logic)
