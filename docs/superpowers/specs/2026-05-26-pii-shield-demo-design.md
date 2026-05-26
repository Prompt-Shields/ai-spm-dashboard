# PII Shield Demo — Design

**Date:** 2026-05-26
**Status:** Approved (design phase)

## Goal

Add a new top-nav tab, **"PII Shield Demo"** (route `/pii-shield`), that demonstrates how a user can send any prompt — including one containing PII — to ChatGPT, and the Shield:

1. Detects PII in the prompt locally.
2. Replaces each PII value with a typed placeholder before "sending."
3. Shows that the (simulated) ChatGPT only ever sees placeholders.
4. Restores the real PII in the response shown back to the user.

This proves the value proposition: **OpenAI never receives sensitive data, yet the user gets a useful, personalized answer.**

## Scope decisions (confirmed with user)

- **ChatGPT call:** Simulated / scripted, fully client-side. No OpenAI API, no API key, no network. Deterministic so it always works in a live demo.
- **Flow:** Full round-trip (detect → anonymize → send → reply with placeholders → restore PII in the answer).
- **Detection:** Local pattern rules (regex + small dictionaries). No LLM, no network.
- **Layout:** Staged pipeline (You → Shield → ChatGPT → You) with a mapping side panel.
- **Contrast toggle:** Included — a small "what ChatGPT would've seen unprotected" toggle.
- **Tests:** Add Vitest scoped to `lib/pii` only (detection + round-trip restore).

## Non-goals

- No real OpenAI integration.
- No persistence / backend storage of prompts.
- No auth changes.
- Not aiming for production-grade NER; person/address detection is explicitly heuristic and labeled as best-effort.

## Architecture

All runtime logic is client-side. Pure, framework-free logic lives in `lib/pii/` so it is independently unit-testable. The page composes those functions and renders the staged UI.

### `lib/pii/` (pure logic — no React, no network)

**`types.ts`**
```ts
type PiiType = 'EMAIL' | 'PHONE' | 'SSN' | 'CREDIT_CARD' | 'IP' | 'API_KEY' | 'PERSON' | 'ADDRESS'

interface PiiMatch {
  type: PiiType
  value: string   // the matched substring
  start: number   // index into the original text
  end: number     // exclusive
}

interface MappingEntry {
  placeholder: string  // e.g. "[EMAIL_1]"
  value: string        // original PII value
  type: PiiType
}

interface AnonymizeResult {
  masked: string             // text with PII replaced by placeholders
  mapping: MappingEntry[]    // placeholder <-> value, in detection order
}
```

**`detector.ts` — `detectPII(text: string): PiiMatch[]`**
- One matcher per type. Structured types are reliable regex:
  - `EMAIL`: standard email regex.
  - `PHONE`: international-ish phone regex (allows `+`, spaces, dashes, parens; min digit count to avoid false positives).
  - `SSN`: `\b\d{3}-\d{2}-\d{4}\b`.
  - `CREDIT_CARD`: 13–16 digit sequences in groups of 4 (spaces/dashes), validated with the Luhn checksum to cut false positives.
  - `IP`: IPv4 dotted-quad with octet range check.
  - `API_KEY`: provider-style secrets, e.g. `sk-`/`sk-proj-` followed by a long token (on-theme for an AI tool).
- Heuristic types (clearly documented as best-effort):
  - `PERSON`: a small common-first-name dictionary, plus cue patterns ("my name is X", "I'm X Y", greetings like "Hi Sarah Chen,"), matching the name and an optional Title-Case surname.
  - `ADDRESS`: number + street-name + street-suffix (`St|Street|Ave|Avenue|Rd|Road|Blvd|Lane|Ln|Dr|Drive|...`).
- Returns matches sorted by `start`. **Overlap resolution:** if two matches overlap, keep the earlier-starting one; on equal start, keep the longer. (Prevents e.g. a phone fragment inside a credit card from double-matching.)

**`anonymizer.ts`**
- `anonymize(text: string, matches: PiiMatch[]): AnonymizeResult`
  - Assigns a stable placeholder per **unique (type, value)** pair: the first distinct email is `[EMAIL_1]`, the next distinct email `[EMAIL_2]`; the same value reused later maps to the same placeholder.
  - Builds `masked` by replacing spans from last to first (so indices stay valid).
- `deanonymize(text: string, mapping: MappingEntry[]): string`
  - Replaces every occurrence of each placeholder token with its original value. Replace longer placeholders before shorter ones to avoid `[EMAIL_1]` partially matching `[EMAIL_10]`.

**`mock-chatgpt.ts` — `simulateReply(maskedPrompt: string): string`**
- Deterministic. Produces a helpful-sounding response that **echoes the placeholder tokens** found in the masked prompt, so that de-anonymization visibly restores real values.
- A couple of light intent templates (e.g. masked prompt contains "email"/"draft" → an email-draft template; otherwise a generic assistant paragraph). Each template references the placeholders present, e.g. "Here's a draft you can send to `[PERSON_1]` at `[EMAIL_1]`: …".
- If the masked prompt contains no placeholders, returns a plain helpful answer (no tokens to restore).

