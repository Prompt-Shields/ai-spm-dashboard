# Defender Screenshot Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A new Discover wizard at `/discover/defender-import` that simulates extracting shadow-AI apps from an uploaded Microsoft Defender for Cloud Apps screenshot, enriches them from a seeded catalog, and commits them to the applications entity store as Shadow records.

**Architecture:** Simulated extraction (no OCR/AI calls) mirroring the voice-interview demo pattern: a seeded data file (`lib/defender-import-data.ts`) supplies the "extracted" rows and their enrichments; a pure mapper converts each row to an `Application` record; the client wizard POSTs selected rows to the **existing** `POST /api/applications` endpoint. Stable ids (`app-shadow-defender-<slug>`) make re-imports upsert, not duplicate.

**Tech Stack:** Next.js 16 (app router, client components), Tailwind classes inline, lucide-react icons, existing in-house i18n (en/fr/nb), vitest (`--pool=forks` — the default pool flakes in this sandbox).

**Spec:** `docs/superpowers/specs/2026-07-13-defender-screenshot-import-design.md`

**Repo constraints (read first):**
- `next build` / `tsc` hang in the sandbox — do NOT run them. Verification = vitest + dev-server browser preview.
- Run tests as: `npx vitest run --pool=forks <path>`
- Ignore any `* 2.*` files / `"app/comply/board 2/"` etc. — folder-sync junk, never touch or commit them.
- Locale files must NOT use `as const` (see comment in `lib/i18n/locales/en.ts`).
- `lib/` root data files use single quotes, no semicolons (match `lib/voice-interview-data.ts`).

---

## File structure

| File | Responsibility |
|---|---|
| `lib/defender-import-data.ts` (create) | Types, seeded extracted rows, enrichment catalog, pure `extractedAppToApplication` mapper |
| `lib/defender-import-data.test.ts` (create) | Unit tests: data integrity + mapper |
| `vitest.config.ts` (modify) | Add `lib/*.test.ts` to include |
| `public/samples/defender-shadow-apps.svg` (create) | Bundled mock Defender screenshot for "Try with sample" |
| `lib/i18n/locales/{en,fr,nb}/defenderImport.ts` (create) | Wizard chrome strings |
| `lib/i18n/locales/{en,fr,nb}.ts` (modify) | Register the new namespace |
| `lib/i18n/locales/{en,fr,nb}/discover.ts` (modify) | New `cards.defenderImport` keys + subtitle "Five→Six ways" |
| `components/defender-import.tsx` (create) | The wizard (step machine: upload → scanning → review → done) |
| `app/discover/defender-import/page.tsx` (create) | Route shell rendering the component |
| `app/discover/page.tsx` (modify) | New featured entry card |

---

### Task 1: Seeded data + pure mapper (TDD)

**Files:**
- Modify: `vitest.config.ts`
- Test: `lib/defender-import-data.test.ts`
- Create: `lib/defender-import-data.ts`

- [ ] **Step 1.1: Add `lib/*.test.ts` to the vitest include list**

In `vitest.config.ts`, replace the `'lib/cost-demo.test.ts'` entry with the glob `'lib/*.test.ts'` (which still covers it):

```ts
    include: [
      'lib/pii/**/*.test.ts',
      'lib/i18n/**/*.test.ts',
      'lib/agent-discovery/**/*.test.ts',
      'lib/*.test.ts',
    ],
```

- [ ] **Step 1.2: Write the failing test**

Create `lib/defender-import-data.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  DEFENDER_EXTRACTED_APPS,
  DEFENDER_ENRICHMENTS,
  extractedAppToApplication,
} from './defender-import-data'

const NOW = '2026-07-13T00:00:00.000Z'

describe('defender import seeded data', () => {
  it('every extracted app has a matching enrichment', () => {
    for (const app of DEFENDER_EXTRACTED_APPS) {
      expect(DEFENDER_ENRICHMENTS[app.slug], `missing enrichment for ${app.slug}`).toBeDefined()
    }
  })

  it('slugs are unique', () => {
    const slugs = DEFENDER_EXTRACTED_APPS.map(a => a.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('risk scores are within 0–100', () => {
    for (const e of Object.values(DEFENDER_ENRICHMENTS)) {
      expect(e.riskScore).toBeGreaterThanOrEqual(0)
      expect(e.riskScore).toBeLessThanOrEqual(100)
    }
  })
})

describe('extractedAppToApplication', () => {
  const app = DEFENDER_EXTRACTED_APPS[0]
  const record = extractedAppToApplication(app, DEFENDER_ENRICHMENTS[app.slug], NOW)

  it('produces a stable, defender-prefixed shadow id', () => {
    expect(record.id).toBe(`app-shadow-defender-${app.slug}`)
    expect(record.autoDiscoveredFromAppId).toBe(`defender-${app.slug}`)
  })

  it('is a Shadow, auto-discovered record with import tags', () => {
    expect(record.deploymentStatus).toBe('Shadow')
    expect(record.autoDiscovered).toBe(true)
    expect(record.tags).toEqual(['ai-system', 'shadow-ai', 'defender-import'])
  })

  it('carries the enrichment risk score and classification', () => {
    expect(record.riskScore).toBe(DEFENDER_ENRICHMENTS[app.slug].riskScore)
    expect(record.dataClassification).toBe(DEFENDER_ENRICHMENTS[app.slug].dataClassification)
  })

  it('leaves owner and department unset (Defender does not know them)', () => {
    expect(record.ownerPersonId).toBeUndefined()
    expect(record.organizationalUnitId).toBeUndefined()
  })

  it('is deterministic given the same injected timestamp', () => {
    expect(extractedAppToApplication(app, DEFENDER_ENRICHMENTS[app.slug], NOW)).toEqual(record)
    expect(record.createdAt).toBe(NOW)
    expect(record.updatedAt).toBe(NOW)
  })
})
```

