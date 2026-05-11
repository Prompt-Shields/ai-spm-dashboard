// Server-side store for daily usage rollups emitted by Promptly's
// macOS app (and future browser/Windows clients). One row per
// (tenant, day, person, app) tuple — clients send a batch in a single
// POST and the store upserts each row.
//
// MVP: in-memory ring with a 90-day retention so it doesn't grow
// unbounded. Replace with a real DB once tenanting + auth wiring lands.

import type { Tag, TenantScoped, Timestamped } from "./types"

export interface UsageEvent extends TenantScoped, Timestamped {
  id: string                  // composite "tenant|day|sub|appId"
  day: string                 // YYYY-MM-DD (client-local timezone)
  auth0Sub: string | null
  promptlyAppId: string       // matches MonitoredApp.id on macOS side
  promptCount: number
  blockedCount: number
  redactedCount: number
  flaggedCount: number
  firstSeen: string
  lastSeen: string
  tags: Tag[]
}

const events: Map<string, UsageEvent> = new Map()
const RETENTION_DAYS = 90

function compositeId(tenantId: string, day: string, sub: string | null, appId: string): string {
  return `${tenantId}|${day}|${sub ?? "anon"}|${appId}`
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

export interface UpsertUsageEventInput {
  tenantId?: string
  day: string
  auth0Sub: string | null
  promptlyAppId: string
  promptCount?: number
  blockedCount?: number
  redactedCount?: number
  flaggedCount?: number
  firstSeen: string
  lastSeen: string
}

/**
 * Adds the incoming counters onto whatever's already stored for this
 * (tenant, day, person, app) tuple. firstSeen wins the earlier value;
 * lastSeen wins the later. Idempotent across re-flushes from the same client.
 */
export function upsertUsageEvent(input: UpsertUsageEventInput): UsageEvent {
  pruneOld()
  const tenantId = input.tenantId ?? "default"
  const id = compositeId(tenantId, input.day, input.auth0Sub, input.promptlyAppId)
  const now = new Date().toISOString()
  const existing = events.get(id)

  if (existing) {
    existing.promptCount += input.promptCount ?? 0
    existing.blockedCount += input.blockedCount ?? 0
    existing.redactedCount += input.redactedCount ?? 0
    existing.flaggedCount += input.flaggedCount ?? 0
    if (input.firstSeen < existing.firstSeen) existing.firstSeen = input.firstSeen
    if (input.lastSeen > existing.lastSeen) existing.lastSeen = input.lastSeen
    existing.updatedAt = now
    events.set(id, existing)
    return existing
  }

  const fresh: UsageEvent = {
    id,
    tenantId,
    day: input.day,
    auth0Sub: input.auth0Sub,
    promptlyAppId: input.promptlyAppId,
    promptCount: input.promptCount ?? 0,
    blockedCount: input.blockedCount ?? 0,
    redactedCount: input.redactedCount ?? 0,
    flaggedCount: input.flaggedCount ?? 0,
    firstSeen: input.firstSeen,
    lastSeen: input.lastSeen,
    tags: [],
    createdAt: now,
    updatedAt: now
  }
  events.set(id, fresh)
  return fresh
}

export interface ListUsageEventsFilter {
  tenantId?: string
  fromDay?: string
  toDay?: string
  auth0Sub?: string
  promptlyAppId?: string
  limit?: number
}

export function listUsageEvents(filter: ListUsageEventsFilter = {}): UsageEvent[] {
  pruneOld()
  const tenantId = filter.tenantId ?? "default"
  const limit = filter.limit ?? 1000
  const out: UsageEvent[] = []
  for (const ev of events.values()) {
    if (ev.tenantId !== tenantId) continue
    if (filter.fromDay && ev.day < filter.fromDay) continue
    if (filter.toDay && ev.day > filter.toDay) continue
    if (filter.auth0Sub && ev.auth0Sub !== filter.auth0Sub) continue
    if (filter.promptlyAppId && ev.promptlyAppId !== filter.promptlyAppId) continue
    out.push(ev)
    if (out.length >= limit) break
  }
  return out.sort((a, b) => b.day.localeCompare(a.day) || b.lastSeen.localeCompare(a.lastSeen))
}

export function usageEventsCount(): number {
  pruneOld()
  return events.size
}
