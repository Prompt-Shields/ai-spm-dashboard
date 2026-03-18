'use client'
import { X } from 'lucide-react'
import type { UseCase, Person } from '@/lib/aimaps-types'
import { RiskChip } from './risk-chip'

const STATUS_LABEL: Record<string, string> = {
  discovered: 'Discovered',
  assessed: 'Assessed',
  owned: 'Owned',
  mitigated: 'Mitigated',
  compliant: 'Compliant',
}

const STATUS_COLOR: Record<string, string> = {
  discovered: 'bg-slate-100 text-slate-600',
  assessed: 'bg-blue-100 text-blue-700',
  owned: 'bg-yellow-100 text-yellow-700',
  mitigated: 'bg-purple-100 text-purple-700',
  compliant: 'bg-green-100 text-green-700',
}

interface UseCaseDetailPanelProps {
  useCase: UseCase
  owner: Person | undefined
  onClose: () => void
}

export function UseCaseDetailPanel({ useCase, owner, onClose }: UseCaseDetailPanelProps) {
  return (
    <div className="fixed right-0 top-14 bottom-0 w-96 bg-white border-l border-slate-200 shadow-xl z-30 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{useCase.name}</h2>
          <span className="text-xs text-slate-500">{useCase.department}</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 mt-0.5">
          <X size={18} />
        </button>
      </div>

      <div className="px-5 py-4 space-y-5">
        {/* Status */}
        <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[useCase.status]}`}>
          {STATUS_LABEL[useCase.status]}
        </span>

        {/* Description */}
        <p className="text-sm text-slate-600">{useCase.description}</p>

        {/* Model */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">AI Models</div>
          <div className="flex flex-wrap gap-1.5">
            {useCase.models.map(m => (
              <span key={m.id} className="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-2.5 py-0.5 rounded-full font-medium">
                {m.name}
              </span>
            ))}
          </div>
        </div>

        {/* Owner */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Owner</div>
          {owner ? (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
                {owner.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800">{owner.name}</div>
                <div className="text-xs text-slate-500">{owner.role}</div>
              </div>
            </div>
          ) : (
            <span className="text-sm text-red-500 font-medium">⚠️ Unowned</span>
          )}
        </div>

        {/* Data classification */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Data Classification</div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            useCase.dataClassification === 'restricted' ? 'bg-red-100 text-red-700' :
            useCase.dataClassification === 'confidential' ? 'bg-orange-100 text-orange-700' :
            useCase.dataClassification === 'internal' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {useCase.dataClassification.charAt(0).toUpperCase() + useCase.dataClassification.slice(1)}
          </span>
        </div>

        {/* Risks */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Risks ({useCase.risks.length})</div>
          <div className="space-y-2">
            {useCase.risks.map(risk => (
              <div key={risk.id} className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                <RiskChip risk={risk} />
                <p className="text-xs text-slate-500 mt-1.5">{risk.name}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {risk.owaspRef && <span className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">OWASP {risk.owaspRef}</span>}
                  {risk.euAiActRef && <span className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">EU AI Act {risk.euAiActRef}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mitigations */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Mitigations</div>
          <div className="space-y-1.5">
            {useCase.risks.flatMap(r => r.mitigations).map(m => (
              <div key={m.id} className="flex items-start gap-2">
                <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  m.status === 'applied' ? 'bg-green-100 text-green-700' :
                  m.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {m.status === 'applied' ? '✓' : m.status === 'pending' ? '…' : '○'}
                </span>
                <div>
                  <div className="text-xs font-medium text-slate-700">{m.name}</div>
                  <div className="text-xs text-slate-400">{m.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
