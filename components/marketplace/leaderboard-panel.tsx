'use client'
// Who to invest in. Ranked on teams reached rather than skills contributed:
// one skill nine teams rely on is worth more to the organisation than five
// nobody picked up, and the ordering is the recommendation.
import { Award, TrendingUp } from 'lucide-react'
import type { Builder } from '@/lib/marketplace/types'

const MEDAL = ['text-amber-500', 'text-slate-400', 'text-amber-700']

export function LeaderboardPanel({ builders }: { builders: Builder[] }) {
  if (builders.length === 0) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
          <Award size={14} className="text-slate-400" />
          Top builders
        </h3>
        <span className="text-[10px] text-slate-400">ranked by teams reached</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {builders.map((b, i) => (
          <li key={b.name} className="flex items-center gap-3 px-3.5 py-2.5">
            <span
              className={`w-5 shrink-0 text-center text-xs font-bold tabular-nums ${MEDAL[i] ?? 'text-slate-300'}`}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-slate-800 truncate">{b.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{b.team}</div>
            </div>
            <div className="shrink-0 flex items-center gap-3 text-[11px]">
              <span className="text-slate-500">
                <span className="tabular-nums font-medium text-slate-700">{b.teamsReached}</span> teams
              </span>
              <span className="text-slate-500 hidden sm:inline">
                <span className="tabular-nums font-medium text-slate-700">{b.skills}</span>{' '}
                skill{b.skills === 1 ? '' : 's'}
              </span>
              <span className="inline-flex items-center gap-0.5 text-emerald-600" title="avg quality-score lift for adopters">
                <TrendingUp size={11} />
                <span className="tabular-nums font-medium">+{b.avgScoreLift}</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
