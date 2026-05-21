// One card per tour. Shows the start→completion funnel, a small histogram
// of dismissal reasons, and the average completion duration. Companion
// `<TourFunnelSection />` (in tour-funnel-section.tsx) fetches the
// /api/tour-engagement?aggregate=funnel response and renders one card
// per row.
//
// Designed to match the existing KpiCard / ComplianceCoverageCard look —
// rounded card, slate text, indigo accents, no inline shadow.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, X, Keyboard, MousePointerClick } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface TourFunnelRow {
  tourId: string
  startCount: number
  completionCount: number
  dismissalsTotal: number
  dismissalsByReason: Record<string, number>
  averageCompletionDurationSec: number
}

// Friendly labels for the tour ids the macOS app emits. Falls back to
// the raw id (sentence-cased) for any tour the dashboard doesn't have
// a mapping for yet.
const TOUR_LABELS: Record<string, string> = {
  "dashboard-intro": "Dashboard tour",
  "chat-intro": "Promptly Chat tour",
  "activity-log-intro": "Activity Log tour",
  "settings-intro": "Settings tour"
}

const REASON_LABELS: Record<string, string> = {
  skip_button: "Skip button",
  esc: "Esc key",
  click_outside: "Clicked outside"
}

const REASON_ICONS: Record<string, LucideIcon> = {
  skip_button: X,
  esc: Keyboard,
  click_outside: MousePointerClick
}

export function TourFunnelCard({ row }: { row: TourFunnelRow }) {
  const label = TOUR_LABELS[row.tourId] ?? sentenceCase(row.tourId)
  const completionPct = row.startCount > 0
    ? Math.round((row.completionCount / row.startCount) * 100)
    : 0
  const avgDurationLabel = row.completionCount > 0
    ? formatDuration(row.averageCompletionDurationSec)
    : "—"

  const sortedReasons = Object.entries(row.dismissalsByReason)
    .sort((a, b) => b[1] - a[1])

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-900 flex items-center justify-between">
          <span>{label}</span>
          <span className="font-mono text-xs text-slate-400">{row.tourId}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {/* Headline funnel */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Starts" value={row.startCount} />
          <Stat
            label="Completions"
            value={row.completionCount}
            sub={row.startCount > 0 ? `${completionPct}%` : undefined}
            accent
          />
          <Stat
            label="Dismissals"
            value={row.dismissalsTotal}
            sub={row.startCount > 0
              ? `${Math.round((row.dismissalsTotal / row.startCount) * 100)}%`
              : undefined}
          />
        </div>

        {/* Completion bar */}
        {row.startCount > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Completion rate</span>
              <span className="font-mono">{completionPct}%</span>
            </div>
            <Progress value={completionPct} className="h-1.5" />
          </div>
        )}

        {/* Dismissal reason histogram */}
        {sortedReasons.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Why people leave
            </div>
            {sortedReasons.map(([reason, count]) => {
              const Icon = REASON_ICONS[reason] ?? X
              const pct = row.dismissalsTotal > 0
                ? Math.round((count / row.dismissalsTotal) * 100)
                : 0
              return (
                <div key={reason} className="flex items-center gap-2 text-xs">
                  <Icon size={12} className="text-slate-400 shrink-0" />
                  <span className="text-slate-600 w-28 truncate">
                    {REASON_LABELS[reason] ?? sentenceCase(reason)}
                  </span>
                  <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-mono text-slate-500 tabular-nums w-10 text-right">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Average duration */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1 border-t border-slate-100">
          <TrendingUp size={12} className="text-emerald-500" />
          <span>Avg completion time</span>
          <span className="font-mono text-slate-700 ml-auto">{avgDurationLabel}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────

function Stat({
  label,
  value,
  sub,
  accent
}: {
  label: string
  value: number
  sub?: string
  accent?: boolean
}) {
  return (
    <div>
      <div
        className={
          accent
            ? "text-2xl font-semibold text-indigo-600 tabular-nums"
            : "text-2xl font-semibold text-slate-900 tabular-nums"
        }
      >
        {value.toLocaleString()}
      </div>
      <div className="text-[11px] text-slate-500 mt-0.5 flex items-baseline gap-1.5">
        <span>{label}</span>
        {sub && <span className="font-mono text-[10px] text-slate-400">{sub}</span>}
      </div>
    </div>
  )
}

function sentenceCase(s: string): string {
  return s
    .replace(/[-_]+/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${Math.round(sec)}s`
  const minutes = Math.floor(sec / 60)
  const seconds = Math.round(sec % 60)
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`
}
