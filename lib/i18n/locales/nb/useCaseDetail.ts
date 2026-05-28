export const useCaseDetail = {
  status: {
    discovered: 'Oppdaget',
    assessed: 'Vurdert',
    owned: 'Tildelt eier',
    mitigated: 'Tiltak iverksatt', // TODO(i18n): native review
    compliant: 'Etterlever krav', // TODO(i18n): native review
  },
  compliance: {
    levels: {
      covered: 'Dekket',
      partial: 'Delvis',
      gap: 'Mangel',
    },
    heading: 'Etterlevelsesdekning', // TODO(i18n): native review
  },
  meta: {
    data: 'Data',
    discovery: 'Oppdagelse',
  },
  sections: {
    aiModels: 'KI-modeller',
    owner: 'Eier',
    risks: 'Risikoer',
    mitigations: 'Tiltak',
  },
  owner: {
    none: 'Ingen eier tildelt',
    assign: 'Tildel →',
  },
  risks: {
    count: '({count})',
    worst: 'Verst: {severity}',
    refs: {
      owasp: 'OWASP {ref}',
      euAiAct: 'EU AI Act {ref}',
    },
  },
  actions: {
    edit: 'Rediger bruksområde',
    assignOwner: 'Tildel eier',
  },
}
