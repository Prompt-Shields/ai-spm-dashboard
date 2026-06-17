'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Map,
  Radio,
  Radar,
  ClipboardList,
  Users,
  ShieldCheck,
  Shield,
  EyeOff,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n/provider'
import { useSidebar } from './sidebar-provider'

// Same items as the previous top-nav. `key` resolves to the nav.* translation.
const NAV: { href: string; key: string; Icon: LucideIcon }[] = [
  { href: '/adoption', key: 'adoption', Icon: TrendingUp },
  { href: '/', key: 'map', Icon: Map },
  { href: '/discover', key: 'discover', Icon: Radio },
  { href: '/agent-discovery', key: 'agentDiscovery', Icon: Radar },
  { href: '/register', key: 'register', Icon: ClipboardList },
  { href: '/owners', key: 'owners', Icon: Users },
  { href: '/comply', key: 'comply', Icon: ShieldCheck },
  { href: '/policy-enforcement', key: 'policies', Icon: Shield },
  { href: '/pii-shield', key: 'piiShield', Icon: EyeOff },
]

// Prefix match for active state so deep routes (e.g. /policy-enforcement/templates/foo)
// still highlight their parent nav item. Root '/' is exact-match only.
function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

export function AppSidebar() {
  const pathname = usePathname()
  const t = useT()
  const { collapsed, mobileOpen, setMobileOpen, toggleCollapsed } = useSidebar()

  return (
    <>
      {/* Mobile backdrop (visible only when drawer is open on <md). */}
      {mobileOpen && (
        <button
          aria-label={t('common.closeMenu')}
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-30 bg-slate-900/50"
        />
      )}

      <aside
        className={cn(
          'bg-white border-r border-slate-200 flex flex-col z-40',
          // Desktop: sticky column inside the flex layout, full viewport height.
          'sticky top-0 h-screen transition-[width] duration-200',
          collapsed ? 'w-14' : 'w-56',
          // Mobile (<md): fixed off-canvas, full-height drawer with slide animation.
          'max-md:fixed max-md:top-0 max-md:left-0 max-md:h-screen',
          'max-md:w-64 max-md:transition-transform max-md:duration-200',
          mobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
        )}
      >
        {/* Logo block */}
        <div className="flex items-center gap-2 h-14 px-3 border-b border-slate-100 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          {!collapsed && (
            <div className="min-w-0 hidden md:block">
              <div className="text-sm font-bold text-slate-900 truncate">{t('common.appName')}</div>
              <div className="text-[10px] text-slate-400 truncate leading-tight">{t('common.tagline')}</div>
            </div>
          )}
          {/* Mobile shows full label regardless of `collapsed` (drawer is wide). */}
          <div className="min-w-0 md:hidden">
            <div className="text-sm font-bold text-slate-900 truncate">{t('common.appName')}</div>
            <div className="text-[10px] text-slate-400 truncate leading-tight">{t('common.tagline')}</div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label={t('common.closeMenu')}
            className="md:hidden ml-auto p-1.5 rounded hover:bg-slate-100 text-slate-500"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav list */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, key, Icon }) => {
            const active = isActive(pathname, href)
            const label = t(`nav.${key}`)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                // Native tooltip when collapsed — simple, a11y-friendly, no extra deps.
                title={collapsed ? label : undefined}
                aria-label={collapsed ? label : undefined}
                className={cn(
                  'group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors',
                  // In collapsed (rail) mode, center the icon; otherwise normal alignment.
                  // Mobile always shows full layout (drawer is wide).
                  collapsed && 'md:justify-center md:px-0',
                  active
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                <Icon size={16} className="shrink-0" />
                {/* Label hides only on desktop when collapsed. */}
                <span className={cn('truncate', collapsed && 'md:hidden')}>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Collapse toggle — desktop only, bottom of sidebar. */}
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? t('common.expandSidebar') : t('common.collapseSidebar')}
          title={collapsed ? t('common.expandSidebar') : t('common.collapseSidebar')}
          className="hidden md:flex items-center justify-center h-10 border-t border-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>
    </>
  )
}
