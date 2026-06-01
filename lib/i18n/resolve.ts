import { COUNTRY_TO_LOCALE, DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from './config'

interface Input {
  cookie?: string | null
  country?: string | null
  acceptLanguage?: string | null
}

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
