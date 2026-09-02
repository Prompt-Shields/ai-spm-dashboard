// lib/marketplace/library.ts
//
// The bridge from the marketplace catalogue back to the /adoption Skills tab.
//
// This file is deliberately kept apart from derive.ts: usage-quality-data.ts
// imports deriveLibrary to build USAGE_QUALITY.library, so anything reachable
// from here must NOT import usage-quality-data at runtime. (derive.ts does,
// and nothing in usage-quality-data imports derive.ts — the split is what
// keeps the graph acyclic.) The one import of LibrarySkill below is type-only
// and erased at compile time.
//
// Both functions run over the *baseline* MARKETPLACE_SKILLS, never over
// applyOverrides() output: USAGE_QUALITY is a module-scope const evaluated
// during SSR, so folding localStorage state in here would hydration-mismatch.
import type { LibrarySkill } from '../usage-quality-data'
import { MARKETPLACE_SKILLS } from './data'
import type { MarketplaceSkill } from './types'

/**
 * Project the full catalogue down to the narrower shape the Adoption tab
 * renders. LibrarySkill is a structural subset of MarketplaceSkill, so this is
 * a projection, not a translation — the tab's four original rows come through
 * byte-identical.
 */
export function deriveLibrary(skills: MarketplaceSkill[] = MARKETPLACE_SKILLS): LibrarySkill[] {
  return skills.map((s) => ({
    id: s.id,
    name: s.name,
    purpose: s.purpose,
    sourceTeam: s.sourceTeam,
    status: s.status,
    adopters: s.adopters,
    reachable: s.reachable,
    reuseTeams: s.reuseTeams,
    suggestedTeams: s.suggestedTeams,
    ...(s.reviewer ? { reviewer: s.reviewer } : {}),
    ...(s.note ? { note: s.note } : {}),
  }))
}

/**
 * Counts for the last two stages of the governance chain.
 *
 * The chain renders as a left-to-right funnel with arrows, so it must stay
 * monotonically non-increasing — a later stage larger than an earlier one
 * reads as a bug. Stages therefore count "reached this stage *or beyond*",
 * not "sitting at this stage":
 *
 *   review  — everything that entered the gate, i.e. the whole catalogue
 *   promote — everything that cleared it, i.e. the approved ones
 *
 * (Counting only in_review skills at the review stage would put 3 before a
 * promote stage of 11 and break the funnel.)
 */
export function deriveChainCounts(skills: MarketplaceSkill[] = MARKETPLACE_SKILLS): {
  review: number
  promote: number
} {
  return {
    review: skills.length,
    promote: skills.filter((s) => s.status === 'approved').length,
  }
}
