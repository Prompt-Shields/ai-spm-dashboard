# PII Shield Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a client-side "PII Shield Demo" nav tab that detects PII in a user's prompt, anonymizes it before a simulated ChatGPT call, and restores the PII in the response.

**Architecture:** Pure, framework-free logic in `lib/pii/` (detect → anonymize → simulateReply → deanonymize), unit-tested with Vitest. A `'use client'` page at `app/pii-shield/page.tsx` composes those functions into a 4-stage pipeline UI with small presentational components in `components/pii-shield/`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind, lucide-react, framer-motion (already a dependency), Vitest (new dev dependency).

---

## File Structure

| File | Responsibility |
|------|----------------|
| `lib/pii/types.ts` | Shared types: `PiiType`, `PiiMatch`, `MappingEntry`, `AnonymizeResult` |
| `lib/pii/detector.ts` | `detectPII(text)` — priority-ordered matchers, overlap rejection |
| `lib/pii/anonymizer.ts` | `anonymize(text, matches)` / `deanonymize(text, mapping)` |
| `lib/pii/mock-chatgpt.ts` | `simulateReply(maskedPrompt)` — deterministic placeholder-only reply |
| `lib/pii/examples.ts` | `EXAMPLE_PROMPTS` — 3 fixed PII-laden sample prompts (acceptance fixtures) |
| `lib/pii/*.test.ts` | Vitest unit tests |
| `components/pii-shield/highlighted-text.tsx` | Renders text with PII/placeholder spans color-coded by type |
| `components/pii-shield/stage-card.tsx` | One titled pipeline-stage card with framer-motion reveal |
| `components/pii-shield/mapping-panel.tsx` | value → type → placeholder table |
| `app/pii-shield/page.tsx` | Client page orchestrating state + staged reveal |
| `components/app-header.tsx` | Add one NAV entry (modify) |
| `package.json` | Add Vitest + `test` script (modify) |
| `vitest.config.ts` | Scope test discovery to `lib/pii/**` (create) |

**Key design decisions baked into the logic:**
- **Detection runs matchers in priority order and rejects any match overlapping an already-accepted one.** Order: `EMAIL, API_KEY, CREDIT_CARD, SSN, IP, PHONE, PERSON, ADDRESS`. This prevents the phone matcher from grabbing an SSN/card/IP, etc. — no fragile tie-breaking needed.
- **Credit cards** are matched loosely then validated with the **Luhn checksum** to cut false positives.
- **Placeholders** are `[TYPE_n]`; identical (type,value) pairs reuse the same token. Masking replaces spans **last-to-first** so indices stay valid. Restore replaces **longest placeholder first** so `[EMAIL_1]` can't corrupt `[EMAIL_10]`.
- **Round-trip invariant:** `deanonymize(anonymize(t, detectPII(t)).masked, mapping) === t`.

---

## Task 1: Vitest setup

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Add Vitest dev dependency**

Run: `npm install -D vitest@^2`
Expected: vitest added to devDependencies.

- [ ] **Step 2: Add test script to `package.json`**

In `"scripts"`, add: `"test": "vitest run"` (and `"test:watch": "vitest"`).

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['lib/pii/**/*.test.ts'],
    environment: 'node',
  },
})
```

- [ ] **Step 4: Verify runner works (no tests yet is fine, or after Task 2)**

Run: `npm test`
Expected: vitest runs, "no test files found" or passes — no crash collecting Next files.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add Vitest scoped to lib/pii"
```

---

## Task 2: PII types

**Files:**
- Create: `lib/pii/types.ts`

- [ ] **Step 1: Write the types** (no test — pure declarations consumed by later tasks)

```ts
export type PiiType =
  | 'EMAIL' | 'PHONE' | 'SSN' | 'CREDIT_CARD' | 'IP' | 'API_KEY' | 'PERSON' | 'ADDRESS'

export interface PiiMatch {
  type: PiiType
  value: string
  start: number
  end: number
}

export interface MappingEntry {
  placeholder: string
  value: string
  type: PiiType
}

export interface AnonymizeResult {
  masked: string
  mapping: MappingEntry[]
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/pii/types.ts
git commit -m "feat(pii): add shared PII types"
```

---

## Task 3: Detector (TDD)