- [ ] **Step 1.3: Run the test to verify it fails**

Run: `npx vitest run --pool=forks lib/defender-import-data.test.ts`
Expected: FAIL — cannot resolve `./defender-import-data`.

- [ ] **Step 1.4: Create `lib/defender-import-data.ts`**

```ts
// Defender Screenshot Import — seeded, deterministic demo data.
//
// Drives the simulated import at /discover/defender-import. The uploaded
// screenshot's pixels are never read (no real OCR): "extraction" always
// yields DEFENDER_EXTRACTED_APPS, shaped the way a Microsoft Defender for
// Cloud Apps discovered-apps table presents them, and enrichment comes from
// the seeded DEFENDER_ENRICHMENTS catalog. Mirrors the voice-interview-data.ts
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

export const DEFENDER_ENRICHMENTS: Record<string, DefenderEnrichment> = {
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
```

- [ ] **Step 1.5: Run the tests to verify they pass**

Run: `npx vitest run --pool=forks lib/defender-import-data.test.ts`
Expected: PASS (all tests).

- [ ] **Step 1.6: Commit**

```bash
git add vitest.config.ts lib/defender-import-data.ts lib/defender-import-data.test.ts
git commit -m "feat(discover): seeded data + mapper for Defender screenshot import"
```

---

### Task 2: i18n — namespace, discover card, subtitle

**Files:**
- Create: `lib/i18n/locales/en/defenderImport.ts`, `lib/i18n/locales/fr/defenderImport.ts`, `lib/i18n/locales/nb/defenderImport.ts`
- Modify: `lib/i18n/locales/en.ts`, `lib/i18n/locales/fr.ts`, `lib/i18n/locales/nb.ts`
- Modify: `lib/i18n/locales/en/discover.ts`, `lib/i18n/locales/fr/discover.ts`, `lib/i18n/locales/nb/discover.ts`

The existing completeness test (`lib/i18n/completeness.test.ts`) is the failing test here: after adding the en namespace it fails until fr/nb match. **No `as const` in locale files.**

- [ ] **Step 2.1: Create `lib/i18n/locales/en/defenderImport.ts`**

```ts
export const defenderImport = {
  title: 'Defender Screenshot Import',
  subtitle:
    'Upload a screenshot of the discovered-apps list from Microsoft Defender for Cloud Apps. The agent extracts the shadow AI applications, enriches each one from the AI vendor catalog, and adds them to your inventory.',
  badge: 'Simulated demo',
  backToDiscover: 'Back to Discover',
  upload: {
    dropTitle: 'Drop a Defender screenshot here',
    dropHint: 'PNG, JPG or SVG — or browse to pick a file',
    browse: 'Browse files',
    or: 'or',
    sample: 'Try with sample screenshot',
    invalidType: 'That file is not an image. Upload a screenshot (PNG, JPG or SVG).',
  },
  scanning: {
    title: 'Analyzing screenshot…',
    stage1: 'Running OCR pass…',
    stage2: 'Detecting table structure…',
    stage3: 'Matching rows against AI vendor catalog…',
  },
  review: {
    title: 'Extracted applications',
    subtitle: '{count} shadow AI applications found — enriched from the AI vendor catalog',
    enriching: 'Enriching…',
    addButton: 'Add {count} to inventory',
    adding: 'Adding…',
    retryButton: 'Retry failed',
  },
  table: {
    app: 'Application',
    users: 'Users',
    traffic: 'Uploaded',
    defenderScore: 'Defender score',
    vendor: 'Vendor',
    capability: 'AI capability',
    models: 'Models',
    trains: 'Trains on data',
    trainsYes: 'Yes',
    trainsNo: 'No',
    classification: 'Classification',
    risk: 'Risk',
  },
  rowStatus: {
    added: 'Added',
    failed: 'Failed',
  },
  done: {
    title: '{count} applications added to inventory',
    body: 'They are registered as Shadow applications. Assign an owner and a department, then promote each from Shadow after review.',
    importAnother: 'Import another screenshot',
  },
}
```

- [ ] **Step 2.2: Create `lib/i18n/locales/fr/defenderImport.ts`**

Same shape, translated, each translated block commented `// TODO(i18n): native review` on the first translated line (match the precedent style used in `fr/discover.ts`):

