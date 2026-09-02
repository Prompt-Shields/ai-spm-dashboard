'use client'
// The one human gate. Everything before it — discovery, summarising, reuse
// matching — is automated; this is where a person decides whether a skill can
// be handed around the company.
//
// The decision is made against concrete findings rather than a vibe, and a
// note is mandatory: "blocked" with no reason is what sends builders back to
// working around the process.
import { useState } from 'react'
import { Ban, Check, CheckCircle2, Clock3, Inbox, RotateCcw, ShieldCheck } from 'lucide-react'
import type { MarketplaceSkill, ReviewStatus } from '@/lib/marketplace/types'
import { blockingFindings } from '@/lib/marketplace/derive'
import { shortDate } from '@/lib/marketplace/format'
import type { ReviewDecision } from '@/lib/marketplace/store'
import { ScanPanel } from './scan-panel'

const REVIEWER = 'Davy · Security & Compliance'

interface Props {
  queue: MarketplaceSkill[]
  decisions: Record<string, ReviewDecision>
  onDecide: (id: string, decision: ReviewDecision) => void
}

const ACTIONS: { status: ReviewStatus; label: string; icon: React.ComponentType<{ size?: number }>; cls: string }[] = [
  { status: 'approved', label: 'Approve', icon: Check, cls: 'bg-emerald-600 text-white hover:bg-emerald-700' },
  { status: 'in_review', label: 'Request changes', icon: RotateCcw, cls: 'bg-white text-amber-700 border border-amber-300 hover:bg-amber-50' },
  { status: 'blocked', label: 'Block', icon: Ban, cls: 'bg-white text-red-700 border border-red-300 hover:bg-red-50' },
]

function ReviewCard({
  skill,
  decision,
  onDecide,
}: {
  skill: MarketplaceSkill
  decision?: ReviewDecision
  onDecide: (id: string, decision: ReviewDecision) => void
}) {
  const [note, setNote] = useState('')
  const blockers = blockingFindings(skill.scan)

  function decide(status: ReviewStatus) {
    if (note.trim() === '') return
    onDecide(skill.id, {
      status,
      note: note.trim(),
      by: REVIEWER,
      at: new Date().toISOString().slice(0, 10),
    })
    setNote('')
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">{skill.name}</h3>
            <p className="text-xs text-slate-500 leading-snug mt-0.5">{skill.purpose}</p>
            {/* Category is omitted here: teams are usually named after it
                ("Distribution · Ghent"), so the pair reads as a duplicate in a
                plain dot-separated run. It stays on the Browse card, where it
                is a visually distinct chip and drives the filter. */}
            <p className="text-[11px] text-slate-400 mt-1">
              {skill.builder} · {skill.sourceTeam} · submitted {shortDate(skill.submittedAt)}
            </p>
          </div>
          <span
            className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${
              blockers.length > 0
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            <Clock3 size={10} />
            {blockers.length > 0
              ? `${blockers.length} to answer for`
              : 'nothing flagged'}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <ScanPanel scan={skill.scan} />

        {decision ? (
          // Decided this session — show the audit line rather than the controls.
          <div
            className={`rounded-lg border px-3 py-2 ${
              decision.status === 'approved'
                ? 'border-emerald-200 bg-emerald-50'
                : decision.status === 'blocked'
                  ? 'border-red-200 bg-red-50'
                  : 'border-amber-200 bg-amber-50'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide">
              <CheckCircle2 size={12} />
              {decision.status === 'approved'
                ? 'Approved'
                : decision.status === 'blocked'
                  ? 'Blocked'
                  : 'Changes requested'}
            </div>
            <p className="text-xs text-slate-700 leading-snug mt-1">{decision.note}</p>
            <p className="text-[10px] text-slate-500 mt-1">
              {decision.by} · {shortDate(decision.at)}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <ShieldCheck size={13} className="text-amber-600" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                Human gate — {REVIEWER}
              </span>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why this decision? The builder sees this."
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 min-h-[52px] resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {ACTIONS.map(({ status, label, icon: Icon, cls }) => (
                <button
                  key={label}
                  onClick={() => decide(status)}
                  disabled={note.trim() === ''}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${cls}`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
              {note.trim() === '' && (
                <span className="text-[11px] text-slate-400">A note is required</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function ReviewQueue({ queue, decisions, onDecide }: Props) {
  if (queue.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <Inbox size={22} className="mx-auto text-slate-300" />
        <h3 className="text-sm font-medium text-slate-700 mt-2">Queue is clear</h3>
        <p className="text-xs text-slate-400 mt-1">
          Every submitted skill has a decision. New submissions land here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
        Discovery, summarising and reuse-matching all run automatically. This is the one step that
        needs a person: deciding whether a skill is safe to hand around the company. Oldest first.
      </p>
      {queue.map((s) => (
        <ReviewCard key={s.id} skill={s} decision={decisions[s.id]} onDecide={onDecide} />
      ))}
    </div>
  )
}