**Files:**
- Create: `lib/pii/detector.ts`
- Test: `lib/pii/detector.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, it, expect } from 'vitest'
import { detectPII } from './detector'

describe('detectPII', () => {
  it('detects email', () => {
    const m = detectPII('reach me at sarah.chen@acme.com please')
    expect(m).toContainEqual(expect.objectContaining({ type: 'EMAIL', value: 'sarah.chen@acme.com' }))
  })
  it('detects a Luhn-valid credit card and ignores invalid digit runs', () => {
    const ok = detectPII('card 4111 1111 1111 1111 here')
    expect(ok.some(x => x.type === 'CREDIT_CARD' && x.value === '4111 1111 1111 1111')).toBe(true)
    const bad = detectPII('order number 1234 5678 1234 5670')
    expect(bad.some(x => x.type === 'CREDIT_CARD')).toBe(false)
  })
  it('detects SSN and does NOT also report it as a phone', () => {
    const m = detectPII('his SSN is 123-45-6789 ok')
    expect(m.filter(x => x.start <= 11 && x.end >= 22).map(x => x.type)).toEqual(['SSN'])
  })
  it('detects phone, IP, and api key', () => {
    expect(detectPII('call +1 (415) 555-0142').some(x => x.type === 'PHONE')).toBe(true)
    expect(detectPII('server 192.168.1.42 down').some(x => x.type === 'IP' && x.value === '192.168.1.42')).toBe(true)
    expect(detectPII('key sk-proj-abc123XYZ456def789 leaked').some(x => x.type === 'API_KEY')).toBe(true)
  })
  it('detects a person from the name dictionary', () => {
    expect(detectPII('email Sarah Chen today').some(x => x.type === 'PERSON' && x.value === 'Sarah Chen')).toBe(true)
  })
  it('returns matches sorted by start, no overlaps', () => {
    const m = detectPII('Sarah Chen at sarah.chen@acme.com card 4111 1111 1111 1111')
    for (let i = 1; i < m.length; i++) expect(m[i].start).toBeGreaterThanOrEqual(m[i - 1].end)
  })
  it('returns empty for clean text', () => {
    expect(detectPII('the quick brown fox jumps')).toEqual([])
  })
})
```

- [ ] **Step 2: Run, verify fail** — `npm test` → FAIL (detectPII not defined)

- [ ] **Step 3: Implement `detector.ts`**

```ts
import type { PiiMatch, PiiType } from './types'

const NAMES = ['Sarah','John','Michael','Jessica','David','Emily','Daniel','Laura','James','Anna','Robert','Maria','William','Linda','Chen','Priya','Wei','Carlos','Fatima','Hiroshi']
const STREET = 'Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way'

function luhnValid(digits: string): boolean {
  const d = digits.replace(/[^0-9]/g, '')
  if (d.length < 13 || d.length > 19) return false
  let sum = 0, alt = false
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i])
    if (alt) { n *= 2; if (n > 9) n -= 9 }
    sum += n; alt = !alt
  }
  return sum % 10 === 0
}

interface Detector { type: PiiType; regex: RegExp; validate?: (s: string) => boolean }

// Priority order: earlier detectors win overlaps.
const DETECTORS: Detector[] = [
  { type: 'EMAIL', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
  { type: 'API_KEY', regex: /\bsk-(?:proj-)?[A-Za-z0-9]{8,}\b/g },
  { type: 'CREDIT_CARD', regex: /\b\d(?:[ -]?\d){12,18}\b/g, validate: luhnValid },
  { type: 'SSN', regex: /\b\d{3}-\d{2}-\d{4}\b/g },
  { type: 'IP', regex: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g },
  { type: 'PHONE', regex: /(?:\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g },
  { type: 'PERSON', regex: new RegExp(`\\b(?:${NAMES.join('|')})\\s+[A-Z][a-z]+\\b`, 'g') },
  { type: 'ADDRESS', regex: new RegExp(`\\b\\d{1,5}\\s+(?:[A-Z][a-z]+\\s+){1,3}(?:${STREET})\\b\\.?`, 'g') },
]

const overlaps = (a: PiiMatch, s: number, e: number) => a.start < e && s < a.end

export function detectPII(text: string): PiiMatch[] {
  const accepted: PiiMatch[] = []
  for (const d of DETECTORS) {
    for (const m of text.matchAll(d.regex)) {
      const value = m[0]
      const start = m.index ?? 0
      const end = start + value.length
      if (d.validate && !d.validate(value)) continue
      if (accepted.some((a) => overlaps(a, start, end))) continue
      accepted.push({ type: d.type, value, start, end })
    }
  }
  return accepted.sort((a, b) => a.start - b.start)
}
```

