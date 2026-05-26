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
