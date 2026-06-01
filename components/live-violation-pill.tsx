// AppHeader pill that displays the live high+critical policy violation
// count from /api/policies/violations. Polls every 30 s — light enough
// not to matter and fresh enough that the moment a Promptly PEP fires
// a block the dashboard reflects it.
//
// Falls back to "—" while loading and on transport error so the chrome
// never shows the previous mock "12 Critical Risks" hard-coded value.

"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import Link from "next/link"

interface ViolationsPayload {
  violations: Array<{
    severity: "low" | "medium" | "high" | "critical"
    actionTaken: string
  }>
}

const POLL_INTERVAL_MS = 30_000

export function LiveViolationPill() {
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchOnce = async () => {
      try {
        const res = await fetch("/api/policies/violations")
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as ViolationsPayload
        if (cancelled) return
        // Exclude `evaluated` ticks — those are "no policy matched"
        // signals, not actual risks. Count high + critical only so
        // the pill represents what an admin actually cares about.
        const critical = data.violations.filter(
          (v) =>
            v.actionTaken !== "evaluated" &&
            (v.severity === "high" || v.severity === "critical")
        ).length
        setCount(critical)
        setLoading(false)
        setError(null)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : String(err))
        setLoading(false)
      }
    }

    fetchOnce()
    const timer = setInterval(fetchOnce, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  const label = (() => {
    if (loading) return "—"
    if (error) return "—"
    if (count === 0) return "0 Critical Risks"
    return `${count} Critical Risk${count === 1 ? "" : "s"}`
  })()

  const variantClass = count && count > 0
    ? "bg-red-50 border-red-200 text-red-600"
    : "bg-emerald-50 border-emerald-200 text-emerald-700"

  return (
    <Link
      href="/policy-enforcement"
      title={error ? `Couldn't fetch: ${error}` : "Open Policies"}
      className={
        "flex items-center gap-1.5 border rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors hover:opacity-90 " +
        variantClass
      }
    >
      {loading ? (
        <Loader2 size={12} className="animate-spin" />
      ) : (
        <AlertTriangle size={12} />
      )}
      {label}
    </Link>
  )
}
