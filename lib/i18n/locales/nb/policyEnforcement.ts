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
  // Shared across the detail/templates clients
  shared: {
    status: {
      approved: 'godkjent',
      rejected: 'avvist',
      pending: 'venter',
      noDecision: 'ingen avgjørelse',
    },
    actions: {
      approve: 'Godkjenn',
      reject: 'Avvis',
      approveAs: 'Godkjenn som {role}',
    },
    fromTemplate: 'fra {name} v{version}',
  },
  policyDetailClient: {
    errors: {
      promotionFailed: 'Forespørsel om forfremmelse mislyktes',
      approvalFailed: 'Godkjenning mislyktes',
      demotionFailed: 'Nedgradering mislyktes',
      testFailed: 'Test mislyktes',
    },
    toasts: {
      promotionSubmitted: 'Forespørsel om forfremmelse sendt – avventer godkjenninger',
      promotedAllCollected: '✓ Forfremmet til streng – alle godkjenninger innhentet',
      rejectedStaysGuideline: 'Avvist – retningslinjen forblir veiledende',
      recordedRemaining: 'Registrert. {count} godkjenning(er) gjenstår.',
      demotedToGuideline: 'Nedgradert til veiledende',
    },
    tabs: {
      detection: 'deteksjon',
      scope: 'omfang',
      test: 'test',
      approvals: 'godkjenninger',
      history: 'historikk',
    },
    pendingApprovals: {
      heading: 'Forfremmelse pågår – avventer godkjenninger',
      demoNote:
        'Demomodus: enhver besøkende kan godkjenne. I produksjon kan kun innloggede brukere med den oppførte rollen godkjenne.', // TODO(i18n): native review
    },
    detection: {
      rationale: 'Begrunnelse',
      exampleViolation: 'Eksempel på brudd:',
      detectorsCount: 'Detektorer ({count})',
      tunableParameters: 'Justerbare parametere',
      currentPrefix: 'Nåværende:',
    },
    scope: {
      appliesTo: 'Gjelder for',
      dataClassifications: 'Dataklassifiseringer',
      riskTiers: 'Risikonivåer',
      departments: 'Avdelinger',
      specificApps: 'Spesifikke apper',
      assignedCountOfTotal: '{assigned} av {total}',
      assignedApplications: 'Tilordnede applikasjoner ({count})',
      emptyAssigned:
        'Ingen spesifikke applikasjoner tilordnet. Avgrenset av klassifiserings-/nivåfiltre ovenfor.', // TODO(i18n): native review
      unassignedDetails: '{count} ikke-tilordnet applikasjon(er) – vis alle',
      none: 'ingen',
    },
    approvals: {
      requiredHeading: 'Påkrevde godkjennere for forfremmelse',
      requiredBody:
        'Forfremmelse av denne retningslinjen fra veiledende til streng krever godkjenning fra disse rollene (bestemt av malkategori: {category}).', // TODO(i18n): native review
    },
    history: {
      heading: 'Historikk for forfremmelse',
      empty:
        'Ingen modusendringer ennå. Denne retningslinjen har vært i veiledende modus siden opprettelsen.', // TODO(i18n): native review
      byUser: '{time} av {user}',
      transition: '{from} → {to}',
    },
    test: {
      heading: 'Testkonsoll',
      description:
        'Tørrkjøring av evaluering. Ingen tilstandsendringer, ingen brudd registreres. Returnerer hva detektorene ville si mot denne retningslinjens gjeldende parameterverdier.', // TODO(i18n): native review
      modeLabel: 'Modus:',
      promptPlaceholder: 'Lim inn en ledetekst eller modellrespons for å teste mot denne retningslinjen...', // TODO(i18n): native review
      trySample: 'Prøv et eksempel:',
      sampleViolation: '🚨 brudd',
      sampleSafe: '✓ trygt',
      sampleSeparator: ' – ',
      evaluating: 'Evaluerer…',
      runTest: 'Kjør test →',
      wouldFire: 'Retningslinjen ville utløses',
      cleanNoMatch: 'Rent – ingen detektorer traff',
      evaluatedInOne: 'Evaluert på {ms}ms · {count} detektor traff',
      evaluatedInMany: 'Evaluert på {ms}ms · {count} detektorer traff',
      actionLabel: 'Handling: {action}',
      guidelineNotePrefix: 'I veiledende modus ville dette kun bli ',
      guidelineNoteLogged: 'logget',
      guidelineNoteMiddle: '. Etter forfremmelse til streng blir handlingen ',
      guidelineNoteSuffix: '.',
      confidence: 'konf {value}',
      matchLabel: 'Treff: {value}',
    },
    watchdog: {
      autoDemoted: 'Automatisk nedgradert av vakthund',
      graceStarted: 'Nådeperiode for vakthund startet',
      stillGrace: 'Nådeperiode for vakthund aktiv',
      recovered: 'Gjenopprettet – tilbake under terskel',
      fpRatePrefix: 'FP-andel ',
      vsThreshold: ' mot terskel ',
      autoDemoteAt: ' · automatisk nedgradering kl. ',
      runNow: 'Kjør vakthund nå',
      imminent: 'umiddelbar',
      countdown: 'T-{m}:{s}',
      fpRateValue: '{value} %',
      thresholdValue: '{value} %',
    },
  },
  templatesListClient: {
    searchPlaceholder: 'Søk etter navn, OWASP-ID, regulering…',
    allCategory: 'Alle',
    resultCount: '{filtered} av {total} maler',
    empty: 'Ingen maler matcher – prøv å fjerne søk eller kategorifilter.',
    detectorsOne: '{count} detektor',
    detectorsMany: '{count} detektorer',
    versionLabel: 'v{version}',
  },
  templateDetailClient: {
    heading: 'Klon og start å observere',
    description:
      'Oppretter en veiledende retningslinje. Kun observasjon – ingenting blokkeres før du forfremmer til streng.', // TODO(i18n): native review
    modeOnClone: 'Modus ved kloning:',
    cloneFailed: 'Kloning mislyktes',
    policyNameLabel: 'Retningslinjenavn',
    policyNamePlaceholder: 'f.eks. PII-utdata – Kundeservice',
    policyNameHelp:
      'Settes til malens navn som standard. Tilpass for å skille flere instanser av samme mal.', // TODO(i18n): native review
    applyToggleOpen: '▾ Anvend på spesifikke applikasjoner (valgfritt, {count} valgt)',
    applyToggleClosed: '▸ Anvend på spesifikke applikasjoner (valgfritt, {count} valgt)',
    applyHelp:
      'La feltet stå tomt for å anvende bredt via malens standard data-klassifiserings-/risikonivåfiltre.', // TODO(i18n): native review
    cloning: 'Kloner…',
    cloneAction: 'Klon og tilpass →',
  },
  dashboard: {
    kpi: {
      strict: 'Streng',
      guideline: 'Løs',
      coverage: 'Dekning',
      blocks30d: 'Blokkeringer · 30d',
      promotionsReady: 'Klar for opprykk',
      delta: '{value} vs forrige 30d',
      ofApps: 'av {count} apper',
    },
    violations: {
      heading: 'Brudd',
      chart: {
        title: 'Siste 30 dager · stablet etter modus',
        blocks: 'Blokkeringer',
        wouldBlock: 'Ville blokkert',
        empty: 'Ingen aktivitet siste 30 dager.',
      },
      topPolicies: {
        heading: 'Mest aktive retningslinjer',
        hitsLabel: '{count} treff',
        empty: 'Ingen treff siste 30 dager.',
      },
      topApps: {
        heading: 'Mest påvirkede applikasjoner',
        empty: 'Ingen applikasjonsaktivitet enda.',
        topPolicyLabel: 'Topp: {name}',
        hitsLabel: '{count} treff',
      },
      recent: {
        heading: 'Nylige hendelser',
        empty: 'Ingen nylige hendelser.',
        actionBlock: 'Blokkert',
        actionFlag: 'Ville blokkert',
        actionAllow: 'Tillatt',
        actionRedact: 'Maskert',
        justNow: 'akkurat nå',
        minutesAgo: 'for {count} min siden',
        hoursAgo: 'for {count} t siden',
        daysAgo: 'for {count} d siden',
      },
    },
    promotionQueue: {
      heading: 'Opprykk-kø',
      subtitle: 'Løse retningslinjer som har modnet nok til å vurdere opprykk til Streng.', // TODO(i18n): native review
      empty: 'Ingen retningslinjer er klare for opprykk.',
      ageLabel: '{days}d som Løs',
      hitsLabel: '{count} treff / 30d',
      fpRateLabel: '{rate}% FP',
      eligible: 'Kvalifisert',
      daysToGo: '{days}d igjen',
    },
    panels: {
      strict: {
        heading: 'Streng — Håndhever',
        subtitle: 'Retningslinjer som aktivt blokkerer eller maskerer trafikk.',
        empty: 'Ingen Strenge retningslinjer enda. Forfremm en kandidat fra køen over.', // TODO(i18n): native review
        modeBadge: 'HÅNDHEVER',
        blocksHeader: 'Blokkeringer',
      },
      guideline: {
        heading: 'Løs — Observerer',
        subtitle: 'Retningslinjer i observasjonsmodus. Kun logging, trafikk endres ikke.',
        empty: 'Ingen Løse retningslinjer enda. Klon en mal for å komme i gang.',
        modeBadge: 'OBSERVERER',
        blocksHeader: 'Ville blokkert',
      },
      row: {
        appsLabel: 'Apper: {value}',
        lastHitLabel: 'Siste treff: {when}',
        fpLabel: 'FP {rate}%',
        neverTriggered: '—',
      },
    },
    actions: {
      promote: 'Forfremm',
      demote: 'Degrader',
      pause: 'Pause',
      resume: 'Gjenoppta',
      confirm: 'Bekreft',
      cancel: 'Avbryt',
      working: 'Arbeider…',
      promoteTitle: 'Forfremme til Streng?',
      promoteBody: 'Denne retningslinjen vil begynne å håndheve trafikk umiddelbart.', // TODO(i18n): native review
      demoteTitle: 'Degradere til Løs?',
      demoteBody: 'Trafikk vil ikke lenger blokkeres. Retningslinjen fortsetter å observere.', // TODO(i18n): native review
      pauseTitle: 'Pause retningslinje?',
      pauseBody: 'Evalueringer stopper til du gjenopptar.',
      resumeTitle: 'Gjenoppta retningslinje?',
      resumeBody: 'Evalueringer starter umiddelbart.',
    },
  },
}
