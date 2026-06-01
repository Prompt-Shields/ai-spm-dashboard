export const piiShield = {
  title: 'PII Shield-demo',
  intro:
    'Send en forespørsel til ChatGPT — selv en full av personopplysninger. Shield oppdager PII lokalt, bytter den ut med plassholdere før noe forlater nettleseren din, og gjenoppretter de virkelige verdiene kun i svaret du ser. ChatGPT mottar aldri de sensitive dataene.', // TODO(i18n): native review
  tryExample: 'Prøv et eksempel:',
  inputPlaceholder:
    'f.eks. Skriv en e-post til Sarah Chen på sarah.chen@acme.com om hennes forfalte faktura…', // TODO(i18n): native review
  showUnprotectedPrefix: 'Vis hva ChatGPT ville sett ',
  showUnprotectedEmphasis: 'uten',
  showUnprotectedSuffix: ' Shield',
  send: 'Send til ChatGPT',
  badge: {
    detectedOne: '{count} PII-element oppdaget',
    detectedMany: '{count} PII-elementer oppdaget',
    none: '0 PII-elementer oppdaget — videresendt uendret',
  },
  stage: {
    prompt: {
      title: 'Forespørselen din',
      subtitle: 'Det du skrev — sensitive verdier oppdaget lokalt.',
    },
    anonymized: {
      title: 'Anonymisert — alt ChatGPT ser',
      subtitle: 'PII byttet ut med plassholdere før sending.',
    },
    response: {
      title: 'ChatGPT-svar',
      subtitle: 'Generert kun fra plassholdere — ingen ekte PII.',
    },
    restored: {
      title: 'Gjenopprettet for deg',
      subtitle: 'Plassholdere byttet tilbake til de virkelige verdiene — kun i din visning.',
    },
  },
  withoutShield: 'Uten Shield — ChatGPT ville mottatt dette',
  responding: 'ChatGPT svarer…',
  mappingTitle: 'Oppdaget PII → plassholdere',
  types: {
    email: 'e-post',
    phone: 'telefon',
    ssn: 'fødselsnummer', // TODO(i18n): native review
    creditCard: 'kort',
    ip: 'IP',
    apiKey: 'API-nøkkel', // TODO(i18n): native review
    person: 'navn',
    address: 'adresse',
  },
  mapping: {
    placeholder: 'Plassholder',
    type: 'Type',
    original: 'Original',
    noPiiDetected: 'Ingen PII oppdaget.',
  },
}
