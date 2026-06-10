# Agent Discovery Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/agent-discovery` page — a theatrical, scripted demo of a "Discovery Meta-Agent" that sweeps AWS/Azure/GCP registries, streams discovered AI agents (registered, pending, shadow), and produces a *State of AI Compliance* report for the CISO.

**Architecture:** A pure data/logic core under `lib/agent-discovery/` (types, scripted fixture, pure report builder, Markdown export, localStorage store with a pure shadow→UseCase mapper) that is fully unit-tested with Vitest. A presentational React layer under `components/agent-discovery/` (dumb panes/cards + an orchestrator console that owns the run state machine and reveal timers). Light additive integration: a `localStorage` run summary that `/discover` reads to show a shadow-findings banner. Full en/nb/fr localization from the start.

**Tech Stack:** Next.js (App Router, client components), React (`useState`/`useEffect` timers), TypeScript, Tailwind, lucide-react (`Radar` icon), Vitest (`environment: node`), existing custom i18n (`useT()` + namespace barrels).

**Source spec:** `docs/superpowers/specs/2026-06-05-agent-discovery-meta-agent-design.md`

---

## Conventions (read before starting)

- **i18n namespace files** (`lib/i18n/locales/<loc>/<ns>.ts`): `export const <ns> = { ... }` — **no `as const`** (the `Messages` type must stay widened so nb/fr can hold translated strings). The English barrel `lib/i18n/locales/en.ts` defines the shape; `nb.ts`/`fr.ts` are annotated `: Messages` so missing/extra keys fail to compile, and `lib/i18n/completeness.test.ts` asserts identical leaf-key sets at runtime.
- **`useT()`**: `const t = useT()` then `t('agentDiscovery.title')`; interpolation via `t('key', { count })` replacing `{count}` tokens.
- **localStorage**: client-only. Always `'use client'`, guard with `try { window.localStorage... } catch {}`, read inside `useEffect` (never during render) to avoid hydration mismatch.
- **Timed reveal**: mirror `components/agent-conversation-card.tsx` — `useState` counter + `setInterval`, clean up every timer in the effect's return.
- **Styling**: cards = `bg-white border border-slate-200 rounded-xl p-4 shadow-sm`; page title = `text-xl font-bold text-slate-900`; sub = `text-sm text-slate-500`; descriptions = `text-xs text-slate-500`; primary button = `bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg`.
- **Fixture style**: `export const CLOUD_AGENTS: DiscoveredAgent[] = [ ... ]` in `lib/agent-discovery/data.ts`, types from `./types`.
- **Commits**: one per task (frequent). Tests-first for the `lib/` core.
- **No `next build` / `tsc` in-sandbox** (they hang); rely on Vitest + careful typing. Run tests with `npx vitest run` (add `--pool=forks` only if you hit pool flake).

---

## File Structure

**Create:**
- `lib/agent-discovery/types.ts` — `Cloud`, `ApprovalState`, `DiscoveredAgent`, `ComplianceReport`
- `lib/agent-discovery/data.ts` — `CLOUD_AGENTS` scripted fixture (~16 agents)
- `lib/agent-discovery/data.test.ts` — fixture integrity
- `lib/agent-discovery/report.ts` — `buildComplianceReport()` (pure)
- `lib/agent-discovery/report.test.ts`
- `lib/agent-discovery/export.ts` — `formatReportMarkdown()` (pure)
- `lib/agent-discovery/export.test.ts`
- `lib/agent-discovery/store.ts` — `shadowAgentToUseCase()` (pure) + `getRunSummary`/`saveRunSummary`/`sendShadowAgentsToRegister`
- `lib/agent-discovery/store.test.ts` — covers the pure mapper only
- `lib/i18n/locales/en/agentDiscovery.ts`, `nb/agentDiscovery.ts`, `fr/agentDiscovery.ts`
- `components/agent-discovery/discovered-agent-card.tsx`
- `components/agent-discovery/cloud-pane.tsx`
- `components/agent-discovery/meta-agent-bar.tsx`
- `components/agent-discovery/compliance-report-card.tsx`
- `components/agent-discovery/discovery-console.tsx`
- `app/agent-discovery/page.tsx`

**Modify:**
- `lib/i18n/locales/en.ts`, `nb.ts`, `fr.ts` — wire the namespace into each barrel
- `lib/i18n/locales/{en,nb,fr}/nav.ts` — add `agentDiscovery` nav label
- `components/app-sidebar.tsx` — add nav entry (`Radar` icon)
- `app/discover/page.tsx` — additive shadow-findings banner
- `vitest.config.ts` — add `lib/agent-discovery/**/*.test.ts` to `include`

---

## Task 1: Types + scripted fixture + integrity test

**Files:**
- Create: `lib/agent-discovery/types.ts`, `lib/agent-discovery/data.ts`, `lib/agent-discovery/data.test.ts`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Write `types.ts`**

