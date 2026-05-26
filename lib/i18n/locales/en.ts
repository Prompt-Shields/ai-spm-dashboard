// NB: do NOT use `as const` here. Messages = typeof en must be the WIDENED
// shape (values typed as `string`) so nb/fr can hold translated values
// ("Atlas KI", "Norsk", …). `as const` would make Messages carry literal
// types ('Atlas AI') and every translated value would be a type error.
// Shape drift (missing/extra keys) is still caught by typing nb/fr as Messages
// + the completeness test.
export const en = {
  common: {
    appName: 'Atlas AI',
    tagline: 'Mapping AI use cases with risks',
    startDemo: 'Start Demo',
  },
  nav: {
    map: 'Map',
    discover: 'Discover',
    register: 'Register',
    owners: 'Owners',
    comply: 'Comply',
    policies: 'Policies',
    piiShield: 'PII Shield Demo',
  },
}
