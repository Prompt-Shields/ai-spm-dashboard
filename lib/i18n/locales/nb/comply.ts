export const comply = {
  title: 'KI-etterlevelse',
  subtitle: 'Rammeverkdekning på tvers av alle KI-bruksområder',
  exportReport: 'Eksporter samsvarsrapport',
  boardReport: 'Styrerapport', // TODO(i18n): native review
  frameworkRequirements: 'Rammeverkskrav', // TODO(i18n): native review
  coverageGaps: '{count} gjenstående mangler',
  iso42001Journey: {
    eyebrow: 'Veiledet løp', // TODO(i18n): native review
    heading: 'Oppnå ISO/IEC 42001-samsvar', // TODO(i18n): native review
    body: 'Led en administrator gjennom de sju klausulene i KI-styringssystemet steg for steg — tett mangler og øk dekningen mot sertifiseringsklar.', // TODO(i18n): native review
    cta: 'Start ISO 42001-løpet →', // TODO(i18n): native review
    resume: 'Fortsett løpet →', // TODO(i18n): native review
    status: '{completed} av {total} klausuler fullført', // TODO(i18n): native review
    ready: 'Sertifiseringsklar', // TODO(i18n): native review
  },
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
      gdpr: 'Håndhev PII-redigering + kontroll av lovlig grunnlag på bruksområder med begrensede data',
      // TODO(i18n): native review
      euAiAct: 'Tildel menneskelig tilsyn til 8 høyrisiko-bruksområder',
      // TODO(i18n): native review
      owaspLlm: 'Innfør vern mot prompt-injeksjon på 6 kundevendte LLM-er',
      // TODO(i18n): native review
      nistAiRmf: 'Dokumenter KI-risikovurderinger for 12 uvurderte bruksområder',
    },
    deadlines: {
      gdpr: 'Løpende',
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
