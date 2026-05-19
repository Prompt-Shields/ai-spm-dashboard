# AI-SPM CRUD plan — fill the Ardoq export gaps

**Status:** draft for review · **Owner:** Jun Seki · **Date:** 2026-05-05
**Companion docs:** [Promptly ↔ AI-SPM policy integration](../../prompt-shields-macos-widget/docs/policy-integration.md), [Ardoq import package](../ardoq-import/README.md)

---

## 1. Why this exists

The Promptly macOS app feeds telemetry into AI-SPM (people, observed AI tool usage, policy violations). Five fields directly map to the Ardoq import schema (people, references, observed apps, risk inputs, tags). The remaining ~40 fields are organisational metadata that can never come from a desktop app — Department, Owner, Data Classification, Compliance Assessments, infrastructure inventory, data store catalog, etc.

This plan adds CRUD-able entity stores to AI-SPM so a governance admin can fill in those gaps. Output is the 9-CSV Ardoq import package, generated on demand from the merged macOS telemetry + dashboard-curated data.

## 2. Entities to model

Mirroring the Ardoq AI Lens metamodel (see `ardoq-import/README.md`):

| # | Entity | Ardoq workspace | CRUD here? | Source of truth |
|---|---|---|---|---|
| 1 | **Application** | Applications | ✅ | Dashboard (manual) + macOS auto-shadow |
| 2 | **Person** | People | ✅ | macOS auth (insert) + dashboard (edit role/dept) |
| 3 | **OrganizationalUnit** | Organization | ✅ | Dashboard (manual) — eventually IdP/SCIM sync |
| 4 | **DataStore** | Logical Information | ✅ | Dashboard (manual) — eventually Atlan/Collibra sync |
| 5 | **TechnologyService** | Technology Service Repository | ✅ | Dashboard (manual) — eventually Azure/AWS sync |
| 6 | **TechnologyProduct** | Technology Products | 🟡 read-only catalog + admin overrides | Static seed (GPT-4o, Claude 3.5, etc.) — admin can extend |
| 7 | **TechnicalCapability** | Technical Capabilities | 🟡 read-only seeded hierarchy | Required by Ardoq AI Lens — name "Artificial Intelligence" must be present |
| 8 | **ComplianceAssessment** | Compliance Assurance | ✅ already exists | `lib/policy-engine/server/store.ts` (extend slightly) |
| 9 | **Reference** | cross-workspace edges | ✅ | Computed from telemetry + manual overrides |

**Out of scope for this PR:** the existing PolicyTemplate / PolicyInstance / PolicyViolation tables already shipped on `feature/policy-enforcement`. We extend, don't replace.

## 3. Wire schemas

Single canonical TS file: `lib/entities/types.ts`. Naming follows the existing `lib/policy-templates/types.ts` style (PascalCase, narrow string unions).

