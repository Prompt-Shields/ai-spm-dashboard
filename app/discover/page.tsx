'use client'
import { useState } from 'react'
import { Satellite, Link2, ScanSearch } from 'lucide-react'
import { AGENT_CONVERSATIONS, DISCOVERY_STATS } from '@/lib/aimaps-data'
import { AgentConversationCard } from '@/components/agent-conversation-card'
import type { LucideIcon } from 'lucide-react'

const ENTRY_CARDS: {
  Icon: LucideIcon
  title: string
  description: string
  action: string
  color: 'indigo' | 'sky' | 'amber'
  badge?: string
  onClick?: () => void
}[] = [
  {
    Icon: Satellite,
    title: 'CISO Discovery Campaign',
    description: 'Send AI agents to interview all departments. Agents ask about AI tool usage, data handling, and risk exposure.',
    action: 'Launch Campaign',
    color: 'indigo',
  },
  {
    Icon: Link2,
    title: 'Employee Self-Registration',
    description: 'Share a link with staff. An AI agent interviews them conversationally and extracts use case data automatically.',
    action: 'Copy Link',
    color: 'sky',
  },
  {
    Icon: ScanSearch,
    title: 'Auto-Detect via Okta',
    description: '12 new AI tools detected in your SaaS estate this week. Review and trigger intake agents for ungoverned tools.',
    action: 'Review Alerts',
    color: 'amber',
    badge: '12 new',
  },
]

export default function DiscoverPage() {
  const [campaignLaunched, setCampaignLaunched] = useState(false)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Discover</h1>
        <p className="text-sm text-slate-500 mt-0.5">AI agents interview employees to map AI use cases — no forms, no manual entry</p>
      </div>

      {/* Entry point cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {ENTRY_CARDS.map(card => {
          const onClick = card.title === 'CISO Discovery Campaign' ? () => setCampaignLaunched(true) : undefined
          return (
            <div key={card.title} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                card.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                card.color === 'sky' ? 'bg-sky-50 text-sky-600' :
                'bg-amber-50 text-amber-600'
              }`}>
                <card.Icon size={18} />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">{card.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{card.description}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClick}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    card.color === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' :
                    card.color === 'sky' ? 'bg-sky-100 hover:bg-sky-200 text-sky-700' :
                    'bg-amber-100 hover:bg-amber-200 text-amber-700'
                  }`}
                >
                  {card.action}
                </button>
                {card.badge && (
                  <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{card.badge}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Outreach Sent', value: DISCOVERY_STATS.outreachSent, color: 'text-slate-800' },
          { label: 'Responded', value: DISCOVERY_STATS.responded, color: 'text-sky-600' },
          { label: 'Use Cases Identified', value: DISCOVERY_STATS.useCasesFound, color: 'text-indigo-600' },
          { label: 'Shadow AI Detected', value: DISCOVERY_STATS.shadowAiFound, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Conversation feed */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Agent Conversations</h2>
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
