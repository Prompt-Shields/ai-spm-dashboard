'use client'

// /ai-spend — interactive in-app AI Spend & ROI route (PRO-51).
//
// Real in-app port of the atlas.ai ai-spend dashboard, rendered from seeded
// demo data (lib/cost-demo.ts) so it stands alone with no backend. The
// centrepiece is the interactive "Return on AI" model: two assumptions
// (engineering hours saved, loaded rate) persisted to localStorage, live
// recomputing the return multiplier, net value and a human-value-vs-spend
// comparison. Content is English-only, consistent with the demo.

import { useEffect, useMemo, useState } from 'react'
import { Coins, TrendingUp, Clock, Plug, Sparkles, PiggyBank, FileCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  COST_SUMMARY,
  COST_TIMESERIES,
  COST_FORECAST,
  COST_BREAKDOWNS,
  PROJECTION,
  SAVINGS_RECOMMENDATIONS,
  TOTAL_POTENTIAL_SAVINGS,
  COMMITMENTS,
  commitmentStatus,
  ROI_DEFAULTS,
  ROI_STORAGE_KEY,
  type CostSource,
  type RoiAssumptions,
  type RecommendationCategory,
  type CommitmentStatus,
} from '@/lib/cost-demo'

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)

const SOURCE_VARIANT: Record<CostSource, 'success' | 'warning' | 'secondary'> = {
  actual: 'success',
  estimated: 'warning',
  mixed: 'secondary',
}
const SOURCE_LABEL: Record<CostSource, string> = {
  actual: 'Actual',
  estimated: 'Estimated',
  mixed: 'Mixed',
}

const CATEGORY_LABEL: Record<RecommendationCategory, string> = {
  'model-routing': 'Model routing',
  commitment: 'Commitment',
  anomaly: 'Anomaly',
  waste: 'Waste',
}

const STATUS_VARIANT: Record<CommitmentStatus, 'success' | 'warning' | 'destructive'> = {
  'on-track': 'success',
  'at-risk': 'warning',
  'over-limit': 'destructive',
}
const STATUS_LABEL: Record<CommitmentStatus, string> = {
  'on-track': 'On track',
  'at-risk': 'At risk',
  'over-limit': 'Over limit',
}
const STATUS_BAR: Record<CommitmentStatus, string> = {
  'on-track': 'bg-emerald-500',
  'at-risk': 'bg-amber-500',
  'over-limit': 'bg-red-500',
}

const monthYear = (iso: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(iso))

type BreakdownTab = 'byVendor' | 'byModel' | 'byMember'
const BREAKDOWN_TABS: { key: BreakdownTab; label: string }[] = [
  { key: 'byVendor', label: 'By vendor' },
  { key: 'byModel', label: 'By model' },
  { key: 'byMember', label: 'By member' },
]