```typescript
// Common
export type CustomId = string  // human-readable, kebab-case (e.g. "app-contract-review")
export type Tag = string

// Person — already created from macOS auth, edits land here
export interface Person {
  id: CustomId
  componentName: string
  description: string
  email: string
  role: string
  organizationalUnitId?: CustomId
  tags: Tag[]
  createdAt: string
  updatedAt: string
}

// OrganizationalUnit — Department, Business Unit
export interface OrganizationalUnit {
  id: CustomId
  componentName: string
  description: string
  parentId?: CustomId  // for nested orgs
  tags: Tag[]
  createdAt: string
  updatedAt: string
}

// Application — the AI use case (most central entity)
export type DeploymentStatus = "Active" | "Shadow" | "Deprecated" | "Testing"
export type DataClassification = "public" | "internal" | "confidential" | "restricted"

export interface Application {
  id: CustomId
  componentName: string
  description: string
  organizationalUnitId?: CustomId       // Department
  ownerPersonId?: CustomId              // Owner
  dataClassification?: DataClassification
  deploymentStatus: DeploymentStatus
  riskScore: number                     // 0–100, computed
  tags: Tag[]
  // Auto-discovery: stub created by macOS-observed shadow AI usage
  autoDiscovered: boolean
  autoDiscoveredFromAppId?: string      // Promptly's MonitoredApp.id (chatgpt/claude/...)
  createdAt: string
  updatedAt: string
}

// DataStore — CRM, claims db, etc.
export type StoreType =
  | "Relational Database" | "Document Store" | "Object Store"
  | "Data Warehouse" | "Cache" | "Search Index"

export interface DataStore {
  id: CustomId
  componentName: string
  description: string
  storeType: StoreType
  dataClassification: DataClassification
  location: string                      // free text: "Azure Norway East"
  recordCount?: string                  // free text: "2.4M customers"
  refreshFrequency?: string             // "Real-time" / "Daily" / etc.
  retentionPeriod?: string              // "7 years"
  encryption?: string                   // "AES-256 at rest; TLS 1.3 in transit"
  accessControls?: string               // "RBAC with MFA"
  gdprCompliant: boolean
  dataOwnerId?: CustomId                // Person ref
  lastAudit?: string                    // ISO date
  tags: Tag[]
  createdAt: string
  updatedAt: string
}

// TechnologyService — cloud infra
export type ServiceType =
  | "Cloud Infrastructure" | "AI Platform" | "API Gateway"
  | "Identity Provider" | "Database Service" | "Other"

export interface TechnologyService {
  id: CustomId
  componentName: string
  description: string
  provider: string                      // "Azure", "AWS", "OpenAI"
  serviceType: ServiceType
  region: string
  status: "Active" | "Deprecated"
  uptimePct?: number
  costPerMonthNOK?: number
  securityCertifications: string[]      // ["SOC2", "ISO27001"]
  networkIsolation?: string             // "Private Endpoint"
  scalingPolicy?: string
  backupStrategy?: string
  tags: Tag[]
  createdAt: string
  updatedAt: string
}

// TechnologyProduct — the AI models (GPT-4o, Claude 3.5, etc.)
export type ModelCategory =
  | "LLM" | "Computer Vision" | "Speech"
  | "Image Generation" | "Machine Learning" | "Other"

export interface TechnologyProduct {
  id: CustomId
  componentName: string
  description: string
  provider: string                      // "OpenAI", "Anthropic"
  version: string
  modelCategory: ModelCategory
  parameters?: string                   // "1.8 trillion"
  lifecycleStatus: "Production" | "Evaluation" | "Deprecated"
  inputCostPerMTokens?: string
  outputCostPerMTokens?: string
  contextWindow?: string                // "128K tokens"
  estimatedMonthlySpendNOK?: number
  tags: Tag[]
  // Promptly hint: what does the macOS app emit when it observes this product?
  promptlyAppIds: string[]              // e.g. ["chatgpt"] for GPT-4o
  createdAt: string
  updatedAt: string
}

// TechnicalCapability — read-only AI Lens hierarchy
export interface TechnicalCapability {
  id: CustomId
  level1: string
  level2?: string
  level3?: string
  description: string
  customId: string
  tags: Tag[]
}

// Reference — edges between entities
export type ReferenceType =
  | "Is Realized By"   // TechnicalCapability → TechnologyProduct
  | "Deploys"          // Application → TechnologyProduct
  | "Is Owner Of"      // Person → Application
  | "Belongs To"       // Person → OrganizationalUnit
  | "Reads From"       // Application → DataStore
  | "Runs On"          // Application → TechnologyService
  | "Has Subject"      // ComplianceAssessment → Application

export interface Reference {
  id: string
  sourceId: CustomId
  targetId: CustomId
  type: ReferenceType
  description: string
  // Auto-derived from telemetry vs manually-entered. Auto edges get
  // recomputed daily from observation rollups; manual edges stick.
  autoDerived: boolean
  createdAt: string
  updatedAt: string
}
```

## 4. Storage

**v1 (this PR):** in-memory `Map<CustomId, Entity>` per entity type, mirroring `lib/policy-engine/server/store.ts`. Fixture-seeded so the dashboard renders meaningfully on cold boot. Persists across hot reloads (module-scope) but resets on server restart.

**v2 (follow-up):** swap in Postgres / Supabase. The store interface stays the same; just back the `Map` with a `pg` client.

File layout:

```
lib/entities/
  types.ts                    # canonical TS schemas above
  applications-store.ts       # CRUD for Applications
  persons-store.ts            # CRUD for Persons
  organizational-units-store.ts
  data-stores-store.ts
  technology-services-store.ts
  technology-products-store.ts
  technical-capabilities-store.ts   # seeded only, read-only
  references-store.ts
  fixtures.ts                 # seed data: 5–10 of each entity for demo
```

## 5. API surface

Pattern: collection at `/api/<entity>` (GET list, POST create), item at `/api/<entity>/[id]` (GET, PUT, DELETE). Mirrors REST conventions. Bulk imports later.

