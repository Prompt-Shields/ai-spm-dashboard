import Link from 'next/link'
import { ShieldCheck, Eye } from 'lucide-react'
import type { TFunc } from '@/lib/i18n/translate'
import type { PolicyInstance } from '@/lib/policy-templates/types'
import { classOf } from '@/lib/policy-templates/types'
import { getTemplateById, POLICY_CATEGORIES_META } from '@/lib/policy-templates/templates'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { PolicyActions } from './policy-actions'

interface PaneProps {
  variant: 'strict' | 'guideline'
  instances: PolicyInstance[]
  t: TFunc
}

const VARIANTS = {
  strict: {
    Icon: ShieldCheck,
    headerBg: 'bg-red-50/40',
    border: 'border-red-100',
    ribbon: 'bg-red-500',
    badgeCls: 'bg-red-100 text-red-700 border-red-200',
  },
  guideline: {
    Icon: Eye,
    headerBg: 'bg-slate-50/60',
    border: 'border-slate-200',
    ribbon: 'bg-slate-400',
    badgeCls: 'bg-slate-100 text-slate-700 border-slate-300',
  },
} as const

export function PolicyPane({ variant, instances, t }: PaneProps) {
  const v = VARIANTS[variant]
  const headingKey = `policyEnforcement.dashboard.panels.${variant}.heading`
  const subtitleKey = `policyEnforcement.dashboard.panels.${variant}.subtitle`
  const emptyKey = `policyEnforcement.dashboard.panels.${variant}.empty`
  const badgeKey = `policyEnforcement.dashboard.panels.${variant}.modeBadge`

  return (
    <section className={cn('bg-white border rounded-xl shadow-sm overflow-hidden', v.border)}>
      <header className={cn('px-4 py-3 border-b flex items-start gap-3', v.headerBg, v.border)}>
        <div className={cn('w-1 self-stretch rounded-full', v.ribbon)} aria-hidden />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <v.Icon size={16} className={variant === 'strict' ? 'text-red-700' : 'text-slate-600'} />
            <h2 className="text-sm font-semibold text-slate-900">{t(headingKey)}</h2>
            <span
              className={cn(
                'ml-1 text-[9px] font-semibold tracking-wider px-1.5 py-0.5 rounded border font-mono',
                v.badgeCls,
              )}
            >
              {t(badgeKey)}
            </span>
            <span className="ml-auto text-xs font-mono text-slate-400 tabular-nums">{instances.length}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{t(subtitleKey)}</p>
        </div>
      </header>

      {instances.length === 0 ? (
        <div className="p-6 text-xs text-slate-400 text-center">{t(emptyKey)}</div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {instances.map((instance) => (
            <PolicyRow key={instance.id} instance={instance} t={t} variant={variant} />
          ))}
        </ul>
      )}
    </section>
  )
}

interface RowProps {
  instance: PolicyInstance
  t: TFunc
  variant: 'strict' | 'guideline'
}
function PolicyRow({ instance, t, variant }: RowProps) {
  const cls = classOf(instance.enforcementMode) // recompute (may differ if data mutated)
  const template = getTemplateById(instance.templateId)
  const categoryMeta = template ? POLICY_CATEGORIES_META[template.category] : null
  const stats = instance.stats

  const hits = variant === 'strict' ? stats?.blockCount30d ?? 0 : stats?.flagCount30d ?? 0
  const hitsLabel = t(`policyEnforcement.dashboard.panels.${variant}.blocksHeader`)
  const fpRate = stats?.falsePositiveRate ?? 0
  const appsCount = instance.appliesTo.applicationIds.length || '∞'
  const lastHit = stats?.lastTriggeredAt
    ? new Date(stats.lastTriggeredAt).toLocaleDateString()
    : t('policyEnforcement.dashboard.panels.row.neverTriggered')

  return (
    <li
      className={cn(
        'flex items-stretch gap-3 hover:bg-slate-50/60 transition-colors',
        instance.status === 'paused' && 'opacity-60',
      )}
    >
      <Link
        href={`/policy-enforcement/policies/${instance.id}`}
        className="flex-1 min-w-0 flex flex-col gap-1 px-4 py-3"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-slate-900">{instance.name}</h3>
          {instance.status === 'paused' && (
            <Badge variant="outline" className="text-[9px] font-mono tracking-wider">
              PAUSED
            </Badge>
          )}
          {categoryMeta && (
            <Badge variant="outline" className="text-[9px]">
              {categoryMeta.label}
            </Badge>
          )}
          {template?.owaspReference && (
            <Badge variant="outline" className="font-mono text-[9px]">
              {template.owaspReference}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[11px] text-slate-500">
          <span>
            <span className="text-slate-400">{hitsLabel}: </span>
            <span className="font-mono font-medium text-slate-700 tabular-nums">{hits.toLocaleString()}</span>
          </span>
          <span>
            <span className="text-slate-400">
              {t('policyEnforcement.dashboard.panels.row.appsLabel', { value: String(appsCount) })}
            </span>
          </span>
          {variant === 'strict' && (
            <span>
              <span className="text-slate-400">
                {t('policyEnforcement.dashboard.panels.row.fpLabel', {
                  rate: (fpRate * 100).toFixed(1),
                })}
              </span>
            </span>
          )}
          <span className="text-slate-400">
            {t('policyEnforcement.dashboard.panels.row.lastHitLabel', { when: lastHit })}
          </span>
        </div>
      </Link>
      <div className="flex items-center px-3">
        <PolicyActions id={instance.id} cls={cls} status={instance.status} compact />
      </div>
    </li>
  )
}
