'use client'
import { usePathname } from 'next/navigation'
import { Play, Menu } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { LiveViolationPill } from '@/components/live-violation-pill'
import { useT } from '@/lib/i18n/provider'
import { useSidebar } from './sidebar-provider'

// Longest-prefix-first route → nav-key map for deriving the top-bar title.
// Mirrors AppSidebar's NAV. Routes outside this list render no title (the page's
// own <h1> is the source of truth there).
const ROUTE_TO_NAV_KEY: { prefix: string; key: string }[] = [
  { prefix: '/policy-enforcement', key: 'policies' },
  { prefix: '/pii-shield', key: 'piiShield' },
  { prefix: '/discover', key: 'discover' },
  { prefix: '/register', key: 'register' },
  { prefix: '/owners', key: 'owners' },
  { prefix: '/comply', key: 'comply' },
  { prefix: '/adoption', key: 'adoption' },
  { prefix: '/', key: 'map' },
]

function pageTitleKey(pathname: string): string | null {
  for (const { prefix, key } of ROUTE_TO_NAV_KEY) {
    if (prefix === '/') {
      if (pathname === '/') return key
      continue
    }
    if (pathname === prefix || pathname.startsWith(prefix + '/')) return key
  }
  return null
}

interface AppHeaderProps {
  onStartDemo?: () => void
}

export function AppHeader({ onStartDemo }: AppHeaderProps) {
  const t = useT()
  const pathname = usePathname()
  const { setMobileOpen } = useSidebar()
  const titleKey = pageTitleKey(pathname)
  const title = titleKey ? t(`nav.${titleKey}`) : ''

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="flex items-center gap-3 h-12 px-4 md:px-6">
        {/* Mobile hamburger — opens the sidebar drawer. */}
        <button
          onClick={() => setMobileOpen(true)}
          aria-label={t('common.openMenu')}
          className="md:hidden p-1.5 -ml-1 rounded hover:bg-slate-100 text-slate-600"
        >
          <Menu size={18} />
        </button>

        {/* Page title (derived from active route). Empty on non-nav routes. */}
        {title && <h1 className="text-sm font-semibold text-slate-800 truncate">{title}</h1>}

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-3">
          <LanguageSwitcher />
          <div className="hidden sm:flex">
            <LiveViolationPill />
          </div>
          <button
            onClick={onStartDemo}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <Play size={11} />
            <span className="hidden sm:inline">{t('common.startDemo')}</span>
          </button>
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
            JK
          </div>
        </div>
      </div>
    </header>
  )
}
