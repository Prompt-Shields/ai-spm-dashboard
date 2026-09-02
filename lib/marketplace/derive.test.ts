import { describe, expect, it } from 'vitest'
import { USAGE_QUALITY } from '../usage-quality-data'
import { MARKETPLACE_SKILLS } from './data'
import {
  avgRating,
  blockingFindings,
  hoursSavedPerMonth,
  leaderboard,
  marketplaceRoi,
  qualityDiscount,
  reviewQueueSkills,
  scanVerdict,
  searchSkills,
  suggestedFor,
  valuePerMonth,
} from './derive'
import type { MarketplaceSkill, ScanReport } from './types'

const scan = (...sev: ScanReport['findings'][number]['severity'][]): ScanReport => ({
  scannedAt: '2026-08-24',
  findings: sev.map((s, i) => ({
    kind: 'egress' as const,
    severity: s,
    label: `check ${i}`,
    detail: 'detail',
  })),
})

const skill = (over: Partial<MarketplaceSkill> = {}): MarketplaceSkill => ({
  id: 'x',
  name: 'X',
  purpose: 'does a thing',
  whenToUse: [],
  exampleInput: '',
  category: 'it',
  builder: 'A Builder',
  sourceTeam: 'IT',
  version: '1.0',
  submittedAt: '2026-01-01',
  status: 'approved',
  adopters: 0,
  reachable: 0,
  reuseTeams: 0,
  suggestedTeams: [],
  usesThisMonth: 0,
  minutesSavedPerUse: 0,
  scan: scan('ok'),
  reviews: [],
  ...over,
})

describe('scanVerdict', () => {
  it('returns ok when every check passes', () => {
    expect(scanVerdict(scan('ok', 'ok'))).toBe('ok')
  })

  it('returns the worst severity present', () => {
    expect(scanVerdict(scan('ok', 'low', 'high', 'medium'))).toBe('high')
    expect(scanVerdict(scan('ok', 'low'))).toBe('low')
  })

  it('returns ok for an empty scan', () => {
    expect(scanVerdict({ scannedAt: '2026-08-24', findings: [] })).toBe('ok')
  })
})

describe('blockingFindings', () => {
  it('keeps high and medium, drops ok and low', () => {
    const out = blockingFindings(scan('ok', 'low', 'medium', 'high'))
    expect(out.map((f) => f.severity)).toEqual(['medium', 'high'])
  })
})

describe('avgRating', () => {
  it('is 0 when nobody has reviewed it', () => {
    expect(avgRating(skill())).toBe(0)
  })

  it('averages the ratings', () => {
    const s = skill({
      reviews: [
        { author: 'a', team: 't', rating: 5, comment: '', at: '2026-01-01' },
        { author: 'b', team: 't', rating: 4, comment: '', at: '2026-01-02' },
      ],
    })
    expect(avgRating(s)).toBe(4.5)
  })
})

describe('ROI', () => {
  it('applies the same quality discount as the adoption headline', () => {
    const { qualityHoursSaved, rawHoursSaved } = USAGE_QUALITY.roi
    expect(qualityDiscount()).toBeCloseTo(qualityHoursSaved / rawHoursSaved, 10)
  })

  it('discounts raw hours rather than reporting them', () => {
    const s = skill({ usesThisMonth: 60, minutesSavedPerUse: 60 }) // 60 raw hours
    expect(hoursSavedPerMonth(s)).toBeCloseTo(60 * qualityDiscount(), 10)
    expect(hoursSavedPerMonth(s)).toBeLessThan(60)
  })

  it('prices hours at the shared blended rate', () => {
    const s = skill({ usesThisMonth: 60, minutesSavedPerUse: 60 })
    expect(valuePerMonth(s)).toBeCloseTo(
      hoursSavedPerMonth(s) * USAGE_QUALITY.roi.hourlyRate,
      10,
    )
  })

  it('counts approved skills only — a blocked skill saves nobody anything', () => {
    const skills = [
      skill({ id: 'a', usesThisMonth: 60, minutesSavedPerUse: 60 }),
      skill({ id: 'b', status: 'blocked', usesThisMonth: 600, minutesSavedPerUse: 60 }),
      skill({ id: 'c', status: 'in_review', usesThisMonth: 600, minutesSavedPerUse: 60 }),
    ]
    const roi = marketplaceRoi(skills)
    expect(roi.skills).toBe(1)
    expect(roi.hours).toBeCloseTo(60 * qualityDiscount(), 10)
  })

  it('stays a subset of the org-wide figure on the real catalogue', () => {
    // Skills are one channel of AI usage among many — the marketplace total
    // must land below the org-wide number, never at or above it.
    const roi = marketplaceRoi(MARKETPLACE_SKILLS)
    expect(roi.hours).toBeGreaterThan(0)
    expect(roi.hours).toBeLessThan(USAGE_QUALITY.roi.qualityHoursSaved)
  })

  it('is zero for an empty catalogue', () => {
    expect(marketplaceRoi([])).toEqual({ hours: 0, value: 0, adopters: 0, skills: 0 })
  })
})