```ts
export const defenderImport = {
  title: "Import de capture d'écran Defender", // TODO(i18n): native review
  subtitle:
    "Téléversez une capture d'écran de la liste des applications découvertes de Microsoft Defender for Cloud Apps. L'agent extrait les applications d'IA fantôme, enrichit chacune d'elles à partir du catalogue de fournisseurs d'IA et les ajoute à votre inventaire.",
  badge: 'Démo simulée',
  backToDiscover: 'Retour à Découvrir',
  upload: {
    dropTitle: "Déposez une capture d'écran Defender ici",
    dropHint: 'PNG, JPG ou SVG — ou parcourez pour choisir un fichier',
    browse: 'Parcourir les fichiers',
    or: 'ou',
    sample: "Essayer avec une capture d'exemple",
    invalidType: "Ce fichier n'est pas une image. Téléversez une capture d'écran (PNG, JPG ou SVG).",
  },
  scanning: {
    title: "Analyse de la capture d'écran…",
    stage1: 'Passage OCR en cours…',
    stage2: 'Détection de la structure du tableau…',
    stage3: "Rapprochement avec le catalogue de fournisseurs d'IA…",
  },
  review: {
    title: 'Applications extraites',
    subtitle: "{count} applications d'IA fantôme trouvées — enrichies à partir du catalogue de fournisseurs d'IA",
    enriching: 'Enrichissement…',
    addButton: "Ajouter {count} à l'inventaire",
    adding: 'Ajout…',
    retryButton: 'Réessayer les échecs',
  },
  table: {
    app: 'Application',
    users: 'Utilisateurs',
    traffic: 'Téléversé',
    defenderScore: 'Score Defender',
    vendor: 'Fournisseur',
    capability: 'Capacité IA',
    models: 'Modèles',
    trains: 'Entraîne sur les données',
    trainsYes: 'Oui',
    trainsNo: 'Non',
    classification: 'Classification',
    risk: 'Risque',
  },
  rowStatus: {
    added: 'Ajoutée',
    failed: 'Échec',
  },
  done: {
    title: "{count} applications ajoutées à l'inventaire",
    body: 'Elles sont enregistrées comme applications fantômes (Shadow). Attribuez un responsable et un service, puis promouvez-les après examen.',
    importAnother: 'Importer une autre capture',
  },
}
```

- [ ] **Step 2.3: Create `lib/i18n/locales/nb/defenderImport.ts`**

```ts
export const defenderImport = {
  title: 'Import av Defender-skjermbilde', // TODO(i18n): native review
  subtitle:
    'Last opp et skjermbilde av listen over oppdagede apper fra Microsoft Defender for Cloud Apps. Agenten trekker ut skygge-KI-applikasjonene, beriker hver av dem fra KI-leverandørkatalogen og legger dem til i inventaret ditt.',
  badge: 'Simulert demo',
  backToDiscover: 'Tilbake til Oppdag',
  upload: {
    dropTitle: 'Slipp et Defender-skjermbilde her',
    dropHint: 'PNG, JPG eller SVG — eller bla for å velge en fil',
    browse: 'Bla gjennom filer',
    or: 'eller',
    sample: 'Prøv med eksempelskjermbilde',
    invalidType: 'Filen er ikke et bilde. Last opp et skjermbilde (PNG, JPG eller SVG).',
  },
  scanning: {
    title: 'Analyserer skjermbilde…',
    stage1: 'Kjører OCR-gjennomgang…',
    stage2: 'Gjenkjenner tabellstruktur…',
    stage3: 'Matcher rader mot KI-leverandørkatalogen…',
  },
  review: {
    title: 'Uttrukne applikasjoner',
    subtitle: '{count} skygge-KI-applikasjoner funnet — beriket fra KI-leverandørkatalogen',
    enriching: 'Beriker…',
    addButton: 'Legg {count} til i inventaret',
    adding: 'Legger til…',
    retryButton: 'Prøv mislykkede på nytt',
  },
  table: {
    app: 'Applikasjon',
    users: 'Brukere',
    traffic: 'Lastet opp',
    defenderScore: 'Defender-score',
    vendor: 'Leverandør',
    capability: 'KI-kapabilitet',
    models: 'Modeller',
    trains: 'Trener på data',
    trainsYes: 'Ja',
    trainsNo: 'Nei',
    classification: 'Klassifisering',
    risk: 'Risiko',
  },
  rowStatus: {
    added: 'Lagt til',
    failed: 'Mislyktes',
  },
  done: {
    title: '{count} applikasjoner lagt til i inventaret',
    body: 'De er registrert som skyggeapplikasjoner (Shadow). Tildel en eier og en avdeling, og promoter dem etter gjennomgang.',
    importAnother: 'Importer et nytt skjermbilde',
  },
}
```

- [ ] **Step 2.4: Register the namespace in all three locale indexes**

In `lib/i18n/locales/en.ts`, `fr.ts`, and `nb.ts`: add the import after the `voiceInterview` import and the key after `voiceInterview,` in the exported object. E.g. for `en.ts`:

```ts
import { defenderImport } from './en/defenderImport'
// …
  voiceInterview,
  defenderImport,
```

(`fr.ts` imports from `./fr/defenderImport`, `nb.ts` from `./nb/defenderImport`.)

