// /adoption page parent for the non-tour tiles. Owns the fetch +
// range filter, hands the response down to three sibling cards:
//   - <AdoptionOverviewCard /> (DAU / MAU / total prompts)
//   - <TopAppsCard />          (per-app prompt + risk breakdown)
//   - <RiskByAppCard />        (policy action mix per app)
//
// Companion to <TourFunnelSection /> — same range-filter affordance,
// same loading / error / empty states. They render side-by-side on
// the /adoption page.

"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  Users,
  Calendar,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  ShieldAlert
} from "lucide-react"

type Range = "7d" | "30d" | "90d"

const RANGE_DAYS: Record<Range, number> = { "7d": 7, "30d": 30, "90d": 90 }
const RANGE_LABELS: Record<Range, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days"
}

const APP_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  copilot: "Microsoft Copilot",
  perplexity: "Perplexity",
  notion: "Notion AI"
}

function appLabel(id: string): string {
  if (APP_LABELS[id]) return APP_LABELS[id]
  if (id.startsWith("shadow-")) return `Shadow · ${id.slice(7)}`
  return id
}

interface SummaryResponse {
  window: { fromDay: string; toDay: string }
  overview: {
    totalPrompts: number
    totalEvaluations: number
    dau: number
    mau: number
    daysInWindow: number
  }
  topApps: Array<{
    promptlyAppId: string
    promptCount: number
    blockedCount: number
    redactedCount: number
    flaggedCount: number
    violationCount: number
  }>
  riskByApp: Array<{
    promptlyAppId: string
    block: number
    redact: number
    flag: number
    log: number
    evaluated: number
    total: number
  }>
}

// UTC day key (matches the API, which slices ISO strings).
function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10)
}

// The current window (ending today) plus the equal-length window that
// immediately precedes it, used for the "vs prior N days" comparison.
function buildWindows(days: number): {
  current: { fromDay: string; toDay: string }
  prior: { fromDay: string; toDay: string }
} {
  const today = new Date()
  const curTo = new Date(today)
  const curFrom = new Date(today)
  curFrom.setDate(today.getDate() - (days - 1))
  const priTo = new Date(curFrom)
  priTo.setDate(curFrom.getDate() - 1)
  const priFrom = new Date(priTo)
  priFrom.setDate(priTo.getDate() - (days - 1))
  return {
    current: { fromDay: isoDay(curFrom), toDay: isoDay(curTo) },
    prior: { fromDay: isoDay(priFrom), toDay: isoDay(priTo) }
  }
}

// Pull the two headline numbers off an overview block.
function heroFigures(overview: SummaryResponse["overview"]): {
  successful: number
  risky: number
} {
  // "Risky" = prompts that tripped a policy (blocked / redacted / flagged).
  // totalEvaluations = totalPrompts + those three counters, so the
  // difference isolates the risky ones without re-summing per app.
  return {
    successful: overview.totalPrompts,
    risky: Math.max(0, overview.totalEvaluations - overview.totalPrompts)
  }
}

export function AdoptionSummarySection() {
  const [range, setRange] = useState<Range>("30d")
  const [data, setData] = useState<SummaryResponse | null>(null)
  const [prior, setPrior] = useState<SummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const windows = useMemo(() => buildWindows(RANGE_DAYS[range]), [range])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const url = (w: { fromDay: string; toDay: string }) =>
      `/api/adoption/summary?${new URLSearchParams({
        fromDay: w.fromDay,
        toDay: w.toDay
      }).toString()}`
    Promise.all([
      fetch(url(windows.current)).then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return (await r.json()) as SummaryResponse
      }),
      fetch(url(windows.prior)).then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return (await r.json()) as SummaryResponse
      })
    ])
      .then(([current, previous]) => {
        if (!cancelled) {
          setData(current)
          setPrior(previous)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [windows])

  return (
    <div className="space-y-4">
      {!loading && !error && data && (
        <HeroMetrics
          current={heroFigures(data.overview)}
          prior={prior ? heroFigures(prior.overview) : null}
          days={RANGE_DAYS[range]}
        />
      )}

      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Activity size={16} className="text-indigo-500" />
            Adoption overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active usage and which AI tools and vendors are being reached for,
            from the same Promptly usage-event feed.
          </p>
        </div>
        <RangeFilter value={range} onChange={setRange} />
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && data && (
        <>
          <AdoptionOverviewCard overview={data.overview} window={data.window} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopAppsCard rows={data.topApps} />
            <RiskByAppCard rows={data.riskByApp} />
          </div>
        </>
      )}
    </div>
  )
}

