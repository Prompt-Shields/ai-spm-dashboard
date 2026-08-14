'use client'
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import type { useT } from '@/lib/i18n/provider'
import { cn } from '@/lib/utils'
import {
  GUARDRAIL_KEYS,
  LIFECYCLE_ORDER,
} from '@/lib/agent-control/types'
import type {
  AgentControlRecord,
  ControlState,
  GuardrailKey,
} from '@/lib/agent-control/types'
import { formatCost, formatPct, lastActive } from '@/lib/agent-control/format'
import { CloudBadge, ControlStateBadge, HealthBadge, LifecycleBadge, RiskPill } from './badges'

type T = ReturnType<typeof useT>
export type Tab = 'runtime' | 'governance' | 'lifecycle'

interface Props {
  record: AgentControlRecord
  t: T
  tab: Tab
  onTabChange: (tab: Tab) => void
  onClose: () => void
  onSetState: (record: AgentControlRecord, state: ControlState) => void
  onToggleGuardrail: (record: AgentControlRecord, key: GuardrailKey, on: boolean) => void
  onStepLifecycle: (record: AgentControlRecord, direction: 1 | -1) => void
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900">{value}</div>
    </div>
  )
}

function RuntimeTab({ r, t }: { r: AgentControlRecord; t: T }) {
  const la = lastActive(r.runtime.lastActiveMinsAgo)
  const laLabel = t(`agentControl.drawer.runtime.${la.unit === 'mins' ? 'minsAgo' : la.unit === 'hours' ? 'hoursAgo' : 'daysAgo'}`, { count: la.count })
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <Metric label={t('agentControl.drawer.runtime.invocations')} value={r.runtime.invocations24h.toLocaleString()} />
      <Metric label={t('agentControl.drawer.runtime.success')} value={formatPct(r.runtime.successRate)} />
      <Metric label={t('agentControl.drawer.runtime.latency')} value={`${r.runtime.avgLatencyMs}ms`} />
      <Metric label={t('agentControl.drawer.runtime.errors')} value={formatPct(r.runtime.errorRate)} />
      <Metric label={t('agentControl.drawer.runtime.cost')} value={formatCost(r.runtime.costUsd30d)} />
      <Metric label={t('agentControl.drawer.runtime.automated')} value={r.runtime.actionsAutomated30d.toLocaleString()} />
      <div className="col-span-2 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5">
        <span className="text-[11px] uppercase tracking-wide text-slate-500">{t('agentControl.drawer.runtime.lastActive')}</span>
        <span className="text-sm text-slate-700">{laLabel}</span>
      </div>
    </div>
  )
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
        on ? 'bg-indigo-600' : 'bg-slate-300',
      )}
    >
      <span className={cn('inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform', on ? 'translate-x-4' : 'translate-x-1')} />
    </span>
  )
}

