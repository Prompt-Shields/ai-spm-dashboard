'use client'
// Detail view for a single skill. Slide-over panel following the
// components/agent-control/agent-drawer.tsx pattern (bespoke, no Radix —
// this repo has no sheet primitive).
import { useEffect } from 'react'
import { Check, Plus, Star, Users, X } from 'lucide-react'
import type { MarketplaceSkill } from '@/lib/marketplace/types'
import { CATEGORY_LABELS } from '@/lib/marketplace/types'
import { avgRating, hoursSavedPerMonth, valuePerMonth } from '@/lib/marketplace/derive'
import { hours, money, rateOrDash, shortDate } from '@/lib/marketplace/format'
import { Rating, StatusBadge } from './badges'
import { ScanPanel } from './scan-panel'

interface Props {
  skill: MarketplaceSkill
  adopted: boolean
  onAdopt: (skill: MarketplaceSkill) => void
  onClose: () => void
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900">{value}</div>
      {hint && <div className="text-[10px] text-slate-400 mt-0.5">{hint}</div>}
    </div>
  )
}

export function SkillDrawer({ skill, adopted, onAdopt, onClose }: Props) {
  const saved = hoursSavedPerMonth(skill)

  // Escape closes, and the page behind stops scrolling while the panel is
  // open — without the lock, clicking a card scrolls the grid underneath as
  // the browser brings the focused button into view.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <>
      <button
        aria-label="Close details"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-slate-900/30"
      />
      <aside
        role="dialog"
        aria-label={`${skill.name} details`}
        className="fixed right-0 top-0 z-50 h-screen w-full max-w-md bg-slate-50 border-l border-slate-200 flex flex-col shadow-xl"
      >
        {/* Header */}
        <div className="shrink-0 bg-white border-b border-slate-200 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-slate-900">{skill.name}</h2>
                <StatusBadge status={skill.status} />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {CATEGORY_LABELS[skill.category]} · v{skill.version} · {skill.builder}, {skill.sourceTeam}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close details"
              className="shrink-0 p-1.5 rounded hover:bg-slate-100 text-slate-500"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed">{skill.purpose}</p>

          {skill.status !== 'approved' && skill.note && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wide text-amber-700 font-semibold">
                {skill.status === 'blocked' ? 'Blocked' : 'Awaiting decision'}
              </div>
              <p className="text-xs text-amber-900 leading-snug mt-0.5">{skill.note}</p>
              {skill.reviewer && (
                <p className="text-[10px] text-amber-700/80 mt-1">Gate: {skill.reviewer}</p>
              )}
            </div>
          )}

          {skill.whenToUse.length > 0 && (
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                When to use it
              </h3>
              <ul className="space-y-1">
                {skill.whenToUse.map((w) => (
                  <li key={w} className="flex gap-2 text-xs text-slate-600 leading-snug">
                    <span className="text-indigo-400 shrink-0">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {skill.exampleInput && (
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                Example
              </h3>
              <p className="rounded-lg bg-slate-900 text-slate-100 px-3 py-2.5 text-[11px] leading-relaxed font-mono">
                {skill.exampleInput}
              </p>
            </section>
          )}

          <section className="grid grid-cols-2 gap-2.5">
            <Metric
              label="Adoption"
              value={rateOrDash(skill.adopters, skill.reachable)}
              hint={`${skill.adopters} of ${skill.reachable} reachable`}
            />
            <Metric label="Reused by" value={`${skill.reuseTeams} teams`} hint="beyond the origin team" />
            <Metric label="Hours saved" value={saved > 0 ? hours(saved) : '—'} hint="per month, quality-weighted" />
            <Metric label="Value" value={saved > 0 ? money(valuePerMonth(skill)) : '—'} hint="per month" />
          </section>

          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
              Pre-share scan
            </h3>
            <ScanPanel scan={skill.scan} />
          </section>

          {skill.suggestedTeams.length > 0 && (
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                Matched to
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                {skill.suggestedTeams.map((team) => (
                  <span
                    key={team}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5"
                  >
                    <Users size={10} />
                    {team}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Reviews
              </h3>
              <Rating value={avgRating(skill)} count={skill.reviews.length} />
            </div>
            {skill.reviews.length === 0 ? (
              <p className="text-xs text-slate-400">No reviews yet.</p>
            ) : (
              <ul className="space-y-2">
                {skill.reviews.map((r) => (
                  <li key={`${r.author}-${r.at}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-slate-800 truncate">
                        {r.author}
                        <span className="text-slate-400 font-normal"> · {r.team}</span>
                      </span>
                      <span className="shrink-0 inline-flex items-center gap-0.5">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} size={10} className="fill-amber-400 text-amber-400" />
                        ))}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug mt-1">{r.comment}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{shortDate(r.at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="text-[10px] text-slate-400">
            Submitted {shortDate(skill.submittedAt)}
            {skill.reviewer ? ` · reviewed by ${skill.reviewer}` : ''}
          </p>
        </div>

        {/* Action bar */}
        {skill.status === 'approved' && (
          <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3">
            <button
              onClick={() => onAdopt(skill)}
              className={`w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                adopted
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {adopted ? <Check size={15} /> : <Plus size={15} />}
              {adopted ? 'Adopted — in your skill list' : 'Adopt this skill'}
            </button>
          </div>
        )}
      </aside>
    </>
  )
}