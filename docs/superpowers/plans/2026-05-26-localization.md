# App-wide Localization (en/nb/fr) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Localize the whole dashboard into English / Norwegian Bokmål / French, auto-selected from the visitor's IP (with Accept-Language → en fallback), overridable via a header dropdown.

**Architecture:** A lightweight custom i18n layer in `lib/i18n/`: typed message catalogs (`en`/`nb`/`fr`), a pure `createT` translator, a pure `resolveLocale` resolver used by `middleware.ts` (reads the Vercel geo header, writes + forwards the `locale` cookie), a server helper (`getLocale`/`getT` via `next/headers`) and a client `LocaleProvider`/`useT`. Pages call `t('ns.key')`; seeded `lib/*-data.ts` strings move into a `data` namespace.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Vitest (already present), Tailwind, lucide-react.

**Reference:** spec at `docs/superpowers/specs/2026-05-26-localization-design.md`. The pure units (`createT`, `resolveLocale`, catalog completeness) are unit-tested; the Next-integration units (middleware/server/provider/layout) are verified in the browser + CI build (note: `next build` and the default vitest pool are unreliable in the dev sandbox — run tests with `pnpm exec vitest run --pool=forks`).

---

## File Structure

| File | Responsibility |
|------|----------------|
| `lib/i18n/config.ts` | `LOCALES`, `Locale`, `DEFAULT_LOCALE`, `LOCALE_COOKIE`, `COUNTRY_TO_LOCALE`, `LOCALE_LABELS` |
| `lib/i18n/translate.ts` | `createT(messages)` — dot-path resolve + `{var}` interpolation + en/key fallback |
| `lib/i18n/resolve.ts` | `resolveLocale({ cookie, country, acceptLanguage })` — pure precedence logic |
| `lib/i18n/locales/en.ts` `nb.ts` `fr.ts` | message catalogs (namespaced) |
| `lib/i18n/types.ts` | `Messages = typeof en`, `TFunc` |
| `lib/i18n/server.ts` | `getLocale()` / `getMessages()` / `getT()` (server, `next/headers`) |
| `lib/i18n/provider.tsx` | `LocaleProvider` / `useT` / `useLocale` (client context) |
| `lib/i18n/*.test.ts` | unit tests: translate, resolve, catalog-completeness |
| `middleware.ts` | geo/Accept-Language → `locale` cookie (set + forward on request) |
| `components/language-switcher.tsx` | header EN/NO/FR dropdown |
| `app/layout.tsx` | `getLocale` → `<html lang>` + `LocaleProvider` (modify) |
| `components/app-header.tsx` | mount switcher; nav labels via `t()` (modify) |
| `app/**/page.tsx`, components, `lib/*-data.ts` | strings → `t()` (modify, page-by-page) |
| `vitest.config.ts` | extend `include` to `lib/i18n/**` (modify) |

**Phasing:** Phase A (Tasks 1–8) builds the machinery with the `en` catalog only — the app works end-to-end in English. Phase B (Tasks 9+) refactors + translates page-by-page; `nb`/`fr` start as `en` copies and a completeness test guards them.

---

## Phase A — Machinery (English-only, fully working)

### Task 1: Config + translator (TDD)

**Files:** Create `lib/i18n/config.ts`, `lib/i18n/translate.ts`, `lib/i18n/translate.test.ts`; Modify `vitest.config.ts`.

- [ ] **Step 1: Extend vitest include**

In `vitest.config.ts` change `include` to `['lib/pii/**/*.test.ts', 'lib/i18n/**/*.test.ts']`.

- [ ] **Step 2: Write `config.ts`**

```ts
export const LOCALES = ['en', 'nb', 'fr'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_COOKIE = 'locale'
// IP country (ISO-3166-1 alpha-2) → locale. Unlisted countries fall back.
export const COUNTRY_TO_LOCALE: Record<string, Locale> = { NO: 'nb', FR: 'fr' }
export const LOCALE_LABELS: Record<Locale, string> = { en: 'English', nb: 'Norsk', fr: 'Français' }
export function isLocale(v: unknown): v is Locale {
  return typeof v === 'string' && (LOCALES as readonly string[]).includes(v)
}
```

