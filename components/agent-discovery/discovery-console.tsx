'use client'
import { useEffect, useMemo, useState } from 'react'
import type { Cloud } from '@/lib/agent-discovery/types'
import { CLOUD_AGENTS } from '@/lib/agent-discovery/data'
import { buildComplianceReport } from '@/lib/agent-discovery/report'
import { formatReportMarkdown } from '@/lib/agent-discovery/export'
import { sendShadowAgentsToRegister } from '@/lib/agent-discovery/store'
import { useT } from '@/lib/i18n/provider'
import { MetaAgentBar } from './meta-agent-bar'
import { CloudPane } from './cloud-pane'
import { ComplianceReportCard } from './compliance-report-card'

type RunState = 'idle' | 'running' | 'complete'

const CLOUDS: Cloud[] = ['aws', 'azure', 'gcp']
const REVEAL_MS = 450

// Deterministic reveal order: interleave clouds so all three panes fill in
// parallel (aws[0], azure[0], gcp[0], aws[1], …). No randomness — keeps the
// animation reproducible.
const REVEAL_ORDER = (() => {
  const byCloud: Record<Cloud, typeof CLOUD_AGENTS> = {
    aws: CLOUD_AGENTS.filter(a => a.cloud === 'aws'),
    azure: CLOUD_AGENTS.filter(a => a.cloud === 'azure'),
    gcp: CLOUD_AGENTS.filter(a => a.cloud === 'gcp'),
  }
  const max = Math.max(byCloud.aws.length, byCloud.azure.length, byCloud.gcp.length)
  const order: typeof CLOUD_AGENTS = []
  for (let i = 0; i < max; i++) {
    for (const c of CLOUDS) {
      const agent = byCloud[c][i]
      if (agent) order.push(agent)
    }
  }
  return order
})()

export function DiscoveryConsole() {
  const t = useT()
  const [state, setState] = useState<RunState>('idle')
  const [visibleCount, setVisibleCount] = useState(0)
  const [toast, setToast] = useState<string | null>(null)

  const revealedAgents = useMemo(() => REVEAL_ORDER.slice(0, visibleCount), [visibleCount])
  const report = useMemo(() => buildComplianceReport(revealedAgents), [revealedAgents])

  // Drive the staggered reveal while running.
  useEffect(() => {
    if (state !== 'running') return
    const interval = setInterval(() => {
      setVisibleCount(c => (c >= REVEAL_ORDER.length ? c : c + 1))
    }, REVEAL_MS)
    return () => clearInterval(interval)
  }, [state])

  // Transition to complete once everything is revealed.
  useEffect(() => {
    if (state === 'running' && visibleCount >= REVEAL_ORDER.length) setState('complete')
  }, [state, visibleCount])

  // Auto-dismiss the toast.
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(id)
  }, [toast])

  function handleRun() {
    setVisibleCount(0)
    setState('running')
  }
  function handleSkip() {
    setVisibleCount(REVEAL_ORDER.length)
    setState('complete')
  }
  function handleReplay() {
    setVisibleCount(0)
    setState('running')
  }

  function handleExport() {
    const md = formatReportMarkdown(report)
    try {
      const blob = new Blob([md], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'agent-compliance-report.md'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      // Fallback: copy to clipboard.
      try {
        void navigator.clipboard.writeText(md)
      } catch {
        /* no-op */
      }
    }
  }

  function handleSend() {
    const added = sendShadowAgentsToRegister(revealedAgents, report.total, new Date().toISOString())
    setToast(t('agentDiscovery.actions.sentToast', { count: added }))
  }

  function phaseLabelFor(cloud: Cloud): string {
    if (state === 'idle') return t('agentDiscovery.phases.idle')
    if (state === 'complete') return t('agentDiscovery.phases.done')
    const n = revealedAgents.filter(a => a.cloud === cloud).length
    return n === 0 ? t('agentDiscovery.phases.querying') : t('agentDiscovery.phases.streaming')
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">{t('agentDiscovery.title')}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{t('agentDiscovery.subtitle')}</p>
      </div>

      <div className="mb-4">
        <MetaAgentBar state={state} onRun={handleRun} onSkip={handleSkip} onReplay={handleReplay} />
      </div>

      {/* Live tally */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mb-4 px-1">
        <span><strong className="text-slate-900">{report.total}</strong> {t('agentDiscovery.tally.total')}</span>
        <span><strong className="text-green-600">{report.registered}</strong> {t('agentDiscovery.tally.registered')}</span>
        <span><strong className="text-amber-600">{report.pending}</strong> {t('agentDiscovery.tally.pending')}</span>
        <span><strong className="text-red-600">{report.shadow}</strong> {t('agentDiscovery.tally.shadow')}</span>
        <span><strong className="text-red-600">{report.residencyViolations}</strong> {t('agentDiscovery.tally.residency')}</span>
      </div>

      {/* Cloud panes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {CLOUDS.map(cloud => (
          <CloudPane
            key={cloud}
            cloud={cloud}
            phaseLabel={phaseLabelFor(cloud)}
            agents={revealedAgents.filter(a => a.cloud === cloud)}
          />
        ))}
      </div>

      {/* Report climax */}
      {state === 'complete' && (
        <ComplianceReportCard report={report} onExport={handleExport} onSend={handleSend} />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
