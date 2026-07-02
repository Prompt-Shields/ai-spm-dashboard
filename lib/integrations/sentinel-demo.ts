// Microsoft Sentinel integration — demo data & logic.
//
// Everything here is a PURE FRONT-END MOCK. No network calls are made and no
// data ever leaves the browser. The generator fabricates realistic AI-SPM
// security events client-side so the /integrations/sentinel page can perform a
// "theatrical" live-streaming demo: events tick out of the platform, get shaped
// into Log Analytics ingestion records, and appear to land in a Sentinel
// workspace.
//
// The event/record shapes are aligned to the Microsoft Sentinel / Azure Monitor
// world (ASIM-flavoured column names, custom-log `_CL` tables, DCR ingestion)
// so the payload preview reads like the real thing — but it is illustrative,
// not a wire-accurate schema.

import { SAAS_VENDORS } from '@/lib/vendor-data'

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical'

// The AI-SPM signal streams we can forward to Sentinel. Each maps to one
// custom-log table on the Sentinel side.
export type StreamId =
  | 'policy-violation'
  | 'pii-exposure'
  | 'vendor-risk'
  | 'shadow-ai'
  | 'model-risk'

export interface StreamDef {
  id: StreamId
  /** Human label shown in the data-mapping table. */
  label: string
  /** Source module inside the platform that emits this stream. */
  sourceModule: string
  /** Sentinel custom-log table these records land in. */
  table: string
  /** Short description of what each record represents. */
  description: string
  /** Tailwind accent classes (dot + subtle bg) for the stream. */
  accent: { dot: string; chip: string }
}

export const STREAMS: StreamDef[] = [
  {
    id: 'policy-violation',
    label: 'Policy violations',
    sourceModule: 'Policy Enforcement',
    table: 'ATLAS_PolicyViolation_CL',
    description: 'Guardrail & DLP policy hits on AI prompts and outputs.',
    accent: { dot: 'bg-rose-500', chip: 'bg-rose-50 text-rose-700 ring-rose-200' },
  },
  {
    id: 'pii-exposure',
    label: 'PII exposure',
    sourceModule: 'PII Shield',
    table: 'ATLAS_PIIExposure_CL',
    description: 'Sensitive data detected flowing into third-party AI tools.',
    accent: { dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700 ring-amber-200' },
  },
  {
    id: 'vendor-risk',
    label: 'SaaS / vendor AI risk',
    sourceModule: 'SaaS Vendor AI',
    table: 'ATLAS_VendorRisk_CL',
    description: 'Third-party AI vendor risk-score & posture changes.',
    accent: { dot: 'bg-violet-500', chip: 'bg-violet-50 text-violet-700 ring-violet-200' },
  },
  {
    id: 'shadow-ai',
    label: 'Shadow-AI discovery',
    sourceModule: 'Agent Discovery',
    table: 'ATLAS_ShadowAI_CL',
    description: 'Previously-unknown AI apps & agents observed on endpoints.',
    accent: { dot: 'bg-cyan-500', chip: 'bg-cyan-50 text-cyan-700 ring-cyan-200' },
  },
  {
    id: 'model-risk',
    label: 'Model risk & eval failures',
    sourceModule: 'Model Risk',
    table: 'ATLAS_ModelRisk_CL',
    description: 'Red-team / eval regressions and model risk threshold breaches.',
    accent: { dot: 'bg-indigo-500', chip: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
  },
]

export const STREAM_BY_ID: Record<StreamId, StreamDef> = STREAMS.reduce(
  (acc, s) => {
    acc[s.id] = s
    return acc
  },
  {} as Record<StreamId, StreamDef>,
)

// ---------------------------------------------------------------------------
// Event model
// ---------------------------------------------------------------------------

export interface SpmEvent {
  id: string
  /** Wall-clock time the event was generated (ms epoch). */
  ts: number
  streamId: StreamId
  eventType: string
  severity: Severity
  /** The AI service / vendor the event concerns. */
  resource: string
  /** The user / identity involved, when applicable. */
  actor: string
  /** One-line human summary shown in the feed. */
  message: string
  /** Action the platform took. */
  action: 'Detected' | 'Flagged' | 'Blocked' | 'Quarantined'
  /** Stream-specific structured fields, surfaced under AdditionalFields. */
  extra: Record<string, string | number | boolean>
}

// A Log-Analytics-shaped ingestion record — what a DCR would receive and route
// into the custom-log table. ASIM-flavoured column names.
export interface IngestionRecord {
  TimeGenerated: string
  EventVendor: 'PromptShields'
  EventProduct: 'Atlas AI-SPM'
  EventType: string
  Severity: Severity
  DvcAction: SpmEvent['action']
  ActorUsername: string
  SvcResource: string
  SourceModule: string
  _TargetTable: string
  AdditionalFields: Record<string, string | number | boolean>
}

// ---------------------------------------------------------------------------
// Seed pools
// ---------------------------------------------------------------------------

const ACTORS = [
  'alice.tan@corp.com',
  'j.okafor@corp.com',
  'm.rossi@corp.com',
  'devops-bot@corp.com',
  'priya.n@corp.com',
  'contractor-4471@ext.corp.com',
  's.almasi@corp.com',
]

const VENDOR_NAMES = SAAS_VENDORS.map((v) => v.name)

// Per-stream event templates. Each template contributes the qualitative bits
// (type/severity/message/action/extra); the generator fills in actor, resource
// and timestamps. `message` may reference {resource} / {actor}.
interface Template {
  eventType: string
  severity: Severity
  action: SpmEvent['action']
  message: string
  resources?: string[]
  extra: () => Record<string, string | number | boolean>
}

const PII_TYPES = ['US_SSN', 'CreditCard', 'EU_Passport', 'PHI_Record', 'APIKey', 'SourceCode']
const POLICIES = [
  'Block secrets in prompts',
  'No customer PII to public LLMs',
  'Restrict source-code upload',
  'Require training opt-out',
]
const CONTROLS = ['LLM06', 'LLM01', 'LLM02', 'LLM09', 'LLM10']

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seed * arr.length) % arr.length]
}

