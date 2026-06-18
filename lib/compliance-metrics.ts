// Single source of truth for framework compliance coverage.
//
// Every coverage number on the dashboard (the /comply framework cards, the
// coverage-breakdown bar, the ISO 42001 journey baseline, and the board
// report) is derived here from the one USE_CASES registry — so the figures
// can never drift apart on screen.
//
// Coverage % is defined as covered / total (the green segment of the
// breakdown bar); gapCount is the number of use cases with an open gap.

import { USE_CASES } from './aimaps-data'
import type { ComplianceStatus } from './aimaps-types'

export type FrameworkKey = keyof ComplianceStatus

export interface FrameworkMetrics {
  key: FrameworkKey
  name: string
  color: string
  covered: number
  partial: number
  gap: number
  total: number
  /** Headline coverage %, defined as covered / total. */
  percentage: number
  /** Use cases with an open gap for this framework. */
  gapCount: number
}

const FRAMEWORK_DEFS: { key: FrameworkKey; name: string; color: string }[] = [
  { key: 'euAiAct', name: 'EU AI Act', color: '#22c55e' },
  { key: 'nistAiRmf', name: 'NIST AI RMF 2.0', color: '#0ea5e9' },
  { key: 'owaspLlm', name: 'OWASP LLM Top 10', color: '#f59e0b' },
  { key: 'iso42001', name: 'ISO 42001', color: '#8b5cf6' },
]

function compute(key: FrameworkKey, name: string, color: string): FrameworkMetrics {
  const total = USE_CASES.length
  let covered = 0
  let partial = 0
  for (const uc of USE_CASES) {
    const level = uc.complianceStatus[key]
    if (level === 'covered') covered++
    else if (level === 'partial') partial++
  }
  const gap = total - covered - partial
  return {
    key,
    name,
    color,
    covered,
    partial,
    gap,
    total,
    percentage: total > 0 ? Math.round((covered / total) * 100) : 0,
    gapCount: gap,
  }
}

export const FRAMEWORK_METRICS: FrameworkMetrics[] = FRAMEWORK_DEFS.map((d) =>
  compute(d.key, d.name, d.color),
)

export function getFrameworkMetrics(key: FrameworkKey): FrameworkMetrics {
  const m = FRAMEWORK_METRICS.find((f) => f.key === key)
  if (!m) throw new Error(`Unknown framework key: ${key}`)
  return m
}

/** Total use cases in the registry — the single count discovery should report. */
export const USE_CASE_COUNT = USE_CASES.length

/** Average headline coverage across all four frameworks. */
export const AVERAGE_COVERAGE = Math.round(
  FRAMEWORK_METRICS.reduce((sum, f) => sum + f.percentage, 0) / FRAMEWORK_METRICS.length,
)
