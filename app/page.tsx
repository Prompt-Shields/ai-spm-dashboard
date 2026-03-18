'use client'
import { useState } from 'react'
import { USE_CASES, PERSONS, DISCOVERY_STATS } from '@/lib/aimaps-data'
import { UseCaseGraph } from '@/components/use-case-graph'
import { UseCaseDetailPanel } from '@/components/use-case-detail-panel'
import type { UseCase } from '@/lib/aimaps-types'

const DEPARTMENTS = ['all', ...Array.from(new Set(USE_CASES.map(uc => uc.department)))]
const SEVERITIES = ['all', 'critical', 'high', 'medium', 'low']

export default function MapPage() {
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
          <h1 className="text-xl font-bold text-slate-900">AI Use Case Map</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {DISCOVERY_STATS.useCasesFound} use cases discovered across 8 departments · Last updated by AI Agent
          </p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Use Cases', value: DISCOVERY_STATS.useCasesFound, color: 'text-indigo-600', sub: '+8 this week', subColor: 'text-green-600' },
          { label: 'Critical Risks', value: criticalCount, color: 'text-red-500', sub: '3 unowned', subColor: 'text-red-400' },
          { label: 'Owners Assigned', value: ownedCount, color: 'text-sky-600', sub: `${USE_CASES.length - ownedCount} pending`, subColor: 'text-amber-500' },
          { label: 'EU AI Act', value: `${euCoverage}%`, color: 'text-green-600', sub: 'coverage', subColor: 'text-slate-400' },
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
        <span className="text-xs font-medium text-slate-500">Filter:</span>
        <select
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d === 'all' ? 'All Departments' : d}</option>)}
        </select>
        <select
          value={filterSeverity}
          onChange={e => setFilterSeverity(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {SEVERITIES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Risk Levels' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>

        {/* Legend */}
        <div className="ml-auto flex items-center gap-4">
          {[
            { color: '#6366f1', label: 'Use Case' },
            { color: '#0ea5e9', label: 'AI Model' },
            { color: '#f59e0b', label: 'Owner' },
            { color: '#ef4444', label: 'Risk' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Graph */}
      <div style={{ height: 'calc(100vh - 320px)', minHeight: '400px' }}>
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
