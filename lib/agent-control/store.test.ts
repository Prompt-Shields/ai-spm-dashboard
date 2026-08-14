import { describe, expect, it } from 'vitest'
import { CLOUD_AGENTS } from '../agent-discovery/data'
import { buildControlRecords } from './derive'
import {
  applyOverrides,
  withControlState,
  withGuardrail,
  withLifecycleStep,
} from './store'

const RECORDS = buildControlRecords(CLOUD_AGENTS)
const ID = RECORDS[0].id

describe('control-panel overrides', () => {
  it('applies a control-state override without mutating the baseline', () => {
    const overrides = withControlState({}, ID, 'quarantined')
    const applied = applyOverrides(RECORDS, overrides)
    expect(applied.find((r) => r.id === ID)?.controlState).toBe('quarantined')
    // Baseline untouched.
    expect(RECORDS.find((r) => r.id === ID)?.controlState).not.toBe('quarantined')
  })

  it('toggles a single guardrail and leaves the rest intact', () => {
    const overrides = withGuardrail({}, ID, 'rateLimit', false)
    const applied = applyOverrides(RECORDS, overrides).find((r) => r.id === ID)!
    expect(applied.governance.guardrails.rateLimit).toBe(false)
    expect(applied.governance.guardrails.auditLogging).toBe(
      RECORDS.find((r) => r.id === ID)!.governance.guardrails.auditLogging,
    )
  })

  it('clamps lifecycle steps to the range', () => {
    // Roll a discovered agent back — stays at the first stage.
    const discovered = RECORDS.find((r) => r.lifecycle.stage === 'discovered')!
    const back = withLifecycleStep(RECORDS, {}, discovered.id, -1)
    expect(applyOverrides(RECORDS, back).find((r) => r.id === discovered.id)?.lifecycle.stage).toBe('discovered')
  })

  it('advances lifecycle by one stage', () => {
    const discovered = RECORDS.find((r) => r.lifecycle.stage === 'discovered')!
    const fwd = withLifecycleStep(RECORDS, {}, discovered.id, 1)
    expect(applyOverrides(RECORDS, fwd).find((r) => r.id === discovered.id)?.lifecycle.stage).toBe('certified')
  })
})
