'use client'
import React, { useState } from 'react'
import { USE_CASES, PERSONS } from '@/lib/aimaps-data'
import { RiskChip } from '@/components/risk-chip'

const STATUS_LABEL: Record<string, string> = {
  discovered: 'Discovered', assessed: 'Assessed', owned: 'Owned', mitigated: 'Mitigated', compliant: 'Compliant',
}
const STATUS_COLOR: Record<string, string> = {
  discovered: 'bg-slate-100 text-slate-600', assessed: 'bg-blue-100 text-blue-700',
  owned: 'bg-yellow-100 text-yellow-700', mitigated: 'bg-purple-100 text-purple-700',
  compliant: 'bg-green-100 text-green-700',
}

export default function RegisterPage() {
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const depts = ['all', ...Array.from(new Set(USE_CASES.map(uc => uc.department)))]

  const filtered = USE_CASES.filter(uc =>
    (filterDept === 'all' || uc.department === filterDept) &&
    (filterStatus === 'all' || uc.status === filterStatus) &&
    (!search || uc.name.toLowerCase().includes(search.toLowerCase()) || uc.department.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Register</h1>
          <p className="text-sm text-slate-500 mt-0.5">{USE_CASES.length} use cases · {USE_CASES.filter(uc => uc.discoveryMethod === 'shadow-ai').length} shadow AI</p>
        </div>
        <button className="text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg">
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search use cases..."
          className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
        />
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {depts.map(d => <option key={d} value={d}>{d === 'all' ? 'All Departments' : d}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {['all','discovered','assessed','owned','mitigated','compliant'].map(s => (
            <option key={s} value={s}>{s === 'all' ? 'All Statuses' : STATUS_LABEL[s]}</option>
          ))}
        </select>
        <div className="ml-auto text-xs text-slate-400 flex items-center">{filtered.length} results</div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Use Case', 'Department', 'Model', 'Owner', 'Top Risk', 'Status'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(uc => {
              const owner = PERSONS.find(p => p.id === uc.ownerId)
              const topRisk = [...uc.risks].sort((a, b) =>
                ['critical','high','medium','low'].indexOf(a.severity) - ['critical','high','medium','low'].indexOf(b.severity)
              )[0]

              return (
                <React.Fragment key={uc.id}>
                  <tr
                    className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setExpanded(expanded === uc.id ? null : uc.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 text-sm">{uc.name}</div>
                      {uc.discoveryMethod === 'shadow-ai' && (
                        <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">Shadow AI</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{uc.department}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{uc.models.map(m => m.name).join(', ')}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{owner?.name ?? <span className="text-red-400">Unowned</span>}</td>
                    <td className="px-4 py-3">{topRisk ? <RiskChip risk={topRisk} showRef={false} /> : <span className="text-xs text-slate-300">—</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[uc.status]}`}>
                        {STATUS_LABEL[uc.status]}
                      </span>
                    </td>
                  </tr>
                  {expanded === uc.id && (
                    <tr className="bg-slate-50">
                      <td colSpan={6} className="px-6 py-4">
                        <p className="text-xs text-slate-600 mb-2">{uc.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {uc.risks.map(r => <RiskChip key={r.id} risk={r} />)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
