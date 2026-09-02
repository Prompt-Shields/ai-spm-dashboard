'use client'
// Shared chrome for the marketplace: status pills, severity colours, stars.
//
// components/risk-chip.tsx can't be reused here — it's typed to `Risk` from
// lib/aimaps-types (severities critical|high|medium|low) and renders a risk
// name plus an OWASP ref. This borrows its palette for our narrower
// RiskSeverity | 'ok' scale.
import { Ban, Clock3, ShieldCheck, Star } from 'lucide-react'
import type { RiskSeverity } from '@/lib/mcp-discovery-data'
import type { ReviewStatus } from '@/lib/marketplace/types'

export const STATUS_META: Record<
  ReviewStatus,
  { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; badge: string }
> = {
  approved: { label: 'Approved', icon: ShieldCheck, badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  in_review: { label: 'In review', icon: Clock3, badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  blocked: { label: 'Blocked', icon: Ban, badge: 'bg-red-50 text-red-700 border-red-200' },
}

export const SEVERITY_CLASS: Record<RiskSeverity | 'ok', string> = {
  ok: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  low: 'bg-slate-50 text-slate-600 border-slate-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-red-50 text-red-700 border-red-200',
}

export const SEVERITY_LABEL: Record<RiskSeverity | 'ok', string> = {
  ok: 'Pass',
  low: 'Note',
  medium: 'Medium',
  high: 'High',
}

export function StatusBadge({ status }: { status: ReviewStatus }) {
  const meta = STATUS_META[status]
  const Icon = meta.icon
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${meta.badge}`}
    >
      <Icon size={10} />
      {meta.label}
    </span>
  )
}

/** Average peer rating. Hidden entirely when nobody has rated it — an
 *  unrated skill shouldn't look like a zero-star one. */
export function Rating({ value, count }: { value: number; count: number }) {
  if (count === 0) return null
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500" title={`${count} review${count === 1 ? '' : 's'}`}>
      <Star size={11} className="fill-amber-400 text-amber-400" />
      <span className="font-medium text-slate-700 tabular-nums">{value.toFixed(1)}</span>
      <span className="text-slate-400">({count})</span>
    </span>
  )
}
