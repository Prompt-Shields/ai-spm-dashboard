export const comply = {
  title: 'Conformité IA',
  subtitle: "Couverture des cadres pour tous les cas d'usage de l'IA",
  exportReport: 'Exporter le rapport de conformité',
  boardReport: 'Rapport au conseil', // TODO(i18n): native review
  frameworkRequirements: 'Exigences des cadres', // TODO(i18n): native review
  coverageGaps: '{count} écarts restants',
  iso42001Journey: {
    eyebrow: 'Parcours guidé', // TODO(i18n): native review
    heading: 'Atteindre la conformité ISO/IEC 42001', // TODO(i18n): native review
    body: "Guidez un administrateur à travers les sept clauses du système de management de l'IA, étape par étape — en comblant les écarts et en augmentant la couverture vers la certification.", // TODO(i18n): native review
    cta: 'Démarrer le parcours ISO 42001 →', // TODO(i18n): native review
    resume: 'Reprendre le parcours →', // TODO(i18n): native review
    status: '{completed} sur {total} clauses terminées', // TODO(i18n): native review
    ready: 'Prêt pour la certification', // TODO(i18n): native review
  },
  breakdown: {
    heading: "Vue d'ensemble de la couverture",
    stats: '{covered} couverts · {partial} partiels · {gap} manquants',
    legend: {
      covered: 'Couvert',
      partial: 'Partiel',
      gap: 'Manquant',
    },
  },
  priority: {
    heading: 'Remédiations prioritaires',
    urgency: {
      critical: 'CRITIQUE',
      high: 'ÉLEVÉ',
      medium: 'MOYEN',
    },
    deadlineLabel: 'Échéance : {deadline}',
    assign: 'Assigner →',
    actions: {
      // TODO(i18n): native review
      gdpr: "Appliquer la rédaction des PII + vérifications de base légale sur les cas d'usage à données restreintes",
      // TODO(i18n): native review
      euAiAct: "Assigner une supervision humaine à 8 cas d'usage à haut risque",
      // TODO(i18n): native review
      owaspLlm: 'Appliquer des protections contre les injections de prompt sur 6 LLM exposés aux clients',
      // TODO(i18n): native review
      nistAiRmf: "Documenter les évaluations des risques liés à l'IA pour 12 cas d'usage non évalués",
    },
    deadlines: {
      gdpr: 'En continu',
      euAiAct: 'août 2026',
      owaspLlm: 'T2 2026',
      nistAiRmf: 'T3 2026',
    },
  },
  gapTable: {
    heading: 'Écarts de conformité — action requise',
    columns: {
      useCase: "Cas d'usage",
      department: 'Service',
      action: 'Action',
    },
    assignRemediation: 'Assigner une remédiation →',
  },
}
