// lib/marketplace/types.ts
//
// The internal skill marketplace. Where /adoption answers "is the usage any
// good", this module answers the two questions that follow: *what* has been
// built that others could reuse, and *is it safe to hand around*.
//
// A MarketplaceSkill is the full record — purpose, provenance, adoption, the
// pre-share risk scan, and peer reviews. The narrower LibrarySkill shape the
// Adoption tab already renders is a structural subset, derived in library.ts,
// so both surfaces read from this one list and can never disagree.
//
// Risk vocabulary is borrowed rather than reinvented: severities from the MCP
// discovery model, PII classes from the PII shield, framework keys from the
// requirements crosswalk. A finding here means the same thing it means there.
import type { RiskSeverity } from '../mcp-discovery-data'
import type { PiiType } from '../pii/types'
import type { RequirementFrameworkKey } from '../framework-requirements'

/**
 * Where a skill sits in the sharing gate. Defined here (not in
 * usage-quality-data) because the marketplace owns the lifecycle; the
 * adoption module re-exports it for the tab that already used the name.
 */
export type ReviewStatus = 'approved' | 'in_review' | 'blocked'

export type SkillCategory =
  | 'claims'
  | 'underwriting'
  | 'legal'
  | 'hr'
  | 'distribution'
  | 'finance'
  | 'it'
  | 'customer-service'

/** What kind of check produced a finding — drives the icon and grouping. */
export type FindingKind = 'egress' | 'pii' | 'dataStore' | 'framework'

/**
 * One line of the simulated pre-share scan. `'ok'` is a *passed* check and
 * renders as a tick — the panel is meant to show what was looked at, not only
 * what went wrong, so an all-clear skill still shows its evidence.
 */
export interface RiskFinding {
  kind: FindingKind
  severity: RiskSeverity | 'ok'
  label: string
  detail: string
  /** Populated when kind === 'pii'. */
  piiTypes?: PiiType[]
  /** Populated when kind === 'framework'. */
  framework?: RequirementFrameworkKey
}

export interface ScanReport {
  scannedAt: string // ISO date
  findings: RiskFinding[]
}

/** Peer feedback from an adopter — the "curated by users, not just by Eva" signal. */
export interface SkillReview {
  author: string
  team: string
  rating: number // 1..5, integer
  comment: string
  at: string // ISO date
}

export interface MarketplaceSkill {
  id: string
  name: string
  /** One line: what it does. */
  purpose: string
  /** 2–4 bullets: when you'd reach for it. */
  whenToUse: string[]
  /** A sample input, so the detail view shows the shape of the thing. */
  exampleInput: string
  category: SkillCategory
  builder: string
  sourceTeam: string
  version: string
  submittedAt: string // ISO date — also the review-queue ordering key
  status: ReviewStatus
  /** Who holds the compliance gate, once it has been picked up. */
  reviewer?: string
  /** The decision note. Required for any non-approved status. */
  note?: string
  adopters: number
  reachable: number
  /** Teams beyond the origin already using it. */
  reuseTeams: number
  /** Auto-matched teams that would benefit — drives "suggested for your team". */
  suggestedTeams: string[]
  usesThisMonth: number
  minutesSavedPerUse: number
  scan: ScanReport
  reviews: SkillReview[]
}

/**
 * A contributor, ranked on reach rather than output: one skill five teams use
 * beats five nobody picked up. Derived from the skill list, never declared.
 */
export interface Builder {
  name: string
  team: string
  skills: number
  teamsReached: number
  adopters: number
  avgScoreLift: number
}

/** Display metadata for categories — labels live here so filters stay in sync. */
export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  claims: 'Claims',
  underwriting: 'Underwriting',
  legal: 'Legal',
  hr: 'HR',
  distribution: 'Distribution',
  finance: 'Finance',
  it: 'IT',
  'customer-service': 'Customer service',
}

/**
 * The viewer. No auth in this demo, so "your team" is a fixed persona —
 * an employee in the team that built the most-adopted skill, which makes the
 * suggested strip show cross-team matches rather than their own work.
 */
export const CURRENT_VIEWER = {
  name: 'Sofie Maes',
  team: 'Claims · Antwerp',
} as const
