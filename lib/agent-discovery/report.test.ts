// lib/agent-discovery/report.test.ts
import { describe, it, expect } from 'vitest'
import { buildComplianceReport } from './report'
import type { DiscoveredAgent } from './types'

function agent(p: Partial<DiscoveredAgent>): DiscoveredAgent {
  return {
    id: 'x', name: 'X', cloud: 'aws', registry: 'Bedrock AgentCore', owner: 'o',
    protocol: 'mcp', purpose: 'p', approvalState: 'approved', dataClassification: 'internal',
    regulatoryScope: [], region: 'us-east-1', residencyOk: true, manifestComplete: true, ...p,
  }
}

describe('buildComplianceReport', () => {
  it('returns all-zero report for empty input', () => {
    const r = buildComplianceReport([])
    expect(r.total).toBe(0)
    expect(r.shadow).toBe(0)
    expect(r.registered).toBe(0)
    expect(r.recommendedActions).toEqual([])
    expect(r.perCloud).toEqual([
      { cloud: 'aws', total: 0, shadow: 0 },
      { cloud: 'azure', total: 0, shadow: 0 },
      { cloud: 'gcp', total: 0, shadow: 0 },
    ])
  })

  it('counts approval states, residency, manifest, restricted', () => {
    const r = buildComplianceReport([
      agent({ id: '1', approvalState: 'approved' }),
      agent({ id: '2', approvalState: 'pending' }),
      agent({ id: '3', approvalState: 'unregistered', residencyOk: false, dataClassification: 'restricted' }),
      agent({ id: '4', approvalState: 'unregistered', manifestComplete: false }),
    ])
    expect(r.total).toBe(4)
    expect(r.registered).toBe(1)
    expect(r.pending).toBe(1)
    expect(r.shadow).toBe(2)
    expect(r.residencyViolations).toBe(1)
    expect(r.missingManifests).toBe(1)
    expect(r.restrictedDataAgents).toBe(1)
  })

  it('tallies perCloud totals and shadow counts', () => {
    const r = buildComplianceReport([
      agent({ id: '1', cloud: 'aws', approvalState: 'unregistered' }),
      agent({ id: '2', cloud: 'aws', approvalState: 'approved' }),
      agent({ id: '3', cloud: 'gcp', approvalState: 'unregistered' }),
    ])
    expect(r.perCloud).toEqual([
      { cloud: 'aws', total: 2, shadow: 1 },
      { cloud: 'azure', total: 0, shadow: 0 },
      { cloud: 'gcp', total: 1, shadow: 1 },
    ])
  })

  it('derives recommended actions only for non-zero categories, ordered', () => {
    const r = buildComplianceReport([
      agent({ id: '1', approvalState: 'unregistered' }),
      agent({ id: '2', approvalState: 'unregistered', residencyOk: false }),
      agent({ id: '3', manifestComplete: false }),
      agent({ id: '4', dataClassification: 'restricted' }),
    ])
    expect(r.recommendedActions).toEqual([
      { kind: 'registerShadow', count: 2 },
      { kind: 'remediateResidency', count: 1 },
      { kind: 'completeManifests', count: 1 },
      { kind: 'reviewRestricted', count: 1 },
    ])
  })

  it('omits an action when its count is zero', () => {
    const r = buildComplianceReport([agent({ id: '1', approvalState: 'approved' })])
    expect(r.recommendedActions).toEqual([])
  })
})
