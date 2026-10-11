# Broke But Functional — Survive the Month

A personal budgeting app built for Gen Z and college students. You start with ₹10,000 and 30 days. Track spending, simulate purchases before committing, manage bills and subscriptions, set savings goals, and watch a day-by-day forecast of your balance — all while a transparent financial health score tells you exactly where you stand.

## Why it exists

Most budgeting apps show you where your money went. This one helps you decide where it should go. The flagship feature is the **Decision Simulator**: enter a potential purchase and instantly see its impact on your balance, daily allowance, month-end projection, and health score — before you spend a rupee.

## Target users

- College students and young adults managing a monthly allowance or stipend
- Anyone on a tight fixed budget who needs to plan spending day-by-day
- People who want to understand *why* their financial situation is healthy or risky, not just see a number

## Key features

- **Dashboard** — Balance, budget usage, safe daily spending, health score, recent transactions, upcoming commitments, and a 30-day forecast sparkline at a glance.
- **Decision Simulator** — Test a purchase or savings contribution before committing. See a side-by-side before/after comparison of balance, daily allowance, month-end projection, health score, and risk level, with a plain-language explanation of what changes and why.
- **Transactions** — Full income and expense tracking with category filters. Add, edit, and delete entries. Changes recalculate the entire budget automatically.
- **Commitments** — Fixed obligations (rent, bills) and recurring subscriptions, each with a due day within the 30-day cycle. Mark items as paid; unpaid items reduce your spendable balance and appear in your forecast.
- **Savings Goals** — Set targets with a deadline day. Contribute without double-counting as expenses — saved money stays in your balance but is tracked separately.
- **30-Day Forecast** — Interactive SVG chart showing actual spending vs. projected balance across all 30 days, with hover tooltips and commitment deductions marked on their due days.
- **Financial Health** — A transparent 0–100 score built from four weighted factors (budget remaining, commitment coverage, savings progress, projected month-end), with risk assessment and recommended next steps.
- **Dark mode** — Respects system preference, with manual toggle. Persisted across sessions.
- **Offline-first** — All data stored locally in your browser. No account required, no server round-trips.

## Technology stack

- **React 18** with TypeScript (strict mode)
- **Vite 5** for development and production builds
- **Tailwind CSS 3** for styling with a custom design system (emerald primary, navy neutrals)
- **Lucide React** for icons
- **localStorage** for client-side data persistence (no backend required)

## Prerequisites

- Node.js 18+ and npm
- A modern browser with JavaScript and localStorage enabled

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Starts the Vite dev server with hot module replacement. The app runs at `http://localhost:5173`.

## Production build

```bash
npm run build
```

Builds the optimized production bundle into `dist/`. Output is static HTML, CSS, and JS — suitable for any static host.

## Lint and type-check

```bash
npm run lint        # ESLint with TypeScript rules
npm run typecheck   # tsc --noEmit, no output files
```

Both should pass with zero errors before deployment.

## Preview production build locally

```bash
npm run preview
```

Serves the `dist/` folder locally to verify the production build.

## Deployment

### Vercel

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Vercel auto-detects Vite. Use these settings if prompted:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
   - **Install command:** `npm install`
4. Deploy. No environment variables are required — the app is fully client-side.

The `dist/_redirects` file ensures client-side routing works on Vercel and other static hosts.

## Project structure

```
src/
├── App.tsx                     # Root component, view routing, decision dispatch
├── main.tsx                    # React entry point
├── index.css                   # Tailwind directives + custom theme tokens
├── types.ts                    # Shared TypeScript types (Transaction, FinanceState, etc.)
├── hooks/
│   ├── useFinanceState.ts      # State management + localStorage persistence
│   └── useTheme.ts             # Dark/light theme with system preference detection
├── lib/
│   ├── calculations.ts         # Financial metrics, forecast, decision simulation
│   ├── format.ts               # Currency, date, and ID formatting utilities
│   ├── seed.ts                 # Demo data factory
│   └── storage.ts              # localStorage load/save/migrate
├── components/
│   ├── Sidebar.tsx             # Navigation (desktop sidebar + mobile drawer)
│   ├── IntroModal.tsx          # First-visit onboarding
│   ├── ui/                     # Reusable UI primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── CategoryIcon.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── Input.tsx           # Input, Select, CategorySelect
│   │   ├── Misc.tsx            # EmptyState, RiskBadge, DemoBadge, ChangeBadge
│   │   ├── Modal.tsx           # Accessible dialog with focus trap + ESC close
│   │   ├── ProgressBar.tsx
│   │   └── StatCard.tsx
│   └── views/                  # One file per app screen
│       ├── Dashboard.tsx
│       ├── DecisionSimulator.tsx
│       ├── Transactions.tsx
│       ├── Commitments.tsx
│       ├── SavingsGoals.tsx
│       ├── Forecast.tsx
│       └── FinancialHealth.tsx
```

### Data flow

```
useFinanceState (hook)
  └── FinanceState (single source of truth)
       ├── persists to localStorage on every change
       └── passed down as props to each view
            ├── computeMetrics(state) → FinanceMetrics (balance, health, risk)
            ├── computeForecast(state) → ForecastPoint[] (30-day projection)
            └── simulateDecision(state, decision) → SimResult (before/after)
```

All financial calculations flow through `computeMetrics` in `lib/calculations.ts`, which is the single source of truth for derived numbers. Views receive `metrics` as props from `App.tsx` (memoized) or compute them locally with `useMemo`.

## Data persistence and privacy

- All user data is stored in `localStorage` under the key `bbf_finance_state_v1`.
- No data is sent to any server. There is no backend, no analytics, and no tracking.
- Clearing browser data or using a private/incognito window starts fresh with demo data.
- "Reset to demo data" in the sidebar replaces current data with the original demo budget.
- A migration function in `storage.ts` handles backward compatibility when the data shape changes.

## How financial calculations work

**Balance** = starting budget + total income − total expenses. Savings contributions do not reduce balance — they are tracked separately as progress toward goals.

**Spendable balance** = current balance − unpaid commitments and subscriptions. This is what you can actually spend without missing obligations.

**Safe daily allowance** = max(0, spendable balance ÷ days remaining). Tells you how much you can spend each day and still cover everything.

**Projected month-end balance** = current balance − unpaid commitments. Shows where you'll land if no new transactions occur.

**Health score** (0–100) = weighted sum of four factors:
- Budget remaining (35 pts) — how much of your starting ₹10,000 is left
- Commitment coverage (25 pts) — whether you can cover obligations with surplus
- Savings progress (20 pts) — how close you are to your total savings target
- Projected month-end (20 pts) — whether you're projected to end positive

**Risk level** (Low / Moderate / High) is determined by the number and severity of financial pressures detected: balance below commitments, negative spendable, low daily allowance, negative projection, or underfunded savings near deadline.

## Known limitations

- The 30-day cycle starts from the date of first use (or 5 days before, for demo data). There is no concept of recurring monthly cycles — each session is a single 30-day window.
- Savings contributions are virtual — they track progress toward a goal but don't transfer money to a separate account.
- The app is designed for a single user on a single device. There is no multi-user or sync support.
- Currency is fixed to Indian Rupees (₹) via `Intl.NumberFormat('en-IN')`.

## License

This project is open source. Feel free to adapt it for your own use.
