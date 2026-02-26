# XRP Tracker — Apple Liquid + Retro-Futuristic Analog Reskin Specification

**Version:** 1.0  
**Status:** Build-Ready  
**Scope:** Pure visual/interaction layer. Zero changes to business logic, routes, data, or UX flows.

---

## 1. Global Design System

### 1.1 Surface Model

Five distinct depth levels. Each level uses glass transparency stacked on a near-void base rather than incrementing solid lightness values.

| Token | CSS Value | Usage |
|---|---|---|
| `--void` | `oklch(0.04 0.006 264)` | App root background — the environmental black |
| `--bg-1` | `oklch(1 0 0 / 0.03) + blur(32px)` | Sidebar, primary layout shell |
| `--bg-2` | `oklch(1 0 0 / 0.055) + blur(24px)` | Cards, panels, main content containers |
| `--bg-3` | `oklch(1 0 0 / 0.09) + blur(16px)` | Elevated states, active cards, hover targets |
| `--bg-4` | `oklch(1 0 0 / 0.14) + blur(12px)` | Tooltips, floating overlays, modals |

All glass surfaces require `backdrop-filter: blur(Npx) saturate(150%)`. The `--void` base must be dark enough that glass reads as frosted, not transparent.

**Solid fallback** (no backdrop-filter support):
Replace each glass level with its equivalent solid: `oklch(0.10 / 0.14 / 0.18 / 0.22 / 0.27 0.008 264)`.

### 1.2 Depth Scale — Shadow System

Depth is communicated through shadow, not border thickness. Borders serve only as edge-lighting highlights.

```css
--shadow-1: 0 2px 8px oklch(0 0 0 / 0.50);
--shadow-2: 0 8px 24px oklch(0 0 0 / 0.55),
            inset 0 1px 0 oklch(1 0 0 / 0.08);
--shadow-3: 0 16px 40px oklch(0 0 0 / 0.60),
            inset 0 1px 0 oklch(1 0 0 / 0.10);
--shadow-4: 0 24px 64px oklch(0 0 0 / 0.70),
            inset 0 1px 0 oklch(1 0 0 / 0.14);
--shadow-inset: inset 0 2px 8px oklch(0 0 0 / 0.45);
```

The `inset 0 1px 0` component is the **top edge highlight** — it simulates light hitting the top of a physical panel and is mandatory on all floating surfaces.

### 1.3 Border System

No solid-color borders. All borders are alpha-white (adapt to any underlying surface).

```css
--border:        oklch(1 0 0 / 0.07);   /* resting state */
--border-mid:    oklch(1 0 0 / 0.11);   /* hover */
--border-active: oklch(1 0 0 / 0.18);   /* active / focused */
--border-glow-green:  oklch(0.72 0.19 145 / 0.35);
--border-glow-blue:   oklch(0.68 0.17 215 / 0.35);
--border-glow-violet: oklch(0.65 0.22 278 / 0.35);
--border-glow-amber:  oklch(0.78 0.17 70  / 0.35);
--border-glow-red:    oklch(0.65 0.22 25  / 0.35);
```

### 1.4 Color Logic

Color communicates data state only. Never used for decoration.

| Token | Value | Semantic |
|---|---|---|
| `--positive` | `oklch(0.72 0.19 145)` | Growth, strengthening, met threshold |
| `--neutral` | `oklch(0.78 0.17 70)` | Mixed, transitional, approaching threshold |
| `--negative` | `oklch(0.65 0.22 25)` | Contraction, weakening, unmet |
| `--live` | `oklch(0.68 0.17 215)` | Active, live, current selection |
| `--macro` | `oklch(0.65 0.22 278)` | XP, institutional signals, long-timeframe |

Each color has four derived values:
```css
--{name}:        {base};
--{name}-dim:    {base} / 0.60;
--{name}-tint:   {base} / 0.10;
--{name}-border: {base} / 0.28;
--{name}-glow:   {base} / 0.20;   /* for box-shadow glow effects */
```

**Glow usage rule**: Apply `box-shadow: 0 0 0 1px var(--{name}-border), 0 0 20px var(--{name}-glow)` only to:
- Active/selected states
- Milestone completion moments
- Threshold crossing indicators
Never apply glow as a resting state.

