import { describe, it, expect } from "vitest"
import {
  USAGE_QUALITY,
  healthyShare,
  totalScored,
  leverageIndex,
  leverageShift,
  adoptionRate,
  valueDelivered,
  roiMultiple,
  qualityLeakage,
  seatCoverage,
  visibilityGap,
  personalSpend,
  reviewQueue,
} from "./usage-quality-data"

describe("usage-quality derivations", () => {
  it("totalScored sums the distribution and never exceeds the sample", () => {
    const o = USAGE_QUALITY.outcome
    expect(totalScored(o)).toBe(420)
    expect(totalScored(o)).toBeLessThanOrEqual(o.sampled)
  })

  it("healthyShare counts good+excellent over the total scored", () => {
    // (148 + 172) / 420
    expect(healthyShare(USAGE_QUALITY.outcome)).toBeCloseTo(320 / 420, 5)
  })

  it("leverageIndex weights agentic use highest", () => {
    expect(leverageIndex({ lookup: 1, drafting: 0, reasoning: 0, agentic: 0 })).toBe(1)
    expect(leverageIndex({ lookup: 0, drafting: 0, reasoning: 0, agentic: 1 })).toBe(4)
  })

  it("leverageShift is positive when the mix moves upmarket", () => {
    // The mock window shifted work toward reasoning/agentic — should be up.
    expect(leverageShift(USAGE_QUALITY.leverage)).toBeGreaterThan(0)
  })

  it("adoptionRate is adopters over reachable, guarded against zero", () => {
    expect(adoptionRate(USAGE_QUALITY.diffusion[0])).toBeCloseTo(210 / 480, 5)
    expect(adoptionRate({ ...USAGE_QUALITY.diffusion[0], reachable: 0 })).toBe(0)
  })

  it("valueDelivered prices quality-weighted hours at the blended rate", () => {
    // 2180 hrs × $85
    expect(valueDelivered(USAGE_QUALITY.roi)).toBe(2180 * 85)
  })

  it("roiMultiple returns value per dollar of tool spend", () => {
    expect(roiMultiple(USAGE_QUALITY.roi)).toBeCloseTo((2180 * 85) / 42000, 5)
    expect(roiMultiple({ ...USAGE_QUALITY.roi, monthlyToolCost: 0 })).toBe(0)
  })

  it("qualityLeakage is the discarded share of raw hours", () => {
    // 1 - 2180/2960
    expect(qualityLeakage(USAGE_QUALITY.roi)).toBeCloseTo(1 - 2180 / 2960, 5)
  })

  it("seatCoverage matches Eva's ~74% licensed", () => {
    // 428 / 580
    expect(seatCoverage(USAGE_QUALITY.license)).toBeCloseTo(428 / 580, 5)
    expect(seatCoverage(USAGE_QUALITY.license)).toBeGreaterThan(0.73)
  })

  it("visibilityGap is the unclassified share of everything built", () => {
    // built = 640+176+84+37 = 937; classified = 214+98+61+29 = 402
    expect(visibilityGap(USAGE_QUALITY.inventory)).toBeCloseTo(1 - 402 / 937, 5)
    expect(visibilityGap([])).toBe(0)
  })

  it("personalSpend prices the non-work slice of tool cost", () => {
    // 42000 × 0.12
    expect(personalSpend(USAGE_QUALITY.roi, USAGE_QUALITY.usageSplit)).toBeCloseTo(42000 * 0.12, 5)
  })

  it("reviewQueue counts skills awaiting a compliance decision", () => {
    expect(reviewQueue(USAGE_QUALITY.library)).toBe(1)
  })
})