export default function AiSpendPage() {
  const [assumptions, setAssumptions] = useState<RoiAssumptions>(ROI_DEFAULTS)
  const [tab, setTab] = useState<BreakdownTab>('byVendor')

  // Load persisted assumptions once on mount (client-only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(ROI_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<RoiAssumptions>
        setAssumptions((a) => ({
          engHoursSaved: Number.isFinite(parsed.engHoursSaved) ? parsed.engHoursSaved! : a.engHoursSaved,
          loadedRate: Number.isFinite(parsed.loadedRate) ? parsed.loadedRate! : a.loadedRate,
        }))
      }
    } catch {
      /* ignore malformed storage */
    }
  }, [])

  // Persist on every change.
  useEffect(() => {
    try {
      localStorage.setItem(ROI_STORAGE_KEY, JSON.stringify(assumptions))
    } catch {
      /* storage may be unavailable (private mode) */
    }
  }, [assumptions])

  const roi = useMemo(() => {
    const spend = COST_SUMMARY.total // ~monthly spend (30-day window)
    const humanValue = assumptions.engHoursSaved * assumptions.loadedRate
    const netValue = humanValue - spend
    const multiplier = spend > 0 ? humanValue / spend : 0
    const max = Math.max(humanValue, spend, 1)
    return { spend, humanValue, netValue, multiplier, max }
  }, [assumptions])

  const maxDay = useMemo(
    () => Math.max(...COST_TIMESERIES.map((p) => p.amount), ...COST_FORECAST.map((p) => p.amount), 1),
    [],
  )
  const breakdown = COST_BREAKDOWNS[tab]

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">AI Spend</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          AI vendor &amp; model spend across the organisation over the last {COST_SUMMARY.windowDays} days — with
          savings recommendations, a spend forecast, commitment tracking and an interactive return-on-AI model.
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <SummaryCard
          icon={<Coins size={15} />}
          label="Total spend"
          value={usd(COST_SUMMARY.total)}
          sub={`${COST_SUMMARY.windowDays}-day window`}
          accent="text-indigo-600"
        />
        <SummaryCard
          icon={<TrendingUp size={15} />}
          label="Actual vs estimated"
          value={`${usd(COST_SUMMARY.actual)}`}
          sub={`${usd(COST_SUMMARY.estimated)} estimated`}
          accent="text-emerald-600"
        />
        <SummaryCard
          icon={<Clock size={15} />}
          label="Provisional"
          value={usd(COST_SUMMARY.provisional)}
          sub="Still settling"
          accent="text-amber-600"
        />
        <SummaryCard
          icon={<Plug size={15} />}
          label="Active connectors"
          value={String(COST_SUMMARY.activeConnectors)}
          sub="Reporting cost"
          accent="text-slate-900"
        />
      </div>

      {/* Savings recommendations */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <PiggyBank size={15} className="text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Savings recommendations</h2>
          </div>
          <div className="text-xs text-slate-500">
            Potential annual savings{' '}
            <span className="font-bold text-emerald-600">{usd(TOTAL_POTENTIAL_SAVINGS)}</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Specific, actionable ways to reduce AI spend, surfaced from usage and commitment data.
        </p>
        <div className="divide-y divide-slate-100">
          {SAVINGS_RECOMMENDATIONS.map((rec) => (
            <div key={rec.id} className="flex items-start gap-3 py-3">
              <Badge variant={rec.category === 'anomaly' ? 'warning' : 'secondary'} className="mt-0.5 shrink-0">
                {CATEGORY_LABEL[rec.category]}
              </Badge>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800">{rec.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{rec.detail}</div>
              </div>
              <span
                className={`shrink-0 text-xs font-semibold rounded-full px-2.5 py-1 ${
                  rec.estAnnualSaving ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}
              >
                {rec.estAnnualSaving ? `Save ${usd(rec.estAnnualSaving)}/yr` : 'Review'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ROI centrepiece */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={15} className="text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">Return on AI</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Estimate the value AI creates against what it costs. Adjust the assumptions — they&apos;re saved on this device.
        </p>

        <div className="grid md:grid-cols-[260px_1fr] gap-6">
          {/* Assumptions */}
          <div className="space-y-4">
            <AssumptionInput
              label="Engineering hours saved / month"
              value={assumptions.engHoursSaved}
              onChange={(v) => setAssumptions((a) => ({ ...a, engHoursSaved: v }))}
              min={0}
              step={10}
            />
            <AssumptionInput
              label="Loaded rate ($/hour)"
              value={assumptions.loadedRate}
              onChange={(v) => setAssumptions((a) => ({ ...a, loadedRate: v }))}
              min={0}
              step={5}
              prefix="$"
            />
            <button
              onClick={() => setAssumptions(ROI_DEFAULTS)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              Reset to defaults
            </button>
          </div>

          {/* Outcome */}
          <div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <Metric label="Return on AI" value={`${roi.multiplier.toFixed(1)}×`} accent="text-indigo-600" big />
              <Metric label="Net value / month" value={usd(roi.netValue)} accent={roi.netValue >= 0 ? 'text-emerald-600' : 'text-red-500'} big />
              <Metric label="Value created" value={usd(roi.humanValue)} accent="text-slate-900" big />
            </div>

            {/* Comparison bars */}
            <div className="space-y-3">
              <CompareBar label="Human value created" amount={roi.humanValue} max={roi.max} color="bg-emerald-500" />
              <CompareBar label="AI spend" amount={roi.spend} max={roi.max} color="bg-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Daily spend */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900">Daily spend &amp; forecast</h2>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-indigo-500" /> Settled</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-indigo-200" /> Provisional</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-indigo-50 border border-dashed border-indigo-300" /> Forecast</span>
          </div>
        </div>
        <div className="flex items-end gap-[3px] h-32">
          {COST_TIMESERIES.map((p) => (
            <div key={p.date} className="flex-1 group relative flex items-end h-full" title={`${p.date}: ${usd(p.amount)}${p.provisional ? ' (provisional)' : ''}`}>
              <div
                className={`w-full rounded-t-sm ${p.provisional ? 'bg-indigo-200' : 'bg-indigo-500'}`}
                style={{ height: `${Math.max((p.amount / maxDay) * 100, 2)}%` }}
              />
            </div>
          ))}
          <div className="w-px h-full bg-slate-200 mx-0.5" aria-hidden />
          {COST_FORECAST.map((p) => (
            <div key={p.date} className="flex-1 group relative flex items-end h-full" title={`${p.date}: ${usd(p.amount)} (forecast)`}>
              <div
                className="w-full rounded-t-sm bg-indigo-50 border border-dashed border-indigo-300"
                style={{ height: `${Math.max((p.amount / maxDay) * 100, 2)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-2">
          <span>{COST_TIMESERIES[0]?.date}</span>
          <span>{COST_FORECAST[COST_FORECAST.length - 1]?.date}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Metric label="Projected month-end spend" value={usd(PROJECTION.monthEnd)} accent="text-indigo-600" />
          <Metric label="Projected annual run-rate" value={usd(PROJECTION.annualRunRate)} accent="text-slate-900" />
        </div>
      </div>

      {/* Breakdowns */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-1 px-3 pt-3 border-b border-slate-100">
          {BREAKDOWN_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors ${
                tab === t.key ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Source</th>
              <th className="px-4 py-2 font-medium w-1/3">Share</th>
              <th className="px-4 py-2 font-medium text-right">Spend</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((row) => (
              <tr key={row.label} className="border-t border-slate-100">
                <td className="px-4 py-2.5 font-medium text-slate-800">{row.label}</td>
                <td className="px-4 py-2.5">
                  <Badge variant={SOURCE_VARIANT[row.source]}>{SOURCE_LABEL[row.source]}</Badge>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.round(row.share * 100)}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 tabular-nums w-9 text-right">{Math.round(row.share * 100)}%</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-800">{usd(row.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Commitments */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mt-6">
        <div className="flex items-center gap-2 mb-1">
          <FileCheck size={15} className="text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">Commitments</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Actual spend against every committed usage agreement, with projected annual consumption per provider.
        </p>
        <div className="space-y-5">
          {COMMITMENTS.map((c) => {
            const status = commitmentStatus(c)
            const usedShare = Math.min(c.usedToDate / c.annualCommitment, 1)
            const remaining = Math.max(c.annualCommitment - c.usedToDate, 0)
            return (
              <div key={c.provider}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">{c.provider}</span>
                    <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
                  </div>
                  <span className="text-xs text-slate-500">
                    Projected <span className={`font-semibold ${status === 'over-limit' ? 'text-red-600' : 'text-slate-800'}`}>{usd(c.projectedAnnual)}</span> of {usd(c.annualCommitment)} committed
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${STATUS_BAR[status]}`}
                    style={{ width: `${Math.max(usedShare * 100, 1)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
                  <span>
                    {usd(c.usedToDate)} used · {usd(remaining)} remaining
                  </span>
                  <span>Renews {monthYear(c.renewalDate)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  accent: string
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 uppercase tracking-wide mb-1.5">
        <span className="text-slate-300">{icon}</span>
        {label}
      </div>
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
      <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>
    </div>
  )
}

function Metric({ label, value, accent, big }: { label: string; value: string; accent: string; big?: boolean }) {
  return (
    <div className="bg-slate-50 rounded-lg px-3 py-2.5">
      <div className="text-[11px] text-slate-400 uppercase tracking-wide mb-0.5">{label}</div>
      <div className={`font-bold ${big ? 'text-xl' : 'text-base'} ${accent}`}>{value}</div>
    </div>
  )
}

function CompareBar({ label, amount, max, color }: { label: string; amount: number; max: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-800 tabular-nums">{usd(amount)}</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max((amount / max) * 100, 1)}%` }} />
      </div>
    </div>
  )
}

function AssumptionInput({
  label,
  value,
  onChange,
  min,
  step,
  prefix,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  step?: number
  prefix?: string
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 mb-1">{label}</span>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">{prefix}</span>}
        <input
          type="number"
          inputMode="numeric"
          min={min}
          step={step}
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
          className={`w-full rounded-lg border border-slate-200 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none ${
            prefix ? 'pl-7 pr-3' : 'px-3'
          }`}
        />
      </div>
    </label>
  )
}