```ts
// lib/agent-discovery/types.ts
export type Cloud = 'aws' | 'azure' | 'gcp'
export type ApprovalState = 'approved' | 'pending' | 'unregistered' // unregistered = shadow

export interface DiscoveredAgent {
  id: string
  name: string
  cloud: Cloud
  registry: string // 'Bedrock AgentCore' | 'AI Foundry Hub' | 'Knowledge Catalog'
  owner: string
  protocol: 'mcp' | 'a2a' | 'none'
  purpose: string
  approvalState: ApprovalState
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted'
  regulatoryScope: string[]
  region: string
  residencyOk: boolean // false ⇒ processing restricted data outside allowed region
  manifestComplete: boolean // false ⇒ missing security-by-design manifest fields
}

export interface PerCloudCount {
  cloud: Cloud
  total: number
  shadow: number
}

export interface ComplianceReport {
  total: number
  perCloud: PerCloudCount[]
  registered: number
  pending: number
  shadow: number
  residencyViolations: number
  missingManifests: number
  restrictedDataAgents: number
  recommendedActions: RecommendedAction[]
}

// Structured (not pre-localized) so the UI renders via i18n templates.
export type RecommendedActionKind =
  | 'registerShadow'
  | 'remediateResidency'
  | 'completeManifests'
  | 'reviewRestricted'

export interface RecommendedAction {
  kind: RecommendedActionKind
  count: number
}
```

- [ ] **Step 2: Write `data.ts`** — a fixed fixture of ~16 agents across the three clouds. Must include: at least one of each `approvalState`; ≥1 `residencyOk: false`; ≥1 `manifestComplete: false`; ≥1 `dataClassification: 'restricted'`. Registries: AWS→`'Bedrock AgentCore'`, Azure→`'AI Foundry Hub'`, GCP→`'Knowledge Catalog'`.

```ts
// lib/agent-discovery/data.ts
import type { DiscoveredAgent } from './types'

export const CLOUD_AGENTS: DiscoveredAgent[] = [
  // ── AWS · Bedrock AgentCore ──
  { id: 'aws-1', name: 'Automated Control Auditor', cloud: 'aws', registry: 'Bedrock AgentCore', owner: 'Security Engineering', protocol: 'mcp', purpose: 'Continuously audits IAM and config drift against SOC2 controls.', approvalState: 'approved', dataClassification: 'internal', regulatoryScope: ['SOC2'], region: 'us-east-1', residencyOk: true, manifestComplete: true },
  { id: 'aws-2', name: 'Incident Response Triage', cloud: 'aws', registry: 'Bedrock AgentCore', owner: 'SecOps', protocol: 'a2a', purpose: 'Triages GuardDuty findings and drafts response runbooks.', approvalState: 'approved', dataClassification: 'confidential', regulatoryScope: ['SOC2'], region: 'us-east-1', residencyOk: true, manifestComplete: true },
  { id: 'aws-3', name: 'Customer Refund Adjudicator', cloud: 'aws', registry: 'Bedrock AgentCore', owner: 'unknown', protocol: 'none', purpose: 'Approves customer refunds from support tickets.', approvalState: 'unregistered', dataClassification: 'restricted', regulatoryScope: ['PCI-DSS'], region: 'us-west-2', residencyOk: true, manifestComplete: false },
  { id: 'aws-4', name: 'Marketing Copy Generator', cloud: 'aws', registry: 'Bedrock AgentCore', owner: 'Growth', protocol: 'mcp', purpose: 'Generates campaign copy and subject lines.', approvalState: 'pending', dataClassification: 'public', regulatoryScope: [], region: 'us-east-1', residencyOk: true, manifestComplete: true },
  { id: 'aws-5', name: 'Patient Intake Summarizer', cloud: 'aws', registry: 'Bedrock AgentCore', owner: 'unknown', protocol: 'none', purpose: 'Summarizes patient intake forms for clinicians.', approvalState: 'unregistered', dataClassification: 'restricted', regulatoryScope: ['HIPAA'], region: 'us-east-1', residencyOk: false, manifestComplete: false },

  // ── Azure · AI Foundry Hub ──
  { id: 'azure-1', name: 'Policy Exception & Risk Assessment', cloud: 'azure', registry: 'AI Foundry Hub', owner: 'GRC', protocol: 'mcp', purpose: 'Evaluates policy exception requests and scores residual risk.', approvalState: 'approved', dataClassification: 'confidential', regulatoryScope: ['ISO27001'], region: 'westeurope', residencyOk: true, manifestComplete: true },
  { id: 'azure-2', name: 'Contract Clause Extractor', cloud: 'azure', registry: 'AI Foundry Hub', owner: 'Legal', protocol: 'a2a', purpose: 'Extracts obligations and liabilities from contracts.', approvalState: 'approved', dataClassification: 'confidential', regulatoryScope: ['GDPR'], region: 'westeurope', residencyOk: true, manifestComplete: true },
  { id: 'azure-3', name: 'HR Candidate Ranker', cloud: 'azure', registry: 'AI Foundry Hub', owner: 'unknown', protocol: 'none', purpose: 'Ranks job candidates from CVs and interview notes.', approvalState: 'unregistered', dataClassification: 'restricted', regulatoryScope: ['GDPR', 'EU-AI-ACT'], region: 'eastus', residencyOk: false, manifestComplete: false },
  { id: 'azure-4', name: 'Finance Variance Explainer', cloud: 'azure', registry: 'AI Foundry Hub', owner: 'Finance', protocol: 'mcp', purpose: 'Explains budget variances in management reports.', approvalState: 'pending', dataClassification: 'internal', regulatoryScope: ['SOX'], region: 'westeurope', residencyOk: true, manifestComplete: true },
  { id: 'azure-5', name: 'Support Macro Suggester', cloud: 'azure', registry: 'AI Foundry Hub', owner: 'Support', protocol: 'mcp', purpose: 'Suggests reply macros to support agents.', approvalState: 'approved', dataClassification: 'internal', regulatoryScope: [], region: 'westeurope', residencyOk: true, manifestComplete: false },

  // ── GCP · Knowledge Catalog ──
  { id: 'gcp-1', name: 'Data Lineage Mapper', cloud: 'gcp', registry: 'Knowledge Catalog', owner: 'Data Platform', protocol: 'mcp', purpose: 'Maps PII lineage across BigQuery datasets.', approvalState: 'approved', dataClassification: 'confidential', regulatoryScope: ['GDPR'], region: 'europe-west4', residencyOk: true, manifestComplete: true },
  { id: 'gcp-2', name: 'Sales Forecast Assistant', cloud: 'gcp', registry: 'Knowledge Catalog', owner: 'Revenue Ops', protocol: 'a2a', purpose: 'Forecasts pipeline from CRM signals.', approvalState: 'approved', dataClassification: 'internal', regulatoryScope: [], region: 'us-central1', residencyOk: true, manifestComplete: true },
  { id: 'gcp-3', name: 'Loan Pre-Approval Scorer', cloud: 'gcp', registry: 'Knowledge Catalog', owner: 'unknown', protocol: 'none', purpose: 'Pre-scores loan applications before underwriting.', approvalState: 'unregistered', dataClassification: 'restricted', regulatoryScope: ['EU-AI-ACT', 'GDPR'], region: 'us-central1', residencyOk: false, manifestComplete: false },
  { id: 'gcp-4', name: 'Knowledge Base Answerer', cloud: 'gcp', registry: 'Knowledge Catalog', owner: 'IT', protocol: 'mcp', purpose: 'Answers internal IT questions from the wiki.', approvalState: 'pending', dataClassification: 'internal', regulatoryScope: [], region: 'europe-west4', residencyOk: true, manifestComplete: true },
  { id: 'gcp-5', name: 'Procurement Vendor Vetter', cloud: 'gcp', registry: 'Knowledge Catalog', owner: 'Procurement', protocol: 'mcp', purpose: 'Vets new vendors against risk and sanctions lists.', approvalState: 'approved', dataClassification: 'confidential', regulatoryScope: ['ISO27001'], region: 'europe-west4', residencyOk: true, manifestComplete: true },
  { id: 'gcp-6', name: 'Ad Spend Optimizer', cloud: 'gcp', registry: 'Knowledge Catalog', owner: 'unknown', protocol: 'none', purpose: 'Reallocates ad budget across channels autonomously.', approvalState: 'unregistered', dataClassification: 'internal', regulatoryScope: [], region: 'us-central1', residencyOk: true, manifestComplete: false },
]
```

