'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Map, Radio, ClipboardList, Users, ShieldCheck, AlertTriangle, Play, Shield, EyeOff } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useT } from '@/lib/i18n/provider'

const NAV: { href: string; key: string; Icon: LucideIcon }[] = [
  { href: '/', key: 'map', Icon: Map },
  { href: '/discover', key: 'discover', Icon: Radio },
  { href: '/register', key: 'register', Icon: ClipboardList },
  { href: '/owners', key: 'owners', Icon: Users },
  { href: '/comply', key: 'comply', Icon: ShieldCheck },
  { href: '/policy-enforcement', key: 'policies', Icon: Shield },
  { href: '/pii-shield', key: 'piiShield', Icon: EyeOff },
]

interface AppHeaderProps {
  onStartDemo?: () => void
}

export function AppHeader({ onStartDemo }: AppHeaderProps) {
  const pathname = usePathname()
  const t = useT()

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-screen-xl mx-auto px-6 flex items-center gap-6 h-14">
        {/* Logo */}
        <div className="flex items-center gap-2 pr-6 border-r border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900">{t('common.appName')}</span>
            <span className="hidden lg:inline text-xs text-slate-400 ml-1.5">{t('common.tagline')}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1 flex-1">
          {NAV.map(({ href, key, Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
                pathname === href
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              )}
            >
              <Icon size={14} />
              {t(`nav.${key}`)}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600">
            <AlertTriangle size={12} />
            {t('common.criticalRisks', { count: 12 })}
          </div>
          <button
            onClick={onStartDemo}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <Play size={11} />
            {t('common.startDemo')}
          </button>
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
            JK
          </div>
        </div>
      </div>
    </header>
  )
}
