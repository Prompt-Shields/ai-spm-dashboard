export const mcpDiscovery = {
  title: 'MCP Server Discovery',
  subtitle:
    'Fuse endpoint configs, network egress, source code and EDR telemetry into one deduplicated inventory of Model Context Protocol servers, with transport, auth, publisher and tool permissions for each.',
  badge: 'Simulated demo',
  backToDiscover: 'Back to Discover',
  scan: {
    heading: 'Scan the fleet for MCP servers',
    description:
      'Four collectors sweep in parallel — endpoint configs, network egress, committed .mcp.json in source, and EDR process telemetry — then correlation fuses their sightings into one inventory.',
    start: 'Run discovery scan',
    skip: 'Skip animation',
    found: '{count} found',
    observations: '{count} observations',
    correlate: 'Correlate & deduplicate',
    correlateDetail: 'Merge sightings by identity, join the sanctioned allowlist, score risk',
    observedProgress: '{observed} / {total} observations',
    rescan: 'Re-run scan',
  },
  fusion: {
    note: '{observations} observations from {collectors} collectors fused into {servers} servers. A server seen by only one collector is a shadow-MCP signal.',
  },
  sources: {
    count: '{count} sources',
    single: '{name} only',
  },
  summary: {
    totalServers: 'MCP servers',
    endpointsWithMcp: 'Endpoints running MCP',
    unsanctioned: 'Unsanctioned',
    highRisk: 'High risk',
  },
  table: {
    heading: 'Discovered MCP servers',
    server: 'Server',
    clients: 'Clients',
    sources: 'Sources',
    transport: 'Transport',
    auth: 'Auth',
    publisher: 'Publisher',
    endpoints: 'Endpoints',
    risk: 'Risk',
  },
  detail: {
    clients: 'Client apps',
    permissions: 'Tool permissions',
    riskFlags: 'Risk flags',
    noFlags: 'No risk flags',
    sanctioned: 'Sanctioned',
    unsanctioned: 'Unsanctioned',
  },
  auth: {
    none: 'None',
    apiKey: 'API key',
    oauth: 'OAuth',
  },
  publisher: {
    verified: 'Verified',
    community: 'Community',
    unknown: 'Unknown',
  },
  risk: {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  },
}
