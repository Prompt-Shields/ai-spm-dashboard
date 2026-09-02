'use client'
// A skill as it appears in the Browse grid: enough to decide whether to open
// it, and — for approved skills — the one action that matters, adopt.
import { Check, Plus, Users } from 'lucide-react'
import type { MarketplaceSkill } from '@/lib/marketplace/types'
import { CATEGORY_LABELS } from '@/lib/marketplace/types'
import { avgRating, hoursSavedPerMonth } from '@/lib/marketplace/derive'
import { hours } from '@/lib/marketplace/format'
import { Rating, StatusBadge } from './badges'

interface Props {
  skill: MarketplaceSkill
  adopted: boolean
  onOpen: (skill: MarketplaceSkill) => void
  onAdopt: (skill: MarketplaceSkill) => void
}

export function SkillCard({ skill, adopted, onOpen, onAdopt }: Props) {
  const rating = avgRating(skill)
  const saved = hoursSavedPerMonth(skill)

  return (
    <div className="group flex flex-col rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm transition-all">
      {/* The whole body opens the drawer; the adopt button sits outside it so
          a click on Adopt doesn't also open the detail view. */}
      <button
        onClick={() => onOpen(skill)}
        className="flex-1 text-left p-3.5 rounded-t-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
            {skill.name}
          </span>
          <StatusBadge status={skill.status} />
        </div>

        <p className="text-xs text-slate-500 leading-snug mt-1 line-clamp-2">{skill.purpose}</p>

        <div className="mt-2.5 flex items-center gap-2 flex-wrap text-[11px] text-slate-400">
          <span className="rounded bg-slate-100 text-slate-600 px-1.5 py-0.5 font-medium">
            {CATEGORY_LABELS[skill.category]}
          </span>
          <span className="truncate">{skill.builder}</span>
          {/* Teams are often named after their category ("Legal", "Finance") —
              repeating it reads as a rendering bug rather than provenance. */}
          {skill.sourceTeam !== CATEGORY_LABELS[skill.category] && (
            <>
              <span className="text-slate-300">·</span>
              <span className="truncate">{skill.sourceTeam}</span>
            </>
          )}
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center gap-3 flex-wrap">
          <Rating value={rating} count={skill.reviews.length} />
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
            <Users size={11} className="text-slate-400" />
            <span className="tabular-nums font-medium text-slate-700">{skill.adopters}</span>
          </span>
          {saved > 0 && (
            <span className="text-[11px] text-slate-500">
              <span className="tabular-nums font-medium text-emerald-600">{hours(saved)}</span>
              <span className="text-slate-400"> /mo saved</span>
            </span>
          )}
        </div>
      </button>

      <div className="px-3.5 pb-3.5">
        {skill.status === 'approved' ? (
          <button
            onClick={() => onAdopt(skill)}
            className={`w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              adopted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {adopted ? <Check size={13} /> : <Plus size={13} />}
            {adopted ? 'Adopted' : 'Adopt'}
          </button>
        ) : (
          // A skill still in the gate can't be adopted — say why rather than
          // showing a disabled button with no explanation.
          <div className="w-full rounded-lg border border-dashed border-slate-200 px-3 py-1.5 text-center text-[11px] text-slate-400">
            {skill.status === 'in_review' ? 'Awaiting compliance review' : 'Blocked by compliance'}
          </div>
        )}
      </div>
    </div>
  )
}
