// MCP Server Discovery — seeded observations + a real fusion pipeline.
//
// Drives the discovery flow at /discover/mcp. Unlike a single scripted
// animation, this models the *real* architecture an AI-SPM would use: four
// independent collectors each emit low-level Observations (a sighting of an
// MCP server from one vantage point), and a correlation pass fuses them into a
// deduplicated inventory. The collector payloads below are illustrative,
// English-only sample data — but correlate()/scoreServer() are the genuine
// logic a live scanner would run, so the demo shows how the pipeline works.
//
//   COLLECTORS ──emit──▶ Observation[] ──correlate()──▶ McpServer[] ──scoreServer()
//
// No single collector sees everything: config collectors miss remote-only
// servers, egress telemetry misses local stdio servers. Fusion is what turns
// partial sightings into one high-confidence row — and a server seen by only
// one collector (e.g. network egress) is exactly the shadow-MCP signal an SPM
// cares about.

export type McpTransport = 'stdio' | 'http' | 'sse'
export type McpAuth = 'none' | 'api-key' | 'oauth'
export type McpPublisher = 'verified' | 'community' | 'unknown'
export type RiskSeverity = 'high' | 'medium' | 'low'

/** Which vantage point produced an observation. */
export type CollectorId = 'endpoint-agent' | 'egress' | 'repo-scan' | 'edr'

export interface McpRiskFlag {
  severity: RiskSeverity
  label: string
}

/** A single sighting of an MCP server from one collector's vantage point.
 * Fields are partial by design — each collector only knows what it can see. */
