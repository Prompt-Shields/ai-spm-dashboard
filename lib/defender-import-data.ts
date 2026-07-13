// Defender Screenshot Import — seeded, deterministic demo data.
//
// Drives the simulated import at /discover/defender-import. The uploaded
// screenshot's pixels are never read (no real OCR): "extraction" always
// yields DEFENDER_EXTRACTED_APPS, shaped the way a Microsoft Defender for
// Cloud Apps discovered-apps table presents them, and enrichment comes from
// the seeded ENRICHMENTS catalog. Mirrors the voice-interview-data.ts
// pattern — illustrative English-only sample data; UI chrome is translated
// via the `defenderImport` i18n namespace.

import type { Application, DataClassification } from './entities/types'
import { DEFAULT_TENANT_ID } from './entities/types'

export interface DefenderExtractedApp {
  /** Kebab-case key; also drives the Application id. */
  slug: string
  name: string
  /** Defender "category" column. */
  category: string
  /** Defender cloud-app score, 0–10 — higher means SAFER in Defender's UI. */
  defenderScore: number
  users: number
  /** Defender "uploaded data" column, free text. */
  trafficUploaded: string
  /** ISO date of last observed traffic. */
  lastSeen: string
}

export interface DefenderEnrichment {
  vendor: string
  aiCapability: string
  models: string[]
  /** Whether the vendor may train on submitted data (free/personal tiers). */
  trainsOnData: boolean
  certifications: string[]
  dataClassification: DataClassification
  /** 0–100 platform risk score — higher means RISKIER (opposite axis to Defender's). */
  riskScore: number
  /** One-line analyst note shown in the review table. */
  note: string
}

export const DEFENDER_EXTRACTED_APPS: DefenderExtractedApp[] = [
  { slug: 'chatgpt-personal', name: 'ChatGPT (personal)', category: 'Generative AI', defenderScore: 6, users: 214, trafficUploaded: '3.1 GB', lastSeen: '2026-07-12' },
  { slug: 'deepseek-chat', name: 'DeepSeek Chat', category: 'Generative AI', defenderScore: 2, users: 37, trafficUploaded: '820 MB', lastSeen: '2026-07-11' },
  { slug: 'perplexity', name: 'Perplexity', category: 'Generative AI', defenderScore: 7, users: 96, trafficUploaded: '440 MB', lastSeen: '2026-07-12' },
  { slug: 'character-ai', name: 'Character.AI', category: 'Generative AI', defenderScore: 3, users: 18, trafficUploaded: '95 MB', lastSeen: '2026-07-08' },
  { slug: 'midjourney', name: 'Midjourney', category: 'AI image generation', defenderScore: 5, users: 42, trafficUploaded: '1.6 GB', lastSeen: '2026-07-10' },
  { slug: 'otter-ai', name: 'Otter.ai', category: 'AI transcription', defenderScore: 6, users: 71, trafficUploaded: '2.4 GB', lastSeen: '2026-07-12' },
  { slug: 'poe', name: 'Poe', category: 'Generative AI', defenderScore: 4, users: 29, trafficUploaded: '210 MB', lastSeen: '2026-07-09' },
  { slug: 'quillbot', name: 'QuillBot', category: 'AI writing assistant', defenderScore: 5, users: 133, trafficUploaded: '380 MB', lastSeen: '2026-07-12' },
]

export const ENRICHMENTS: Record<string, DefenderEnrichment> = {
  'chatgpt-personal': {
    vendor: 'OpenAI',
    aiCapability: 'General-purpose chat assistant',
    models: ['GPT-5'],
    trainsOnData: true,
    certifications: ['SOC 2 Type II'],
    dataClassification: 'confidential',
    riskScore: 82,
    note: 'Personal accounts — enterprise controls and training opt-out do not apply',
  },
  'deepseek-chat': {
    vendor: 'DeepSeek (Hangzhou)',
    aiCapability: 'General-purpose chat assistant',
    models: ['DeepSeek-V3'],
    trainsOnData: true,
    certifications: [],
    dataClassification: 'restricted',
    riskScore: 93,
    note: 'Data processed outside EU/US adequacy; no enterprise agreement available',
  },
  perplexity: {
    vendor: 'Perplexity AI',
    aiCapability: 'AI search and research answers',
    models: ['Sonar', 'GPT-5', 'Claude'],
    trainsOnData: false,
    certifications: ['SOC 2 Type II'],
    dataClassification: 'internal',
    riskScore: 58,
    note: 'Search queries may leak project names and internal terminology',
  },
  'character-ai': {
    vendor: 'Character Technologies',
    aiCapability: 'Consumer AI companion chat',
    models: ['proprietary'],
    trainsOnData: true,
    certifications: [],
    dataClassification: 'internal',
    riskScore: 74,
    note: 'Consumer entertainment product; no business use case identified',
  },
  midjourney: {
    vendor: 'Midjourney',
    aiCapability: 'Text-to-image generation',
    models: ['Midjourney v7'],
    trainsOnData: true,
    certifications: [],
    dataClassification: 'internal',
    riskScore: 66,
    note: 'Generated assets have unclear IP status for commercial use',
  },
  'otter-ai': {
    vendor: 'Otter.ai',
    aiCapability: 'Meeting transcription and summaries',
    models: ['proprietary ASR + LLM'],
    trainsOnData: true,
    certifications: ['SOC 2 Type II'],
    dataClassification: 'confidential',
    riskScore: 79,
    note: 'Records full meetings — high PII and confidential-content exposure',
  },
  poe: {
    vendor: 'Quora',
    aiCapability: 'Multi-model chat aggregator',
    models: ['GPT-5', 'Claude', 'Gemini'],
    trainsOnData: false,
    certifications: [],
    dataClassification: 'internal',
    riskScore: 61,
    note: 'Aggregator routes prompts to multiple third-party model providers',
  },
  quillbot: {
    vendor: 'Learneo',
    aiCapability: 'Paraphrasing and grammar rewriting',
    models: ['proprietary'],
    trainsOnData: true,
    certifications: [],
    dataClassification: 'internal',
    riskScore: 55,
    note: 'Employees paste draft documents and emails for rewriting',
  },
}

/// Pure: map one extracted row + its enrichment to an entity-store record.
/// Timestamp injected for determinism (same pattern as shadowAgentToUseCase).
/// The id is stable per slug so re-imports upsert instead of duplicating.
export function extractedAppToApplication(
  app: DefenderExtractedApp,
  enrichment: DefenderEnrichment,
  nowIso: string
): Application {
  const training = enrichment.trainsOnData
    ? 'Vendor may train on submitted data.'
    : 'Vendor does not train on submitted data.'
  return {
    id: `app-shadow-defender-${app.slug}`,
    tenantId: DEFAULT_TENANT_ID,
    componentName: app.name,
    description:
      `Imported from a Microsoft Defender for Cloud Apps screenshot: ` +
      `${app.users} users, ${app.trafficUploaded} uploaded, last seen ${app.lastSeen}. ` +
      `${enrichment.vendor} — ${enrichment.aiCapability}. ${training} ` +
      `${enrichment.note}. Assign an Owner / Department and promote from Shadow after review.`,
    dataClassification: enrichment.dataClassification,
    deploymentStatus: 'Shadow',
    riskScore: enrichment.riskScore,
    autoDiscovered: true,
    autoDiscoveredFromAppId: `defender-${app.slug}`,
    tags: ['ai-system', 'shadow-ai', 'defender-import'],
    createdAt: nowIso,
    updatedAt: nowIso,
  }
}
