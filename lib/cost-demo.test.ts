import { describe, expect, it } from 'vitest'
import {
  COST_FORECAST,
  COST_TIMESERIES,
  COMMITMENTS,
  PROJECTION,
  SAVINGS_RECOMMENDATIONS,
  TOTAL_POTENTIAL_SAVINGS,
  commitmentStatus,
  type Commitment,
} from './cost-demo'

const commitment = (overrides: Partial<Commitment>): Commitment => ({
  provider: 'Test',
  annualCommitment: 100_000,
  usedToDate: 40_000,
  projectedAnnual: 80_000,
  renewalDate: '2027-01-01',
  ...overrides,
})

describe('commitmentStatus', () => {
  it('is on-track when projected spend is at or below 90% of the commitment', () => {
    expect(commitmentStatus(commitment({ projectedAnnual: 90_000 }))).toBe('on-track')
  })

  it('is at-risk when projected spend exceeds 90% but not the commitment', () => {
    expect(commitmentStatus(commitment({ projectedAnnual: 95_000 }))).toBe('at-risk')
    expect(commitmentStatus(commitment({ projectedAnnual: 100_000 }))).toBe('at-risk')
  })

  it('is over-limit when projected spend exceeds the commitment', () => {
    expect(commitmentStatus(commitment({ projectedAnnual: 100_001 }))).toBe('over-limit')
  })
})

describe('seeded commitments', () => {
  it('exercise all three statuses', () => {
    const statuses = COMMITMENTS.map(commitmentStatus)
    expect(statuses).toContain('on-track')
    expect(statuses).toContain('at-risk')
    expect(statuses).toContain('over-limit')
  })
})

describe('COST_FORECAST', () => {
  it('has 14 daily points, all after the last actual point', () => {
    expect(COST_FORECAST).toHaveLength(14)
    const lastActual = COST_TIMESERIES[COST_TIMESERIES.length - 1].date
    for (const p of COST_FORECAST) {
      expect(p.date > lastActual).toBe(true)
      expect(p.amount).toBeGreaterThan(0)
    }
  })
})

describe('PROJECTION', () => {
  it('projects month-end spend at or above the June actual to date', () => {
    const juneActual = COST_TIMESERIES.filter((p) => p.date.startsWith('2026-06')).reduce(
      (s, p) => s + p.amount,
      0,
    )
    expect(PROJECTION.monthEnd).toBeGreaterThanOrEqual(juneActual)
  })

  it('annual run-rate extrapolates the 30-day window to a year', () => {
    const windowTotal = COST_TIMESERIES.reduce((s, p) => s + p.amount, 0)
    expect(PROJECTION.annualRunRate).toBe(Math.round(windowTotal * (365 / 30)))
  })
})

describe('savings recommendations', () => {
  it('total potential savings is the sum of the recommendations with a figure', () => {
    const sum = SAVINGS_RECOMMENDATIONS.reduce((s, r) => s + (r.estAnnualSaving ?? 0), 0)
    expect(TOTAL_POTENTIAL_SAVINGS).toBe(sum)
    expect(TOTAL_POTENTIAL_SAVINGS).toBeGreaterThan(0)
  })

  it('includes a review-only anomaly without a savings figure', () => {
    const anomaly = SAVINGS_RECOMMENDATIONS.find((r) => r.category === 'anomaly')
    expect(anomaly).toBeDefined()
    expect(anomaly?.estAnnualSaving).toBeUndefined()
  })
})
