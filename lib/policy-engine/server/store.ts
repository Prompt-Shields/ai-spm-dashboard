// Server-side policy + violation store. Today the UI stores instances in
// in-memory server store. For the Promptly PEP integration
// we need a backend that survives across browser sessions and serves
// every connected device.
//
// MVP: in-process Map seeded with fixture instances so Promptly has
// something to consume during integration. Replace with a real DB (Supabase,
// Neon, etc.) once tenant + auth wiring lands.

import type { PolicyInstance, PolicyViolation, ActionType, Severity } from "../../policy-templates/types"
import { POLICY_TEMPLATES } from "../../policy-templates/templates"
import { AUTO_DEMOTE_DEFAULTS } from "../promotion"
import { classOf } from "../../policy-templates/types"
import { aiSpmAssets } from "../../mock-data"

// Lifecycle defaults shared by all seeded fixtures so they satisfy the
// extended PolicyInstance shape (promotionHistory + autoDemote + rolloutStrategy).
// These fixtures simulate already-promoted Strict policies, so we record
// a single "system-seeded" promotion event.
const SEED_LIFECYCLE = {
  promotionHistory: [
    {
      from: "guideline" as const,
      to: "strict" as const,
      at: "2026-04-23T00:00:00Z",
      by: "system",
      reason: "Seed fixture"
    }
  ],
  autoDemote: { ...AUTO_DEMOTE_DEFAULTS },
  rolloutStrategy: "all" as const
}

// ─── In-memory stores ───────────────────────────────────────────────────

const instances: Map<string, PolicyInstance> = new Map()
const violations: PolicyViolation[] = []

// Per-instance watchdog state. Tracks when an instance's FP rate FIRST
// crossed the auto-demote threshold; used to enforce the grace period.
// Cleared whenever the rate drops back below the threshold.
interface WatchdogState {
  firstDetectedAt: string // ISO timestamp
  lastObservedFpRate: number
  graceUntil: string // ISO timestamp when grace period ends
}
const watchdogState: Map<string, WatchdogState> = new Map()

let seeded = false

function seedFixtures(): void {
  if (seeded) return
  seeded = true

  // PII redaction policy — applies to all monitored AI tools by default
  // so Promptly has at least one rule to enforce out of the box.
  const piiTemplate = POLICY_TEMPLATES.find((t) => t.id === "owasp-llm02-pii-input")
  if (piiTemplate) {
    instances.set("seed-pii-redact", {
      id: "seed-pii-redact",
      name: "Redact PII in AI prompts",
      templateId: piiTemplate.id,
      templateVersion: piiTemplate.version,
      parameterValues: {
        pii_confidence: 0.7,
        redact_categories: ["EMAIL", "PHONE", "PERSON", "NATIONAL_ID", "CREDIT_CARD"]
      },
      enforcementMode: "redact",
      severity: "high",
      appliesTo: {
        applicationIds: [], // empty = all monitored apps
        dataClassifications: ["pii"],
        riskTiers: ["high", "medium"],
        departments: []
      },
      allowList: [],
      reviewers: [],
      notifications: {},
      status: "active",
      createdBy: "system",
      createdAt: "2026-04-23T00:00:00Z",
      updatedAt: "2026-04-23T00:00:00Z",
      ...SEED_LIFECYCLE
    })
  }

  // Prompt injection block — blocks before the LLM call.
  const injectionTemplate = POLICY_TEMPLATES.find(
    (t) => t.id === "owasp-llm01-prompt-injection"
  )
  if (injectionTemplate) {
    instances.set("seed-injection-block", {
      id: "seed-injection-block",
      name: "Block prompt-injection attempts",
      templateId: injectionTemplate.id,
      templateVersion: injectionTemplate.version,
      parameterValues: {
        jailbreak_patterns: [
          "ignore (all|previous) instructions",
          "you are (now )?DAN",
          "developer mode",
          "reveal your (system )?prompt"
        ],
        override_keywords: ["disregard", "system prompt", "you are now"],
        classifier_threshold: 0.8
      },
      enforcementMode: "block",
      severity: "critical",
      appliesTo: {
        applicationIds: [],
        dataClassifications: [],
        riskTiers: [],
        departments: []
      },
      allowList: [],
      reviewers: [],
      notifications: {},
      status: "active",
      createdBy: "system",
      createdAt: "2026-04-23T00:00:00Z",
      updatedAt: "2026-04-23T00:00:00Z",
      ...SEED_LIFECYCLE
    })
  }

  // Secrets scanner — flag (don't block) so QA can verify reporting works.
  const secretsTemplate = POLICY_TEMPLATES.find((t) => t.id.includes("secrets"))
  if (secretsTemplate) {
    instances.set("seed-secrets-flag", {
      id: "seed-secrets-flag",
      name: "Flag credentials in prompts",
      templateId: secretsTemplate.id,
      templateVersion: secretsTemplate.version,
      parameterValues: {},
      enforcementMode: "flag",
      severity: "high",
      appliesTo: {
        applicationIds: [],
        dataClassifications: ["secrets"],
        riskTiers: ["high"],
        departments: []
      },
      allowList: [],
      reviewers: [],
      notifications: {},
      status: "active",
      createdBy: "system",
      createdAt: "2026-04-23T00:00:00Z",
      updatedAt: "2026-04-23T00:00:00Z",
      ...SEED_LIFECYCLE
    })
  }
}

