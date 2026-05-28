export const demoJourney = {
  progress: 'Trinn {current} av {total} · ~{duration}s',
  steps: {
    s1: {
      title: 'Organisasjonen din har ennå ikke noe KI-kart',
      // TODO(i18n): native review
      body: 'Du starter fra null — slik enhver CISO gjør. La oss finne ut hvilken KI organisasjonen din faktisk bruker.',
      cta: 'Start oppdagelsesagenten →',
    },
    s2: {
      title: 'KI-agenten intervjuer de ansatte',
      // TODO(i18n): native review
      body: 'Agenter tar kontakt via Slack og e-post. Se hvordan de henter ut bruksområder fra naturlige samtaler — uten skjemaer eller spørreundersøkelser.',
      cta: 'Se kartet fylles ut →',
    },
    s3: {
      title: '47 bruksområder kartlagt. 12 kritiske risikoer identifisert.',
      // TODO(i18n): native review
      body: 'Alt fra agentsamtaler. Ingen manuell registrering. Klikk på en node for å utforske hele risikobildet for det bruksområdet.',
      cta: 'Tildel eierskap →',
    },
    s4: {
      title: 'Eiere identifisert og varslet',
      // TODO(i18n): native review
      body: 'KI foreslo eiere basert på hvem som rapporterte hvert bruksområde. Ett klikk for å bekrefte. Agenter sender automatisk hver eier deres risikovurderingsoppgaver.',
      cta: 'Se compliance-dekning →',
    },
    s5: {
      title: 'Fra 0 % til 73 % EU AI Act-dekning — i løpet av denne økten.',
      // TODO(i18n): native review
      body: 'Hvert bruksområde kobles til rammeverkene som betyr noe. Avvik er synlige. Tiltak er ett klikk unna. KI-en din er nå styrt.',
      cta: 'Fullfør demo',
    },
  },
}
