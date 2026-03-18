'use client'
import { USE_CASES } from '@/lib/aimaps-data'
import { ComplianceCoverageCard } from '@/components/compliance-coverage-card'

const FRAMEWORKS = [
  { key: 'euAiAct', name: 'EU AI Act', percentage: 73, gapCount: 13, color: '#22c55e' },
  { key: 'nistAiRmf', name: 'NIST AI RMF', percentage: 61, gapCount: 18, color: '#0ea5e9' },
  { key: 'owaspLlm', name: 'OWASP LLM Top 10', percentage: 48, gapCount: 24, color: '#f59e0b' },
  { key: 'iso42001', name: 'ISO 42001', percentage: 55, gapCount: 21, color: '#8b5cf6' },
] as const

const LEVEL_BADGE: Record<string, string> = {
  covered: 'bg-green-100 text-green-700',
  partial: 'bg-yellow-100 text-yellow-700',
  gap: 'bg-red-100 text-red-700',
}

export default function ComplyPage() {
  const gapUseCases = USE_CASES.filter(uc =>
    uc.complianceStatus.euAiAct === 'gap' ||
    uc.complianceStatus.nistAiRmf === 'gap' ||
    uc.complianceStatus.owaspLlm === 'gap'
  ).slice(0, 12)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Comply</h1>
          <p className="text-sm text-slate-500 mt-0.5">Framework coverage across all AI use cases</p>
        </div>
        <button className="text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg">
          Export Compliance Report
        </button>
      </div>

      {/* Framework cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {FRAMEWORKS.map(fw => (
          <ComplianceCoverageCard key={fw.key} framework={fw} />
        ))}
      </div>

      {/* Gap table */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Compliance Gaps — Action Required</h2>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Use Case', 'Department', 'EU AI Act', 'NIST AI RMF', 'OWASP LLM', 'Action'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gapUseCases.map(uc => (
                <tr key={uc.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{uc.name}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{uc.department}</td>
                  {(['euAiAct', 'nistAiRmf', 'owaspLlm'] as const).map(fw => (
                    <td key={fw} className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEVEL_BADGE[uc.complianceStatus[fw]]}`}>
                        {uc.complianceStatus[fw].charAt(0).toUpperCase() + uc.complianceStatus[fw].slice(1)}
                      </span>
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                      Assign remediation →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
