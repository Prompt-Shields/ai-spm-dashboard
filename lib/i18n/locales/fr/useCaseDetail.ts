export const useCaseDetail = {
  status: {
    discovered: 'Découvert',
    assessed: 'Évalué',
    owned: 'Attribué',
    mitigated: 'Atténué',
    compliant: 'Conforme',
  },
  compliance: {
    levels: {
      covered: 'Couvert',
      partial: 'Partiel',
      gap: 'Lacune',
    },
    heading: 'Couverture de conformité',
  },
  meta: {
    data: 'Données',
    discovery: 'Découverte',
  },
  sections: {
    aiModels: 'Modèles IA',
    owner: 'Responsable',
    risks: 'Risques',
    mitigations: 'Mesures d’atténuation', // TODO(i18n): native review
  },
  owner: {
    none: 'Aucun responsable attribué',
    assign: 'Attribuer →',
  },
  risks: {
    count: '({count})',
    worst: 'Pire : {severity}',
    refs: {
      owasp: 'OWASP {ref}',
      euAiAct: 'EU AI Act {ref}',
    },
  },
  actions: {
    edit: "Modifier le cas d'usage",
    assignOwner: 'Attribuer un responsable',
  },
}