- [ ] **Step 3: Write failing tests `translate.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { createT } from './translate'

const messages = { nav: { map: 'Map' }, common: { greet: 'Hi {name}' } }
const en = messages

describe('createT', () => {
  it('resolves a dot path', () => {
    expect(createT(messages, en)('nav.map')).toBe('Map')
  })
  it('interpolates {vars}', () => {
    expect(createT(messages, en)('common.greet', { name: 'Sara' })).toBe('Hi Sara')
  })
  it('falls back to en when the key is missing in the active locale', () => {
    const partial = { nav: {} }
    expect(createT(partial, en)('nav.map')).toBe('Map')
  })
  it('returns the key when missing everywhere', () => {
    expect(createT(messages, en)('nope.missing')).toBe('nope.missing')
  })
})
```

- [ ] **Step 4: Run, verify fail** — `pnpm exec vitest run --pool=forks` → FAIL

- [ ] **Step 5: Implement `translate.ts`**

```ts
type Dict = Record<string, unknown>

function lookup(obj: Dict, path: string): string | undefined {
  const val = path.split('.').reduce<unknown>((acc, k) => (acc && typeof acc === 'object' ? (acc as Dict)[k] : undefined), obj)
  return typeof val === 'string' ? val : undefined
}

function interpolate(s: string, vars?: Record<string, string | number>): string {
  if (!vars) return s
  return s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`))
}

export type TFunc = (path: string, vars?: Record<string, string | number>) => string

// `messages` is the active locale; `fallback` is always the en catalog.
export function createT(messages: Dict, fallback: Dict): TFunc {
  return (path, vars) => {
    const hit = lookup(messages, path) ?? lookup(fallback, path) ?? path
    return interpolate(hit, vars)
  }
}
```

- [ ] **Step 6: Run, verify pass** — PASS

- [ ] **Step 7: Commit** — `chore(i18n): add locale config + translator`

### Task 2: Locale resolver (TDD)

**Files:** Create `lib/i18n/resolve.ts`, `lib/i18n/resolve.test.ts`.

- [ ] **Step 1: Write failing tests**

```ts
import { describe, it, expect } from 'vitest'
import { resolveLocale } from './resolve'

