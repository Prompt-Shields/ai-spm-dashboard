export const discover = {
  title: 'Découvrir',
  subtitle:
    "Sept façons de découvrir les outils et cas d'usage de l'IA dans votre organisation — utilisez-en une ou combinez-les", // TODO(i18n): native review
  cards: {
    mcpDiscovery: {
      title: 'Découverte de serveurs MCP',
      description:
        'Analysez les configurations des postes pour détecter les serveurs Model Context Protocol — voyez ce que les employés ont branché sur Claude, Cursor et VS Code, avec transport, authentification et risque de permissions.', // TODO(i18n): native review
      action: 'Analyser les serveurs MCP',
    },
    voiceInterview: {
      title: 'Entretien vocal IA',
      description:
        "Menez un entretien vocal avec n'importe quel employé. L'agent IA l'interroge sur ses outils IA et ses agents autonomes, et documente chaque cas d'usage directement à partir de la conversation.", // TODO(i18n): native review
      action: "Démarrer l'entretien vocal",
    },
    defenderImport: {
      title: "Import de capture d'écran Defender",
      description:
        "Téléversez une capture d'écran de la liste des applications fantômes de Microsoft Defender for Cloud Apps. L'agent extrait les applications, enrichit chacune d'elles et les ajoute à votre inventaire.", // TODO(i18n): native review
      action: "Importer une capture",
    },
    cisoCampaign: {
      title: 'Campagne de découverte IA',
      description:
        "Envoyez des agents IA pour interroger tous les services. Les agents posent des questions sur l'usage des outils IA, le traitement des données et l'exposition aux risques.", // TODO(i18n): native review
      action: 'Lancer la campagne',
    },
    agenticMonitoring: {
      title: 'Surveillance agentique',
      description:
        "Des agents en continu sur les postes, les applications de bureau et l'extension de navigateur. L'usage de l'IA est observé en temps réel et les cas d'usage remontent automatiquement — sans sollicitation ni attente.", // TODO(i18n): native review
      action: "Voir l'activité",
    },
    selfRegistration: {
      title: 'Auto-enregistrement des employés',
      description:
        "Partagez un lien avec le personnel. Un agent IA les interroge de manière conversationnelle et extrait automatiquement les données de cas d'usage.", // TODO(i18n): native review
      action: 'Copier le lien',
    },
    autoDetect: {
      title: 'Intégrations',
      description:
        "Connectez-vous à vos systèmes existants — Entra-ID, votre parc SaaS et CASB — pour détecter automatiquement les outils IA non gouvernés dès leur apparition.", // TODO(i18n): native review
      action: 'Examiner les alertes',
      badge: '{count} nouveaux',
    },
  },
  stats: {
    toolsDiscovered: "Outils d'IA découverts",
    vendorsInUse: 'Fournisseurs utilisés',
    useCasesIdentified: "Cas d'usage identifiés",
    shadowAiDetected: 'IA fantôme détectée',
  },
  conversations: 'Conversations des agents',
  sampleData: 'Données de démonstration',
}
