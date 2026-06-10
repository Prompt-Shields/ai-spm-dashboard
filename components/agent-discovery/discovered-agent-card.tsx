'use client'
import { AlertTriangle, FileWarning, ShieldCheck, Clock, EyeOff } from 'lucide-react'
import type { ApprovalState, DiscoveredAgent } from '@/lib/agent-discovery/types'
import { useT } from '@/lib/i18n/provider'

interface DiscoveredAgentCardProps {
  agent: DiscoveredAgent
}

const APPROVAL_STYLE: Record<ApprovalState, string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  unregistered: 'bg-red-100 text-red-700',
}
const APPROVAL_ICON = { approved: ShieldCheck, pending: Clock, unregistered: EyeOff }

export function DiscoveredAgentCard({ agent }: DiscoveredAgentCardProps) {
  const t = useT()
  const ApprovalIcon = APPROVAL_ICON[agent.approvalState]

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="text-sm font-semibold text-slate-800 leading-tight">{agent.name}</div>
        <span className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap ${APPROVAL_STYLE[agent.approvalState]}`}>
          <ApprovalIcon size={10} />
          {t(`agentDiscovery.approval.${agent.approvalState}`)}
        </span>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed mb-2">{agent.purpose}</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
        <div><span className="text-slate-400">{t('agentDiscovery.card.owner')}:</span> {agent.owner}</div>
        <div><span className="text-slate-400">{t('agentDiscovery.card.protocol')}:</span> {agent.protocol.toUpperCase()}</div>
        <div><span className="text-slate-400">{t('agentDiscovery.card.region')}:</span> {agent.region}</div>
        <div><span className="text-slate-400">{t('agentDiscovery.card.dataClass')}:</span> {agent.dataClassification}</div>
      </div>
      {(!agent.residencyOk || !agent.manifestComplete) && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {!agent.residencyOk && (
            <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">
              <AlertTriangle size={10} />
              {t('agentDiscovery.card.residencyRisk')}
            </span>
          )}
          {!agent.manifestComplete && (
            <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100">
              <FileWarning size={10} />
              {t('agentDiscovery.card.manifestGap')}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
