'use client'
import { useEffect, useMemo, useState } from 'react'
import { Compass, RotateCcw, Search } from 'lucide-react'
import { useT } from '@/lib/i18n/provider'
import { CLOUD_AGENTS } from '@/lib/agent-discovery/data'
import type { Cloud } from '@/lib/agent-discovery/types'
import { buildControlRecords } from '@/lib/agent-control/derive'
import { buildFleetSummary } from '@/lib/agent-control/summary'
import {
  applyOverrides,
  clearOverrides,
  getOverrides,
  setControlState,
  stepLifecycle,
  toggleGuardrail,
} from '@/lib/agent-control/store'
import type {
  AgentControlRecord,
  ControlState,
  GuardrailKey,
  LifecycleStage,
  OverridesMap,
} from '@/lib/agent-control/types'
import { KpiStrip } from './kpi-strip'
import { FleetTable } from './fleet-table'
import { AgentDrawer, type Tab } from './agent-drawer'
import { ControlTour, type TourStep } from './control-tour'

// Ordered spotlight steps. `target` is the data-tour anchor to highlight; the
// drawer steps rely on the effect below to open the drawer and switch tabs.
const TOUR_STEPS: TourStep[] = [
  { id: 'kpi', target: 'kpi', side: 'bottom' },
  { id: 'filters', target: 'filters', side: 'bottom' },
  { id: 'fleet', target: 'fleet-row', side: 'bottom' },
  { id: 'rowActions', target: 'row-actions', side: 'bottom' },
  { id: 'openDrawer', target: 'fleet-row', side: 'bottom' },
  { id: 'runtime', target: 'drawer-body', side: 'left' },
  { id: 'governance', target: 'drawer-body', side: 'left' },
  { id: 'lifecycle', target: 'drawer-body', side: 'left' },
  { id: 'done', target: null, side: 'center' },
]
// Which steps require the drawer open, and on which tab.
const DRAWER_TAB_BY_STEP: Record<string, Tab> = {
  runtime: 'runtime',
  governance: 'governance',
  lifecycle: 'lifecycle',
}

// Baseline is derived once; operator actions live in the overrides map only.
const BASE_RECORDS = buildControlRecords(CLOUD_AGENTS)

const CLOUDS: Cloud[] = ['aws', 'azure', 'gcp']
const STATES: ControlState[] = ['active', 'paused', 'quarantined']
const STAGES: LifecycleStage[] = ['discovered', 'certified', 'production', 'deprecated', 'retired']

