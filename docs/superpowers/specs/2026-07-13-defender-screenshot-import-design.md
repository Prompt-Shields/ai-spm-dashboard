# Defender Screenshot Import — Design

**Date:** 2026-07-13
**Status:** Approved by user (brainstorming session)
**Feature:** New Discover entry point — upload a screenshot of the Microsoft
Defender for Cloud Apps "discovered apps" list, simulate extraction of the
shadow-AI applications it shows, enrich each row from a seeded AI-vendor
catalog, and commit the selected rows to the applications entity store as
Shadow records.

## Decisions (from brainstorming)

1. **Simulated extraction, not real OCR.** Matches the voice-interview
   precedent: any uploaded image is accepted and its contents ignored; the
   "extracted" rows come from a deterministic seeded data file. No API keys,
   no new AI dependencies.
2. **Destination is the server-side entity store.** Selected rows are POSTed
   to the existing `POST /api/applications` endpoint and land in
   `applicationsStore` as `deploymentStatus: "Shadow"` records — the same
   database the Promptly auto-discovery path writes to.
3. **Dedicated wizard page.** New route `/discover/defender-import` reached
   from a new entry card on `/discover`, mirroring the voice-interview
   structure (own route, own seeded-data file, own i18n namespace).

## User flow

1. **Upload** — drag-and-drop zone / file picker accepting image files, plus
   a one-click **"Try with sample screenshot"** button that loads a bundled
   mock image of the Defender discovered-apps table from `public/`.
   Non-image files are rejected with an inline error.
2. **Scanning** — theatrical staged progress (client-side timers): "Running
   OCR pass…", "Detecting table structure…", "Matching rows against AI
   vendor catalog…".
3. **Extraction** — a table of ~8 deterministic shadow-AI apps rendered as
   Defender would show them: app name, category, Defender cloud-app score,
   number of users, traffic uploaded, last seen.
4. **Enrichment** — each row progressively reveals enriched fields: vendor,
   AI capability, underlying models, trains-on-your-data flag,
   certifications, inferred data classification, computed 0–100 risk score.
5. **Review & commit** — checkbox per row (all selected by default);
   "Add N to inventory" POSTs each selected row; success panel confirms
   "N added/updated" and links onward (e.g. back to Discover). The API does
   not distinguish created from updated (`POST` always returns 201 with the
   upserted record), so the success copy stays aggregate.

## Components

### `lib/defender-import-data.ts`

Seeded, deterministic demo data (mirrors `voice-interview-data.ts`):

- `DefenderExtractedApp` type — fields as shown in the Defender UI
  (name, slug, category, defenderScore, users, trafficUploaded, lastSeen).
- `DefenderEnrichment` type — vendor, aiCapability, models[],
  trainsOnData, certifications[], dataClassification, riskScore, note.
- `DEFENDER_EXTRACTED_APPS: DefenderExtractedApp[]` (~8 rows).
- `ENRICHMENTS: Record<slug, DefenderEnrichment>` — one per extracted app.
- `extractedAppToApplication(app, enrichment, nowIso): Application` — pure
  mapper producing the entity-store record. Timestamp injected for
  determinism (same pattern as `shadowAgentToUseCase`).

Record shape produced by the mapper:

- `id: "app-shadow-defender-<slug>"` — stable, so re-imports upsert rather
  than duplicate.
- `deploymentStatus: "Shadow"`, `autoDiscovered: true`,
  `autoDiscoveredFromAppId: "defender-<slug>"`.
- `tags: ["ai-system", "shadow-ai", "defender-import"]`.
- `riskScore` and `dataClassification` from the enrichment.
- `description` summarising the Defender sighting + enrichment highlights.
- No `ownerPersonId` / `organizationalUnitId` — Defender doesn't know them;
  a human assigns ownership when promoting from Shadow (existing decision
  #5 in `lib/entities/types.ts`).

### `public/samples/defender-shadow-apps.svg`

Bundled mock of the Defender for Cloud Apps discovered-apps table used by
"Try with sample screenshot". Generated in-repo (no external assets).
SVG is an image MIME type, so it passes the same image-only validation the
upload path enforces; the sample button loads it through the same code path
as a user upload rather than bypassing validation.

### `app/discover/defender-import/page.tsx`

Client component implementing the wizard as a small step state machine
(`upload → scanning → review → committing → done`). Uses `fetch` against
`POST /api/applications` for the commit step. Per-row POST failures are
surfaced inline with a retry affordance; successful rows are not re-sent on
retry.

### `app/discover/page.tsx`

New `ENTRY_CARDS` item (`id: 'defenderImport'`, an upload/scan Lucide icon,
`href: '/discover/defender-import'`). The Discover subtitle copy currently
counts the entry points ("Five ways to discover…") — update it in all three
locales alongside the new card.

### i18n

- New `defenderImport` namespace file in each of
  `lib/i18n/locales/{en,fr,nb}/` (wizard chrome: titles, step labels,
  buttons, table headers, error strings).
- New `discover.cards.defenderImport.{title,description,action}` keys in
  each locale's `discover.ts`.
- The seeded extraction/enrichment content itself is English-only sample
  data (voice-interview precedent).

## Data flow

Upload (client, contents ignored) → staged timers → seeded rows from
`defender-import-data.ts` → user selection → one `POST /api/applications`
per selected row via the pure mapper → in-memory entity store (fixtures
seeded on first route hit) → visible via `GET /api/applications`, admin
surfaces, and Ardoq export.

No new API endpoints. No changes to entity types or stores.

## Error handling

- Non-image upload: inline validation message, stay on upload step.
- POST failure: row marked failed with error text; "Retry failed" re-sends
  only failed rows.
- The wizard never blocks on the image itself — extraction is simulated.

## Testing

- Vitest unit tests (`--pool=forks` per repo constraint) for
  `extractedAppToApplication`: field mapping, stable id generation, tag set,
  Shadow/autoDiscovered flags, determinism given injected timestamp.
- Data-integrity test: every `DEFENDER_EXTRACTED_APPS` slug has a matching
  `ENRICHMENTS` entry.
- Wizard verified manually in the dev-server browser preview (upload,
  sample path, commit, re-import dedupe).

## Out of scope (YAGNI)

- Real OCR / vision-API extraction.
- Multi-tenant handling (store defaults to `"default"`).
- Inline editing of enriched fields before commit.
- Persisting import history or the uploaded image itself.
