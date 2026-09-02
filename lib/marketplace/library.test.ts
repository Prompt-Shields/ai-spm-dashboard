import { describe, expect, it } from 'vitest'
import { USAGE_QUALITY } from '../usage-quality-data'
import { MARKETPLACE_SKILLS } from './data'
import { deriveChainCounts, deriveLibrary } from './library'

describe('deriveLibrary', () => {
  it('projects every catalogue skill', () => {
    expect(deriveLibrary()).toHaveLength(MARKETPLACE_SKILLS.length)
  })

  it('carries the four pre-marketplace skills through unchanged', () => {
    // These rows shipped on the Adoption tab before the marketplace existed.
    // Their fields must survive the migration byte-for-byte.
    const lib = deriveLibrary()
    expect(lib.find((s) => s.id === 'claims-summary')).toEqual({
      id: 'claims-summary',
      name: 'Claims file summariser',
      purpose: 'Turns a claims folder into a structured 1-page summary',
      sourceTeam: 'Claims · Antwerp',
      status: 'approved',
      adopters: 96,
      reachable: 140,
      reuseTeams: 4,
      suggestedTeams: ['Legal', 'Motor claims · Ghent'],
      reviewer: 'Davy · Security & Compliance',
    })
    expect(lib.find((s) => s.id === 'hr-screening')).toMatchObject({
      status: 'blocked',
      adopters: 3,
      reachable: 20,
      note: 'Blocked — automated profiling of candidates (GDPR Art. 22)',
    })
    expect(lib.find((s) => s.id === 'broker-reply')).toMatchObject({
      status: 'in_review',
      note: 'Pending DLP check — pulls from broker CRM export',
    })
    expect(lib.find((s) => s.id === 'policy-qa')).toMatchObject({ adopters: 71, reuseTeams: 3 })
  })

  it('omits optional fields rather than setting them undefined', () => {
    const approved = deriveLibrary().find((s) => s.id === 'meeting-actions')!
    expect('note' in approved).toBe(false)
  })
})

describe('deriveChainCounts', () => {
  it('counts what reached each stage, not what sits at it', () => {
    const counts = deriveChainCounts()
    expect(counts.review).toBe(MARKETPLACE_SKILLS.length)
    expect(counts.promote).toBe(
      MARKETPLACE_SKILLS.filter((s) => s.status === 'approved').length,
    )
  })

  it('keeps the governance chain monotonically non-increasing', () => {
    // The chain renders as a left-to-right funnel with arrows — a later stage
    // larger than an earlier one reads as a bug. Guards future seed edits.
    const counts = USAGE_QUALITY.governanceChain.map((s) => s.count)
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i], USAGE_QUALITY.governanceChain[i].key).toBeLessThanOrEqual(counts[i - 1])
    }
  })

  it('feeds the chain the derived counts, not literals', () => {
    const chain = USAGE_QUALITY.governanceChain
    const counts = deriveChainCounts()
    expect(chain.find((s) => s.key === 'review')!.count).toBe(counts.review)
    expect(chain.find((s) => s.key === 'promote')!.count).toBe(counts.promote)
  })
})
