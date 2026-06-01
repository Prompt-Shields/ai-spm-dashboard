'use client'
import { useState } from 'react'
import { USE_CASES, PERSONS, DISCOVERY_STATS } from '@/lib/aimaps-data'
import { UseCaseGraph } from '@/components/use-case-graph'
import { UseCaseDetailPanel } from '@/components/use-case-detail-panel'
import type { UseCase } from '@/lib/aimaps-types'
import { useT } from '@/lib/i18n/provider'

const DEPARTMENTS = ['all', ...Array.from(new Set(USE_CASES.map(uc => uc.department)))]
const SEVERITIES = ['all', 'critical', 'high', 'medium', 'low']

export default function MapPage() {
  const t = useT()
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null)
  const [filterDept, setFilterDept] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')

  const criticalCount = USE_CASES.flatMap(uc => uc.risks).filter(r => r.severity === 'critical').length
  const ownedCount = USE_CASES.filter(uc => uc.ownerId).length
  const euCoverage = Math.round(USE_CASES.filter(uc => uc.complianceStatus.euAiAct === 'covered').length / USE_CASES.length * 100)
  const owner = selectedUseCase ? PERSONS.find(p => p.id === selectedUseCase.ownerId) : undefined

  return (
    <div>
      {/* Page title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{t('map.title')}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t('map.subtitle', { count: DISCOVERY_STATS.useCasesFound })}
          </p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: t('map.kpi.useCases'), value: DISCOVERY_STATS.useCasesFound, color: 'text-indigo-600', sub: t('map.kpi.useCasesSub'), subColor: 'text-green-600' },
          { label: t('map.kpi.criticalRisks'), value: criticalCount, color: 'text-red-500', sub: t('map.kpi.criticalRisksSub', { count: 3 }), subColor: 'text-red-400' },
          { label: t('map.kpi.ownersAssigned'), value: ownedCount, color: 'text-sky-600', sub: t('map.kpi.ownersAssignedSub', { count: USE_CASES.length - ownedCount }), subColor: 'text-amber-500' },
          { label: t('map.kpi.euAiAct'), value: `${euCoverage}%`, color: 'text-green-600', sub: t('map.kpi.euAiActSub'), subColor: 'text-slate-400' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">{kpi.label}</div>
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className={`text-xs mt-0.5 ${kpi.subColor}`}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-medium text-slate-500">{t('map.filter')}</span>
        <select
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d === 'all' ? t('map.allDepartments') : d}</option>)}
        </select>
        <select
          value={filterSeverity}
          onChange={e => setFilterSeverity(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {SEVERITIES.map(s => <option key={s} value={s}>{s === 'all' ? t('map.allRiskLevels') : t(`map.severity.${s}`)}</option>)}
        </select>

        {/* Legend */}
        <div className="ml-auto flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5">
          {[
            { color: '#00d9ff', label: t('map.legend.useCase') },
            { color: '#f59e0b', label: t('map.legend.aiModel') },
            { color: '#10b981', label: t('map.legend.vendor')  },
            { color: '#7c3aed', label: t('map.legend.owner')   },
            { color: '#ef4444', label: t('map.legend.risk')    },
          ].map((item, i) => (
            <div key={item.label} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-slate-700 text-xs mx-1">·</span>}
              <div className="w-2 h-5 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-xs" style={{ color: '#9ca8bb' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Graph */}
      <div className="rounded-xl overflow-hidden border border-slate-700" style={{ height: 'calc(100vh - 320px)', minHeight: '420px' }}>
        <UseCaseGraph
          useCases={USE_CASES}
          persons={PERSONS}
          filterDept={filterDept}
          filterSeverity={filterSeverity}
          onSelectUseCase={setSelectedUseCase}
        />
      </div>

      {/* Detail panel */}
      {selectedUseCase && (
        <UseCaseDetailPanel
          useCase={selectedUseCase}
          owner={owner}
          onClose={() => setSelectedUseCase(null)}
        />
      )}
    </div>
  )
}
