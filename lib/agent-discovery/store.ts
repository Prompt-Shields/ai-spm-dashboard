// lib/agent-discovery/store.ts
import type { Risk, UseCase } from '@/lib/aimaps-types'
import type { DiscoveredAgent } from './types'

const KEY = 'aispm.agentDiscovery.v1'

export interface RunSummary {
  shadowCount: number
  total: number
  ranAtIso: string
}

interface StoreShape {
  runSummary: RunSummary | null
  registered: UseCase[]
}

function read(): StoreShape {
  if (typeof window === 'undefined') return { runSummary: null, registered: [] }
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return { runSummary: null, registered: [] }
    const parsed = JSON.parse(raw) as Partial<StoreShape>
    return { runSummary: parsed.runSummary ?? null, registered: parsed.registered ?? [] }
  } catch {
    return { runSummary: null, registered: [] }
  }
}

function write(next: StoreShape): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* localStorage may be unavailable (e.g. third-party-cookie blocked) */
  }
}

export function getRunSummary(): RunSummary | null {
  return read().runSummary
}

export function saveRunSummary(summary: RunSummary): void {
  write({ ...read(), runSummary: summary })
}

/** Pure: map one shadow agent to a discovered UseCase. Timestamp injected for determinism. */
export function shadowAgentToUseCase(agent: DiscoveredAgent, nowIso: string): UseCase {
  const risk: Risk = {
    id: `risk-shadow-${agent.id}`,
    name: 'Unregistered shadow agent',
    category: 'shadow-ai',
    severity: 'high',
    mitigations: [],
  }
  return {
    id: `uc-${agent.id}`,
    name: agent.name,
    description: agent.purpose,
    department: agent.owner === 'unknown' ? 'Unassigned' : agent.owner,
    models: [],
    ownerId: null,
    dataClassification: agent.dataClassification,
    risks: [risk],
    mitigations: [],
    complianceStatus: { euAiAct: 'gap', nistAiRmf: 'gap', owaspLlm: 'gap', iso42001: 'gap' },
    discoveryMethod: 'auto-detect',
    status: 'discovered',
    createdAt: nowIso,
    lastReviewedAt: nowIso,
  }
}

/** Persist N shadow agents as discovered use cases + refresh the run summary. Returns count added. */
export function sendShadowAgentsToRegister(agents: DiscoveredAgent[], total: number, nowIso: string): number {
  const shadow = agents.filter(a => a.approvalState === 'unregistered')
  const store = read()
  const existingIds = new Set(store.registered.map(u => u.id))
  const additions = shadow
    .map(a => shadowAgentToUseCase(a, nowIso))
    .filter(u => !existingIds.has(u.id))
  write({
    runSummary: { shadowCount: shadow.length, total, ranAtIso: nowIso },
    registered: [...store.registered, ...additions],
  })
  return additions.length
}