- [ ] **Step 4: Run, verify pass** — `npm test` → PASS

- [ ] **Step 5: Commit**

```bash
git add lib/pii/detector.ts lib/pii/detector.test.ts
git commit -m "feat(pii): add priority-ordered PII detector with Luhn-validated cards"
```

---

## Task 4: Anonymizer (TDD)

**Files:**
- Create: `lib/pii/anonymizer.ts`
- Test: `lib/pii/anonymizer.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, it, expect } from 'vitest'
import { detectPII } from './detector'
import { anonymize, deanonymize } from './anonymizer'

describe('anonymize/deanonymize', () => {
  it('replaces PII with typed placeholders', () => {
    const t = 'email sarah.chen@acme.com'
    const { masked, mapping } = anonymize(t, detectPII(t))
    expect(masked).toBe('email [EMAIL_1]')
    expect(mapping[0]).toEqual({ placeholder: '[EMAIL_1]', value: 'sarah.chen@acme.com', type: 'EMAIL' })
  })
  it('reuses one placeholder for a repeated value', () => {
    const t = 'a@b.com and a@b.com'
    const { masked, mapping } = anonymize(t, detectPII(t))
    expect(masked).toBe('[EMAIL_1] and [EMAIL_1]')
    expect(mapping).toHaveLength(1)
  })
  it('round-trips every example prompt', async () => {
    const { EXAMPLE_PROMPTS } = await import('./examples')
    for (const { text } of EXAMPLE_PROMPTS) {
      const { masked, mapping } = anonymize(text, detectPII(text))
      expect(deanonymize(masked, mapping)).toBe(text)
    }
  })
  it('restore is not corrupted by placeholder prefixes ([EMAIL_1] vs [EMAIL_10])', () => {
    const mapping = [
      { placeholder: '[EMAIL_1]', value: 'one@x.com', type: 'EMAIL' as const },
      { placeholder: '[EMAIL_10]', value: 'ten@x.com', type: 'EMAIL' as const },
    ]
    expect(deanonymize('[EMAIL_10] [EMAIL_1]', mapping)).toBe('ten@x.com one@x.com')
  })
})
```

- [ ] **Step 2: Run, verify fail** — `npm test` → FAIL

- [ ] **Step 3: Implement `anonymizer.ts`**

```ts
import type { AnonymizeResult, MappingEntry, PiiMatch } from './types'

export function anonymize(text: string, matches: PiiMatch[]): AnonymizeResult {
  const counters: Partial<Record<string, number>> = {}
  const byKey = new Map<string, string>()
  const mapping: MappingEntry[] = []
  for (const m of matches) {
    const key = `${m.type}|${m.value}`
    if (!byKey.has(key)) {
      counters[m.type] = (counters[m.type] ?? 0) + 1
      const placeholder = `[${m.type}_${counters[m.type]}]`
      byKey.set(key, placeholder)
      mapping.push({ placeholder, value: m.value, type: m.type })
    }
  }
  let masked = text
  for (const m of [...matches].sort((a, b) => b.start - a.start)) {
    const ph = byKey.get(`${m.type}|${m.value}`)!
    masked = masked.slice(0, m.start) + ph + masked.slice(m.end)
  }
  return { masked, mapping }
}

export function deanonymize(text: string, mapping: MappingEntry[]): string {
  let out = text
  for (const e of [...mapping].sort((a, b) => b.placeholder.length - a.placeholder.length)) {
    out = out.split(e.placeholder).join(e.value)
  }
  return out
}
```

- [ ] **Step 4: Run, verify pass** — `npm test` → PASS

- [ ] **Step 5: Commit**

```bash
git add lib/pii/anonymizer.ts lib/pii/anonymizer.test.ts
git commit -m "feat(pii): add anonymize/deanonymize with round-trip guarantee"
```

---

## Task 5: Examples + Mock ChatGPT (TDD)

