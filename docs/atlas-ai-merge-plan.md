# Atlas.ai ⇆ AI-SPM Dashboard — Merge Plan

How to fold the AI-SPM dashboard's domain features into the atlas.ai (AI-GRC) platform's enterprise plumbing and ship under the Atlas brand.

## TL;DR

Two codebases, one product future. Each has what the other lacks:

| | **atlas.ai** (`/atlas.ai`) | **ai-spm-dashboard** (this repo) |
|---|---|---|
| **Strength** | Production plumbing — multi-tenant Postgres + Azure Bicep + JWT auth + audit + Semantic Kernel agents + worker | AI-SPM domain — AI inventory, use cases, owners, compliance, model risk, policy enforcement |
| **Weakness** | No AI-SPM-specific domain — only generic blob → risk → correlation → dispatch | All mock data, no DB, no auth, no multi-tenancy, in-memory store |
| **Stack** | Next.js 16 + FastAPI + Python worker + PostgreSQL/pgvector + Redis + Azure | Next.js 16 only (mock data) |

**The merge.** Port AI-SPM domain models, agents, and UI into atlas.ai. Reuse atlas.ai's auth, tenancy, audit, infra, and Semantic Kernel orchestration. Drop the in-memory `Map`s in favour of real Postgres tables. Result: one platform branded **Atlas AI** that ships with both AI-GRC features and AI-SPM features in a single deploy.

---

## What we keep, what we replace

### Keep from atlas.ai (no changes)

- Multi-tenant model: `Tenant` → `Organisation` → `User` with RLS via `app.current_tenant_id`
- Auth: JWT + Argon2 + API keys + 5-role RBAC (`SUPER_ADMIN`, `TENANT_ADMIN`, `ORG_ADMIN`, `ANALYST`, `VIEWER`)
- Middleware stack: `CorrelationIdMiddleware` → `TenantContextMiddleware` → `AuditMiddleware`
- Worker pattern: dispatcher (continuous) + cron jobs (risk_analyzer, correlation_engine)
- Adapter pattern: `manual`, `purview`, `defender` registered via `app.adapters.*` imports
- Database mixins: `GRCBase`, `OrgScopedMixin`, `TenantScopedMixin`, `TestDataMixin`
- Observability: OpenTelemetry + Azure Monitor + structlog
- Bicep infra: Container Apps, Cosmos PostgreSQL, Key Vault, ACR, APIM, App Insights
- Frontend shell: `frontend/src/app/dashboard/layout.tsx` with role-aware navigation, `lib/api.ts` client, login + invite flow

### Replace / extend

