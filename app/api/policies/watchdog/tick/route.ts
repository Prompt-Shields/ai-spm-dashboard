// POST /api/policies/watchdog/tick — runs the auto-demote watchdog
// across every Strict instance. Designed to be called by:
//   - A real cron (Vercel Cron, GitHub Actions, etc.) every minute
//   - The dashboard's watchdog banner refresh
//   - A manual "Run watchdog now" button (for demos)
//
// Side effects:
//   - Updates per-instance watchdog grace state in the server store
//   - Auto-demotes any instance whose grace period has elapsed
//
// Returns a summary so callers can render UI without a second fetch.

import { NextResponse } from "next/server"
import {
  listAllInstances,
  upsertInstance,
  getWatchdogState,
  setWatchdogState,
  clearWatchdogState,
  ensureDemoStats
} from "@/lib/policy-engine/server/store"
import {
  assessAutoDemote,
  demoteToGuideline
} from "@/lib/policy-engine/promotion"
import { classOf } from "@/lib/policy-templates/types"

export const dynamic = "force-dynamic"

interface InstanceTickResult {
  instanceId: string
  name: string
  action: "ok" | "grace_started" | "still_grace" | "auto_demoted" | "recovered"
  fpRate: number
  threshold: number
  graceUntil?: string
  reason?: string
}

export async function POST() {
  ensureDemoStats()
  const instances = listAllInstances()
  const results: InstanceTickResult[] = []
  const now = new Date()

  for (const instance of instances) {
    if (classOf(instance.enforcementMode) !== "strict") continue
    if (!instance.autoDemote.enabled) continue

    const fpRate = (instance.stats?.falsePositiveRate ?? 0) * 100
    const threshold = instance.autoDemote.fpRateThreshold
    const existing = getWatchdogState(instance.id)
    const firstDetectedAt = existing ? new Date(existing.firstDetectedAt) : undefined

    const assessment = assessAutoDemote(
      instance,
      instance.autoDemote,
      firstDetectedAt,
      now
    )

    if (fpRate <= threshold) {
      // Below threshold → clear any stale grace state ("recovered")
      if (existing) {
        clearWatchdogState(instance.id)
        results.push({
          instanceId: instance.id,
          name: instance.name,
          action: "recovered",
          fpRate,
          threshold,
          reason: "FP rate dropped back below threshold"
        })
      } else {
        results.push({
          instanceId: instance.id,
          name: instance.name,
          action: "ok",
          fpRate,
          threshold
        })
      }
      continue
    }

    if (assessment.shouldDemote) {
      // Fire the demote
      const demoted = demoteToGuideline({
        instance,
        by: "watchdog",
        reason: assessment.reason ?? "Auto-demoted by watchdog",
        now
      })
      upsertInstance(demoted)
      clearWatchdogState(instance.id)
      results.push({
        instanceId: instance.id,
        name: instance.name,
        action: "auto_demoted",
        fpRate,
        threshold,
        reason: assessment.reason
      })
    } else if (!existing) {
      // First detection → start grace
      setWatchdogState(instance.id, {
        firstDetectedAt: now.toISOString(),
        lastObservedFpRate: fpRate,
        graceUntil:
          assessment.graceUntil ??
          new Date(
            now.getTime() + instance.autoDemote.graceSeconds * 1000
          ).toISOString()
      })
      results.push({
        instanceId: instance.id,
        name: instance.name,
        action: "grace_started",
        fpRate,
        threshold,
        graceUntil: assessment.graceUntil,
        reason: assessment.reason
      })
    } else {
      // Already in grace — update observed rate, keep first-detected
      setWatchdogState(instance.id, {
        ...existing,
        lastObservedFpRate: fpRate
      })
      results.push({
        instanceId: instance.id,
        name: instance.name,
        action: "still_grace",
        fpRate,
        threshold,
        graceUntil: existing.graceUntil,
        reason: assessment.reason
      })
    }
  }

  return NextResponse.json({
    tickedAt: now.toISOString(),
    instancesChecked: results.length,
    summary: {
      ok: results.filter((r) => r.action === "ok").length,
      graceStarted: results.filter((r) => r.action === "grace_started").length,
      stillGrace: results.filter((r) => r.action === "still_grace").length,
      autoDemoted: results.filter((r) => r.action === "auto_demoted").length,
      recovered: results.filter((r) => r.action === "recovered").length
    },
    results
  })
}

// GET returns the current snapshot WITHOUT running the watchdog. Useful
// for the dashboard banner — read-only check.
export async function GET() {
  ensureDemoStats()
  const instances = listAllInstances()
  const results: InstanceTickResult[] = []

  for (const instance of instances) {
    if (classOf(instance.enforcementMode) !== "strict") continue
    if (!instance.autoDemote.enabled) continue

    const fpRate = (instance.stats?.falsePositiveRate ?? 0) * 100
    const threshold = instance.autoDemote.fpRateThreshold
    const existing = getWatchdogState(instance.id)

    if (fpRate <= threshold) {
      results.push({
        instanceId: instance.id,
        name: instance.name,
        action: "ok",
        fpRate,
        threshold
      })
    } else if (existing) {
      results.push({
        instanceId: instance.id,
        name: instance.name,
        action: "still_grace",
        fpRate,
        threshold,
        graceUntil: existing.graceUntil
      })
    } else {
      // Over threshold but no grace recorded yet — would-start
      results.push({
        instanceId: instance.id,
        name: instance.name,
        action: "grace_started",
        fpRate,
        threshold
      })
    }
  }

  return NextResponse.json({
    snapshotAt: new Date().toISOString(),
    results
  })
}
