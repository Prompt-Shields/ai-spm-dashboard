// POST /api/tour-engagement
//   Ingest endpoint for daily tour-engagement rollups from on-device
//   PEPs (Promptly today, future: browser extensions, Windows). Each
//   request is a batch — clients aggregate per (day, person, tour)
//   in-memory and flush on app-deactivate / quit / 5-min heartbeat.
//
// GET /api/tour-engagement
//   Read for the dashboard tile. Default returns the raw rollups.
//   Pass `?aggregate=funnel` for a per-tour summary
//   (startCount / completionCount / dismissalsByReason / avg duration).
//
// Companion Swift types: prompt-shields-macos-widget/PromptShields.MacOS.Widget/
// Managers/Telemetry/TelemetryTypes.swift (TourEngagementEvent + TourEngagementBatch).

import { NextResponse, type NextRequest } from "next/server"
import {
  aggregateTourFunnel,
  listTourEngagement,
  tourEngagementCount,
  upsertTourEngagement,
  type ListTourEngagementFilter
} from "@/lib/entities/tour-engagement-store"
import { ensureFixturesSeeded } from "@/lib/entities/fixtures"

export const dynamic = "force-dynamic"

interface ClientEvent {
  day?: unknown
  auth0Sub?: unknown
  tourId?: unknown
  startCount?: unknown
  completionCount?: unknown
  dismissalCounts?: unknown
  totalDurationSec?: unknown
  stepDismissalCounts?: unknown
  firstSeen?: unknown
  lastSeen?: unknown
}

interface ClientBatch {
  events?: unknown
  appVersion?: unknown
}

export async function POST(request: NextRequest) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  const batch = payload as ClientBatch
  if (!Array.isArray(batch.events)) {
    return NextResponse.json({ error: "events_must_be_array" }, { status: 400 })
  }

  const accepted: string[] = []
  const rejected: Array<{ index: number; reason: string }> = []

  for (const [i, raw] of (batch.events as ClientEvent[]).entries()) {
    const validation = validateEvent(raw)
    if (!validation.ok) {
      rejected.push({ index: i, reason: validation.reason })
      continue
    }
    const stored = upsertTourEngagement(validation.value)
    accepted.push(stored.id)
  }

  return NextResponse.json(
    {
      accepted: accepted.length,
      rejected: rejected.length,
      ids: accepted,
      errors: rejected,
      total: tourEngagementCount()
    },
    { status: rejected.length === 0 ? 201 : 207 }
  )
}

export async function GET(request: NextRequest) {
  ensureFixturesSeeded()
  const params = request.nextUrl.searchParams
  const filter: ListTourEngagementFilter = {
    fromDay: params.get("fromDay") ?? undefined,
    toDay: params.get("toDay") ?? undefined,
    tourId: params.get("tourId") ?? undefined,
    auth0Sub: params.get("auth0Sub") ?? undefined,
    limit: params.get("limit") ? Number(params.get("limit")) : undefined
  }

  if (params.get("aggregate") === "funnel") {
    return NextResponse.json({
      funnel: aggregateTourFunnel(filter),
      snapshotAt: new Date().toISOString()
    })
  }

  return NextResponse.json({
    events: listTourEngagement(filter),
    snapshotAt: new Date().toISOString()
  })
}

// ─── Validation ──────────────────────────────────────────────────────────

interface ValidatedEvent {
  day: string
  auth0Sub: string | null
  tourId: string
  startCount: number
  completionCount: number
  dismissalCounts: Record<string, number>
  totalDurationSec: number
  stepDismissalCounts: Record<string, number>
  firstSeen: string
  lastSeen: string
}

function validateEvent(
  raw: ClientEvent
): { ok: true; value: ValidatedEvent } | { ok: false; reason: string } {
  if (typeof raw.day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw.day)) {
    return { ok: false, reason: "day must be YYYY-MM-DD" }
  }
  if (typeof raw.tourId !== "string" || raw.tourId.length === 0) {
    return { ok: false, reason: "tourId required" }
  }
  if (raw.auth0Sub !== null && raw.auth0Sub !== undefined && typeof raw.auth0Sub !== "string") {
    return { ok: false, reason: "auth0Sub must be string or null" }
  }
  if (typeof raw.firstSeen !== "string" || typeof raw.lastSeen !== "string") {
    return { ok: false, reason: "firstSeen / lastSeen must be ISO strings" }
  }
  const counters: Array<keyof ClientEvent> = [
    "startCount", "completionCount", "totalDurationSec"
  ]
  for (const c of counters) {
    const v = raw[c]
    if (v !== undefined && (typeof v !== "number" || v < 0 || !Number.isFinite(v))) {
      return { ok: false, reason: `${String(c)} must be a non-negative number` }
    }
  }
  if (raw.dismissalCounts !== undefined && !isRecordOfNumbers(raw.dismissalCounts)) {
    return { ok: false, reason: "dismissalCounts must be Record<string, number>" }
  }
  if (raw.stepDismissalCounts !== undefined && !isRecordOfNumbers(raw.stepDismissalCounts)) {
    return { ok: false, reason: "stepDismissalCounts must be Record<string, number>" }
  }
  return {
    ok: true,
    value: {
      day: raw.day,
      auth0Sub: (raw.auth0Sub as string | undefined) ?? null,
      tourId: raw.tourId,
      startCount: (raw.startCount as number | undefined) ?? 0,
      completionCount: (raw.completionCount as number | undefined) ?? 0,
      dismissalCounts: (raw.dismissalCounts as Record<string, number> | undefined) ?? {},
      totalDurationSec: (raw.totalDurationSec as number | undefined) ?? 0,
      stepDismissalCounts:
        (raw.stepDismissalCounts as Record<string, number> | undefined) ?? {},
      firstSeen: raw.firstSeen,
      lastSeen: raw.lastSeen
    }
  }
}

function isRecordOfNumbers(value: unknown): value is Record<string, number> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false
  for (const v of Object.values(value)) {
    if (typeof v !== "number" || v < 0 || !Number.isFinite(v)) return false
  }
  return true
}
