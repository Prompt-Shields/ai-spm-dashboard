// Seeded demo data for the in-app /ai-spend ROI route (PRO-51).
//
// Mirrors the atlas.ai cost-router shapes (CostSummary, CostTimeseriesPoint,
// CostBreakdownRow) with realistic, illustrative figures so the page renders
// fully populated with no backend dependency. English-only, consistent with
// the rest of the demo content.

export type CostSource = 'actual' | 'estimated' | 'mixed'

export interface CostSummary {
  total: number // total spend over the window (USD)
  actual: number // billed / invoiced portion
  estimated: number // estimated portion (no invoice yet)
  provisional: number // current-day / not-yet-finalised portion
  activeConnectors: number // cost connectors currently reporting
  windowDays: number
  currency: string
}

export interface CostTimeseriesPoint {
  date: string // ISO date (YYYY-MM-DD)
  amount: number
  provisional: boolean // rendered lighter + tagged in the UI
}

export interface CostBreakdownRow {
  label: string
  amount: number
  share: number // 0..1 of total
  source: CostSource
}

export interface CostBreakdowns {
  byVendor: CostBreakdownRow[]
  byModel: CostBreakdownRow[]
  byMember: CostBreakdownRow[]
}

export interface RoiAssumptions {
  engHoursSaved: number // engineering hours saved per month
  loadedRate: number // loaded cost per hour (USD)
}

const DAY_MS = 86_400_000
const WINDOW_DAYS = 30
// Fixed "as of" date so the demo is deterministic and stable across renders.
const END_DATE = new Date('2026-06-19')

// Weekday-aware daily amount shared by the actual window and the forecast
// tail; i is the day offset back from END_DATE (negative for future days).
function dailyAmount(i: number): number {
  const d = new Date(END_DATE.getTime() - i * DAY_MS)
  const isWeekend = d.getDay() === 0 || d.getDay() === 6
  const base = 380
  const wave = 1 + 0.22 * Math.sin(i / 3) + 0.12 * Math.cos(i / 7)
  return Math.round(base * (isWeekend ? 0.45 : 1) * wave)
}

function isoDate(i: number): string {
  return new Date(END_DATE.getTime() - i * DAY_MS).toISOString().slice(0, 10)
}

function buildTimeseries(): CostTimeseriesPoint[] {
  const points: CostTimeseriesPoint[] = []
  for (let i = WINDOW_DAYS - 1; i >= 0; i--) {
    points.push({
      date: isoDate(i),
      amount: dailyAmount(i),
      // The two most recent days are still settling → provisional.
      provisional: i <= 1,
    })
  }
  return points
}

export const COST_TIMESERIES: CostTimeseriesPoint[] = buildTimeseries()

// ---------------------------------------------------------------------------
// Spend forecast — 14 projected days past END_DATE on the same curve.

export const FORECAST_DAYS = 14

export const COST_FORECAST: CostTimeseriesPoint[] = Array.from(
  { length: FORECAST_DAYS },
  (_, k) => ({
    date: isoDate(-(k + 1)),
    amount: dailyAmount(-(k + 1)),
    provisional: false,
  }),
)

const TOTAL = COST_TIMESERIES.reduce((s, p) => s + p.amount, 0)
const PROVISIONAL = COST_TIMESERIES.filter((p) => p.provisional).reduce((s, p) => s + p.amount, 0)
const ESTIMATED = Math.round(TOTAL * 0.18)

export const COST_SUMMARY: CostSummary = {
  total: TOTAL,
  estimated: ESTIMATED,
  actual: TOTAL - ESTIMATED,
  provisional: PROVISIONAL,
  activeConnectors: 5,
  windowDays: WINDOW_DAYS,
  currency: 'USD',
}

function rows(defs: ReadonlyArray<[string, number, CostSource]>): CostBreakdownRow[] {
  return defs.map(([label, share, source]) => ({
    label,
    share,
    source,
    amount: Math.round(TOTAL * share),
  }))
}

export const COST_BREAKDOWNS: CostBreakdowns = {
  byVendor: rows([
    ['OpenAI', 0.42, 'actual'],
    ['Anthropic', 0.27, 'actual'],
    ['Azure OpenAI', 0.18, 'estimated'],
    ['Google Vertex AI', 0.08, 'mixed'],
    ['Cohere', 0.05, 'estimated'],
  ]),
  byModel: rows([
    ['gpt-4o', 0.34, 'actual'],
    ['claude-3.5-sonnet', 0.24, 'actual'],
    ['gpt-4o-mini', 0.15, 'actual'],
    ['gemini-1.5-pro', 0.08, 'mixed'],
    ['text-embedding-3-large', 0.07, 'estimated'],
    ['other', 0.12, 'mixed'],
  ]),
  byMember: rows([
    ['Platform Engineering', 0.31, 'actual'],
    ['Data Science', 0.26, 'mixed'],
    ['Customer Support', 0.18, 'estimated'],
    ['Product', 0.14, 'actual'],
    ['Marketing', 0.11, 'estimated'],
  ]),
}

