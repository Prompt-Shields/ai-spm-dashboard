export const demoJourney = {
  progress: 'Étape {current} sur {total} · ~{duration} s',
  steps: {
    s1: {
      title: "Votre organisation n'a pas encore de carte de l'IA",
      // TODO(i18n): native review
      body: "Vous partez de zéro — comme tout RSSI. Découvrons quelle IA votre organisation utilise réellement.",
      cta: "Lancer l'agent de découverte →",
    },
    s2: {
      title: "L'agent IA interroge vos collaborateurs",
      // TODO(i18n): native review
      body: "Les agents prennent contact via Slack et e-mail. Observez comment ils extraient les cas d'usage à partir de conversations naturelles — sans formulaires ni questionnaires.",
      cta: 'Voir la carte se remplir →',
    },
    s3: {
      title: "47 cas d'usage cartographiés. 12 risques critiques identifiés.",
      // TODO(i18n): native review
      body: "Tout vient des conversations avec les agents. Aucune saisie manuelle. Cliquez sur un nœud pour explorer l'ensemble des risques de ce cas d'usage.",
      cta: 'Attribuer la responsabilité →',
    },
    s4: {
      title: 'Responsables identifiés et notifiés',
      // TODO(i18n): native review
      body: "L'IA a suggéré des responsables en fonction de qui a signalé chaque cas d'usage. Un clic pour confirmer. Les agents envoient automatiquement à chaque responsable ses tâches d'évaluation des risques.",
      cta: 'Voir la couverture de conformité →',
    },
    s5: {
      title: "De 0 % à 73 % de couverture de l'EU AI Act — en une seule session.",
      // TODO(i18n): native review
      body: "Chaque cas d'usage est associé aux référentiels qui comptent. Les écarts sont visibles. Les remédiations sont à un clic. Votre IA est désormais gouvernée.",
      cta: 'Terminer la démo',
    },
  },
}
