# Internal Skill Marketplace — /marketplace

**Date:** 2026-09-02
**Status:** Approved (user, 2026-09-02)
**Branch:** feat/skill-marketplace

## Goal

Add an internal skill marketplace: a place where employees discover and adopt
approved AI skills built by their colleagues, builders submit new skills, and
security/compliance reviews each submission against an automated risk scan
before it can be shared org-wide.

This closes the three gaps the current `/adoption` → **Skills** tab leaves
open. That tab is a read-only *rollup* over a four-skill placeholder list — it
shows statuses and counts, but there is no way to browse the skills, no way to
submit one, and "approved" is a label with no evidence behind it. The
marketplace is the working surface; the Adoption tab keeps the ROI narrative
and the governance chain, and links to it.

Problems addressed (from the Group Induver / Eva conversation):

| # | Problem | Where it is solved |
|---|---------|--------------------|
| 2 | Skills are siloed; sharing runs on spreadsheets and AI champions | Browse + suggested-for-your-team + leaderboard |
| 3 | No security/compliance check before a skill is shared | Automated scan + Review queue |
| 4 | Cannot show ROI beyond token counts | Per-skill ROI, rolling up to the Adoption figure |
| 5 | Approved skills are not discoverable; rollout is manual | Suggested strip, adopt flow, adoption tracking |

## Non-goals

- No real scanning. The scan is seeded per skill and must be visibly labelled
  as simulated so it is never mistaken for live DLP/egress output.
- No backend and no API routes. State is client-side (`localStorage`),
  consistent with `/agent-control` and `/agent-discovery`.
- No authentication or real identity. The current viewer is a fixed mock
  persona (team `Claims · Antwerp`) used to drive "suggested for your team".
- No editing of an approved skill's content, no versioning history beyond a
  displayed `version` string.
- Skill content (names, purposes, review text) is English-only sample data;
  UI chrome is translated (en/fr/nb) like the rest of the app.

## Architecture

New module `lib/marketplace/`, mirroring the `lib/agent-control/` layout:

```
lib/marketplace/
  types.ts       MarketplaceSkill, RiskFinding, ScanReport, SkillReview, Builder
  data.ts        MARKETPLACE_SKILLS — 16 seeded skills
  derive.ts      pure derivations (scan verdict, ROI, rating, matching, leaderboard)
  store.ts       localStorage overrides: adopted / submitted / review decisions
  format.ts      hours, currency, percent helpers
  derive.test.ts
  store.test.ts
```

New route `app/marketplace/page.tsx` + `components/marketplace/` for the UI.

### Source of truth

`MARKETPLACE_SKILLS` becomes the single source of truth for skills.
`lib/usage-quality-data.ts` stops declaring `library` as a literal and instead
derives it, so the Adoption tab and the marketplace can never disagree:

- `USAGE_QUALITY.library` → `deriveLibrary(MARKETPLACE_SKILLS)`, returning the
  existing `LibrarySkill` shape (structural subset of `MarketplaceSkill`).
- `USAGE_QUALITY.governanceChain[].count` for the `review` and `promote`
  stages → derived from status counts. The `discover` / `summarise` / `match`
  counts stay seeded constants (they describe org-wide detection beyond the 16
  catalogued skills).

**The chain is a cumulative funnel and must stay monotonically decreasing** —
it renders left-to-right with arrows, so a later stage larger than an earlier
one reads as a bug. The stages therefore count *reached this stage or beyond*,
not *sitting at this stage*:

- `review.count` = every catalogued skill, i.e. everything that entered the
  gate = `MARKETPLACE_SKILLS.length` (16).
- `promote.count` = skills that cleared it = approved count (11).

Giving `84 → 61 → 37 → 16 → 11`. A unit test asserts the whole chain is
non-increasing, so future seed edits cannot silently break the funnel.

This follows the repo rule that coverage/metric numbers derive from one module
and are never hardcoded in the UI.

## Data model (`lib/marketplace/types.ts`)

