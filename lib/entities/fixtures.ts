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
}