// ─── Public API ─────────────────────────────────────────────────────────

export function listActiveInstances(): PolicyInstance[] {
  seedFixtures()
  return Array.from(instances.values()).filter((i) => i.status === "active")
}

/** All instances regardless of status — used by the admin UI. */
export function listAllInstances(): PolicyInstance[] {
  seedFixtures()
  return Array.from(instances.values())
}

export function getInstanceById(id: string): PolicyInstance | undefined {
  seedFixtures()
  return instances.get(id)
}

export function upsertInstance(instance: PolicyInstance): PolicyInstance {
  seedFixtures()
  instances.set(instance.id, instance)
  return instance
}

export function deleteInstanceById(id: string): boolean {
  seedFixtures()
  return instances.delete(id)
}

export function getReferencedTemplates(active: PolicyInstance[]) {
  const ids = new Set(active.map((i) => i.templateId))
  return POLICY_TEMPLATES.filter((t) => ids.has(t.id))
}

export function recordViolation(v: PolicyViolation): void {
  // Cap the in-memory ring so a misbehaving PEP can't OOM the server.
  if (violations.length > 5000) violations.shift()
  violations.push(v)
}

export function listViolations(limit = 100): PolicyViolation[] {
  return violations.slice(-limit).reverse()
}

export function violationCount(): number {
  return violations.length
}

// ─── Synthetic stats for demo (replace with real telemetry) ─────────────
//
// Until the violation feed produces enough data, we synthesise plausible
// stats so the UI renders meaningfully on a fresh boot.

// ─── Watchdog state API ─────────────────────────────────────────────────

export function getWatchdogState(instanceId: string): WatchdogState | undefined {
  return watchdogState.get(instanceId)
}

export function setWatchdogState(instanceId: string, state: WatchdogState): void {
  watchdogState.set(instanceId, state)
}

export function clearWatchdogState(instanceId: string): void {
  watchdogState.delete(instanceId)
}

export function listAllWatchdogStates(): Array<{
  instanceId: string
  state: WatchdogState
}> {
  return Array.from(watchdogState.entries()).map(([instanceId, state]) => ({
    instanceId,
    state
  }))
}

export function ensureDemoStats(): void {
  seedFixtures()
  for (const instance of instances.values()) {
    if (instance.stats) continue
    instance.stats = {
      totalEvaluations30d: Math.floor(20000 + Math.random() * 80000),
      totalHits30d: Math.floor(50 + Math.random() * 400),
      blockCount30d: Math.floor(40 + Math.random() * 200),
      flagCount30d: Math.floor(10 + Math.random() * 100),
      lastTriggeredAt: new Date(Date.now() - Math.random() * 86_400_000).toISOString(),
      falsePositives30d: Math.floor(Math.random() * 8),
      falsePositiveRate: Math.random() * 0.04 // 0–4%
    }
  }
}

