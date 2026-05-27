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
}
