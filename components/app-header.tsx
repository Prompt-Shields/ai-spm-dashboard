'use client'
import { Play, Menu } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { LiveViolationPill } from '@/components/live-violation-pill'
import { useT } from '@/lib/i18n/provider'
import { useSidebar } from './sidebar-provider'

interface AppHeaderProps {
  onStartDemo?: () => void
}

export function AppHeader({ onStartDemo }: AppHeaderProps) {
  const t = useT()
  const { setMobileOpen } = useSidebar()

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