### 1.5 Typography Hierarchy

Add DM Mono (Google Fonts) for all numeric data. Keep Inter for all text.

```html
<!-- index.html additions -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
```

```css
--font-data: 'DM Mono', 'SF Mono', 'Fira Code', monospace;
```

**Scale:**

| Role | Size | Weight | Font | Letter-spacing | Usage |
|---|---|---|---|---|---|
| Hero | 56px | 700 | DM Mono | -0.03em | Primary metric value on drilldown |
| Title | 28px | 700 | Inter | -0.02em | Page titles, card hero numbers |
| Metric | 40px | 700 | DM Mono | -0.03em | Dashboard card values |
| Label | 13px | 500 | Inter | 0 | Navigation, card names |
| Caption | 11px | 500 | Inter | 0.06em | System labels (UPPERCASE) |
| Nano | 10px | 500 | Inter | 0.08em | Micro-labels (UPPERCASE) |

All numeric values: `font-variant-numeric: tabular-nums` AND `font-family: var(--font-data)`.

### 1.6 Spacing Scale

8px base grid. No values outside this grid.

```css
--space-1:  4px;
--space-2:  8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
```

Panel padding: 24px standard, 20px compact.  
Section gap: 24px between groups, 12px between related items.

### 1.7 Retro-Analog Surface Texture

**Micro-grid overlay** — applied to instrument containers only (not glass panels):
```css
background-image:
  linear-gradient(oklch(1 0 0 / 0.025) 1px, transparent 1px),
  linear-gradient(90deg, oklch(1 0 0 / 0.025) 1px, transparent 1px);
background-size: 24px 24px;
```

**Scanning-line divider** — replaces `<hr>` and section separators:
```css
/* A single 1px line with fade in and fade out on both ends */
height: 1px;
background: linear-gradient(
  90deg,
  transparent,
  oklch(1 0 0 / 0.08) 20%,
  oklch(1 0 0 / 0.08) 80%,
  transparent
);
```

**Inset data well** — for metric value containers:
```css
background: oklch(0 0 0 / 0.25);
box-shadow: inset 0 2px 8px oklch(0 0 0 / 0.45),
            inset 0 1px 0 oklch(0 0 0 / 0.15);
border-radius: 8px;
padding: 12px 16px;
```

---

## 2. Screen-by-Screen Reskin Plan

### 2.1 Home (Progress Map)

**Current problems:**
- Phase hero banner feels flat — no depth differentiation
- XP ring SVG is functional but lacks material quality
- Tier breakdown cards are indistinguishable from dashboard cards
- Active quests section loses visual hierarchy at bottom

**New spatial layout:**

```
┌──────────────────────────────────────────────┐
│  [VOID BACKGROUND — full page]               │
│  ┌────────────────────────────────────────┐  │
│  │  PHASE COMMAND PANEL  [depth-3 glass]  │  │
│  │  ┌─────────┐  Phase title + desc       │  │
│  │  │ XP RING │  Progress + next unlock   │  │
│  │  │  (SVG)  │  P{n} · L{n} badge        │  │
│  │  └─────────┘                           │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  TIER STATUS ROW  [5 instrument tiles]       │
│  [depth-2 glass each, horizontal scroll]     │
│                                              │
│  PHASE MAP  [depth-2 glass panel]           │
│  5 phases with completion arcs, connectors   │
│                                              │
│  ACTIVE QUESTS  [depth-2 glass, 2-col grid]  │
│                                              │
│  XP HISTORY  [depth-2 glass, full width]     │
└──────────────────────────────────────────────┘
```

**Component transformations:**
- Phase banner → `depth-3` glass with radial gradient background and subtle edge glow matching current phase color
- XP ring → Retains SVG arc but gains: `filter: drop-shadow(0 0 6px var(--macro-glow))` on the fill arc; center value uses DM Mono 28px
- Tier tiles → `depth-2` glass; status dot replaced with 2px left-rail colored bar + subtle background tint
- Phase map → nodes become radial arc gauges (mini, 32px diameter); connector lines become scanning-line style

