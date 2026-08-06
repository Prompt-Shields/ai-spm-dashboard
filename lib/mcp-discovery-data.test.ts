import { describe, expect, it } from 'vitest'
import {
  ALL_OBSERVATIONS,
  COLLECTORS,
  MCP_SERVERS,
  MCP_SUMMARY,
  SANCTIONED_IDENTITIES,
  correlate,
  scoreServer,
  serverRiskLevel,
  type McpServer,
} from './mcp-discovery-data'

const server = (overrides: Partial<McpServer>): McpServer => ({
  id: 'test',
  name: 'Test server',
  source: '@test/mcp',
  transport: 'stdio',
  clients: ['Claude Desktop'],
  endpoints: 1,
  auth: 'oauth',
  publisher: 'verified',
  permissions: ['Network access'],
  sanctioned: true,
  collectors: ['endpoint-agent'],
  riskFlags: [],
  ...overrides,
})

describe('serverRiskLevel', () => {
  it('is low when there are no risk flags', () => {
    expect(serverRiskLevel(server({ riskFlags: [] }))).toBe('low')
  })

  it('returns the highest severity among flags', () => {
    expect(
      serverRiskLevel(
        server({
          riskFlags: [
            { severity: 'low', label: 'a' },
            { severity: 'high', label: 'b' },
            { severity: 'medium', label: 'c' },
          ],
        }),
      ),
    ).toBe('high')
  })
})

describe('correlate', () => {
  it('fuses observations that share an identity into one server', () => {
    const merged = correlate([
      { collector: 'endpoint-agent', identity: 'npm:x', name: 'X', source: '@x', transport: 'stdio', client: 'Claude Code', devices: 5, auth: 'oauth', publisher: 'verified', permissions: ['Read'], evidence: 'config' },
      { collector: 'edr', identity: 'npm:x', name: 'X', source: '@x', transport: 'stdio', devices: 9, evidence: 'process' },
    ])
    expect(merged).toHaveLength(1)
    expect(merged[0].collectors).toEqual(['endpoint-agent', 'edr'])
    // Endpoints is the max across collectors, not the sum.
    expect(merged[0].endpoints).toBe(9)
  })

  it('unions clients and permissions across sightings', () => {
    const merged = correlate([
      { collector: 'endpoint-agent', identity: 'npm:y', name: 'Y', source: '@y', transport: 'stdio', client: 'Cursor', permissions: ['Read'], evidence: 'a' },
      { collector: 'repo-scan', identity: 'npm:y', name: 'Y', source: '@y', transport: 'stdio', client: 'project .mcp.json', permissions: ['Write'], evidence: 'b' },
    ])
    expect(merged[0].clients).toEqual(['Cursor', 'project .mcp.json'])
    expect(merged[0].permissions.sort()).toEqual(['Read', 'Write'])
  })

  it('marks a server sanctioned only when its identity is on the allowlist', () => {
    const [approved] = correlate([
      { collector: 'edr', identity: [...SANCTIONED_IDENTITIES][0], name: 'A', source: 's', transport: 'stdio', evidence: 'e' },
    ])
    const [shadow] = correlate([
      { collector: 'egress', identity: 'host:not-on-list', name: 'B', source: 's', transport: 'sse', auth: 'none', evidence: 'e' },
    ])
    expect(approved.sanctioned).toBe(true)
    expect(shadow.sanctioned).toBe(false)
  })
})

describe('scoreServer', () => {
  it('flags an egress-only sighting as shadow MCP', () => {
    const flags = scoreServer({ ...server({}), collectors: ['egress'], sanctioned: false })
    expect(flags.some((f) => f.severity === 'high' && /shadow/i.test(f.label))).toBe(true)
  })

  it('flags an unknown publisher with shell-exec as high risk', () => {
    const flags = scoreServer({
      ...server({ permissions: ['Shell exec'], publisher: 'unknown' }),
      collectors: ['endpoint-agent', 'edr'],
      sanctioned: false,
    })
    expect(flags.some((f) => f.severity === 'high')).toBe(true)
  })
})

describe('MCP_SUMMARY', () => {
  it('derives counts from the correlated server list', () => {
    expect(MCP_SUMMARY.totalServers).toBe(MCP_SERVERS.length)
    expect(MCP_SUMMARY.unsanctioned).toBe(MCP_SERVERS.filter((s) => !s.sanctioned).length)
    expect(MCP_SUMMARY.highRisk).toBe(
      MCP_SERVERS.filter((s) => serverRiskLevel(s) === 'high').length,
    )
    expect(MCP_SUMMARY.endpointsWithMcp).toBeGreaterThan(0)
  })
})

describe('seeded discovery inventory', () => {
  it('every correlated server records its sources and reach', () => {
    for (const s of MCP_SERVERS) {
      expect(s.collectors.length).toBeGreaterThan(0)
      expect(s.permissions.length).toBeGreaterThan(0)
      expect(s.endpoints).toBeGreaterThan(0)
    }
  })

  it('covers the risk narrative: sanctioned low-risk and unsanctioned high-risk servers', () => {
    expect(MCP_SERVERS.some((s) => s.sanctioned && serverRiskLevel(s) === 'low')).toBe(true)
    expect(MCP_SERVERS.some((s) => !s.sanctioned && serverRiskLevel(s) === 'high')).toBe(true)
  })

  it('surfaces a shadow server that only one collector saw', () => {
    expect(MCP_SERVERS.some((s) => s.collectors.length === 1)).toBe(true)
  })

  it('every observation carries evidence and an identity', () => {
    for (const o of ALL_OBSERVATIONS) {
      expect(o.evidence.length).toBeGreaterThan(0)
      expect(o.identity.length).toBeGreaterThan(0)
    }
  })

  it('every collector has a positive duration and at least one observation', () => {
    for (const c of COLLECTORS) {
      expect(c.durationMs).toBeGreaterThan(0)
      expect(c.observations.length).toBeGreaterThan(0)
    }
  })
})