| Route | Methods | Notes |
|---|---|---|
| `/api/applications` | GET, POST | GET supports `?owner=`, `?department=`, `?status=` filters |
| `/api/applications/[id]` | GET, PUT, DELETE | DELETE soft-deletes (sets status="Deprecated") |
| `/api/applications/auto-discovery` | POST | Called by Promptly when it sees usage of an unregistered app — creates a Shadow stub |
| `/api/people` | GET, POST | POST upsert by email — used by Promptly's `/api/people/me` flow |
| `/api/people/[id]` | GET, PUT, DELETE | |
| `/api/people/me` | POST | Convenience: derives id from auth context |
| `/api/organizational-units` | GET, POST | |
| `/api/organizational-units/[id]` | GET, PUT, DELETE | |
| `/api/data-stores` | GET, POST | |
| `/api/data-stores/[id]` | GET, PUT, DELETE | |
| `/api/technology-services` | GET, POST | |
| `/api/technology-services/[id]` | GET, PUT, DELETE | |
| `/api/technology-products` | GET, POST | POST extends the static catalog |
| `/api/technology-products/[id]` | GET, PUT, DELETE | |
| `/api/technical-capabilities` | GET | Read-only |
| `/api/references` | GET, POST | GET supports `?source=`, `?target=`, `?type=` |
| `/api/references/[id]` | GET, DELETE | No PUT — references are immutable; recreate to change |
| `/api/exports/ardoq.zip` | GET | Generates the 9 CSVs as a zip |

Validation: every POST/PUT runs through a type guard (mirrors `app/api/policies/violations/route.ts` style). Required fields rejected at 400; unknown fields silently dropped.

## 6. Auto-discovery loop

The point of integrating with Promptly: the macOS app's usage stream auto-creates Application stubs for AI tools that aren't yet on the registered list.

```
Promptly macOS app observes user X using claude.ai
  → POST /api/usage/events  (slice F+1, separate ticket)
    → ingestor checks: do we have an Application with autoDiscoveredFromAppId="claude" AND ownerPersonId=X?
      → if yes, increment usage counter
      → if no, create:
        Application {
          id: "app-shadow-claude-<hashOfPersonId>",
          componentName: "Claude (used by <Person.componentName>)",
          deploymentStatus: "Shadow",
          autoDiscovered: true,
          autoDiscoveredFromAppId: "claude",
          ownerPersonId: X.id,
          tags: ["shadow-ai", "claude", "auto-discovered"],
          riskScore: 50  // default for unknown
        }
```

Surfaces in the dashboard as "5 employees using Claude.ai with no policy ownership assigned." Admin can promote to "Active" and assign an Owner / Department.

## 7. Risk Score computation

Background job (or just-in-time on read) per Application:

```
riskScore = clamp(
  20  // base for any AI use
  + 30 * (deploymentStatus === "Shadow" ? 1 : 0)   // shadow penalty
  + 20 * (dataClassification === "restricted" ? 1
        : dataClassification === "confidential" ? 0.7
        : dataClassification === "internal" ? 0.3 : 0)
  + 30 * min(violationCount30d / max(usageCount30d, 1), 1)  // violation rate
  - 20 * (latestComplianceAssessmentPassed ? 1 : 0),
  0, 100
)
```

Displayed in the UI with the existing `risk-chip.tsx` component.

## 8. Admin UI

Single page at `/admin` with tabs per entity. Each tab is a server-component table (read from store) + client-component "Add new" button that opens a modal form. Edits inline or via the same modal.

```
/admin
  ├── Applications        (default tab)
  ├── People
  ├── Organisational Units
  ├── Data Stores
  ├── Technology Services
  ├── Technology Products
  ├── Compliance Assessments  (existing — link out)
  └── References
```

Component reuse:
- Tables: existing shadcn/ui `<Table>` from `components/ui/`
- Forms: shadcn `<Form>` + `react-hook-form` + `zod` schema (matches existing PolicyTemplate forms)
- Modals: existing `<Dialog>` pattern

For now no search / filter / pagination — fixture data is small. Add when DB lands.

## 9. Ardoq exporter

`GET /api/exports/ardoq.zip` returns a zip with the 9 CSVs at exact column order required by `ardoq-import/README.md`.

```typescript
// lib/exports/ardoq.ts
export async function buildArdoqExport(): Promise<Buffer> {
  const zip = new JSZip()
  zip.file("01_technical_capabilities.csv", buildTechnicalCapabilitiesCsv())
  zip.file("02_applications.csv", buildApplicationsCsv())
  zip.file("03_technology_products.csv", buildTechnologyProductsCsv())
  zip.file("04_technology_services.csv", buildTechnologyServicesCsv())
  zip.file("05_people.csv", buildPersonsCsv())
  zip.file("06_organization.csv", buildOrganizationalUnitsCsv())
  zip.file("07_data_stores.csv", buildDataStoresCsv())
  zip.file("08_compliance_assessments.csv", buildComplianceAssessmentsCsv())
  zip.file("09_references.csv", buildReferencesCsv())
  return zip.generateAsync({ type: "nodebuffer" })
}
```

References CSV is the trickiest — joins multiple stores to materialise edges:
- Person → OrganizationalUnit ("Belongs To")
- Person → Application ("Is Owner Of")
- Application → TechnologyProduct ("Deploys")
- Application → DataStore ("Reads From")
- Application → TechnologyService ("Runs On")
- TechnicalCapability → TechnologyProduct ("Is Realized By")
- ComplianceAssessment → Application ("Has Subject")

