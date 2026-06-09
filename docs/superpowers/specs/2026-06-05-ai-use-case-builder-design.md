# AI Use Case Builder — Guided Tutorial Wizard

- **Status:** Design approved, pending implementation plan
- **Date:** 2026-06-05
- **Route:** `/use-case-builder`
- **Owner namespace:** `useCaseBuilder`

## 1. Problem & Goal

The dashboard already has a **Discover** flow (agents interview employees to extract
use cases) and a **Register** (`/register`) that tracks discovered use cases through a
`discovered → assessed → owned → mitigated → compliant` pipeline. What is missing is the
*upstream* step: helping a user who has a vague idea actually **define and draft a
well-formed AI use case** in the first place.

This feature adds a guided, educational wizard that teaches the standard
"define an AI use case" framework while the user fills it in, then produces a
shareable one-paragraph summary and (optionally) a new entry in the Register.

It is both a **tutorial** (it teaches the framework) and a **tool** (it drafts a real
artifact) — a "teach + do" experience.

## 2. Scope

### In scope
- A standalone route `/use-case-builder` with a left-nav entry and CTA buttons on
  `/register` and `/discover`.
- An intro/teach panel + a 6-step wizard mapped to the framework, each step with
  inline teaching content beside the input.
- **Scripted** (deterministic, non-LLM) "AI suggestion" affordances with a typing
  animation, matching the app's existing scripted-demo pattern.
- A generated one-paragraph summary the user can **Copy**, **Export** (Markdown/text),
  and **Add to Register** (creates a `UseCase`).
- `localStorage`-backed draft persistence; `/register` merges saved drafts with the
  static `USE_CASES`.
- Full localization in **en / nb / fr** from the start.

### Out of scope (YAGNI)
- Real LLM integration / API keys / server calls.
- Server-side persistence of drafts (no new API route, no DB).
- Editing or re-opening *existing* Register use cases through this wizard.
- Multi-user / auth / sharing beyond local export.
- Analytics/telemetry for the wizard.

## 3. User Flow

1. User opens `/use-case-builder` (nav or CTA).
2. **Intro / teach panel (step 0):** explains *what an AI use case is*, shows the
   framework's illustrative department examples (Customer Support, Marketing, Finance, HR,
   Supply Chain — these are *teaching illustrations*, not the step-1 department select
   options, which are the canonical `USE_CASES` keys), and shows the one-paragraph
   template as a worked example. Primary action: **Start drafting**.
   Secondary: **Resume draft** if a saved draft exists.
3. **Steps 1–6 (two-column "teach + do"):** left column = framework guidance + a worked
   example for that step; right column = the input control(s). Next is disabled until the
   step's minimum is satisfied. Back is always allowed. State autosaves to `localStorage`
   on each change.
4. **Review step:** shows the assembled one-paragraph summary plus a structured recap.
   User can edit the use-case **name**, then choose: **Copy**, **Export**, **Add to
   Register**.
5. On **Add to Register**: a `UseCase` is created and persisted to the draft store; a
   success state offers "View in Register" (navigates to `/register`, where the new
   entry appears under `discovered`).

## 4. Step → Input → Data Mapping