export function ControlTower() {
  const t = useT()
  const [overrides, setOverrides] = useState<OverridesMap>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawerTab, setDrawerTab] = useState<Tab>('runtime')
  const [toast, setToast] = useState<string | null>(null)
  const [tourStep, setTourStep] = useState<number | null>(null)

  // Filters
  const [query, setQuery] = useState('')
  const [cloud, setCloud] = useState<Cloud | 'all'>('all')
  const [state, setState] = useState<ControlState | 'all'>('all')
  const [stage, setStage] = useState<LifecycleStage | 'all'>('all')

  // Hydrate overrides from localStorage after mount (SSR-safe).
  useEffect(() => {
    setOverrides(getOverrides())
  }, [])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(id)
  }, [toast])

  const records = useMemo(() => applyOverrides(BASE_RECORDS, overrides), [overrides])
  const summary = useMemo(() => buildFleetSummary(records), [records])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return records.filter((r) => {
      if (cloud !== 'all' && r.cloud !== cloud) return false
      if (state !== 'all' && r.controlState !== state) return false
      if (stage !== 'all' && r.lifecycle.stage !== stage) return false
      if (q && !`${r.name} ${r.owner} ${r.purpose}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [records, query, cloud, state, stage])

  const selected = selectedId ? records.find((r) => r.id === selectedId) ?? null : null
  const tourAgentId = filtered[0]?.id ?? records[0]?.id ?? null

  // Drive the drawer (open + active tab) from the current tour step.
  useEffect(() => {
    if (tourStep === null) return
    const step = TOUR_STEPS[tourStep]
    const wantTab = DRAWER_TAB_BY_STEP[step.id]
    if (wantTab) {
      if (tourAgentId) setSelectedId(tourAgentId)
      setDrawerTab(wantTab)
    } else {
      setSelectedId(null)
    }
  }, [tourStep, tourAgentId])

  function openAgent(id: string) {
    setSelectedId(id)
    setDrawerTab('runtime')
  }

  function startTour() {
    setSelectedId(null)
    setTourStep(0)
  }
  function endTour() {
    setTourStep(null)
    setSelectedId(null)
  }
  function nextTour() {
    if (tourStep === null) return
    const next = tourStep + 1
    if (next >= TOUR_STEPS.length) {
      endTour()
    } else {
      setTourStep(next)
    }
  }
  function backTour() {
    setTourStep((s) => (s === null ? s : Math.max(0, s - 1)))
  }

  function handleSetState(record: AgentControlRecord, next: ControlState) {
    setOverrides(setControlState(record.id, next))
    const key =
      next === 'paused' ? 'paused'
        : next === 'quarantined' ? 'quarantined'
        : record.controlState === 'quarantined' ? 'released'
        : 'resumed'
    setToast(t(`agentControl.toast.${key}`, { name: record.name }))
  }

  function handleToggleGuardrail(record: AgentControlRecord, gkey: GuardrailKey, on: boolean) {
    setOverrides(toggleGuardrail(record.id, gkey, on))
    setToast(t(`agentControl.toast.${on ? 'guardrailOn' : 'guardrailOff'}`, { name: record.name }))
  }

  function handleStepLifecycle(record: AgentControlRecord, direction: 1 | -1) {
    const next = stepLifecycle(records, record.id, direction)
    setOverrides(next)
    const applied = applyOverrides(BASE_RECORDS, next).find((r) => r.id === record.id)
    if (applied) {
      setToast(
        t(`agentControl.toast.${direction === 1 ? 'advanced' : 'rolledBack'}`, {
          name: record.name,
          stage: t(`agentControl.lifecycle.${applied.lifecycle.stage}`),
        }),
      )
    }
  }

  function handleReset() {
    clearOverrides()
    setOverrides({})
    setToast(t('agentControl.toast.reset'))
  }

  const hasOverrides = Object.keys(overrides).length > 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{t('agentControl.title')}</h1>
          <p className="mt-0.5 max-w-3xl text-sm text-slate-500">{t('agentControl.subtitle')}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {hasOverrides && (
            <button
              onClick={handleReset}
              title={t('agentControl.toolbar.resetHint')}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t('agentControl.toolbar.reset')}
            </button>
          )}
          <button
            onClick={startTour}
            className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            <Compass className="h-3.5 w-3.5" />
            {t('agentControl.tour.launch')}
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <KpiStrip summary={summary} t={t} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('agentControl.toolbar.search')}
            className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
          />
        </div>
        <Filter value={cloud} onChange={(v) => setCloud(v as Cloud | 'all')} allLabel={t('agentControl.toolbar.allClouds')} options={CLOUDS.map((c) => ({ value: c, label: c.toUpperCase() }))} />
        <Filter value={state} onChange={(v) => setState(v as ControlState | 'all')} allLabel={t('agentControl.toolbar.allStates')} options={STATES.map((s) => ({ value: s, label: t(`agentControl.state.${s}`) }))} />
        <Filter value={stage} onChange={(v) => setStage(v as LifecycleStage | 'all')} allLabel={t('agentControl.toolbar.allStages')} options={STAGES.map((s) => ({ value: s, label: t(`agentControl.lifecycle.${s}`) }))} />
      </div>

      {/* Fleet table */}
      <FleetTable records={filtered} t={t} onView={openAgent} onSetState={handleSetState} />

      {/* Drawer */}
      {selected && (
        <AgentDrawer
          record={selected}
          t={t}
          tab={drawerTab}
          onTabChange={setDrawerTab}
          onClose={() => setSelectedId(null)}
          onSetState={handleSetState}
          onToggleGuardrail={handleToggleGuardrail}
          onStepLifecycle={handleStepLifecycle}
        />
      )}

      {/* Guided tour */}
      {tourStep !== null && (
        <ControlTour
          steps={TOUR_STEPS}
          index={tourStep}
          t={t}
          onBack={backTour}
          onNext={nextTour}
          onClose={endTour}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}

function Filter({
  value,
  onChange,
  allLabel,
  options,
}: {
  value: string
  onChange: (v: string) => void
  allLabel: string
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-slate-200 bg-white py-1.5 pl-2.5 pr-7 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
    >
      <option value="all">{allLabel}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
