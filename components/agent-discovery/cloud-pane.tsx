'use client'
import type { Cloud, DiscoveredAgent } from '@/lib/agent-discovery/types'
import { useT } from '@/lib/i18n/provider'
import { DiscoveredAgentCard } from './discovered-agent-card'

interface CloudPaneProps {
  cloud: Cloud
  phaseLabel: string
  agents: DiscoveredAgent[]
}

const CLOUD_ACCENT: Record<Cloud, string> = {
  aws: 'text-orange-600 bg-orange-50',
  azure: 'text-sky-600 bg-sky-50',
  gcp: 'text-emerald-600 bg-emerald-50',
}

export function CloudPane({ cloud, phaseLabel, agents }: CloudPaneProps) {
  const t = useT()

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col min-h-[16rem]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${CLOUD_ACCENT[cloud]}`}>
            {t(`agentDiscovery.clouds.${cloud}`)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{t(`agentDiscovery.registries.${cloud}`)}</div>
        </div>
        <span className="text-[11px] text-slate-500">{phaseLabel}</span>
      </div>

      <div className="space-y-2 flex-1">
        {agents.length === 0 ? (
          <div className="text-xs text-slate-400 text-center py-8">{t('agentDiscovery.empty')}</div>
        ) : (
          agents.map(agent => <DiscoveredAgentCard key={agent.id} agent={agent} />)
        )}
      </div>
    </div>
  )
}
