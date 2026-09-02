'use client'
// The builder's side of the gate.
//
// The scan runs *before* submission, not after, and its findings are shown to
// the builder. The point is that an obvious problem — a hardcoded endpoint, a
// customer's email left in an example — gets fixed by the person who can fix
// it fastest, instead of costing a review cycle.
//
// Raw inputs + Tailwind, following components/integrations/sentinel-connect-
// wizard.tsx. react-hook-form and zod are in package.json but imported
// nowhere in this codebase, and there are no form primitives in components/ui.
import { useState } from 'react'
import { AlertTriangle, ArrowLeft, Check, ScanSearch, Send } from 'lucide-react'
import { scanDraft } from '@/lib/marketplace/scan-draft'
import { blockingFindings, scanVerdict } from '@/lib/marketplace/derive'
import { CATEGORY_LABELS, CURRENT_VIEWER } from '@/lib/marketplace/types'
import type { MarketplaceSkill, ScanReport, SkillCategory } from '@/lib/marketplace/types'
import { ScanPanel } from './scan-panel'

export interface Draft {
  name: string
  purpose: string
  whenToUse: string
  category: SkillCategory
  team: string
  exampleInput: string
  body: string
}

const EMPTY: Draft = {
  name: '',
  purpose: '',
  whenToUse: '',
  category: 'claims',
  team: CURRENT_VIEWER.team,
  exampleInput: '',
  body: '',
}

/** Field-level errors, keyed by field. Empty object means valid. */
export function validateDraft(d: Draft): Partial<Record<keyof Draft, string>> {
  const errors: Partial<Record<keyof Draft, string>> = {}
  if (d.name.trim().length < 3) errors.name = 'Give it a name people would search for'
  if (d.purpose.trim().length < 10) errors.purpose = 'One line: what does it do?'
  if (d.body.trim().length < 20) errors.body = 'Paste the skill itself so it can be scanned'
  if (d.team.trim() === '') errors.team = 'Which team is this from?'
  return errors
}

/** Draft → the record that enters the queue. */
export function draftToSkill(d: Draft, scan: ScanReport, today: string): MarketplaceSkill {
  return {
    id: `submitted-${today}-${d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 32)}`,
    name: d.name.trim(),
    purpose: d.purpose.trim(),
    whenToUse: d.whenToUse
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean),
    exampleInput: d.exampleInput.trim(),
    category: d.category,
    builder: CURRENT_VIEWER.name,
    sourceTeam: d.team.trim(),
    version: '0.1',
    submittedAt: today,
    status: 'in_review',
    reviewer: 'Davy · Security & Compliance',
    note: 'Submitted for compliance review',
    adopters: 0,
    reachable: 0,
    reuseTeams: 0,
    suggestedTeams: [],
    usesThisMonth: 0,
    minutesSavedPerUse: 0,
    scan,
    reviews: [],
  }
}

const labelCls = 'block text-[11px] font-semibold uppercase tracking-wide text-slate-600 mb-1'
const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-300'

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
      {error ? (
        <p className="text-[11px] text-red-600 mt-1">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-slate-400 mt-1">{hint}</p>
      ) : null}
    </div>
  )
}

export function SubmitForm({ onSubmit }: { onSubmit: (skill: MarketplaceSkill) => void }) {
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({})
  const [scan, setScan] = useState<ScanReport | null>(null)
  const [done, setDone] = useState<string | null>(null)

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }))

  function runScan() {
    const found = validateDraft(draft)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setScan(scanDraft(draft.body))
  }

  function confirm() {
    if (!scan) return
    const today = new Date().toISOString().slice(0, 10)
    onSubmit(draftToSkill(draft, scan, today))
    setDone(draft.name.trim())
    setDraft(EMPTY)
    setScan(null)
  }

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
        <Check size={20} className="mx-auto text-emerald-600" />
        <h3 className="text-sm font-semibold text-emerald-900 mt-2">
          “{done}” is in the review queue
        </h3>
        <p className="text-xs text-emerald-800/80 mt-1 max-w-md mx-auto leading-relaxed">
          Security &amp; compliance sign-off is the one human step. Once approved it appears in
          Browse and gets matched to the teams it would help.
        </p>
        <button
          onClick={() => setDone(null)}
          className="mt-3 rounded-lg bg-white border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
        >
          Submit another
        </button>
      </div>
    )
  }

  // Step 2: the builder reviews their own scan before anything is queued.
  if (scan) {
    const blockers = blockingFindings(scan)
    const clean = scanVerdict(scan) === 'ok'
    return (
      <div className="space-y-3 max-w-2xl">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Scan before you submit</h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            {clean
              ? 'Nothing flagged. Submitting sends it straight to the compliance gate.'
              : 'Fixing these now is faster than a review round-trip — but you can submit as-is and let the reviewer decide.'}
          </p>
        </div>

        <ScanPanel scan={scan} />

        {blockers.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 flex gap-2">
            <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-900 leading-snug">
              {blockers.length} finding{blockers.length === 1 ? '' : 's'} the reviewer will ask
              about. Editing the skill body to remove hardcoded endpoints and real customer data
              usually clears them.
            </p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScan(null)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={13} />
            Back to edit
          </button>
          <button
            onClick={confirm}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
          >
            <Send size={13} />
            Submit for review
          </button>
        </div>
      </div>
    )
  }

  // Step 1: describe it.
  return (
    <div className="space-y-3 max-w-2xl">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Share a skill</h3>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
          Everything here is what a colleague in another office needs to decide whether your skill
          solves their problem. It is scanned before it reaches the reviewer.
        </p>
      </div>

      <Field label="Name" error={errors.name}>
        <input
          className={inputCls}
          value={draft.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Renewal follow-up drafter"
        />
      </Field>

      <Field label="What it does" error={errors.purpose} hint="One line, as it appears on the card.">
        <input
          className={inputCls}
          value={draft.purpose}
          onChange={(e) => set('purpose', e.target.value)}
          placeholder="Drafts a follow-up for an unanswered renewal quote"
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Category">
          <select
            className={inputCls}
            value={draft.category}
            onChange={(e) => set('category', e.target.value as SkillCategory)}
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Team" error={errors.team}>
          <input className={inputCls} value={draft.team} onChange={(e) => set('team', e.target.value)} />
        </Field>
      </div>

      <Field label="When to use it" hint="One per line.">
        <textarea
          className={`${inputCls} min-h-[70px] resize-y`}
          value={draft.whenToUse}
          onChange={(e) => set('whenToUse', e.target.value)}
          placeholder={'Chasing a renewal quote with no reply\nPreparing a broker follow-up batch'}
        />
      </Field>

      <Field label="Example input" hint="Shown on the detail view so people can see the shape of it.">
        <textarea
          className={`${inputCls} min-h-[60px] resize-y font-mono text-[12px]`}
          value={draft.exampleInput}
          onChange={(e) => set('exampleInput', e.target.value)}
          placeholder="Draft a follow-up for policy 993-A, quoted 14 days ago, no response."
        />
      </Field>

      <Field
        label="The skill itself"
        error={errors.body}
        hint="Paste the prompt, instructions or project config. This is what gets scanned."
      >
        <textarea
          className={`${inputCls} min-h-[130px] resize-y font-mono text-[12px]`}
          value={draft.body}
          onChange={(e) => set('body', e.target.value)}
          placeholder="You are a renewals assistant for Group Induver…"
        />
      </Field>

      <button
        onClick={runScan}
        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800"
      >
        <ScanSearch size={14} />
        Scan &amp; continue
      </button>
    </div>
  )
}
