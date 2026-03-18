'use client'
import { X } from 'lucide-react'
import type { Person, UseCase } from '@/lib/aimaps-types'

interface OwnerDetailPanelProps {
  person: Person
  useCases: UseCase[]
  onClose: () => void
}

export function OwnerDetailPanel({ person, useCases, onClose }: OwnerDetailPanelProps) {
  const personUseCases = useCases.filter(uc => uc.ownerId === person.id)

  return (
    <div className="fixed right-0 top-14 bottom-0 w-96 bg-white border-l border-slate-200 shadow-xl z-30 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700">
            {person.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">{person.name}</h2>
            <p className="text-xs text-slate-500">{person.role} · {person.department}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 mt-1">
          <X size={18} />
        </button>
      </div>

      <div className="px-5 py-4 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-yellow-600">{person.assessmentsPending}</div>
            <div className="text-xs text-slate-500 mt-0.5">Pending</div>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-green-600">{person.assessmentsComplete}</div>
            <div className="text-xs text-slate-500 mt-0.5">Completed</div>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Use Cases ({personUseCases.length})
          </div>
          <div className="space-y-2">
            {personUseCases.map(uc => (
              <div key={uc.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50">
                <div className="text-sm font-medium text-slate-800">{uc.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {uc.risks.length} risks · {uc.models.map(m => m.name).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {person.assessmentsPending > 0 && (
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
            Send Assessment Reminder
          </button>
        )}
      </div>
    </div>
  )
}