| # | Framework step | Wizard input | Draft field(s) | UseCase field on save |
|---|----------------|--------------|----------------|------------------------|
| 0 | What is a use case (teach) | — (read only) | — | — |
| 1 | Core problem (Why) | Pain-point textarea + department select (**canonical English keys**, see below) | `problem`, `department` | `department`; feeds `description` |
| 2 | AI intervention (How) | Capability select (`nlp`/`prediction`/`automation`/`vision`/`genai`) + model multi-select **from the `AI_MODELS` catalog** | `capability`, `models: AIModel[]` | `models`; feeds `description` |
| 3 | Business value & KPIs | Repeatable KPI rows (`metric`, `from`, `to`) + an optional "expected outcome / ROI" text input + scripted "Suggest KPIs" | `kpis[]`, `expectedValue?` | stored on draft; feeds summary |
| 4 | Data readiness | Data-availability select (`yes`/`partial`/`no`) + sensitivity select (**`public`/`internal`/`confidential`/`restricted`** — the `dataClassification` union) | `dataAvailable`, `dataSensitivity` | `dataClassification`; seeds a `Risk` |
| 5 | Feasibility vs impact | Interactive 2×2 matrix (click a quadrant) | `priority` (`quick-win`/`strategic`/`fill-in`/`avoid`) | stored on draft; feeds summary |
| 6 | Persona & workflow | Persona textarea + human-in-the-loop toggle | `persona`, `humanInLoop` | stored on draft; feeds summary |
| ✓ | Review & generate | Name field + generated summary + actions | `name`, `summary` | `name`, `description = summary` |

### Pinned enum / value sets (so the deterministic rules typecheck and fire)
- **`draft.dataSensitivity`** is exactly the `UseCase['dataClassification']` union:
  `'public' | 'internal' | 'confidential' | 'restricted'`. The sensitivity select MUST
  offer these four values so (a) `dataClassification: draft.dataSensitivity` typechecks
  and (b) the `seedRisks` leakage rule (fires on `confidential`/`restricted`) can trigger.
- **`draft.department`** stores the **canonical English department key**, not a localized
  display label. The select's option set is the distinct departments already present in
  `USE_CASES` — the real distinct keys are `'Claims'`, `'Customer Service'`, `'Finance'`,
  `'HR'`, `'IT'`, `'Legal'`, `'Risk & Compliance'`, `'Underwriting'` (exclude the
  catch-all `'Various'` from the selectable set) — so a saved use case matches the
  existing `/register` department filters and the `seedRisks` bias rule
  (`draft.department === 'HR'`) works. Localized labels are display-only.
- **`draft.capability`** ∈ `'nlp' | 'prediction' | 'automation' | 'vision' | 'genai'`.
- **Model options** are the 6 `AI_MODELS` catalog entries (GPT-4o, Claude 3.5 Sonnet,
  Gemini Pro, GitHub Copilot, Llama 3, Mistral Large).

## 5. Architecture

### File layout
```
app/use-case-builder/page.tsx              – route shell, renders <UseCaseBuilderWizard/>
components/use-case-builder/
  wizard.tsx                               – orchestrator: step index, progress, next/back, owns draft state
  teach-panel.tsx                          – shared left-column teaching block (heading, body, example)
  suggestion-button.tsx                    – "✨ AI suggest" control with typing-reveal animation
  steps/step-intro.tsx                     – step 0 (teach: what is a use case + examples + template)
  steps/step-problem.tsx                   – step 1
  steps/step-intervention.tsx              – step 2
  steps/step-kpis.tsx                      – step 3
  steps/step-data.tsx                      – step 4
  steps/step-feasibility.tsx               – step 5 (2×2 matrix)
  steps/step-persona.tsx                   – step 6
  steps/step-review.tsx                    – review + copy/export/add-to-register
lib/use-case-tutor/
  types.ts                                 – UseCaseDraft, Capability, Priority types
  suggestions.ts                           – scripted suggestion engine (pure)
  template.ts                              – assembleSummary(draft) -> string
  export.ts                                – formatDraftMarkdown(draft) -> string
lib/use-case-drafts.ts                     – localStorage CRUD + getUseCasesWithDrafts() + draftToUseCase()
lib/i18n/locales/{en,nb,fr}/useCaseBuilder.ts   – new namespace
```

### Component boundaries
- **`wizard.tsx`** owns *all* draft state and the current step index. It passes
  `(draft, onChange, onNext, onBack)` to step components. Steps are pure presentational
  units — no step reads or writes `localStorage` or global state directly.
- Each **step component** takes `{ draft, onChange }` and renders a `teach-panel` (left)
  + its inputs (right). Each is independently testable with a mock draft.
