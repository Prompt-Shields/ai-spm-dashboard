// Parent section that fetches /api/tour-engagement?aggregate=funnel
// and renders one TourFunnelCard per tour. Hosts the title + filter
// row at the top.
//
// Client component because we fetch on demand (the dashboard's other
// pages use a similar pattern — see use-case-graph.tsx).

"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TourFunnelCard, type TourFunnelRow } from "@/components/tour-funnel-card"
import { Calendar, Loader2, AlertCircle, BookOpen } from "lucide-react"

type Range = "7d" | "30d" | "90d" | "all"

const RANGE_LABELS: Record<Range, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  all: "All time"
}

export function TourFunnelSection() {
  const [range, setRange] = useState<Range>("30d")
  const [rows, setRows] = useState<TourFunnelRow[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const queryString = useMemo(() => {
    const params = new URLSearchParams({ aggregate: "funnel" })
    if (range !== "all") {
      const days = range === "7d" ? 7 : range === "30d" ? 30 : 90
      const from = new Date()
      from.setDate(from.getDate() - days)
      params.set("fromDay", from.toISOString().slice(0, 10))
    }
    return params.toString()
  }, [range])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/tour-engagement?${queryString}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const data = await r.json()
        if (!cancelled) {
          setRows(data.funnel ?? [])
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
  }, [queryString])

  const totalStarts = rows?.reduce((acc, r) => acc + r.startCount, 0) ?? 0
  const totalCompletions = rows?.reduce((acc, r) => acc + r.completionCount, 0) ?? 0
  const overallRate = totalStarts > 0
    ? Math.round((totalCompletions / totalStarts) * 100)
    : 0

  return (
    <div className="space-y-4">
      {/* Header + filter */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-500" />
            Guided tour engagement
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            How employees are working through the in-app tours emitted by Promptly.
          </p>
        </div>
        <RangeFilter value={range} onChange={setRange} />
      </div>

      {/* Roll-up summary */}
      {rows && rows.length > 0 && (
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="py-3 px-4 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-2">
              <Calendar size={12} className="text-slate-400" />
              <span>{RANGE_LABELS[range]}</span>
            </span>
            <span className="flex items-center gap-4">
              <SummaryStat label="Tours started" value={totalStarts} />
              <SummaryStat label="Completed" value={totalCompletions} />
              <SummaryStat label="Completion rate" value={`${overallRate}%`} accent />
            </span>
          </CardContent>
        </Card>
      )}

      {/* Cards / loading / empty / error states */}
      {loading && <LoadingState />}

      {error && <ErrorState message={error} />}

      {!loading && !error && rows && rows.length === 0 && <EmptyState />}

      {!loading && rows && rows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rows.map((row) => (
            <TourFunnelCard key={row.tourId} row={row} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Subcomponents ──────────────────────────────────────────────────────

function RangeFilter({
  value,
  onChange
}: {
  value: Range
  onChange: (next: Range) => void
}) {
  const options: Range[] = ["7d", "30d", "90d", "all"]
  return (
    <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
      {options.map((opt) => (
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

function SummaryStat({
  label,
  value,
  accent
}: {
  label: string
  value: number | string
  accent?: boolean
}) {
  return (
    <span className="flex items-baseline gap-1">
      <span className="text-slate-500">{label}</span>
      <span
        className={
          accent
            ? "font-mono font-semibold text-indigo-600 tabular-nums"
            : "font-mono font-semibold text-slate-800 tabular-nums"
        }
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
    </span>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12 text-slate-400 text-sm gap-2">
      <Loader2 size={14} className="animate-spin" />
      Loading tour engagement…
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="py-3 px-4 flex items-center gap-2 text-xs text-amber-700">
        <AlertCircle size={14} />
        Couldn't load tour engagement: {message}
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <Card className="border-dashed border-slate-300 bg-white">
      <CardContent className="py-10 text-center space-y-2">
        <div className="text-slate-400">
          <BookOpen size={24} className="mx-auto" />
        </div>
        <p className="text-sm font-medium text-slate-700">No tour data yet</p>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          As Promptly users go through the in-app tours, engagement metrics show
          up here. Data starts flowing the next time the macOS app flushes a
          telemetry batch (typically on quit, sleep, or every 5 minutes).
        </p>
      </CardContent>
    </Card>
  )
}
