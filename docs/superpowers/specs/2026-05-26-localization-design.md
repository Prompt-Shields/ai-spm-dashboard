# App-wide Localization (en / nb / fr) — Design

**Date:** 2026-05-26
**Status:** Approved (design phase)

## Goal

Localize the entire Atlas AI dashboard into **English (`en`)**, **Norwegian Bokmål (`nb`)**, and **French (`fr`)**. On first visit the language is chosen automatically from the visitor's location (IP geolocation), with a manual switcher to override. All user-facing text — UI copy **and** seeded data content — is translated.

## Scope decisions (confirmed with user)

- **Languages:** `en`, `nb` (Bokmål), `fr`. Default/fallback = `en`.
- **Detection:** IP/location-based via the hosting platform's geo header, with a fallback chain.
- **Translation scope:** the whole app, every page — **including** seeded data content in `lib/*-data.ts`.
- **Approach:** lightweight custom i18n (no `next-intl`, no locale-prefixed routes / route restructuring).
- **Switcher:** a manual EN/NO/FR dropdown in the header; choice persists and overrides IP detection.
- **Branching:** built on top of `feat/pii-shield-demo` so "the whole app" includes the new PII Shield Demo page.

## Non-goals

- No locale-prefixed URLs (`/en`, `/no`, `/fr`) — locale lives in a cookie, not the path.
- No translation-management/CMS integration; catalogs are in-repo TypeScript.
- No RTL languages, no pluralization libraries (en/nb/fr don't need complex plural rules for this content; simple `{count}` interpolation suffices).
- Not translating code identifiers, ids, severity enums, or numeric data — only human-facing text.

## Locale resolution

`middleware.ts` (repo root) runs on every request:

1. If a `locale` cookie already exists and is a supported locale → do nothing (the user's choice / prior detection wins).
2. Else read country from the platform geo header **`x-vercel-ip-country`** (Vercel sets this from the request IP). Map: `NO → nb`, `FR → fr`, anything else → continue.
3. Else fall back to the `Accept-Language` header (first supported language found).
4. Else default to `en`.
5. Write the resolved value to the `locale` cookie (1-year, `SameSite=Lax`, path `/`).

**Same-request visibility (critical).** A cookie set only on the *response* (`response.cookies.set(...)`) is NOT visible to `cookies()` during the *same* request's server render — server components read the incoming request's `Cookie` header. If the middleware only set the response cookie, a first-time visitor from Norway/France would render in `en` on first paint and only switch on the next navigation. To fix this, the middleware must ALSO inject the value into the forwarded request so the layout sees it immediately:

```ts
// in middleware, after resolving `locale`:
const requestHeaders = new Headers(request.headers)
request.cookies.set(LOCALE_COOKIE, locale)            // visible to cookies() this request
const res = NextResponse.next({ request: { headers: requestHeaders } })
res.cookies.set(LOCALE_COOKIE, locale, { maxAge: 31536000, sameSite: 'lax', path: '/' }) // persist for next requests
return res
```

The switcher path does not have this problem: it writes `document.cookie` first, then `router.refresh()`, so the refreshed server render already carries the cookie in its request headers.

Country→locale map, supported-locale list, default locale, and cookie name live in `lib/i18n/config.ts` so they're shared by the middleware, server helpers, and switcher.

**Local-dev note:** `x-vercel-ip-country` is absent locally, so detection falls through to `Accept-Language` then `en`. Geolocation behavior is verified in dev by manually setting the `locale` cookie (the switcher does this) or faking the header.

## Serving translations to server AND client components

The app mixes server components (5 pages — `policy-enforcement` and its sub-routes) and client components (9 pages — `/`, `discover`, `register`, `owners`, `comply`, `ardoq`, `ai-visibility`, `model-risk`, `ai-governance`, `pii-shield`). A React context only reaches client components, so we provide both access paths over one shared set of catalogs.

### Catalogs — `lib/i18n/locales/`

- `en.ts`, `nb.ts`, `fr.ts`, each exporting a deeply-nested object organized by **namespace**: `common`, `nav`, one namespace per page (`map`, `discover`, `register`, `owners`, `comply`, `policyEnforcement`, `aiVisibility`, `modelRisk`, `aiGovernance`, `ardoq`, `piiShield`, …), and a `data` namespace for seeded content.
- **`en` is the source of truth for the type.** `lib/i18n/types.ts` derives `type Messages = typeof enMessages`, and `nb`/`fr` are typed as `Messages` so the compiler flags shape drift. (Note: `next.config.mjs` sets `ignoreBuildErrors: true`, so the build won't enforce this — a runtime **catalog-completeness test** is the real guard; see Testing.)

### `lib/i18n/config.ts`
```ts
export const LOCALES = ['en', 'nb', 'fr'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_COOKIE = 'locale'
export const COUNTRY_TO_LOCALE: Record<string, Locale> = { NO: 'nb', FR: 'fr' }
export const LOCALE_LABELS: Record<Locale, string> = { en: 'English', nb: 'Norsk', fr: 'Français' }
```

### Server access — `lib/i18n/server.ts`
- `getLocale(): Promise<Locale>` — reads the `locale` cookie via `next/headers` `cookies()`, validates against `LOCALES`, falls back to `DEFAULT_LOCALE`.
- `getMessages(locale): Messages` — returns the catalog object via static import. **Trade-off (deliberate):** statically importing catalogs ships all three locales in the bundle; for seed-data-heavy catalogs this is extra client weight, accepted for simplicity per the "lightweight / in-repo" choice. If it matters later, the provider can be handed only the active locale's messages (and only the `data` slice a page needs) rather than the whole catalog.
- `getT(): Promise<TFunc>` — convenience returning a `t(path, vars?)` bound to the current locale. Server components: `const t = await getT()`.

### Client access — `lib/i18n/provider.tsx` (`'use client'`)
- `LocaleProvider({ locale, messages, children })` — holds `{ locale, messages }` in context.
- `useT(): TFunc` — returns `t(path, vars?)` from context.
- `useLocale(): Locale`.

### Translation function — `lib/i18n/translate.ts`
- `createT(messages): (path: string, vars?: Record<string, string|number>) => string`
- Resolves a dot path (`'nav.map'`) against the messages object; supports `{var}` interpolation; on a missing key returns the **en** value if present, else the key itself (and logs a dev warning). Pure + unit-tested.

### Root wiring — `app/layout.tsx`
Becomes/stays a server component: `const locale = await getLocale()`, set `<html lang={locale}>`, load `messages = getMessages(locale)`, wrap children (and `DemoWrapper`) in `<LocaleProvider locale={locale} messages={messages}>`.

## Seeded data translation

There are **6** data modules with human-facing strings — `lib/aimaps-data.ts`, `lib/insurance-data.ts`, `lib/model-risk-data.ts`, `lib/mock-data.ts`, `lib/model-risk-page-data.ts`, `lib/ai-visibility-data.ts` (the plan should `grep` `lib/*-data.ts` to confirm none are missed). For each:
- Move translatable strings into the catalogs under the `data` namespace, keyed by the record's stable id (e.g. `data.risks.<id>.name`, `data.risks.<id>.description`).
- Data modules keep structure, ids, and non-text fields; expose accessors like `getAimapsData(locale)` (or have components translate via `t('data.risks.' + id + '.name')`). The accessor pattern keeps call sites clean and the data shape stable.

## Switcher — `components/language-switcher.tsx` (`'use client'`)

EN / NO / FR dropdown rendered in `AppHeader` (right side, near the avatar). On change: write the `locale` cookie (`document.cookie`) and call `router.refresh()` so server components re-render in the new locale; the client provider also updates. Shows the current locale via `LOCALE_LABELS`.

## Data flow

```
request → middleware (geo header / Accept-Language → locale cookie)
        → app/layout.tsx (getLocale → getMessages → <html lang> + LocaleProvider)
            → server components: await getT() → t('ns.key')
            → client components: useT() → t('ns.key')
        → switcher: set cookie + router.refresh() → re-render in new locale
```

## Error handling

- Unknown/invalid `locale` cookie value → treated as absent → default `en`.
- Missing translation key → fall back to `en` value, else the key string (never throws, never blank).
- Missing geo header (local dev / non-Vercel host) → `Accept-Language` → `en`.

## Testing (Vitest)

Extend the existing config to also include `lib/i18n/**/*.test.ts` (currently scoped to `lib/pii`).

- **Catalog completeness (highest value):** `nb` and `fr` have *exactly* the same set of leaf key paths as `en` — no missing keys (untranslated) and no extra keys (stale). This is the primary correctness guard for a full-app translation, especially since `ignoreBuildErrors` disables compile-time shape checking.
- **Locale resolution mapping:** `NO→nb`, `FR→fr`, `US→en`, unknown→en; cookie-present short-circuits geo; `Accept-Language` fallback when no geo; default `en`.
- **`createT`:** resolves nested paths, interpolates `{vars}`, falls back to `en` then to the key for missing paths.

Browser verification: switch each language via the dropdown and confirm pages re-render; set the `locale` cookie / fake `x-vercel-ip-country` to confirm IP-detection path; confirm `<html lang>` updates.

## Implementation strategy (for the plan)

The machinery is small; the translation + refactor is large. Build in this order:
1. **Infrastructure first:** `config`, `translate` (+ tests), `server`, `provider`, `middleware` (+ tests), layout wiring, switcher — with `en` catalog only. App works in English end-to-end.
2. **Catalog scaffolding:** create `nb`/`fr` as copies of `en`, plus the catalog-completeness test (initially passing because they're identical).
3. **Page-by-page refactor + translate:** for each page/component/data module, extract hardcoded strings into the `en` catalog, replace with `t()` calls, then fill in `nb`/`fr`. Run **parallel agents per page/module** (see superpowers:dispatching-parallel-agents) to keep this tractable; each agent owns one namespace to avoid catalog merge conflicts.
4. **Verify:** completeness test green, build, full browser pass in all three languages.

## File summary

| File | Purpose | New/Edit |
|------|---------|----------|
| `middleware.ts` | IP/Accept-Language → locale cookie | New |
| `lib/i18n/config.ts` | locales, default, country map, cookie name, labels | New |
| `lib/i18n/types.ts` | `Locale`, `Messages` (from `en`), `TFunc` | New |
| `lib/i18n/translate.ts` | `createT` path-resolve + interpolation + fallback | New |
| `lib/i18n/server.ts` | `getLocale` / `getMessages` / `getT` | New |
| `lib/i18n/provider.tsx` | `LocaleProvider` / `useT` / `useLocale` | New |
| `lib/i18n/locales/en.ts` `nb.ts` `fr.ts` | message catalogs | New |
| `lib/i18n/*.test.ts` | completeness + resolution + translate tests | New |
| `components/language-switcher.tsx` | header dropdown | New |
| `app/layout.tsx` | locale resolution + provider + `<html lang>` | Edit |
| `components/app-header.tsx` | mount switcher; nav labels via `t()` | Edit |
| All `app/**/page.tsx` + components | strings → `t()` | Edit |
| `lib/*-data.ts` | seeded strings → catalog keys + locale accessor | Edit |
| `vitest.config.ts` | include `lib/i18n/**` | Edit |
