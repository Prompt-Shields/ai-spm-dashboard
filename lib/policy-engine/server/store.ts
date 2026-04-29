// Server-side policy + violation store. Today the UI stores instances in
// localStorage (see ../instance-store.ts). For the Promptly PEP integration
// we need a backend that survives across browser sessions and serves
// every connected device.
//
// MVP: in-process Map seeded with fixture instances so Promptly has
// something to consume during integration. Replace with a real DB (Supabase,
// Neon, etc.) once tenant + auth wiring lands.

import type { PolicyInstance, PolicyViolation } from "../../policy-templates/types"
import { POLICY_TEMPLATES } from "../../policy-templates/templates"
import { AUTO_DEMOTE_DEFAULTS } from "../promotion"

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
