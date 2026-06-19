'use client'

// /owners/inference — suggested owners for unowned AI use cases.
//
// Infers a likely business owner (accountable) and IT owner (technical
// custodian) for every use case with no owner, from Entra ID / department,
// M365 licensing and HR signals, with a confidence score. Framed as the
// educated guess an LLM makes from the directory — and re-runs as people
// join, move and leave so ownership stays current.

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Sparkles,
  Building2,
  Server,
  ShieldAlert,
  Check,
  RefreshCw,
} from 'lucide-react'
import {
  OWNER_SUGGESTIONS,
  OWNER_INFERENCE_COUNTS,
  type Confidence,
} from '@/lib/owner-inference'

const CONFIDENCE_STYLE: Record<Confidence, { chip: string; label: string }> = {
  high: { chip: 'bg-green-100 text-green-700', label: 'High confidence' },
  medium: { chip: 'bg-amber-100 text-amber-700', label: 'Medium confidence' },
  low: { chip: 'bg-slate-100 text-slate-600', label: 'Low confidence' },
}

const DATA_STYLE: Record<string, string> = {
  restricted: 'bg-red-100 text-red-700',
  confidential: 'bg-orange-100 text-orange-700',
  internal: 'bg-slate-100 text-slate-600',
  public: 'bg-slate-100 text-slate-500',
}

export default function OwnerInferencePage() {
  // Demo-local: track which suggestions have been "assigned"/"dismissed".
  const [resolved, setResolved] = useState<Record<string, 'assigned' | 'dismissed'>>({})

  function resolve(id: string, action: 'assigned' | 'dismissed') {
    setResolved((prev) => ({ ...prev, [id]: action }))
  }

  const kpis = [
    { label: 'Unowned use cases', value: OWNER_INFERENCE_COUNTS.unowned },
    { label: 'High-confidence suggestions', value: OWNER_INFERENCE_COUNTS.highConfidence },
    { label: 'High-risk & unowned', value: OWNER_INFERENCE_COUNTS.highRiskUnowned },
  ]

  return (
    <div className="max-w-4xl">
      <Link
        href="/owners"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft size={14} />
        Back to Owners
      </Link>

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-indigo-500" />
          <h1 className="text-xl font-bold text-slate-900">Owner inference</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Suggested owners for use cases with no accountable owner — inferred from Entra ID,
          M365 licensing and HR. Re-runs as people join, move and leave, so ownership stays current
          and stale owners are flagged. Illustrative demo.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {k.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Joiner/mover/leaver note */}
      <div className="flex items-start gap-2 rounded-lg border border-indigo-100 bg-indigo-50/60 p-3 mb-6">
        <RefreshCw size={14} className="text-indigo-500 mt-0.5 shrink-0" />
        <p className="text-xs text-indigo-700 leading-relaxed">
          Inference re-runs on directory changes. When an owner leaves, their use cases are flagged
          for reassignment; when teams move, suggestions follow the new reporting line.
        </p>
      </div>

      {/* Suggestions */}
      <div className="space-y-3">
        {OWNER_SUGGESTIONS.map((s) => {
          const conf = CONFIDENCE_STYLE[s.confidence]
          const state = resolved[s.useCaseId]
          return (
            <div
              key={s.useCaseId}
              className={`rounded-xl border bg-white shadow-sm p-5 transition-colors ${
                state ? 'border-slate-100 opacity-60' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900">{s.useCaseName}</h3>
                  {s.highRisk && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      <ShieldAlert size={11} /> High-risk
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${DATA_STYLE[s.dataClassification]}`}
                  >
                    {s.dataClassification}
                  </span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${conf.chip}`}>
                  {conf.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {s.department} · {s.reason}
              </p>

              {/* Suggested owners */}
              <div className="grid gap-3 sm:grid-cols-2 mt-4">
                <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Building2 size={12} />
                    <span className="text-[10px] font-semibold uppercase tracking-wide">
                      Suggested business owner
                    </span>
                  </div>
                  {s.businessOwner ? (
                    <>
                      <p className="text-sm font-semibold text-slate-900">{s.businessOwner.name}</p>
                      <p className="text-xs text-slate-500">{s.businessOwner.role}</p>
                    </>
                  ) : (
                    <p className="text-sm italic text-slate-400">No clear match — escalate</p>
                  )}
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Server size={12} />
                    <span className="text-[10px] font-semibold uppercase tracking-wide">
                      Suggested IT owner
                    </span>
                  </div>
                  {s.itOwner ? (
                    <>
                      <p className="text-sm font-semibold text-slate-900">{s.itOwner.name}</p>
                      <p className="text-xs text-slate-500">{s.itOwner.role}</p>
                    </>
                  ) : (
                    <p className="text-sm italic text-slate-400">—</p>
                  )}
                </div>
              </div>

              {/* Signals */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 mt-4">
                {s.signals.map((sig) => (
                  <div key={sig.label}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {sig.label}
                    </p>
                    <p className="text-xs text-slate-700">{sig.value}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4">
                {state === 'assigned' ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700">
                    <Check size={13} /> Owner assigned
                  </span>
                ) : state === 'dismissed' ? (
                  <span className="text-xs font-medium text-slate-400">Dismissed</span>
                ) : (
                  <>
                    <button
                      onClick={() => resolve(s.useCaseId, 'assigned')}
                      disabled={!s.businessOwner}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        s.businessOwner
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Accept &amp; assign
                    </button>
                    <button
                      onClick={() => resolve(s.useCaseId, 'dismissed')}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      Dismiss
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
