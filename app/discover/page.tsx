'use client'
import { useState } from 'react'
import { Satellite, Link2, ScanSearch } from 'lucide-react'
import { AGENT_CONVERSATIONS, DISCOVERY_STATS } from '@/lib/aimaps-data'
import { AgentConversationCard } from '@/components/agent-conversation-card'
import { useT } from '@/lib/i18n/provider'
import type { LucideIcon } from 'lucide-react'

const ENTRY_CARDS: {
  Icon: LucideIcon
  id: 'cisoCampaign' | 'selfRegistration' | 'autoDetect'
  color: 'indigo' | 'sky' | 'amber'
  badgeCount?: number
}[] = [
  {
    Icon: Satellite,
    id: 'cisoCampaign',
    color: 'indigo',
  },
  {
    Icon: Link2,
    id: 'selfRegistration',
    color: 'sky',
  },
  {
    Icon: ScanSearch,
    id: 'autoDetect',
    color: 'amber',
    badgeCount: 12,
  },
]

export default function DiscoverPage() {
  const t = useT()
  const [campaignLaunched, setCampaignLaunched] = useState(false)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">{t('discover.title')}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{t('discover.subtitle')}</p>
      </div>

      {/* Entry point cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {ENTRY_CARDS.map(card => {
          const onClick = card.id === 'cisoCampaign' ? () => setCampaignLaunched(true) : undefined
          return (
            <div key={card.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                card.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                card.color === 'sky' ? 'bg-sky-50 text-sky-600' :
                'bg-amber-50 text-amber-600'
              }`}>
                <card.Icon size={18} />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">{t(`discover.cards.${card.id}.title`)}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{t(`discover.cards.${card.id}.description`)}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClick}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    card.color === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' :
                    card.color === 'sky' ? 'bg-sky-100 hover:bg-sky-200 text-sky-700' :
                    'bg-amber-100 hover:bg-amber-200 text-amber-700'
                  }`}
                >
                  {t(`discover.cards.${card.id}.action`)}
                </button>
                {card.badgeCount !== undefined && (
                  <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{t('discover.cards.autoDetect.badge', { count: card.badgeCount })}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: t('discover.stats.outreachSent'), value: DISCOVERY_STATS.outreachSent, color: 'text-slate-800' },
          { label: t('discover.stats.responded'), value: DISCOVERY_STATS.responded, color: 'text-sky-600' },
          { label: t('discover.stats.useCasesIdentified'), value: DISCOVERY_STATS.useCasesFound, color: 'text-indigo-600' },
          { label: t('discover.stats.shadowAiDetected'), value: DISCOVERY_STATS.shadowAiFound, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Conversation feed */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">{t('discover.conversations')}</h2>
        <div className="grid grid-cols-2 gap-4">
          {AGENT_CONVERSATIONS.map((conv, i) => (
            <AgentConversationCard
              key={conv.id}
              conversation={conv}
              autoPlay={campaignLaunched}
              delay={i * 800}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
