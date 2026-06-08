export const discover = {
  title: 'Oppdag',
  subtitle:
    'KI-agenter intervjuer ansatte for å kartlegge KI-bruksområder — ingen skjemaer, ingen manuell registrering', // TODO(i18n): native review
  cards: {
    cisoCampaign: {
      title: 'CISO-oppdagelseskampanje',
      description:
        'Send KI-agenter for å intervjue alle avdelinger. Agentene spør om bruk av KI-verktøy, databehandling og risikoeksponering.', // TODO(i18n): native review
      action: 'Start kampanje',
    },
    selfRegistration: {
      title: 'Selvregistrering for ansatte',
      description:
        'Del en lenke med de ansatte. En KI-agent intervjuer dem i en samtale og henter ut bruksområdedata automatisk.', // TODO(i18n): native review
      action: 'Kopier lenke',
    },
    autoDetect: {
      title: 'Automatisk oppdaging via Okta',
      description:
        '12 nye KI-verktøy oppdaget i SaaS-miljøet ditt denne uken. Gjennomgå og utløs inntaksagenter for ustyrte verktøy.', // TODO(i18n): native review
      action: 'Gjennomgå varsler',
      badge: '{count} nye',
    },
  },
  stats: {
    outreachSent: 'Henvendelser sendt',
    responded: 'Svart',
    useCasesIdentified: 'Bruksområder identifisert',
    shadowAiDetected: 'Skygge-KI oppdaget',
  },
  conversations: 'Agentsamtaler',
  sampleData: 'Eksempeldata',
}
