// lib/agent-control/types.ts
//
// The Control Panel reuses the Agent Discovery inventory (DiscoveredAgent) and
// enriches each agent with the operational, governance, and lifecycle fields an
// AI control tower needs: live runtime health, guardrail posture, and where the
// agent sits in its managed lifecycle. These enrichment fields are *derived*
// deterministically from the base agent (see derive.ts) so the demo is stable
// and reproducible — no randomness — while user actions (pause, quarantine,
// toggle guardrail, advance lifecycle) are layered on top via the store.
import type { Cloud, DiscoveredAgent } from '@/lib/agent-discovery/types'

/** Operational state an operator can control from the tower. */
export type ControlState = 'active' | 'paused' | 'quarantined'

/** Live health signal from the agent runtime. */
export type HealthStatus = 'healthy' | 'degraded' | 'down'

/** Managed lifecycle stages, ordered from left (new) to right (end-of-life). */
export type LifecycleStage =
  | 'discovered'
  | 'certified'
  | 'production'
  | 'deprecated'
  | 'retired'

export const LIFECYCLE_ORDER: LifecycleStage[] = [
  'discovered',
  'certified',
  'production',
  'deprecated',
  'retired',
]

/** A single guardrail control that can be on or off for an agent. */
export type GuardrailKey =
  | 'humanInLoop'
  | 'piiRedaction'
  | 'toolAllowlist'
  | 'outputFilter'
  | 'rateLimit'
  | 'auditLogging'

export const GUARDRAIL_KEYS: GuardrailKey[] = [
  'humanInLoop',
  'piiRedaction',
  'toolAllowlist',
  'outputFilter',
  'rateLimit',
  'auditLogging',
]

/** Runtime telemetry surfaced in the operations view. */
export interface RuntimeMetrics {
  health: HealthStatus
  invocations24h: number
  successRate: number // 0..1
  avgLatencyMs: number
  errorRate: number // 0..1
  costUsd30d: number
  actionsAutomated30d: number
  lastActiveMinsAgo: number
}

/** Governance posture surfaced in the guardrails view. */
export interface GovernancePosture {
  riskScore: number // 0..100, higher = riskier
  openIncidents: number
  policyViolations30d: number
  guardrails: Record<GuardrailKey, boolean>
}

/** Lifecycle posture surfaced in the lifecycle view. */
export interface LifecyclePosture {
  stage: LifecycleStage
  certifiedBy: string | null
  reviewDueInDays: number // negative ⇒ overdue
}

/** A fully-enriched agent as the control tower sees it. */
export interface AgentControlRecord extends DiscoveredAgent {
  controlState: ControlState
  runtime: RuntimeMetrics
  governance: GovernancePosture
  lifecycle: LifecyclePosture
}

/** Fleet-wide roll-up for the KPI strip. */
export interface FleetSummary {
  total: number
  active: number
  paused: number
  quarantined: number
  down: number
  degraded: number
  openIncidents: number
  policyViolations30d: number
  reviewOverdue: number
  avgSuccessRate: number // 0..1
  totalCostUsd30d: number
  guardrailCoverage: number // 0..1, mean fraction of guardrails enabled
  perCloud: { cloud: Cloud; total: number; quarantined: number }[]
}
