export const defenderImport = {
  title: 'Import av Defender-skjermbilde', // TODO(i18n): native review
  subtitle:
    'Last opp et skjermbilde av listen over oppdagede apper fra Microsoft Defender for Cloud Apps. Agenten trekker ut skygge-KI-applikasjonene, beriker hver av dem fra KI-leverandørkatalogen og legger dem til i inventaret ditt.',
  badge: 'Simulert demo',
  backToDiscover: 'Tilbake til Oppdag',
  upload: {
    dropTitle: 'Slipp et Defender-skjermbilde her',
    dropHint: 'PNG, JPG eller SVG — eller bla for å velge en fil',
    browse: 'Bla gjennom filer',
    or: 'eller',
    sample: 'Prøv med eksempelskjermbilde',
    invalidType: 'Filen er ikke et bilde. Last opp et skjermbilde (PNG, JPG eller SVG).',
  },
  scanning: {
    title: 'Analyserer skjermbilde…',
    stage1: 'Kjører OCR-gjennomgang…',
    stage2: 'Gjenkjenner tabellstruktur…',
    stage3: 'Matcher rader mot KI-leverandørkatalogen…',
  },
  review: {
    title: 'Uttrukne applikasjoner',
    subtitle: '{count} skygge-KI-applikasjoner funnet — beriket fra KI-leverandørkatalogen',
    enriching: 'Beriker…',
    addButton: 'Legg {count} til i inventaret',
    adding: 'Legger til…',
    retryButton: 'Prøv mislykkede på nytt',
  },
  table: {
    app: 'Applikasjon',
    users: 'Brukere',
    traffic: 'Lastet opp',
    lastSeen: 'Sist sett',
    defenderScore: 'Defender-score',
    vendor: 'Leverandør',
    capability: 'KI-kapabilitet',
    models: 'Modeller',
    trains: 'Trener på data',
    trainsYes: 'Ja',
    trainsNo: 'Nei',
    classification: 'Klassifisering',
    risk: 'Risiko',
  },
  rowStatus: {
    added: 'Lagt til',
    failed: 'Mislyktes',
  },
  done: {
    title: '{count} applikasjoner lagt til i inventaret',
    body: 'De er registrert som skyggeapplikasjoner (Shadow). Tildel en eier og en avdeling, og promoter dem etter gjennomgang.',
    importAnother: 'Importer et nytt skjermbilde',
  },
}