- **`suggestion-button.tsx`** takes `suggestions: string[]` and `onPick(value)`. It owns
  only the reveal animation; it does not know where suggestions come from.

### State & persistence
- Draft state lives in the wizard via `useState`/`useReducer`.
- A `useEffect` writes the draft to `localStorage` (key `aispm.useCaseDraft.v1`) on change
  (debounced). On mount, the wizard hydrates from that key if present.
- Completed/saved use cases are stored under `aispm.useCaseDrafts.v1` (an array).
- `getUseCasesWithDrafts()` returns `[...USE_CASES, ...savedDrafts.map(draftToUseCase)]`;
  `/register` swaps its direct `USE_CASES` import for this helper (client-side, in a
  `useEffect`/`useState` to avoid SSR/`localStorage` hydration mismatch).
- A "Reset demo data" affordance clears both keys.

## 6. Scripted Suggestion Engine (`lib/use-case-tutor/suggestions.ts`)

Pure, deterministic, no I/O:

```ts
export function suggest(field: 'kpis' | 'problem' | 'persona', ctx: SuggestContext): string[]
```

- Keyed lookups on `ctx.department` + `ctx.capability` (+ light keyword matching on the
  problem text). Example: `department: 'Customer Service'`, `capability: 'genai'` →
  KPI suggestions `['Response time: 4h → <2min', 'Ticket deflection: 0% → 40%', 'CSAT: +15%']`.
- Tables seeded from the framework's worked examples (billing/CSAT, churn/retention).
- A small generic fallback set when no keyed match exists.
- The `suggestion-button` plays a brief typing-reveal (reusing the
  `AgentConversationCard` reveal pattern) so it *feels* generated; the data is a table.

## 7. Summary Generation & Export

- **`template.assembleSummary(draft)`** fills the canonical template:
  > "We want to use **{capability}** to help **{department}** solve the problem of
  > **{problem}**. We will measure success by tracking **{kpis}**, and we expect this to
  > result in **{expectedValue}**."
  Localized per active locale. `{capability}` is rendered via a localized label map
  (e.g. `genai` → "generative AI"); `{kpis}` joins `draft.kpis` as
  "metric: from → to" clauses; `{expectedValue}` is `draft.expectedValue` (the step-3
  expected-outcome input). If `draft.expectedValue` is empty, the final clause is omitted
  rather than left as a dangling "result in".
- **`export.formatDraftMarkdown(draft)`** produces a shareable Markdown doc: the summary
  paragraph + a structured recap (problem, intervention, KPIs, data readiness,
  feasibility quadrant, persona/workflow). Used by both **Copy** (clipboard) and
  **Export** (download as `.md`).

## 8. Save → Register Mapping (`draftToUseCase`)

### Model selection (resolves the `AIModel[]` typing)
Step 2's model multi-select offers the **existing `AI_MODELS` catalog**
(`lib/aimaps-data.ts`, an `AIModel[]` of `{id, name, provider, type}` objects). The user
selects zero or more catalog entries; `draft.models` stores the selected `AIModel`
objects directly. No string→object synthesis is needed — `draftToUseCase` assigns
`draft.models` straight through. (Free-text "other model" entry is **out of scope**.)

### Mapping
```
name:               draft.name
description:        draft.summary
department:         draft.department
models:             draft.models                 // AIModel[] from the AI_MODELS catalog
ownerId:            null
dataClassification: draft.dataSensitivity
risks:              seedRisks(draft)             // see rules below; may be []
mitigations:        []
complianceStatus:   { euAiAct: 'gap', nistAiRmf: 'gap', owaspLlm: 'gap', iso42001: 'gap' }
discoveryMethod:    'self-register'
status:             'discovered'
createdAt:          now (ISO)
lastReviewedAt:     now (ISO)
id:                 generated (e.g. `uc-draft-${slug}-${shortid}`)
```

