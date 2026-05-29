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
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {LOCALE_LABELS[l]}
          </option>
        ))}
      </select>
    </div>
  )
}
