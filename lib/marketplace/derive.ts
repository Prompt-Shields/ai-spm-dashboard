// lib/marketplace/derive.ts
//
// Pure derivations over the catalogue. Everything the marketplace UI shows as
// a number comes from here, so the figures are unit-testable and the
// components stay dumb.
//
// This file may import usage-quality-data (for the shared hourly rate and
// quality discount); usage-quality-data must never import it back. See
// library.ts for why the split exists.
import { USAGE_QUALITY, adoptionRate } from '../usage-quality-data'
import type { RiskSeverity } from '../mcp-discovery-data'
import { BUILDER_SCORE_LIFT } from './data'
import type {
  Builder,
  MarketplaceSkill,
  RiskFinding,
  ScanReport,
  SkillCategory,
  ReviewStatus,
} from './types'

const SEVERITY_RANK: Record<RiskSeverity | 'ok', number> = { ok: 0, low: 1, medium: 2, high: 3 }

// ─── Scan ────────────────────────────────────────────────────────────────

/** Worst severity in a scan — 'ok' when every check passed. */
export function scanVerdict(scan: ScanReport): RiskSeverity | 'ok' {
  return scan.findings.reduce<RiskSeverity | 'ok'>(
    (worst, f) => (SEVERITY_RANK[f.severity] > SEVERITY_RANK[worst] ? f.severity : worst),
    'ok',
  )
}

/**
 * The findings a reviewer has to answer for. Low-severity notes are context,
 * not blockers — surfacing them as blockers would make every skill look risky
 * and train reviewers to click through.
 */
export function blockingFindings(scan: ScanReport): RiskFinding[] {
  return scan.findings.filter((f) => f.severity === 'high' || f.severity === 'medium')
}

// ─── Ratings ─────────────────────────────────────────────────────────────

/** Mean peer rating, or 0 when nobody has reviewed it yet (callers hide it). */
export function avgRating(skill: MarketplaceSkill): number {
  if (skill.reviews.length === 0) return 0
  const sum = skill.reviews.reduce((a, r) => a + r.rating, 0)
  return sum / skill.reviews.length
}

// ─── ROI ─────────────────────────────────────────────────────────────────

/**
 * The share of raw time-savings that survives the quality discount — the same
 * factor behind the Adoption headline, so per-skill hours and the org-wide
 * figure are measured on one scale.
 *
 * A function rather than a module-scope const on purpose: keeping references
 * to USAGE_QUALITY inside function bodies means this module has no top-level
 * dependency on it, which is what makes the import graph safe to reason about.
 */
export function qualityDiscount(): number {
  const { qualityHoursSaved, rawHoursSaved } = USAGE_QUALITY.roi
  return rawHoursSaved === 0 ? 0 : qualityHoursSaved / rawHoursSaved
}

/** Quality-weighted hours this skill saved this month. */
export function hoursSavedPerMonth(skill: MarketplaceSkill): number {
  return ((skill.usesThisMonth * skill.minutesSavedPerUse) / 60) * qualityDiscount()
}

/** Those hours priced at the blended fully-loaded rate. */
export function valuePerMonth(skill: MarketplaceSkill): number {
  return hoursSavedPerMonth(skill) * USAGE_QUALITY.roi.hourlyRate
}

export interface MarketplaceRoi {
  hours: number
  value: number
  adopters: number
  skills: number
}

/**
 * Roll-up across approved skills only — a blocked skill saves nobody anything.
 *
 * This is a *subset* of org-wide savings: skills are one channel of AI usage
 * among many, so the total is expected to land well below
 * USAGE_QUALITY.roi.qualityHoursSaved rather than equal it.
 */
export function marketplaceRoi(skills: MarketplaceSkill[]): MarketplaceRoi {
  const approved = skills.filter((s) => s.status === 'approved')
  return {
    hours: approved.reduce((a, s) => a + hoursSavedPerMonth(s), 0),
    value: approved.reduce((a, s) => a + valuePerMonth(s), 0),
    adopters: approved.reduce((a, s) => a + s.adopters, 0),
    skills: approved.length,
  }
}

// ─── Discovery ───────────────────────────────────────────────────────────

/**
 * "Suggested for your team" — approved skills auto-matched to a team, minus
 * anything already adopted. Ranked by adoption elsewhere: a skill four other
 * teams rely on is a safer recommendation than an unproven one.
 */
export function suggestedFor(
  team: string,
  skills: MarketplaceSkill[],
  adopted: string[] = [],
): MarketplaceSkill[] {
  return skills
    .filter(
      (s) =>
        s.status === 'approved' &&
        s.suggestedTeams.includes(team) &&
        !adopted.includes(s.id),
    )
    .sort((a, b) => adoptionRate(b) - adoptionRate(a))
}

export interface SkillFilters {
  category?: SkillCategory | 'all'
  status?: ReviewStatus | 'all'
}

/**
 * Free-text search across the fields someone would actually type — what it
 * does, who built it, which team — plus the two dropdown filters.
 */
export function searchSkills(
  skills: MarketplaceSkill[],
  query: string,
  filters: SkillFilters = {},
): MarketplaceSkill[] {
  const q = query.trim().toLowerCase()
  const { category = 'all', status = 'all' } = filters
  return skills.filter((s) => {
    if (category !== 'all' && s.category !== category) return false
    if (status !== 'all' && s.status !== status) return false
    if (q === '') return true
    return [s.name, s.purpose, s.builder, s.sourceTeam].some((f) => f.toLowerCase().includes(q))
  })
}

// ─── People & queue ──────────────────────────────────────────────────────

/**
 * Contributors ranked on *reach*, not output: one skill nine teams use beats
 * five nobody picked up. That ordering is the point — it tells Eva which
 * builders to invest in rather than who is simply most prolific.
 */
export function leaderboard(skills: MarketplaceSkill[]): Builder[] {
  const byName = new Map<string, Builder>()
  for (const s of skills) {
    if (s.status !== 'approved') continue
    const existing = byName.get(s.builder)
    if (existing) {
      existing.skills += 1
      existing.teamsReached += s.reuseTeams
      existing.adopters += s.adopters
    } else {
      byName.set(s.builder, {
        name: s.builder,
        team: s.sourceTeam,
        skills: 1,
        teamsReached: s.reuseTeams,
        adopters: s.adopters,
        avgScoreLift: BUILDER_SCORE_LIFT[s.builder] ?? 0,
      })
    }
  }
  return [...byName.values()].sort(
    (a, b) => b.teamsReached - a.teamsReached || b.adopters - a.adopters,
  )
}

/** The review queue: oldest submission first, so nothing rots at the bottom. */
export function reviewQueueSkills(skills: MarketplaceSkill[]): MarketplaceSkill[] {
  return skills
    .filter((s) => s.status === 'in_review')
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))
}