const TEMPLATES: Record<StreamId, Template[]> = {
  'policy-violation': [
    {
      eventType: 'GuardrailBlocked',
      severity: 'High',
      action: 'Blocked',
      message: 'Prompt to {resource} blocked — matched policy "{policy}"',
      extra: () => ({
        PolicyName: pick(POLICIES, Math.random()),
        OwaspControl: pick(CONTROLS, Math.random()),
        PromptTokens: 120 + Math.floor(Math.random() * 3000),
        Enforcement: 'block',
      }),
    },
    {
      eventType: 'SecretInPrompt',
      severity: 'Critical',
      action: 'Blocked',
      message: 'Live credential detected in prompt to {resource}',
      extra: () => ({
        SecretType: pick(['aws_access_key', 'github_pat', 'private_key'], Math.random()),
        Redacted: true,
        OwaspControl: 'LLM06',
      }),
    },
    {
      eventType: 'JailbreakAttempt',
      severity: 'Medium',
      action: 'Flagged',
      message: 'Possible prompt-injection / jailbreak against {resource}',
      extra: () => ({
        Technique: pick(['role-play', 'ignore-instructions', 'payload-splitting'], Math.random()),
        Confidence: Number((0.6 + Math.random() * 0.39).toFixed(2)),
        OwaspControl: 'LLM01',
      }),
    },
  ],
  'pii-exposure': [
    {
      eventType: 'SensitiveDataEgress',
      severity: 'High',
      action: 'Quarantined',
      message: '{piiType} detected leaving to {resource}',
      extra: () => ({
        DataType: pick(PII_TYPES, Math.random()),
        MatchCount: 1 + Math.floor(Math.random() * 40),
        Channel: pick(['paste', 'file-upload', 'api'], Math.random()),
        Classification: 'restricted',
      }),
    },
    {
      eventType: 'PHIInPrompt',
      severity: 'Critical',
      action: 'Blocked',
      message: 'Protected health information redacted before reaching {resource}',
      extra: () => ({
        DataType: 'PHI_Record',
        MatchCount: 1 + Math.floor(Math.random() * 8),
        Regulation: 'HIPAA',
        Redacted: true,
      }),
    },
  ],
  'vendor-risk': [
    {
      eventType: 'VendorRiskIncrease',
      severity: 'Medium',
      action: 'Flagged',
      message: 'Risk score rose for {resource} after sub-processor change',
      extra: () => ({
        PreviousScore: 30 + Math.floor(Math.random() * 20),
        NewScore: 55 + Math.floor(Math.random() * 25),
        Reason: pick(['new-subprocessor', 'cert-expired', 'dpa-lapsed'], Math.random()),
        EuAiActClass: pick(['limited', 'high', 'minimal'], Math.random()),
      }),
    },
    {
      eventType: 'DpaMissing',
      severity: 'High',
      action: 'Flagged',
      message: 'No Data Processing Agreement on file for {resource}',
      extra: () => ({
        ContractStatus: pick(['pending-renewal', 'expired'], Math.random()),
        TrainingOptOut: false,
      }),
    },
  ],
  'shadow-ai': [
    {
      eventType: 'UnsanctionedAiApp',
      severity: 'Medium',
      action: 'Detected',
      message: 'Unsanctioned AI tool "{resource}" observed on endpoint',
      resources: ['Perplexity', 'DeepSeek Chat', 'Character.AI', 'Ollama (local)', 'HuggingChat', 'Poe'],
      extra: () => ({
        DiscoveredVia: pick(['browser-extension', 'endpoint-agent', 'egress-proxy'], Math.random()),
        Users: 1 + Math.floor(Math.random() * 25),
        Sanctioned: false,
      }),
    },
    {
      eventType: 'AutonomousAgentSpotted',
      severity: 'High',
      action: 'Flagged',
      message: 'Autonomous agent making outbound API calls — "{resource}"',
      resources: ['AutoGPT worker', 'n8n AI flow', 'Zapier AI action', 'custom LangChain agent'],
      extra: () => ({
        Egress: pick(['api.openai.com', 'api.anthropic.com', 'generativelanguage.googleapis.com'], Math.random()),
        HasCredentials: true,
        Autonomy: 'high',
      }),
    },
  ],
  'model-risk': [
    {
      eventType: 'EvalRegression',
      severity: 'High',
      action: 'Flagged',
      message: 'Safety eval regression on {resource} deployment',
      resources: ['internal-support-copilot', 'contract-summarizer', 'code-review-bot'],
      extra: () => ({
        Suite: pick(['toxicity', 'jailbreak-resistance', 'pii-leak'], Math.random()),
        Baseline: Number((0.9 + Math.random() * 0.08).toFixed(2)),
        Current: Number((0.6 + Math.random() * 0.25).toFixed(2)),
      }),
    },
    {
      eventType: 'RiskThresholdBreached',
      severity: 'Critical',
      action: 'Flagged',
      message: 'Model risk threshold breached for {resource}',
      resources: ['fraud-scoring-model', 'resume-ranker', 'loan-adjudicator'],
      extra: () => ({
        Dimension: pick(['bias', 'explainability', 'robustness'], Math.random()),
        Score: 70 + Math.floor(Math.random() * 30),
        Threshold: 65,
      }),
    },
  ],
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

let seq = 0

function fill(tpl: string, vals: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vals[k] ?? `{${k}}`)
}