**Motion:**
- On route enter: `fade-up` staggered, 60ms delay between each section
- Tier tiles: hover → `translateY(-3px)` + `shadow-3` promotion, 200ms silk

---

### 2.2 Dashboard

**Current problems:**
- Tier filter buttons read as typical pills — no weight or tactility
- 3-col grid has uniform visual weight — no hierarchy
- MetricCards don't feel spatially separated

**New spatial layout:**

```
┌──────────────────────────────────────────────┐
│  Page header [no background — floats]        │
│                                              │
│  TIER FILTER BAR  [depth-1 glass strip]      │
│  Instrument-dial style buttons               │
│                                              │
│  METRIC GRID  [3-col, depth-2 glass cards]  │
│  Cards have depth-3 hover promotion          │
└──────────────────────────────────────────────┘
```

**Component transformations:**
- Tier filter → Glass pill container (depth-1) holding buttons; active button gets `depth-3` promotion + color border glow; inactive buttons are recessed (depth-0)
- MetricCard → See Component Mapping §3.2

**Motion:**
- Filter change: cards cross-fade and reflow at 300ms silk
- Grid entry: stagger 40ms per card, fade-up

---

### 2.3 MetricDrilldown

**Current problems:**
- 4-stat row uses identical visual weight for all stats
- Chart is functional but reads like a generic recharts output
- Threshold section loses visual connection to chart

**New spatial layout:**

```
┌──────────────────────────────────────────────┐
│  Back link [floats, no container]            │
│                                              │
│  HEADER [tier dot + name — no bg container]  │
│                                              │
│  INSTRUMENT ROW  [4 data wells, depth-2]     │
│  Current value gets 2x width, hero treatment │
│                                              │
│  CHART STATION  [depth-2 glass, full width]  │
│  Tick-mark scale left, threshold annotations │
│                                              │
│  MILESTONE PANEL  [depth-2, inset wells]     │
│                                              │
│  2-COL INFO  [Definition | Why It Matters]   │
│                                              │
│  THRESHOLD TABLE  [instrument grid style]    │
│                                              │
│  2-COL FOOTER  [Sources | Confidence]        │
└──────────────────────────────────────────────┘
```

**Component transformations:**
- Stats row: `current_value` cell gets `col-span-2` + inset data-well treatment + DM Mono 56px hero
- Chart: Grid lines become scanlines; axis tick text changes to DM Mono; threshold ReferenceLine labels get instrument-style pill annotation
- Milestone sub-indicators: `status === 1` gets `border-glow-green` + soft green fill illumination; pending gets deep-inset shadow

---

### 2.4 Quests

**Current problems:**
- Phase section headers read generically
- QuestCards lack hierarchy distinction between active/locked/complete

**New spatial layout:**

```
┌──────────────────────────────────────────────┐
│  Header [floats]                             │
│                                              │
│  STAT ROW  [4 instrument tiles, depth-2]    │
│                                              │
│  XP PROGRESS BAR  [depth-2 glass]           │
│  Horizontal precision scale with tick marks  │
│                                              │
│  PHASE GROUPS  [depth-1 glass header rail]   │
│    └── QuestCards [depth-2 each]             │
└──────────────────────────────────────────────┘
```

**Component transformations:**
- Stat tiles: number in DM Mono; inset data-well; no background — just shadow
- XP bar: Add tick marks at 0%, 25%, 50%, 75%, 100% using pseudo-elements or divs
- Phase headers: scanning-line divider replaces solid border; phase badge gets left-aligned with instrument-style `P{n}` label in DM Mono

---

### 2.5 Thesis Health

**Current problems:**
- Overall status banner uses same glass as cards below it — loses priority
- Bull/bear two-col layout is functional but feels editorial, not analytical

**New spatial layout:**

