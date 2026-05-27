export const modelRisk = {
  title: 'Risque du modèle',
  subtitle: "Évaluer le comportement, les risques et les cas d'usage du modèle", // TODO(i18n): native review
  riskLevel: {
    high: 'Élevé',
    medium: 'Moyen',
    low: 'Faible',
  },
  riskLevelBadge: 'Risque {level}',
  dimensions: {
    hallucination: 'Hallucination',
    bias: 'Biais',
    toxicity: 'Toxicité',
    privacy: 'Confidentialité',
  },
  approvedUseCases: "Cas d'usage approuvés",
  tabs: {
    details: 'Détails',
    risk: 'Évaluation des risques',
    apps: 'Applications',
    pricing: 'Tarification',
    mitigations: 'Mesures d’atténuation',
  },
  modelInfo: {
    title: 'Informations sur le modèle',
    provider: 'Fournisseur',
    version: 'Version',
    type: 'Type',
    parameters: 'Paramètres',
    status: 'Statut',
  },
  strengthsWeaknesses: {
    title: 'Forces et faiblesses',
    strengths: 'Forces',
    weaknesses: 'Faiblesses',
  },
  riskAssessment: {
    hallucinationLabel: "Risque d'hallucination",
    hallucinationDesc: 'Génération de fausses informations', // TODO(i18n): native review
    biasLabel: 'Risque de biais',
    biasDesc: 'Résultats potentiellement injustes', // TODO(i18n): native review
    toxicityLabel: 'Risque de toxicité',
    toxicityDesc: 'Génération de contenu nuisible', // TODO(i18n): native review
    privacyLabel: 'Risque pour la confidentialité',
    privacyDesc: 'Préoccupations liées à l’exposition des données', // TODO(i18n): native review
    scoreOutOf: '{score}/100',
  },
  activeAlerts: 'Alertes actives',
  apps: {
    internalTitle: 'Applications internes',
    publicTitle: 'Applications publiques',
    noInternal: 'Aucune application interne',
    noPublic: 'Aucune application publique',
    queriesPerMonth: '{count} requêtes/mois',
    users: '{count} utilisateurs',
  },
  pricing: {
    title: 'Informations tarifaires',
    inputCost: "Coût d'entrée",
    outputCost: 'Coût de sortie',
    contextWindow: 'Fenêtre de contexte',
    estMonthly: 'Est. mensuel',
    notAvailable: 'Informations tarifaires non disponibles',
  },
  mitigations: {
    title: 'Mesures d’atténuation des risques',
  },
}
