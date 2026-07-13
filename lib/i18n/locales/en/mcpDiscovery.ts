export const mcpDiscovery = {
  title: 'MCP Server Discovery',
  subtitle:
    'Scan endpoint configs and network egress for Model Context Protocol servers, then review transport, auth, publisher and tool permissions for each.',
  badge: 'Simulated demo',
  backToDiscover: 'Back to Discover',
  scan: {
    heading: 'Scan the fleet for MCP servers',
    description:
      'Sweeps managed endpoints for MCP configuration — Claude Desktop, Claude Code, Cursor and VS Code — plus network egress to known MCP endpoints.',
    start: 'Scan for MCP servers',
    skip: 'Skip animation',
    found: '{count} found',
    rescan: 'Re-run scan',
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
    transport: 'Transport',
    auth: 'Auth',
    publisher: 'Publisher',
    endpoints: 'Endpoints',
    risk: 'Risk',
  },
  detail: {
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
