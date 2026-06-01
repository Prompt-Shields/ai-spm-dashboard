'use client'
import { useState, useTransition } from 'react'
import { Pause, Play, ArrowUp, ArrowDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useT } from '@/lib/i18n/provider'
import { promotePolicy, demotePolicy, pausePolicy, resumePolicy } from '../actions'

type ActionType = 'promote' | 'demote' | 'pause' | 'resume'

interface Props {
  id: string
  cls: 'strict' | 'guideline'
  /** From PolicyInstance.status. */
  status: string
  /** Hide labels (icon-only) to keep dense rows tidy. */
  compact?: boolean
}

const ICONS: Record<ActionType, LucideIcon> = {
  promote: ArrowUp,
  demote: ArrowDown,
  pause: Pause,
  resume: Play,
}

const CSS: Record<ActionType, string> = {
  promote: 'text-emerald-700 hover:bg-emerald-50 border-emerald-200',
  demote: 'text-orange-700 hover:bg-orange-50 border-orange-200',
  pause: 'text-slate-600 hover:bg-slate-100 border-slate-200',
  resume: 'text-emerald-700 hover:bg-emerald-50 border-emerald-200',
}

export function PolicyActions({ id, cls, status, compact = false }: Props) {
  const t = useT()
  const [pending, setPending] = useState<ActionType | null>(null)
  const [working, startTransition] = useTransition()

  const actions: ActionType[] = []
  if (cls === 'guideline' && status === 'active') actions.push('promote')
  if (cls === 'strict' && status === 'active') actions.push('demote')
  if (status === 'active') actions.push('pause')
  if (status === 'paused') actions.push('resume')

  if (actions.length === 0) return null

  function run(a: ActionType) {
    startTransition(async () => {
      if (a === 'promote') await promotePolicy(id)
      else if (a === 'demote') await demotePolicy(id)
      else if (a === 'pause') await pausePolicy(id)
      else if (a === 'resume') await resumePolicy(id)
      setPending(null)
    })
  }

  if (pending) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] whitespace-nowrap">
        <span className="text-slate-700 font-medium">
          {t(`policyEnforcement.dashboard.actions.${pending}Title`)}
        </span>
        <button
          onClick={() => run(pending)}
          disabled={working}
          className="px-2 py-0.5 rounded bg-slate-900 text-white font-medium hover:bg-slate-700 disabled:opacity-60"
        >
          {working
            ? t('policyEnforcement.dashboard.actions.working')
            : t('policyEnforcement.dashboard.actions.confirm')}
        </button>
        <button
          onClick={() => setPending(null)}
          disabled={working}
          className="px-2 py-0.5 rounded text-slate-600 hover:bg-slate-100"
        >
          {t('policyEnforcement.dashboard.actions.cancel')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {actions.map((a) => {
        const Icon = ICONS[a]
        const label = t(`policyEnforcement.dashboard.actions.${a}`)
        return (
          <button
            key={a}
            onClick={() => setPending(a)}
            title={label}
            aria-label={label}
            className={`flex items-center gap-1 px-2 py-1 rounded border text-[11px] font-medium ${CSS[a]} transition-colors`}
          >
            <Icon size={11} />
            {!compact && <span className="hidden md:inline">{label}</span>}
          </button>
        )
      })}
    </div>
  )
}
