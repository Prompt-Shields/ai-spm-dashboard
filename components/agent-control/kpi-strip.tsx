'use client'
import { Activity, PauseCircle, ShieldAlert, HeartPulse, AlertTriangle, Gauge } from 'lucide-react'
import type { useT } from '@/lib/i18n/provider'
import type { FleetSummary } from '@/lib/agent-control/types'
import { formatCost, formatPct } from '@/lib/agent-control/format'
import { cn } from '@/lib/utils'

type T = ReturnType<typeof useT>

function Kpi({
  label,
  value,
  sub,
  tone = 'neutral',
  Icon,
}: {
  label: string
  value: string
  sub?: string
  tone?: 'neutral' | 'good' | 'warn' | 'bad'
  Icon: typeof Activity
}) {
  const toneRing = {
    neutral: 'text-slate-400',
    good: 'text-green-500',
    warn: 'text-amber-500',
    bad: 'text-red-500',
  }[tone]
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</span>
        <Icon className={cn('h-4 w-4', toneRing)} />
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
    </div>
  )
}

export function KpiStrip({ summary, t }: { summary: FleetSummary; t: T }) {
  const unhealthy = summary.down + summary.degraded
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" data-tour="kpi">
      <Kpi
        label={t('agentControl.kpi.active')}
        value={`${summary.active}`}
        sub={`${summary.total} ${t('agentControl.table.countLabel')}`}
        tone="good"
        Icon={Activity}
      />
      <Kpi
        label={t('agentControl.kpi.paused')}
        value={`${summary.paused}`}
        tone={summary.paused > 0 ? 'warn' : 'neutral'}
        Icon={PauseCircle}
      />
      <Kpi
        label={t('agentControl.kpi.quarantined')}
        value={`${summary.quarantined}`}
        tone={summary.quarantined > 0 ? 'bad' : 'neutral'}
        Icon={ShieldAlert}
      />
      <Kpi
        label={t('agentControl.kpi.unhealthy')}
        value={`${unhealthy}`}
        sub={`${summary.down} down · ${summary.degraded} degraded`}
        tone={summary.down > 0 ? 'bad' : unhealthy > 0 ? 'warn' : 'good'}
        Icon={HeartPulse}
      />
      <Kpi
        label={t('agentControl.kpi.incidents')}
        value={`${summary.openIncidents}`}
        sub={`${summary.reviewOverdue} ${t('agentControl.kpi.reviewOverdue').toLowerCase()}`}
        tone={summary.openIncidents > 0 ? 'bad' : 'good'}
        Icon={AlertTriangle}
      />
      <Kpi
        label={t('agentControl.kpi.successRate')}
        value={formatPct(summary.avgSuccessRate)}
        sub={`${formatCost(summary.totalCostUsd30d)} · ${formatPct(summary.guardrailCoverage)} ${t('agentControl.kpi.guardrails').toLowerCase()}`}
        tone={summary.avgSuccessRate >= 0.97 ? 'good' : summary.avgSuccessRate >= 0.9 ? 'warn' : 'bad'}
        Icon={Gauge}
      />
    </div>
  )
}
