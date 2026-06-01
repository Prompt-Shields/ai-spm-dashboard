'use client'
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { createT, type TFunc } from './translate'
import { en } from './locales/en'
import type { Locale } from './config'
import type { Messages } from './types'

const Ctx = createContext<{ locale: Locale; t: TFunc } | null>(null)

export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale
  messages: Messages
  children: ReactNode
}) {
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