/**
 * Fabricate one event drawn from the given enabled streams. `now` is passed in
 * so callers control the clock (keeps timestamps monotonic with the UI).
 */
export function generateEvent(enabled: StreamId[], now: number): SpmEvent {
  const streamId = enabled.length ? pick(enabled, Math.random()) : 'policy-violation'
  const templates = TEMPLATES[streamId]
  const tpl = pick(templates, Math.random())
  const actor = pick(ACTORS, Math.random())
  const resource = tpl.resources ? pick(tpl.resources, Math.random()) : pick(VENDOR_NAMES, Math.random())
  const extra = tpl.extra()

  const message = fill(tpl.message, {
    resource,
    actor,
    policy: String(extra.PolicyName ?? ''),
    piiType: String(extra.DataType ?? 'Sensitive data'),
  })

  seq += 1
  return {
    id: `evt-${now}-${seq}`,
    ts: now,
    streamId,
    eventType: tpl.eventType,
    severity: tpl.severity,
    resource,
    actor,
    message,
    action: tpl.action,
    extra,
  }
}

/** Shape an event into the Log-Analytics ingestion record a DCR would receive. */
export function toIngestionRecord(evt: SpmEvent): IngestionRecord {
  const stream = STREAM_BY_ID[evt.streamId]
  return {
    TimeGenerated: new Date(evt.ts).toISOString(),
    EventVendor: 'PromptShields',
    EventProduct: 'Atlas AI-SPM',
    EventType: evt.eventType,
    Severity: evt.severity,
    DvcAction: evt.action,
    ActorUsername: evt.actor,
    SvcResource: evt.resource,
    SourceModule: stream.sourceModule,
    _TargetTable: stream.table,
    AdditionalFields: evt.extra,
  }
}