// ─── Dashboard helpers (read-only views) ─────────────────────────────
//
// Deterministic, derived from instance.stats so the dashboard renders
// stably across requests. The recent-events feed is synthesised once at
// first call from a stable hash of (instance.id, day) so reloads don't
// reshuffle the timeline.

// djb2 string hash — stable across runs, lets us derive deterministic
// "random" values without Math.random.
function hashSeed(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

// Mulberry32 PRNG seeded by a 32-bit int. Same seed → same sequence.
function prng(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t = (t + 0x6d2b79f5) >>> 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

const ISO_DAY = 86_400_000

export interface DailyBucket {
  /** ISO date (YYYY-MM-DD) at UTC. */
  date: string
  blocks: number
  wouldBlock: number
}

/**
 * 30-day daily buckets aggregating estimated block + would-block events
 * across all active instances. Bars are distributed using a deterministic
 * weekday-weighted pattern from instance stats.
 */
export function getDailyBuckets(): DailyBucket[] {
  seedFixtures()
  ensureDemoStats()
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const buckets: DailyBucket[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today.getTime() - i * ISO_DAY)
    buckets.push({
      date: d.toISOString().slice(0, 10),
      blocks: 0,
      wouldBlock: 0
    })
  }
  for (const instance of instances.values()) {
    if (instance.status === "archived" || instance.status === "draft") continue
    const stats = instance.stats
    if (!stats) continue
    const cls = classOf(instance.enforcementMode)
    const rng = prng(hashSeed(instance.id))
    // Weekday weights — weekends quieter.
    const weights = buckets.map((b) => {
      const day = new Date(b.date + "T00:00:00Z").getUTCDay()
      const base = day === 0 || day === 6 ? 0.5 : 1
      return base * (0.7 + rng() * 0.6) // jitter ±30%
    })
    const sum = weights.reduce((a, b) => a + b, 0)
    const target = cls === "strict" ? stats.blockCount30d : stats.flagCount30d
    buckets.forEach((b, idx) => {
      const share = Math.round((weights[idx] / sum) * target)
      if (cls === "strict") b.blocks += share
      else b.wouldBlock += share
    })
  }
  return buckets
}

interface RecentEvent extends PolicyViolation {
  /** Joined for display — instance name (so the row doesn't have to re-lookup). */
  policyName: string
  /** Joined for display — application label (modelName). */
  applicationName: string
}

let recentEventsCache: RecentEvent[] | null = null

/**
 * Returns the most recent N synthesised events for the events feed.
 * Generated once on first call (deterministic, stable across requests).
 */
export function getRecentEvents(limit = 10): RecentEvent[] {
  if (!recentEventsCache) recentEventsCache = buildRecentEvents()
  return recentEventsCache.slice(0, limit)
}

function buildRecentEvents(): RecentEvent[] {
  seedFixtures()
  ensureDemoStats()
  const out: RecentEvent[] = []
  const now = Date.now()
  const sevPool: Severity[] = ["critical", "high", "medium", "low"]
  for (const instance of instances.values()) {
    if (instance.status !== "active") continue
    const rng = prng(hashSeed(instance.id + "-events"))
    const count = 8 + Math.floor(rng() * 8) // 8–15 per instance
    const cls = classOf(instance.enforcementMode)
    for (let i = 0; i < count; i++) {
      const minutesAgo = Math.floor(rng() * 60 * 36) // last 36h
      const asset = aiSpmAssets[Math.floor(rng() * aiSpmAssets.length)]
      const action: ActionType =
        cls === "strict"
          ? rng() < 0.85
            ? "block"
            : "allow"
          : rng() < 0.7
            ? "flag"
            : "allow"
      const sevIdx = Math.floor(rng() * sevPool.length)
      out.push({
        id: `${instance.id}-evt-${i}`,
        policyInstanceId: instance.id,
        applicationId: asset.assetId,
        timestamp: new Date(now - minutesAgo * 60_000).toISOString(),
        actionTaken: action,
        severity: sevPool[Math.min(sevIdx, sevPool.length - 1)],
        detectorId: "synthetic",
        promptHash: `synthetic-${instance.id}-${i}`,
        evidence: { detectorOutput: "[synthesised demo event]" },
        reviewed: false,
        policyName: instance.name,
        applicationName: asset.modelName
      })
    }
  }
  // Newest first.
  out.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
  return out
}

export interface TopPolicy {
  instance: PolicyInstance
  hits: number
}
export function getTopPoliciesByHits(n = 5): TopPolicy[] {
  seedFixtures()
  ensureDemoStats()
  return Array.from(instances.values())
    .filter((i) => i.status === "active")
    .map((i) => ({ instance: i, hits: i.stats?.totalHits30d ?? 0 }))
    .sort((a, b) => b.hits - a.hits)
    .slice(0, n)
}

export interface TopApp {
  applicationId: string
  applicationName: string
  hits: number
  topPolicyName: string
}
/**
 * Top-N applications by hit count, computed from the synthesised events
 * feed. Tie-broken by applicationId to keep the ordering stable.
 */
export function getTopAppsByHits(n = 5): TopApp[] {
  const events = getRecentEvents(Number.MAX_SAFE_INTEGER)
  const byApp = new Map<
    string,
    { applicationId: string; applicationName: string; hits: number; perPolicy: Map<string, number> }
  >()
  for (const e of events) {
    let row = byApp.get(e.applicationId)
    if (!row) {
      row = {
        applicationId: e.applicationId,
        applicationName: e.applicationName,
        hits: 0,
        perPolicy: new Map()
      }
      byApp.set(e.applicationId, row)
    }
    row.hits += 1
    row.perPolicy.set(e.policyName, (row.perPolicy.get(e.policyName) ?? 0) + 1)
  }
  return Array.from(byApp.values())
    .sort((a, b) => b.hits - a.hits || a.applicationId.localeCompare(b.applicationId))
    .slice(0, n)
    .map((r) => ({
      applicationId: r.applicationId,
      applicationName: r.applicationName,
      hits: r.hits,
      topPolicyName:
        Array.from(r.perPolicy.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ""
    }))
}

/**
 * Coverage % = monitored applications under at least one active policy.
 * A policy with `applicationIds: []` is treated as covering ALL apps.
 */
export function getCoveragePercent(): number {
  seedFixtures()
  const total = aiSpmAssets.length
  if (total === 0) return 0
  const active = Array.from(instances.values()).filter((i) => i.status === "active")
  if (active.some((i) => i.appliesTo.applicationIds.length === 0)) return 100
  const covered = new Set<string>()
  for (const i of active) for (const id of i.appliesTo.applicationIds) covered.add(id)
  return Math.round((covered.size / total) * 100)
}

/** Snapshot used by the KPI strip. All numbers come from active instances. */
export interface DashboardSnapshot {
  strictCount: number
  guidelineCount: number
  coveragePercent: number
  totalBlocks30d: number
  blocksTrendPercent: number // % change vs prior 30d, +/- (heuristic)
  promotionsReady: number
}
export function getDashboardSnapshot(): DashboardSnapshot {
  seedFixtures()
  ensureDemoStats()
  const active = Array.from(instances.values()).filter((i) => i.status === "active")
  const strict = active.filter((i) => classOf(i.enforcementMode) === "strict")
  const guideline = active.filter((i) => classOf(i.enforcementMode) === "guideline")
  const totalBlocks30d = strict.reduce((s, i) => s + (i.stats?.blockCount30d ?? 0), 0)
  // Heuristic prior-30d trend: stable deterministic perturbation from the seed.
  const rng = prng(hashSeed("blocks-trend"))
  const blocksTrendPercent = Math.round((rng() * 30 - 12) * 10) / 10 // roughly −12% .. +18%
  return {
    strictCount: strict.length,
    guidelineCount: guideline.length,
    coveragePercent: getCoveragePercent(),
    totalBlocks30d,
    blocksTrendPercent,
    promotionsReady: 0 // filled in by the page after running eligibility checks
  }
}
