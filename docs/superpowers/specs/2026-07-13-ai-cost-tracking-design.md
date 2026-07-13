# AI Cost Tracking — Vertice-style cost optimization on /ai-spend

**Date:** 2026-07-13
**Status:** Approved (user, 2026-07-13)
**Branch:** feat/ai-cost-tracking

## Goal

Extend the existing `/ai-spend` demo page with the three capabilities from
Vertice's AI Cost Optimization product that it currently lacks: savings
recommendations, spend forecasting, and commitment tracking. Everything stays
a seeded, deterministic, backend-free demo, consistent with the rest of the
dashboard.

## Non-goals

- No new route; `/ai-spend` is extended in place.
- No backend, no connectors — all data is seeded in `lib/cost-demo.ts`.
- No localization (page is English-only today, stays that way).
- The existing summary strip, ROI model, and breakdown tabs are unchanged.

## Data model (`lib/cost-demo.ts`)

All new data is exported from the existing module, derived where possible so
figures stay internally consistent with `COST_TIMESERIES` / `COST_SUMMARY`.

### Savings recommendations

```ts
export type RecommendationCategory = 'model-routing' | 'commitment' | 'anomaly' | 'waste'

export interface SavingsRecommendation {
  id: string
  title: string
  detail: string
  category: RecommendationCategory
  estAnnualSaving?: number // absent for review-only items (anomalies)
}
```

Four seeded recommendations mirroring the Vertice screenshots:

1. `model-routing` — route low-complexity tasks to a cheaper model (~$18k/yr)
2. `commitment` — right-size the OpenAI token commitment (~$21k/yr)
3. `anomaly` — Platform Engineering spend up 2.5× vs prior period (review, no $)
4. `waste` — reduce failed/retried requests (~$6k/yr)

`TOTAL_POTENTIAL_SAVINGS` = sum of defined `estAnnualSaving`s (~$45k/yr).

### Spend forecast

- The timeseries generator additionally produces `FORECAST_DAYS = 14` points
  after `END_DATE` using the same weekday-aware curve, exported as
  `COST_FORECAST: CostTimeseriesPoint[]` (all `provisional: false`).
- `PROJECTION` export: `{ monthEnd: number; annualRunRate: number }`
  - `monthEnd`: actual June spend to date + forecast of the remaining days of
    June (weekday-aware daily average).
  - `annualRunRate`: trailing 30-day total × (365 / 30), rounded.

### Commitments

```ts
export type CommitmentStatus = 'on-track' | 'at-risk' | 'over-limit'

export interface Commitment {
  provider: string
  annualCommitment: number // USD committed for the contract year
  usedToDate: number       // USD consumed so far
  projectedAnnual: number  // projected consumption by renewal
  renewalDate: string      // ISO date
}
```

Status is **derived**, not stored, via exported
`commitmentStatus(c: Commitment): CommitmentStatus`:

- `over-limit` if `projectedAnnual > annualCommitment`
- `at-risk` if `projectedAnnual > 0.9 × annualCommitment`
- `on-track` otherwise

Three seeded rows exercising each status: OpenAI (on-track), Anthropic
(at-risk), Azure OpenAI (over-limit).

## UI (`app/ai-spend/page.tsx`)

Section order on the page:

1. Summary strip (unchanged)
2. **Savings recommendations** (new) — headline "Potential annual savings
   $45k", one row per recommendation with a category badge and, when present,
   a "Save $X/yr" chip; anomaly rows get a "Review" chip instead.
3. Return on AI (unchanged)
4. **Daily spend & forecast** (extended) — existing bars plus 14 forecast bars
   rendered lighter/outlined, "Forecast" legend entry, and two stats beside
   the chart: projected month-end and projected annual run-rate.
5. Breakdown tabs (unchanged)
6. **Commitments** (new) — one row per provider: % used progress bar,
   remaining budget, projected annual vs commitment, renewal date, and a
   status badge (success / warning / destructive variants).

Styling follows the page's existing idiom: white cards, `rounded-xl`,
slate/indigo palette, `Badge` from `components/ui/badge`.

## Testing

`lib/cost-demo.test.ts` (vitest, run with `--pool=forks` per repo convention):

- `commitmentStatus` returns each of the three statuses at the boundary
  values.
- `PROJECTION.monthEnd` ≥ June actual-to-date; `annualRunRate` ≈ 30-day total
  × 365/30.
- `COST_FORECAST` has 14 points, all dated after the last actual point.
- `TOTAL_POTENTIAL_SAVINGS` equals the sum of the seeded recs' savings.

## Verification

Launch the dev server, open `/ai-spend`, confirm the three new sections
render with the seeded figures, and screenshot for the user.