// Defaults for the interactive "Return on AI" model. Persisted to localStorage
// once the user edits them (see the page component).
export const ROI_DEFAULTS: RoiAssumptions = {
  engHoursSaved: 320,
  loadedRate: 95,
}

export const ROI_STORAGE_KEY = 'aispm.ai-spend.roi'

// ---------------------------------------------------------------------------
// Projections derived from the actuals + forecast tail.

export interface Projection {
  monthEnd: number // projected spend for the current calendar month (June)
  annualRunRate: number // trailing 30-day total extrapolated to a year
}

const CURRENT_MONTH = isoDate(0).slice(0, 7)
const monthToDate = COST_TIMESERIES.filter((p) => p.date.startsWith(CURRENT_MONTH)).reduce(
  (s, p) => s + p.amount,
  0,
)
const monthForecastTail = COST_FORECAST.filter((p) => p.date.startsWith(CURRENT_MONTH)).reduce(
  (s, p) => s + p.amount,
  0,
)

export const PROJECTION: Projection = {
  monthEnd: monthToDate + monthForecastTail,
  annualRunRate: Math.round(TOTAL * (365 / WINDOW_DAYS)),
}

// ---------------------------------------------------------------------------
// Savings recommendations, mirroring the Vertice AI Cost Optimization panel.

export type RecommendationCategory = 'model-routing' | 'commitment' | 'anomaly' | 'waste'

export interface SavingsRecommendation {
  id: string
  title: string
  detail: string
  category: RecommendationCategory
  estAnnualSaving?: number // absent for review-only items (anomalies)
}

export const SAVINGS_RECOMMENDATIONS: SavingsRecommendation[] = [
  {
    id: 'route-low-complexity',
    title: 'Route low-complexity tasks to a cheaper model',
    detail:
      '38% of gpt-4o traffic is classification and extraction that gpt-4o-mini handles at ~6% of the cost.',
    category: 'model-routing',
    estAnnualSaving: 18_000,
  },
  {
    id: 'right-size-openai-commitment',
    title: 'Right-size the OpenAI token commitment',
    detail:
      'Current usage tracks to 83% of the committed volume; the renewal tier below covers projected growth.',
    category: 'commitment',
    estAnnualSaving: 21_000,
  },
  {
    id: 'platform-eng-spike',
    title: 'Platform Engineering spend up 2.5× vs prior period',
    detail:
      'A new evaluation pipeline is re-running full test suites against gpt-4o. Confirm this is intentional.',
    category: 'anomaly',
  },
  {
    id: 'reduce-failed-requests',
    title: 'Reduce failed and retried requests',
    detail:
      '4.1% of spend is on requests that error or time out and are retried at full cost, mostly oversized contexts.',
    category: 'waste',
    estAnnualSaving: 6_000,
  },
]

export const TOTAL_POTENTIAL_SAVINGS = SAVINGS_RECOMMENDATIONS.reduce(
  (s, r) => s + (r.estAnnualSaving ?? 0),
  0,
)

// ---------------------------------------------------------------------------
// Committed-spend agreements per provider, with derived status.

export type CommitmentStatus = 'on-track' | 'at-risk' | 'over-limit'

export interface Commitment {
  provider: string
  annualCommitment: number // USD committed for the contract year
  usedToDate: number // USD consumed so far this contract year
  projectedAnnual: number // projected consumption by renewal
  renewalDate: string // ISO date
}

export function commitmentStatus(c: Commitment): CommitmentStatus {
  if (c.projectedAnnual > c.annualCommitment) return 'over-limit'
  if (c.projectedAnnual > 0.9 * c.annualCommitment) return 'at-risk'
  return 'on-track'
}

export const COMMITMENTS: Commitment[] = [
  {
    provider: 'OpenAI',
    annualCommitment: 60_000,
    usedToDate: 26_500,
    projectedAnnual: 49_800,
    renewalDate: '2027-01-31',
  },
  {
    provider: 'Anthropic',
    annualCommitment: 33_000,
    usedToDate: 15_900,
    projectedAnnual: 31_600,
    renewalDate: '2027-03-31',
  },
  {
    provider: 'Azure OpenAI',
    annualCommitment: 18_000,
    usedToDate: 10_400,
    projectedAnnual: 21_300,
    renewalDate: '2026-11-30',
  },
]
