'use client'
import { Pause, Play, ShieldAlert, ShieldCheck } from 'lucide-react'
import type { useT } from '@/lib/i18n/provider'
import type { AgentControlRecord, ControlState } from '@/lib/agent-control/types'
import { formatCost, formatPct } from '@/lib/agent-control/format'
import { cn } from '@/lib/utils'
import {
  CloudBadge,
  ControlStateBadge,
  HealthBadge,
  LifecycleBadge,
  RiskPill,
} from './badges'

type T = ReturnType<typeof useT>

interface Props {
  records: AgentControlRecord[]
  t: T
  onView: (id: string) => void
  onSetState: (record: AgentControlRecord, state: ControlState) => void
}

function ActionButton({
  label,
  Icon,
  tone,
  onClick,
}: {
  label: string
  Icon: typeof Pause
  tone: 'neutral' | 'warn' | 'bad' | 'good'
  onClick: () => void
}) {
  const toneCls = {
    neutral: 'text-slate-600 hover:bg-slate-100',
    warn: 'text-amber-700 hover:bg-amber-50',
    bad: 'text-red-700 hover:bg-red-50',
    good: 'text-green-700 hover:bg-green-50',
  }[tone]
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      title={label}
      aria-label={label}
      className={cn('inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors', toneCls)}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden lg:inline">{label}</span>
    </button>
  )
}

function RowActions({ r, t, onSetState }: { r: AgentControlRecord; t: T; onSetState: Props['onSetState'] }) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      {r.controlState === 'active' && (
        <ActionButton label={t('agentControl.actions.pause')} Icon={Pause} tone="warn" onClick={() => onSetState(r, 'paused')} />
      )}
      {r.controlState === 'paused' && (
        <ActionButton label={t('agentControl.actions.resume')} Icon={Play} tone="good" onClick={() => onSetState(r, 'active')} />
      )}
      {r.controlState !== 'quarantined' ? (
        <ActionButton label={t('agentControl.actions.quarantine')} Icon={ShieldAlert} tone="bad" onClick={() => onSetState(r, 'quarantined')} />
      ) : (
        <ActionButton label={t('agentControl.actions.release')} Icon={ShieldCheck} tone="good" onClick={() => onSetState(r, 'active')} />
      )}
    </div>
  )
}

export function FleetTable({ records, t, onView, onSetState }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-slate-900">{t('agentControl.table.heading')}</h2>
        <span className="text-xs text-slate-500">
          {records.length} {t('agentControl.table.countLabel')}
        </span>
      </div>

      {records.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-slate-500">{t('agentControl.table.empty')}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2 font-medium">{t('agentControl.table.agent')}</th>
                <th className="px-3 py-2 font-medium">{t('agentControl.table.cloud')}</th>
                <th className="px-3 py-2 font-medium">{t('agentControl.table.state')}</th>
                <th className="px-3 py-2 font-medium">{t('agentControl.table.health')}</th>
                <th className="px-3 py-2 text-center font-medium">{t('agentControl.table.risk')}</th>
                <th className="px-3 py-2 text-right font-medium">{t('agentControl.table.success')}</th>
                <th className="px-3 py-2 text-right font-medium">{t('agentControl.table.cost')}</th>
                <th className="px-3 py-2 font-medium">{t('agentControl.table.lifecycle')}</th>
                <th className="px-4 py-2 text-right font-medium">{t('agentControl.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr
                  key={r.id}
                  data-tour={i === 0 ? 'fleet-row' : undefined}
                  onClick={() => onView(r.id)}
                  className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
                >
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-slate-900">{r.name}</div>
                    <div className="text-xs text-slate-500">
                      {r.owner === 'unknown' ? '—' : r.owner} · {r.registry}
                    </div>
                  </td>
                  <td className="px-3 py-2.5"><CloudBadge cloud={r.cloud} /></td>
                  <td className="px-3 py-2.5"><ControlStateBadge state={r.controlState} t={t} /></td>
                  <td className="px-3 py-2.5"><HealthBadge health={r.runtime.health} t={t} /></td>
                  <td className="px-3 py-2.5 text-center"><RiskPill score={r.governance.riskScore} /></td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{formatPct(r.runtime.successRate)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{formatCost(r.runtime.costUsd30d)}</td>
                  <td className="px-3 py-2.5"><LifecycleBadge stage={r.lifecycle.stage} t={t} /></td>
                  <td className="px-4 py-2.5" data-tour={i === 0 ? 'row-actions' : undefined}><RowActions r={r} t={t} onSetState={onSetState} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
