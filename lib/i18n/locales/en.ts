// NB: do NOT use `as const` in the per-namespace files. Messages = typeof en
// must be the WIDENED shape (values typed as `string`) so nb/fr can hold
// translated values ("Atlas KI", "Norsk", …). `as const` would make Messages
// carry literal types ('Atlas AI') and every translated value would be a type
// error. Shape drift (missing/extra keys) is still caught by typing nb/fr as
// Messages + the completeness test.
//
// Each namespace lives in its own file under ./en/ so Phase B work (and
// parallel agents) can own one namespace without catalog merge conflicts.
import { common } from './en/common'
import { nav } from './en/nav'
import { map } from './en/map'
import { discover } from './en/discover'
import { agentDiscovery } from './en/agentDiscovery'
import { register } from './en/register'
import { owners } from './en/owners'
import { comply } from './en/comply'
import { aiGovernance } from './en/aiGovernance'
import { aiVisibility } from './en/aiVisibility'
import { modelRisk } from './en/modelRisk'
import { piiShield } from './en/piiShield'
import { ardoq } from './en/ardoq'
import { policyEnforcement } from './en/policyEnforcement'
import { useCaseDetail } from './en/useCaseDetail'
import { ownerDetail } from './en/ownerDetail'
import { agentConversation } from './en/agentConversation'
import { demoJourney } from './en/demoJourney'

export const en = {
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
}
