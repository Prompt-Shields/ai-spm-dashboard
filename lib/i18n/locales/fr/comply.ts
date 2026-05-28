export const comply = {
  title: 'Conformité',
  subtitle: "Couverture des cadres pour tous les cas d'usage de l'IA",
  exportReport: 'Exporter le rapport de conformité',
  coverageGaps: '{count} écarts restants',
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
      euAiAct: "Assigner une supervision humaine à 8 cas d'usage à haut risque",
      // TODO(i18n): native review
      owaspLlm: 'Appliquer des protections contre les injections de prompt sur 6 LLM exposés aux clients',
      // TODO(i18n): native review
      nistAiRmf: "Documenter les évaluations des risques liés à l'IA pour 12 cas d'usage non évalués",
    },
    deadlines: {
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
