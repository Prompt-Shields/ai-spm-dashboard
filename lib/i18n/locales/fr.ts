import type { Messages } from '../types'
import { common } from './fr/common'
import { nav } from './fr/nav'
import { map } from './fr/map'
import { discover } from './fr/discover'
import { register } from './fr/register'
import { owners } from './fr/owners'
import { comply } from './fr/comply'
import { aiGovernance } from './fr/aiGovernance'
import { aiVisibility } from './fr/aiVisibility'
import { modelRisk } from './fr/modelRisk'
import { ardoq } from './fr/ardoq'
import { policyEnforcement } from './fr/policyEnforcement'
import { demoJourney } from './fr/demoJourney'

// French. Each namespace lives in its own file under ./fr/ and is translated
// per-page in Phase B. Typed as Messages so any shape drift from en is a
// compile error (the completeness test guards keys at runtime too).
export const fr: Messages = {
  common,
  nav,
  map,
  discover,
  register,
  owners,
  comply,
  aiGovernance,
  aiVisibility,
  modelRisk,
  ardoq,
  policyEnforcement,
  demoJourney,
}