describe('resolveLocale', () => {
  it('prefers a valid cookie above everything', () => {
    expect(resolveLocale({ cookie: 'fr', country: 'NO', acceptLanguage: 'en' })).toBe('fr')
  })
  it('maps country when no cookie', () => {
    expect(resolveLocale({ country: 'NO' })).toBe('nb')
    expect(resolveLocale({ country: 'FR' })).toBe('fr')
  })
  it('ignores unmapped country and uses Accept-Language', () => {
    expect(resolveLocale({ country: 'US', acceptLanguage: 'fr-FR,fr;q=0.9' })).toBe('fr')
  })
  it('defaults to en', () => {
    expect(resolveLocale({})).toBe('en')
    expect(resolveLocale({ cookie: 'xx', country: 'US' })).toBe('en')
  })
})
```

- [ ] **Step 2: Run, verify fail**

- [ ] **Step 3: Implement `resolve.ts`**

```ts
import { COUNTRY_TO_LOCALE, DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from './config'

interface Input { cookie?: string | null; country?: string | null; acceptLanguage?: string | null }

function fromAcceptLanguage(header?: string | null): Locale | undefined {
  if (!header) return undefined
  for (const part of header.split(',')) {
    const tag = part.split(';')[0].trim().toLowerCase()
    const base = tag.split('-')[0]
    const hit = LOCALES.find((l) => l === tag || l === base)
    if (hit) return hit
  }
  return undefined
}

export function resolveLocale({ cookie, country, acceptLanguage }: Input): Locale {
  if (isLocale(cookie)) return cookie
  if (country && COUNTRY_TO_LOCALE[country.toUpperCase()]) return COUNTRY_TO_LOCALE[country.toUpperCase()]
  return fromAcceptLanguage(acceptLanguage) ?? DEFAULT_LOCALE
}
```

- [ ] **Step 4: Run, verify pass**

- [ ] **Step 5: Commit** — `feat(i18n): add IP/Accept-Language locale resolver`

### Task 3: en catalog skeleton + types

**Files:** Create `lib/i18n/locales/en.ts`, `lib/i18n/types.ts`.

- [ ] **Step 1: Create `en.ts` with the chrome namespaces needed to wire everything** (page namespaces are filled in Phase B; start with `common` + `nav`):

```ts
export const en = {
  common: { appName: 'Atlas AI', tagline: 'Mapping AI use cases with risks', startDemo: 'Start Demo' },
  nav: { map: 'Map', discover: 'Discover', register: 'Register', owners: 'Owners', comply: 'Comply', policies: 'Policies', adoption: 'Adoption', piiShield: 'PII Shield Demo' },
} as const
```
(Note: include `adoption`/`piiShield` only if those tabs exist on this branch; this branch has `piiShield`. Adjust to the actual NAV.)

- [ ] **Step 2: Create `types.ts`**

```ts
import { en } from './locales/en'
export type Messages = typeof en
export type { TFunc } from './translate'
```

- [ ] **Step 3: Commit** — `feat(i18n): add en catalog skeleton + Messages type`

### Task 4: Server helper

**Files:** Create `lib/i18n/server.ts`.

- [ ] **Step 1: Implement** (verified via browser/CI, no unit test — depends on `next/headers`)

```ts
import { cookies } from 'next/headers'
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from './config'
import { createT, type TFunc } from './translate'
import { en } from './locales/en'
import { nb } from './locales/nb'
import { fr } from './locales/fr'
import type { Messages } from './types'

const CATALOGS: Record<Locale, Messages> = { en, nb, fr }

export async function getLocale(): Promise<Locale> {
  const c = (await cookies()).get(LOCALE_COOKIE)?.value
  return isLocale(c) ? c : DEFAULT_LOCALE
}
export function getMessages(locale: Locale): Messages { return CATALOGS[locale] }
export async function getT(): Promise<TFunc> {
  const locale = await getLocale()
  return createT(CATALOGS[locale], en)
}
```
(Depends on `nb.ts`/`fr.ts`; create them as `export const nb = en` / `export const fr = en` placeholders now, replaced in Task 8.)

- [ ] **Step 2: Commit** — `feat(i18n): add server-side getLocale/getMessages/getT`

### Task 5: Client provider

**Files:** Create `lib/i18n/provider.tsx`.

- [ ] **Step 1: Implement**

```tsx
'use client'
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { createT, type TFunc } from './translate'
import { en } from './locales/en'
import type { Locale } from './config'
import type { Messages } from './types'

const Ctx = createContext<{ locale: Locale; t: TFunc } | null>(null)

export function LocaleProvider({ locale, messages, children }: { locale: Locale; messages: Messages; children: ReactNode }) {
  const value = useMemo(() => ({ locale, t: createT(messages, en) }), [locale, messages])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export function useT(): TFunc {
  const v = useContext(Ctx)
  if (!v) throw new Error('useT must be used within LocaleProvider')
  return v.t
}
export function useLocale(): Locale {
  const v = useContext(Ctx)
  if (!v) throw new Error('useLocale must be used within LocaleProvider')
  return v.locale
}
```

- [ ] **Step 2: Commit** — `feat(i18n): add client LocaleProvider + useT/useLocale`

### Task 6: Middleware

**Files:** Create `middleware.ts` (repo root).

- [ ] **Step 1: Implement** — critically, set the cookie on BOTH the forwarded request and the response so `cookies()` sees it on the first request (see spec "Same-request visibility").

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { LOCALE_COOKIE } from '@/lib/i18n/config'
import { resolveLocale } from '@/lib/i18n/resolve'

export function middleware(request: NextRequest) {
  const locale = resolveLocale({
    cookie: request.cookies.get(LOCALE_COOKIE)?.value,
    country: request.headers.get('x-vercel-ip-country'),
    acceptLanguage: request.headers.get('accept-language'),
  })
  request.cookies.set(LOCALE_COOKIE, locale)
  const res = NextResponse.next({ request: { headers: request.headers } })
  res.cookies.set(LOCALE_COOKIE, locale, { maxAge: 31536000, sameSite: 'lax', path: '/' })
  return res
}

export const config = {
  // Run on pages, skip static assets and API routes.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
```

- [ ] **Step 2: Commit** — `feat(i18n): add middleware for IP-based locale detection`

### Task 7: Layout wiring + switcher

**Files:** Modify `app/layout.tsx`; Create `components/language-switcher.tsx`; Modify `components/app-header.tsx`.

- [ ] **Step 1: Wire `app/layout.tsx`** (make it async, set `lang`, wrap in provider)

```tsx
import type { Metadata } from 'next'
import './globals.css'
import { DemoWrapper } from '@/components/demo-wrapper'
import { getLocale, getMessages } from '@/lib/i18n/server'
import { LocaleProvider } from '@/lib/i18n/provider'

export const metadata: Metadata = { /* unchanged */ }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = getMessages(locale)
  return (
    <html lang={locale}>
      <body className="bg-slate-50 min-h-screen">
        <LocaleProvider locale={locale} messages={messages}>
          <DemoWrapper />
          <main className="max-w-screen-xl mx-auto px-6 py-6">{children}</main>
        </LocaleProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Create `components/language-switcher.tsx`**

```tsx
'use client'
import { useRouter } from 'next/navigation'
import { Globe } from 'lucide-react'
import { LOCALES, LOCALE_COOKIE, LOCALE_LABELS } from '@/lib/i18n/config'
import { useLocale } from '@/lib/i18n/provider'

export function LanguageSwitcher() {
  const router = useRouter()
  const locale = useLocale()
  return (
    <div className="flex items-center gap-1 text-slate-500">
      <Globe size={14} />
      <select
        value={locale}
        onChange={(e) => {
          document.cookie = `${LOCALE_COOKIE}=${e.target.value}; path=/; max-age=31536000; samesite=lax`
          router.refresh()
        }}
        className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
        aria-label="Language"
      >
        {LOCALES.map((l) => <option key={l} value={l}>{LOCALE_LABELS[l]}</option>)}
      </select>
    </div>
  )
}
```

- [ ] **Step 3: Mount switcher in `components/app-header.tsx`** — import `LanguageSwitcher`, render it in the right-side `<div>` (before the avatar). Leave nav labels for Task 9.

- [ ] **Step 4: Manual check** — `pnpm dev`; app renders in English; switcher changes `<html lang>`; setting cookie `locale=nb` then reload keeps nb (placeholder = still English until Phase B).

- [ ] **Step 5: Commit** — `feat(i18n): wire layout provider + add language switcher`

### Task 8: nb/fr catalogs + completeness test

**Files:** Replace `lib/i18n/locales/nb.ts`, `fr.ts`; Create `lib/i18n/completeness.test.ts`.

- [ ] **Step 1: Make `nb.ts`/`fr.ts` real copies of `en`** typed as `Messages` (start identical; translated in Phase B):

```ts
import type { Messages } from '../types'
import { en } from './en'
export const nb: Messages = { ...en } // deep-translated in Phase B
```
(Use a structured copy — duplicate the en object literal so values can diverge per locale; a shallow spread is fine to start since nested objects are replaced wholesale per namespace in Phase B.)

- [ ] **Step 2: Write the completeness test `completeness.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { en } from './locales/en'
import { nb } from './locales/nb'
import { fr } from './locales/fr'

function leafPaths(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? leafPaths(v as Record<string, unknown>, `${prefix}${k}.`) : [`${prefix}${k}`],
  )
}

describe('catalog completeness', () => {
  const enKeys = leafPaths(en).sort()
  it('nb has exactly the same keys as en', () => {
    expect(leafPaths(nb as Record<string, unknown>).sort()).toEqual(enKeys)
  })
  it('fr has exactly the same keys as en', () => {
    expect(leafPaths(fr as Record<string, unknown>).sort()).toEqual(enKeys)
  })
})
```

- [ ] **Step 3: Run, verify pass** (identical copies → green)

- [ ] **Step 4: Commit** — `feat(i18n): add nb/fr catalogs + completeness test`

---

## Phase B — Page-by-page extraction + translation

**Pattern per page/module (one namespace each — assign one parallel agent per namespace to avoid catalog merge conflicts; see superpowers:dispatching-parallel-agents):**

1. Read the page/component. List every user-facing string.
2. Add them to `en.ts` under the page's namespace (e.g. `comply.title`, `comply.frameworks.euAiAct`, …). Keep keys semantic.
3. Replace the hardcoded strings with `t('comply.title')` — `useT()` in client components, `await getT()` in server components.
4. Add the **same keys** to `nb.ts` and `fr.ts` with translated values (best-effort idiomatic nb/fr; flag long-form copy for native review).
5. Run `pnpm exec vitest run --pool=forks` — completeness test must stay green.
6. Commit per namespace: `feat(i18n): localize <page>`.

### Task 9: Localize app chrome
`components/app-header.tsx` (nav labels via `nav.*`, `common.startDemo`), and any shared components (`kpi-card`, `risk-chip`, detail panels). Namespace: `nav`, `common`.

### Task 10–N: Localize each page (one task/agent per page)
One per route, each owning its namespace:
- `/` Map (`app/page.tsx`) → `map.*`
- `/discover` → `discover.*`
- `/register` → `register.*`
- `/owners` → `owners.*`
- `/comply` → `comply.*`
- `/policy-enforcement` (+ `templates`, `policies/[id]`, `templates/[id]`) → `policyEnforcement.*` (server components — use `getT()`)
- `/ai-visibility` → `aiVisibility.*`
- `/model-risk` → `modelRisk.*`
- `/ai-governance` → `aiGovernance.*`
- `/integrations/ardoq` → `ardoq.*`
- `/pii-shield` → `piiShield.*`

### Task N+1: Localize seeded data
`grep` `lib/*-data.ts` (6 modules: `aimaps-data`, `insurance-data`, `model-risk-data`, `mock-data`, `model-risk-page-data`, `ai-visibility-data`). Move human-facing strings into `data.*` keyed by record id; add a locale-aware accessor or translate at the call site via `t('data.<id>.<field>')`. Keep ids/numbers/enums untouched.

---

## Final verification

- [ ] `pnpm exec vitest run --pool=forks` — translate, resolve, and **completeness** tests green (no missing/extra keys in nb/fr).
- [ ] `pnpm lint` — clean.
- [ ] `pnpm build` — in CI/locally (hangs in the dev sandbox; do not block on it here).
- [ ] Browser: switch EN/NO/FR via the dropdown on several pages; confirm `<html lang>` updates and server + client components both re-render; set `locale` cookie / fake `x-vercel-ip-country=NO` to confirm IP detection.
- [ ] Spot-check: no untranslated English leaking in nb/fr (completeness test covers keys, not values — eyeball the rendered pages).

## Notes / risks

- **Translation quality:** machine-assisted nb/fr; long-form risk descriptions flagged `// TODO(i18n): native review` so a reviewer can find them.
- **Bundle size:** all 3 catalogs ship to the client (deliberate, per spec). Revisit only if it becomes a problem.
- **Sandbox:** `next build`/`tsc` hang here; use `pnpm exec vitest run --pool=forks` for tests. (See project memory.)
