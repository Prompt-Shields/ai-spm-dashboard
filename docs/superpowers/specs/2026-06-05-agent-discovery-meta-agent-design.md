# Agent Discovery — Meta-Agent Multi-Cloud Sweep

- **Status:** Design approved, pending implementation plan
- **Date:** 2026-06-05
- **Route:** `/agent-discovery`
- **Owner namespace:** `agentDiscovery`
- **Source doc:** "Discoverability is the critical missing link in scaling Enterprise AI"
  (AWS Bedrock AgentCore Registry · Azure AI Foundry · GCP Knowledge Catalog; the
  "Meta-Agent for Discovery" that produces a daily *State of AI Compliance* report).

## 1. Problem & Goal

The source doc describes **discoverability** as the missing link in enterprise AI: without a
central view, orgs get "agent sprawl" — undiscovered/unregistered agents invisible to IT
Security and GRC. The doc's final step is to **deploy a "Meta-Agent for Discovery"**: an
admin agent that queries the AWS Agent Registry, Azure Management APIs, and GCP Knowledge
Catalog to generate a *State of AI Compliance* report for the CISO.

This feature is a **demo screen** that shows that meta-agent **in action**: the user clicks
"Run discovery sweep," watches the meta-agent sweep all three clouds and stream discovered
agents in real time (registered, pending, and **shadow/unregistered**), and ends with a
generated *State of AI Compliance* report. Discovered shadow agents feed the app's existing
Discover/Register shadow-AI story.

It is a **theatrical, scripted demo** — not a real cloud integration.

## 2. Scope

### In scope
- New route `/agent-discovery` + a left-nav entry ("Agent Discovery").
- A meta-agent control bar (identity + Run / Skip animation / Replay).
- Three animated cloud panes (AWS / Azure / GCP) that stream scripted discovered agents.
- A live tally and a climax *State of AI Compliance* report card "prepared for: CISO."
- **Export report** (Markdown/text) and **Send N shadow agents to Register**.
- Light integration: a `localStorage`-backed run summary that `/discover` reads to show a
  shadow-findings banner/count; "Send to Register" records auto-detected use cases.
- Full localization in **en / nb / fr** from the start.

### Out of scope (YAGNI)
- Any real cloud API / registry / MCP / A2A calls.
- Real auth / IAM / RBAC (approval state and access are display-only).
- Editing discovered agents or their manifests.
- Refactoring `/discover` or `/register` away from their current static data sources
  (the integration is additive only).
- Persisting full discovered-agent inventories server-side.

## 3. User Flow

