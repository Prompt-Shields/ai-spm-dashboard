export const modelRisk = {
  title: 'Modellrisiko',
  subtitle: 'Vurder modellens atferd, risikoer og bruksområder', // TODO(i18n): native review
  riskLevel: {
    high: 'Høy',
    medium: 'Middels',
    low: 'Lav',
  },
  riskLevelBadge: '{level} risiko',
  dimensions: {
    hallucination: 'Hallusinasjon',
    bias: 'Skjevhet',
    toxicity: 'Skadelighet',
    privacy: 'Personvern',
  },
  approvedUseCases: 'Godkjente bruksområder',
  tabs: {
    details: 'Detaljer',
    risk: 'Risikovurdering',
    apps: 'Applikasjoner',
    pricing: 'Priser',
    mitigations: 'Tiltak',
  },
  modelInfo: {
    title: 'Modellinformasjon',
    provider: 'Leverandør',
    version: 'Versjon',
    type: 'Type',
    parameters: 'Parametere',
    status: 'Status',
  },
  strengthsWeaknesses: {
    title: 'Styrker og svakheter',
    strengths: 'Styrker',
    weaknesses: 'Svakheter',
  },
  riskAssessment: {
    hallucinationLabel: 'Hallusinasjonsrisiko',
    hallucinationDesc: 'Generering av falsk informasjon', // TODO(i18n): native review
    biasLabel: 'Skjevhetsrisiko',
    biasDesc: 'Potensielt urettferdige utfall', // TODO(i18n): native review
    toxicityLabel: 'Skadelighetsrisiko',
    toxicityDesc: 'Generering av skadelig innhold', // TODO(i18n): native review
    privacyLabel: 'Personvernrisiko',
    privacyDesc: 'Bekymringer om dataeksponering', // TODO(i18n): native review
    scoreOutOf: '{score}/100',
  },
  activeAlerts: 'Aktive varsler',
  apps: {
    internalTitle: 'Interne applikasjoner',
    publicTitle: 'Offentlige applikasjoner',
    noInternal: 'Ingen interne applikasjoner',
    noPublic: 'Ingen offentlige applikasjoner',
    queriesPerMonth: '{count} forespørsler/mnd',
    users: '{count} brukere',
  },
  pricing: {
    title: 'Prisinformasjon',
    inputCost: 'Inndatakostnad',
    outputCost: 'Utdatakostnad',
    contextWindow: 'Kontekstvindu',
    estMonthly: 'Est. månedlig',
    notAvailable: 'Prisinformasjon ikke tilgjengelig',
  },
  mitigations: {
    title: 'Risikotiltak',
  },
}