- [ ] **Step 3: Add the test glob to `vitest.config.ts`** — extend `include` to:

```ts
include: ['lib/pii/**/*.test.ts', 'lib/i18n/**/*.test.ts', 'lib/agent-discovery/**/*.test.ts'],
```

- [ ] **Step 4: Write `data.test.ts` (failing first)**

```ts
// lib/agent-discovery/data.test.ts
import { describe, it, expect } from 'vitest'
import { CLOUD_AGENTS } from './data'
import type { DiscoveredAgent } from './types'

const APPROVAL = new Set(['approved', 'pending', 'unregistered'])
const CLASS = new Set(['public', 'internal', 'confidential', 'restricted'])
const PROTO = new Set(['mcp', 'a2a', 'none'])
const CLOUDS = new Set(['aws', 'azure', 'gcp'])

describe('CLOUD_AGENTS fixture', () => {
  it('has agents across all three clouds', () => {
    for (const c of CLOUDS) expect(CLOUD_AGENTS.some(a => a.cloud === c)).toBe(true)
  })

  it('every agent has valid required fields and enums', () => {
    for (const a of CLOUD_AGENTS) {
      expect(a.id).toBeTruthy()
      expect(a.name).toBeTruthy()
      expect(CLOUDS.has(a.cloud)).toBe(true)
      expect(a.registry).toBeTruthy()
      expect(PROTO.has(a.protocol)).toBe(true)
      expect(APPROVAL.has(a.approvalState)).toBe(true)
      expect(CLASS.has(a.dataClassification)).toBe(true)
      expect(Array.isArray(a.regulatoryScope)).toBe(true)
      expect(typeof a.residencyOk).toBe('boolean')
      expect(typeof a.manifestComplete).toBe('boolean')
    }
  })

  it('has unique ids', () => {
    const ids = CLOUD_AGENTS.map(a => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('is non-trivial: at least one of each approval state + a residency + a manifest gap + a restricted agent', () => {
    expect(CLOUD_AGENTS.some(a => a.approvalState === 'approved')).toBe(true)
    expect(CLOUD_AGENTS.some(a => a.approvalState === 'pending')).toBe(true)
    expect(CLOUD_AGENTS.some(a => a.approvalState === 'unregistered')).toBe(true)
    expect(CLOUD_AGENTS.some(a => !a.residencyOk)).toBe(true)
    expect(CLOUD_AGENTS.some(a => !a.manifestComplete)).toBe(true)
    expect(CLOUD_AGENTS.some(a => a.dataClassification === 'restricted')).toBe(true)
  })
})
```

- [ ] **Step 5: Run** `npx vitest run lib/agent-discovery/data.test.ts` → expect PASS (the fixture is written to satisfy it). If anything fails, fix the fixture, not the test.

- [ ] **Step 6: Commit** `git add lib/agent-discovery/types.ts lib/agent-discovery/data.ts lib/agent-discovery/data.test.ts vitest.config.ts && git commit -m "feat(agent-discovery): types + scripted cloud-agent fixture"`