// ─── Hero metrics band ──────────────────────────────────────────────────
// The two numbers the pitch hangs on: productivity (successful prompts,
// up is good) and risk (risky prompts, down is good). Each shows the
// delta against the immediately preceding window of equal length.

function HeroMetrics({
  current,
  prior,
  days
}: {
  current: { successful: number; risky: number }
  prior: { successful: number; risky: number } | null
  days: number
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <HeroStat
        icon={ShieldCheck}
        tone="positive"
        label="Successful prompts"
        sub="protected and completed"
        value={current.successful}
        prior={prior?.successful ?? null}
        goodDirection="up"
        days={days}
      />
      <HeroStat
        icon={ShieldAlert}
        tone="negative"
        label="Risky prompts"
        sub="blocked, redacted or flagged"
        value={current.risky}
        prior={prior?.risky ?? null}
        goodDirection="down"
        days={days}
      />
    </div>
  )
}

function HeroStat({
  icon: Icon,
  tone,
  label,
  sub,
  value,
  prior,
  goodDirection,
  days
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  tone: "positive" | "negative"
  label: string
  sub: string
  value: number
  prior: number | null
  goodDirection: "up" | "down"
  days: number
}) {
  const pct =
    prior !== null && prior > 0 ? ((value - prior) / prior) * 100 : null
  const isUp = pct !== null && pct > 0
  const isGood =
    pct === null
      ? false
      : goodDirection === "up"
        ? pct > 0
        : pct < 0
  const deltaColor =
    pct === null || pct === 0
      ? "text-slate-400"
      : isGood
        ? "text-emerald-600"
        : "text-red-500"
  const Arrow = isUp ? ArrowUpRight : ArrowDownRight

  return (
    <Card
      className={
        tone === "positive"
          ? "border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-white"
          : "border-amber-100 bg-gradient-to-br from-amber-50/60 to-white"
      }
    >
      <CardContent className="py-5 px-6">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Icon
            size={15}
            className={tone === "positive" ? "text-emerald-500" : "text-amber-500"}
          />
          {label}
        </div>
        <div className="mt-1.5 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-slate-900 tabular-nums">
            {value.toLocaleString()}
          </span>
          {pct !== null && (
            <span
              className={`flex items-center gap-0.5 text-sm font-semibold ${deltaColor}`}
            >
              <Arrow size={15} />
              {Math.abs(pct).toFixed(0)}%
            </span>
          )}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          {sub}
          {pct !== null && (
            <span className="text-slate-400">
              {" · "}
              {goodDirection === "down" && pct < 0 ? "reduction " : ""}vs prior{" "}
              {days} days
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Tiles ──────────────────────────────────────────────────────────────

function AdoptionOverviewCard({
  overview,
  window: win
}: {
  overview: SummaryResponse["overview"]
  window: SummaryResponse["window"]
}) {
  const evaluationsPerPrompt =
    overview.totalPrompts > 0
      ? overview.totalEvaluations / overview.totalPrompts
      : 0
  return (
    <Card className="border-slate-200">
      <CardContent className="py-4 px-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BigStat
          icon={Users}
          label="Daily active users"
          value={overview.dau}
          sub="most-recent day with traffic"
        />
        <BigStat
          icon={Calendar}
          label="Monthly active users"
          value={overview.mau}
          sub={`across ${overview.daysInWindow} days`}
        />
        <BigStat
          icon={Sparkles}
          label="Prompts protected"
          value={overview.totalPrompts}
          accent
          sub={evaluationsPerPrompt > 0
            ? `${(evaluationsPerPrompt).toFixed(1)}× evaluations per prompt`
            : undefined}
        />
        <div className="hidden lg:flex flex-col justify-center text-xs text-slate-500 gap-1">
          <span className="font-mono">{win.fromDay} → {win.toDay}</span>
          <span>Window pulled from Promptly's daily rollups.</span>
        </div>
      </CardContent>
    </Card>
  )
}

function TopAppsCard({ rows }: { rows: SummaryResponse["topApps"] }) {
  const max = Math.max(1, ...rows.map((r) => r.promptCount + r.violationCount))
  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-900">
          AI tools by usage
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {rows.length === 0 && (
          <p className="text-xs text-slate-500 py-2">
            No prompts recorded yet in this window.
          </p>
        )}
        <div className="space-y-2">
          {rows.map((r) => {
            const total = r.promptCount + r.violationCount
            const pct = Math.round((total / max) * 100)
            return (
              <div key={r.promptlyAppId} className="space-y-0.5">
                <div className="flex items-center justify-between text-xs text-slate-700">
                  <span className="font-medium truncate">{appLabel(r.promptlyAppId)}</span>
                  <span className="font-mono text-slate-500 tabular-nums">
                    {r.promptCount.toLocaleString()} prompts
                  </span>
                </div>
                <Progress value={pct} className="h-1.5" />
                {(r.violationCount > 0 || r.blockedCount > 0 || r.redactedCount > 0) && (
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-0.5">
                    {r.blockedCount > 0 && <span>{r.blockedCount} blocked</span>}
                    {r.redactedCount > 0 && <span>{r.redactedCount} redacted</span>}
                    {r.flaggedCount > 0 && <span>{r.flaggedCount} flagged</span>}
                    {r.violationCount > 0 && (
                      <span>{r.violationCount} policy events</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function RiskByAppCard({ rows }: { rows: SummaryResponse["riskByApp"] }) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-900">
          Risk actions per app
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {rows.length === 0 && (
          <p className="text-xs text-slate-500 py-2">
            No policy events in this window — that's the goal, but it also
            means there's nothing to break out here yet.
          </p>
        )}
        <div className="space-y-2">
          {rows.map((r) => {
            const enforcing = r.block + r.redact + r.flag
            return (
              <div key={r.promptlyAppId} className="space-y-0.5">
                <div className="flex items-center justify-between text-xs text-slate-700">
                  <span className="font-medium truncate">{appLabel(r.promptlyAppId)}</span>
                  <span className="font-mono text-slate-500 tabular-nums">{r.total}</span>
                </div>
                <StackBar
                  segments={[
                    { label: "Block", value: r.block, color: "bg-red-500" },
                    { label: "Redact", value: r.redact, color: "bg-amber-500" },
                    { label: "Flag", value: r.flag, color: "bg-yellow-400" },
                    { label: "Log", value: r.log, color: "bg-slate-400" },
                    { label: "Evaluated", value: r.evaluated, color: "bg-slate-200" }
                  ]}
                />
                {enforcing > 0 && (
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-0.5">
                    {r.block > 0 && <Legend color="bg-red-500" label={`${r.block} block`} />}
                    {r.redact > 0 && <Legend color="bg-amber-500" label={`${r.redact} redact`} />}
                    {r.flag > 0 && <Legend color="bg-yellow-400" label={`${r.flag} flag`} />}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Shared subcomponents ───────────────────────────────────────────────

function BigStat({
  label,
  value,
  sub,
  icon: Icon,
  accent
}: {
  label: string
  value: number
  sub?: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
  accent?: boolean
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-500">
        {Icon && <Icon size={11} className="text-slate-400" />}
        {label}
      </div>
      <div
        className={
          accent
            ? "text-2xl font-semibold text-indigo-600 tabular-nums mt-0.5"
            : "text-2xl font-semibold text-slate-900 tabular-nums mt-0.5"
        }
      >
        {value.toLocaleString()}
      </div>
      {sub && (
        <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>
      )}
    </div>
  )
}

function StackBar({
  segments
}: {
  segments: Array<{ label: string; value: number; color: string }>
}) {
  const total = segments.reduce((acc, s) => acc + s.value, 0)
  if (total === 0) {
    return <div className="h-1.5 bg-slate-100 rounded-full" />
  }
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
      {segments.map((s) => (
        <div
          key={s.label}
          className={s.color}
          style={{ width: `${(s.value / total) * 100}%` }}
          title={`${s.label}: ${s.value}`}
        />
      ))}
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`inline-block w-2 h-2 rounded-sm ${color}`} />
      {label}
    </span>
  )
}

function RangeFilter({
  value,
  onChange
}: {
  value: Range
  onChange: (next: Range) => void
}) {
  return (
    <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
      {(["7d", "30d", "90d"] as Range[]).map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={
            value === opt
              ? "px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-medium"
              : "px-2.5 py-1 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }
        >
          {RANGE_LABELS[opt]}
        </button>
      ))}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12 text-slate-400 text-sm gap-2">
      <Loader2 size={14} className="animate-spin" />
      Loading adoption stats…
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="py-3 px-4 flex items-center gap-2 text-xs text-amber-700">
        <AlertCircle size={14} />
        Couldn't load adoption summary: {message}
      </CardContent>
    </Card>
  )
}
