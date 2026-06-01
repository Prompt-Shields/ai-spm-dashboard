import type { TFunc } from '@/lib/i18n/translate'
import {
  getDailyBuckets,
  getTopPoliciesByHits,
  getTopAppsByHits,
  getRecentEvents,
} from '@/lib/policy-engine/server/store'
import { getTemplateById } from '@/lib/policy-templates/templates'
import { classOf } from '@/lib/policy-templates/types'
import { TimeSeriesChart } from './time-series-chart'

interface Props {
  t: TFunc
}

const SEVERITY_DOT = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-400',
} as const

const SEVERITY_LABEL = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
} as const

// Server component — pulls live store data, renders SVG + tables.
export function ViolationsPanel({ t }: Props) {
  const buckets = getDailyBuckets()
  const topPolicies = getTopPoliciesByHits(5)
  const topApps = getTopAppsByHits(5)
  const events = getRecentEvents(10)

  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
      <header className="px-4 py-3 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">{t('policyEnforcement.dashboard.violations.heading')}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{t('policyEnforcement.dashboard.violations.chart.title')}</p>
      </header>

      <div className="p-4">
        <TimeSeriesChart
          buckets={buckets}
          blocksLabel={t('policyEnforcement.dashboard.violations.chart.blocks')}
          wouldBlockLabel={t('policyEnforcement.dashboard.violations.chart.wouldBlock')}
          emptyLabel={t('policyEnforcement.dashboard.violations.chart.empty')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 pb-4">
        {/* Top policies */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            {t('policyEnforcement.dashboard.violations.topPolicies.heading')}
          </h3>
          {topPolicies.length === 0 ? (
            <Empty label={t('policyEnforcement.dashboard.violations.topPolicies.empty')} />
          ) : (
            <ul className="space-y-1.5">
              {topPolicies.map(({ instance, hits }) => {
                const cls = classOf(instance.enforcementMode)
                const template = getTemplateById(instance.templateId)
                const max = topPolicies[0].hits || 1
                const pct = (hits / max) * 100
                return (
                  <li key={instance.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-medium text-slate-800 truncate">{instance.name}</span>
                        <span
                          className={
                            cls === 'strict'
                              ? 'text-[9px] font-semibold tracking-wider px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-100'
                              : 'text-[9px] font-semibold tracking-wider px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200'
                          }
                        >
                          {cls === 'strict'
                            ? t('policyEnforcement.dashboard.panels.strict.modeBadge')
                            : t('policyEnforcement.dashboard.panels.guideline.modeBadge')}
                        </span>
                        {template?.owaspReference && (
                          <span className="text-[9px] font-mono text-slate-400">{template.owaspReference}</span>
                        )}
                      </div>
                      <div className="mt-1 h-1.5 bg-slate-100 rounded overflow-hidden">
                        <div
                          className={cls === 'strict' ? 'h-full bg-red-400' : 'h-full bg-slate-400'}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs font-mono text-slate-600 tabular-nums w-20 text-right">
                      {t('policyEnforcement.dashboard.violations.topPolicies.hitsLabel', { count: hits })}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Top apps */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            {t('policyEnforcement.dashboard.violations.topApps.heading')}
          </h3>
          {topApps.length === 0 ? (
            <Empty label={t('policyEnforcement.dashboard.violations.topApps.empty')} />
          ) : (
            <ul className="space-y-1.5">
              {topApps.map((a) => {
                const max = topApps[0].hits || 1
                const pct = (a.hits / max) * 100
                return (
                  <li key={a.applicationId} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-800 truncate">{a.applicationName}</div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded overflow-hidden">
                          <div className="h-full bg-indigo-400" style={{ width: `${pct}%` }} />
                        </div>
                        {a.topPolicyName && (
                          <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {t('policyEnforcement.dashboard.violations.topApps.topPolicyLabel', {
                              name: a.topPolicyName,
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs font-mono text-slate-600 tabular-nums w-20 text-right">
                      {t('policyEnforcement.dashboard.violations.topApps.hitsLabel', { count: a.hits })}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Recent events feed */}
      <div className="px-4 pb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          {t('policyEnforcement.dashboard.violations.recent.heading')}
        </h3>
        {events.length === 0 ? (
          <Empty label={t('policyEnforcement.dashboard.violations.recent.empty')} />
        ) : (
          <ul className="border border-slate-100 rounded-lg divide-y divide-slate-100">
            {events.map((e) => {
              const sev = (e.severity in SEVERITY_DOT ? e.severity : 'low') as keyof typeof SEVERITY_DOT
              const actionKey =
                e.actionTaken === 'block'
                  ? 'actionBlock'
                  : e.actionTaken === 'flag'
                    ? 'actionFlag'
                    : e.actionTaken === 'redact'
                      ? 'actionRedact'
                      : 'actionAllow'
              return (
                <li key={e.id} className="flex items-center gap-3 px-3 py-2 text-xs">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${SEVERITY_DOT[sev]}`}
                    title={SEVERITY_LABEL[sev]}
                  />
                  <span className="font-medium text-slate-700 truncate flex-1 min-w-0">{e.policyName}</span>
                  <span
                    className={
                      e.actionTaken === 'block'
                        ? 'text-red-600 font-medium shrink-0'
                        : e.actionTaken === 'flag' || e.actionTaken === 'redact'
                          ? 'text-amber-600 font-medium shrink-0'
                          : 'text-emerald-600 font-medium shrink-0'
                    }
                  >
                    {t(`policyEnforcement.dashboard.violations.recent.${actionKey}`)}
                  </span>
                  <span className="text-slate-500 truncate max-w-[160px] hidden sm:inline">{e.applicationName}</span>
                  <span className="text-slate-400 tabular-nums shrink-0">{relativeTime(e.timestamp, t)}</span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

function Empty({ label }: { label: string }) {
  return (
    <div className="h-20 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
      {label}
    </div>
  )
}

// Localized "Xm ago" / "Xh ago" / "Xd ago" / "just now".
function relativeTime(iso: string, t: TFunc): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffSec = Math.max(0, Math.round((now - then) / 1000))
  if (diffSec < 60) return t('policyEnforcement.dashboard.violations.recent.justNow')
  const min = Math.round(diffSec / 60)
  if (min < 60) return t('policyEnforcement.dashboard.violations.recent.minutesAgo', { count: min })
  const hr = Math.round(min / 60)
  if (hr < 48) return t('policyEnforcement.dashboard.violations.recent.hoursAgo', { count: hr })
  const day = Math.round(hr / 24)
  return t('policyEnforcement.dashboard.violations.recent.daysAgo', { count: day })
}
