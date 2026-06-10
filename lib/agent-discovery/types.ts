// lib/agent-discovery/types.ts
export type Cloud = 'aws' | 'azure' | 'gcp'
export type ApprovalState = 'approved' | 'pending' | 'unregistered' // unregistered = shadow

export interface DiscoveredAgent {
  id: string
  name: string
  cloud: Cloud
  registry: string // 'Bedrock AgentCore' | 'AI Foundry Hub' | 'Knowledge Catalog'
  owner: string
  protocol: 'mcp' | 'a2a' | 'none'
  purpose: string
  approvalState: ApprovalState
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted'
  regulatoryScope: string[]
  region: string
  residencyOk: boolean // false ⇒ processing restricted data outside allowed region
  manifestComplete: boolean // false ⇒ missing security-by-design manifest fields
}

export interface PerCloudCount {
  cloud: Cloud
  total: number
  shadow: number
}

export interface ComplianceReport {
  total: number
  perCloud: PerCloudCount[]
  registered: number
  pending: number
  shadow: number
  residencyViolations: number
  missingManifests: number
  restrictedDataAgents: number
  recommendedActions: RecommendedAction[]
}

// Structured (not pre-localized) so the UI renders via i18n templates.
export type RecommendedActionKind =
  | 'registerShadow'
  | 'remediateResidency'
  | 'completeManifests'
  | 'reviewRestricted'

export interface RecommendedAction {
  kind: RecommendedActionKind
  count: number
}
