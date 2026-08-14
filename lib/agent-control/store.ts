// lib/agent-control/store.ts
//
// Operator actions in the control tower (pause/resume/quarantine, toggle a
// guardrail, advance/roll-back lifecycle) are layered on top of the derived
// records as a thin overrides map persisted to localStorage. We never mutate the
// derived baseline; applyOverrides folds the overrides in at read time so a
// "reset" is just clearing the map. Mirrors lib/agent-discovery/store.ts:
// SSR-guarded read()/write() + pure mapping functions.
import { LIFECYCLE_ORDER } from './types'
import type {
  AgentControlRecord,
  ControlState,
  GuardrailKey,
  LifecycleStage,
} from './types'

const KEY = 'aispm.agentControl.v1'

export interface AgentOverride {
  controlState?: ControlState
  guardrails?: Partial<Record<GuardrailKey, boolean>>
  lifecycleStage?: LifecycleStage
}

export type OverridesMap = Record<string, AgentOverride>

function read(): OverridesMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return {}
    return (JSON.parse(raw) as OverridesMap) ?? {}
  } catch {
    return {}
  }
}

function write(next: OverridesMap): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* localStorage may be unavailable */
  }
}

export function getOverrides(): OverridesMap {
  return read()
}

export function clearOverrides(): void {
  write({})
}

// ── Pure override producers (exported for tests) ──────────────────────────────

export function withControlState(
  overrides: OverridesMap,
  id: string,
  state: ControlState,
): OverridesMap {
  return { ...overrides, [id]: { ...overrides[id], controlState: state } }
}

export function withGuardrail(
  overrides: OverridesMap,
  id: string,
  key: GuardrailKey,
  on: boolean,
): OverridesMap {
  const prev = overrides[id] ?? {}
  return {
    ...overrides,
    [id]: { ...prev, guardrails: { ...prev.guardrails, [key]: on } },
  }
}

/** Advance (+1) or roll back (-1) the lifecycle stage, clamped to the range. */
export function withLifecycleStep(
  records: AgentControlRecord[],
  overrides: OverridesMap,
  id: string,
  direction: 1 | -1,
): OverridesMap {
  const current = applyOverrides(records, overrides).find(r => r.id === id)
  if (!current) return overrides
  const idx = LIFECYCLE_ORDER.indexOf(current.lifecycle.stage)
  const nextIdx = Math.max(0, Math.min(LIFECYCLE_ORDER.length - 1, idx + direction))
  return {
    ...overrides,
    [id]: { ...overrides[id], lifecycleStage: LIFECYCLE_ORDER[nextIdx] },
  }
}

// ── Persisting wrappers used by the UI ────────────────────────────────────────

export function setControlState(id: string, state: ControlState): OverridesMap {
  const next = withControlState(read(), id, state)
  write(next)
  return next
}

export function toggleGuardrail(id: string, key: GuardrailKey, on: boolean): OverridesMap {
  const next = withGuardrail(read(), id, key, on)
  write(next)
  return next
}

export function stepLifecycle(
  records: AgentControlRecord[],
  id: string,
  direction: 1 | -1,
): OverridesMap {
  const next = withLifecycleStep(records, read(), id, direction)
  write(next)
  return next
}

/** Fold overrides into the derived baseline. Pure. */
export function applyOverrides(
  records: AgentControlRecord[],
  overrides: OverridesMap,
): AgentControlRecord[] {
  return records.map(r => {
    const o = overrides[r.id]
    if (!o) return r
    return {
      ...r,
      controlState: o.controlState ?? r.controlState,
      governance: o.guardrails
        ? { ...r.governance, guardrails: { ...r.governance.guardrails, ...o.guardrails } }
        : r.governance,
      lifecycle: o.lifecycleStage
        ? { ...r.lifecycle, stage: o.lifecycleStage }
        : r.lifecycle,
    }
  })
}
