// Owner inference.
//
// Ownership is the recurring burden: assigning an accountable owner to every
// AI use case, and keeping it current as people join, move and leave. This
// derives a *suggested* owner for each unowned use case from the signals an
// org already has — Entra ID group / department, M365 licensing, and HR
// (Workday) reporting lines — distinguishing the business owner (accountable)
// from the IT owner (technical custodian), with a confidence score.
//
// Demo: the "inference" is a deterministic heuristic over the registry +
// people directory, framed as the educated guess an LLM would make from the
// same signals.

import { PERSONS, USE_CASES } from './aimaps-data'
import type { Person, UseCase } from './aimaps-types'

export type Confidence = 'high' | 'medium' | 'low'

export interface OwnerSignal {
  label: string
  value: string
}

export interface OwnerSuggestion {
  useCaseId: string
  useCaseName: string
  department: string
  dataClassification: UseCase['dataClassification']
  highRisk: boolean
  reason: string
  businessOwner: Person | null
  itOwner: Person | null
  confidence: Confidence
  signals: OwnerSignal[]
}

/** Rank a role's seniority for picking the accountable business owner. */
function seniority(role: string): number {
  const r = role.toLowerCase()
  if (/chief|cro|cfo|ceo|director|\bhead\b/.test(r)) return 3
  if (/lead|manager|senior|principal/.test(r)) return 2
  return 1
}

/** The IT custodian — the engineering/platform lead. */
const IT_OWNER: Person | null =
  PERSONS.filter((p) => p.department === 'IT').sort(
    (a, b) => seniority(b.role) - seniority(a.role),
  )[0] ?? null

/** Interim governance owner when no department lead matches (Risk & Compliance). */
const GOVERNANCE_OWNER: Person | null =
  PERSONS.filter((p) => p.department === 'Risk & Compliance').sort(
    (a, b) => seniority(b.role) - seniority(a.role),
  )[0] ?? null

interface BusinessOwnerMatch {
  person: Person | null
  /** True when matched to the use case's own department; false = interim fallback. */
  exact: boolean
}

function businessOwnerFor(uc: UseCase): BusinessOwnerMatch {
  const candidates = PERSONS.filter((p) => p.department === uc.department)
  if (candidates.length > 0) {
    return {
      person: candidates.sort((a, b) => seniority(b.role) - seniority(a.role))[0],
      exact: true,
    }
  }
  // No department lead — propose the governance owner as interim accountable.
  return { person: GOVERNANCE_OWNER, exact: false }
}

function isHighRisk(uc: UseCase): boolean {
  return uc.risks.some((r) => r.severity === 'critical' || r.severity === 'high')
}

function reasonFor(uc: UseCase): string {
  if (uc.discoveryMethod === 'shadow-ai') return 'Shadow AI — discovered, never assigned'
  if (uc.status === 'discovered') return 'Newly discovered — owner not yet set'
  return 'Owner not set'
}

function suggestionFor(uc: UseCase): OwnerSuggestion {
  const { person: businessOwner, exact } = businessOwnerFor(uc)
  const itOwner = IT_OWNER
  const confidence: Confidence =
    exact && businessOwner && seniority(businessOwner.role) >= 3
      ? 'high'
      : exact && businessOwner
        ? 'medium'
        : 'low'

  const signals: OwnerSignal[] = [
    { label: 'Entra ID group', value: `AI-Users · ${uc.department}` },
    {
      label: 'M365 license',
      value: exact ? 'Microsoft 365 E5 · Copilot' : 'No direct licensed match',
    },
    {
      label: 'Workday / HR',
      value: exact
        ? `${businessOwner!.role}, ${uc.department}`
        : 'No department lead — interim governance owner',
    },
    {
      label: 'Current load',
      value: businessOwner ? `owns ${businessOwner.useCaseIds.length} use cases` : '—',
    },
  ]

  return {
    useCaseId: uc.id,
    useCaseName: uc.name,
    department: uc.department,
    dataClassification: uc.dataClassification,
    highRisk: isHighRisk(uc),
    reason: reasonFor(uc),
    businessOwner,
    itOwner,
    confidence,
    signals,
  }
}

/** Suggestions for every use case that currently has no owner. */
export const OWNER_SUGGESTIONS: OwnerSuggestion[] = USE_CASES.filter((uc) => uc.ownerId === null)
  .map(suggestionFor)
  // High-risk and high-confidence first — the ones to action.
  .sort((a, b) => {
    if (a.highRisk !== b.highRisk) return a.highRisk ? -1 : 1
    const rank = { high: 0, medium: 1, low: 2 }
    return rank[a.confidence] - rank[b.confidence]
  })

export const OWNER_INFERENCE_COUNTS = {
  unowned: OWNER_SUGGESTIONS.length,
  highConfidence: OWNER_SUGGESTIONS.filter((s) => s.confidence === 'high').length,
  highRiskUnowned: OWNER_SUGGESTIONS.filter((s) => s.highRisk).length,
}