---

## Task 2: Compliance report builder (pure, TDD)

**Files:**
- Create: `lib/agent-discovery/report.ts`, `lib/agent-discovery/report.test.ts`

- [ ] **Step 1: Write `report.test.ts` first**

```ts
// lib/agent-discovery/report.test.ts
import { describe, it, expect } from 'vitest'
import { buildComplianceReport } from './report'
import type { DiscoveredAgent } from './types'

function agent(p: Partial<DiscoveredAgent>): DiscoveredAgent {
  return {
    id: 'x', name: 'X', cloud: 'aws', registry: 'Bedrock AgentCore', owner: 'o',
    protocol: 'mcp', purpose: 'p', approvalState: 'approved', dataClassification: 'internal',
    regulatoryScope: [], region: 'us-east-1', residencyOk: true, manifestComplete: true, ...p,
  }
}

describe('buildComplianceReport', () => {
  it('returns all-zero report for empty input', () => {
    const r = buildComplianceReport([])
    expect(r.total).toBe(0)
    expect(r.shadow).toBe(0)
    expect(r.registered).toBe(0)
    expect(r.recommendedActions).toEqual([])
    expect(r.perCloud).toEqual([
      { cloud: 'aws', total: 0, shadow: 0 },
      { cloud: 'azure', total: 0, shadow: 0 },
      { cloud: 'gcp', total: 0, shadow: 0 },
    ])
  })

  it('counts approval states, residency, manifest, restricted', () => {
    const r = buildComplianceReport([
      agent({ id: '1', approvalState: 'approved' }),
      agent({ id: '2', approvalState: 'pending' }),
      agent({ id: '3', approvalState: 'unregistered', residencyOk: false, dataClassification: 'restricted' }),
      agent({ id: '4', approvalState: 'unregistered', manifestComplete: false }),
    ])
    expect(r.total).toBe(4)
    expect(r.registered).toBe(1)
    expect(r.pending).toBe(1)
    expect(r.shadow).toBe(2)
    expect(r.residencyViolations).toBe(1)
    expect(r.missingManifests).toBe(1)
    expect(r.restrictedDataAgents).toBe(1)
  })

  it('tallies perCloud totals and shadow counts', () => {
    const r = buildComplianceReport([
      agent({ id: '1', cloud: 'aws', approvalState: 'unregistered' }),
      agent({ id: '2', cloud: 'aws', approvalState: 'approved' }),
      agent({ id: '3', cloud: 'gcp', approvalState: 'unregistered' }),
    ])
    expect(r.perCloud).toEqual([
      { cloud: 'aws', total: 2, shadow: 1 },
      { cloud: 'azure', total: 0, shadow: 0 },
      { cloud: 'gcp', total: 1, shadow: 1 },
    ])
  })

  it('derives recommended actions only for non-zero categories, ordered', () => {
    const r = buildComplianceReport([
      agent({ id: '1', approvalState: 'unregistered' }),
      agent({ id: '2', approvalState: 'unregistered', residencyOk: false }),
      agent({ id: '3', manifestComplete: false }),
      agent({ id: '4', dataClassification: 'restricted' }),
    ])
    expect(r.recommendedActions).toEqual([
      { kind: 'registerShadow', count: 2 },
      { kind: 'remediateResidency', count: 1 },
      { kind: 'completeManifests', count: 1 },
      { kind: 'reviewRestricted', count: 1 },
    ])
  })

  it('omits an action when its count is zero', () => {
    const r = buildComplianceReport([agent({ id: '1', approvalState: 'approved' })])
    expect(r.recommendedActions).toEqual([])
  })
})
```

- [ ] **Step 2: Run** `npx vitest run lib/agent-discovery/report.test.ts` → expect FAIL (`buildComplianceReport` not defined).

- [ ] **Step 3: Implement `report.ts`**

```ts
// lib/agent-discovery/report.ts
import type { Cloud, ComplianceReport, DiscoveredAgent, RecommendedAction } from './types'

const CLOUDS: Cloud[] = ['aws', 'azure', 'gcp']

export function buildComplianceReport(agents: DiscoveredAgent[]): ComplianceReport {
  const shadow = agents.filter(a => a.approvalState === 'unregistered').length
  const residencyViolations = agents.filter(a => !a.residencyOk).length
  const missingManifests = agents.filter(a => !a.manifestComplete).length
  const restrictedDataAgents = agents.filter(a => a.dataClassification === 'restricted').length

  const recommendedActions: RecommendedAction[] = []
  if (shadow > 0) recommendedActions.push({ kind: 'registerShadow', count: shadow })
  if (residencyViolations > 0) recommendedActions.push({ kind: 'remediateResidency', count: residencyViolations })
  if (missingManifests > 0) recommendedActions.push({ kind: 'completeManifests', count: missingManifests })
  if (restrictedDataAgents > 0) recommendedActions.push({ kind: 'reviewRestricted', count: restrictedDataAgents })

  return {
    total: agents.length,
    perCloud: CLOUDS.map(cloud => ({
      cloud,
      total: agents.filter(a => a.cloud === cloud).length,
      shadow: agents.filter(a => a.cloud === cloud && a.approvalState === 'unregistered').length,
    })),
    registered: agents.filter(a => a.approvalState === 'approved').length,
    pending: agents.filter(a => a.approvalState === 'pending').length,
    shadow,
    residencyViolations,
    missingManifests,
    restrictedDataAgents,
    recommendedActions,
  }
}
```

