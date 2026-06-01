// POST /api/usage-events
//   Ingest endpoint for daily usage rollups from on-device PEPs (Promptly
//   today, future: browser extensions, Windows). Each request is a
//   batch — clients aggregate per (day, person, app) in-memory and flush
//   on app-deactivate / quit / 5-min heartbeat.
//
// GET /api/usage-events
//   Audit-log read for the dashboard UI. Filters by date range / person /
//   app. Returns up to `limit` rows (default 1000).
//
// Companion Swift types: prompt-shields-macos-widget/PromptShields.MacOS.Widget/
// Managers/Telemetry/TelemetryTypes.swift (UsageEvent + UsageEventBatch).

import { NextResponse, type NextRequest } from "next/server"
import {
  listUsageEvents,
  upsertUsageEvent,
  usageEventsCount,
  type ListUsageEventsFilter
} from "@/lib/entities/usage-events-store"

export const dynamic = "force-dynamic"

interface ClientUsageEvent {
  day?: unknown
  auth0Sub?: unknown
  promptlyAppId?: unknown
  promptCount?: unknown
  blockedCount?: unknown
  redactedCount?: unknown
  flaggedCount?: unknown
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

  for (const [i, raw] of (batch.events as ClientUsageEvent[]).entries()) {
    const validation = validateEvent(raw)
    if (!validation.ok) {
      rejected.push({ index: i, reason: validation.reason })
      continue
    }
    const stored = upsertUsageEvent(validation.value)
    accepted.push(stored.id)
  }

  return NextResponse.json(
    {
      accepted: accepted.length,
      rejected: rejected.length,
      ids: accepted,
      errors: rejected,
      total: usageEventsCount()
    },
    { status: rejected.length === 0 ? 201 : 207 }
  )
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const filter: ListUsageEventsFilter = {
    fromDay: params.get("fromDay") ?? undefined,
    toDay: params.get("toDay") ?? undefined,
    auth0Sub: params.get("auth0Sub") ?? undefined,
    promptlyAppId: params.get("promptlyAppId") ?? undefined,
    limit: params.get("limit") ? Number(params.get("limit")) : undefined
  }
  return NextResponse.json({
    events: listUsageEvents(filter),
    snapshotAt: new Date().toISOString()
  })
}

// ─── Validation ──────────────────────────────────────────────────────────

interface ValidatedEvent {
  day: string
  auth0Sub: string | null
  promptlyAppId: string
  promptCount: number
  blockedCount: number
  redactedCount: number
  flaggedCount: number
  firstSeen: string
  lastSeen: string
}

function validateEvent(
  raw: ClientUsageEvent
): { ok: true; value: ValidatedEvent } | { ok: false; reason: string } {
  if (typeof raw.day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw.day)) {
    return { ok: false, reason: "day must be YYYY-MM-DD" }
  }
  if (typeof raw.promptlyAppId !== "string" || raw.promptlyAppId.length === 0) {
    return { ok: false, reason: "promptlyAppId required" }
  }
  if (raw.auth0Sub !== null && raw.auth0Sub !== undefined && typeof raw.auth0Sub !== "string") {
    return { ok: false, reason: "auth0Sub must be string or null" }
  }
  if (typeof raw.firstSeen !== "string" || typeof raw.lastSeen !== "string") {
    return { ok: false, reason: "firstSeen / lastSeen must be ISO strings" }
  }
  const counters = ["promptCount", "blockedCount", "redactedCount", "flaggedCount"] as const
  for (const c of counters) {
    const v = raw[c]
    if (v !== undefined && (typeof v !== "number" || v < 0 || !Number.isFinite(v))) {
      return { ok: false, reason: `${c} must be a non-negative number` }
    }
  }
  return {
    ok: true,
    value: {
      day: raw.day,
      auth0Sub: (raw.auth0Sub as string | undefined) ?? null,
      promptlyAppId: raw.promptlyAppId,
      promptCount: (raw.promptCount as number | undefined) ?? 0,
      blockedCount: (raw.blockedCount as number | undefined) ?? 0,
      redactedCount: (raw.redactedCount as number | undefined) ?? 0,
      flaggedCount: (raw.flaggedCount as number | undefined) ?? 0,
      firstSeen: raw.firstSeen,
      lastSeen: raw.lastSeen
    }
  }
}
