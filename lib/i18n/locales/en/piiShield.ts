export const piiShield = {
  title: 'PII Shield Demo',
  intro:
    'Send a prompt to ChatGPT — even one full of personal data. The Shield detects PII locally, swaps it for placeholders before anything leaves your browser, and restores the real values only in the reply you see. ChatGPT never receives the sensitive data.',
  tryExample: 'Try an example:',
  inputPlaceholder:
    'e.g. Draft an email to Sarah Chen at sarah.chen@acme.com about her overdue invoice…',
  showUnprotectedPrefix: 'Show what ChatGPT would see ',
  showUnprotectedEmphasis: 'without',
  showUnprotectedSuffix: ' the Shield',
  send: 'Send to ChatGPT',
  badge: {
    detectedOne: '{count} PII item detected',
    detectedMany: '{count} PII items detected',
    none: '0 PII items detected — forwarded unchanged',
  },
  stage: {
    prompt: {
      title: 'Your prompt',
      subtitle: 'What you typed — sensitive values detected locally.',
    },
    anonymized: {
      title: 'Anonymized — all ChatGPT sees',
      subtitle: 'PII swapped for placeholders before sending.',
    },
    response: {
      title: 'ChatGPT response',
      subtitle: 'Generated from placeholders only — no real PII.',
    },
    restored: {
      title: 'Restored for you',
      subtitle: 'Placeholders swapped back to the real values — only in your view.',
    },
  },
  withoutShield: 'Without Shield — ChatGPT would receive this',
  responding: 'ChatGPT is responding…',
  mappingTitle: 'Detected PII → placeholders',
  types: {
    email: 'email',
    phone: 'phone',
    ssn: 'SSN',
    creditCard: 'card',
    ip: 'IP',
    apiKey: 'API key',
    person: 'name',
    address: 'address',
  },
  mapping: {
    placeholder: 'Placeholder',
    type: 'Type',
    original: 'Original',
    noPiiDetected: 'No PII detected.',
  },
}
