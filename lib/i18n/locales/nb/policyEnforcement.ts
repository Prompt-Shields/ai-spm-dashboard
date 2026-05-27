export const policyEnforcement = {
  // Shared across pages
  backToPolicies: '← Alle retningslinjer',
  backToLibrary: '← Malbibliotek',
  list: {
    title: 'Håndheving av retningslinjer',
    subtitle:
      'Forfrem retningslinjer fra veiledende til streng når du stoler på andelen falske positive.', // TODO(i18n): native review
    newFromTemplate: '+ Ny fra mal',
    summary: {
      strictlyEnforced: 'Strengt håndhevet',
      guidelinesObserving: 'Veiledende (overvåker)',
      appsUnderPolicy: 'Apper under retningslinje',
    },
    blocksBanner: '{count} blokkeringer de siste 30 dagene på tvers av alle strenge retningslinjer.',
    strictSection: {
      title: '🛡️ Strengt håndhevet',
      subtitle: 'Aktive retningslinjer som blokkerer eller redigerer trafikk i sanntid.',
      empty:
        'Ingen strenge retningslinjer ennå. Forfrem en veiledende retningslinje når den har vist seg verdt det.', // TODO(i18n): native review
    },
    guidelineSection: {
      title: '📘 Veiledende',
      subtitle: 'Retningslinjer i observasjonsmodus. Kun logging – ingen trafikk endres.',
      empty: 'Ingen veiledende retningslinjer ennå. Klon en mal for å komme i gang.',
    },
    row: {
      live: '● AKTIV',
      awaitingApprovals: 'Avventer {count} godkjenning(er)',
      appsLabel: 'Apper:',
      appsAll: 'alle',
      hits30dLabel: 'Treff/30d:',
      fpRateLabel: 'FP-andel:',
      eligibleToPromote: 'Kvalifisert for forfremmelse',
      promoteInDays: 'Forfrem om {days}d',
      notYetEligible: 'Ikke kvalifisert ennå',
      view: 'Vis →',
    },
  },
  templates: {
    title: 'Malbibliotek',
    subtitle:
      '{count} startretningslinjer som dekker OWASP LLM Top 10, EU AI Act, GDPR, bransjereguleringer, skygge-KI og innholdssikkerhet. Klon for å begynne å overvåke – administratorer bestemmer når de skal forfremmes til streng.', // TODO(i18n): native review
  },
  templateDetail: {
    rationale: 'Begrunnelse',
    exampleViolation: 'Eksempel på brudd',
    exampleSafeInput: 'Eksempel på trygg inndata',
    triggers: 'Utløsere ({count})',
    detectors: 'Detektorer ({count})',
    actions: 'Handlinger ({count})',
    tunableParameters: 'Justerbare parametere ({count})',
    locked: '🔒 låst',
    defaultPrefix: 'Standard:',
    regulatoryReferences: 'Regulatoriske referanser',
    defaultsHeading: 'Malstandarder (foreslått mål etter forfremmelse)',
    suggestedMode: 'Foreslått modus',
    riskTiers: 'Risikonivåer',
    dataClassifications: 'Dataklassifiseringer',
    departments: 'Avdelinger',
    defaultsNote:
      'Klonede retningslinjer starter i veiledende modus. Bruk forfremmelsesveiviseren for å bytte til streng når du stoler på andelen falske positive.', // TODO(i18n): native review
  },
}
