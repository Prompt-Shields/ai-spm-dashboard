export const piiShield = {
  title: 'Démo PII Shield',
  intro:
    "Envoyez une requête à ChatGPT — même une remplie de données personnelles. Le Shield détecte les PII localement, les remplace par des marqueurs avant que quoi que ce soit ne quitte votre navigateur, et ne restaure les vraies valeurs que dans la réponse que vous voyez. ChatGPT ne reçoit jamais les données sensibles.", // TODO(i18n): native review
  tryExample: 'Essayez un exemple :',
  inputPlaceholder:
    "p. ex. Rédigez un e-mail à Sarah Chen à sarah.chen@acme.com au sujet de sa facture en retard…", // TODO(i18n): native review
  showUnprotectedPrefix: 'Voir ce que ChatGPT verrait ',
  showUnprotectedEmphasis: 'sans',
  showUnprotectedSuffix: ' le Shield',
  send: 'Envoyer à ChatGPT',
  badge: {
    detectedOne: '{count} élément PII détecté',
    detectedMany: '{count} éléments PII détectés',
    none: '0 élément PII détecté — transmis tel quel',
  },
  stage: {
    prompt: {
      title: 'Votre requête',
      subtitle: 'Ce que vous avez saisi — valeurs sensibles détectées localement.',
    },
    anonymized: {
      title: 'Anonymisé — tout ce que ChatGPT voit',
      subtitle: 'PII remplacées par des marqueurs avant l’envoi.',
    },
    response: {
      title: 'Réponse de ChatGPT',
      subtitle: 'Générée uniquement à partir des marqueurs — aucune PII réelle.',
    },
    restored: {
      title: 'Restauré pour vous',
      subtitle: 'Marqueurs remplacés par les vraies valeurs — uniquement dans votre vue.',
    },
  },
  withoutShield: 'Sans le Shield — ChatGPT recevrait ceci',
  responding: 'ChatGPT répond…',
  mappingTitle: 'PII détectées → marqueurs',
  types: {
    email: 'e-mail',
    phone: 'téléphone',
    ssn: 'NSS', // TODO(i18n): native review
    creditCard: 'carte',
    ip: 'IP',
    apiKey: 'clé API',
    person: 'nom',
    address: 'adresse',
  },
  mapping: {
    placeholder: 'Marqueur',
    type: 'Type',
    original: 'Original',
    noPiiDetected: 'Aucune PII détectée.',
  },
}
