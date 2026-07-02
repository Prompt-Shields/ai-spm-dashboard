'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Connector } from '@/lib/integrations/sentinel-demo'
import { CONNECTOR_STATUS_STYLE } from '@/lib/integrations/sentinel-demo'
import { BrandLogo } from './brand-logos'

const STATUS_LABEL: Record<Connector['status'], string> = {
  connected: 'Connected',
  available: 'Available',
  beta: 'Beta',
}

export function ConnectorCard({ connector }: { connector: Connector }) {
  const { id, name, vendor, category, status, blurb, href, featured } = connector

  const body = (
    <div
      className={cn(
        'group relative h-full rounded-xl border bg-white p-5 transition-all',
        href ? 'border-slate-200 hover:border-indigo-300 hover:shadow-md' : 'border-slate-200',
        !href && 'opacity-90',
      )}
    >
      <div className="flex items-start gap-3">
        <BrandLogo id={id} className="h-11 w-11 shadow-sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-slate-900">{name}</h3>
          </div>
          <p className="text-xs text-slate-400">{vendor}</p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            CONNECTOR_STATUS_STYLE[status],
          )}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-600">{blurb}</p>

      <div className="mt-4 flex items-center justify-between">
        <span className="rounded-md bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">
          {category}
        </span>
        {href ? (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:gap-1.5 transition-all">
            {status === 'connected' ? 'Manage' : 'Configure'}
            <ArrowRight size={14} />
          </span>
        ) : (
          <span className="text-xs text-slate-400">Coming soon</span>
        )}
      </div>

      {featured && (
        <span className="absolute -top-2 left-4 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
          Featured
        </span>
      )}
    </div>
  )

  return href ? (
    <Link href={href} className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-xl">
      {body}
    </Link>
  ) : (
    body
  )
}
