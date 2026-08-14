// lib/agent-control/summary.ts
// Pure fleet-wide aggregation for the KPI strip. No I/O.
import type { Cloud } from '@/lib/agent-discovery/types'
import { GUARDRAIL_KEYS } from './types'
import type { AgentControlRecord, FleetSummary } from './types'

const CLOUDS: Cloud[] = ['aws', 'azure', 'gcp']

export function buildFleetSummary(records: AgentControlRecord[]): FleetSummary {
  const total = records.length
  const by = (fn: (r: AgentControlRecord) => boolean) => records.filter(fn).length

  const guardrailCoverage =
    total === 0
      ? 0
      : records.reduce((sum, r) => {
          const on = GUARDRAIL_KEYS.filter(k => r.governance.guardrails[k]).length
          return sum + on / GUARDRAIL_KEYS.length
        }, 0) / total

  const avgSuccessRate =
    total === 0 ? 0 : records.reduce((s, r) => s + r.runtime.successRate, 0) / total

  return {
    total,
    active: by(r => r.controlState === 'active'),
    paused: by(r => r.controlState === 'paused'),
    quarantined: by(r => r.controlState === 'quarantined'),
    down: by(r => r.runtime.health === 'down'),
    degraded: by(r => r.runtime.health === 'degraded'),
    openIncidents: records.reduce((s, r) => s + r.governance.openIncidents, 0),
    policyViolations30d: records.reduce((s, r) => s + r.governance.policyViolations30d, 0),
    reviewOverdue: by(r => r.lifecycle.reviewDueInDays < 0),
    avgSuccessRate,
    totalCostUsd30d: records.reduce((s, r) => s + r.runtime.costUsd30d, 0),
    guardrailCoverage,
    perCloud: CLOUDS.map(cloud => ({
      cloud,
      total: by(r => r.cloud === cloud),
      quarantined: by(r => r.cloud === cloud && r.controlState === 'quarantined'),
    })),
  }
}