```ts
import type { RiskSeverity } from '@/lib/mcp-discovery-data'
import type { PiiType } from '@/lib/pii/types'
import type { RequirementFrameworkKey } from '@/lib/framework-requirements'
import type { ReviewStatus } from '@/lib/usage-quality-data'

export type SkillCategory =
  | 'claims' | 'underwriting' | 'legal' | 'hr'
  | 'distribution' | 'finance' | 'it' | 'customer-service'

/** One line of the simulated pre-share scan. */
export type FindingKind = 'egress' | 'pii' | 'dataStore' | 'framework'

export interface RiskFinding {
  kind: FindingKind
  /** 'ok' means the check passed — rendered as a tick, not a warning. */
  severity: RiskSeverity | 'ok'
  label: string          // e.g. "External egress"
  detail: string         // e.g. "crm.brokerportal.eu — not on allowlist"
  piiTypes?: PiiType[]   // when kind === 'pii'
  framework?: RequirementFrameworkKey // when kind === 'framework'
}

export interface ScanReport {
  scannedAt: string      // ISO date
  findings: RiskFinding[]
}

export interface SkillReview {
  author: string
  team: string
  rating: number         // 1..5, integer
  comment: string
  at: string             // ISO date
}

export interface MarketplaceSkill {
  id: string
  name: string
  purpose: string          // one line — what it does
  whenToUse: string[]      // 2–4 bullets — where you'd reach for it
  exampleInput: string     // a sample prompt/input, for the detail view
  category: SkillCategory
  builder: string          // person who built it
  sourceTeam: string
  version: string          // e.g. "1.3"
  submittedAt: string      // ISO date
  status: ReviewStatus     // 'approved' | 'in_review' | 'blocked'
  reviewer?: string
  note?: string            // reviewer's decision note
  adopters: number
  reachable: number
  reuseTeams: number
  suggestedTeams: string[]
  usesThisMonth: number
  minutesSavedPerUse: number
  scan: ScanReport
  reviews: SkillReview[]
}

export interface Builder {
  name: string
  team: string
  skills: number       // skills contributed
  teamsReached: number // distinct teams using them
  adopters: number
  avgScoreLift: number // points, avg across their approved skills
}
```

### Seeded content (`data.ts`)

16 skills spanning the categories above, with this status mix:

- **11 approved** — the browsable catalogue, with ratings and adoption.
- **3 in review** — populate the Review queue with actionable findings.
- **2 blocked** — show a refused decision with its reason (e.g. GDPR Art. 22
  automated profiling for CV screening, an unapproved external endpoint).

The four skills already in `USAGE_QUALITY.library` (`claims-summary`,
`policy-qa`, `broker-reply`, `hr-screening`) are carried over with their
existing ids, names, purposes, teams, statuses and counts unchanged, so those
four *rows* render identically.

The tab's **numbers do change**, intentionally — a four-skill "library" was a
placeholder. Three labels move and are expected to:

| Location | Before | After |
|----------|--------|-------|
| `usage-quality-section.tsx:425` | "4 skills in the library" | "16 skills in the library" |
| `:409-410` | 2 approved · 1 awaiting review | 11 approved · 3 awaiting review |
| `:531` ROI sub-label | "4 shared skills · adopted ≥1" | "16 shared skills · adopted ≥1" |

The `:531` sub-label pairs the skill count with `workforceUpskilledRate` and
still reads correctly at 16; no rewording needed.

Every skill carries a `scan` with 3–5 findings. Approved skills have all-`ok`
or `low` findings; in-review ones carry at least one `medium`/`high`.

`BUILDERS` is derived from `MARKETPLACE_SKILLS`, not declared separately.

## Derivations (`derive.ts`, pure and unit-tested)