**Files:**
- Create: `lib/pii/examples.ts`, `lib/pii/mock-chatgpt.ts`
- Test: `lib/pii/mock-chatgpt.test.ts`

- [ ] **Step 1: Create `examples.ts`** (exact acceptance fixtures)

```ts
export interface ExamplePrompt { label: string; text: string }

export const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    label: 'Payment reminder email',
    text: 'Draft a payment-reminder email to Sarah Chen at sarah.chen@acme.com — her invoice tied to card 4111 1111 1111 1111 is overdue.',
  },
  {
    label: 'Support ticket',
    text: 'Customer John Doe called from +1 (415) 555-0142 about his account; his SSN is 123-45-6789 and he wants a refund.',
  },
  {
    label: 'Debugging an integration',
    text: 'Our integration uses API key sk-proj-abc123XYZ456def789 and the server at 192.168.1.42 keeps timing out — can you debug?',
  },
]
```
(Note: `John` and `Sarah` must be in the detector name dictionary so "John Doe" / "Sarah Chen" are captured — both are already included in NAMES.)

- [ ] **Step 2: Write failing test for mock-chatgpt**

```ts
import { describe, it, expect } from 'vitest'
import { detectPII } from './detector'
import { anonymize } from './anonymizer'
import { simulateReply } from './mock-chatgpt'
import { EXAMPLE_PROMPTS } from './examples'

describe('simulateReply', () => {
  it('never leaks raw PII — output may only contain placeholder tokens', () => {
    for (const { text } of EXAMPLE_PROMPTS) {
      const { masked, mapping } = anonymize(text, detectPII(text))
      const reply = simulateReply(masked)
      for (const e of mapping) expect(reply).not.toContain(e.value)
    }
  })
  it('returns a non-empty string for a no-PII prompt', () => {
    expect(simulateReply('what is the capital of France?').length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 3: Run, verify fail** — `npm test` → FAIL

- [ ] **Step 4: Implement `mock-chatgpt.ts`**

```ts
const PH = /\[[A-Z_]+_\d+\]/g