export interface Observation {
  collector: CollectorId
  identity: string // normalized identity key (npm pkg or host); the merge key
  name: string
  source: string // npm package or remote URL
  transport: McpTransport
  client?: string // config-based collectors: the app that referenced it
  devices?: number // machines this collector saw it on
  auth?: McpAuth
  publisher?: McpPublisher
  permissions?: string[]
  evidence: string // human-readable: what this collector actually observed
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
  collectors: CollectorId[] // which collectors corroborated this server
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

// ---------------------------------------------------------------------------
// Policy: the sanctioned allowlist. `sanctioned` is a policy decision, not
// something a collector can observe — correlation joins each server's identity
// against this set. Anything discovered but absent here is shadow MCP.

export const SANCTIONED_IDENTITIES = new Set<string>([
  'npm:@modelcontextprotocol/server-github',
  'npm:@modelcontextprotocol/server-slack',
  'host:mcp.notion.com',
  'npm:@modelcontextprotocol/server-postgres',
  'host:git.internal',
])

// ---------------------------------------------------------------------------
// Collectors and their seeded observations. Each collector is blind to the
// others; overlaps are intentional so correlation has something to fuse.

export interface Collector {
  id: CollectorId
  label: string
  detail: string
  durationMs: number
  observations: Observation[]
}

export const COLLECTORS: Collector[] = [
  {
    id: 'endpoint-agent',
    label: 'Endpoint agent',
    detail: 'Reads claude_desktop_config.json, ~/.claude.json, .cursor/mcp.json, VS Code settings',
    durationMs: 1400,
    observations: [
      { collector: 'endpoint-agent', identity: 'npm:@modelcontextprotocol/server-github', name: 'GitHub MCP', source: '@modelcontextprotocol/server-github', transport: 'stdio', client: 'Claude Code', devices: 148, auth: 'oauth', publisher: 'verified', permissions: ['Repository read/write', 'Issue & PR management'], evidence: 'Listed in 148 Claude Code / Desktop / Cursor configs' },
      { collector: 'endpoint-agent', identity: 'npm:@modelcontextprotocol/server-slack', name: 'Slack MCP', source: '@modelcontextprotocol/server-slack', transport: 'stdio', client: 'Claude Desktop', devices: 62, auth: 'oauth', publisher: 'verified', permissions: ['Read channels', 'Post messages'], evidence: 'Listed in 62 Claude Desktop configs' },
      { collector: 'endpoint-agent', identity: 'host:mcp.notion.com', name: 'Notion MCP', source: 'https://mcp.notion.com/mcp', transport: 'http', client: 'Claude Desktop', devices: 87, auth: 'oauth', publisher: 'verified', permissions: ['Read & edit workspace pages'], evidence: 'Remote MCP entry in 87 Claude Desktop / Code configs' },
      { collector: 'endpoint-agent', identity: 'npm:@modelcontextprotocol/server-postgres', name: 'Postgres MCP (prod replica)', source: '@modelcontextprotocol/server-postgres', transport: 'stdio', client: 'Claude Code', devices: 19, auth: 'api-key', publisher: 'verified', permissions: ['SQL read', 'SQL write'], evidence: 'Connection string to prod replica found in 19 configs' },
      { collector: 'endpoint-agent', identity: 'npm:@modelcontextprotocol/server-filesystem', name: 'Filesystem MCP', source: '@modelcontextprotocol/server-filesystem', transport: 'stdio', client: 'Claude Desktop', devices: 113, auth: 'none', publisher: 'community', permissions: ['Filesystem read', 'Filesystem write'], evidence: 'Home-dir write scope in 113 Desktop / Code / VS Code configs' },
      { collector: 'endpoint-agent', identity: 'npm:mcp-web-scraper-pro', name: 'web-scraper-pro', source: 'mcp-web-scraper-pro (npm)', transport: 'stdio', client: 'Cursor', devices: 6, auth: 'none', publisher: 'unknown', permissions: ['Shell exec', 'Network access', 'Filesystem write'], evidence: 'Unknown-publisher package in 6 Cursor configs' },
      { collector: 'endpoint-agent', identity: 'host:git.internal', name: 'Internal KB MCP', source: 'git.internal/platform/kb-mcp', transport: 'http', client: 'Claude Code', devices: 34, auth: 'api-key', publisher: 'community', permissions: ['Read internal wiki', 'Search engineering docs'], evidence: 'Internal HTTP endpoint in 34 Claude Code configs' },
    ],
  },
  {
    id: 'egress',
    label: 'Network egress telemetry',
    detail: 'Firewall / proxy / DNS logs — TLS SNI matched against known MCP endpoints',
    durationMs: 1600,
    observations: [
      { collector: 'egress', identity: 'host:mcp.notion.com', name: 'Notion MCP', source: 'https://mcp.notion.com/mcp', transport: 'http', devices: 84, evidence: 'TLS SNI mcp.notion.com seen from 84 devices' },
      { collector: 'egress', identity: 'host:git.internal', name: 'Internal KB MCP', source: 'git.internal/platform/kb-mcp', transport: 'http', devices: 34, evidence: 'Internal DNS git.internal resolved from 34 devices' },
      // Only the egress collector ever sees this one — it is in no managed config.
      { collector: 'egress', identity: 'host:mcp.crm-context.io', name: 'crm-context (remote)', source: 'https://mcp.crm-context.io/sse', transport: 'sse', devices: 11, auth: 'none', publisher: 'unknown', permissions: ['Read CRM records', 'Customer PII access'], evidence: 'Unmanaged SSE stream to mcp.crm-context.io from 11 devices' },
    ],
  },
  {
    id: 'repo-scan',
    label: 'Source-code scan',
    detail: 'GitHub org — committed .mcp.json and project MCP declarations',
    durationMs: 1000,
    observations: [
      { collector: 'repo-scan', identity: 'npm:@modelcontextprotocol/server-github', name: 'GitHub MCP', source: '@modelcontextprotocol/server-github', transport: 'stdio', client: 'project .mcp.json', evidence: 'Declared in 22 repo .mcp.json files' },
      { collector: 'repo-scan', identity: 'npm:@modelcontextprotocol/server-postgres', name: 'Postgres MCP (prod replica)', source: '@modelcontextprotocol/server-postgres', transport: 'stdio', client: 'project .mcp.json', evidence: 'Declared in 3 backend repo .mcp.json files' },
      { collector: 'repo-scan', identity: 'npm:@modelcontextprotocol/server-filesystem', name: 'Filesystem MCP', source: '@modelcontextprotocol/server-filesystem', transport: 'stdio', client: 'project .mcp.json', evidence: 'Declared in 9 repo .mcp.json files' },
      { collector: 'repo-scan', identity: 'host:git.internal', name: 'Internal KB MCP', source: 'git.internal/platform/kb-mcp', transport: 'http', client: 'project .mcp.json', evidence: 'Declared in the platform monorepo .mcp.json' },
    ],
  },
  {
    id: 'edr',
    label: 'EDR / Defender process telemetry',
    detail: 'Endpoint process argv matched against known MCP server binaries',
    durationMs: 1200,
    observations: [
      { collector: 'edr', identity: 'npm:@modelcontextprotocol/server-github', name: 'GitHub MCP', source: '@modelcontextprotocol/server-github', transport: 'stdio', devices: 140, evidence: 'server-github process observed running on 140 devices' },
      { collector: 'edr', identity: 'npm:@modelcontextprotocol/server-slack', name: 'Slack MCP', source: '@modelcontextprotocol/server-slack', transport: 'stdio', devices: 58, evidence: 'server-slack process observed on 58 devices' },
      { collector: 'edr', identity: 'npm:@modelcontextprotocol/server-postgres', name: 'Postgres MCP (prod replica)', source: '@modelcontextprotocol/server-postgres', transport: 'stdio', devices: 18, evidence: 'server-postgres process observed on 18 devices' },
      { collector: 'edr', identity: 'npm:@modelcontextprotocol/server-filesystem', name: 'Filesystem MCP', source: '@modelcontextprotocol/server-filesystem', transport: 'stdio', devices: 108, evidence: 'server-filesystem process observed on 108 devices' },
      { collector: 'edr', identity: 'npm:mcp-web-scraper-pro', name: 'web-scraper-pro', source: 'mcp-web-scraper-pro (npm)', transport: 'stdio', devices: 6, evidence: 'Spawns headless-browser child process on 6 devices' },
    ],
  },
]

export const ALL_OBSERVATIONS: Observation[] = COLLECTORS.flatMap((c) => c.observations)

// ---------------------------------------------------------------------------
// Fusion. correlate() groups observations by identity and merges each group
// into one McpServer; scoreServer() derives risk flags from the merged shape.

/** Derive risk flags from a merged server. These are the same heuristics a
 * live scanner would apply — capability + trust + exposure. */
export function scoreServer(
  s: Omit<McpServer, 'riskFlags' | 'sanctioned'> & { sanctioned: boolean },
): McpRiskFlag[] {
  const flags: McpRiskFlag[] = []
  const perms = s.permissions
  const remote = s.transport === 'http' || s.transport === 'sse'
  const has = (p: string) => perms.some((x) => x.toLowerCase().includes(p))

  if (s.publisher === 'unknown' && has('shell exec')) {
    flags.push({ severity: 'high', label: 'Unknown publisher with shell-exec tool' })
  }
  if (s.auth === 'none' && remote && (has('pii') || has('crm'))) {
    flags.push({ severity: 'high', label: 'Unauthenticated remote server receiving customer PII' })
  }
  // Shadow signal: only network egress ever saw it — absent from every config.
  if (s.collectors.length === 1 && s.collectors[0] === 'egress') {
    flags.push({ severity: 'high', label: 'Seen only in network egress — in no managed config (shadow MCP)' })
  }
  if (s.transport === 'sse' && s.auth === 'none') {
    flags.push({ severity: 'medium', label: 'Tool descriptions can change server-side (rug-pull risk)' })
  }
  if (has('sql write')) {
    flags.push({ severity: 'medium', label: 'Write access to a production database replica' })
  }
  if (has('filesystem write') && s.publisher !== 'verified' && !has('shell exec')) {
    flags.push({ severity: 'medium', label: 'Broad filesystem write scoped to home directory' })
  }
  if (s.publisher === 'unknown' && has('headless')) {
    flags.push({ severity: 'medium', label: 'Downloads and runs headless browser binaries' })
  }
  if (s.auth === 'api-key' && s.publisher === 'verified' && has('sql')) {
    flags.push({ severity: 'low', label: 'Connection string stored in plain-text config' })
  }
  if (s.auth === 'api-key' && s.publisher === 'community') {
    flags.push({ severity: 'low', label: 'Shared API key rotated manually' })
  }
  return flags
}

const COLLECTOR_ORDER: CollectorId[] = ['endpoint-agent', 'egress', 'repo-scan', 'edr']

/** Fuse raw observations into a deduplicated, scored inventory. Pure. */
export function correlate(observations: Observation[]): McpServer[] {
  const groups = new Map<string, Observation[]>()
  for (const o of observations) {
    const g = groups.get(o.identity)
    if (g) g.push(o)
    else groups.set(o.identity, [o])
  }

  const servers: McpServer[] = []
  for (const [identity, obs] of groups) {
    // Prefer the endpoint agent's richer payload as the base when present.
    const primary = obs.find((o) => o.collector === 'endpoint-agent') ?? obs[0]
    const clients = [...new Set(obs.map((o) => o.client).filter((c): c is string => !!c))]
    const permissions = [...new Set(obs.flatMap((o) => o.permissions ?? []))]
    const collectors = COLLECTOR_ORDER.filter((c) => obs.some((o) => o.collector === c))
    const endpoints = Math.max(...obs.map((o) => o.devices ?? 0))
    const auth = obs.find((o) => o.auth)?.auth ?? 'none'
    const publisher = obs.find((o) => o.publisher)?.publisher ?? 'unknown'
    const sanctioned = SANCTIONED_IDENTITIES.has(identity)

    const base = {
      id: identity.replace(/[^a-z0-9]+/gi, '-'),
      name: primary.name,
      source: primary.source,
      transport: primary.transport,
      clients: clients.length ? clients : ['(runtime only)'],
      endpoints,
      auth,
      publisher,
      permissions: permissions.length ? permissions : ['(undeclared)'],
      collectors,
      sanctioned,
    }
    servers.push({ ...base, riskFlags: scoreServer(base) })
  }

  // Highest-risk first, then by reach.
  return servers.sort((a, b) => {
    const r = SEVERITY_RANK[serverRiskLevel(b)] - SEVERITY_RANK[serverRiskLevel(a)]
    return r !== 0 ? r : b.endpoints - a.endpoints
  })
}

export const MCP_SERVERS: McpServer[] = correlate(ALL_OBSERVATIONS)

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

/** Labels for the four collectors, in scan order. */
export const COLLECTOR_LABEL: Record<CollectorId, string> = {
  'endpoint-agent': 'Endpoint agent',
  egress: 'Network egress',
  'repo-scan': 'Source-code scan',
  edr: 'EDR / Defender',
}