1. User opens `/agent-discovery` (nav).
2. **Idle state:** the meta-agent bar shows the agent identity
   ("Discovery Meta-Agent — queries AWS Bedrock AgentCore Registry · Azure AI Foundry /
   Management API · GCP Knowledge Catalog over MCP + A2A") and a primary
   **Run discovery sweep** button. The three cloud panes show empty/ready states.
3. **Running:** each cloud pane animates through phases — *Connecting → Querying registry →
   streaming agents* — revealing discovered-agent cards on a stagger (reusing the
   `AgentConversationCard` timed-reveal pattern). A live tally updates: total · registered ·
   pending · **shadow** · residency violations. A **Skip animation** control jumps to the
   final state.
4. **Complete:** the *State of AI Compliance* report card appears with per-cloud totals,
   shadow count, compliance gaps, and recommended actions. Actions: **Export report**,
   **Send N shadow agents to Register**, and **Replay**.
5. **Send to Register:** records the shadow agents as auto-detected use cases in a
   `localStorage` store and writes a run summary; navigating to `/discover` shows a banner
   reflecting the latest run's shadow findings.

## 4. Screen Layout

```
┌───────────────────────────────────────────────────────────────────┐
│ Agent Discovery                                                     │
│ Meta-agent sweeps AWS / Azure / GCP registries to surface every     │
│ AI agent and flag shadow AI.                                        │
├───────────────────────────────────────────────────────────────────┤
│ [Meta-agent bar]  Discovery Meta-Agent · MCP+A2A   [Run sweep ▶]    │
├───────────────────────────────────────────────────────────────────┤
│ Tally: 18 total · 11 registered · 3 pending · 4 shadow · 2 residency│
├──────────────┬──────────────────┬─────────────────────────────────┤
│ AWS pane     │ Azure pane       │ GCP pane                          │
│ Bedrock      │ AI Foundry Hubs  │ Knowledge Catalog                 │
│ AgentCore    │                  │                                   │
│ [agent card] │ [agent card]     │ [agent card]                      │
│ [agent card] │ [agent card]     │ [agent card] …                    │
├───────────────────────────────────────────────────────────────────┤
│ [State of AI Compliance report card — prepared for: CISO]           │
│  totals · shadow · gaps · residency violations · recommended actions│
│  [Export report]   [Send 4 shadow agents to Register]   [Replay]    │
└───────────────────────────────────────────────────────────────────┘
```

## 5. Architecture

### File layout
```
app/agent-discovery/page.tsx                 – route shell, renders <DiscoveryConsole/>
components/agent-discovery/
  discovery-console.tsx                       – orchestrator: run state + phase sequencing, owns tally
  meta-agent-bar.tsx                          – identity line + Run / Skip / Replay controls
  cloud-pane.tsx                              – one cloud column: header + streamed agent cards
  discovered-agent-card.tsx                   – one agent's manifest card (presentational)
  compliance-report-card.tsx                  – the CISO report climax + action buttons
lib/agent-discovery/
  types.ts                                    – DiscoveredAgent, Cloud, ApprovalState, ComplianceReport
  data.ts                                     – scripted CLOUD_AGENTS fixture
  report.ts                                   – buildComplianceReport(agents) (pure)
  export.ts                                   – formatReportMarkdown(report) (pure)
  store.ts                                    – localStorage: run summary + shadow→register records
lib/i18n/locales/{en,nb,fr}/agentDiscovery.ts – new namespace
lib/i18n/locales/{en,nb,fr}/nav.ts            – add `agentDiscovery` key
lib/i18n/locales/{en,nb,fr}.ts                – wire namespace into the three barrels
components/app-sidebar.tsx                    – add { href:'/agent-discovery', key:'agentDiscovery', Icon: Radar }
app/discover/page.tsx                         – add shadow-findings banner reading store.getRunSummary()
```

### Component boundaries
- **`discovery-console.tsx`** owns the run state machine (`idle | running | complete`),
  the per-cloud phase progress, and the derived tally. It feeds each `cloud-pane` the slice
  of agents revealed so far. No child reads global state or `localStorage` directly.
- **`cloud-pane.tsx`** is presentational: given a cloud + a list of revealed agents + a
  phase label, it renders. It does not own timers.
- **`meta-agent-bar.tsx`** renders identity + buttons; emits `onRun` / `onSkip` / `onReplay`.
- **`compliance-report-card.tsx`** takes a `ComplianceReport` + handlers; owns no data
  fetching. Export/Send handlers are passed in from the console.

### Run sequencing (animation)
- The console drives reveal with a `setInterval`/`visibleCount` approach mirroring
  `AgentConversationCard`. Phases per cloud: connect (short delay) → query (short delay) →
  stream agents (staggered reveal). Clouds run in parallel visually.
- **Skip animation** sets all agents revealed + state `complete` immediately.
- **Replay** resets `visibleCount` to 0 and re-runs.
- All timers are cleaned up on unmount.
- `Date.now()` is **not** used for timing logic that must be deterministic in tests; the
  reveal interval is fixed and the report is computed from the static agent list, so unit
  tests don't depend on wall-clock.

## 6. Data Model (scripted)

```ts
type Cloud = 'aws' | 'azure' | 'gcp'
type ApprovalState = 'approved' | 'pending' | 'unregistered' // unregistered = shadow

interface DiscoveredAgent {
  id: string
  name: string
  cloud: Cloud
  registry: string            // 'Bedrock AgentCore' | 'AI Foundry Hub' | 'Knowledge Catalog'
  owner: string
  protocol: 'mcp' | 'a2a' | 'none'
  purpose: string
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted'
  regulatoryScope: string[]   // e.g. ['SOC2'], ['HIPAA','PCI-DSS'], ['GDPR']
  region: string              // e.g. 'eu-west-1', 'westeurope', 'europe-west4'
  residencyOk: boolean        // false ⇒ processing restricted data outside allowed region
  manifestComplete: boolean   // false ⇒ missing security-by-design manifest fields
}
```

`CLOUD_AGENTS` is a fixed fixture (~15–20 agents spread across the three clouds) including a
deliberate mix: approved agents, a few `pending`, several `unregistered` (shadow), some with
`residencyOk: false` and some with `manifestComplete: false`, so the report has content. The
fixture maps to the doc's example agent types (Automated Control Auditor, Incident Response
Triage, Policy Exception & Risk Assessment).

## 7. Compliance Report (`report.ts`)

`buildComplianceReport(agents: DiscoveredAgent[]): ComplianceReport` is **pure** and
deterministic:

```ts
interface ComplianceReport {
  total: number
  perCloud: { cloud: Cloud; total: number; shadow: number }[]
  registered: number
  pending: number
  shadow: number                 // approvalState === 'unregistered'
  residencyViolations: number    // residencyOk === false
  missingManifests: number       // manifestComplete === false
  restrictedDataAgents: number   // dataClassification === 'restricted'
  recommendedActions: string[]   // derived, localized keys (see §9)
}
```

