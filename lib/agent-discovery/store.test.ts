// lib/agent-discovery/store.test.ts
import { describe, it, expect } from 'vitest'
import { shadowAgentToUseCase } from './store'
import type { DiscoveredAgent } from './types'

const shadow: DiscoveredAgent = {
  id: 'aws-3', name: 'Customer Refund Adjudicator', cloud: 'aws', registry: 'Bedrock AgentCore',
  owner: 'unknown', protocol: 'none', purpose: 'Approves customer refunds.', approvalState: 'unregistered',
  dataClassification: 'restricted', regulatoryScope: ['PCI-DSS'], region: 'us-west-2',
  residencyOk: true, manifestComplete: false,
}

describe('shadowAgentToUseCase', () => {
  const uc = shadowAgentToUseCase(shadow, '2026-06-10T00:00:00.000Z')

  it('maps to a discovered, auto-detect use case with no owner', () => {
    expect(uc.status).toBe('discovered')
    expect(uc.discoveryMethod).toBe('auto-detect')
    expect(uc.ownerId).toBeNull()
  })

  it('carries the agent name, purpose, and data classification', () => {
    expect(uc.name).toBe('Customer Refund Adjudicator')
    expect(uc.description).toContain('Approves customer refunds')
    expect(uc.dataClassification).toBe('restricted')
  })

  it('seeds an all-gap compliance status', () => {
    expect(uc.complianceStatus).toEqual({ euAiAct: 'gap', nistAiRmf: 'gap', owaspLlm: 'gap', iso42001: 'gap' })
  })

  it('seeds a shadow-ai risk with no mitigations and empty model/mitigation arrays', () => {
    expect(uc.models).toEqual([])
    expect(uc.mitigations).toEqual([])
    expect(uc.risks).toHaveLength(1)
    expect(uc.risks[0].category).toBe('shadow-ai')
    expect(uc.risks[0].mitigations).toEqual([])
  })

  it('stamps createdAt/lastReviewedAt from the provided iso', () => {
    expect(uc.createdAt).toBe('2026-06-10T00:00:00.000Z')
    expect(uc.lastReviewedAt).toBe('2026-06-10T00:00:00.000Z')
  })

  it('produces a stable, unique-ish id derived from the agent id', () => {
    expect(uc.id).toContain('aws-3')
  })
})
