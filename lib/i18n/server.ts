import { cookies } from 'next/headers'
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from './config'
import { createT, type TFunc } from './translate'
import { en } from './locales/en'
import { nb } from './locales/nb'
import { fr } from './locales/fr'
import type { Messages } from './types'

const CATALOGS: Record<Locale, Messages> = { en, nb, fr }

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value
  return isLocale(value) ? value : DEFAULT_LOCALE
}

export function getMessages(locale: Locale): Messages {
  return CATALOGS[locale]
}

export async function getT(): Promise<TFunc> {
  const locale = await getLocale()
  return createT(CATALOGS[locale], en)
}
