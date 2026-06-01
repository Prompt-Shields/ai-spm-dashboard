// Server-side store for daily tour-engagement rollups emitted by
// Promptly's macOS app (and future browser/Windows clients). One row
// per (tenant, day, person, tour) tuple — clients send a batch in a
// single POST and the store upserts each row.
//
// Mirrors the usage-events-store pattern. Daily granularity is enough
// for the funnel chart we want on the dashboard (started → completed
// vs dismissed, with per-step exit attribution). Replace with a real
// DB once tenanting + auth wiring lands.

import type { Tag, TenantScoped, Timestamped } from "./types"

/// JSON-encoded shape sent by the macOS aggregator. Mirrors the Swift
/// TourEngagementEvent in
/// PromptShields.MacOS.Widget/Managers/Telemetry/TelemetryTypes.swift.
export interface TourEngagementEvent extends TenantScoped, Timestamped {
  /// composite "tenant|day|sub|tourId" — deterministic so upserts dedupe
  id: string
  day: string                                  // YYYY-MM-DD
  auth0Sub: string | null
  tourId: string                               // dashboard-intro | chat-intro | …
  startCount: number
  completionCount: number
  /// reason -> count map. Reasons come from the macOS coordinator:
  /// "skip_button" | "esc" | "click_outside". The schema accepts arbitrary
  /// strings so the dashboard doesn't need to redeploy when we add new
  /// dismissal sources.
  dismissalCounts: Record<string, number>
  /// Sum of completion durations (seconds) for this row's day. Average is
  /// totalDurationSec / max(completionCount, 1) — done at query time so we
  /// don't have to backfill when completionCount changes via upsert.
  totalDurationSec: number
  /// "stepIndex" -> count of dismissals on that step. JSON keys are strings
  /// so the macOS client serialises Int as String here.
  stepDismissalCounts: Record<string, number>
  firstSeen: string
  lastSeen: string
  tags: Tag[]
}

const events: Map<string, TourEngagementEvent> = new Map()
const RETENTION_DAYS = 180  // longer than usage-events — funnels need history

function compositeId(tenantId: string, day: string, sub: string | null, tourId: string): string {
  return `${tenantId}|${day}|${sub ?? "anon"}|${tourId}`
}

function pruneOld(): void {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS)
  const cutoffStr = cutoff.toISOString().slice(0, 10)
  for (const [key, ev] of events) {
    if (ev.day < cutoffStr) events.delete(key)
  }
}

// ─── Public API ─────────────────────────────────────────────────────────

export interface UpsertTourEngagementInput {
  tenantId?: string
  day: string
  auth0Sub: string | null
  tourId: string
  startCount?: number
  completionCount?: number
  dismissalCounts?: Record<string, number>
  totalDurationSec?: number
  stepDismissalCounts?: Record<string, number>
  firstSeen: string
  lastSeen: string
}

export function upsertTourEngagement(input: UpsertTourEngagementInput): TourEngagementEvent {
  pruneOld()
  const tenantId = input.tenantId ?? "default"
  const id = compositeId(tenantId, input.day, input.auth0Sub, input.tourId)
  const now = new Date().toISOString()
  const existing = events.get(id)

  if (existing) {
    existing.startCount += input.startCount ?? 0
    existing.completionCount += input.completionCount ?? 0
    existing.totalDurationSec += input.totalDurationSec ?? 0
    addInto(existing.dismissalCounts, input.dismissalCounts ?? {})
    addInto(existing.stepDismissalCounts, input.stepDismissalCounts ?? {})
    if (input.firstSeen < existing.firstSeen) existing.firstSeen = input.firstSeen
    if (input.lastSeen > existing.lastSeen) existing.lastSeen = input.lastSeen
    existing.updatedAt = now
    events.set(id, existing)
    return existing
  }

  const fresh: TourEngagementEvent = {
    id,
    tenantId,
    day: input.day,
    auth0Sub: input.auth0Sub,
    tourId: input.tourId,
    startCount: input.startCount ?? 0,
    completionCount: input.completionCount ?? 0,
    dismissalCounts: { ...(input.dismissalCounts ?? {}) },
    totalDurationSec: input.totalDurationSec ?? 0,
    stepDismissalCounts: { ...(input.stepDismissalCounts ?? {}) },
    firstSeen: input.firstSeen,
    lastSeen: input.lastSeen,
    tags: [],
    createdAt: now,
    updatedAt: now
  }
  events.set(id, fresh)
  return fresh
}

function addInto(target: Record<string, number>, source: Record<string, number>): void {
  for (const [key, value] of Object.entries(source)) {
    target[key] = (target[key] ?? 0) + value
  }
}

export interface ListTourEngagementFilter {
  tenantId?: string
  fromDay?: string
  toDay?: string
  tourId?: string
  auth0Sub?: string
  limit?: number
}

export function listTourEngagement(filter: ListTourEngagementFilter = {}): TourEngagementEvent[] {
  pruneOld()
  const tenantId = filter.tenantId ?? "default"
  const limit = filter.limit ?? 1000
  const out: TourEngagementEvent[] = []
  for (const ev of events.values()) {
    if (ev.tenantId !== tenantId) continue
    if (filter.fromDay && ev.day < filter.fromDay) continue
    if (filter.toDay && ev.day > filter.toDay) continue
    if (filter.tourId && ev.tourId !== filter.tourId) continue
    if (filter.auth0Sub && ev.auth0Sub !== filter.auth0Sub) continue
    out.push(ev)
    if (out.length >= limit) break
  }
  return out.sort((a, b) => b.day.localeCompare(a.day) || a.tourId.localeCompare(b.tourId))
}

/// Aggregated funnel across the filter window. Useful for the dashboard
/// tile that shows "starts vs completions vs dismissals" per tour.
export interface TourFunnelRow {
  tourId: string
  startCount: number
  completionCount: number
  dismissalsTotal: number
  dismissalsByReason: Record<string, number>
  averageCompletionDurationSec: number
}

export function aggregateTourFunnel(filter: ListTourEngagementFilter = {}): TourFunnelRow[] {
  const rows = listTourEngagement(filter)
  const byTour: Map<string, TourFunnelRow & { totalDurationSec: number }> = new Map()

  for (const ev of rows) {
    const cur = byTour.get(ev.tourId) ?? {
      tourId: ev.tourId,
      startCount: 0,
      completionCount: 0,
      dismissalsTotal: 0,
      dismissalsByReason: {},
      averageCompletionDurationSec: 0,
      totalDurationSec: 0
    }
    cur.startCount += ev.startCount
    cur.completionCount += ev.completionCount
    cur.totalDurationSec += ev.totalDurationSec
    for (const [reason, count] of Object.entries(ev.dismissalCounts)) {
      cur.dismissalsTotal += count
      cur.dismissalsByReason[reason] = (cur.dismissalsByReason[reason] ?? 0) + count
    }
    byTour.set(ev.tourId, cur)
  }

  return Array.from(byTour.values()).map((r) => ({
    tourId: r.tourId,
    startCount: r.startCount,
    completionCount: r.completionCount,
    dismissalsTotal: r.dismissalsTotal,
    dismissalsByReason: r.dismissalsByReason,
    averageCompletionDurationSec:
      r.completionCount > 0 ? r.totalDurationSec / r.completionCount : 0
  })).sort((a, b) => b.startCount - a.startCount)
}

export function tourEngagementCount(): number {
  pruneOld()
  return events.size
}
