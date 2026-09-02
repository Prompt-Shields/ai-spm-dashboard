import { describe, expect, it } from 'vitest'
import { MARKETPLACE_SKILLS } from './data'
import {
  EMPTY_STATE,
  applyOverrides,
  decisionFor,
  withAdopted,
  withDecision,
  withSubmission,
  withoutAdopted,
} from './store'
import type { MarketplaceSkill } from './types'

const draft: MarketplaceSkill = {
  id: 'draft-1',
  name: 'Renewal chaser',
  purpose: 'Drafts renewal follow-ups',
  whenToUse: ['Chasing an unanswered renewal'],
  exampleInput: 'Draft a follow-up for policy 993-A.',
  category: 'distribution',
  builder: 'Sofie Maes',
  sourceTeam: 'Claims · Antwerp',
  version: '0.1',
  submittedAt: '2026-09-02',
  status: 'in_review',
  adopters: 0,
  reachable: 40,
  reuseTeams: 0,
  suggestedTeams: [],
  usesThisMonth: 0,
  minutesSavedPerUse: 8,
  scan: { scannedAt: '2026-09-02', findings: [] },
  reviews: [],
}

describe('adoption producers', () => {
  it('is idempotent — adopting twice adopts once', () => {
    const once = withAdopted(EMPTY_STATE, 'policy-qa')
    const twice = withAdopted(once, 'policy-qa')
    expect(twice.adopted).toEqual(['policy-qa'])
    expect(twice).toBe(once) // unchanged state is returned as-is
  })

  it('un-adopting removes only that id', () => {
    const state = withAdopted(withAdopted(EMPTY_STATE, 'a'), 'b')
    expect(withoutAdopted(state, 'a').adopted).toEqual(['b'])
  })

  it('un-adopting something never adopted is a no-op', () => {
    expect(withoutAdopted(EMPTY_STATE, 'nope')).toBe(EMPTY_STATE)
  })

  it('never mutates the state it was handed', () => {
    withAdopted(EMPTY_STATE, 'x')
    expect(EMPTY_STATE.adopted).toEqual([])
  })
})

describe('applyOverrides', () => {
  it('returns the baseline untouched when there is nothing to fold in', () => {
    const out = applyOverrides(EMPTY_STATE)
    expect(out).toHaveLength(MARKETPLACE_SKILLS.length)
    expect(out[0]).toBe(MARKETPLACE_SKILLS[0])
  })

  it('counts the viewer towards the adopter total they are looking at', () => {
    const base = MARKETPLACE_SKILLS.find((s) => s.id === 'policy-qa')!
    const out = applyOverrides(withAdopted(EMPTY_STATE, 'policy-qa'))
    expect(out.find((s) => s.id === 'policy-qa')!.adopters).toBe(base.adopters + 1)
  })

  it('lets a reviewer decision override the seeded status', () => {
    const state = withDecision(EMPTY_STATE, 'broker-reply', {
      status: 'approved',
      note: 'DLP check clean; CRM export removed',
      by: 'Davy · Security & Compliance',
      at: '2026-09-02',
    })
    const skill = applyOverrides(state).find((s) => s.id === 'broker-reply')!
    expect(skill.status).toBe('approved')
    expect(skill.note).toBe('DLP check clean; CRM export removed')
    expect(decisionFor(state, 'broker-reply')?.by).toBe('Davy · Security & Compliance')
  })

  it('appends submitted skills to the catalogue', () => {
    const out = applyOverrides(withSubmission(EMPTY_STATE, draft))
    expect(out).toHaveLength(MARKETPLACE_SKILLS.length + 1)
    expect(out.at(-1)!.id).toBe('draft-1')
  })

  it('applies a decision made against a freshly submitted skill', () => {
    let state = withSubmission(EMPTY_STATE, draft)
    state = withDecision(state, 'draft-1', {
      status: 'approved',
      note: 'Fine — no external calls',
      by: 'Davy · Security & Compliance',
      at: '2026-09-02',
    })
    expect(applyOverrides(state).find((s) => s.id === 'draft-1')!.status).toBe('approved')
  })

  it('never mutates the baseline catalogue', () => {
    const before = MARKETPLACE_SKILLS.find((s) => s.id === 'policy-qa')!.adopters
    applyOverrides(withAdopted(EMPTY_STATE, 'policy-qa'))
    expect(MARKETPLACE_SKILLS.find((s) => s.id === 'policy-qa')!.adopters).toBe(before)
  })
})
