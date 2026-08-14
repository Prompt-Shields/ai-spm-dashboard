'use client'
// Small presentational badges shared across the control tower. Colour language
// follows the app convention: green = good, amber = caution, red = bad,
// slate = neutral. Kept dependency-free (plain Tailwind spans).
import { cn } from '@/lib/utils'
import type { useT } from '@/lib/i18n/provider'
import type {
  Cloud,
} from '@/lib/agent-discovery/types'
import type {
  ControlState,
  HealthStatus,
  LifecycleStage,
} from '@/lib/agent-control/types'

type T = ReturnType<typeof useT>

const PILL = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium'
const DOT = 'h-1.5 w-1.5 rounded-full'

const CLOUD_STYLES: Record<Cloud, string> = {
  aws: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
  azure: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  gcp: 'bg-red-50 text-red-700 ring-1 ring-red-200',
}
const CLOUD_LABEL: Record<Cloud, string> = { aws: 'AWS', azure: 'Azure', gcp: 'GCP' }

export function CloudBadge({ cloud }: { cloud: Cloud }) {
  return <span className={cn(PILL, CLOUD_STYLES[cloud])}>{CLOUD_LABEL[cloud]}</span>
}

const STATE_STYLES: Record<ControlState, { pill: string; dot: string }> = {
  active: { pill: 'bg-green-50 text-green-700 ring-1 ring-green-200', dot: 'bg-green-500' },
  paused: { pill: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200', dot: 'bg-amber-500' },
  quarantined: { pill: 'bg-red-50 text-red-700 ring-1 ring-red-200', dot: 'bg-red-500' },
}

export function ControlStateBadge({ state, t }: { state: ControlState; t: T }) {
  const s = STATE_STYLES[state]
  return (
    <span className={cn(PILL, s.pill)}>
      <span className={cn(DOT, s.dot)} />
      {t(`agentControl.state.${state}`)}
    </span>
  )
}

const HEALTH_STYLES: Record<HealthStatus, string> = {
  healthy: 'bg-green-500',
  degraded: 'bg-amber-500',
  down: 'bg-red-500',
}

export function HealthBadge({ health, t }: { health: HealthStatus; t: T }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-700">
      <span className={cn(DOT, HEALTH_STYLES[health], health === 'down' && 'animate-pulse')} />
      {t(`agentControl.health.${health}`)}
    </span>
  )
}

const STAGE_STYLES: Record<LifecycleStage, string> = {
  discovered: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  certified: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  production: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  deprecated: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  retired: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200 line-through decoration-slate-300',
}

export function LifecycleBadge({ stage, t }: { stage: LifecycleStage; t: T }) {
  return <span className={cn(PILL, STAGE_STYLES[stage])}>{t(`agentControl.lifecycle.${stage}`)}</span>
}

/** Risk pill: colour ramps green→amber→red by score. */
export function RiskPill({ score }: { score: number }) {
  const tone =
    score >= 70 ? 'bg-red-50 text-red-700 ring-red-200'
      : score >= 45 ? 'bg-amber-50 text-amber-700 ring-amber-200'
      : 'bg-green-50 text-green-700 ring-green-200'
  return <span className={cn(PILL, 'ring-1 tabular-nums', tone)}>{score}</span>
}
