'use client'
import { FileText, Download, Send } from 'lucide-react'
import type { Cloud, ComplianceReport } from '@/lib/agent-discovery/types'
import { useT } from '@/lib/i18n/provider'

interface ComplianceReportCardProps {
  report: ComplianceReport
  onExport: () => void
  onSend: () => void
}

export function ComplianceReportCard({ report, onExport, onSend }: ComplianceReportCardProps) {
  const t = useT()

  const stats: { label: string; value: number; danger?: boolean }[] = [
    { label: t('agentDiscovery.report.total'), value: report.total },
    { label: t('agentDiscovery.report.registered'), value: report.registered },
    { label: t('agentDiscovery.report.pending'), value: report.pending },
    { label: t('agentDiscovery.report.shadow'), value: report.shadow, danger: report.shadow > 0 },
    { label: t('agentDiscovery.report.residencyViolations'), value: report.residencyViolations, danger: report.residencyViolations > 0 },
    { label: t('agentDiscovery.report.missingManifests'), value: report.missingManifests, danger: report.missingManifests > 0 },
    { label: t('agentDiscovery.report.restrictedDataAgents'), value: report.restrictedDataAgents },
  ]

  return (
    <div className="border border-indigo-200 bg-indigo-50/40 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <FileText size={16} className="text-indigo-600" />
        <h2 className="text-base font-bold text-slate-900">{t('agentDiscovery.report.heading')}</h2>
      </div>
      <p className="text-xs text-slate-500 mb-4">{t('agentDiscovery.report.preparedFor')}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-lg p-2.5 text-center">
            <div className={`text-xl font-bold ${s.danger ? 'text-red-600' : 'text-slate-800'}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <div className="text-xs font-semibold text-slate-600 mb-1.5">{t('agentDiscovery.report.byCloud')}</div>
        <div className="flex flex-wrap gap-2">
          {report.perCloud.map(c => (
            <span key={c.cloud} className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600">
              {t(`agentDiscovery.clouds.${c.cloud as Cloud}`)}: <strong className="text-slate-800">{c.total}</strong>
              {c.shadow > 0 && <span className="text-red-600"> · {c.shadow} {t('agentDiscovery.tally.shadow')}</span>}
            </span>
          ))}
        </div>
      </div>

      {report.recommendedActions.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-slate-600 mb-1.5">{t('agentDiscovery.report.recommendedActions')}</div>
          <ul className="space-y-1">
            {report.recommendedActions.map(a => (
              <li key={a.kind} className="text-xs text-slate-600 flex items-start gap-1.5">
                <span className="text-indigo-500 mt-px">→</span>
                {t(`agentDiscovery.actions.${a.kind}`, { count: a.count })}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          <Download size={12} />
          {t('agentDiscovery.actions.export')}
        </button>
        <button
          onClick={onSend}
          disabled={report.shadow === 0}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          <Send size={12} />
          {t('agentDiscovery.actions.sendToRegister', { count: report.shadow })}
        </button>
      </div>
    </div>
  )
}