### `seedRisks(draft)` rules (deterministic; drives the Section 11 test)
Each seeded `Risk` is fully formed: `{ id, name, category, severity, mitigations: [] }`.

1. **Data-leakage risk** — when `draft.dataSensitivity` is `'confidential'` or `'restricted'`:
   `{ id: '<uc-id>-r-leak', name: 'Sensitive data exposure', category: 'data-leakage', severity: 'high', mitigations: [] }`
2. **Bias risk** — when the use case is people-screening-related, detected as
   `draft.department === 'HR'` **OR** `draft.problem` matches the keyword set
   `/\b(cv|cvs|resume|résumé|candidate|applicant|screen(ing)?|hir(e|ing)|recruit)/i`:
   `{ id: '<uc-id>-r-bias', name: 'Bias / unfair outcomes', category: 'bias', severity: 'high', mitigations: [] }`
3. Otherwise no risk from that rule. Both rules can fire (yielding two risks); if neither
   fires, `risks: []`.

Risk `id`s are derived from the generated use-case `id` so they are stable and unique.

### Dropped-on-save fields (intentional, not data loss)
`draft.kpis`, `draft.expectedValue`, `draft.priority` (feasibility quadrant),
`draft.persona`, `draft.humanInLoop`, and `draft.capability` have **no field on the
`UseCase` type** and are therefore *not* persisted onto the saved `UseCase`. They are
deliberately captured only in `draft.summary` (the generated paragraph) and the exported
Markdown. Note `draft.capability` is *not* unused — it is a primary input to
`assembleSummary` and a key for `suggest()`; it simply has no `UseCase` field to map to.
This is intentional — the `UseCase` type is not extended for this feature (YAGNI). The
full draft remains in the `localStorage` draft store for resume/re-export.

All enum values verified against `lib/aimaps-types.ts`; `AI_MODELS` verified in
`lib/aimaps-data.ts`.

## 9. Localization

- New `useCaseBuilder` namespace added to `en`, `nb`, `fr`, wired into all three barrels
  (`lib/i18n/locales/{en,nb,fr}.ts`) and the `Messages` type so the existing i18n
  completeness test guards it.
- Includes teaching copy, step labels, input labels, the template string, scripted KPI
  suggestion strings, and action labels.
- Norwegian follows the terminology decisions from the locale-review pass (e.g.
  "Mangler", "Hev", "utslag").

## 10. Edge Cases & Error Handling

- **Partial drafts:** Next disabled until a step minimum is met; the user can leave and
  resume via `localStorage`.
- **Clipboard/Export failures:** Copy falls back to selecting the text; Export uses a
  Blob + object URL; both surface a non-blocking toast on failure.
- **SSR / hydration:** all `localStorage` reads happen in effects (client only) to avoid
  Next.js hydration mismatches.
- **Empty suggestions:** the suggestion button hides when `suggest()` returns `[]`.
- **Schema migration:** versioned `localStorage` keys (`.v1`); unknown shapes are ignored
  and treated as "no draft."

## 11. Testing

- **Vitest** unit tests (run with `--pool=forks` per the repo's pool-flake note):
  - `suggestions.suggest()` — keyed lookups + fallback.
  - `template.assembleSummary()` — template filling, including missing optional fields.
  - `export.formatDraftMarkdown()` — structure and completeness.
  - `useCaseDrafts.draftToUseCase()` — correct enum mapping and risk seeding.
- The existing i18n completeness test covers the new namespace across locales.
- **No** `next build` / `tsc` in-sandbox (they hang) — rely on Vitest + careful typing.

## 12. Risks / Open Questions

- `/register` currently imports `USE_CASES` statically and renders server-side; swapping
  to a client-merged list must be done carefully to avoid hydration mismatch (mitigated by
  client-only effect).
- "hits vs events vs utslag" terminology (from the prior locale review) is not resolved;
  this feature does not depend on it but should reuse whatever term is chosen for
  consistency if it touches related strings.