`recommendedActions` are derived from thresholds (e.g. "Register N shadow agents",
"Remediate N residency violations", "Complete N missing manifests") and rendered from
localized templates — the function returns structured data, not pre-localized strings, so
the UI localizes them.

## 8. Integration with Discover / Register (`store.ts`)

Keyed `localStorage`, versioned (`aispm.agentDiscovery.v1`):

- **Run summary:** `{ shadowCount, total, ranAtIso }` written when a sweep completes (or on
  Send-to-Register). `getRunSummary()` returns it or `null`.
- **Send N shadow agents to Register:** for each selected shadow agent, build a `UseCase`
  (`status: 'discovered'`, `discoveryMethod: 'auto-detect'`, `dataClassification` from the
  agent, `ownerId: null`, `complianceStatus` all-`gap`, models `[]`, risks seeded
  `'shadow-ai'` category) and append to a stored array. (Same `UseCase` shape verified in
  `lib/aimaps-types.ts`.)
- **`/discover` banner:** Discover reads `getRunSummary()` in a client-only effect and, if
  present, renders a small banner: "Meta-agent found {shadowCount} shadow agents across
  clouds — review." Clicking links back to `/agent-discovery`. This is **additive**; it does
  not change Discover's existing `DISCOVERY_STATS` rendering.

> Note: a parallel spec (`2026-06-05-ai-use-case-builder-design.md`) also introduces a
> `localStorage` use-case draft store and a `getUseCasesWithDrafts()` merge into `/register`.
> If that feature lands first, "Send to Register" here SHOULD write through that same store
> so the entries actually appear in `/register`. If it has not landed, this feature ships its
> own store and the Discover banner is the visible integration; wiring into `/register`'s
> rendered list is deferred to whichever feature owns the merge helper. The implementation
> plan must pick one based on merge order and state it explicitly.

## 9. Localization

- New `agentDiscovery` namespace in `en`, `nb`, `fr`, wired into all three barrels and the
  `Messages` type (so the existing i18n completeness test guards it).
- A new `nav.agentDiscovery` key in each locale's `nav.ts`.
- Includes: title/subtitle, meta-agent identity copy, phase labels (Connecting / Querying /
  Streaming), cloud + registry labels, agent-card field labels, approval-state labels,
  tally labels, report headings, recommended-action templates, and button labels.
- Norwegian reuses the locale-review terminology decisions (e.g. "Skygge-KI" for shadow AI,
  consistent with existing `discover`/`policyEnforcement` namespaces).

## 10. Edge Cases & Error Handling

- **Re-run / Replay:** resets revealed agents and tally; idempotent.
- **Skip during run:** immediately completes; timers cleared.
- **Unmount mid-run:** all intervals/timeouts cleared in effect cleanup.
- **SSR / hydration:** all `localStorage` access (run summary, send-to-register) happens in
  client-only effects to avoid Next.js hydration mismatch; `/discover`'s banner renders only
  after mount.
- **Empty selection on Send:** the "Send N shadow agents" button is disabled when N = 0.
- **Export failure:** Blob + object-URL download; on failure, fall back to copy + a
  non-blocking toast.

## 11. Testing

- **Vitest** unit tests (run with `--pool=forks` per the repo's pool-flake note):
  - `report.buildComplianceReport()` — counts (shadow/pending/registered/residency/manifest)
    and recommended-action derivation against the fixture and edge inputs (empty list, all
    approved).
  - `export.formatReportMarkdown()` — structure/completeness.
  - `store.shadowAgentToUseCase()` mapping — correct enums (`discovered`, `auto-detect`,
    `shadow-ai` risk) verified against `lib/aimaps-types.ts`.
  - A `data.ts` integrity test — every agent has required fields and valid enum values; the
    fixture contains at least one of each approval state and at least one residency/manifest
    gap (so the demo report is non-trivial).
- The existing i18n completeness test covers the new `agentDiscovery` + `nav` keys.
- **No** `next build` / `tsc` in-sandbox (they hang) — rely on Vitest + careful typing.

## 12. Risks / Open Questions

- **Register integration ordering** (see §8): whether "Send to Register" writes through the
  use-case-builder draft store or a local one depends on merge order; the plan must decide.
- **Visual density:** three streaming panes + cards + report on one screen is busy; the plan
  should confirm responsive behavior (panes stack on narrow viewports) and that the report
  card is reachable without excessive scroll after a run.
- **Icon choice:** `Radar` is proposed for the nav; confirm it is exported by the installed
  `lucide-react` version (fallback: `ScanSearch`, already used on `/discover`).