- [ ] **Step 4: Run** the test again → expect PASS.
- [ ] **Step 5: Commit** `git add lib/agent-discovery/report.ts lib/agent-discovery/report.test.ts && git commit -m "feat(agent-discovery): pure compliance report builder"`

---

## Task 3: Markdown export (pure, TDD)

**Files:**
- Create: `lib/agent-discovery/export.ts`, `lib/agent-discovery/export.test.ts`

- [ ] **Step 1: Write `export.test.ts` first**

```ts
// lib/agent-discovery/export.test.ts
import { describe, it, expect } from 'vitest'
import { formatReportMarkdown } from './export'
import { buildComplianceReport } from './report'
import { CLOUD_AGENTS } from './data'

describe('formatReportMarkdown', () => {
  const md = formatReportMarkdown(buildComplianceReport(CLOUD_AGENTS))

  it('has the report title and CISO line', () => {
    expect(md).toMatch(/# State of AI Compliance/)
    expect(md).toMatch(/Prepared for: CISO/)
  })

  it('includes the headline totals', () => {
    expect(md).toMatch(/Total agents discovered/)
    expect(md).toMatch(/Shadow \(unregistered\)/)
  })

  it('lists every cloud', () => {
    expect(md).toMatch(/AWS/)
    expect(md).toMatch(/Azure/)
    expect(md).toMatch(/GCP/)
  })

  it('renders recommended actions when present', () => {
    expect(md).toMatch(/Recommended actions/)
  })

  it('handles an empty report without throwing', () => {
    const empty = formatReportMarkdown(buildComplianceReport([]))
    expect(empty).toMatch(/# State of AI Compliance/)
    expect(empty).toMatch(/Total agents discovered: 0/)
  })
})
```

- [ ] **Step 2: Run** → expect FAIL.

- [ ] **Step 3: Implement `export.ts`** (English, self-contained — the *downloaded file* is plain English by design; on-screen UI is localized separately).

```ts
// lib/agent-discovery/export.ts
import type { Cloud, ComplianceReport, RecommendedAction } from './types'

const CLOUD_LABEL: Record<Cloud, string> = { aws: 'AWS', azure: 'Azure', gcp: 'GCP' }

function actionLine(a: RecommendedAction): string {
  switch (a.kind) {
    case 'registerShadow': return `- Register ${a.count} shadow agent(s) into governance.`
    case 'remediateResidency': return `- Remediate ${a.count} data-residency violation(s).`
    case 'completeManifests': return `- Complete ${a.count} missing security manifest(s).`
    case 'reviewRestricted': return `- Review ${a.count} agent(s) processing restricted data.`
  }
}

export function formatReportMarkdown(report: ComplianceReport): string {
  const lines: string[] = []
  lines.push('# State of AI Compliance')
  lines.push('')
  lines.push('Prepared for: CISO')
  lines.push('')
  lines.push('## Summary')
  lines.push(`- Total agents discovered: ${report.total}`)
  lines.push(`- Registered: ${report.registered}`)
  lines.push(`- Pending approval: ${report.pending}`)
  lines.push(`- Shadow (unregistered): ${report.shadow}`)
  lines.push(`- Data-residency violations: ${report.residencyViolations}`)
  lines.push(`- Missing security manifests: ${report.missingManifests}`)
  lines.push(`- Agents handling restricted data: ${report.restrictedDataAgents}`)
  lines.push('')
  lines.push('## By cloud')
  for (const c of report.perCloud) {
    lines.push(`- ${CLOUD_LABEL[c.cloud]}: ${c.total} agent(s), ${c.shadow} shadow`)
  }
  if (report.recommendedActions.length > 0) {
    lines.push('')
    lines.push('## Recommended actions')
    for (const a of report.recommendedActions) lines.push(actionLine(a))
  }
  lines.push('')
  return lines.join('\n')
}
```

- [ ] **Step 4: Run** → expect PASS.
- [ ] **Step 5: Commit** `git add lib/agent-discovery/export.ts lib/agent-discovery/export.test.ts && git commit -m "feat(agent-discovery): markdown report export"`

---

## Task 4: Store — pure mapper (TDD) + localStorage helpers

**Files:**
- Create: `lib/agent-discovery/store.ts`, `lib/agent-discovery/store.test.ts`

**Decision (from spec §8, confirmed):** the use-case-builder draft store does **not** exist in the codebase, so this feature ships its **own** localStorage store. The `/discover` banner is the visible integration; wiring into `/register`'s rendered list is deferred.

- [ ] **Step 1: Write `store.test.ts` first** — only the **pure** mapper is unit-tested (localStorage fns are exercised via the browser/preview, not in node tests).

