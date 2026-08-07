export const mcpDiscovery = {
  title: 'Découverte de serveurs MCP',
  subtitle:
    'Fusionnez les configurations des postes, le trafic sortant, le code source et la télémétrie EDR en un inventaire dédupliqué des serveurs Model Context Protocol, avec transport, authentification, éditeur et permissions d’outils pour chacun.', // TODO(i18n): native review
  badge: 'Démo simulée',
  backToDiscover: 'Retour à Découvrir',
  scan: {
    heading: 'Analyser le parc à la recherche de serveurs MCP',
    description:
      'Quatre collecteurs balaient en parallèle — configurations des postes, trafic sortant, fichiers .mcp.json versionnés et télémétrie de processus EDR — puis la corrélation fusionne leurs observations en un seul inventaire.', // TODO(i18n): native review
    start: 'Lancer l’analyse de découverte',
    skip: 'Passer l’animation',
    found: '{count} trouvés',
    observations: '{count} observations',
    correlate: 'Corréler et dédupliquer',
    correlateDetail: 'Fusionner les observations par identité, croiser la liste approuvée, évaluer le risque', // TODO(i18n): native review
    observedProgress: '{observed} / {total} observations',
    rescan: 'Relancer l’analyse',
  },
  fusion: {
    note: '{observations} observations de {collectors} collecteurs fusionnées en {servers} serveurs. Un serveur vu par un seul collecteur est un signal de MCP fantôme.', // TODO(i18n): native review
  },
  sources: {
    count: '{count} sources',
    single: '{name} uniquement',
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
    sources: 'Sources',
    transport: 'Transport',
    auth: 'Auth',
    publisher: 'Éditeur',
    endpoints: 'Postes',
    risk: 'Risque',
  },
  detail: {
    clients: 'Applications clientes',
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
