export const discover = {
  title: 'Oppdag',
  subtitle:
    'Seks måter å oppdage KI-verktøyene og bruksområdene i organisasjonen — bruk én eller kombiner dem', // TODO(i18n): native review
  cards: {
    voiceInterview: {
      title: 'KI-taleintervju',
      description:
        'Taleintervju hvilken som helst ansatt. KI-agenten spør om KI-verktøyene og de autonome agentene deres, og dokumenterer hvert bruksområde rett fra samtalen.', // TODO(i18n): native review
      action: 'Start taleintervju',
    },
    defenderImport: {
      title: 'Import av Defender-skjermbilde',
      description:
        'Last opp et skjermbilde av skyggeapp-listen fra Microsoft Defender for Cloud Apps. Agenten trekker ut applikasjonene, beriker hver av dem og legger dem til i inventaret ditt.', // TODO(i18n): native review
      action: 'Importer skjermbilde',
    },
    cisoCampaign: {
      title: 'KI-oppdagelseskampanje',
      description:
        'Send KI-agenter for å intervjue alle avdelinger. Agentene spør om bruk av KI-verktøy, databehandling og risikoeksponering.', // TODO(i18n): native review
      action: 'Start kampanje',
    },
    agenticMonitoring: {
      title: 'Agentisk overvåking',
      description:
        'Alltid-på-agenter på endepunkter, skrivebordsapper og nettleserutvidelsen. KI-bruk observeres i sanntid og bruksområder dukker opp automatisk — uten henvendelser, uten venting.', // TODO(i18n): native review
      action: 'Se aktivitet',
    },
    selfRegistration: {
      title: 'Selvregistrering for ansatte',
      description:
        'Del en lenke med de ansatte. En KI-agent intervjuer dem i en samtale og henter ut bruksområdedata automatisk.', // TODO(i18n): native review
      action: 'Kopier lenke',
    },
    autoDetect: {
      title: 'Integrasjoner',
      description:
        'Koble til systemene du allerede har — Entra-ID, SaaS-miljøet ditt og CASB — for å automatisk oppdage ustyrte KI-verktøy i det de dukker opp.', // TODO(i18n): native review
      action: 'Gjennomgå varsler',
      badge: '{count} nye',
    },
  },
  stats: {
    toolsDiscovered: 'KI-verktøy oppdaget',
    vendorsInUse: 'Leverandører i bruk',
    useCasesIdentified: 'Bruksområder identifisert',
    shadowAiDetected: 'Skygge-KI oppdaget',
  },
  conversations: 'Agentsamtaler',
  sampleData: 'Eksempeldata',
}
