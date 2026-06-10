// lib/agent-discovery/report.ts
import type { Cloud, ComplianceReport, DiscoveredAgent, RecommendedAction } from './types'

const CLOUDS: Cloud[] = ['aws', 'azure', 'gcp']

export function buildComplianceReport(agents: DiscoveredAgent[]): ComplianceReport {
  const shadow = agents.filter(a => a.approvalState === 'unregistered').length
  const residencyViolations = agents.filter(a => !a.residencyOk).length
  const missingManifests = agents.filter(a => !a.manifestComplete).length
  const restrictedDataAgents = agents.filter(a => a.dataClassification === 'restricted').length

  const recommendedActions: RecommendedAction[] = []
  if (shadow > 0) recommendedActions.push({ kind: 'registerShadow', count: shadow })
  if (residencyViolations > 0) recommendedActions.push({ kind: 'remediateResidency', count: residencyViolations })
  if (missingManifests > 0) recommendedActions.push({ kind: 'completeManifests', count: missingManifests })
  if (restrictedDataAgents > 0) recommendedActions.push({ kind: 'reviewRestricted', count: restrictedDataAgents })

  return {
    total: agents.length,
    perCloud: CLOUDS.map(cloud => ({
      cloud,
      total: agents.filter(a => a.cloud === cloud).length,
      shadow: agents.filter(a => a.cloud === cloud && a.approvalState === 'unregistered').length,
    })),
    registered: agents.filter(a => a.approvalState === 'approved').length,
    pending: agents.filter(a => a.approvalState === 'pending').length,
    shadow,
    residencyViolations,
    missingManifests,
    restrictedDataAgents,
    recommendedActions,
  }
}
