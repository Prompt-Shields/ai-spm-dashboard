'use client'
// The whole /marketplace page.
//
// One surface, two audiences. An employee browses and adopts; a reviewer works
// the queue. They share a catalogue and a scan format on purpose — the thing
// an employee sees on a skill's detail view is the same evidence the reviewer
// approved it against.
//
// State is the localStorage overrides map from lib/marketplace/store.ts folded
// over the immutable seeded catalogue, so a reload keeps your adoptions and a
// reset clears them. The /adoption tab reads the baseline instead (it renders
// during SSR, where this state doesn't exist).
import { useEffect, useMemo, useState } from 'react'
import {
  Banknote,
  Clock3,
  Compass,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  TimerReset,
  Upload,
  Users,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MARKETPLACE_SKILLS } from '@/lib/marketplace/data'
import {
  leaderboard,
  marketplaceRoi,
  reviewQueueSkills,
  searchSkills,
  suggestedFor,
} from '@/lib/marketplace/derive'
import { hours, money } from '@/lib/marketplace/format'
import {
  EMPTY_STATE,
  adopt,
  applyOverrides,
  clearState,
  decide,
  getState,
  submit,
  unadopt,
} from '@/lib/marketplace/store'
import type { MarketplaceState, ReviewDecision } from '@/lib/marketplace/store'
import { CATEGORY_LABELS, CURRENT_VIEWER } from '@/lib/marketplace/types'
import type { MarketplaceSkill, ReviewStatus, SkillCategory } from '@/lib/marketplace/types'
import { LeaderboardPanel } from './leaderboard-panel'
import { ReviewQueue } from './review-queue'
import { SkillCard } from './skill-card'
import { SkillDrawer } from './skill-drawer'
import { SubmitForm } from './submit-form'

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-500">
        <Icon size={12} className="text-slate-400" />
        {label}
      </div>
      <div className="mt-1 text-xl font-bold tabular-nums text-slate-900">{value}</div>
      <div className="text-[11px] text-slate-400 leading-snug mt-0.5">{hint}</div>
    </div>
  )
}

const selectCls =
  'rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400'