export function simulateReply(maskedPrompt: string): string {
  const placeholders = [...maskedPrompt.matchAll(PH)].map((m) => m[0])
  if (placeholders.length === 0) {
    return "Here's a concise, helpful answer to your question. (This is a simulated ChatGPT response for the demo.)"
  }
  const wantsEmail = /\b(email|draft|write|message)\b/i.test(maskedPrompt)
  const list = placeholders.join(', ')
  if (wantsEmail) {
    const person = placeholders.find((p) => p.startsWith('[PERSON')) ?? 'there'
    return `Sure — here's a draft you can send:\n\nHi ${person},\n\nI'm following up regarding the details you shared (${list}). Please let me know if anything needs updating.\n\nBest regards`
  }
  return `Thanks for the details. Based on what you provided (${list}), here are the next steps you can take. (Simulated ChatGPT response — it only ever saw the anonymized placeholders above.)`
}
```

- [ ] **Step 5: Run, verify pass** — `npm test` → PASS

- [ ] **Step 6: Commit**

```bash
git add lib/pii/examples.ts lib/pii/mock-chatgpt.ts lib/pii/mock-chatgpt.test.ts
git commit -m "feat(pii): add example prompts and deterministic mock ChatGPT"
```

---

## Task 6: Presentational components

**Files:**
- Create: `components/pii-shield/highlighted-text.tsx`, `stage-card.tsx`, `mapping-panel.tsx`

No unit tests (presentational; verified in browser). Follow codebase conventions: `'use client'` where needed, Tailwind, `cn` from `@/lib/utils`, `Card` from `@/components/ui/card`, `Badge` from `@/components/ui/badge`, indigo/violet accent.

- [ ] **Step 1: `highlighted-text.tsx`** — props `{ text: string; matches?: PiiMatch[]; placeholders?: boolean }`. Renders text with each match span wrapped in a color-coded chip (color keyed by `PiiType` via a `TYPE_STYLES` map). When `placeholders` mode, it highlights `[TYPE_n]` tokens via regex instead of `matches`. Build an array of React segments by walking sorted spans and slicing the string between them — render plain string segments and `<span>` chips as React children (never inject raw HTML).

- [ ] **Step 2: `stage-card.tsx`** — props `{ index, title, subtitle, icon, tone, children, visible }`. Wraps `Card`; framer-motion `motion.div` fades/slides in when `visible`. `tone` selects accent (e.g. user=slate, shield=indigo, chatgpt=emerald, restored=violet).

- [ ] **Step 3: `mapping-panel.tsx`** — props `{ mapping: MappingEntry[] }`. A small table: placeholder (mono) | type `Badge` | original value (mono). Empty state: "No PII detected."

- [ ] **Step 4: Commit**

```bash
git add components/pii-shield/
git commit -m "feat(pii-shield): add presentational components"
```

---

## Task 7: Demo page

**Files:**
- Create: `app/pii-shield/page.tsx`

- [ ] **Step 1: Implement the page** (`'use client'`)

State: `input`, `result` (`null` or `{ matches, masked, mapping, raw, restored }`), `stage` (`'idle'|'sending'|'done'`), `showUnprotected`.

`runShield()`:
```ts
const matches = detectPII(input)
const { masked, mapping } = anonymize(input, matches)
setResult({ matches, masked, mapping, raw: '', restored: '' })
setStage('sending')
setTimeout(() => {
  const raw = simulateReply(masked)
  const restored = deanonymize(raw, mapping)
  setResult({ matches, masked, mapping, raw, restored })
  setStage('done')
}, 900) // cosmetic "sending to ChatGPT…" delay
```

Layout: header/intro; example-prompt buttons (`EXAMPLE_PROMPTS`) that set `input`; a `<textarea>` + "Send to ChatGPT" button (disabled when input is empty). Two-column: left = the 4 `StageCard`s, right = `MappingPanel` + a "X PII items detected" count badge + the `showUnprotected` toggle.

Stages:
1. **Your prompt** — `HighlightedText` with `matches`. If `matches.length===0`, badge "0 PII items detected — forwarded unchanged".
2. **🛡️ Anonymized (all ChatGPT sees)** — `HighlightedText placeholders` on `masked`. If `showUnprotected`, also render the original `input` under a red "❌ Without Shield — ChatGPT would receive this" label.
3. **ChatGPT response** — when `stage==='sending'` show a typing indicator; else `HighlightedText placeholders` on `raw`.
4. **Restored for you** — `HighlightedText` with `matches` applied to `restored` (or render restored with the original PII chips). Only when `stage==='done'`.

- [ ] **Step 2: Manual check** — `npm run dev`, visit `/pii-shield`, run each example + empty + a no-PII prompt; confirm staged reveal, mapping table, toggle.

- [ ] **Step 3: Commit**

```bash
git add app/pii-shield/page.tsx
git commit -m "feat(pii-shield): add staged-pipeline demo page"
```

---

## Task 8: Wire up navigation

**Files:**
- Modify: `components/app-header.tsx`

- [ ] **Step 1: Add `EyeOff` to the lucide import and a NAV entry**

In the import on line 5, add `EyeOff`. In the `NAV` array (line 8), append:
```ts
{ href: '/pii-shield', label: 'PII Shield Demo', Icon: EyeOff },
```

- [ ] **Step 2: Manual check** — tab appears, navigates, active-state styling works.

- [ ] **Step 3: Commit**

```bash
git add components/app-header.tsx
git commit -m "feat(pii-shield): add PII Shield Demo nav tab"
```

---

## Task 9: Final verification

- [ ] **Step 1: Tests** — `npm test` → all pass
- [ ] **Step 2: Lint** — `npm run lint` → clean (or only pre-existing warnings)
- [ ] **Step 3: Build** — `npm run build` → succeeds (catches type errors / Next route issues)
- [ ] **Step 4: Browser smoke** — dev server, exercise all 3 examples + empty + no-PII + toggle
- [ ] **Step 5: Final commit if any fixes**

---

## Notes / risks

- **Person/address detection is heuristic.** Acceptance is defined by the 3 `EXAMPLE_PROMPTS` only; "John Doe" and "Sarah Chen" must work (John & Sarah are in the dictionary). General accuracy is out of scope.
- If `npm run build` complains about `vitest.config.ts` or `*.test.ts` being picked up by Next/tsc, exclude `**/*.test.ts` in `tsconfig.json` (add a plan step only if it actually fails).
- All logic is synchronous and client-side; the only async is the cosmetic `setTimeout` for the sending animation.