```
┌──────────────────────────────────────────────┐
│  Header [floats]                             │
│                                              │
│  MISSION STATUS PANEL  [depth-3 glass]      │
│  Larger, with illumination matching status   │
│  Bullcount arc gauge (SVG, 48px)            │
│                                              │
│  TIER PANELS  [depth-2 glass, full width]   │
│  Signal-readout style left-rail indicators  │
│                                              │
│  SIGNAL GRID  [2-col, depth-2]              │
│  Bull left / Bear right, scanning divider   │
│                                              │
│  PREREQUISITES  [depth-2, numbered list]    │
└──────────────────────────────────────────────┘
```

**Component transformations:**
- Overall status: add SVG arc showing `bullCount / 5` with color matching `overall`; panel gets `box-shadow: 0 0 48px {overallColor}-glow`
- ThesisTier: See Component Mapping §3.5

---

### 2.6 Timeline

**Current problems:**
- Vertical line is too prominent and decorative
- Cards feel identical to dashboard cards — no temporal quality

**New spatial layout:**

```
┌──────────────────────────────────────────────┐
│  Header [floats]                             │
│                                              │
│  TIMELINE RAIL  [absolute positioned]        │
│    Scanning-line style: fades at top/bottom  │
│                                              │
│  SNAPSHOT CARDS  [depth-2 glass]            │
│    Milestone nodes: illuminated with --macro │
│    Standard nodes: dim, recessed style       │
│    XP mini-bar: precision scale with ticks   │
└──────────────────────────────────────────────┘
```

**Component transformations:**
- Timeline connector: change from solid 1px to scanning-line gradient; width 1px; left inset-shadow for depth
- Milestone dot: when `isMilestone`, add `box-shadow: 0 0 0 3px var(--macro), 0 0 12px var(--macro-glow)`
- XP range bar: add 10 tick marks; endpoints in DM Mono

---

### 2.7 Alerts

**Current problems:**
- Page is mostly placeholder content — visual design should reflect "coming soon" state intentionally
- Alert builder preview looks like a disabled form

**New spatial layout:**

```
┌──────────────────────────────────────────────┐
│  Header [floats]                             │
│                                              │
│  NOTICE PANEL  [depth-3 glass, --live tint]  │
│  Bell icon with soft blue glow               │
│                                              │
│  BUILDER PREVIEW  [depth-2, opacity 0.45]   │
│  Instrument-style inputs (inset data wells)  │
│  Labelled as PROTOTYPE in nano uppercase     │
│                                              │
│  PRESET LIST  [depth-2, compact rows]        │
│  Dot indicators with color matching tier     │
└──────────────────────────────────────────────┘
```

---

## 3. Component Mapping

### 3.1 Sidebar

| Attribute | Current | New |
|---|---|---|
| Surface | `var(--bg-subtle)` solid | `depth-1` glass with `backdrop-filter: blur(32px)` |
| Border | `1px solid var(--border)` | Right: `1px solid oklch(1 0 0 / 0.06)` |
| Logo badge | Solid `--accent` square | Glass depth-3 square with `box-shadow: 0 0 16px var(--live-glow)` |
| Nav item inactive | Transparent bg | Same; icon and label in `--text-4` |
| Nav item active | `accent-tint` bg | Depth-2 glass + `border-left: 2px solid var(--live)` + color glow on icon |
| Nav item hover | — | `translateX(2px)` + depth-2, 200ms silk |
| Footer XP | Horizontal 3px bar | Radial SVG arc (72px) centered; below arc: `{xp} XP` in DM Mono 14px |
| Footer texture | None | Micro-grid overlay on footer section |

**Radial XP arc (sidebar footer) spec:**
```
SVG size: 72 × 72px
Arc center: 36, 36  radius: 28
Track: strokeWidth 3, color oklch(1 0 0 / 0.08), full 270° arc (-135° to 135°)
Fill: strokeWidth 3, gradient macro→macro-bright, 270° × (xp/max_xp)
Stroke-linecap: round
Glow: filter drop-shadow(0 0 4px var(--macro))
Center text: {pct.toFixed(0)}% in DM Mono 11px, --text-2
```

---

### 3.2 MetricCard

