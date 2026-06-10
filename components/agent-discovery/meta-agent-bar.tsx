'use client'
import { Radar, Play, SkipForward, RotateCcw } from 'lucide-react'
import { useT } from '@/lib/i18n/provider'

type RunState = 'idle' | 'running' | 'complete'

interface MetaAgentBarProps {
  state: RunState
  onRun: () => void
  onSkip: () => void
  onReplay: () => void
}

export function MetaAgentBar({ state, onRun, onSkip, onReplay }: MetaAgentBarProps) {
  const t = useT()

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
        <Radar size={18} className={state === 'running' ? 'animate-spin' : ''} style={state === 'running' ? { animationDuration: '3s' } : undefined} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-900">{t('agentDiscovery.metaAgent.name')}</div>
        <div className="text-xs text-slate-500 truncate">{t('agentDiscovery.metaAgent.identity')}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {state === 'running' && (
          <button
            onClick={onSkip}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <SkipForward size={12} />
            {t('agentDiscovery.metaAgent.skip')}
          </button>
        )}
        {state === 'complete' ? (
          <button
            onClick={onReplay}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <RotateCcw size={12} />
            {t('agentDiscovery.metaAgent.replay')}
          </button>
        ) : (
          <button
            onClick={onRun}
            disabled={state === 'running'}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <Play size={12} />
            {state === 'running' ? t('agentDiscovery.metaAgent.running') : t('agentDiscovery.metaAgent.run')}
          </button>
        )}
      </div>
    </div>
  )
}