```ts
// lib/agent-discovery/store.test.ts
import { describe, it, expect } from 'vitest'
import { shadowAgentToUseCase } from './store'
import type { DiscoveredAgent } from './types'

const shadow: DiscoveredAgent = {
  id: 'aws-3', name: 'Customer Refund Adjudicator', cloud: 'aws', registry: 'Bedrock AgentCore',
  owner: 'unknown', protocol: 'none', purpose: 'Approves customer refunds.', approvalState: 'unregistered',
  dataClassification: 'restricted', regulatoryScope: ['PCI-DSS'], region: 'us-west-2',
  residencyOk: true, manifestComplete: false,
}

describe('shadowAgentToUseCase', () => {
  const uc = shadowAgentToUseCase(shadow, '2026-06-10T00:00:00.000Z')

  it('maps to a discovered, auto-detect use case with no owner', () => {
    expect(uc.status).toBe('discovered')
    expect(uc.discoveryMethod).toBe('auto-detect')
    expect(uc.ownerId).toBeNull()
  })

  it('carries the agent name, purpose, and data classification', () => {
    expect(uc.name).toBe('Customer Refund Adjudicator')
    expect(uc.description).toContain('Approves customer refunds')
    expect(uc.dataClassification).toBe('restricted')
  })

  it('seeds an all-gap compliance status', () => {
    expect(uc.complianceStatus).toEqual({ euAiAct: 'gap', nistAiRmf: 'gap', owaspLlm: 'gap', iso42001: 'gap' })
  })

  it('seeds a shadow-ai risk with no mitigations and empty model/mitigation arrays', () => {
    expect(uc.models).toEqual([])
    expect(uc.mitigations).toEqual([])
    expect(uc.risks).toHaveLength(1)
    expect(uc.risks[0].category).toBe('shadow-ai')
    expect(uc.risks[0].mitigations).toEqual([])
  })

  it('stamps createdAt/lastReviewedAt from the provided iso', () => {
    expect(uc.createdAt).toBe('2026-06-10T00:00:00.000Z')
    expect(uc.lastReviewedAt).toBe('2026-06-10T00:00:00.000Z')
  })

  it('produces a stable, unique-ish id derived from the agent id', () => {
    expect(uc.id).toContain('aws-3')
  })
})
```

- [ ] **Step 2: Run** → expect FAIL.

