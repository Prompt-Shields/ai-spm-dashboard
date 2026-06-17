export const discover = {
  title: 'Découvrir',
  subtitle:
    "Quatre façons de découvrir les outils et cas d'usage de l'IA dans votre organisation — utilisez-en une ou combinez-les", // TODO(i18n): native review
  cards: {
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
