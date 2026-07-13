export const defenderImport = {
  title: "Import de capture d'écran Defender", // TODO(i18n): native review
  subtitle:
    "Téléversez une capture d'écran de la liste des applications découvertes de Microsoft Defender for Cloud Apps. L'agent extrait les applications d'IA fantôme, enrichit chacune d'elles à partir du catalogue de fournisseurs d'IA et les ajoute à votre inventaire.",
  badge: 'Démo simulée',
  backToDiscover: 'Retour à Découvrir',
  upload: {
    dropTitle: "Déposez une capture d'écran Defender ici",
    dropHint: 'PNG, JPG ou SVG — ou parcourez pour choisir un fichier',
    browse: 'Parcourir les fichiers',
    or: 'ou',
    sample: "Essayer avec une capture d'exemple",
    invalidType: "Ce fichier n'est pas une image. Téléversez une capture d'écran (PNG, JPG ou SVG).",
  },
  scanning: {
    title: "Analyse de la capture d'écran…",
    stage1: 'Passage OCR en cours…',
    stage2: 'Détection de la structure du tableau…',
    stage3: "Rapprochement avec le catalogue de fournisseurs d'IA…",
  },
  review: {
    title: 'Applications extraites',
    subtitle: "{count} applications d'IA fantôme trouvées — enrichies à partir du catalogue de fournisseurs d'IA",
    enriching: 'Enrichissement…',
    addButton: "Ajouter {count} à l'inventaire",
    adding: 'Ajout…',
    retryButton: 'Réessayer les échecs',
  },
  table: {
    app: 'Application',
    users: 'Utilisateurs',
    traffic: 'Téléversé',
    lastSeen: 'Dernière détection',
    defenderScore: 'Score Defender',
    vendor: 'Fournisseur',
    capability: 'Capacité IA',
    models: 'Modèles',
    trains: 'Entraîne sur les données',
    trainsYes: 'Oui',
    trainsNo: 'Non',
    classification: 'Classification',
    risk: 'Risque',
  },
  rowStatus: {
    added: 'Ajoutée',
    failed: 'Échec',
  },
  done: {
    title: "{count} applications ajoutées à l'inventaire",
    body: 'Elles sont enregistrées comme applications fantômes (Shadow). Attribuez un responsable et un service, puis promouvez-les après examen.',
    importAnother: 'Importer une autre capture',
  },
}
