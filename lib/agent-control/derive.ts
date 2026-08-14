// lib/agent-control/derive.ts
//
// Deterministically enrich Agent Discovery records with the runtime/governance/
// lifecycle fields the control tower needs. No randomness: every value is a pure
// function of the agent's own attributes, so the demo renders identically on
// every load and in tests. The heuristics are intentionally opinionated so the
// fleet tells a coherent story — shadow agents look risky and unhealthy,
// registered agents look production-grade.
import type { DiscoveredAgent } from '@/lib/agent-discovery/types'
import type {
  AgentControlRecord,
  ControlState,
  GovernancePosture,
  GuardrailKey,
  HealthStatus,
  LifecyclePosture,
  LifecycleStage,
  RuntimeMetrics,
} from './types'

// Small stable string hash (FNV-1a-ish) → used only to spread numbers, never
// for security. Deterministic for a given id.
function hash(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 0xffffffff // 0..1
}

// Pull several independent 0..1 draws from one id so fields don't correlate.
function draw(id: string, salt: string): number {
  return hash(`${id}:${salt}`)
}

function riskScore(agent: DiscoveredAgent): number {
  let score = 10
  if (agent.approvalState === 'unregistered') score += 45
  else if (agent.approvalState === 'pending') score += 20
  if (agent.dataClassification === 'restricted') score += 20
  else if (agent.dataClassification === 'confidential') score += 10
  if (!agent.residencyOk) score += 15
  if (!agent.manifestComplete) score += 10
  if (agent.regulatoryScope.includes('EU-AI-ACT')) score += 8
  return Math.min(100, score)
}

function deriveHealth(agent: DiscoveredAgent, risk: number): HealthStatus {
  if (agent.approvalState === 'unregistered' && !agent.manifestComplete) return 'down'
  if (risk >= 55 || !agent.residencyOk) return 'degraded'
  const jitter = draw(agent.id, 'health')
  return jitter > 0.9 ? 'degraded' : 'healthy'
}

function deriveControlState(agent: DiscoveredAgent, risk: number): ControlState {
  // Highest-risk shadow agents land quarantined by default so operators have
  // something to release; the rest are active out of the gate.
  if (agent.approvalState === 'unregistered' && risk >= 70) return 'quarantined'
  if (agent.approvalState === 'pending') return 'paused'
  return 'active'
}

function deriveLifecycle(agent: DiscoveredAgent): LifecyclePosture {
  let stage: LifecycleStage
  let certifiedBy: string | null = null
  if (agent.approvalState === 'unregistered') stage = 'discovered'
  else if (agent.approvalState === 'pending') stage = 'certified'
  else {
    stage = 'production'
    certifiedBy = agent.owner === 'unknown' ? 'AI Governance Board' : agent.owner
  }
  // A couple of registered agents read as winding down for lifecycle realism.
  if (stage === 'production' && draw(agent.id, 'deprecate') > 0.82) stage = 'deprecated'

  // Review cadence: quarterly. Shadow/overdue agents surface as negative.
  const base = Math.round(draw(agent.id, 'review') * 120) - 30
  const reviewDueInDays =
    agent.approvalState === 'unregistered' ? Math.min(base, -1) : base
  return { stage, certifiedBy, reviewDueInDays }
}

function deriveGuardrails(agent: DiscoveredAgent): Record<GuardrailKey, boolean> {
  const registered = agent.approvalState === 'approved'
  const sensitive =
    agent.dataClassification === 'restricted' ||
    agent.dataClassification === 'confidential'
  return {
    humanInLoop: registered && sensitive,
    piiRedaction: registered && sensitive,
    toolAllowlist: agent.protocol !== 'none' && registered,
    outputFilter: registered,
    rateLimit: registered || agent.approvalState === 'pending',
    auditLogging: agent.manifestComplete,
  }
}

function deriveRuntime(agent: DiscoveredAgent, health: HealthStatus): RuntimeMetrics {
  const busy = draw(agent.id, 'busy')
  const invocations24h =
    agent.approvalState === 'approved'
      ? Math.round(400 + busy * 5200)
      : Math.round(20 + busy * 600)
  const errorRate =
    health === 'down' ? 0.18 + draw(agent.id, 'err') * 0.12
      : health === 'degraded' ? 0.04 + draw(agent.id, 'err') * 0.05
      : 0.002 + draw(agent.id, 'err') * 0.015
  const successRate = 1 - errorRate
  const avgLatencyMs = Math.round(
    (health === 'down' ? 2200 : health === 'degraded' ? 1100 : 380) +
      draw(agent.id, 'lat') * 600,
  )
  const costUsd30d = Math.round(
    (invocations24h * 30 * (0.0008 + draw(agent.id, 'cost') * 0.004)) * 100,
  ) / 100
  const actionsAutomated30d = Math.round(invocations24h * 30 * (0.4 + draw(agent.id, 'auto') * 0.5))
  const lastActiveMinsAgo =
    agent.approvalState === 'approved'
      ? Math.round(draw(agent.id, 'seen') * 45)
      : Math.round(draw(agent.id, 'seen') * 4000)
  return {
    health,
    invocations24h,
    successRate,
    avgLatencyMs,
    errorRate,
    costUsd30d,
    actionsAutomated30d,
    lastActiveMinsAgo,
  }
}

function deriveGovernance(agent: DiscoveredAgent, risk: number): GovernancePosture {
  const openIncidents =
    risk >= 70 ? 2 + Math.round(draw(agent.id, 'inc') * 2)
      : risk >= 45 ? Math.round(draw(agent.id, 'inc') * 2)
      : 0
  const policyViolations30d =
    agent.approvalState === 'unregistered'
      ? 3 + Math.round(draw(agent.id, 'viol') * 6)
      : agent.manifestComplete ? Math.round(draw(agent.id, 'viol') * 1.4)
      : 1 + Math.round(draw(agent.id, 'viol') * 3)
  return {
    riskScore: risk,
    openIncidents,
    policyViolations30d,
    guardrails: deriveGuardrails(agent),
  }
}

/** Enrich one discovered agent into a full control record. */
export function deriveControlRecord(agent: DiscoveredAgent): AgentControlRecord {
  const risk = riskScore(agent)
  const health = deriveHealth(agent, risk)
  return {
    ...agent,
    controlState: deriveControlState(agent, risk),
    runtime: deriveRuntime(agent, health),
    governance: deriveGovernance(agent, risk),
    lifecycle: deriveLifecycle(agent),
  }
}

/** Enrich the whole inventory. */
export function buildControlRecords(agents: DiscoveredAgent[]): AgentControlRecord[] {
  return agents.map(deriveControlRecord)
}
