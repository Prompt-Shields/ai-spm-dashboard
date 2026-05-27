export const policyEnforcement = {
  // Shared across pages
  backToPolicies: '← All policies',
  backToLibrary: '← Template library',
  list: {
    title: 'Policy Enforcement',
    subtitle: 'Promote Guidelines to Strict once you trust the false-positive rate.',
    newFromTemplate: '+ New from template',
    summary: {
      strictlyEnforced: 'Strictly enforced',
      guidelinesObserving: 'Guidelines (observing)',
      appsUnderPolicy: 'Apps under policy',
    },
    blocksBanner: '{count} blocks in the last 30 days across all Strict policies.',
    strictSection: {
      title: '🛡️ Strictly Enforced',
      subtitle: 'Live policies blocking or redacting traffic in real time.',
      empty: "No Strict policies yet. Promote a Guideline once it's earned its keep.",
    },
    guidelineSection: {
      title: '📘 Guidelines',
      subtitle: 'Policies in observation mode. Logging only — no traffic altered.',
      empty: 'No Guidelines yet. Clone a template to get started.',
    },
    row: {
      live: '● LIVE',
      awaitingApprovals: 'Awaiting {count} approval(s)',
      appsLabel: 'Apps:',
      appsAll: 'all',
      hits30dLabel: 'Hits/30d:',
      fpRateLabel: 'FP rate:',
      eligibleToPromote: 'Eligible to promote',
      promoteInDays: 'Promote in {days}d',
      notYetEligible: 'Not yet eligible',
      view: 'View →',
    },
  },
  templates: {
    title: 'Template library',
    subtitle:
      '{count} starter policies covering OWASP LLM Top 10, EU AI Act, GDPR, industry regulations, shadow AI, and content safety. Clone to start observing — admins decide when to promote to Strict.',
  },
  templateDetail: {
    rationale: 'Rationale',
    exampleViolation: 'Example violation',
    exampleSafeInput: 'Example safe input',
    triggers: 'Triggers ({count})',
    detectors: 'Detectors ({count})',
    actions: 'Actions ({count})',
    tunableParameters: 'Tunable parameters ({count})',
    locked: '🔒 locked',
    defaultPrefix: 'Default:',
    regulatoryReferences: 'Regulatory references',
    defaultsHeading: 'Template defaults (suggested target after promotion)',
    suggestedMode: 'Suggested mode',
    riskTiers: 'Risk tiers',
    dataClassifications: 'Data classifications',
    departments: 'Departments',
    defaultsNote:
      'Cloned policies start in Guideline mode. Use the promotion wizard to flip to Strict once you trust the false-positive rate.',
  },
}