**`examples.ts` — `EXAMPLE_PROMPTS: { label: string; text: string }[]`**
- 3–4 one-click sample prompts pre-loaded with PII across several types, e.g.:
  - "Draft a payment-reminder email to Sarah Chen at sarah.chen@acme.com — her invoice tied to card 4111 1111 1111 1111 is overdue."
  - A support-ticket example with phone + SSN.
  - An example with an API key (`sk-...`) and an IP address.

### UI

**`app/pii-shield/page.tsx`** (`'use client'`) — orchestrates state and the staged reveal.

State: `inputText`, `stage` (`idle | detected | sending | done`), the `PiiMatch[]`, the `AnonymizeResult`, the raw simulated reply, the restored reply, and `showUnprotected` (toggle).

Flow on **Send**:
1. `matches = detectPII(inputText)`.
2. `{ masked, mapping } = anonymize(inputText, matches)` → reveal stages ① and ②.
3. Set stage `sending` (brief delay + typing indicator on the ChatGPT card to feel real).
4. `raw = simulateReply(masked)` → reveal stage ③.
5. `restored = deanonymize(raw, mapping)` → reveal stage ④.

**`components/pii-shield/` presentational pieces:**
- `highlighted-text.tsx` — renders text with PII spans (or placeholder tokens) wrapped in color-coded `<mark>`-style badges keyed by `PiiType`. Used in stages ①, ②, ④.
- `stage-card.tsx` — a titled card (uses `components/ui/card`) for each pipeline stage, with an icon and subtitle. framer-motion fade/slide-in on reveal.
- `mapping-panel.tsx` — table of `value → type → placeholder` (uses `components/ui/badge` for type chips).

UI conventions: follow the existing codebase — plain Tailwind-styled `<textarea>`/`<button>` (the repo's `components/ui` only includes badge, card, progress, select, tabs; pages otherwise use plain elements), `cn` from `lib/utils`, `lucide-react` icons, indigo/violet accent palette consistent with `app-header.tsx`. framer-motion is already a dependency (currently unused) — used here for the staged reveal.

**Contrast toggle:** when `showUnprotected` is on, stage ② additionally shows the original prompt with PII exposed, labeled "❌ Without Shield — this is what ChatGPT would receive," next to the shielded version.

**No-PII path:** if `matches` is empty, stages still render but show "0 PII items detected — prompt forwarded unchanged," and the reply needs no restoration.

### Navigation

Add one entry to the `NAV` array in `components/app-header.tsx`:
```ts
{ href: '/pii-shield', label: 'PII Shield Demo', Icon: EyeOff }
```
(`EyeOff` imported from `lucide-react`; `Shield`/`ShieldCheck` are already used by Policies/Comply, so a distinct icon is used.)

## Data flow diagram

```
inputText
  → detectPII ─────────────► PiiMatch[]            (Stage ①: original, PII highlighted)
  → anonymize ─────────────► { masked, mapping }   (Stage ②: masked, placeholders highlighted)
  → simulateReply(masked) ─► raw reply             (Stage ③: ChatGPT sees only placeholders)
  → deanonymize(raw, map) ─► restored reply        (Stage ④: PII restored for the user)
```

## Error handling

- Send disabled when input is empty/whitespace.
- Pure functions are total (never throw on normal string input); empty/no-match inputs handled by the no-PII path.
- No network/async failure modes (everything is local + synchronous, with only a cosmetic delay for the "sending" animation).

## Testing

Add **Vitest** as a dev dependency with an `npm test` script, scoped to `lib/pii`:
- `detector.test.ts`: each PII type detected in representative strings; Luhn rejects invalid card numbers; no false positives on clean text; overlap resolution.
- `anonymizer.test.ts`: **round-trip property** — `deanonymize(anonymize(text, detectPII(text)).masked, mapping) === text` for the example prompts; repeated values reuse one placeholder; `[EMAIL_10]` not corrupted by `[EMAIL_1]` restore.
- `mock-chatgpt.test.ts`: reply only ever contains placeholder tokens (never raw PII) given a masked prompt.

Browser verification: run `npm run dev`, exercise each example prompt and the empty/no-PII path, confirm the staged reveal and the contrast toggle.

## File summary

| File | Purpose | New/Edit |
|------|---------|----------|
| `lib/pii/types.ts` | Shared types | New |
| `lib/pii/detector.ts` | `detectPII` | New |
| `lib/pii/anonymizer.ts` | `anonymize` / `deanonymize` | New |
| `lib/pii/mock-chatgpt.ts` | `simulateReply` | New |
| `lib/pii/examples.ts` | Sample prompts | New |
| `lib/pii/*.test.ts` | Vitest unit tests | New |
| `app/pii-shield/page.tsx` | Demo page (client) | New |
| `components/pii-shield/highlighted-text.tsx` | PII/placeholder highlighting | New |
| `components/pii-shield/stage-card.tsx` | Pipeline stage card | New |
| `components/pii-shield/mapping-panel.tsx` | value→placeholder table | New |
| `components/app-header.tsx` | Add nav entry | Edit |
| `package.json` | Add Vitest + `test` script | Edit |
