'use client'
import { Plug } from 'lucide-react'
import { CONNECTORS } from '@/lib/integrations/sentinel-demo'
import { ConnectorCard } from '@/components/integrations/connector-card'

// Integrations hub — a connector catalog. Microsoft Sentinel is the featured,
// fully built-out connector (see /integrations/sentinel); the rest set the
// scene for a broader integrations story.
export default function IntegrationsPage() {
  const connected = CONNECTORS.filter((c) => c.status === 'connected').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
          <Plug size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Integrations</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Connect Atlas AI-SPM to the SIEM, GRC and ITSM tools your security team already runs.
          </p>
        </div>
        <div className="ml-auto hidden rounded-lg border border-slate-200 bg-white px-4 py-2 text-center sm:block">
          <div className="text-lg font-bold text-slate-900">
            {connected}
            <span className="text-sm font-normal text-slate-400"> / {CONNECTORS.length}</span>
          </div>
          <div className="text-[11px] uppercase tracking-wide text-slate-400">Connected</div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CONNECTORS.map((c) => (
          <ConnectorCard key={c.id} connector={c} />
        ))}
      </div>

      <p className="text-xs text-slate-400">
        Demo environment — connectors here are illustrative. Microsoft Sentinel is wired up as a live,
        interactive walkthrough.
      </p>
    </div>
  )
}
