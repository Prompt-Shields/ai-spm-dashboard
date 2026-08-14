import type { Messages } from '../types'
import { common } from './fr/common'
import { nav } from './fr/nav'
import { map } from './fr/map'
import { discover } from './fr/discover'
import { agentDiscovery } from './fr/agentDiscovery'
import { agentControl } from './fr/agentControl'
import { register } from './fr/register'
import { owners } from './fr/owners'
import { comply } from './fr/comply'
import { piiShield } from './fr/piiShield'
import { ardoq } from './fr/ardoq'
import { policyEnforcement } from './fr/policyEnforcement'
import { useCaseDetail } from './fr/useCaseDetail'
import { ownerDetail } from './fr/ownerDetail'
import { agentConversation } from './fr/agentConversation'
import { demoJourney } from './fr/demoJourney'
import { vendor } from './fr/vendor'
import { voiceInterview } from './fr/voiceInterview'
import { defenderImport } from './fr/defenderImport'
import { mcpDiscovery } from './fr/mcpDiscovery'

// French. Each namespace lives in its own file under ./fr/ and is translated
// per-page in Phase B. Typed as Messages so any shape drift from en is a
// compile error (the completeness test guards keys at runtime too).
export const fr: Messages = {
  common,
  nav,
  map,
  discover,
  agentDiscovery,
  agentControl,
  register,
  owners,
  comply,
  piiShield,
  ardoq,
  policyEnforcement,
  useCaseDetail,
  ownerDetail,
  agentConversation,
  demoJourney,
  vendor,
  voiceInterview,
  defenderImport,
  mcpDiscovery,
}