| Attribute | Current | New |
|---|---|---|
| Surface | Solid `--bg-surface` | Depth-2 glass |
| Shadow | None | `--shadow-2` |
| Hover border | `--border-mid` | Remove; promote to depth-3 glass + `--shadow-3` |
| Hover motion | None | `translateY(-3px)`, 200ms silk |
| Top row | Tier dot + label | Retain; tier dot gains 4px glow matching tier color |
| Hero number | 40px Inter | 40px DM Mono `--font-data` |
| Hero container | Flat | Inset data-well: `background: oklch(0 0 0 / 0.20); box-shadow: var(--shadow-inset); border-radius: 8px; padding: 12px 16px;` |
| Trend pill | Solid tint + border | Gain `box-shadow: 0 0 10px {color-glow}` on positive trends only |
| Sparkline | 48px area chart | 64px; add scanline overlay mask: `linear-gradient(transparent 50%, oklch(0 0 0 / 0.04) 50%) 0 0 / 100% 4px` as pseudo-element or overlay div |
| Confidence | Text badge | Retain badge; add small 24px radial arc next to it |
| Footer | Flat border-top | Scanning-line divider |

---

### 3.3 XPBar (Home page full-width version)

| Attribute | Current | New |
|---|---|---|
| Surface | Transparent | Depth-2 glass panel wrapping entire component |
| Track | `oklch(1 0 0 / 0.06)` | Same; add 5 tick marks at 20% intervals using absolute positioned 1px divs |
| Fill | Gradient macro | Same gradient; retain shimmer animation |
| XP number | 28px Inter | 28px DM Mono |
| Labels | "% of max" + "remaining" | Same content, DM Mono |
| Track height | 6px | 8px |

---

### 3.4 QuestCard

| Attribute | Current | New |
|---|---|---|
| Surface (active) | Solid `--bg-surface` | Depth-2 glass |
| Surface (complete) | `oklch(0.72 0.19 145 / 0.05)` | Depth-2 glass + `box-shadow: 0 0 0 1px var(--positive-border), 0 0 24px var(--positive-glow)` |
| Surface (locked) | `--bg-subtle)` at 0.55 opacity | Depth-1 glass, `opacity: 0.40`, `filter: blur(0.3px)` |
| Left accent | None | 2px left border rail colored to `PHASE_COLORS[phase_relevance]` |
| Progress bar | 4px linear | 4px linear; add tick marks at condition threshold steps |
| Status icon | Lucide icons | Retain icons; add `box-shadow: 0 0 8px var(--positive-glow)` to CheckCircle |
| XP badge | Tint bg | Depth-3 glass + color border; DM Mono for number |
| Phase tag | Tint bg text | Retain; move to top-right corner of card |
| Hover | None | `translateY(-2px)` + shadow promotion, 200ms silk |

---

### 3.5 ThesisTier

| Attribute | Current | New |
|---|---|---|
| Surface | Solid `--bg-surface` | Depth-2 glass |
| Tier badge | Solid dark square | Depth-3 glass with DM Mono tier number |
| Status indicator | Text + icon (top right) | Left-rail: 3px bar with color matching status + `box-shadow: 0 0 8px {color-glow}` (glows for green only) |
| Confidence bar | 3px linear track | 3px linear; replace with 40px radial mini-arc |
| Text hierarchy | All same font | Signal text in Inter; confidence value in DM Mono |

---

### 3.6 ConfidenceBadge

| Attribute | Current | New |
|---|---|---|
| Container | Tint pill | Depth-3 glass pill; border uses `--border-glow-{color}` |
| Dot | 5px circle | 5px circle + `box-shadow: 0 0 4px {color}` |
| Text | `{label} · {score}` | `{label}` in Inter; ` · ` separator; `{score}` in DM Mono |

---

### 3.7 SparklineChart

| Attribute | Current | New |
|---|---|---|
| Height | 48px | 64px |
| Stroke width | 1.5px | 2px |
| Fill gradient | 20% → 0% opacity | 25% → 0% opacity; add second gradient layer for scanline texture |
| Scanline overlay | None | Div overlay: `background: repeating-linear-gradient(transparent, transparent 3px, oklch(0 0 0 / 0.04) 3px, oklch(0 0 0 / 0.04) 4px); pointer-events: none` |
| Active dot | r=3, fill color | r=3 + `filter: drop-shadow(0 0 3px {color})` |
| Tooltip | Glass bg | Depth-4 glass; DM Mono for value |
| End marker | None | 4px glowing dot at last data point using SVG circle |

