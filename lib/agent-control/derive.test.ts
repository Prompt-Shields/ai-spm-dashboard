import { describe, expect, it } from 'vitest'
import { CLOUD_AGENTS } from '../agent-discovery/data'
import { buildControlRecords, deriveControlRecord } from './derive'

describe('deriveControlRecord', () => {
  it('is deterministic for a given agent', () => {
    const a = CLOUD_AGENTS[0]
    expect(deriveControlRecord(a)).toEqual(deriveControlRecord(a))
  })

  it('quarantines the highest-risk shadow agents and keeps registered agents active', () => {
    const records = buildControlRecords(CLOUD_AGENTS)
    const shadowQuarantined = records.filter(
      (r) => r.approvalState === 'unregistered' && r.controlState === 'quarantined',
    )
    expect(shadowQuarantined.length).toBeGreaterThan(0)
    // No approved agent should be quarantined by default.
    expect(records.filter((r) => r.approvalState === 'approved' && r.controlState === 'quarantined')).toHaveLength(0)
  })

  it('scores shadow + restricted + residency-violating agents as high risk', () => {
    const risky = deriveControlRecord({
      ...CLOUD_AGENTS[0],
      approvalState: 'unregistered',
      dataClassification: 'restricted',
      residencyOk: false,
      manifestComplete: false,
    })
    expect(risky.governance.riskScore).toBeGreaterThanOrEqual(70)
  })

  it('keeps success rate in [0,1] and cost non-negative', () => {
    for (const r of buildControlRecords(CLOUD_AGENTS)) {
      expect(r.runtime.successRate).toBeGreaterThanOrEqual(0)
      expect(r.runtime.successRate).toBeLessThanOrEqual(1)
      expect(r.runtime.costUsd30d).toBeGreaterThanOrEqual(0)
    }
  })
})
