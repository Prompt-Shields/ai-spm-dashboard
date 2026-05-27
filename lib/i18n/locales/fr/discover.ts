export const discover = {
  title: 'Découvrir',
  subtitle:
    "Des agents IA interrogent les employés pour cartographier les cas d'usage de l'IA — sans formulaires ni saisie manuelle", // TODO(i18n): native review
  cards: {
    cisoCampaign: {
      title: 'Campagne de découverte du RSSI',
      description:
        "Envoyez des agents IA pour interroger tous les services. Les agents posent des questions sur l'usage des outils IA, le traitement des données et l'exposition aux risques.", // TODO(i18n): native review
      action: 'Lancer la campagne',
    },
    selfRegistration: {
      title: 'Auto-enregistrement des employés',
      description:
        "Partagez un lien avec le personnel. Un agent IA les interroge de manière conversationnelle et extrait automatiquement les données de cas d'usage.", // TODO(i18n): native review
      action: 'Copier le lien',
    },
    autoDetect: {
      title: 'Détection automatique via Okta',
      description:
        '12 nouveaux outils IA détectés dans votre parc SaaS cette semaine. Examinez et déclenchez des agents de prise en charge pour les outils non gouvernés.', // TODO(i18n): native review
      action: 'Examiner les alertes',
      badge: '{count} nouveaux',
    },
  },
  stats: {
    outreachSent: 'Sollicitations envoyées',
    responded: 'Répondu',
    useCasesIdentified: "Cas d'usage identifiés",
    shadowAiDetected: 'IA fantôme détectée',
  },
  conversations: 'Conversations des agents',
}