| Function | Returns |
|----------|---------|
| `scanVerdict(scan)` | highest severity among findings; `'ok'` when all pass |
| `blockingFindings(scan)` | findings with severity `high` or `medium` |
| `avgRating(skill)` | mean of `reviews[].rating`, `0` when none |
| `hoursSavedPerMonth(skill)` | `usesThisMonth × minutesSavedPerUse / 60`, × `qualityDiscount()` |
| `valuePerMonth(skill)` | `hoursSavedPerMonth × USAGE_QUALITY.roi.hourlyRate` |
| `marketplaceRoi(skills)` | totals across approved skills: hours, value, adopters |
| `suggestedFor(team, skills)` | approved skills whose `suggestedTeams` includes `team`, minus already-adopted, ranked by `adoptionRate` (reused from usage-quality-data) |
| `searchSkills(skills, q, filters)` | case-insensitive match on name/purpose/builder/team, then category + status filters |
| `leaderboard(skills)` | `Builder[]` ranked by `teamsReached`, tie-broken by `adopters` |
| `reviewQueueSkills(skills)` | skills with status `in_review`, oldest `submittedAt` first |

`qualityDiscount()` returns `USAGE_QUALITY.roi.qualityHoursSaved /
rawHoursSaved` (~0.736), computed rather than literal. It is a **function, not
a module-scope const**, to keep `derive.ts` free of top-level references to
`usage-quality-data` — see the import-direction note below.

**What "reconcile" means here, precisely:** the marketplace total is a
*subset* of org-wide savings — skills are one channel of AI usage among many —
so there is **no** requirement that per-skill hours sum to
`roi.qualityHoursSaved`. The rule is only:

1. Per-skill hours apply the same `qualityDiscount()` the headline applies.
2. `marketplaceRoi(approved).hours` < `USAGE_QUALITY.roi.qualityHoursSaved`.

The seed lands at roughly 680 of the 2180 org-wide quality hours (~31%), which
is the figure the Browse KPI strip shows. Both points are unit-tested; no seed
tuning to hit a target number.

### Import direction (no cycles)

`usage-quality-data` needs `deriveLibrary`, and the ROI derivations need
`USAGE_QUALITY.roi`. To keep that acyclic, the two live in different files:

- `library.ts` — `deriveLibrary`, `deriveChainCounts`. Imports `data.ts` and
  `types.ts` only, plus a **type-only** import of `LibrarySkill` (erased at
  runtime). `usage-quality-data` imports this one.
- `derive.ts` — everything needing `USAGE_QUALITY`. Imports
  `usage-quality-data`; nothing in that module imports back.

Both run over the **baseline** `MARKETPLACE_SKILLS`, never over
`applyOverrides(...)` output: `USAGE_QUALITY` is a module-scope const evaluated
during SSR, so folding `localStorage` state into it would hydration-mismatch.

### Name collisions

`lib/usage-quality-data.ts` already exports `adoptionRate` and `reviewQueue`,
and `usage-quality-section.tsx` imports both.

- `adoptionRate` is generic over `{ adopters, reachable }`, which
  `MarketplaceSkill` satisfies — **reuse it**, do not redefine it.
- `reviewQueue` there returns a *count*; the marketplace needs the *list*, so
  the new one is named `reviewQueueSkills` to avoid crossing the wires.

## State (`store.ts`)

Same shape as `lib/agent-control/store.ts`: an SSR-guarded `localStorage`
overrides map folded in at read time over an immutable baseline, key
`aispm.marketplace.v1`.

```ts
export interface MarketplaceState {
  adopted: string[]                              // skill ids the viewer adopted
  decisions: Record<string, {                    // reviewer actions
    status: ReviewStatus
    note: string
    by: string
    at: string
  }>
  submitted: MarketplaceSkill[]                  // skills added via the form
}
```

- `applyOverrides(skills, state)` folds decisions onto statuses, appends
  submitted skills, and bumps `adopters` by 1 for adopted ids.
- Pure producers (`withAdopted`, `withDecision`, `withSubmission`) are
  exported and unit-tested; the read/write wrappers are not.
- `clearState()` backs a Reset control.

## UI

### Navigation

New sidebar entry between **AI Spend** and **Map**: `/marketplace`, `Store`
icon (lucide), `beta: true`. Locale files are per-namespace, so `marketplace`
is added to `lib/i18n/locales/{en,fr,nb}/nav.ts` — all three, since
`lib/i18n/completeness.test.ts` enforces parity.

### `/marketplace` — three tabs

Uses the same `Tabs` / `TabsList` pattern as `components/usage-quality-section.tsx`.