function GovernanceTab({
  r,
  t,
  onToggleGuardrail,
}: {
  r: AgentControlRecord
  t: T
  onToggleGuardrail: Props['onToggleGuardrail']
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
          <div className="text-[11px] uppercase tracking-wide text-slate-500">{t('agentControl.drawer.governance.riskScore')}</div>
          <div className="mt-1"><RiskPill score={r.governance.riskScore} /></div>
        </div>
        <Metric label={t('agentControl.drawer.governance.incidents')} value={`${r.governance.openIncidents}`} />
        <Metric label={t('agentControl.drawer.governance.violations')} value={`${r.governance.policyViolations30d}`} />
      </div>

      <div>
        <h4 className="text-sm font-semibold text-slate-900">{t('agentControl.drawer.governance.guardrailsHeading')}</h4>
        <p className="mt-0.5 text-xs text-slate-500">{t('agentControl.drawer.governance.guardrailsSub')}</p>
        <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {GUARDRAIL_KEYS.map((key: GuardrailKey) => {
            const on = r.governance.guardrails[key]
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onToggleGuardrail(r, key, !on)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-slate-50"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-800">{t(`agentControl.drawer.guardrails.${key}`)}</span>
                    <span className="block text-xs text-slate-500">{t(`agentControl.drawer.guardrails.${key}Desc`)}</span>
                  </span>
                  <Toggle on={on} />
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function LifecycleTab({ r, t, onStepLifecycle }: { r: AgentControlRecord; t: T; onStepLifecycle: Props['onStepLifecycle'] }) {
  const idx = LIFECYCLE_ORDER.indexOf(r.lifecycle.stage)
  const overdue = r.lifecycle.reviewDueInDays < 0
  const reviewLabel = overdue
    ? t('agentControl.drawer.lifecycle.overdueBy', { count: Math.abs(r.lifecycle.reviewDueInDays) })
    : t('agentControl.drawer.lifecycle.inDays', { count: r.lifecycle.reviewDueInDays })
  return (
    <div className="space-y-4">
      {/* Stage journey */}
      <div>
        <div className="text-[11px] uppercase tracking-wide text-slate-500">{t('agentControl.drawer.lifecycle.journey')}</div>
        <ol className="mt-2 flex items-center gap-1">
          {LIFECYCLE_ORDER.map((stage, i) => {
            const done = i < idx
            const current = i === idx
            return (
              <li key={stage} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold',
                    current ? 'bg-indigo-600 text-white ring-2 ring-indigo-200'
                      : done ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-400',
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={cn('text-center text-[10px] leading-tight', current ? 'font-medium text-slate-900' : 'text-slate-500')}>
                  {t(`agentControl.lifecycle.${stage}`)}
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5">
          <span className="text-[11px] uppercase tracking-wide text-slate-500">{t('agentControl.drawer.lifecycle.stage')}</span>
          <LifecycleBadge stage={r.lifecycle.stage} t={t} />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5">
          <span className="text-[11px] uppercase tracking-wide text-slate-500">{t('agentControl.drawer.lifecycle.certifiedBy')}</span>
          <span className="text-sm text-slate-700">{r.lifecycle.certifiedBy ?? t('agentControl.drawer.lifecycle.notCertified')}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5">
          <span className="text-[11px] uppercase tracking-wide text-slate-500">{t('agentControl.drawer.lifecycle.reviewDue')}</span>
          <span className={cn('text-sm font-medium', overdue ? 'text-red-600' : 'text-slate-700')}>{reviewLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={idx <= 0}
          onClick={() => onStepLifecycle(r, -1)}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('agentControl.actions.rollback')}
        </button>
        <button
          type="button"
          disabled={idx >= LIFECYCLE_ORDER.length - 1}
          onClick={() => onStepLifecycle(r, 1)}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t('agentControl.actions.advance')}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function AgentDrawer({ record: r, t, tab, onTabChange, onClose, onSetState, onToggleGuardrail, onStepLifecycle }: Props) {
  const tabs: Tab[] = ['runtime', 'governance', 'lifecycle']

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label={t('agentControl.drawer.close')} onClick={onClose} className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px]" />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-slate-50 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold text-slate-900">{r.name}</h3>
              <CloudBadge cloud={r.cloud} />
            </div>
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{r.purpose}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <ControlStateBadge state={r.controlState} t={t} />
              <HealthBadge health={r.runtime.health} t={t} />
            </div>
          </div>
          <button onClick={onClose} aria-label={t('agentControl.drawer.close')} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* State controls */}
        <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2">
          {r.controlState !== 'active' && (
            <button onClick={() => onSetState(r, 'active')} className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500">
              {r.controlState === 'quarantined' ? t('agentControl.actions.release') : t('agentControl.actions.resume')}
            </button>
          )}
          {r.controlState === 'active' && (
            <button onClick={() => onSetState(r, 'paused')} className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-400">
              {t('agentControl.actions.pause')}
            </button>
          )}
          {r.controlState !== 'quarantined' && (
            <button onClick={() => onSetState(r, 'quarantined')} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500">
              {t('agentControl.actions.quarantine')}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200 bg-white px-3" data-tour="drawer-tabs">
          {tabs.map((tb) => (
            <button
              key={tb}
              data-tour={`drawer-tab-${tb}`}
              onClick={() => onTabChange(tb)}
              className={cn(
                'border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                tab === tb ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700',
              )}
            >
              {t(`agentControl.drawer.tabs.${tb}`)}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4" data-tour="drawer-body">
          {tab === 'runtime' && <RuntimeTab r={r} t={t} />}
          {tab === 'governance' && <GovernanceTab r={r} t={t} onToggleGuardrail={onToggleGuardrail} />}
          {tab === 'lifecycle' && <LifecycleTab r={r} t={t} onStepLifecycle={onStepLifecycle} />}
        </div>

        {/* Meta footer */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-slate-200 bg-white px-4 py-3 text-xs">
          <Meta label={t('agentControl.drawer.owner')} value={r.owner === 'unknown' ? '—' : r.owner} />
          <Meta label={t('agentControl.drawer.registry')} value={r.registry} />
          <Meta label={t('agentControl.drawer.protocol')} value={r.protocol.toUpperCase()} />
          <Meta label={t('agentControl.drawer.region')} value={r.region} />
          <Meta label={t('agentControl.drawer.dataClass')} value={r.dataClassification} />
          <Meta label={t('agentControl.drawer.regScope')} value={r.regulatoryScope.join(', ') || '—'} />
        </div>
      </aside>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <span className="truncate font-medium text-slate-700">{value}</span>
    </div>
  )
}
