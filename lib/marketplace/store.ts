// lib/marketplace/store.ts
//
// Viewer actions — adopt a skill, submit a new one, record a review decision —
// layered over the immutable seeded catalogue as a localStorage overrides map,
// folded in at read time. Nothing mutates MARKETPLACE_SKILLS, so "reset" is
// just clearing the map. Mirrors lib/agent-control/store.ts: SSR-guarded
// read()/write() plus pure producers that carry the actual logic.
//
// Deliberately NOT used by library.ts / usage-quality-data: USAGE_QUALITY is
// evaluated during SSR, and folding client state into it would hydration-
// mismatch. The Adoption tab reads the baseline; the marketplace reads this.
import { MARKETPLACE_SKILLS } from './data'
import type { MarketplaceSkill, ReviewStatus } from './types'

const KEY = 'aispm.marketplace.v1'

export interface ReviewDecision {
  status: ReviewStatus
  note: string
  by: string
  at: string // ISO date
}

export interface MarketplaceState {
  /** Skill ids the current viewer has adopted. */
  adopted: string[]
  /** Reviewer decisions, keyed by skill id — override the seeded status. */
  decisions: Record<string, ReviewDecision>
  /** Skills added through the Submit tab this session. */
  submitted: MarketplaceSkill[]
}

export const EMPTY_STATE: MarketplaceState = { adopted: [], decisions: {}, submitted: [] }

function read(): MarketplaceState {
  if (typeof window === 'undefined') return EMPTY_STATE
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return EMPTY_STATE
    const parsed = JSON.parse(raw) as Partial<MarketplaceState>
    // Merge against EMPTY_STATE so a state written by an older build (missing
    // a key) still loads instead of blowing up on `.map` of undefined.
    return {
      adopted: parsed.adopted ?? [],
      decisions: parsed.decisions ?? {},
      submitted: parsed.submitted ?? [],
    }
  } catch {
    return EMPTY_STATE
  }
}

function write(next: MarketplaceState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* localStorage may be unavailable (private mode, quota) — stay in memory */
  }
}

export function getState(): MarketplaceState {
  return read()
}

export function clearState(): MarketplaceState {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(KEY)
    } catch {
      /* nothing to do */
    }
  }
  return EMPTY_STATE
}

// ── Pure producers (exported for tests) ──────────────────────────────────

/** Adopting twice is the same as adopting once — the button is idempotent. */
export function withAdopted(state: MarketplaceState, id: string): MarketplaceState {
  if (state.adopted.includes(id)) return state
  return { ...state, adopted: [...state.adopted, id] }
}

export function withoutAdopted(state: MarketplaceState, id: string): MarketplaceState {
  if (!state.adopted.includes(id)) return state
  return { ...state, adopted: state.adopted.filter((a) => a !== id) }
}

export function withDecision(
  state: MarketplaceState,
  id: string,
  decision: ReviewDecision,
): MarketplaceState {
  return { ...state, decisions: { ...state.decisions, [id]: decision } }
}

export function withSubmission(
  state: MarketplaceState,
  skill: MarketplaceSkill,
): MarketplaceState {
  return { ...state, submitted: [...state.submitted, skill] }
}

// ── Fold ─────────────────────────────────────────────────────────────────

/**
 * Baseline + overrides → what the marketplace renders.
 *
 * Order matters: submissions join the list first so a decision recorded
 * against a freshly submitted skill lands on it too.
 */
export function applyOverrides(
  state: MarketplaceState,
  skills: MarketplaceSkill[] = MARKETPLACE_SKILLS,
): MarketplaceSkill[] {
  return [...skills, ...state.submitted].map((s) => {
    const decision = state.decisions[s.id]
    const adopted = state.adopted.includes(s.id)
    if (!decision && !adopted) return s
    return {
      ...s,
      ...(decision
        ? {
            status: decision.status,
            note: decision.note,
            reviewer: decision.by,
          }
        : {}),
      // The viewer's own adoption counts towards the total they're looking at.
      ...(adopted ? { adopters: s.adopters + 1 } : {}),
    }
  })
}

/** Audit line for a skill, when the viewer decided on it this session. */
export function decisionFor(state: MarketplaceState, id: string): ReviewDecision | undefined {
  return state.decisions[id]
}

// ── Persisting wrappers used by components ───────────────────────────────
// Each takes the current state, applies a producer, writes, and returns the
// next state for setState — keeping the "write then re-render" pair in one
// place rather than repeated at every call site.

export function adopt(state: MarketplaceState, id: string): MarketplaceState {
  const next = withAdopted(state, id)
  write(next)
  return next
}

export function unadopt(state: MarketplaceState, id: string): MarketplaceState {
  const next = withoutAdopted(state, id)
  write(next)
  return next
}

export function decide(
  state: MarketplaceState,
  id: string,
  decision: ReviewDecision,
): MarketplaceState {
  const next = withDecision(state, id, decision)
  write(next)
  return next
}

export function submit(state: MarketplaceState, skill: MarketplaceSkill): MarketplaceState {
  const next = withSubmission(state, skill)
  write(next)
  return next
}
