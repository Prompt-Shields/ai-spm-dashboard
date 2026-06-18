// Board-ready AI risk roll-up.
//
// Turns the USE_CASES registry + derived compliance metrics into the short,
// ranked list of top risks a Head of AI Risk can report to the board. Every
// figure is computed from the same single source of truth as the rest of the
// dashboard (see compliance-metrics.ts), so the board pack never contradicts
// the operational views.

import { USE_CASES } from './aimaps-data'
import type { Risk, UseCase } from './aimaps-types'
import { getFrameworkMetrics, AVERAGE_COVERAGE } from './compliance-metrics'

export type Severity = 'critical' | 'high' | 'medium' | 'low'

const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

export interface BoardRisk {
  id: string
  rank: number
  title: string
  severity: Severity
  /** The single number the board sees (e.g. 12). */
  metric: number
  /** Unit/label for the metric (e.g. "unsanctioned tools"). */
  unit: string
  detail: string
  /** Frameworks this risk bears on. */
  frameworks: string[]
  /** What's being done / recommended. */
  remediation: string
  /** Regulatory or internal deadline, if any. */
  deadline?: string
  /** Direction vs last quarter (illustrative). */
  trend: 'up' | 'down' | 'flat'
}

// ── Derived counts (single source of truth: USE_CASES) ──────────────────

const hasSeverity = (uc: UseCase, sevs: Severity[]) =>
  uc.risks.some((r: Risk) => sevs.includes(r.severity as Severity))

const SHADOW_AI = USE_CASES.filter((uc) => uc.discoveryMethod === 'shadow-ai')

const HIGH_RISK = USE_CASES.filter((uc) => hasSeverity(uc, ['critical', 'high']))

const UNOWNED_HIGH_RISK = HIGH_RISK.filter((uc) => uc.ownerId === null)

const SENSITIVE_LEAKAGE = USE_CASES.filter(
  (uc) =>
    (uc.dataClassification === 'confidential' || uc.dataClassification === 'restricted') &&
    uc.risks.some((r) => r.category === 'data-leakage'),
)

const PROMPT_INJECTION = USE_CASES.filter((uc) =>
  uc.risks.some((r) => r.category === 'prompt-injection'),
)

const euAiAct = getFrameworkMetrics('euAiAct')
const iso42001 = getFrameworkMetrics('iso42001')

export const BOARD_COUNTS = {
  totalUseCases: USE_CASES.length,
  highRisk: HIGH_RISK.length,
  unownedHighRisk: UNOWNED_HIGH_RISK.length,
  shadowAi: SHADOW_AI.length,
  sensitiveLeakage: SENSITIVE_LEAKAGE.length,
  promptInjection: PROMPT_INJECTION.length,
  averageCoverage: AVERAGE_COVERAGE,
}

// ── Top risks (ranked by severity × exposure) ───────────────────────────

const RAW_RISKS: Omit<BoardRisk, 'rank'>[] = [
  {
    id: 'shadow-ai',
    title: 'Shadow AI processing company data unreviewed',
    severity: 'critical',
    metric: SHADOW_AI.length,
    unit: 'unsanctioned tools',
    detail:
      'AI tools adopted by employees without review, several handling confidential data. No owner, no risk assessment, no policy applied.',
    frameworks: ['EU AI Act', 'ISO 42001'],
    remediation: 'Triage in registry → assign owners → apply guardrails or sunset.',
    trend: 'down',
  },
  {
    id: 'unowned-high-risk',
    title: 'High-risk AI with no accountable owner',
    severity: 'high',
    metric: UNOWNED_HIGH_RISK.length,
    unit: 'use cases',
    detail:
      'High-risk use cases carrying critical or high-severity risks with no named owner — direct regulatory and audit liability.',
    frameworks: ['EU AI Act', 'NIST AI RMF', 'ISO 42001'],
    remediation: 'Assign owners and require sign-off within the quarter.',
    trend: 'flat',
  },
  {
    id: 'sensitive-leakage',
    title: 'Sensitive data exposure to external LLMs',
    severity: 'high',
    metric: SENSITIVE_LEAKAGE.length,
    unit: 'use cases',
    detail:
      'Use cases handling confidential or restricted data with an open data-leakage risk — PII/IP can leave the boundary.',
    frameworks: ['EU AI Act', 'OWASP LLM Top 10'],
    remediation: 'Enforce PII redaction + data-minimisation before send.',
    trend: 'down',
  },
  {
    id: 'eu-ai-act-gaps',
    title: 'EU AI Act obligations not yet met',
    severity: 'high',
    metric: euAiAct.gapCount,
    unit: 'open gaps',
    detail: `${euAiAct.gapCount} use cases with EU AI Act gaps against the high-risk obligations coming into force.`,
    frameworks: ['EU AI Act'],
    remediation: 'Close gaps prioritised by deadline; document technical evidence.',
    deadline: 'Aug 2026',
    trend: 'down',
  },
  {
    id: 'iso-42001-readiness',
    title: 'ISO/IEC 42001 certification gaps',
    severity: 'medium',
    metric: iso42001.gapCount,
    unit: 'open gaps',
    detail: `Currently ${iso42001.percentage}% coverage. Closing the management-system clauses takes the AIMS to certification-ready.`,
    frameworks: ['ISO 42001'],
    remediation: 'Run the guided ISO 42001 journey to certification-readiness.',
    trend: 'down',
  },
  {
    id: 'prompt-injection',
    title: 'Prompt-injection exposure on LLM use cases',
    severity: 'medium',
    metric: PROMPT_INJECTION.length,
    unit: 'use cases',
    detail:
      'Customer- or data-facing LLM use cases exposed to prompt-injection without consistent input/output guards.',
    frameworks: ['OWASP LLM Top 10', 'NIST AI RMF'],
    remediation: 'Apply prompt-injection guards; wire into red-team CI.',
    trend: 'flat',
  },
]

/** Top risks, ranked by severity weight × exposure (metric). */
export const TOP_RISKS: BoardRisk[] = RAW_RISKS.map((r) => ({
  ...r,
  _score: SEVERITY_WEIGHT[r.severity] * Math.max(r.metric, 1),
}))
  .sort((a, b) => b._score - a._score)
  .map(({ _score, ...r }, i) => ({ ...r, rank: i + 1 }))

// ── Overall posture ─────────────────────────────────────────────────────

export type Posture = 'Low' | 'Moderate' | 'Elevated' | 'High'

/**
 * A single posture label derived from coverage and open critical exposure.
 * Demo heuristic, but deterministic and explainable to a board.
 */
export function overallPosture(): { label: Posture; trend: 'improving' | 'stable' | 'worsening' } {
  const criticalOpen = TOP_RISKS.filter((r) => r.severity === 'critical' && r.metric > 0).length
  const cov = AVERAGE_COVERAGE
  let label: Posture
  if (criticalOpen > 0 || cov < 45) label = 'Elevated'
  else if (cov < 60) label = 'Moderate'
  else if (cov < 80) label = 'Moderate'
  else label = 'Low'
  if (criticalOpen >= 2) label = 'High'
  return { label, trend: 'improving' }
}