---

## 4. Data Visualization Upgrade Rules

### 4.1 Recharts Chart Style (MetricDrilldown full chart)

```
Grid lines:   stroke: oklch(1 0 0 / 0.04)  strokeDasharray: none (solid, ultra-thin)
Axis text:    DM Mono, 9px, oklch(0.30 0.006 264)
Tooltip:      depth-4 glass, DM Mono values, Inter labels
ReferenceLine: stroke: {tierColor}  strokeOpacity: 0.50  strokeDasharray: "3 3"
              label: instrument-pill style — small box with color bg
Line stroke:  2px, tierColor, activeDot r=5 + drop-shadow glow
```

### 4.2 Radial Arc SVG Spec (Reusable)

All radial arcs follow this pattern. Create one `RadialArc` component.

```jsx
// Props: value (0-100), size (px), color, trackColor, strokeWidth, label
// Arc: 270 degrees, starting at 7 o'clock (225°), ending at 5 o'clock (135°)
// To draw arc at N% fill: rotate the progress arc to cover 270 * (value/100) degrees

const RADIUS = (size - strokeWidth) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
// Actual drawn arc uses pathLength trick or polar-to-cartesian calculation
// startAngle: 135deg (bottom-left), sweep: 270deg
// trackArc: full 270deg in trackColor
// fillArc: 270 * (value / 100) deg in color, stroke-linecap: round
// filter: drop-shadow(0 0 {strokeWidth}px {color} / 0.40)
```

Used in:
- Sidebar footer (XP): 72px, `--macro`, 3px stroke
- Home XP section (hero): 120px, `--macro`, 5px stroke
- MetricDrilldown confidence: 40px, dynamic color, 3px stroke  
- ThesisTier confidence: 32px, dynamic color, 2.5px stroke
- Thesis overall status: 56px, overall color, 4px stroke

### 4.3 Tick-Mark Scale

For all linear progress bars that represent threshold-based progression, add tick marks.

```jsx
// Rendered as: position: relative container
// Ticks: absolute positioned 1px × 6px divs at each threshold percentage
// Tick color: oklch(1 0 0 / 0.15) for non-crossed; tier color for crossed
// Tick label (optional): 8px DM Mono below tick
```

Applied to:
- XPBar track (5 ticks at 20% intervals)
- QuestCard progress bar (at condition boundary percentages)
- Timeline XP mini-bar (10 ticks)

### 4.4 Sparkline Enhancement

Add a `ScanlineOverlay` div on top of every sparkline:

```jsx
<div style={{
  position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
  borderRadius: 'inherit',
  background: `repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 3px,
    oklch(0 0 0 / 0.035) 3px,
    oklch(0 0 0 / 0.035) 4px
  )`,
}} />
```

---

## 5. Interaction and State Model

### 5.1 Motion System

Three named easing curves used throughout:

```css
--ease-silk:   cubic-bezier(0.25, 0.46, 0.45, 0.94);   /* 300ms default */
--ease-snap:   cubic-bezier(0.40, 0.00, 0.20, 1.00);   /* 150ms quick */
--ease-float:  cubic-bezier(0.30, 1.10, 0.60, 1.00);   /* 400ms gentle land */
```

No bounce (`cubic-bezier` with control points > 1 are prohibited except `--ease-float` which has a minimal 1.10 overshoot — acceptable for physical landing feel).

**Screen transitions:**
```css
@keyframes page-enter {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* Applied to main content container on route change: 280ms --ease-silk */
```

**Panel expansion (e.g., quest "why it matters"):**
- Height: `0 → auto` via `max-height` trick or `grid-template-rows: 0fr → 1fr`
- Duration: 320ms `--ease-silk`

**Data update (when values change):**
- Numbers: cross-fade via opacity `1 → 0.4 → 1`, 400ms
- Progress bars: `transition: width 600ms --ease-silk`
- Arcs: `stroke-dashoffset` transition 600ms `--ease-silk`

