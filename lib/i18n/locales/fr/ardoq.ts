export const ardoq = {
  header: {
    title: 'Export Ardoq',
    description:
      "Téléchargez un lot de 9 fichiers CSV conforme au schéma d'import Ardoq AI Lens. Déposez le ZIP dans l'assistant d'import Ardoq — entités, responsables, magasins de données, références et évaluations de conformité sont tous transférés en une seule opération.", // TODO(i18n): native review
  },
  apiKey: {
    label: "Clé API d'administration",
    hintBefore: 'Définissez ',
    hintAfter:
      " dans l'environnement de déploiement, puis collez la même valeur ici. Stockée dans sessionStorage — effacée à la fermeture de l'onglet.", // TODO(i18n): native review
  },
  actions: {
    loading: 'Chargement…',
    refreshPreview: "Actualiser l'aperçu",
    previewExport: "Aperçu de l'export",
    downloading: 'Téléchargement…',
    downloadZip: 'Télécharger le ZIP',
  },
  manifest: {
    meta: 'Généré le {date} · locataire {tenant}',
    colFile: 'Fichier',
    colRows: 'Lignes',
    colSize: 'Taille',
  },
  errors: {
    pasteKeyFirst: "Collez d'abord votre clé API d'administration.",
    fetchManifestHttp: 'Échec de la récupération du manifeste (HTTP {status})',
    fetchManifest: 'Échec de la récupération du manifeste.',
    downloadZipHttp: 'Échec du téléchargement du ZIP (HTTP {status})',
    downloadZip: 'Échec du téléchargement du ZIP.',
  },
}
