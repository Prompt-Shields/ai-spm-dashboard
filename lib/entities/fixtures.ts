// Demo fixtures. Seeded into the in-memory stores on first read so a
// cold boot of the dashboard renders something meaningful without
// requiring the macOS Promptly app or any manual data entry.
//
// Picked to mirror the ardoq-import/*.csv samples — same names, same
// IDs — so the Ardoq exporter output round-trips against the reference
// CSVs once it lands.
//
// Fixtures are tagged with `demo-fixture` so an admin can bulk-delete
// them when they're ready to enter real data.

import { applicationsStore } from "./applications-store"
import { dataStoresStore } from "./data-stores-store"
import { organizationalUnitsStore } from "./organizational-units-store"
import { personsStore } from "./persons-store"
import { referencesStore } from "./references-store"
import { technicalCapabilitiesStore } from "./technical-capabilities-store"
import { technologyProductsStore } from "./technology-products-store"
import { technologyServicesStore } from "./technology-services-store"
import { complianceAssessmentsStore } from "./compliance-assessments-store"
import { upsertUsageEvent } from "./usage-events-store"
import { upsertTourEngagement } from "./tour-engagement-store"
import { recordViolation } from "../policy-engine/server/store"
import { DEFAULT_TENANT_ID, nowIso } from "./types"

let seeded = false