**Browse**
1. A simulated-data banner (scan results are seeded, not live).
2. KPI strip: approved skills, adopters, hours saved/month, value/month.
3. "Suggested for your team" — up to 3 cards for the mock persona's team.
4. Search input + category / status filters.
5. Skill grid. Each card: name, status badge, category, builder · team,
   ★ average, adopters, hours saved/month, and an **Adopt** button
   (approved only; shows "Adopted ✓" once in the viewer's state).
6. Builder leaderboard panel — rank, name, team, skills, teams reached,
   avg score lift.

Clicking a card opens a detail drawer built on the
`components/agent-control/agent-drawer.tsx` pattern (bespoke, no Radix —
there is no `components/ui/sheet` in this repo and none is being added):
purpose, when-to-use bullets, example input, the scan panel, reviews list,
adopt button.

**Submit**
A form: name, purpose, when-to-use, category, team, example input, pasted
skill body.

`react-hook-form` and `zod` are in `package.json` but **imported nowhere** in
this codebase, and `components/ui/` has no form primitives (only `badge`,
`card`, `progress`, `select`, `tabs`). So the form follows the existing
pattern instead — raw `<input>` / `<textarea>` / `<button>` with Tailwind, as
in `components/integrations/sentinel-connect-wizard.tsx` — with a small local
`validateSubmission(draft): string[]` returning field errors. No new form
stack is introduced.

On submit it runs `scanDraft(body)`: a deterministic mock scan matching a
short list of URL patterns and PII markers, reusing `lib/pii/detector.ts`
where it fits. Findings are shown **to the builder** before the skill enters
the queue, so obvious problems get fixed at source. Confirming adds it to
`submitted` with status `in_review`.

**Review (n)**
Badge shows the queue length. Per submission: metadata header, the scan panel
(`⚠ / ✓` per finding, grouped by kind, severity-coloured using the repo's
existing risk chip colours), then **Approve** / **Request changes** / **Block**
with a required note. The decision is written to `decisions` and an audit line
(`who · what · when`) is rendered on the skill. Approving moves it into Browse.

Severity colours: `components/risk-chip.tsx` cannot be reused — it is typed to
`Risk` from `lib/aimaps-types` (severities `critical | high | medium | low`)
and renders `risk.name` + `owaspRef`. The scan panel uses a local
`severity → Tailwind class` map borrowing that component's palette.

### `/adoption` changes

- The Skills tab's markup is unchanged; it now renders 16 derived skills, and
  the three count labels tabulated above move accordingly.
- The section header gains an "Open marketplace →" link.
- Governance-chain review/promote counts come from derived status counts.

## Error handling & edge cases

- `localStorage` unavailable or malformed → `read()` returns the empty state;
  the page renders the baseline catalogue (same guard as agent-control).
- Empty search results → an explicit empty state with a clear-filters button.
- Skill with no reviews → rating hidden rather than shown as ★0.
- `reachable === 0` → adoption rate renders as `—`, not `NaN%`.
- Review actions require a note; the buttons are disabled until one is typed.
- A submitted skill cannot be adopted until approved.

## Testing

- `derive.test.ts` — every function in the derivations table, including the
  zero/empty cases above, and the two ROI rules: the discount is applied, and
  the marketplace total stays below `USAGE_QUALITY.roi.qualityHoursSaved`.
- `library.test.ts` — `deriveLibrary` preserves the four legacy skills'
  fields, and the derived governance chain is monotonically non-increasing.
- `store.test.ts` — pure producers: adopt is idempotent, a decision overrides
  the baseline status, submissions append, reset clears.
- `lib/i18n/completeness.test.ts` must stay green after adding `nav.marketplace`.
- Run with `npx vitest run --pool=forks` (the default pool flakes in this
  sandbox).
- UI verified in the browser pane: browse → filter → detail → adopt, submit →
  scan → queue, review → approve → appears in Browse.

## Out of scope for v1 (deliberately deferred)

- In-flow nudging inside Claude itself (only the in-app suggested strip ships).
- Skill version history and diffing.
- Notifications/email to matched teams on promotion.
- Real scanning, real identity, server persistence.
