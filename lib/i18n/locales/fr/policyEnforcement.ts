export const policyEnforcement = {
  // Shared across pages
  backToPolicies: '← Toutes les politiques',
  backToLibrary: '← Bibliothèque de modèles',
  list: {
    title: 'Application des politiques',
    subtitle:
      'Faites passer les directives en mode strict une fois que vous avez confiance dans le taux de faux positifs.', // TODO(i18n): native review
    newFromTemplate: '+ Nouvelle depuis un modèle',
    summary: {
      strictlyEnforced: 'Appliquées strictement',
      guidelinesObserving: 'Directives (observation)',
      appsUnderPolicy: 'Applications sous politique',
    },
    blocksBanner:
      '{count} blocages au cours des 30 derniers jours pour toutes les politiques strictes.',
    strictSection: {
      title: '🛡️ Appliquées strictement',
      subtitle: 'Politiques actives bloquant ou expurgeant le trafic en temps réel.',
      empty:
        "Aucune politique stricte pour le moment. Faites passer une directive en mode strict une fois qu'elle a fait ses preuves.", // TODO(i18n): native review
    },
    guidelineSection: {
      title: '📘 Directives',
      subtitle: "Politiques en mode observation. Journalisation seule — aucun trafic modifié.",
      empty: 'Aucune directive pour le moment. Clonez un modèle pour commencer.',
    },
    row: {
      live: '● EN DIRECT',
      awaitingApprovals: 'En attente de {count} approbation(s)',
      appsLabel: 'Applications :',
      appsAll: 'toutes',
      hits30dLabel: 'Occurrences/30 j :',
      fpRateLabel: 'Taux FP :',
      eligibleToPromote: 'Éligible à la promotion',
      promoteInDays: 'Promotion dans {days} j',
      notYetEligible: 'Pas encore éligible',
      view: 'Voir →',
    },
  },
  templates: {
    title: 'Bibliothèque de modèles',
    subtitle:
      "{count} politiques de départ couvrant OWASP LLM Top 10, EU AI Act, RGPD, réglementations sectorielles, IA fantôme et sécurité du contenu. Clonez pour commencer l'observation — les administrateurs décident quand passer en mode strict.", // TODO(i18n): native review
  },
  templateDetail: {
    rationale: 'Justification',
    exampleViolation: 'Exemple de violation',
    exampleSafeInput: "Exemple d'entrée sûre",
    triggers: 'Déclencheurs ({count})',
    detectors: 'Détecteurs ({count})',
    actions: 'Actions ({count})',
    tunableParameters: 'Paramètres ajustables ({count})',
    locked: '🔒 verrouillé',
    defaultPrefix: 'Par défaut :',
    regulatoryReferences: 'Références réglementaires',
    defaultsHeading: 'Valeurs par défaut du modèle (cible suggérée après promotion)',
    suggestedMode: 'Mode suggéré',
    riskTiers: 'Niveaux de risque',
    dataClassifications: 'Classifications des données',
    departments: 'Services',
    defaultsNote:
      "Les politiques clonées démarrent en mode directive. Utilisez l'assistant de promotion pour passer en mode strict une fois que vous avez confiance dans le taux de faux positifs.", // TODO(i18n): native review
  },
  // Shared across the detail/templates clients
  shared: {
    status: {
      approved: 'approuvé',
      rejected: 'rejeté',
      pending: 'en attente',
      noDecision: 'aucune décision',
    },
    actions: {
      approve: 'Approuver',
      reject: 'Rejeter',
      approveAs: 'Approuver en tant que {role}',
    },
    fromTemplate: 'depuis {name} v{version}',
  },
  policyDetailClient: {
    errors: {
      promotionFailed: 'La demande de promotion a échoué',
      approvalFailed: "L'approbation a échoué",
      demotionFailed: 'La rétrogradation a échoué',
      testFailed: 'Le test a échoué',
    },
    toasts: {
      promotionSubmitted: 'Demande de promotion envoyée — en attente des approbations',
      promotedAllCollected: '✓ Promue en mode strict — toutes les approbations recueillies', // TODO(i18n): native review
      rejectedStaysGuideline: 'Rejetée — la politique reste en mode directive',
      recordedRemaining: 'Enregistré. {count} approbation(s) toujours en attente.',
      demotedToGuideline: 'Rétrogradée en directive',
    },
    tabs: {
      detection: 'détection',
      scope: 'portée',
      test: 'test',
      approvals: 'approbations',
      history: 'historique',
    },
    pendingApprovals: {
      heading: 'Promotion en cours — en attente des approbations',
      demoNote:
        'Mode démo : tout visiteur peut approuver. En production, seuls les utilisateurs connectés ayant le rôle indiqué peuvent valider.', // TODO(i18n): native review
    },
    detection: {
      rationale: 'Justification',
      exampleViolation: 'Exemple de violation :',
      detectorsCount: 'Détecteurs ({count})',
      tunableParameters: 'Paramètres ajustables',
      currentPrefix: 'Actuel :',
    },
    scope: {
      appliesTo: "S'applique à",
      dataClassifications: 'Classifications des données',
      riskTiers: 'Niveaux de risque',
      departments: 'Services',
      specificApps: 'Applications spécifiques',
      assignedCountOfTotal: '{assigned} sur {total}',
      assignedApplications: 'Applications assignées ({count})',
      emptyAssigned:
        "Aucune application spécifique n'est assignée. Actuellement délimitée par les filtres de classification/niveau ci-dessus.", // TODO(i18n): native review
      unassignedDetails: '{count} application(s) non assignée(s) — tout afficher',
      none: 'aucune',
    },
    approvals: {
      requiredHeading: 'Approbateurs requis pour la promotion',
      requiredBody:
        'Faire passer cette politique de directive à strict nécessite la validation de ces rôles (déterminés par la catégorie du modèle : {category}).', // TODO(i18n): native review
    },
    history: {
      heading: 'Historique des promotions',
      empty:
        "Aucun changement de mode pour le moment. Cette politique est en mode directive depuis sa création.", // TODO(i18n): native review
      byUser: '{time} par {user}',
      transition: '{from} → {to}',
    },
    test: {
      heading: 'Console de test',
      description:
        "Évaluation à blanc. Aucun changement d'état, aucune violation enregistrée. Renvoie ce que les détecteurs diraient avec les valeurs de paramètres actuelles de cette politique.", // TODO(i18n): native review
      modeLabel: 'Mode :',
      promptPlaceholder:
        'Collez une invite ou une réponse de modèle à tester contre cette politique...', // TODO(i18n): native review
      trySample: 'Essayer un exemple :',
      sampleViolation: '🚨 violation',
      sampleSafe: '✓ sûr',
      sampleSeparator: ' — ',
      evaluating: 'Évaluation…',
      runTest: 'Lancer le test →',
      wouldFire: 'La politique se déclencherait',
      cleanNoMatch: 'Propre — aucun détecteur ne correspond',
      evaluatedInOne: 'Évalué en {ms} ms · {count} détecteur déclenché',
      evaluatedInMany: 'Évalué en {ms} ms · {count} détecteurs déclenchés',
      actionLabel: 'Action : {action}',
      guidelineNotePrefix: 'En mode directive ceci serait seulement ',
      guidelineNoteLogged: 'journalisé',
      guidelineNoteMiddle: ". Après promotion en strict, l'action devient ",
      guidelineNoteSuffix: '.',
      confidence: 'conf {value}',
      matchLabel: 'Correspondance : {value}',
    },
    watchdog: {
      autoDemoted: 'Auto-rétrogradée par le watchdog',
      graceStarted: 'Période de grâce du watchdog démarrée',
      stillGrace: 'Période de grâce du watchdog active',
      recovered: 'Rétablie — de nouveau sous le seuil',
      fpRatePrefix: 'Taux FP ',
      vsThreshold: ' contre seuil ',
      autoDemoteAt: ' · auto-rétrogradation à ',
      runNow: 'Lancer le watchdog maintenant',
      imminent: 'imminent',
      countdown: 'T-{m}:{s}',
      fpRateValue: '{value} %',
      thresholdValue: '{value} %',
    },
  },
  templatesListClient: {
    searchPlaceholder: 'Rechercher par nom, ID OWASP, réglementation…',
    allCategory: 'Tous',
    resultCount: '{filtered} sur {total} modèles',
    empty:
      'Aucun modèle ne correspond — essayez de réinitialiser la recherche ou le filtre de catégorie.', // TODO(i18n): native review
    detectorsOne: '{count} détecteur',
    detectorsMany: '{count} détecteurs',
    versionLabel: 'v{version}',
  },
  templateDetailClient: {
    heading: 'Cloner et commencer à observer',
    description:
      'Crée une politique en mode directive. Observation uniquement — rien n’est bloqué tant que vous ne passez pas en mode strict.', // TODO(i18n): native review
    modeOnClone: 'Mode au clonage :',
    cloneFailed: 'Le clonage a échoué',
    policyNameLabel: 'Nom de la politique',
    policyNamePlaceholder: 'p. ex. Sortie PII – Service client',
    policyNameHelp:
      "S'initialise avec le nom du modèle. Personnalisez pour distinguer plusieurs instances du même modèle.", // TODO(i18n): native review
    applyToggleOpen:
      '▾ Appliquer à des applications spécifiques (facultatif, {count} sélectionnée(s))',
    applyToggleClosed:
      '▸ Appliquer à des applications spécifiques (facultatif, {count} sélectionnée(s))',
    applyHelp:
      "Laissez vide pour appliquer largement via les filtres par défaut du modèle (classification des données / niveau de risque).", // TODO(i18n): native review
    cloning: 'Clonage…',
    cloneAction: 'Cloner et personnaliser →',
  },
  dashboard: {
    kpi: {
      strict: 'Strict',
      guideline: 'Souple',
      coverage: 'Couverture',
      blocks30d: 'Blocages · 30j',
      promotionsReady: 'Promotions prêtes',
      delta: '{value} vs 30j précédents',
      ofApps: 'sur {count} applis',
    },
    violations: {
      heading: 'Violations',
      chart: {
        title: '30 derniers jours · empilé par mode',
        blocks: 'Blocages',
        wouldBlock: 'Aurait bloqué',
        empty: 'Aucune activité ces 30 derniers jours.',
      },
      topPolicies: {
        heading: 'Politiques les plus déclenchées',
        hitsLabel: '{count} déclenchements',
        empty: 'Aucun déclenchement ces 30 derniers jours.',
      },
      topApps: {
        heading: 'Applications les plus impactées',
        empty: "Pas encore d'activité d'application.",
        topPolicyLabel: 'Top : {name}',
        hitsLabel: '{count} déclenchements',
      },
      recent: {
        heading: 'Événements récents',
        empty: 'Aucun événement récent.',
        actionBlock: 'Bloqué',
        actionFlag: 'Aurait bloqué',
        actionAllow: 'Autorisé',
        actionRedact: 'Anonymisé',
        justNow: 'à l’instant',
        minutesAgo: 'il y a {count} min',
        hoursAgo: 'il y a {count} h',
        daysAgo: 'il y a {count} j',
      },
    },
    promotionQueue: {
      heading: 'File de promotion',
      subtitle: 'Politiques souples mûres pour être promues en Strict.', // TODO(i18n): native review
      empty: 'Aucune politique prête pour promotion.',
      ageLabel: '{days}j en Souple',
      hitsLabel: '{count} déclenchements / 30j',
      fpRateLabel: '{rate}% FP',
      eligible: 'Éligible',
      daysToGo: '{days}j restants',
    },
    panels: {
      strict: {
        heading: 'Strict — Application',
        subtitle: 'Politiques bloquant ou anonymisant le trafic activement.',
        empty: 'Aucune politique Stricte. Promouvez une candidate depuis la file ci-dessus.', // TODO(i18n): native review
        modeBadge: 'EN APPLICATION',
        blocksHeader: 'Blocages',
      },
      guideline: {
        heading: 'Souple — Observation',
        subtitle: "Politiques en mode observation. Journalisation seule, trafic non modifié.",
        empty: 'Aucune politique Souple. Clonez un modèle pour commencer.',
        modeBadge: 'EN OBSERVATION',
        blocksHeader: 'Aurait bloqué',
      },
      row: {
        appsLabel: 'Applis : {value}',
        lastHitLabel: 'Dernier déclenchement : {when}',
        fpLabel: 'FP {rate}%',
        neverTriggered: '—',
      },
    },
    actions: {
      promote: 'Promouvoir',
      demote: 'Rétrograder',
      pause: 'Pause',
      resume: 'Reprendre',
      confirm: 'Confirmer',
      cancel: 'Annuler',
      working: 'En cours…',
      promoteTitle: 'Promouvoir en Strict ?',
      promoteBody: 'Cette politique commencera à appliquer immédiatement.', // TODO(i18n): native review
      demoteTitle: 'Rétrograder en Souple ?',
      demoteBody: 'Le trafic ne sera plus bloqué. La politique continuera à observer.', // TODO(i18n): native review
      pauseTitle: 'Mettre la politique en pause ?',
      pauseBody: "Les évaluations s'arrêtent jusqu'à la reprise.",
      resumeTitle: 'Reprendre la politique ?',
      resumeBody: 'Les évaluations reprennent immédiatement.',
    },
  },
}