/** Rough byte size of the record as it would go over the wire. */
export function recordBytes(evt: SpmEvent): number {
  return JSON.stringify(toIngestionRecord(evt)).length
}

export const SEVERITY_STYLE: Record<Severity, { dot: string; text: string; chip: string }> = {
  Low: { dot: 'bg-slate-400', text: 'text-slate-600', chip: 'bg-slate-100 text-slate-600' },
  Medium: { dot: 'bg-amber-500', text: 'text-amber-700', chip: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  High: { dot: 'bg-orange-500', text: 'text-orange-700', chip: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200' },
  Critical: { dot: 'bg-rose-600', text: 'text-rose-700', chip: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' },
}

// ---------------------------------------------------------------------------
// Connector catalog (hub page)
// ---------------------------------------------------------------------------

export type ConnectorStatus = 'connected' | 'available' | 'beta'
export type ConnectorCategory = 'SIEM' | 'GRC' | 'ITSM' | 'DLP' | 'Alerting'

export interface Connector {
  id: string
  name: string
  vendor: string
  category: ConnectorCategory
  status: ConnectorStatus
  blurb: string
  /** Route to a dedicated page, when one exists. */
  href?: string
  /** Featured connectors render larger / first. */
  featured?: boolean
}

export const CONNECTORS: Connector[] = [
  {
    id: 'sentinel',
    name: 'Microsoft Sentinel',
    vendor: 'Microsoft',
    category: 'SIEM',
    status: 'available',
    blurb: 'Stream AI security-posture events into your cloud-native SIEM & XDR.',
    href: '/integrations/sentinel',
    featured: true,
  },
  {
    id: 'defender',
    name: 'Microsoft Defender XDR',
    vendor: 'Microsoft',
    category: 'SIEM',
    status: 'available',
    blurb: 'Correlate AI risk signals with Defender XDR incidents & alerts.',
  },
  {
    id: 'splunk',
    name: 'Splunk Enterprise Security',
    vendor: 'Cisco',
    category: 'SIEM',
    status: 'beta',
    blurb: 'Forward events via HTTP Event Collector to Splunk ES.',
  },
  {
    id: 'chronicle',
    name: 'Google SecOps (Chronicle)',
    vendor: 'Google',
    category: 'SIEM',
    status: 'available',
    blurb: 'Ingest UDM events into Google SecOps.',
  },
  {
    id: 'ardoq',
    name: 'Ardoq',
    vendor: 'Ardoq',
    category: 'GRC',
    status: 'connected',
    blurb: 'Sync the AI asset register & risks into your EA graph.',
    href: '/integrations/ardoq',
  },
  {
    id: 'servicenow',
    name: 'ServiceNow',
    vendor: 'ServiceNow',
    category: 'ITSM',
    status: 'beta',
    blurb: 'Open incidents & IRM findings from AI risk events.',
  },
  {
    id: 'purview',
    name: 'Microsoft Purview',
    vendor: 'Microsoft',
    category: 'DLP',
    status: 'available',
    blurb: 'Share AI data-flow & PII signals with Purview DLP.',
  },
  {
    id: 'agent365',
    name: 'Microsoft Agent 365',
    vendor: 'Microsoft',
    category: 'GRC',
    status: 'beta',
    blurb: 'Govern & register AI agents alongside your Agent 365 fleet.',
  },
  {
    id: 'slack',
    name: 'Slack',
    vendor: 'Salesforce',
    category: 'Alerting',
    status: 'available',
    blurb: 'Post high-severity AI risk alerts to a channel.',
  },
]

export const CONNECTOR_STATUS_STYLE: Record<ConnectorStatus, string> = {
  connected: 'bg-green-50 text-green-700 ring-1 ring-green-200',
  available: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  beta: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
}
