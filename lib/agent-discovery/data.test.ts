// lib/agent-discovery/data.test.ts
import { describe, it, expect } from 'vitest'
import { CLOUD_AGENTS } from './data'

const APPROVAL = new Set(['approved', 'pending', 'unregistered'])
const CLASS = new Set(['public', 'internal', 'confidential', 'restricted'])
const PROTO = new Set(['mcp', 'a2a', 'none'])
const CLOUDS = new Set(['aws', 'azure', 'gcp'])

describe('CLOUD_AGENTS fixture', () => {
  it('has agents across all three clouds', () => {
    for (const c of CLOUDS) expect(CLOUD_AGENTS.some(a => a.cloud === c)).toBe(true)
  })

  it('every agent has valid required fields and enums', () => {
    for (const a of CLOUD_AGENTS) {
      expect(a.id).toBeTruthy()
      expect(a.name).toBeTruthy()
      expect(CLOUDS.has(a.cloud)).toBe(true)
      expect(a.registry).toBeTruthy()
      expect(PROTO.has(a.protocol)).toBe(true)
      expect(APPROVAL.has(a.approvalState)).toBe(true)
      expect(CLASS.has(a.dataClassification)).toBe(true)
      expect(Array.isArray(a.regulatoryScope)).toBe(true)
      expect(typeof a.residencyOk).toBe('boolean')
      expect(typeof a.manifestComplete).toBe('boolean')
    }
  })

  it('has unique ids', () => {
    const ids = CLOUD_AGENTS.map(a => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('is non-trivial: at least one of each approval state + a residency + a manifest gap + a restricted agent', () => {
    expect(CLOUD_AGENTS.some(a => a.approvalState === 'approved')).toBe(true)
    expect(CLOUD_AGENTS.some(a => a.approvalState === 'pending')).toBe(true)
    expect(CLOUD_AGENTS.some(a => a.approvalState === 'unregistered')).toBe(true)
    expect(CLOUD_AGENTS.some(a => !a.residencyOk)).toBe(true)
    expect(CLOUD_AGENTS.some(a => !a.manifestComplete)).toBe(true)
    expect(CLOUD_AGENTS.some(a => a.dataClassification === 'restricted')).toBe(true)
  })
})
