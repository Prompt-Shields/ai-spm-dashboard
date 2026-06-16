export const demoJourney = {
  progress: 'Trinn {current} av {total} · ~{duration}s',
  steps: {
    s1: {
      title: 'Organisasjonen din har ennå ikke noe KI-kart',
      // TODO(i18n): native review
      body: 'Du starter fra null. Enten du er CISO, CIO, GRC-ansvarlig eller KI-ansvarlig — det er her styringen begynner. La oss finne ut hvilken KI organisasjonen din faktisk bruker.',
      cta: 'Start oppdagelsesagenten →',
    },
    s2: {
      title: 'Oppdagelsen pågår',
      // TODO(i18n): native review
      body: 'Agentisk overvåking på endepunkter, agenter som intervjuer ansatte gjentatte ganger, ansatte som selvregistrerer, og SaaS-miljøet ditt som skannes automatisk. Hver metode mater det samme kartet.',
      cta: 'Se kartet fylles ut →',
    },
    s3: {
      title: '47 bruksområder kartlagt. 12 kritiske risikoer identifisert.',
      // TODO(i18n): native review
      body: 'Ingen regneark, ingen manuell datainnsamling, ingen delvise oversikter. Hvert KI-bruksområde i hver avdeling — automatisk avdekket og samlet i ett kart. Klikk på en node for å utforske hele risikobildet.',
      cta: 'Tildel eierskap →',
    },
    s4: {
      title: 'Eiere identifisert og varslet',
      // TODO(i18n): native review
      body: 'KI foreslo eiere basert på hvem som rapporterte hvert bruksområde. Ett klikk for å bekrefte. Agenter sender automatisk hver eier deres risikovurderingsoppgaver.',
      cta: 'Se compliance-dekning →',
    },
    s5: {
      title: 'Fra null til kartlagt — på tvers av EU AI Act, NIS2, ISO 42001 og mer',
      // TODO(i18n): native review
      body: 'Hvert bruksområde kobles til regelverkene og rammeverkene som betyr noe for organisasjonen din. Avvik er synlige. Tiltak er ett klikk unna.',
      cta: 'Fullfør demo',
    },
  },
}
