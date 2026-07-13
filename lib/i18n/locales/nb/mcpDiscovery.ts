export const mcpDiscovery = {
  title: 'MCP-serveroppdagelse',
  subtitle:
    'Skann endepunktkonfigurasjoner og utgående trafikk for Model Context Protocol-servere, og gjennomgå transport, autentisering, utgiver og verktøytillatelser for hver av dem.', // TODO(i18n): native review
  badge: 'Simulert demo',
  backToDiscover: 'Tilbake til Oppdag',
  scan: {
    heading: 'Skann flåten etter MCP-servere',
    description:
      'Gjennomsøker administrerte endepunkter etter MCP-konfigurasjon — Claude Desktop, Claude Code, Cursor og VS Code — samt utgående trafikk mot kjente MCP-endepunkter.', // TODO(i18n): native review
    start: 'Skann etter MCP-servere',
    skip: 'Hopp over animasjon',
    found: '{count} funnet',
    rescan: 'Kjør skann på nytt',
  },
  summary: {
    totalServers: 'MCP-servere',
    endpointsWithMcp: 'Endepunkter som kjører MCP',
    unsanctioned: 'Ikke godkjente',
    highRisk: 'Høy risiko',
  },
  table: {
    heading: 'Oppdagede MCP-servere',
    server: 'Server',
    clients: 'Klienter',
    transport: 'Transport',
    auth: 'Aut.',
    publisher: 'Utgiver',
    endpoints: 'Endepunkter',
    risk: 'Risiko',
  },
  detail: {
    permissions: 'Verktøytillatelser',
    riskFlags: 'Risikoflagg',
    noFlags: 'Ingen risikoflagg',
    sanctioned: 'Godkjent',
    unsanctioned: 'Ikke godkjent',
  },
  auth: {
    none: 'Ingen',
    apiKey: 'API-nøkkel',
    oauth: 'OAuth',
  },
  publisher: {
    verified: 'Verifisert',
    community: 'Fellesskap',
    unknown: 'Ukjent',
  },
  risk: {
    high: 'Høy',
    medium: 'Middels',
    low: 'Lav',
  },
}
