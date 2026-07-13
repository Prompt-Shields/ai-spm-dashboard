// MCP Server Discovery — seeded, deterministic demo data.
//
// Drives the simulated endpoint scan at /discover/mcp. The "scan" replays
// SCAN_SOURCES theatrically, then the inventory below renders MCP_SERVERS —
// MCP servers "found" in employee tooling configs (Claude Desktop, Claude
// Code, Cursor, VS Code) with the attributes an AI-SPM cares about:
// transport, auth, publisher, tool permissions and risk flags. Inventory
// content is illustrative English-only sample data, mirroring
// voice-interview-data.ts (UI chrome is translated via the `mcpDiscovery`
// i18n namespace; this data is not).

export type McpTransport = 'stdio' | 'http' | 'sse'
export type McpAuth = 'none' | 'api-key' | 'oauth'
export type McpPublisher = 'verified' | 'community' | 'unknown'
export type RiskSeverity = 'high' | 'medium' | 'low'

export interface McpRiskFlag {
  severity: RiskSeverity
  label: string
}

export interface McpServer {
  id: string
  name: string
  source: string // npm package or remote URL
  transport: McpTransport
  clients: string[] // apps whose configs referenced it
  endpoints: number // machines running it
  auth: McpAuth
  publisher: McpPublisher
  permissions: string[]
  sanctioned: boolean
  riskFlags: McpRiskFlag[]
}

const SEVERITY_RANK: Record<RiskSeverity, number> = { high: 2, medium: 1, low: 0 }

/** Highest severity among a server's risk flags; 'low' when it has none. */
export function serverRiskLevel(s: McpServer): RiskSeverity {
  return s.riskFlags.reduce<RiskSeverity>(
    (worst, f) => (SEVERITY_RANK[f.severity] > SEVERITY_RANK[worst] ? f.severity : worst),
    'low',
  )
}

export const MCP_SERVERS: McpServer[] = [
  {
    id: 'github',
    name: 'GitHub MCP',
    source: '@modelcontextprotocol/server-github',
    transport: 'stdio',
    clients: ['Claude Code', 'Claude Desktop', 'Cursor'],
    endpoints: 148,
    auth: 'oauth',
    publisher: 'verified',
    permissions: ['Repository read/write', 'Issue & PR management'],
    sanctioned: true,
    riskFlags: [],
  },
  {
    id: 'slack',
    name: 'Slack MCP',
    source: '@modelcontextprotocol/server-slack',
    transport: 'stdio',
    clients: ['Claude Desktop'],
    endpoints: 62,
    auth: 'oauth',
    publisher: 'verified',
    permissions: ['Read channels', 'Post messages'],
    sanctioned: true,
    riskFlags: [],
  },
  {
    id: 'notion',
    name: 'Notion MCP',
    source: 'https://mcp.notion.com/mcp',
    transport: 'http',
    clients: ['Claude Desktop', 'Claude Code'],
    endpoints: 87,
    auth: 'oauth',
    publisher: 'verified',
    permissions: ['Read & edit workspace pages'],
    sanctioned: true,
    riskFlags: [],
  },
  {
    id: 'postgres-prod',
    name: 'Postgres MCP (prod replica)',
    source: '@modelcontextprotocol/server-postgres',
    transport: 'stdio',
    clients: ['Claude Code', 'Cursor'],
    endpoints: 19,
    auth: 'api-key',
    publisher: 'verified',
    permissions: ['SQL read', 'SQL write'],
    sanctioned: true,
    riskFlags: [
      { severity: 'medium', label: 'Write access to a production database replica' },
      { severity: 'low', label: 'Connection string stored in plain-text config' },
    ],
  },
  {
    id: 'filesystem',
    name: 'Filesystem MCP',
    source: '@modelcontextprotocol/server-filesystem',
    transport: 'stdio',
    clients: ['Claude Desktop', 'Claude Code', 'VS Code'],
    endpoints: 113,
    auth: 'none',
    publisher: 'community',
    permissions: ['Filesystem read', 'Filesystem write'],
    sanctioned: false,
    riskFlags: [{ severity: 'medium', label: 'Broad filesystem write scoped to home directory' }],
  },
  {
    id: 'web-scraper',
    name: 'web-scraper-pro',
    source: 'mcp-web-scraper-pro (npm)',
    transport: 'stdio',
    clients: ['Cursor'],
    endpoints: 6,
    auth: 'none',
    publisher: 'unknown',
    permissions: ['Shell exec', 'Network access', 'Filesystem write'],
    sanctioned: false,
    riskFlags: [
      { severity: 'high', label: 'Unknown publisher with shell-exec tool' },
      { severity: 'medium', label: 'Downloads and runs headless browser binaries' },
    ],
  },
  {
    id: 'remote-sse',
    name: 'crm-context (remote)',
    source: 'https://mcp.crm-context.io/sse',
    transport: 'sse',
    clients: ['Claude Desktop'],
    endpoints: 11,
    auth: 'none',
    publisher: 'unknown',
    permissions: ['Read CRM records', 'Customer PII access'],
    sanctioned: false,
    riskFlags: [
      { severity: 'high', label: 'Unauthenticated remote server receiving customer PII' },
      { severity: 'medium', label: 'Tool descriptions can change server-side (rug-pull risk)' },
    ],
  },
  {
    id: 'internal-kb',
    name: 'Internal KB MCP',
    source: 'git.internal/platform/kb-mcp',
    transport: 'http',
    clients: ['Claude Code'],
    endpoints: 34,
    auth: 'api-key',
    publisher: 'community',
    permissions: ['Read internal wiki', 'Search engineering docs'],
    sanctioned: true,
    riskFlags: [{ severity: 'low', label: 'Shared API key rotated manually' }],
  },
]

/** Fleet-wide count of machines running ≥1 MCP server (seeded; per-server
 * endpoint counts overlap, so this can't be derived by summing them). */
export const ENDPOINTS_WITH_MCP = 214

export interface McpSummary {
  totalServers: number
  endpointsWithMcp: number
  unsanctioned: number
  highRisk: number
}

export const MCP_SUMMARY: McpSummary = {
  totalServers: MCP_SERVERS.length,
  endpointsWithMcp: ENDPOINTS_WITH_MCP,
  unsanctioned: MCP_SERVERS.filter((s) => !s.sanctioned).length,
  highRisk: MCP_SERVERS.filter((s) => serverRiskLevel(s) === 'high').length,
}

// ---------------------------------------------------------------------------
// Scan animation script. `found` counts sum to MCP_SERVERS.length.

export interface ScanSource {
  id: string
  label: string
  detail: string
  found: number
  durationMs: number
}

export const SCAN_SOURCES: ScanSource[] = [
  {
    id: 'claude-desktop',
    label: 'Claude Desktop configs',
    detail: 'claude_desktop_config.json · 214 endpoints',
    found: 3,
    durationMs: 1400,
  },
  {
    id: 'claude-code',
    label: 'Claude Code configs',
    detail: '~/.claude.json & project .mcp.json files',
    found: 2,
    durationMs: 1200,
  },
  {
    id: 'cursor',
    label: 'Cursor settings',
    detail: '.cursor/mcp.json · workspace & global',
    found: 2,
    durationMs: 1000,
  },
  {
    id: 'vscode',
    label: 'VS Code extensions',
    detail: 'settings.json MCP entries',
    found: 0,
    durationMs: 800,
  },
  {
    id: 'network',
    label: 'Network egress',
    detail: 'TLS SNI matching known MCP endpoints',
    found: 1,
    durationMs: 1600,
  },
]
