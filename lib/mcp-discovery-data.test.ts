import { describe, expect, it } from 'vitest'
import {
  MCP_SERVERS,
  MCP_SUMMARY,
  SCAN_SOURCES,
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
    expect(
      serverRiskLevel(
        server({
          riskFlags: [
            { severity: 'low', label: 'a' },
            { severity: 'medium', label: 'b' },
          ],
        }),
      ),
    ).toBe('medium')
  })
})

describe('MCP_SUMMARY', () => {
  it('derives counts from the seeded server list', () => {
    expect(MCP_SUMMARY.totalServers).toBe(MCP_SERVERS.length)
    expect(MCP_SUMMARY.unsanctioned).toBe(MCP_SERVERS.filter((s) => !s.sanctioned).length)
    expect(MCP_SUMMARY.highRisk).toBe(
      MCP_SERVERS.filter((s) => serverRiskLevel(s) === 'high').length,
    )
    expect(MCP_SUMMARY.endpointsWithMcp).toBeGreaterThan(0)
  })
})

describe('seeded MCP servers', () => {
  it('every server names at least one client app and one permission', () => {
    for (const s of MCP_SERVERS) {
      expect(s.clients.length).toBeGreaterThan(0)
      expect(s.permissions.length).toBeGreaterThan(0)
    }
  })

  it('covers the risk narrative: sanctioned low-risk and unsanctioned high-risk servers', () => {
    expect(MCP_SERVERS.some((s) => s.sanctioned && serverRiskLevel(s) === 'low')).toBe(true)
    expect(MCP_SERVERS.some((s) => !s.sanctioned && serverRiskLevel(s) === 'high')).toBe(true)
  })
})

describe('SCAN_SOURCES', () => {
  it('found counts sum to the number of seeded servers', () => {
    expect(SCAN_SOURCES.reduce((s, src) => s + src.found, 0)).toBe(MCP_SERVERS.length)
  })

  it('every source has a positive duration', () => {
    for (const src of SCAN_SOURCES) expect(src.durationMs).toBeGreaterThan(0)
  })
})
