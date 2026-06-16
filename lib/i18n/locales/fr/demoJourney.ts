export const demoJourney = {
  progress: 'Étape {current} sur {total} · ~{duration} s',
  steps: {
    s1: {
      title: "Votre organisation n'a pas encore de carte de l'IA",
      // TODO(i18n): native review
      body: "Vous partez de zéro. Que vous soyez RSSI, DSI, responsable GRC ou responsable IA — c'est ici que la gouvernance commence. Découvrons quelle IA votre organisation utilise réellement.",
      cta: "Lancer l'agent de découverte →",
    },
    s2: {
      title: 'La découverte est en cours',
      // TODO(i18n): native review
      body: "Surveillance agentique sur les postes, agents qui interrogent les employés de façon répétée, employés qui s'auto-enregistrent, et parc SaaS analysé automatiquement. Chaque méthode alimente la même carte.",
      cta: 'Voir la carte se remplir →',
    },
    s3: {
      title: "47 cas d'usage cartographiés. 12 risques critiques identifiés.",
      // TODO(i18n): native review
      body: "Aucun tableur, aucune collecte manuelle de données, aucune vue partielle. Chaque cas d'usage de l'IA dans chaque service — révélé et centralisé automatiquement sur une seule carte. Cliquez sur un nœud pour explorer l'ensemble des risques.",
      cta: 'Attribuer la responsabilité →',
    },
    s4: {
      title: 'Responsables identifiés et notifiés',
      // TODO(i18n): native review
      body: "L'IA a suggéré des responsables en fonction de qui a signalé chaque cas d'usage. Un clic pour confirmer. Les agents envoient automatiquement à chaque responsable ses tâches d'évaluation des risques.",
      cta: 'Voir la couverture de conformité →',
    },
    s5: {
      title: "De zéro à cartographié — sur l'EU AI Act, NIS2, ISO 42001 et plus",
      // TODO(i18n): native review
      body: "Chaque cas d'usage est associé aux réglementations et référentiels qui comptent pour votre organisation. Les écarts sont visibles. Les remédiations sont à un clic.",
      cta: 'Terminer la démo',
    },
  },
}