Both manually-stored references AND derived ones (e.g. Person.organizationalUnitId → "Belongs To" edge) are emitted.

Add a "Download Ardoq export" button on `/admin` that fetches the zip.

## 10. Sprint plan

**Total: ~12–15 dev-days, single engineer.**

### Sprint 1 — Plumbing (3 days)
- Day 1: `lib/entities/types.ts` + base store helpers + fixtures.
- Day 2: Applications + Persons stores + API routes + 5 fixture rows each.
- Day 3: OrganizationalUnits + DataStores + TechnologyServices stores + API routes.

### Sprint 2 — Catalogs + auto-discovery (3 days)
- Day 4: TechnologyProducts store seeded with 20 known AI models (GPT-4o, Claude 3.5, Gemini 1.5, …). API routes.
- Day 5: TechnicalCapabilities seeded hierarchy (read-only). References store + API.
- Day 6: `POST /api/applications/auto-discovery` + risk-score computation.

### Sprint 3 — Admin UI (4 days)
- Day 7: `/admin` page shell + tabs + Applications table + add/edit modal.
- Day 8: Persons + OrganizationalUnits tabs.
- Day 9: DataStores + TechnologyServices + TechnologyProducts tabs.
- Day 10: References tab (graph view stub) + global filters.

### Sprint 4 — Exporter + polish (3 days)
- Day 11: 9-CSV builder with exact column order. Tests against the fixture CSVs in `ardoq-import/`.
- Day 12: Zip route + "Download Ardoq export" button + zod validation polish.
- Day 13: README + example: full flow from cold boot → admin enters 5 apps → export → import to Ardoq sandbox.

### Optional — buffer (2 days)
- Validation polish, accessibility pass, PR review, Vercel staging.

## 11. What we're explicitly NOT doing in this PR

| Deferred | Reason |
|---|---|
| Real DB persistence | In-memory mirrors existing pattern; DB swap is a clean follow-up. |
| Bulk CSV import (paste rows) | Useful but not needed for MVP — 5 fixture rows per entity is enough to demo. |
| SCIM / IdP sync | Replaces manual People CRUD when it lands; no change to API contract. |
| Vendor billing sync (OpenAI/Azure) | Fills `costPerMonthNOK` automatically — ~3 days each, separate ticket. |
| Audit trail (who changed what) | Single-table append-only `audit_log` later. |
| Permissions / RBAC | Today everyone with the dashboard URL can edit. Add admin/viewer roles when tenanting. |
| References UI as graph | Table-only for MVP. The `use-case-graph.tsx` component already exists; can wire up later. |

## 12. Acceptance criteria

- [ ] `GET /api/applications` returns the seeded fixtures + any auto-discovered shadows.
- [ ] `POST /api/applications` creates with required-field validation; unknown fields rejected at 400.
- [ ] Same coverage for People, OrgUnits, DataStores, TechServices, TechProducts, References.
- [ ] `/admin` renders a working CRUD UI for each entity.
- [ ] `GET /api/exports/ardoq.zip` produces the 9 CSVs with column order matching `ardoq-import/`.
- [ ] Ardoq sandbox import succeeds against the exported zip on a fresh workspace.
- [ ] Integration test: macOS app emits a usage event for an unregistered app → Application auto-discovered with `deploymentStatus="Shadow"` → admin promotes to "Active" → exported CSV reflects the change.
- [ ] No regressions on the existing `/api/policies` + `/api/policies/violations` routes.

## 13. Open questions for the user

1. **Custom ID format**: stick with kebab-case human-readable (`app-contract-review`) or move to opaque UUIDs and surface a separate `slug` field? Kebab is friendlier for Ardoq; UUIDs are safer when names change.
2. **Tenanting**: today the dashboard is single-tenant. When does multi-tenant land? Affects whether stores need a `tenantId` column from day one.
3. **Person ID strategy**: Promptly emits Auth0 `sub` as the natural primary key. Use that directly or hash the email? Affects how SCIM sync resolves duplicates later.
4. **Compliance Assessments scope**: extend the existing PolicyInstance shape with assessment metadata, or is `ComplianceAssessment` a separate first-class entity? Current README shows separate CSV — leaning toward separate entity.
5. **Auto-promotion threshold**: when does a Shadow app auto-promote to Active? (e.g. >50 events from >5 different employees in 30 days). Or always require admin sign-off? Suggesting always-manual for now.
6. **Reference auto-derivation**: when Promptly observes a Person using an Application, do we materialise that as an "Is Owner Of" edge automatically? Could be noisy. Suggesting separate "Observed Use" reference type, distinct from the formally-assigned Owner.

Awaiting answers before Sprint 1 kicks off.