- [ ] **Step 2.5: Add the discover card keys + update the subtitle in all three `discover.ts` files**

`en/discover.ts` — change `subtitle` and add a card entry after `voiceInterview`:

```ts
  subtitle:
    'Six ways to discover the AI tools and use cases across your organisation — use one or combine them',
```

```ts
    defenderImport: {
      title: 'Defender Screenshot Import',
      description:
        'Upload a screenshot of the shadow-app list from Microsoft Defender for Cloud Apps. The agent extracts the applications, enriches each one, and adds them to your inventory.',
      action: 'Import Screenshot',
    },
```

`fr/discover.ts`:

```ts
  subtitle:
    "Six façons de découvrir les outils et cas d'usage de l'IA dans votre organisation — utilisez-en une ou combinez-les", // TODO(i18n): native review
```

```ts
    defenderImport: {
      title: "Import de capture d'écran Defender",
      description:
        "Téléversez une capture d'écran de la liste des applications fantômes de Microsoft Defender for Cloud Apps. L'agent extrait les applications, enrichit chacune d'elles et les ajoute à votre inventaire.", // TODO(i18n): native review
      action: "Importer une capture",
    },
```

`nb/discover.ts`:

```ts
  subtitle:
    'Seks måter å oppdage KI-verktøyene og bruksområdene i organisasjonen — bruk én eller kombiner dem', // TODO(i18n): native review
```

```ts
    defenderImport: {
      title: 'Import av Defender-skjermbilde',
      description:
        'Last opp et skjermbilde av skyggeapp-listen fra Microsoft Defender for Cloud Apps. Agenten trekker ut applikasjonene, beriker hver av dem og legger dem til i inventaret ditt.', // TODO(i18n): native review
      action: 'Importer skjermbilde',
    },
```

- [ ] **Step 2.6: Run the i18n tests to verify completeness passes**

Run: `npx vitest run --pool=forks lib/i18n`
Expected: PASS — completeness test confirms en/fr/nb have identical key sets.

- [ ] **Step 2.7: Commit**

```bash
git add lib/i18n
git commit -m "feat(i18n): defenderImport namespace + discover card copy (en/fr/nb)"
```

---

### Task 3: Bundled sample screenshot

**Files:**
- Create: `public/samples/defender-shadow-apps.svg`

- [ ] **Step 3.1: Create the SVG mock of the Defender discovered-apps table**

A dark-portal-style table matching the 8 seeded rows (name, score, users, traffic). Exact content:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="560" viewBox="0 0 960 560" font-family="'Segoe UI', system-ui, sans-serif">
  <rect width="960" height="560" fill="#1b1a19"/>
  <rect width="960" height="48" fill="#0b0a0a"/>
  <text x="20" y="30" fill="#ffffff" font-size="15" font-weight="600">Microsoft Defender for Cloud Apps</text>
  <text x="20" y="86" fill="#ffffff" font-size="20" font-weight="600">Cloud app catalog — Generative AI</text>
  <text x="20" y="110" fill="#a19f9d" font-size="12">8 apps · Sanctioned: 0 · Unsanctioned: 8 · Last updated: Jul 12, 2026</text>
  <g font-size="12">
    <rect x="20" y="128" width="920" height="34" fill="#252423"/>
    <text x="36" y="150" fill="#a19f9d" font-weight="600">App</text>
    <text x="380" y="150" fill="#a19f9d" font-weight="600">Category</text>
    <text x="580" y="150" fill="#a19f9d" font-weight="600">Score</text>
    <text x="660" y="150" fill="#a19f9d" font-weight="600">Users</text>
    <text x="740" y="150" fill="#a19f9d" font-weight="600">Uploaded</text>
    <text x="850" y="150" fill="#a19f9d" font-weight="600">Last seen</text>
  </g>
  <g font-size="13" fill="#ffffff">
    <rect x="20" y="162" width="920" height="44" fill="#1b1a19" stroke="#3b3a39" stroke-width="0.5"/>
    <text x="36" y="189">ChatGPT (personal)</text><text x="380" y="189" fill="#c8c6c4">Generative AI</text><text x="580" y="189" fill="#ffaa44">6</text><text x="660" y="189">214</text><text x="740" y="189">3.1 GB</text><text x="850" y="189" fill="#c8c6c4">Jul 12</text>
    <rect x="20" y="206" width="920" height="44" fill="#201f1e" stroke="#3b3a39" stroke-width="0.5"/>
    <text x="36" y="233">DeepSeek Chat</text><text x="380" y="233" fill="#c8c6c4">Generative AI</text><text x="580" y="233" fill="#d13438">2</text><text x="660" y="233">37</text><text x="740" y="233">820 MB</text><text x="850" y="233" fill="#c8c6c4">Jul 11</text>
    <rect x="20" y="250" width="920" height="44" fill="#1b1a19" stroke="#3b3a39" stroke-width="0.5"/>
    <text x="36" y="277">Perplexity</text><text x="380" y="277" fill="#c8c6c4">Generative AI</text><text x="580" y="277" fill="#ffaa44">7</text><text x="660" y="277">96</text><text x="740" y="277">440 MB</text><text x="850" y="277" fill="#c8c6c4">Jul 12</text>
    <rect x="20" y="294" width="920" height="44" fill="#201f1e" stroke="#3b3a39" stroke-width="0.5"/>
    <text x="36" y="321">Character.AI</text><text x="380" y="321" fill="#c8c6c4">Generative AI</text><text x="580" y="321" fill="#d13438">3</text><text x="660" y="321">18</text><text x="740" y="321">95 MB</text><text x="850" y="321" fill="#c8c6c4">Jul 8</text>
    <rect x="20" y="338" width="920" height="44" fill="#1b1a19" stroke="#3b3a39" stroke-width="0.5"/>
    <text x="36" y="365">Midjourney</text><text x="380" y="365" fill="#c8c6c4">AI image generation</text><text x="580" y="365" fill="#ffaa44">5</text><text x="660" y="365">42</text><text x="740" y="365">1.6 GB</text><text x="850" y="365" fill="#c8c6c4">Jul 10</text>
    <rect x="20" y="382" width="920" height="44" fill="#201f1e" stroke="#3b3a39" stroke-width="0.5"/>
    <text x="36" y="409">Otter.ai</text><text x="380" y="409" fill="#c8c6c4">AI transcription</text><text x="580" y="409" fill="#ffaa44">6</text><text x="660" y="409">71</text><text x="740" y="409">2.4 GB</text><text x="850" y="409" fill="#c8c6c4">Jul 12</text>
    <rect x="20" y="426" width="920" height="44" fill="#1b1a19" stroke="#3b3a39" stroke-width="0.5"/>
    <text x="36" y="453">Poe</text><text x="380" y="453" fill="#c8c6c4">Generative AI</text><text x="580" y="453" fill="#d13438">4</text><text x="660" y="453">29</text><text x="740" y="453">210 MB</text><text x="850" y="453" fill="#c8c6c4">Jul 9</text>
    <rect x="20" y="470" width="920" height="44" fill="#201f1e" stroke="#3b3a39" stroke-width="0.5"/>
    <text x="36" y="497">QuillBot</text><text x="380" y="497" fill="#c8c6c4">AI writing assistant</text><text x="580" y="497" fill="#ffaa44">5</text><text x="660" y="497">133</text><text x="740" y="497">380 MB</text><text x="850" y="497" fill="#c8c6c4">Jul 12</text>
  </g>
  <text x="20" y="540" fill="#605e5c" font-size="10">Sample data — mock screenshot bundled with the AI-SPM demo. Not a real Defender export.</text>
