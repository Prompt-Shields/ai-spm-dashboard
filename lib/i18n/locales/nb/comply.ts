export const comply = {
  title: 'Samsvar',
  subtitle: 'Rammeverkdekning på tvers av alle KI-bruksområder',
  exportReport: 'Eksporter samsvarsrapport',
  breakdown: {
    heading: 'Samlet dekningsoversikt',
    stats: '{covered} dekket · {partial} delvis · {gap} mangel',
    legend: {
      covered: 'Dekket',
      partial: 'Delvis',
      gap: 'Mangel',
    },
  },
  priority: {
    heading: 'Prioriterte utbedringer',
    urgency: {
      critical: 'KRITISK',
      high: 'HØY',
      medium: 'MIDDELS',
    },
    deadlineLabel: 'Frist: {deadline}',
    assign: 'Tildel →',
    actions: {
      // TODO(i18n): native review
      euAiAct: 'Tildel menneskelig tilsyn til 8 høyrisiko-bruksområder',
      // TODO(i18n): native review
      owaspLlm: 'Innfør vern mot prompt-injeksjon på 6 kundevendte LLM-er',
      // TODO(i18n): native review
      nistAiRmf: 'Dokumenter KI-risikovurderinger for 12 uvurderte bruksområder',
    },
    deadlines: {
      euAiAct: 'aug. 2026',
      owaspLlm: '2. kv. 2026',
      nistAiRmf: '3. kv. 2026',
    },
  },
  gapTable: {
    heading: 'Samsvarsmangler — handling kreves',
    columns: {
      useCase: 'Bruksområde',
      department: 'Avdeling',
      action: 'Handling',
    },
    assignRemediation: 'Tildel utbedring →',
  },
}
