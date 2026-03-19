'use client'
import { X, ShieldAlert, User, Database, CheckCircle2, Clock, Circle } from 'lucide-react'
import type { UseCase, Person } from '@/lib/aimaps-types'

const STATUS_CFG: Record<string, { label: string; text: string; dot: string }> = {
  discovered: { label: 'Discovered', text: 'text-slate-400',  dot: 'bg-slate-400'  },
  assessed:   { label: 'Assessed',   text: 'text-blue-400',   dot: 'bg-blue-400'   },
  owned:      { label: 'Owned',      text: 'text-amber-400',  dot: 'bg-amber-400'  },
  mitigated:  { label: 'Mitigated',  text: 'text-purple-400', dot: 'bg-purple-400' },
  compliant:  { label: 'Compliant',  text: 'text-green-400',  dot: 'bg-green-400'  },
}

const SEVERITY_CFG: Record<string, { color: string; bar: string }> = {
  critical: { color: 'text-red-400',    bar: 'bg-red-500'    },
  high:     { color: 'text-orange-400', bar: 'bg-orange-500' },
  medium:   { color: 'text-yellow-400', bar: 'bg-yellow-500' },
  low:      { color: 'text-green-400',  bar: 'bg-green-500'  },
}

const DATA_CLASS_CFG: Record<string, { color: string; bg: string }> = {
  restricted:   { color: 'text-red-400',    bg: 'bg-red-900/30'    },
  confidential: { color: 'text-orange-400', bg: 'bg-orange-900/30' },
  internal:     { color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
  public:       { color: 'text-green-400',  bg: 'bg-green-900/30'  },
}

const COMPLIANCE_CFG: Record<string, { label: string; color: string }> = {
  covered: { label: 'Covered', color: 'text-green-400'  },
  partial: { label: 'Partial', color: 'text-yellow-400' },
  gap:     { label: 'Gap',     color: 'text-red-400'    },
}

interface UseCaseDetailPanelProps {
  useCase: UseCase
  owner: Person | undefined
  onClose: () => void
}

export function UseCaseDetailPanel({ useCase, owner, onClose }: UseCaseDetailPanelProps) {
  const status    = STATUS_CFG[useCase.status] ?? STATUS_CFG.discovered
  const dataClass = DATA_CLASS_CFG[useCase.dataClassification] ?? DATA_CLASS_CFG.internal
  const worstSev  = ['critical','high','medium','low'].find(s => useCase.risks.some(r => r.severity === s))

  return (
    <div
      className="fixed right-0 top-14 bottom-0 w-[380px] z-30 flex flex-col"
      style={{ background: '#0f1623', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-4 flex items-start justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#141824' }}>
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${status.text}`}>{status.label}</span>
          </div>
          <h2 className="text-sm font-semibold text-slate-100 leading-snug">{useCase.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{useCase.department}</p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 flex-shrink-0 mt-0.5 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4 space-y-5">

          {/* Description */}
          <p className="text-xs text-slate-400 leading-relaxed">{useCase.description}</p>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className={`rounded-lg px-3 py-2.5 ${dataClass.bg}`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Database size={10} className={dataClass.color} />
                <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Data</span>
              </div>
              <span className={`text-xs font-semibold capitalize ${dataClass.color}`}>{useCase.dataClassification}</span>
            </div>
            <div className="rounded-lg px-3 py-2.5 bg-slate-800/50">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Discovery</div>
              <span className="text-xs font-semibold text-slate-300 capitalize">{useCase.discoveryMethod.replace(/-/g,' ')}</span>
            </div>
          </div>

          {/* AI Models */}
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">AI Models</div>
            <div className="flex flex-wrap gap-1.5">
              {useCase.models.map(m => (
                <span key={m.id} className="text-[11px] font-medium px-2.5 py-1 rounded-lg"
                  style={{ background: '#f59e0b18', color: '#f59e0b', border: '1px solid #f59e0b30' }}>
                  {m.name}
                  <span className="ml-1.5 text-[9px] opacity-60">{m.provider}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Owner */}
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Owner</div>
            {owner ? (
              <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 bg-slate-800/50">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: '#7c3aed30', color: '#a78bfa' }}>
                  {owner.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">{owner.name}</div>
                  <div className="text-[10px] text-slate-500">{owner.role} · {owner.department}</div>
                </div>
                <User size={12} className="ml-auto text-slate-600" />
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-red-900/20 border border-red-900/30">
                <ShieldAlert size={12} className="text-red-400" />
                <span className="text-xs font-semibold text-red-400">No owner assigned</span>
                <button className="ml-auto text-[10px] font-semibold text-red-400 hover:text-red-300">Assign →</button>
              </div>
            )}
          </div>

          {/* Risks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Risks <span className="text-slate-600 normal-case">({useCase.risks.length})</span>
              </div>
              {worstSev && (
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${SEVERITY_CFG[worstSev].color}`}>
                  Worst: {worstSev}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {useCase.risks.map(risk => {
                const sev = SEVERITY_CFG[risk.severity] ?? SEVERITY_CFG.low
                return (
                  <div key={risk.id} className="rounded-lg overflow-hidden"
                    style={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className={`h-0.5 ${sev.bar}`} />
                    <div className="px-3 py-2.5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-medium text-slate-200 leading-snug">{risk.name}</span>
                        <span className={`text-[9px] font-bold uppercase flex-shrink-0 ${sev.color}`}>{risk.severity}</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {risk.owaspRef && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                            style={{ background: '#f59e0b15', color: '#f59e0b', border: '1px solid #f59e0b25' }}>
                            OWASP {risk.owaspRef}
                          </span>
                        )}
                        {risk.euAiActRef && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                            style={{ background: '#00d9ff15', color: '#00d9ff', border: '1px solid #00d9ff25' }}>
                            EU AI Act {risk.euAiActRef}
                          </span>
                        )}
                        {risk.nistRef && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                            style={{ background: '#10b98115', color: '#10b981', border: '1px solid #10b98125' }}>
                            {risk.nistRef}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mitigations */}
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Mitigations</div>
            <div className="space-y-1.5">
              {useCase.risks.flatMap(r => r.mitigations).map(m => {
                const Icon  = m.status === 'applied' ? CheckCircle2 : m.status === 'pending' ? Clock : Circle
                const color = m.status === 'applied' ? 'text-green-400' : m.status === 'pending' ? 'text-yellow-400' : 'text-slate-600'
                return (
                  <div key={m.id} className="flex items-start gap-2.5 px-3 py-2 rounded-lg" style={{ background: '#1a1f2e' }}>
                    <Icon size={12} className={`${color} mt-0.5 flex-shrink-0`} />
                    <div>
                      <div className="text-xs font-medium text-slate-300">{m.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{m.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Compliance */}
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Compliance Coverage</div>
            <div className="grid grid-cols-2 gap-1.5">
              {([
                ['euAiAct',   'EU AI Act'   ],
                ['nistAiRmf', 'NIST AI RMF' ],
                ['owaspLlm',  'OWASP LLM'   ],
                ['iso42001',  'ISO 42001'   ],
              ] as const).map(([key, label]) => {
                const level = (useCase.complianceStatus as Record<string, string>)[key] ?? 'gap'
                const cfg   = COMPLIANCE_CFG[level] ?? COMPLIANCE_CFG.gap
                return (
                  <div key={key} className="rounded-lg px-3 py-2 flex items-center justify-between"
                    style={{ background: '#1a1f2e' }}>
                    <span className="text-[10px] text-slate-400">{label}</span>
                    <span className={`text-[10px] font-semibold ${cfg.color}`}>{cfg.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Footer actions */}
      <div className="flex-shrink-0 px-5 py-3 flex gap-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#141824' }}>
        <button className="flex-1 text-xs font-semibold py-2 rounded-lg transition-colors"
          style={{ background: '#00d9ff18', color: '#00d9ff', border: '1px solid #00d9ff30' }}>
          Edit Use Case
        </button>
        <button className="flex-1 text-xs font-semibold py-2 rounded-lg transition-colors"
          style={{ background: '#7c3aed18', color: '#a78bfa', border: '1px solid #7c3aed30' }}>
          Assign Owner
        </button>
      </div>
    </div>
  )
}
