import type { Messages } from '../types'
import { common } from './nb/common'
import { nav } from './nb/nav'
import { map } from './nb/map'
import { discover } from './nb/discover'
import { agentDiscovery } from './nb/agentDiscovery'
import { register } from './nb/register'
import { owners } from './nb/owners'
import { comply } from './nb/comply'
import { aiGovernance } from './nb/aiGovernance'
import { aiVisibility } from './nb/aiVisibility'
import { modelRisk } from './nb/modelRisk'
import { piiShield } from './nb/piiShield'
import { ardoq } from './nb/ardoq'
import { policyEnforcement } from './nb/policyEnforcement'
import { useCaseDetail } from './nb/useCaseDetail'
import { ownerDetail } from './nb/ownerDetail'
import { agentConversation } from './nb/agentConversation'
import { demoJourney } from './nb/demoJourney'
import { vendor } from './nb/vendor'

// Norwegian Bokmål. Each namespace lives in its own file under ./nb/ and is
// translated per-page in Phase B. Typed as Messages so any shape drift from en
// is a compile error (the completeness test guards keys at runtime too).
export const nb: Messages = {
  common,
  nav,
  map,
  discover,
  agentDiscovery,
  register,
  owners,
  comply,
  aiGovernance,
  aiVisibility,
  modelRisk,
  piiShield,
  ardoq,
  policyEnforcement,
  useCaseDetail,
  ownerDetail,
  agentConversation,
  demoJourney,
  vendor,
}
