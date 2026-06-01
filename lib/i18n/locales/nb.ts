import type { Messages } from '../types'
import { common } from './nb/common'
import { nav } from './nb/nav'
import { map } from './nb/map'
import { discover } from './nb/discover'
import { register } from './nb/register'
import { owners } from './nb/owners'
import { comply } from './nb/comply'
import { aiGovernance } from './nb/aiGovernance'
import { aiVisibility } from './nb/aiVisibility'
import { modelRisk } from './nb/modelRisk'
import { ardoq } from './nb/ardoq'
import { policyEnforcement } from './nb/policyEnforcement'
import { demoJourney } from './nb/demoJourney'
import { agentConversation } from './nb/agentConversation'

// Norwegian Bokmål. Each namespace lives in its own file under ./nb/ and is
// translated per-page in Phase B. Typed as Messages so any shape drift from en
// is a compile error (the completeness test guards keys at runtime too).
export const nb: Messages = {
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
  agentConversation,
}