- [ ] **Step 3: Implement `store.ts`** — pure mapper + SSR-safe localStorage helpers. `shadowAgentToUseCase` takes the timestamp as a param (no `Date.now()` inside, so it's deterministically testable). The localStorage helpers stamp the time at the call site.

```ts
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
    /* localStorage may be unavailable */
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
```

> Implementation note: confirm `Risk`/`UseCase`/`ComplianceStatus` shapes against `lib/aimaps-types.ts` before finishing (they are: `Risk.category` includes `'shadow-ai'`; `UseCase.ownerId: string | null`; `ComplianceStatus` keys `euAiAct|nistAiRmf|owaspLlm|iso42001`).

- [ ] **Step 4: Run** → expect PASS.
- [ ] **Step 5: Commit** `git add lib/agent-discovery/store.ts lib/agent-discovery/store.test.ts && git commit -m "feat(agent-discovery): localStorage store + shadow→usecase mapper"`

---

## Task 5: i18n namespace (en/nb/fr) + nav key + barrels

**Files:**
- Create: `lib/i18n/locales/en/agentDiscovery.ts`, `nb/agentDiscovery.ts`, `fr/agentDiscovery.ts`
- Modify: `lib/i18n/locales/en.ts`, `nb.ts`, `fr.ts`; `lib/i18n/locales/{en,nb,fr}/nav.ts`

- [ ] **Step 1: Create `en/agentDiscovery.ts`** (shape source of truth). Keys cover: title/subtitle, meta-agent identity, phase labels, cloud + registry labels, agent-card field labels, approval-state labels, tally labels, report headings, recommended-action templates (with `{count}`), button labels, and the `/discover` banner.

```ts
// lib/i18n/locales/en/agentDiscovery.ts
export const agentDiscovery = {
  title: 'Agent Discovery',
  subtitle: 'Meta-agent sweeps AWS, Azure, and GCP registries to surface every AI agent and flag shadow AI.',
  metaAgent: {
    name: 'Discovery Meta-Agent',
    identity: 'Queries AWS Bedrock AgentCore Registry · Azure AI Foundry · GCP Knowledge Catalog over MCP + A2A',
    run: 'Run discovery sweep',
    skip: 'Skip animation',
    replay: 'Replay',
    running: 'Sweeping clouds…',
  },
  phases: {
    idle: 'Ready',
    connecting: 'Connecting…',
    querying: 'Querying registry…',
    streaming: 'Streaming agents…',
    done: 'Complete',
  },
  clouds: { aws: 'AWS', azure: 'Azure', gcp: 'GCP' },
  registries: { aws: 'Bedrock AgentCore', azure: 'AI Foundry Hub', gcp: 'Knowledge Catalog' },
  card: {
    owner: 'Owner',
    protocol: 'Protocol',
    region: 'Region',
    dataClass: 'Data',
    residencyRisk: 'Residency risk',
    manifestGap: 'Manifest gap',
  },
  approval: { approved: 'Registered', pending: 'Pending', unregistered: 'Shadow' },
  tally: {
    total: 'total',
    registered: 'registered',
    pending: 'pending',
    shadow: 'shadow',
    residency: 'residency',
  },
  report: {
    heading: 'State of AI Compliance',
    preparedFor: 'Prepared for: CISO',
    total: 'Total agents discovered',
    registered: 'Registered',
    pending: 'Pending approval',
    shadow: 'Shadow (unregistered)',
    residencyViolations: 'Data-residency violations',
    missingManifests: 'Missing security manifests',
    restrictedDataAgents: 'Agents handling restricted data',
    byCloud: 'By cloud',
    recommendedActions: 'Recommended actions',
  },
  actions: {
    registerShadow: 'Register {count} shadow agent(s) into governance',
    remediateResidency: 'Remediate {count} data-residency violation(s)',
    completeManifests: 'Complete {count} missing security manifest(s)',
    reviewRestricted: 'Review {count} agent(s) processing restricted data',
    export: 'Export report',
    sendToRegister: 'Send {count} shadow agents to Register',
    sentToast: 'Sent {count} shadow agents to Register',
  },
  empty: 'No agents yet — run the sweep.',
  banner: {
    text: 'Meta-agent found {count} shadow agents across clouds — review.',
    cta: 'Open Agent Discovery',
  },
}
```

- [ ] **Step 2: Create `nb/agentDiscovery.ts`** — same keys, Norwegian. Use **"Skygge-KI"** for shadow AI (consistent with existing `discover`/`policyEnforcement` namespaces — verify the exact term used there and match it). Keep cloud names (AWS/Azure/GCP) and registry product names untranslated.

- [ ] **Step 3: Create `fr/agentDiscovery.ts`** — same keys, French. Cloud + product names untranslated.

- [ ] **Step 4: Add `agentDiscovery` to each nav namespace.** In `lib/i18n/locales/en/nav.ts` add `agentDiscovery: 'Agent Discovery'`; in `nb/nav.ts` add the Norwegian (e.g. `agentDiscovery: 'Agentoppdaging'` — confirm phrasing); in `fr/nav.ts` add `agentDiscovery: 'Découverte d’agents'`.

- [ ] **Step 5: Wire the namespace into all three barrels.** In `lib/i18n/locales/en.ts`, `nb.ts`, `fr.ts`: add `import { agentDiscovery } from './<loc>/agentDiscovery'` and include `agentDiscovery` in the exported object (matching the existing import/spread style in each barrel).

- [ ] **Step 6: Run the i18n completeness + translate tests**

Run: `npx vitest run lib/i18n`
Expected: PASS (nb & fr have exactly the same leaf keys as en; barrels compile because `nb`/`fr` are typed `: Messages`). If a key is missing in nb/fr the completeness test fails — add it.

- [ ] **Step 7: Commit** `git add lib/i18n && git commit -m "feat(agent-discovery): en/nb/fr localization + nav entry"`

---

## Task 6: Presentational components

**Files:**
- Create: `components/agent-discovery/discovered-agent-card.tsx`, `cloud-pane.tsx`, `meta-agent-bar.tsx`, `compliance-report-card.tsx`

These are dumb/presentational: props in, JSX out, no timers, no data fetching, no localStorage. All copy via `useT()`.

- [ ] **Step 1: `discovered-agent-card.tsx`** — renders one `DiscoveredAgent`. Props: `{ agent: DiscoveredAgent }`. Show name, purpose, owner, protocol, region, data classification, an approval-state badge (color by state: approved→green, pending→amber, unregistered/shadow→red), and small warning chips when `!residencyOk` (residency risk) or `!manifestComplete` (manifest gap). Card style: `bg-white border border-slate-200 rounded-lg p-3 shadow-sm`. Use `t('agentDiscovery.approval.<state>')`, `t('agentDiscovery.card.*')`.

- [ ] **Step 2: `cloud-pane.tsx`** — one cloud column. Props: `{ cloud: Cloud; phaseLabel: string; agents: DiscoveredAgent[] }`. Header shows `t('agentDiscovery.clouds.<cloud>')` + `t('agentDiscovery.registries.<cloud>')` + the current `phaseLabel`. Body maps `agents` → `<DiscoveredAgentCard>`. Renders `t('agentDiscovery.empty')` when `agents` is empty. No timers — it just renders whatever slice it's given.

- [ ] **Step 3: `meta-agent-bar.tsx`** — Props: `{ state: 'idle'|'running'|'complete'; onRun(); onSkip(); onReplay() }`. Shows `t('agentDiscovery.metaAgent.name')` + identity line. Renders **Run** when idle, **Skip** when running, **Replay** when complete (Run also visible/disabled as appropriate). Primary button styling. Include a `Radar` lucide icon next to the name.

- [ ] **Step 4: `compliance-report-card.tsx`** — Props: `{ report: ComplianceReport; onExport(); onSend(); }`. Renders the report heading + "Prepared for: CISO", the summary stat lines, per-cloud breakdown, and recommended actions rendered from `t('agentDiscovery.actions.<kind>', { count })`. Buttons: **Export report** (`onExport`) and **Send {shadow} shadow agents to Register** (`onSend`, disabled when `report.shadow === 0`). Distinct climax styling (e.g. `border-indigo-200 bg-indigo-50/40`).

- [ ] **Step 5: Commit** `git add components/agent-discovery && git commit -m "feat(agent-discovery): presentational panes, cards, bar, report"`

> Verification for this task happens in Task 8 via the browser preview (these have no unit tests).

---

## Task 7: Discovery console (orchestrator + run state machine)

**Files:**
- Create: `components/agent-discovery/discovery-console.tsx`

- [ ] **Step 1: Implement the console.** `'use client'`. Owns:
  - `state: 'idle' | 'running' | 'complete'`
  - `visibleCount` (how many agents revealed, across a fixed reveal order)
  - derived `revealedAgents = REVEAL_ORDER.slice(0, visibleCount)`, per-cloud slices, per-cloud phase label, and the live tally
  - the `ComplianceReport` (computed from `revealedAgents` while running, full `CLOUD_AGENTS` at complete — simplest: compute from `revealedAgents` so the tally and report agree)

  Reveal logic mirrors `agent-conversation-card.tsx`: on **Run**, set `state='running'`, `visibleCount=0`, then `setInterval` incrementing `visibleCount` every ~450ms until all `CLOUD_AGENTS` are revealed, then `clearInterval` and `setState('complete')`. **Skip** clears the interval, sets `visibleCount = CLOUD_AGENTS.length`, `state='complete'`. **Replay** = Run again. Clean up the interval in the effect cleanup AND on unmount.

  Use a stable `REVEAL_ORDER` (e.g. interleave clouds so all three panes fill visually in parallel — sort by index-within-cloud then cloud). Define it as a module constant derived from `CLOUD_AGENTS` (deterministic, no randomness).

  Phase label per cloud derives from how many of that cloud's agents are visible: 0 → `querying` while running / `idle` when idle; ≥1 and not complete → `streaming`; complete → `done`.

  Handlers passed down: `onExport` → `formatReportMarkdown(report)` → trigger a Blob download (`agent-compliance-report.md`); on failure, `navigator.clipboard.writeText` fallback. `onSend` → `sendShadowAgentsToRegister(revealedAgents, report.total, new Date().toISOString())`, then show a transient toast using `t('agentDiscovery.actions.sentToast', { count })`.

  Layout: meta-agent bar → tally row → 3-column responsive grid of `CloudPane` (`grid-cols-1 md:grid-cols-3 gap-4`, so panes stack on narrow viewports per spec §12) → when `state==='complete'`, the `ComplianceReportCard`.

  `Date.now()`/`new Date()` is only used for the report timestamp at send-time (a real user action), never for reveal timing — reveal uses a fixed interval, keeping logic deterministic.

- [ ] **Step 2: Commit** `git add components/agent-discovery/discovery-console.tsx && git commit -m "feat(agent-discovery): console run state machine + reveal timing"`

---

## Task 8: Route + sidebar nav + preview verification

**Files:**
- Create: `app/agent-discovery/page.tsx`
- Modify: `components/app-sidebar.tsx`

- [ ] **Step 1: Create the route shell**

```tsx
// app/agent-discovery/page.tsx
import { DiscoveryConsole } from '@/components/agent-discovery/discovery-console'

export default function AgentDiscoveryPage() {
  return <DiscoveryConsole />
}
```

(The console renders the page title/subtitle itself via `useT()`, matching how other pages own their `<h1>`.)

- [ ] **Step 2: Add the sidebar nav entry.** In `components/app-sidebar.tsx`: import `Radar` from `lucide-react`, and add to `NAV` after the `discover` entry: `{ href: '/agent-discovery', key: 'agentDiscovery', Icon: Radar }`. (Verified `Radar` is exported by the installed lucide-react.)

- [ ] **Step 3: Verify in the browser preview** (per the harness verification workflow):
  - `preview_start`, navigate to `/agent-discovery`.
  - `preview_snapshot` idle state: meta-agent bar + Run button + three empty panes.
  - `preview_click` Run → `preview_snapshot` mid-run (agents streaming, tally incrementing); then wait/Skip and snapshot the complete state with the report card.
  - `preview_console_logs` → no errors/hydration warnings.
  - Check the sidebar shows "Agent Discovery" with the Radar icon and active highlighting on the route.
  - `preview_resize` narrow → confirm panes stack.
  - `preview_screenshot` the completed report for the user.

- [ ] **Step 4: Commit** `git add app/agent-discovery components/app-sidebar.tsx && git commit -m "feat(agent-discovery): route + sidebar nav entry"`

---

## Task 9: Discover banner integration

**Files:**
- Modify: `app/discover/page.tsx`

- [ ] **Step 1: Add a client-only shadow-findings banner.** `app/discover/page.tsx` is already `'use client'`. Add `useEffect` + `useState` to read `getRunSummary()` after mount (never during render — avoids hydration mismatch). When a summary with `shadowCount > 0` exists, render a banner between the header block and the entry-cards grid:
  - Text: `t('agentDiscovery.banner.text', { count: summary.shadowCount })`
  - A link/CTA to `/agent-discovery`: `t('agentDiscovery.banner.cta')`
  - Style: `rounded-xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-2 text-sm` with a `Radar`/`AlertTriangle` icon.

- [ ] **Step 2: Verify in preview:** after running a sweep on `/agent-discovery` and clicking **Send to Register**, navigate to `/discover` → the banner appears with the correct shadow count and links back. Confirm no banner before any run (fresh state). `preview_console_logs` clean.

- [ ] **Step 3: Commit** `git add app/discover/page.tsx && git commit -m "feat(agent-discovery): shadow-findings banner on /discover"`

---

## Task 10: Full verification sweep

- [ ] **Step 1: Run the whole unit suite** `npx vitest run` → expect all green (data, report, export, store, i18n completeness). If pool flake appears, re-run with `npx vitest run --pool=forks`.
- [ ] **Step 2: Preview end-to-end** once more: idle → run → complete → export downloads a Markdown file → send to register → `/discover` banner. Capture a final screenshot for the user.
- [ ] **Step 3: Confirm no stray `console.log`, no `as const` in the new locale files, no `Date.now()` in reveal-timing paths.**
- [ ] **Step 4: Final commit if anything was touched during verification**, then this branch is ready for a PR.

---

## Notes / risks carried from the spec (§12)

- **Register integration ordering:** resolved — own store now; if the use-case-builder draft store lands later, a follow-up can switch `sendShadowAgentsToRegister` to write through it so entries appear in `/register`'s list.
- **Visual density:** three streaming panes + report on one screen — the responsive `grid-cols-1 md:grid-cols-3` stacks panes on narrow viewports; verify the report card is reachable without excessive scroll.
- **Icon:** `Radar` confirmed available; fallback `ScanSearch` if ever needed.