### 5.2 State Definitions

**Default:**
- Depth-2 glass surface
- `--border` (7% white)
- Shadow: `--shadow-2`
- All text at defined hierarchy

**Hover (interactive surfaces):**
- Surface: promote to depth-3 glass
- Motion: `translateY(-2px)` to `-3px` depending on card size
- Shadow: promote to `--shadow-3`
- Border: `--border-mid` (11% white)
- Duration: 200ms `--ease-snap`

**Active / Selected:**
- Surface: depth-3 glass
- Border: `--border-active` (18% white) + color border-glow if applicable
- Box-shadow: `0 0 0 1px {color-border}, 0 0 20px {color-glow}` for accent elements
- Motion: `translateY(-1px)` (settled back slightly from hover peak)

**Focus (keyboard):**
- `outline: 2px solid var(--live)` at `outline-offset: 3px`
- No fill change

**Loading:**
- Skeleton: `background: oklch(1 0 0 / 0.04)` with shimmer animation
- Text and numbers: replaced with rounded rectangles using `border-radius: 3px`
- Shimmer: left-to-right sweep, 1.8s infinite, `--ease-silk`

**Success (threshold met, quest complete):**
- Border: `--border-glow-green`
- Box-shadow: `0 0 0 1px var(--positive-border), 0 0 28px var(--positive-glow)`
- Micro-animation: `badge-pop` (0.45s) on the completion indicator
- Surface: `oklch(0.72 0.19 145 / 0.06)` tint added to glass

**Error (data unavailable, proxy uncertainty):**
- Border-color: `--border-glow-amber` (not red — amber for uncertainty, red for confirmed negative)
- No glow — warning states stay flat, not illuminated

**Locked:**
- `opacity: 0.38`
- `filter: blur(0.5px)` (slight defocus)
- Surface: depth-1 glass (demoted from depth-2)
- Cursor: `not-allowed` on hover
- No hover promotion

**Unlocked (milestone just crossed):**
- Animate from locked→default with:
  1. `filter: blur(0.5px) → blur(0)` over 400ms
  2. `opacity: 0.38 → 1.00` over 400ms
  3. Border flash: `--border-glow-green` for 800ms then fade to `--border`
  4. Sequence: `--ease-float`

---

## 6. Implementation Priority Order

Implement in this sequence to see the most impact earliest:

1. **`index.css`** — Update `--void`, add glass-level tokens, shadow tokens, `--font-data`, motion curves, scanline/grid CSS, new keyframes
2. **`index.html`** — Add DM Mono font link
3. **`Sidebar.jsx`** — Glass surface, radial XP arc, active nav left-rail
4. **`MetricCard.jsx`** — Depth-2 glass, inset data well, DM Mono hero, scanline sparkline
5. **`SparklineChart.jsx`** — 64px, scanline overlay, glow dot
6. **`XPBar.jsx`** — DM Mono, tick marks, depth glass wrapper
7. **`QuestCard.jsx`** — Glass, left-rail color, glow complete state
8. **`ThesisTier.jsx`** — Glass, left-rail, radial arc confidence
9. **`ConfidenceBadge.jsx`** — Depth-3 glass, glow dot
10. **`RadialArc.jsx`** — New shared SVG component (required by Sidebar, ThesisTier, MetricDrilldown, Thesis)
11. **Pages** — Apply glass panels, scanning dividers, updated spacing, motion wrappers

---

## 7. CSS Variables — Complete New Token Set

