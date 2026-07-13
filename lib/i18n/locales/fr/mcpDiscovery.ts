export const mcpDiscovery = {
  title: 'Découverte de serveurs MCP',
  subtitle:
    'Analysez les configurations des postes et le trafic sortant pour détecter les serveurs Model Context Protocol, puis examinez le transport, l’authentification, l’éditeur et les permissions d’outils de chacun.', // TODO(i18n): native review
  badge: 'Démo simulée',
  backToDiscover: 'Retour à Découvrir',
  scan: {
    heading: 'Analyser le parc à la recherche de serveurs MCP',
    description:
      'Parcourt les postes gérés à la recherche de configurations MCP — Claude Desktop, Claude Code, Cursor et VS Code — ainsi que le trafic sortant vers des points de terminaison MCP connus.', // TODO(i18n): native review
    start: 'Analyser les serveurs MCP',
    skip: 'Passer l’animation',
    found: '{count} trouvés',
    rescan: 'Relancer l’analyse',
  },
  summary: {
    totalServers: 'Serveurs MCP',
    endpointsWithMcp: 'Postes exécutant MCP',
    unsanctioned: 'Non approuvés',
    highRisk: 'Risque élevé',
  },
  table: {
    heading: 'Serveurs MCP découverts',
    server: 'Serveur',
    clients: 'Clients',
    transport: 'Transport',
    auth: 'Auth',
    publisher: 'Éditeur',
    endpoints: 'Postes',
    risk: 'Risque',
  },
  detail: {
    permissions: 'Permissions d’outils',
    riskFlags: 'Signaux de risque',
    noFlags: 'Aucun signal de risque',
    sanctioned: 'Approuvé',
    unsanctioned: 'Non approuvé',
  },
  auth: {
    none: 'Aucune',
    apiKey: 'Clé API',
    oauth: 'OAuth',
  },
  publisher: {
    verified: 'Vérifié',
    community: 'Communauté',
    unknown: 'Inconnu',
  },
  risk: {
    high: 'Élevé',
    medium: 'Moyen',
    low: 'Faible',
  },
}
