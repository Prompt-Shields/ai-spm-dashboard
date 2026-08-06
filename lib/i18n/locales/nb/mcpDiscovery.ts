export const mcpDiscovery = {
  title: 'MCP-serveroppdagelse',
  subtitle:
    'Slå sammen endepunktkonfigurasjoner, utgående trafikk, kildekode og EDR-telemetri til én deduplisert oversikt over Model Context Protocol-servere, med transport, autentisering, utgiver og verktøytillatelser for hver av dem.', // TODO(i18n): native review
  badge: 'Simulert demo',
  backToDiscover: 'Tilbake til Oppdag',
  scan: {
    heading: 'Skann flåten etter MCP-servere',
    description:
      'Fire innsamlere søker parallelt — endepunktkonfigurasjoner, utgående trafikk, versjonerte .mcp.json i kildekode og EDR-prosesstelemetri — deretter fletter korrelasjonen observasjonene til én oversikt.', // TODO(i18n): native review
    start: 'Kjør oppdagelsesskann',
    skip: 'Hopp over animasjon',
    found: '{count} funnet',
    observations: '{count} observasjoner',
    correlate: 'Korreler og dedupliser',
    correlateDetail: 'Flett observasjoner etter identitet, kryss mot godkjentlisten, vurder risiko', // TODO(i18n): native review
    observedProgress: '{observed} / {total} observasjoner',
    rescan: 'Kjør skann på nytt',
  },
  fusion: {
    note: '{observations} observasjoner fra {collectors} innsamlere flettet til {servers} servere. En server som bare én innsamler ser, er et skygge-MCP-signal.', // TODO(i18n): native review
  },
  sources: {
    count: '{count} kilder',
    single: 'Kun {name}',
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
    sources: 'Kilder',
    transport: 'Transport',
    auth: 'Aut.',
    publisher: 'Utgiver',
    endpoints: 'Endepunkter',
    risk: 'Risiko',
  },
  detail: {
    clients: 'Klientapper',
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