```css
:root {
  /* === SURFACES === */
  /* Void background — app root */
  --void: oklch(0.04 0.006 264);

  /* Glass levels — applied as background on backdrop-filter containers */
  --glass-1: oklch(1 0 0 / 0.030);
  --glass-2: oklch(1 0 0 / 0.055);
  --glass-3: oklch(1 0 0 / 0.090);
  --glass-4: oklch(1 0 0 / 0.140);

  /* Solid fallbacks for no-backdrop-filter */
  --solid-1: oklch(0.10 0.008 264);
  --solid-2: oklch(0.14 0.009 264);
  --solid-3: oklch(0.18 0.011 264);
  --solid-4: oklch(0.22 0.013 264);

  /* === SHADOWS === */
  --shadow-1: 0 2px 8px oklch(0 0 0 / 0.50);
  --shadow-2: 0 8px 24px oklch(0 0 0 / 0.55),
              inset 0 1px 0 oklch(1 0 0 / 0.08);
  --shadow-3: 0 16px 40px oklch(0 0 0 / 0.60),
              inset 0 1px 0 oklch(1 0 0 / 0.10);
  --shadow-4: 0 24px 64px oklch(0 0 0 / 0.70),
              inset 0 1px 0 oklch(1 0 0 / 0.14);
  --shadow-inset: inset 0 2px 8px oklch(0 0 0 / 0.45),
                  inset 0 1px 0 oklch(0 0 0 / 0.15);

  /* === BORDERS === */
  --border:          oklch(1 0 0 / 0.07);
  --border-mid:      oklch(1 0 0 / 0.11);
  --border-active:   oklch(1 0 0 / 0.18);

  /* === TEXT === */
  --text-1: oklch(0.97 0.003 264);
  --text-2: oklch(0.68 0.008 264);
  --text-3: oklch(0.46 0.008 264);
  --text-4: oklch(0.32 0.006 264);

  /* === DATA COLORS === */
  --positive:        oklch(0.72 0.19 145);
  --positive-dim:    oklch(0.72 0.19 145 / 0.60);
  --positive-tint:   oklch(0.72 0.19 145 / 0.10);
  --positive-border: oklch(0.72 0.19 145 / 0.28);
  --positive-glow:   oklch(0.72 0.19 145 / 0.20);

  --neutral:        oklch(0.78 0.17 70);
  --neutral-dim:    oklch(0.78 0.17 70 / 0.60);
  --neutral-tint:   oklch(0.78 0.17 70 / 0.10);
  --neutral-border: oklch(0.78 0.17 70 / 0.28);
  --neutral-glow:   oklch(0.78 0.17 70 / 0.20);

  --negative:        oklch(0.65 0.22 25);
  --negative-dim:    oklch(0.65 0.22 25 / 0.60);
  --negative-tint:   oklch(0.65 0.22 25 / 0.10);
  --negative-border: oklch(0.65 0.22 25 / 0.28);
  --negative-glow:   oklch(0.65 0.22 25 / 0.20);

  --live:        oklch(0.68 0.17 215);
  --live-dim:    oklch(0.68 0.17 215 / 0.60);
  --live-tint:   oklch(0.68 0.17 215 / 0.10);
  --live-border: oklch(0.68 0.17 215 / 0.28);
  --live-glow:   oklch(0.68 0.17 215 / 0.20);

  --macro:        oklch(0.65 0.22 278);
  --macro-dim:    oklch(0.65 0.22 278 / 0.60);
  --macro-tint:   oklch(0.65 0.22 278 / 0.10);
  --macro-border: oklch(0.65 0.22 278 / 0.28);
  --macro-glow:   oklch(0.65 0.22 278 / 0.20);

  /* Legacy aliases — keep for existing code compatibility */
  --accent:        var(--live);
  --accent-tint:   var(--live-tint);
  --accent-border: var(--live-border);
  --xp:            var(--macro);
  --xp-tint:       var(--macro-tint);
  --xp-border:     var(--macro-border);
  --success:        var(--positive);
  --success-tint:   var(--positive-tint);
  --success-border: var(--positive-border);
  --warning:        var(--neutral);
  --warning-tint:   var(--neutral-tint);
  --warning-border: var(--neutral-border);
  --danger:         var(--negative);
  --danger-tint:    var(--negative-tint);
  --danger-border:  var(--negative-border);

  /* === FONTS === */
  --font:      'Inter var', system-ui, -apple-system, sans-serif;
  --font-data: 'DM Mono', 'SF Mono', 'Fira Code', monospace;

  /* === MOTION === */
  --ease-silk:  cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-snap:  cubic-bezier(0.40, 0.00, 0.20, 1.00);
  --ease-float: cubic-bezier(0.30, 1.10, 0.60, 1.00);
}
```