- **Frontend dashboard pages** — replace generic GRC pages with AI-SPM pages from this repo (Map, Discover, Register, Owners, Comply, AI Visibility, Model Risk, Policy Enforcement). Keep atlas.ai's auth-aware layout shell.
- **Domain models** — add seven new SQLAlchemy models for AI-SPM (see [§ Domain model mapping](#domain-model-mapping)).
- **Agents** — add a `policy_evaluator` agent that mirrors `lib/policy-engine/evaluator.ts`. Keep the existing `risk_analyzer` and `correlation_engine` agents.
- **Routers** — add `ai_assets`, `use_cases`, `policies`, `policies_violations`, `policies_watchdog`, `compliance_assessments`. Match the URL contract in the existing PEP wire format so the macOS Promptly client doesn't change.

---

## Architecture target

```
                    ┌─────────────────────────────────────────────┐
                    │          Atlas AI (merged platform)         │
                    └─────────────────────────────────────────────┘

                    ┌─────────────────────────────────────────────┐
   Frontend  ──────►│  Next.js 16 dashboard                       │
                    │   atlas.ai shell (auth, tenant context)     │
                    │   + AI-SPM pages (this repo)                │
                    │   + AI-GRC pages (existing atlas.ai)        │
                    └────────────────────┬────────────────────────┘
                                         │ JWT bearer
                    ┌────────────────────▼────────────────────────┐
   Backend   ──────►│  FastAPI                                    │
                    │   Existing: auth, tenants, blobs, risks,    │
                    │             correlations, dispatch, admin   │
                    │   New:      ai_assets, use_cases, policies, │
                    │             violations, watchdog, compliance│
                    │   Same middleware: correlation→tenant→audit │
                    └────────────────────┬────────────────────────┘
                                         │
                    ┌────────────────────▼────────────────────────┐
   Worker    ──────►│  Python worker                              │
                    │   Existing: risk_analyzer, correlation,     │
                    │             dispatcher                      │
                    │   New:      shadow_ai_discovery (cron),     │
                    │             policy_watchdog_tick (cron),    │
                    │             compliance_assessment_review    │
                    └────────────────────┬────────────────────────┘
                                         │
                    ┌────────────────────▼────────────────────────┐
   Storage   ──────►│  PostgreSQL 16 + pgvector  ·  Redis 7       │
                    │   grc.* schema (RLS)                        │
                    │   audit.* schema                            │
                    └─────────────────────────────────────────────┘
                                         │
                    ┌────────────────────▼────────────────────────┐
   PEP fleet ──────►│  External Promptly clients (Chrome / Edge / │
                    │  Safari / macOS / Windows) — unchanged wire │
                    │  format; talk to the same endpoints         │
                    └─────────────────────────────────────────────┘
```

---

## Domain model mapping

Every new table inherits `GRCBase + OrgScopedMixin + TestDataMixin`, lives in the `grc` schema, and gets RLS policies via Alembic migration.

| New model | Source in this repo | Notes |
|---|---|---|
| `AIAsset` | `lib/mock-data.ts` (`AISPMAsset`, `AIAsset`) | Models the deployed AI systems. Owner FK → `users.id`. Compliance status enum kept. Drift / latency / accuracy stats become Float columns. Replaces both interfaces from the prototype. |
| `AIUseCase` | `lib/aimaps-data.ts` (`UseCase`) | Department + business owner + classification + risk list + status. Backreferences `AIAsset` via FK. |
| `AIRisk` | `lib/aimaps-data.ts` (`Risk`) + `lib/insurance-data.ts` (`AIRiskCategory`) | Per-use-case risks with severity, OWASP/NIST/EU AI Act references, mitigation status. **Distinct from atlas.ai's existing `RiskMitigation`** — that one is LLM output, this one is curated AI-SPM risk taxonomy. |
| `ModelRiskProfile` | `lib/model-risk-data.ts` | LLM-level risk profile (hallucination / bias / toxicity / privacy / security / compliance scores). One row per model the org uses. |
| `Policy` (Template) | `lib/policy-templates/templates.ts` | Read-only catalogue. Seeded via Alembic seed migration. Versioned. |
| `PolicyInstance` | `lib/policy-templates/types.ts` (`PolicyInstance`) | Org-scoped clones of `Policy`. Stores `parameter_values` JSONB, `applies_to` JSONB, `promotion_history` JSONB array, `auto_demote` JSONB. `enforcement_mode` + `severity` + `status` as enums. |
| `PolicyViolation` | `lib/policy-templates/types.ts` (`PolicyViolation`) | Append-only ingest from PEPs. **Hard column constraint:** `prompt_hash` CHECK matches `[a-f0-9]{64}`. Postgres-level defence in depth — same guarantee as the existing API route. |
| `PolicyApprovalRequest` | derived from `promotionHistory` | Splits the embedded approval log into a queryable table for the dashboard's pending-approvals views and for audit. |
| `ComplianceAssessment` | `lib/aimaps-data.ts` (compliance), `ardoq-import/08_compliance_assessments.csv` | EU AI Act / GDPR / NIST AI RMF assessments per `AIAsset`. Pass/fail/under-review + rationale + review_date + approved_by FK. |

### Key alignments with existing atlas.ai patterns

- **Tenant scope.** Every AI-SPM table scopes to `org_id` (and inherits `tenant_id`) — same as `BlobRecord` and `RiskMitigation`. This is what lets the existing RLS automation just work.
- **Audit.** Add `/api/v1/policies/`, `/api/v1/ai-assets/`, `/api/v1/compliance/` to `AUDIT_PATHS` in `backend/app/middleware/audit.py`. Audit log is already wired.
- **Vector embeddings.** `AIAsset.description` and `ModelRiskProfile.notes` get `Vector(1536)` columns so the existing similarity-search infra applies. Lets us answer "find AI systems similar to X" with no new infra.

---

## API surface in atlas.ai

All new routes mount under `/api/v1/` and return `Pydantic` schemas. The PEP-facing wire format (`PolicyInstance` shape) is preserved verbatim from the current dashboard — Promptly clients see no diff.

```
backend/app/routers/
  ai_assets.py              GET / POST / PATCH /api/v1/ai-assets/...
  use_cases.py              GET / POST / PATCH /api/v1/use-cases/...
  model_risk.py             GET /api/v1/model-risk/...
  compliance.py             GET / POST /api/v1/compliance/...
  policies.py               full PEP API:
                              GET    /api/v1/policies                   (active bundle)
                              POST   /api/v1/policies/clone
                              GET    /api/v1/policies/{id}
                              POST   /api/v1/policies/{id}/promote
                              POST   /api/v1/policies/{id}/approve
                              POST   /api/v1/policies/{id}/demote
                              POST   /api/v1/policies/{id}/evaluate
                              POST   /api/v1/policies/violations
                              GET    /api/v1/policies/violations
                              POST   /api/v1/policies/watchdog/tick
                              GET    /api/v1/policies/watchdog/tick
```

The Next.js routes in this repo (`app/api/policies/...`) become **thin BFF proxies** that call `/api/v1/...` server-side, so we keep the existing dashboard URLs while routing through the FastAPI auth + audit chain. Or we delete the Next API routes entirely and call FastAPI directly from the client — simpler, fewer hops; pick after auth model is settled.

---

## Frontend integration

Strategy: copy AI-SPM pages into atlas.ai's `frontend/src/app/dashboard/` and adapt them to use the existing auth-aware layout + API client.

### What ports cleanly (small wrapper changes)

| Page in this repo | Target in atlas.ai |
|---|---|
| `app/page.tsx` (Map) | `frontend/src/app/dashboard/map/page.tsx` |
| `app/discover/page.tsx` | `frontend/src/app/dashboard/discover/page.tsx` |
| `app/register/page.tsx` | `frontend/src/app/dashboard/register/page.tsx` |
| `app/owners/page.tsx` | `frontend/src/app/dashboard/owners/page.tsx` |
| `app/comply/page.tsx` | `frontend/src/app/dashboard/comply/page.tsx` |
| `app/ai-governance/page.tsx` | `frontend/src/app/dashboard/ai-governance/page.tsx` |
| `app/ai-visibility/page.tsx` | `frontend/src/app/dashboard/ai-visibility/page.tsx` |
| `app/model-risk/page.tsx` | `frontend/src/app/dashboard/model-risk/page.tsx` |
| `app/policy-enforcement/**` | `frontend/src/app/dashboard/policy-enforcement/**` |

Each page change:
1. Replace `import { aiSpmAssets } from "@/lib/mock-data"` with `await api.getAIAssets()`
2. Mark page as `'use client'` only when interactive; otherwise keep as RSC + `await`
3. Drop the `DemoWrapper` — atlas.ai's `dashboard/layout.tsx` is the new shell

### What needs more work

- **Policy detail interactive client** (`app/policy-enforcement/policies/[id]/client.tsx`) — already a 'use client' island, but it makes raw `fetch()` calls. Replace with `api.policies.evaluate()`, `api.policies.promote()`, etc. on the atlas.ai `lib/api.ts` client.
- **Demo journey** (`components/demo-journey.tsx`) — atlas.ai has no equivalent. Either ship it as a guided onboarding for first-run admins, or drop it. Recommend ship.
- **Force-directed graph (Map page)** — need to verify it works inside the dashboard layout's narrower content area. May need width adjustments.
- **App Header → Dashboard Layout** — `components/app-header.tsx` is replaced by atlas.ai's `dashboard/layout.tsx`. Nav entries (`Map`, `Discover`, `Register`, `Owners`, `Comply`, `Policies`) merge into atlas.ai's `navigation` array with role gating.

### Theme

This repo uses Tailwind 4 + Heroicons (atlas.ai) vs Tailwind 4 + Lucide + shadcn/ui (this repo). The `components/ui/*` primitives (Card, Badge, Progress, Select, Tabs) need to either come along, or be reimplemented with Heroicons + atlas.ai's existing styling. **Recommend: bring the shadcn primitives** — they're better than what atlas.ai has, and Lucide can coexist with Heroicons. ~5 component files.

---

## Auth + tenancy bridge

Two integration points:

### 1. Multi-tenant scoping for everything we add

- `AIAsset.org_id` etc. — every list endpoint applies the existing tenant filter. The `OrgScopedMixin` plus RLS policies do this with no application-level work.
- Policy templates (`Policy`) are **global**, not tenant-scoped. The shipped catalogue is the same for every tenant. `PolicyInstance` is org-scoped.
- PEP polling: macOS / browser clients authenticate with a per-user API key (already supported by atlas.ai's `APIKey` model). The bundle `GET /policies` is filtered to the caller's org automatically.

### 2. Approval workflow ↔ atlas.ai roles

The current admin guide defines abstract roles (DPO, Security Lead, etc.) but they don't map to atlas.ai's RBAC enum. Two options:

- **Map abstract → concrete.** DPO ≈ `TENANT_ADMIN` with a custom "DPO" tag; Security Lead ≈ `TENANT_ADMIN` with "Security" tag; etc. Adds a new lightweight `UserTag` table.
- **Extend the `Role` enum.** Add `DPO`, `SECURITY_LEAD`, `COMPLIANCE_OFFICER`, `TRUST_SAFETY_LEAD` as `Role` values. Cleaner but bigger change to existing tenant/user code.

**Recommendation: tags.** Less invasive, expands well to future approval surfaces (e.g. compliance assessments).

---

## Worker integration

Three new cron jobs in `worker/app/main.py`:

| Job | Schedule | What it does |
|---|---|---|
| `policy_watchdog_tick` | every 1 minute | Calls the same logic as `POST /api/policies/watchdog/tick`. Replaces the on-demand watchdog with a real cron. UI polls a read endpoint. |
| `shadow_ai_discovery` | every 30 minutes | Pulls violation events tagged `shadow-ai-detection`, groups by destination URL, surfaces unknown endpoints to the dashboard's Discover page. |
| `compliance_review_reminder` | daily | For each `ComplianceAssessment` whose `review_date` is within 7 days, emit a `DispatchEvent` for owner notification. Reuses existing dispatch + email pipeline. |

These follow the existing worker pattern of importing `app.*` from the backend and running mode-switched on `WORKER_MODE` env.

---

## Migration path: 6 milestones

### Milestone 1 — Domain model (week 1)

- [ ] Alembic migration adds 8 new tables (`ai_assets`, `ai_use_cases`, `ai_risks`, `model_risk_profiles`, `policies`, `policy_instances`, `policy_violations`, `policy_approval_requests`, `compliance_assessments`).
- [ ] RLS policies on each (mirrors `BlobRecord`).
- [ ] Pydantic schemas in `backend/app/schemas/`.
- [ ] Seed migration loads the 15 starter `Policy` templates (port `lib/policy-templates/templates.ts` → SQL `INSERT`).

### Milestone 2 — Backend routers (week 2)

- [ ] `ai_assets.py`, `use_cases.py`, `model_risk.py`, `compliance.py` — CRUD endpoints, scoped to caller's org.
- [ ] `policies.py` — full PEP API + admin actions. Promotion + approve + demote routes ported from this repo's API; Postgres replaces in-memory `Map`.
- [ ] Backend tests for every router (pytest + httpx, matching atlas.ai's existing test pattern).

### Milestone 3 — Frontend shell + Map page (week 3)

- [ ] Add nav entries to `dashboard/layout.tsx` with role gating.
- [ ] Port shadcn primitives (`components/ui/card.tsx` etc.) into `frontend/src/components/ui/`.
- [ ] Port the Map page first — it's the centrepiece.
- [ ] Add `api.aiAssets`, `api.useCases`, `api.policies` to `frontend/src/lib/api.ts`.

### Milestone 4 — Remaining frontend pages (week 4)

- [ ] Discover, Register, Owners, Comply, AI Visibility, Model Risk pages ported.
- [ ] Each replaces mock data with `api.*` calls.
- [ ] Auth gating + loading states + error boundaries.

### Milestone 5 — Policy enforcement frontend + watchdog cron (week 5)

- [ ] Port `/policy-enforcement` library + detail pages.
- [ ] PromotionWizard, ModeToggle, WatchdogBanner ported.
- [ ] Worker cron `policy_watchdog_tick` replaces the on-demand watchdog from this repo.
- [ ] Approval workflow wired to the new `UserTag` system.

### Milestone 6 — Branding + release (week 6)

- [ ] Rename `aigrc` → `atlas` in package names, env vars, OTel service names. Coordinated with infra change.
- [ ] Atlas-branded marketing site + OG images.
- [ ] Migration playbook for the existing dashboard demo deploys → Atlas.
- [ ] PEP clients (Promptly fleet) point at the new `/api/v1/policies` endpoints. Wire format unchanged so this is a config flip.

---

## Gap inventory (the explicit list)

These are the items that don't survive a copy-paste:

| Gap | Where | Effort |
|---|---|---|
| In-memory `Map` storage in `lib/policy-engine/server/store.ts` | needs replacing with PostgreSQL via SQLAlchemy | Medium |
| `localStorage` policy instance store in `lib/policy-engine/instance-store.ts` | delete entirely; UI calls API instead | Trivial (delete) |
| No auth on any current dashboard page | wrap every page in atlas.ai's auth-aware layout | Mechanical, ~30 min/page |
| `app/api/policies/*` Next.js routes | re-implement as FastAPI routers, OR keep as BFF proxies | Medium (re-implement) / Low (proxy) |
| Approval roles abstract (DPO, Security Lead) | add `UserTag` table + tag CRUD | Small |
| Test Console runs evaluator in TS | re-implement evaluator in Python under `backend/app/agents/policy_evaluator.py` and call from `POST /policies/{id}/evaluate` | Medium — the detector primitives map 1:1 |
| Force-directed graph layout assumes full viewport | constrain to dashboard layout content width | Small |
| `DemoWrapper` + `DemoJourney` | atlas.ai has no onboarding flow — ship as a first-run wizard | Small |
| Heroicons vs Lucide | reconcile or coexist | Trivial (coexist) |
| Promptly Swift client wire format | preserved by API contract — verify with the existing `PolicyTypesTests` | Verify only |
| Ardoq import package (`ardoq-import/`) | move under `docs/integrations/` and re-export from authoritative DB rather than mock data | Medium |
| `policy_watchdog_tick` runs on user request only | move to `worker/app/main.py` cron mode | Small |
| Multi-tenant policy templates | global vs per-org — design decision; recommended global | Decision, then trivial |

---

## Cross-cutting risks

### 1. Database write throughput on PEP violations

A fleet of Promptly clients reporting violations at scale could hammer Postgres. **Mitigation:** add a Redis-buffered ingest queue. PEPs POST → API enqueues to Redis → worker drains in batches to Postgres. Re-uses atlas.ai's existing Redis instance.

### 2. `evaluator.py` parity with `evaluator.ts`

Detector behaviour must be byte-identical between the dashboard's Test Console (Python) and the PEP's local evaluator (TS / Swift / C#). **Mitigation:** the shared fixture file from the [Promptly PEP plan](./promptly-pep-deployment-plan.md) becomes a CI gate on the atlas.ai repo as well.

### 3. RLS performance on policy bundle

`GET /api/v1/policies` returns the active bundle for one org. With RLS, the query is fast. With PEPs polling at 60s intervals, scale is bounded. No issue at expected load.

### 4. Brand confusion during transition

Two URLs will exist for some weeks (atlas.ai prod, ai-spm-dashboard demo). **Mitigation:** redirect ai-spm-dashboard → atlas.ai/ on day 1 of the cutover; keep the demo branch frozen as a tagged release for posterity.

### 5. PEP wire format drift

If we rename anything in `PolicyInstance` during the SQLAlchemy port, every PEP breaks. **Mitigation:** the Pydantic schemas at the API boundary explicitly mirror the TS types from this repo. Add a CI test that fails on drift, similar to how the Swift `PolicyTypesTests` work today.

---

## Open questions

1. **Repo strategy.** Continue with two repos (atlas.ai + ai-spm-dashboard frozen) or merge ai-spm-dashboard into atlas.ai as a subdirectory? Recommend **merge as a subdirectory** then delete after milestone 6 — preserves git history.
2. **Multi-tenant policy templates.** Are starter templates the same for every customer, or can a customer author private templates? Affects schema.
3. **Branding cutover.** Is `Atlas AI` the final name, or `Atlas` alone? Affects domain registration, OTel service names, env var prefix (`ATLAS_*` vs `AIGRC_*`).
4. **Promptly OEM relationship.** Does the macOS Promptly client get rebranded? Or remain a separate client product that talks to Atlas?
5. **Discovery agent.** atlas.ai already has Defender + Purview adapters. Do we treat those as AI-SPM discovery sources too, or keep AI-SPM discovery on a separate path?

---

## Bootstrap order suggestion

If only one milestone can land next, **ship Milestone 1 (domain model)**. Once those eight tables exist and seed data lands, every subsequent milestone is mechanical porting work. Without it, the rest of the plan is blocked on schema design.

After M1, the natural parallelisation is:
- Backend track: M2 → M5 backend bits
- Frontend track: M3 → M4 → M5 frontend bits
- Branding/infra track: M6 (can begin in parallel from week 3)

Six weeks total with a small team — three engineers, one designer for the rebrand.