</svg>
```

- [ ] **Step 3.2: Verify it renders**

Run: `open public/samples/defender-shadow-apps.svg` is not available in sandbox — instead verify well-formedness: `node -e "new (require('next/dist/compiled/@edge-runtime/primitives').TextDecoder)" ` is overkill; just check the XML parses:
`node --input-type=module -e "import {readFileSync} from 'fs'; const s = readFileSync('public/samples/defender-shadow-apps.svg','utf8'); if(!s.includes('</svg>')) throw new Error('truncated'); console.log('ok', s.length)"`
Expected: `ok <byte count>`. (Visual check happens in Task 6 via the browser preview.)

- [ ] **Step 3.3: Commit**

```bash
git add public/samples/defender-shadow-apps.svg
git commit -m "feat(discover): bundled sample Defender screenshot for import demo"
```

---

### Task 4: Wizard component + route

**Files:**
- Create: `components/defender-import.tsx`
- Create: `app/discover/defender-import/page.tsx`

- [ ] **Step 4.1: Create `components/defender-import.tsx`**

Full component. Step machine `upload → scanning → review → done`. Notes baked into the code:
- The sample button loads the bundled SVG **through the same accept path** conceptually — it sets the preview `src` to the public URL and starts the scan; user uploads go through `acceptFile` which enforces `file.type.startsWith('image/')`.
- Commit POSTs sequentially to `POST /api/applications`; per-row status; "Retry failed" re-sends only failed rows; already-`added` rows are never re-sent.
- Timestamps for records use `new Date().toISOString()` at commit time (client), injected into the pure mapper.

```tsx
'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  FileImage,
  ImageUp,
  Loader2,
  ScanText,
  ShieldAlert,
  XCircle,
} from 'lucide-react'
import { useT } from '@/lib/i18n/provider'
import {
  DEFENDER_EXTRACTED_APPS,
  DEFENDER_ENRICHMENTS,
  extractedAppToApplication,
} from '@/lib/defender-import-data'

type Step = 'upload' | 'scanning' | 'review' | 'done'
type RowStatus = 'idle' | 'pending' | 'added' | 'failed'

const SCAN_STAGE_MS = 1200
const ENRICH_ROW_MS = 350
const SAMPLE_SRC = '/samples/defender-shadow-apps.svg'
const SCAN_STAGES = ['stage1', 'stage2', 'stage3'] as const

function riskTone(score: number): string {
  if (score >= 75) return 'bg-red-50 text-red-600'
  if (score >= 55) return 'bg-amber-50 text-amber-600'
  return 'bg-emerald-50 text-emerald-600'
}

