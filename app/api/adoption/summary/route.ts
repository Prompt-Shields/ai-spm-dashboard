// GET /api/adoption/summary
//   Aggregates the on-device telemetry the macOS app emits
//   (usage-events + tour-engagement + policy violations) into the
//   tiles the /adoption page renders. Single endpoint so the page
//   makes one network call instead of three.
//
//   Returns:
//     - overview: DAU / MAU / total prompts in the window
//     - topApps: per-app prompt + risk breakdown, ordered by volume
//     - riskByApp: per-app policy action mix (block / redact / flag)
//     - window: fromDay / toDay echoed back so the client can show it
//
// Filters: ?days=30 (default), ?fromDay=YYYY-MM-DD, ?toDay=YYYY-MM-DD.
// If both are given, the explicit range wins.

import { NextResponse, type NextRequest } from "next/server"
import { listUsageEvents, type UsageEvent } from "@/lib/entities/usage-events-store"
import { listViolations } from "@/lib/policy-engine/server/store"
import type { PolicyViolation, ActionType } from "@/lib/policy-templates/types"
import { ensureFixturesSeeded } from "@/lib/entities/fixtures"

export const dynamic = "force-dynamic"

interface OverviewStats {
  totalPrompts: number
  totalEvaluations: number
  dau: number          // distinct users on the most-recent day in the window
  mau: number          // distinct users across the entire window
  daysInWindow: number
}

interface AppRow {
  promptlyAppId: string
  promptCount: number
  blockedCount: number
  redactedCount: number
  flaggedCount: number
  // Number of policy violations attributed to this app (any action).
  // Pulled from PolicyViolation.applicationId — independent of the
  // usage-events counters which come from the macOS rollup.
  violationCount: number
}

interface RiskByAppRow {
  promptlyAppId: string
  block: number
  redact: number
  flag: number
  log: number
  evaluated: number
  total: number
}

interface SummaryResponse {
  window: { fromDay: string; toDay: string }
  overview: OverviewStats
  topApps: AppRow[]
  riskByApp: RiskByAppRow[]
  snapshotAt: string
}

export async function GET(request: NextRequest) {
  ensureFixturesSeeded()
  const params = request.nextUrl.searchParams
  const today = new Date()
  const toDay = params.get("toDay") ?? today.toISOString().slice(0, 10)
  const fromDay = params.get("fromDay") ?? (() => {
    const days = Number(params.get("days") ?? 30)
    const from = new Date()
    from.setDate(today.getDate() - Math.max(days - 1, 0))
    return from.toISOString().slice(0, 10)
  })()

  const events = listUsageEvents({ fromDay, toDay, limit: 10_000 })
  const violations = listViolations(5_000).filter((v) => {
    // Violations carry an ISO timestamp; reduce to a day key and
    // bound to the window.
    const day = v.timestamp.slice(0, 10)
    return day >= fromDay && day <= toDay
  })

  return NextResponse.json<SummaryResponse>({
    window: { fromDay, toDay },
    overview: buildOverview(events, fromDay, toDay),
    topApps: buildTopApps(events, violations),
    riskByApp: buildRiskByApp(violations),
    snapshotAt: new Date().toISOString()
  })
}

// ─── Aggregations ───────────────────────────────────────────────────────

function buildOverview(events: UsageEvent[], fromDay: string, toDay: string): OverviewStats {
  let totalPrompts = 0
  let totalEvaluations = 0
  const monthlyUsers = new Set<string>()
  const dailyUsersByDay: Map<string, Set<string>> = new Map()

  for (const ev of events) {
    totalPrompts += ev.promptCount
    totalEvaluations += ev.promptCount + ev.blockedCount + ev.redactedCount + ev.flaggedCount
    if (ev.auth0Sub) {
      monthlyUsers.add(ev.auth0Sub)
      const bucket = dailyUsersByDay.get(ev.day) ?? new Set<string>()
      bucket.add(ev.auth0Sub)
      dailyUsersByDay.set(ev.day, bucket)
    }
  }

  // DAU = users active on the most-recent day in the window that had
  // any traffic. Falls back to 0 if no days had activity.
  const lastActiveDay = Array.from(dailyUsersByDay.keys()).sort().pop()
  const dau = lastActiveDay ? (dailyUsersByDay.get(lastActiveDay)?.size ?? 0) : 0

  const daysInWindow = daysBetween(fromDay, toDay) + 1

  return {
    totalPrompts,
    totalEvaluations,
    dau,
    mau: monthlyUsers.size,
    daysInWindow
  }
}

function buildTopApps(events: UsageEvent[], violations: PolicyViolation[]): AppRow[] {
  const map: Map<string, AppRow> = new Map()
  for (const ev of events) {
    const row = map.get(ev.promptlyAppId) ?? {
      promptlyAppId: ev.promptlyAppId,
      promptCount: 0,
      blockedCount: 0,
      redactedCount: 0,
      flaggedCount: 0,
      violationCount: 0
    }
    row.promptCount += ev.promptCount
    row.blockedCount += ev.blockedCount
    row.redactedCount += ev.redactedCount
    row.flaggedCount += ev.flaggedCount
    map.set(ev.promptlyAppId, row)
  }
  // Layer violation counts on top so apps that triggered policies but
  // never logged a usage rollup still show up.
  for (const v of violations) {
    const row = map.get(v.applicationId) ?? {
      promptlyAppId: v.applicationId,
      promptCount: 0,
      blockedCount: 0,
      redactedCount: 0,
      flaggedCount: 0,
      violationCount: 0
    }
    row.violationCount += 1
    map.set(v.applicationId, row)
  }
  return Array.from(map.values())
    .sort((a, b) =>
      (b.promptCount + b.violationCount) - (a.promptCount + a.violationCount)
    )
    .slice(0, 10)
}

function buildRiskByApp(violations: PolicyViolation[]): RiskByAppRow[] {
  const map: Map<string, RiskByAppRow> = new Map()
  for (const v of violations) {
    const row = map.get(v.applicationId) ?? {
      promptlyAppId: v.applicationId,
      block: 0,
      redact: 0,
      flag: 0,
      log: 0,
      evaluated: 0,
      total: 0
    }
    bumpAction(row, v.actionTaken)
    row.total += 1
    map.set(v.applicationId, row)
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 10)
}

function bumpAction(row: RiskByAppRow, action: ActionType): void {
  switch (action) {
    case "block": row.block += 1; break
    case "redact": row.redact += 1; break
    case "flag": row.flag += 1; break
    case "log": row.log += 1; break
    case "evaluated": row.evaluated += 1; break
    // rewrite / notify / require_review aren't broken out today —
    // captured implicitly via row.total which still bumps.
    default: break
  }
}

function daysBetween(from: string, to: string): number {
  const fromD = new Date(from + "T00:00:00Z").getTime()
  const toD = new Date(to + "T00:00:00Z").getTime()
  return Math.max(0, Math.round((toD - fromD) / (1000 * 60 * 60 * 24)))
}
