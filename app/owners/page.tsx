'use client'
import { useState } from 'react'
import { Bot } from 'lucide-react'
import { PERSONS, USE_CASES } from '@/lib/aimaps-data'
import { OwnerDetailPanel } from '@/components/owner-detail-panel'
import type { Person } from '@/lib/aimaps-types'

export default function OwnersPage() {
  const [selected, setSelected] = useState<Person | null>(null)
  const unownedCount = USE_CASES.filter(uc => !uc.ownerId).length
  const totalPending = PERSONS.reduce((sum, p) => sum + p.assessmentsPending, 0)
  const totalComplete = PERSONS.reduce((sum, p) => sum + p.assessmentsComplete, 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Owners</h1>
        <p className="text-sm text-slate-500 mt-0.5">People accountable for AI use cases across the organisation</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Owners', value: PERSONS.length - 1, color: 'text-indigo-600' },
          { label: 'Pending Assessments', value: totalPending, color: 'text-amber-600' },
          { label: 'Completed', value: totalComplete, color: 'text-green-600' },
          { label: 'Unowned Use Cases', value: unownedCount, color: 'text-red-500' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">{kpi.label}</div>
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Notify all button */}
      {totalPending > 0 && (
        <div className="mb-4">
          <button className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Bot size={13} />
            Notify All Pending Owners via AI Agent
          </button>
        </div>
      )}

      {/* Owners table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Owner', 'Department', 'Use Cases', 'Pending', 'Completed', ''].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERSONS.filter(p => p.id !== 'unowned-1').map(person => (
              <tr key={person.id} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => setSelected(person)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{person.name}</div>
                      <div className="text-xs text-slate-400">{person.role}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{person.department}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{person.useCaseIds.length}</td>
                <td className="px-4 py-3">
                  {person.assessmentsPending > 0
                    ? <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{person.assessmentsPending}</span>
                    : <span className="text-xs text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{person.assessmentsComplete}</span>
                </td>
                <td className="px-4 py-3 text-xs text-indigo-500">View →</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <OwnerDetailPanel person={selected} useCases={USE_CASES} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