describe('suggestedFor', () => {
  const skills = [
    skill({ id: 'popular', suggestedTeams: ['Claims'], adopters: 80, reachable: 100 }),
    skill({ id: 'quiet', suggestedTeams: ['Claims'], adopters: 10, reachable: 100 }),
    skill({ id: 'other-team', suggestedTeams: ['Legal'], adopters: 90, reachable: 100 }),
    skill({ id: 'unapproved', status: 'in_review', suggestedTeams: ['Claims'] }),
  ]

  it('matches on team, approved only, most-adopted first', () => {
    expect(suggestedFor('Claims', skills).map((s) => s.id)).toEqual(['popular', 'quiet'])
  })

  it('drops what the viewer already adopted', () => {
    expect(suggestedFor('Claims', skills, ['popular']).map((s) => s.id)).toEqual(['quiet'])
  })

  it('is empty for a team with no matches', () => {
    expect(suggestedFor('Nowhere', skills)).toEqual([])
  })
})

describe('searchSkills', () => {
  const skills = [
    skill({ id: 'a', name: 'Claims summariser', builder: 'Sofie', category: 'claims' }),
    skill({ id: 'b', name: 'Broker reply', builder: 'Wim', category: 'distribution', status: 'in_review' }),
  ]

  it('returns everything for an empty query', () => {
    expect(searchSkills(skills, '   ')).toHaveLength(2)
  })

  it('matches name, builder and team case-insensitively', () => {
    expect(searchSkills(skills, 'CLAIMS').map((s) => s.id)).toEqual(['a'])
    expect(searchSkills(skills, 'wim').map((s) => s.id)).toEqual(['b'])
  })

  it('applies category and status filters alongside the query', () => {
    expect(searchSkills(skills, '', { category: 'distribution' }).map((s) => s.id)).toEqual(['b'])
    expect(searchSkills(skills, '', { status: 'approved' }).map((s) => s.id)).toEqual(['a'])
    expect(searchSkills(skills, 'broker', { status: 'approved' })).toEqual([])
  })
})

describe('leaderboard', () => {
  it('ranks on teams reached, not skills contributed', () => {
    const skills = [
      skill({ id: '1', builder: 'Prolific', reuseTeams: 1, adopters: 5 }),
      skill({ id: '2', builder: 'Prolific', reuseTeams: 1, adopters: 5 }),
      skill({ id: '3', builder: 'Prolific', reuseTeams: 1, adopters: 5 }),
      skill({ id: '4', builder: 'Reaching', reuseTeams: 9, adopters: 100 }),
    ]
    const board = leaderboard(skills)
    expect(board[0].name).toBe('Reaching')
    expect(board.find((b) => b.name === 'Prolific')).toMatchObject({
      skills: 3,
      teamsReached: 3,
      adopters: 15,
    })
  })

  it('ignores unapproved skills', () => {
    const skills = [skill({ builder: 'Pending', status: 'in_review', reuseTeams: 9 })]
    expect(leaderboard(skills)).toEqual([])
  })
})

describe('reviewQueueSkills', () => {
  it('returns in-review skills oldest first', () => {
    const skills = [
      skill({ id: 'new', status: 'in_review', submittedAt: '2026-08-20' }),
      skill({ id: 'old', status: 'in_review', submittedAt: '2026-08-06' }),
      skill({ id: 'done', status: 'approved', submittedAt: '2026-01-01' }),
    ]
    expect(reviewQueueSkills(skills).map((s) => s.id)).toEqual(['old', 'new'])
  })
})

describe('the seeded catalogue', () => {
  it('has the status mix the marketplace demo needs', () => {
    const by = (s: string) => MARKETPLACE_SKILLS.filter((k) => k.status === s).length
    expect(MARKETPLACE_SKILLS).toHaveLength(16)
    expect(by('approved')).toBe(11)
    expect(by('in_review')).toBe(3)
    expect(by('blocked')).toBe(2)
  })

  it('gives every skill a scan with evidence', () => {
    for (const s of MARKETPLACE_SKILLS) {
      expect(s.scan.findings.length, s.id).toBeGreaterThanOrEqual(3)
    }
  })

  it('never leaves a non-approved skill without a reason', () => {
    for (const s of MARKETPLACE_SKILLS.filter((k) => k.status !== 'approved')) {
      expect(s.note, s.id).toBeTruthy()
      expect(s.reviewer, s.id).toBeTruthy()
    }
  })

  it('backs every unapproved status with at least one real finding', () => {
    for (const s of MARKETPLACE_SKILLS.filter((k) => k.status !== 'approved')) {
      expect(blockingFindings(s.scan).length, s.id).toBeGreaterThan(0)
    }
  })

  it('uses unique ids', () => {
    const ids = MARKETPLACE_SKILLS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