export function DefenderImport() {
  const t = useT()
  const [step, setStep] = useState<Step>('upload')
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [scanStage, setScanStage] = useState(0)
  const [enrichedCount, setEnrichedCount] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(DEFENDER_EXTRACTED_APPS.map(a => a.slug))
  )
  const [rowStatus, setRowStatus] = useState<Record<string, RowStatus>>({})
  const [committing, setCommitting] = useState(false)
  const [addedCount, setAddedCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  // Revoke the preview object URL on unmount.
  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    },
    []
  )

  const startScan = useCallback((src: string) => {
    setImageSrc(src)
    setUploadError(false)
    setScanStage(0)
    setStep('scanning')
  }, [])

  const acceptFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) return
      if (!file.type.startsWith('image/')) {
        setUploadError(true)
        return
      }
      const url = URL.createObjectURL(file)
      objectUrlRef.current = url
      startScan(url)
    },
    [startScan]
  )

  // Scanning: advance through the staged status lines, then move to review.
  useEffect(() => {
    if (step !== 'scanning') return
    if (scanStage >= SCAN_STAGES.length) {
      setEnrichedCount(0)
      setStep('review')
      return
    }
    const id = setTimeout(() => setScanStage(s => s + 1), SCAN_STAGE_MS)
    return () => clearTimeout(id)
  }, [step, scanStage])

  // Review: reveal enrichment row by row.
  useEffect(() => {
    if (step !== 'review' || enrichedCount >= DEFENDER_EXTRACTED_APPS.length) return
    const id = setTimeout(() => setEnrichedCount(c => c + 1), ENRICH_ROW_MS)
    return () => clearTimeout(id)
  }, [step, enrichedCount])

  const toggleRow = (slug: string) =>
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })

  const commit = useCallback(
    async (onlyFailed: boolean) => {
      setCommitting(true)
      const targets = DEFENDER_EXTRACTED_APPS.filter(
        a =>
          selected.has(a.slug) &&
          rowStatus[a.slug] !== 'added' &&
          (!onlyFailed || rowStatus[a.slug] === 'failed')
      )
      const statuses: Record<string, RowStatus> = { ...rowStatus }
      for (const app of targets) {
        statuses[app.slug] = 'pending'
        setRowStatus({ ...statuses })
        try {
          const record = extractedAppToApplication(
            app,
            DEFENDER_ENRICHMENTS[app.slug],
            new Date().toISOString()
          )
          const res = await fetch('/api/applications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record),
          })
          statuses[app.slug] = res.ok ? 'added' : 'failed'
        } catch {
          statuses[app.slug] = 'failed'
        }
        setRowStatus({ ...statuses })
      }
      setCommitting(false)
      const added = DEFENDER_EXTRACTED_APPS.filter(
        a => selected.has(a.slug) && statuses[a.slug] === 'added'
      ).length
      setAddedCount(added)
      const failed = DEFENDER_EXTRACTED_APPS.some(
        a => selected.has(a.slug) && statuses[a.slug] === 'failed'
      )
      if (!failed) setStep('done')
    },
    [selected, rowStatus]
  )

  const restart = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setImageSrc(null)
    setRowStatus({})
    setSelected(new Set(DEFENDER_EXTRACTED_APPS.map(a => a.slug)))
    setAddedCount(0)
    setStep('upload')
  }

  const anyFailed = DEFENDER_EXTRACTED_APPS.some(
    a => selected.has(a.slug) && rowStatus[a.slug] === 'failed'
  )
  const enrichmentDone = enrichedCount >= DEFENDER_EXTRACTED_APPS.length

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mb-3"
        >
          <ArrowLeft size={14} />
          {t('defenderImport.backToDiscover')}
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900">{t('defenderImport.title')}</h1>
          <span className="text-[10px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full">
            {t('defenderImport.badge')}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-0.5 max-w-2xl">{t('defenderImport.subtitle')}</p>
      </div>

      {/* Step: upload */}
      {step === 'upload' && (
        <div className="max-w-2xl">
          <div
            onDragOver={e => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault()
              setDragOver(false)
              acceptFile(e.dataTransfer.files?.[0])
            }}
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
              dragOver ? 'border-sky-400 bg-sky-50' : 'border-slate-300 bg-white'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4">
              <ImageUp size={22} />
            </div>
            <h2 className="text-sm font-semibold text-slate-900 mb-1">
              {t('defenderImport.upload.dropTitle')}
            </h2>
            <p className="text-xs text-slate-500 mb-4">{t('defenderImport.upload.dropHint')}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition-colors"
              >
                {t('defenderImport.upload.browse')}
              </button>
              <span className="text-xs text-slate-400">{t('defenderImport.upload.or')}</span>
              <button
                onClick={() => startScan(SAMPLE_SRC)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-700 transition-colors inline-flex items-center gap-1.5"
              >
                <FileImage size={14} />
                {t('defenderImport.upload.sample')}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => acceptFile(e.target.files?.[0])}
            />
          </div>
          {uploadError && (
            <p className="flex items-center gap-1.5 text-xs text-red-600 mt-3">
              <ShieldAlert size={14} />
              {t('defenderImport.upload.invalidType')}
            </p>
          )}
        </div>
      )}

      {/* Step: scanning */}
      {step === 'scanning' && imageSrc && (
        <div className="max-w-2xl">
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element -- user-supplied blob/object URL preview */}
            <img src={imageSrc} alt="" className="w-full opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-400/20 to-transparent animate-pulse" />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 mt-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
              <ScanText size={16} className="text-sky-600" />
              {t('defenderImport.scanning.title')}
            </div>
            <ul className="space-y-2">
              {SCAN_STAGES.map((key, i) => (
                <li key={key} className="flex items-center gap-2 text-xs">
                  {i < scanStage ? (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  ) : i === scanStage ? (
                    <Loader2 size={14} className="text-sky-500 animate-spin" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block" />
                  )}
                  <span className={i <= scanStage ? 'text-slate-700' : 'text-slate-400'}>
                    {t(`defenderImport.scanning.${key}`)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Step: review */}
      {step === 'review' && (
        <div>
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-slate-700">
              {t('defenderImport.review.title')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('defenderImport.review.subtitle', { count: DEFENDER_EXTRACTED_APPS.length })}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-400">
                  <th className="p-3 w-8" />
                  <th className="p-3 font-medium">{t('defenderImport.table.app')}</th>
                  <th className="p-3 font-medium">{t('defenderImport.table.defenderScore')}</th>
                  <th className="p-3 font-medium">{t('defenderImport.table.users')}</th>
                  <th className="p-3 font-medium">{t('defenderImport.table.traffic')}</th>
                  <th className="p-3 font-medium">{t('defenderImport.table.vendor')}</th>
                  <th className="p-3 font-medium">{t('defenderImport.table.capability')}</th>
                  <th className="p-3 font-medium">{t('defenderImport.table.models')}</th>
                  <th className="p-3 font-medium">{t('defenderImport.table.trains')}</th>
                  <th className="p-3 font-medium">{t('defenderImport.table.classification')}</th>
                  <th className="p-3 font-medium">{t('defenderImport.table.risk')}</th>
                  <th className="p-3 w-20" />
                </tr>
              </thead>
              <tbody>
                {DEFENDER_EXTRACTED_APPS.map((app, i) => {
                  const enriched = i < enrichedCount
                  const e = DEFENDER_ENRICHMENTS[app.slug]
                  const status = rowStatus[app.slug] ?? 'idle'
                  return (
                    <tr key={app.slug} className="border-b border-slate-100 last:border-0">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.has(app.slug)}
                          disabled={committing || status === 'added'}
                          onChange={() => toggleRow(app.slug)}
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{app.name}</div>
                        <div className="text-slate-400">{app.category}</div>
                      </td>
                      <td className="p-3 text-slate-600">{app.defenderScore}/10</td>
                      <td className="p-3 text-slate-600">{app.users}</td>
                      <td className="p-3 text-slate-600">{app.trafficUploaded}</td>
                      {enriched ? (
                        <>
                          <td className="p-3 text-slate-600">{e.vendor}</td>
                          <td className="p-3 text-slate-600 max-w-[160px]">{e.aiCapability}</td>
                          <td className="p-3 text-slate-600">{e.models.join(', ')}</td>
                          <td className="p-3">
                            <span className={e.trainsOnData ? 'text-red-600 font-semibold' : 'text-emerald-600'}>
                              {t(e.trainsOnData ? 'defenderImport.table.trainsYes' : 'defenderImport.table.trainsNo')}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 capitalize">{e.dataClassification}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full font-semibold ${riskTone(e.riskScore)}`}>
                              {e.riskScore}
                            </span>
                          </td>
                        </>
                      ) : (
                        <td colSpan={6} className="p-3 text-slate-400">
                          <span className="inline-flex items-center gap-1.5">
                            <Loader2 size={12} className="animate-spin" />
                            {t('defenderImport.review.enriching')}
                          </span>
                        </td>
                      )}
                      <td className="p-3">
                        {status === 'pending' && <Loader2 size={14} className="animate-spin text-sky-500" />}
                        {status === 'added' && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                            <CheckCircle2 size={13} />
                            {t('defenderImport.rowStatus.added')}
                          </span>
                        )}
                        {status === 'failed' && (
                          <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                            <XCircle size={13} />
                            {t('defenderImport.rowStatus.failed')}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => commit(false)}
              disabled={committing || !enrichmentDone || selected.size === 0}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {committing && <Loader2 size={13} className="animate-spin" />}
              {t(committing ? 'defenderImport.review.adding' : 'defenderImport.review.addButton', {
                count: selected.size,
              })}
            </button>
            {anyFailed && !committing && (
              <button
                onClick={() => commit(true)}
                className="text-xs font-semibold px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
              >
                {t('defenderImport.review.retryButton')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step: done */}
      {step === 'done' && (
        <div className="max-w-xl bg-white border border-emerald-200 rounded-xl p-8 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={24} />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1">
            {t('defenderImport.done.title', { count: addedCount })}
          </h2>
          <p className="text-xs text-slate-500 mb-6">{t('defenderImport.done.body')}</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/discover"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition-colors"
            >
              {t('defenderImport.backToDiscover')}
            </Link>
            <button
              onClick={restart}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              {t('defenderImport.done.importAnother')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4.2: Create `app/discover/defender-import/page.tsx`**

```tsx
import { DefenderImport } from '@/components/defender-import'

export default function DefenderImportPage() {
  return <DefenderImport />
}
```

- [ ] **Step 4.3: Commit**

```bash
git add components/defender-import.tsx app/discover/defender-import/page.tsx
git commit -m "feat(discover): Defender screenshot import wizard page"
```

---

### Task 5: Discover entry card

**Files:**
- Modify: `app/discover/page.tsx`

- [ ] **Step 5.1: Add the card**

Three edits to `app/discover/page.tsx`:

1. Import the icon — add `ImageUp` to the lucide-react import.
2. Extend the id union and add the entry right after `voiceInterview` (featured, so the grid stays even: 2 full-width featured cards + 4 regular):

```ts
const ENTRY_CARDS: {
  Icon: LucideIcon
  id: 'voiceInterview' | 'defenderImport' | 'cisoCampaign' | 'agenticMonitoring' | 'selfRegistration' | 'autoDetect'
  color: 'indigo' | 'emerald' | 'sky' | 'amber' | 'violet'
  badgeCount?: number
  href?: string
  featured?: boolean
}[] = [
  {
    Icon: AudioLines,
    id: 'voiceInterview',
    color: 'violet',
    href: '/discover/voice-interview',
    featured: true,
  },
  {
    Icon: ImageUp,
    id: 'defenderImport',
    color: 'sky',
    href: '/discover/defender-import',
    featured: true,
  },
  // …rest unchanged
```

3. The featured wrapper class is hardcoded violet; make it follow the card color. Replace:

```tsx
className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm ${card.featured ? 'col-span-2 border-violet-200 bg-gradient-to-br from-violet-50/60 to-white' : ''}`}
```

with:

```tsx
className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm ${
  card.featured
    ? `col-span-2 ${card.color === 'sky' ? 'border-sky-200 bg-gradient-to-br from-sky-50/60 to-white' : 'border-violet-200 bg-gradient-to-br from-violet-50/60 to-white'}`
    : ''
}`}
```

- [ ] **Step 5.2: Commit**

```bash
git add app/discover/page.tsx
git commit -m "feat(discover): entry card for Defender screenshot import"
```

---

### Task 6: Full verification

- [ ] **Step 6.1: Run the whole test suite**

Run: `npx vitest run --pool=forks`
Expected: ALL PASS (pii, i18n incl. completeness, agent-discovery, defender-import-data).

- [ ] **Step 6.2: Browser verification (dev server preview — never Bash)**

Start the dev server via the preview tooling (`.claude/launch.json`; create a `dev` entry `npm run dev` on port 3000 if missing) and verify:

1. `/discover` shows the new featured "Defender Screenshot Import" card; subtitle says "Six ways…".
2. Card link opens `/discover/defender-import`; upload step renders.
3. "Try with sample screenshot" → scanning stages animate → review table appears and enriches row by row.
4. "Add 8 to inventory" → all rows flip to "Added" → done panel shows "8 applications added to inventory".
5. Dedupe: `curl -s localhost:3000/api/applications | grep -o 'app-shadow-defender-' | wc -l` → 8 (the API returns single-line JSON, so `grep -c` would print 1; `autoDiscoveredFromAppId` values are `defender-<slug>` without the prefix, so the count is exactly one per record). Run the import again (Import another screenshot → sample → add) and re-check → still 8.
6. Non-image rejection: attempt a `.txt` file via the file picker → inline error, stays on upload.
7. Switch locale to fr and nb (locale switcher / `locale` cookie) → wizard chrome and discover card translate; completeness already guaranteed by tests.
8. Screenshot the review table and done panel for the final report.

- [ ] **Step 6.3: Final commit if verification produced fixes**

```bash
git add -A ':!*" 2".*' && git status --short   # never commit "* 2.*" sync-junk files
git commit -m "fix(discover): defender import verification fixes"   # only if needed
```

---

## Notes for the implementer

- `POST /api/applications` → `parseApplicationInput` accepts every field the mapper emits (`id`, `deploymentStatus`, `riskScore` clamped 0–100, `tags`, `autoDiscovered`, `autoDiscoveredFromAppId`, `dataClassification`, `description`); `ownerPersonId`/`organizationalUnitId` are optional and intentionally omitted.
- The API does not distinguish created vs updated (always 201 + upserted record) — success copy is aggregate ("N added"), per spec.
- `parseApplicationInput` ignores client-sent `createdAt`/`updatedAt` (the server stamps its own `nowIso()`), so the mapper's injected timestamp only matters for test determinism — don't be surprised that stored timestamps differ from what the client sent.
- The entity store is in-memory and reseeds on server restart; dedupe checks (6.2.5) must happen without restarting the dev server in between.
- i18n `t()` interpolates `{count}` via the `vars` argument: `t('key', { count: n })`.
