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

function buildTimeseries(): CostTimeseriesPoint[] {
  const points: CostTimeseriesPoint[] = []
  for (let i = WINDOW_DAYS - 1; i >= 0; i--) {
    const d = new Date(END_DATE.getTime() - i * DAY_MS)
    const isWeekend = d.getDay() === 0 || d.getDay() === 6
    const base = 380
    const wave = 1 + 0.22 * Math.sin(i / 3) + 0.12 * Math.cos(i / 7)
    const amount = Math.round(base * (isWeekend ? 0.45 : 1) * wave)
    points.push({
      date: d.toISOString().slice(0, 10),
      amount,
      // The two most recent days are still settling → provisional.
      provisional: i <= 1,
    })
  }
  return points
}

export const COST_TIMESERIES: CostTimeseriesPoint[] = buildTimeseries()

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