export function MarketplaceSection() {
  // Start from the baseline so server and first client render agree; the
  // stored state is folded in after mount.
  const [state, setState] = useState<MarketplaceState>(EMPTY_STATE)
  // The suggestion strip is computed against what you had adopted when the
  // page loaded, not what you have adopted since. Recomputing live would make
  // a card vanish the instant you clicked Adopt on it — no confirmation, and
  // the remaining cards jump. Already-adopted skills still drop off next visit.
  const [adoptedAtLoad, setAdoptedAtLoad] = useState<string[]>([])
  const [open, setOpen] = useState<MarketplaceSkill | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<SkillCategory | 'all'>('all')
  const [status, setStatus] = useState<ReviewStatus | 'all'>('all')

  useEffect(() => {
    const stored = getState()
    setState(stored)
    setAdoptedAtLoad(stored.adopted)
  }, [])

  const skills = useMemo(() => applyOverrides(state, MARKETPLACE_SKILLS), [state])
  const roi = useMemo(() => marketplaceRoi(skills), [skills])
  const suggested = useMemo(
    () => suggestedFor(CURRENT_VIEWER.team, skills, adoptedAtLoad).slice(0, 3),
    [skills, adoptedAtLoad],
  )
  const results = useMemo(
    () => searchSkills(skills, query, { category, status }),
    [skills, query, category, status],
  )
  // Which skills belong on this screen is decided by their *baseline* status,
  // not their current one. Deciding on a skill flips it to approved/blocked,
  // and filtering on the live status would delete the card the instant it was
  // acted on — so the reviewer never sees the audit line for what they just
  // did. They stay put, showing the decision, until the page is reloaded.
  const queueIds = useMemo(
    () => new Set(reviewQueueSkills([...MARKETPLACE_SKILLS, ...state.submitted]).map((s) => s.id)),
    [state.submitted],
  )
  const queue = useMemo(
    () =>
      skills
        .filter((s) => queueIds.has(s.id))
        .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt)),
    [skills, queueIds],
  )
  const undecided = queue.filter((s) => !state.decisions[s.id]).length
  const builders = useMemo(() => leaderboard(skills).slice(0, 5), [skills])

  const isAdopted = (s: MarketplaceSkill) => state.adopted.includes(s.id)

  function toggleAdopt(skill: MarketplaceSkill) {
    setState((s) => (s.adopted.includes(skill.id) ? unadopt(s, skill.id) : adopt(s, skill.id)))
  }

  function handleDecide(id: string, decision: ReviewDecision) {
    setState((s) => decide(s, id, decision))
  }

  function handleSubmit(skill: MarketplaceSkill) {
    setState((s) => submit(s, skill))
  }

  const filtered = query.trim() !== '' || category !== 'all' || status !== 'all'
  const hasLocalChanges =
    state.adopted.length > 0 ||
    state.submitted.length > 0 ||
    Object.keys(state.decisions).length > 0

  return (
    <Tabs defaultValue="browse" className="gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <TabsList className="bg-slate-100 h-auto p-1 flex-nowrap">
          <TabsTrigger value="browse" className="text-xs gap-1.5 px-3 py-1.5">
            <Compass size={13} />
            Browse
          </TabsTrigger>
          <TabsTrigger value="submit" className="text-xs gap-1.5 px-3 py-1.5">
            <Upload size={13} />
            Submit
          </TabsTrigger>
          <TabsTrigger value="review" className="text-xs gap-1.5 px-3 py-1.5">
            <ShieldCheck size={13} />
            Review
            {undecided > 0 && (
              <span className="ml-0.5 rounded-full bg-amber-100 text-amber-700 px-1.5 text-[10px] font-semibold tabular-nums">
                {undecided}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {hasLocalChanges && (
          <button
            onClick={() => setState(clearState())}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-50"
            title="Clear adoptions, submissions and decisions made in this browser"
          >
            <RotateCcw size={12} />
            Reset demo state
          </button>
        )}
      </div>

      {/* ── Browse ─────────────────────────────────────────────────────── */}
      <TabsContent value="browse" className="space-y-5">
        <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-4">
          <Kpi
            icon={Store}
            label="Shareable"
            value={`${roi.skills}`}
            hint={`approved of ${skills.length} catalogued`}
          />
          <Kpi
            icon={Users}
            label="Adopters"
            value={roi.adopters.toLocaleString('en-GB')}
            hint="people using an approved skill"
          />
          <Kpi
            icon={TimerReset}
            label="Hours saved"
            value={hours(roi.hours)}
            hint="per month, quality-weighted"
          />
          <Kpi
            icon={Banknote}
            label="Value"
            value={money(roi.value)}
            hint="per month at the blended rate"
          />
        </div>

        {suggested.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={14} className="text-indigo-500" />
              <h2 className="text-sm font-semibold text-slate-900">
                Suggested for {CURRENT_VIEWER.team}
              </h2>
              <span className="text-[11px] text-slate-400">
                approved skills matched to your team
              </span>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {suggested.map((s) => (
                <SkillCard
                  key={s.id}
                  skill={s}
                  adopted={isAdopted(s)}
                  onOpen={setOpen}
                  onAdopt={toggleAdopt}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search skills, builders, teams…"
                aria-label="Search skills"
                className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2.5 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SkillCategory | 'all')}
              aria-label="Filter by category"
              className={selectCls}
            >
              <option value="all">All categories</option>
              {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ReviewStatus | 'all')}
              aria-label="Filter by status"
              className={selectCls}
            >
              <option value="all">All statuses</option>
              <option value="approved">Approved</option>
              <option value="in_review">In review</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          {results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
              <Search size={22} className="mx-auto text-slate-300" />
              <h3 className="text-sm font-medium text-slate-700 mt-2">No skills match</h3>
              <p className="text-xs text-slate-400 mt-1">Try a broader search or clear the filters.</p>
              <button
                onClick={() => {
                  setQuery('')
                  setCategory('all')
                  setStatus('all')
                }}
                className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h2 className="text-sm font-semibold text-slate-900">
                  {filtered ? `${results.length} matching` : `All ${results.length} skills`}
                </h2>
                {filtered && (
                  <button
                    onClick={() => {
                      setQuery('')
                      setCategory('all')
                      setStatus('all')
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-800"
                  >
                    Clear filters
                  </button>
                )}
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((s) => (
                  <SkillCard
                    key={s.id}
                    skill={s}
                    adopted={isAdopted(s)}
                    onOpen={setOpen}
                    onAdopt={toggleAdopt}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        <LeaderboardPanel builders={builders} />
      </TabsContent>

      {/* ── Submit ─────────────────────────────────────────────────────── */}
      <TabsContent value="submit">
        <SubmitForm onSubmit={handleSubmit} />
      </TabsContent>

      {/* ── Review ─────────────────────────────────────────────────────── */}
      <TabsContent value="review" className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap text-[11px]">
          <span className="inline-flex items-center gap-1 text-amber-600">
            <Clock3 size={12} />
            {undecided} awaiting a decision
          </span>
          <span className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1 text-emerald-600">
            <ShieldCheck size={12} />
            {roi.skills} approved
          </span>
        </div>
        <ReviewQueue queue={queue} decisions={state.decisions} onDecide={handleDecide} />
      </TabsContent>

      {open && (
        <SkillDrawer
          // Re-read from the folded list so the drawer reflects an adopt made
          // from the card underneath it.
          skill={skills.find((s) => s.id === open.id) ?? open}
          adopted={isAdopted(open)}
          onAdopt={toggleAdopt}
          onClose={() => setOpen(null)}
        />
      )}
    </Tabs>
  )
}