export function ensureFixturesSeeded(): void {
  if (seeded) return
  seeded = true

  const t = DEFAULT_TENANT_ID
  const now = nowIso()

  // ─── Technical Capabilities — REQUIRED ROOT for Ardoq AI Lens ─────
  const capabilities = [
    { id: "cap-ai", level1: "Artificial Intelligence", description: "Root capability for AI Lens detection", tags: ["ai-root"] },
    { id: "cap-llm", level1: "Artificial Intelligence", level2: "LLM", description: "Large language models", tags: ["ai", "llm"] },
    { id: "cap-vision", level1: "Artificial Intelligence", level2: "Computer Vision", description: "Image / video analysis", tags: ["ai", "vision"] },
    { id: "cap-speech", level1: "Artificial Intelligence", level2: "Speech", description: "Speech recognition + synthesis", tags: ["ai", "speech"] },
    { id: "cap-imagegen", level1: "Artificial Intelligence", level2: "Image Generation", description: "Text-to-image and image-to-image", tags: ["ai", "imagegen"] }
  ]
  for (const c of capabilities) technicalCapabilitiesStore.upsert({ ...c, tenantId: t, createdAt: now, updatedAt: now })

  // ─── Organizational Units ─────────────────────────────────────────
  const orgs = [
    { id: "org-legal", componentName: "Legal", description: "Legal department", tags: ["dept", "demo-fixture"] },
    { id: "org-it", componentName: "IT", description: "Information Technology", tags: ["dept", "demo-fixture"] },
    { id: "org-customer-ops", componentName: "Customer Operations", description: "Customer-facing operations", tags: ["dept", "demo-fixture"] },
    { id: "org-claims", componentName: "Claims Department", description: "Claims processing", tags: ["dept", "demo-fixture"] }
  ]
  for (const o of orgs) {
    organizationalUnitsStore.upsert({ ...o, tenantId: t, createdAt: now, updatedAt: now })
  }

  // ─── Persons ──────────────────────────────────────────────────────
  const persons = [
    {
      id: "person-sarah-chen", componentName: "Sarah Chen",
      description: "Senior Counsel in the Legal department. Owns 5 AI use cases including Contract Review AI.",
      email: "sarah.chen@company.com", role: "Senior Counsel",
      organizationalUnitId: "org-legal", tags: ["legal", "ai-owner", "demo-fixture"]
    },
    {
      id: "person-james-okafor", componentName: "James Okafor",
      description: "Engineering Lead in IT. Owns Code Assistant and Security Log Analyser.",
      email: "james.okafor@company.com", role: "Engineering Lead",
      organizationalUnitId: "org-it", tags: ["it", "ai-owner", "demo-fixture"]
    },
    {
      id: "person-mei-zhang", componentName: "Mei Zhang",
      description: "Customer Support Manager. Owns AI Chat Assistant.",
      email: "mei.zhang@company.com", role: "Customer Support Manager",
      organizationalUnitId: "org-customer-ops", tags: ["customer-ops", "ai-owner", "demo-fixture"]
    }
  ]
  for (const p of persons) {
    personsStore.upsert({ ...p, tenantId: t, createdAt: now, updatedAt: now })
  }

  // ─── Technology Products (AI models catalog) ──────────────────────
  const products = [
    {
      id: "tp-gpt4o", componentName: "GPT-4o",
      description: "OpenAI flagship LLM with strong reasoning.",
      provider: "OpenAI", version: "1.0", modelCategory: "LLM" as const,
      parameters: "1.8 trillion", lifecycleStatus: "Production" as const,
      inputCostPerMTokens: "$2.50", outputCostPerMTokens: "$10.00",
      contextWindow: "128K tokens", estimatedMonthlySpendNOK: 45_000,
      promptlyAppIds: ["chatgpt"], tags: ["ai-model", "llm", "openai", "demo-fixture"]
    },
    {
      id: "tp-claude-35-sonnet", componentName: "Claude 3.5 Sonnet",
      description: "Anthropic LLM optimised for legal/long-document tasks.",
      provider: "Anthropic", version: "3.5", modelCategory: "LLM" as const,
      parameters: "Unknown", lifecycleStatus: "Production" as const,
      inputCostPerMTokens: "$3.00", outputCostPerMTokens: "$15.00",
      contextWindow: "200K tokens", estimatedMonthlySpendNOK: 22_000,
      promptlyAppIds: ["claude"], tags: ["ai-model", "llm", "anthropic", "demo-fixture"]
    },
    {
      id: "tp-gemini-15-pro", componentName: "Gemini 1.5 Pro",
      description: "Google long-context multimodal LLM.",
      provider: "Google", version: "1.5 Pro", modelCategory: "LLM" as const,
      parameters: "Unknown", lifecycleStatus: "Production" as const,
      inputCostPerMTokens: "$1.25", outputCostPerMTokens: "$5.00",
      contextWindow: "2M tokens", estimatedMonthlySpendNOK: 8_000,
      promptlyAppIds: ["gemini"], tags: ["ai-model", "llm", "google", "demo-fixture"]
    },
    {
      id: "tp-copilot-365", componentName: "Microsoft 365 Copilot",
      description: "Microsoft enterprise LLM integrated across Office.",
      provider: "Microsoft", version: "1.0", modelCategory: "LLM" as const,
      parameters: "Unknown", lifecycleStatus: "Production" as const,
      contextWindow: "128K tokens", estimatedMonthlySpendNOK: 30_000,
      promptlyAppIds: ["copilot"], tags: ["ai-model", "llm", "microsoft", "demo-fixture"]
    }
  ]
  for (const pr of products) {
    technologyProductsStore.upsert({ ...pr, tenantId: t, createdAt: now, updatedAt: now })
  }

  // ─── Technology Services (cloud infra) ────────────────────────────
  const services = [
    {
      id: "svc-azure-openai", componentName: "Azure OpenAI Service",
      description: "Azure-hosted access to OpenAI models with enterprise data agreements.",
      provider: "Microsoft Azure", serviceType: "AI Platform" as const,
      region: "Norway East", status: "Active" as const, uptimePct: 99.95,
      costPerMonthNOK: 80_000, securityCertifications: ["SOC2", "ISO27001", "HIPAA"],
      networkIsolation: "Private Endpoint", scalingPolicy: "Auto-scaling on token throughput",
      backupStrategy: "Geo-redundant", tags: ["cloud", "azure", "demo-fixture"]
    },
    {
      id: "svc-aws-bedrock", componentName: "AWS Bedrock",
      description: "Managed foundation model service on AWS.",
      provider: "Amazon Web Services", serviceType: "AI Platform" as const,
      region: "eu-north-1", status: "Active" as const, uptimePct: 99.9,
      costPerMonthNOK: 25_000, securityCertifications: ["SOC2", "ISO27001"],
      networkIsolation: "VPC Endpoint", tags: ["cloud", "aws", "demo-fixture"]
    }
  ]
  for (const s of services) {
    technologyServicesStore.upsert({ ...s, tenantId: t, createdAt: now, updatedAt: now })
  }

  // ─── Data Stores ──────────────────────────────────────────────────
  const stores = [
    {
      id: "ds-crm", componentName: "Customer CRM Database",
      description: "Customer relationship management system with 2.4M customer profiles.",
      storeType: "Relational Database" as const, dataClassification: "confidential" as const,
      location: "Azure Norway East", recordCount: "2.4M customers",
      refreshFrequency: "Real-time", retentionPeriod: "7 years",
      encryption: "AES-256 at rest; TLS 1.3 in transit", accessControls: "RBAC with MFA",
      gdprCompliant: true, dataOwnerId: "person-mei-zhang", lastAudit: "2024-10-15",
      tags: ["data-store", "crm", "confidential", "demo-fixture"]
    },
    {
      id: "ds-claims", componentName: "Claims Processing System",
      description: "Central claims processing database with 8.7M active and historical claim records.",
      storeType: "Document Store" as const, dataClassification: "restricted" as const,
      location: "Azure Norway East", recordCount: "8.7M claims",
      refreshFrequency: "Real-time", retentionPeriod: "10 years",
      encryption: "AES-256 at rest; TLS 1.3 in transit", accessControls: "RBAC with MFA + IP whitelist",
      gdprCompliant: true, lastAudit: "2024-11-01",
      tags: ["data-store", "claims", "restricted", "demo-fixture"]
    }
  ]
  for (const ds of stores) {
    dataStoresStore.upsert({ ...ds, tenantId: t, createdAt: now, updatedAt: now })
  }

  // ─── Applications (AI use cases) ──────────────────────────────────
  const apps = [
    {
      id: "app-contract-review", componentName: "Contract Review AI",
      description: "Uses GPT-4o to review and summarise legal contracts, flagging unusual clauses for legal counsel review.",
      organizationalUnitId: "org-legal", ownerPersonId: "person-sarah-chen",
      dataClassification: "confidential" as const, deploymentStatus: "Active" as const,
      riskScore: 70, autoDiscovered: false,
      tags: ["ai-system", "legal", "gpt-4o", "assessed", "demo-fixture"]
    },
    {
      id: "app-legal-brief", componentName: "Legal Brief Summariser",
      description: "Summarises lengthy legal briefs and case documents using Claude 3.5 Sonnet.",
      organizationalUnitId: "org-legal", ownerPersonId: "person-sarah-chen",
      dataClassification: "confidential" as const, deploymentStatus: "Active" as const,
      riskScore: 55, autoDiscovered: false,
      tags: ["ai-system", "legal", "claude", "owned", "demo-fixture"]
    },
    {
      id: "app-code-assistant", componentName: "Code Assistant",
      description: "GitHub Copilot deployed across the engineering org to accelerate coding tasks.",
      organizationalUnitId: "org-it", ownerPersonId: "person-james-okafor",
      dataClassification: "internal" as const, deploymentStatus: "Active" as const,
      riskScore: 35, autoDiscovered: false,
      tags: ["ai-system", "engineering", "copilot", "demo-fixture"]
    },
    {
      id: "app-customer-chat", componentName: "AI Chat Assistant",
      description: "Customer-facing chat assistant on the support portal.",
      organizationalUnitId: "org-customer-ops", ownerPersonId: "person-mei-zhang",
      dataClassification: "internal" as const, deploymentStatus: "Active" as const,
      riskScore: 60, autoDiscovered: false,
      tags: ["ai-system", "customer-ops", "demo-fixture"]
    },
    {
      id: "app-shadow-claude-james", componentName: "Claude (used by James Okafor)",
      description: "Auto-discovered: James was observed pasting internal code into Claude.ai with no policy ownership assigned.",
      organizationalUnitId: "org-it", ownerPersonId: "person-james-okafor",
      deploymentStatus: "Shadow" as const,
      riskScore: 80, autoDiscovered: true, autoDiscoveredFromAppId: "claude",
      tags: ["ai-system", "shadow-ai", "claude", "auto-discovered", "demo-fixture"]
    }
  ]
  for (const a of apps) {
    applicationsStore.upsert({ ...a, tenantId: t, createdAt: now, updatedAt: now })
  }

  // ─── Compliance Assessments ───────────────────────────────────────
  const assessments = [
    {
      id: "ca-contract-review-euai", componentName: "Contract Review AI - EU AI Act",
      description: "EU AI Act compliance assessment for Contract Review AI.",
      assessmentType: "EU AI Act" as const,
      subjectApplicationId: "app-contract-review", pass: false,
      rationale: "Partial compliance — data leakage risk mitigation pending. Art. 9 requirements not fully met.",
      reviewDate: "2026-03-15", approvalStatus: "Under Review" as const,
      approvedByPersonId: "person-sarah-chen", euAIActRiskLevel: "Limited Risk" as const,
      tags: ["compliance", "eu-ai-act", "partial", "demo-fixture"]
    },
    {
      id: "ca-code-assistant-euai", componentName: "Code Assistant - EU AI Act",
      description: "EU AI Act compliance assessment for Code Assistant.",
      assessmentType: "EU AI Act" as const,
      subjectApplicationId: "app-code-assistant", pass: true,
      rationale: "Covered — enterprise licence with no-train clause applied. IP exposure mitigated.",
      reviewDate: "2026-03-17", approvalStatus: "Approved" as const,
      approvedByPersonId: "person-james-okafor", euAIActRiskLevel: "Limited Risk" as const,
      tags: ["compliance", "eu-ai-act", "covered", "demo-fixture"]
    }
  ]
  for (const a of assessments) {
    complianceAssessmentsStore.upsert({ ...a, tenantId: t, createdAt: now, updatedAt: now })
  }

  // ─── References (sample edges) ────────────────────────────────────
  const references = [
    { id: "ref-cap-llm-tp-gpt4o", sourceId: "cap-llm", targetId: "tp-gpt4o", type: "Is Realized By" as const, description: "GPT-4o realises LLM capability", autoDerived: true },
    { id: "ref-cap-llm-tp-claude", sourceId: "cap-llm", targetId: "tp-claude-35-sonnet", type: "Is Realized By" as const, description: "Claude 3.5 Sonnet realises LLM capability", autoDerived: true },
    { id: "ref-cap-llm-tp-gemini", sourceId: "cap-llm", targetId: "tp-gemini-15-pro", type: "Is Realized By" as const, description: "Gemini 1.5 Pro realises LLM capability", autoDerived: true },
    { id: "ref-cap-llm-tp-copilot", sourceId: "cap-llm", targetId: "tp-copilot-365", type: "Is Realized By" as const, description: "M365 Copilot realises LLM capability", autoDerived: true },
    { id: "ref-app-contract-deploys-gpt4o", sourceId: "app-contract-review", targetId: "tp-gpt4o", type: "Deploys" as const, description: "Contract Review AI deploys GPT-4o", autoDerived: false },
    { id: "ref-app-legal-brief-deploys-claude", sourceId: "app-legal-brief", targetId: "tp-claude-35-sonnet", type: "Deploys" as const, description: "Legal Brief Summariser deploys Claude 3.5", autoDerived: false },
    { id: "ref-sarah-owns-contract", sourceId: "person-sarah-chen", targetId: "app-contract-review", type: "Is Owner Of" as const, description: "Sarah Chen owns Contract Review AI", autoDerived: false },
    { id: "ref-james-owns-code", sourceId: "person-james-okafor", targetId: "app-code-assistant", type: "Is Owner Of" as const, description: "James Okafor owns Code Assistant", autoDerived: false },
    { id: "ref-sarah-belongs-legal", sourceId: "person-sarah-chen", targetId: "org-legal", type: "Belongs To" as const, description: "Sarah belongs to Legal", autoDerived: true },
    { id: "ref-james-belongs-it", sourceId: "person-james-okafor", targetId: "org-it", type: "Belongs To" as const, description: "James belongs to IT", autoDerived: true },
    { id: "ref-app-contract-reads-crm", sourceId: "app-contract-review", targetId: "ds-crm", type: "Reads From" as const, description: "Contract Review AI reads from CRM", autoDerived: false },
    { id: "ref-app-contract-runs-azureopenai", sourceId: "app-contract-review", targetId: "svc-azure-openai", type: "Runs On" as const, description: "Contract Review AI runs on Azure OpenAI", autoDerived: false },
    { id: "ref-james-observed-claude", sourceId: "person-james-okafor", targetId: "app-shadow-claude-james", type: "Observed Use" as const, description: "Promptly observed James using Claude", autoDerived: true }
  ]
  for (const r of references) {
    referencesStore.upsert({ ...r, tenantId: t, createdAt: now, updatedAt: now })
  }

  // ─── Adoption: usage events (last 30 days) ────────────────────────
  // Five apps, four users, realistic daily prompt volumes with some
  // blocked/redacted/flagged counts mixed in.
  const APPS: Array<{
    id: string
    dailyBase: number
    blockRate: number
    redactRate: number
    flagRate: number
  }> = [
    { id: "chatgpt",    dailyBase: 420, blockRate: 0.01, redactRate: 0.03, flagRate: 0.05 },
    { id: "copilot",    dailyBase: 310, blockRate: 0.005, redactRate: 0.015, flagRate: 0.02 },
    { id: "claude",     dailyBase: 185, blockRate: 0.008, redactRate: 0.02, flagRate: 0.03 },
    { id: "gemini",     dailyBase:  90, blockRate: 0.012, redactRate: 0.025, flagRate: 0.04 },
    { id: "perplexity", dailyBase:  55, blockRate: 0.003, redactRate: 0.01, flagRate: 0.015 },
  ]
  const USERS = ["auth0|u-sarah", "auth0|u-james", "auth0|u-mei", "auth0|u-alex"]
  // Seeded with a simple deterministic pseudo-random to keep fixtures stable.
  let rng = 42
  function rand(): number {
    rng = (rng * 1664525 + 1013904223) & 0x7fffffff
    return rng / 0x7fffffff
  }
  const today = new Date()
  for (let d = 29; d >= 0; d--) {
    const date = new Date(today)
    date.setDate(today.getDate() - d)
    const day = date.toISOString().slice(0, 10)
    const dayTs = `${day}T09:00:00Z`
    for (const app of APPS) {
      // Not every user uses every app every day
      for (const sub of USERS) {
        if (rand() > 0.6) continue // ~40% chance of activity
        const prompts = Math.max(1, Math.round(app.dailyBase / USERS.length * (0.5 + rand())))
        upsertUsageEvent({
          tenantId: t,
          day,
          auth0Sub: sub,
          promptlyAppId: app.id,
          promptCount: prompts,
          blockedCount: Math.round(prompts * app.blockRate * rand() * 2),
          redactedCount: Math.round(prompts * app.redactRate * rand() * 2),
          flaggedCount: Math.round(prompts * app.flagRate * rand() * 2),
          firstSeen: dayTs,
          lastSeen: `${day}T18:${Math.floor(rand() * 59).toString().padStart(2, "0")}:00Z`,
        })
      }
    }
  }

  // ─── Adoption: policy violations (risk-by-app breakdown) ─────────
  const violationApps = ["chatgpt", "claude", "gemini", "copilot"]
  const actions = ["redact", "flag", "block", "log", "evaluated"] as const
  const actionWeights = [0.35, 0.30, 0.10, 0.15, 0.10]
  for (let d = 29; d >= 0; d--) {
    const date = new Date(today)
    date.setDate(today.getDate() - d)
    const day = date.toISOString().slice(0, 10)
    const violationsPerDay = Math.round(8 + rand() * 12)
    for (let v = 0; v < violationsPerDay; v++) {
      const appId = violationApps[Math.floor(rand() * violationApps.length)]
      const roll = rand()
      let cumulative = 0
      let action = actions[0]
      for (let a = 0; a < actions.length; a++) {
        cumulative += actionWeights[a]
        if (roll < cumulative) { action = actions[a]; break }
      }
      recordViolation({
        id: `fix-v-${d}-${v}-${appId}`,
        policyInstanceId: action === "block" ? "seed-injection-block"
          : action === "redact" ? "seed-pii-redact" : "seed-secrets-flag",
        applicationId: appId,
        timestamp: `${day}T${(9 + Math.floor(rand() * 9)).toString().padStart(2, "0")}:00:00Z`,
        actionTaken: action,
        severity: action === "block" ? "critical" : action === "redact" ? "high" : "medium",
        detectorId: action === "block" ? "injection-classifier" : "pii-detector",
        promptHash: `hash-${d}-${v}`,
        evidence: { detectorOutput: "fixture", confidence: 0.7 + rand() * 0.3 },
        reviewed: rand() > 0.7,
      })
    }
  }

  // ─── Adoption: tour engagement ─────────────────────────────────────
  const TOURS: Array<{
    id: string
    startBase: number
    completionRate: number
    avgDurationSec: number
  }> = [
    { id: "dashboard-intro",     startBase: 18, completionRate: 0.62, avgDurationSec: 145 },
    { id: "chat-intro",          startBase: 12, completionRate: 0.55, avgDurationSec: 90  },
    { id: "policy-compliance",   startBase:  7, completionRate: 0.40, avgDurationSec: 210 },
  ]
  for (let d = 29; d >= 0; d--) {
    const date = new Date(today)
    date.setDate(today.getDate() - d)
    const day = date.toISOString().slice(0, 10)
    const dayTs = `${day}T10:00:00Z`
    for (const tour of TOURS) {
      if (rand() > 0.7) continue // not every tour runs every day
      const starts = Math.max(1, Math.round(tour.startBase * (0.4 + rand() * 1.2)))
      const completions = Math.round(starts * tour.completionRate * (0.6 + rand() * 0.8))
      const dismissals = starts - completions
      upsertTourEngagement({
        tenantId: t,
        day,
        auth0Sub: null, // aggregate row — no per-user breakdown needed for demo
        tourId: tour.id,
        startCount: starts,
        completionCount: Math.min(completions, starts),
        dismissalCounts: dismissals > 0 ? {
          skip_button: Math.round(dismissals * 0.6),
          esc: Math.round(dismissals * 0.25),
          click_outside: dismissals - Math.round(dismissals * 0.6) - Math.round(dismissals * 0.25),
        } : {},
        totalDurationSec: Math.round(completions * tour.avgDurationSec * (0.8 + rand() * 0.4)),
        stepDismissalCounts: dismissals > 0 ? {
          "0": Math.round(dismissals * 0.15),
          "1": Math.round(dismissals * 0.30),
          "2": Math.round(dismissals * 0.25),
          "3": Math.round(dismissals * 0.20),
          "4": dismissals - Math.round(dismissals * 0.15) - Math.round(dismissals * 0.30)
                - Math.round(dismissals * 0.25) - Math.round(dismissals * 0.20),
        } : {},
        firstSeen: dayTs,
        lastSeen: `${day}T17:00:00Z`,
      })
    }
  }
}
