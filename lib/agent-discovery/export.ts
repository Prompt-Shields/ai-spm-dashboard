// lib/agent-discovery/export.ts
//
// The DOWNLOADED report is intentionally English-only — it is a portable
// artifact a CISO forwards/archives, not on-screen UI. The on-screen report
// card is localized separately via i18n. This is by design, not a missing
// translation.
import type { Cloud, ComplianceReport, RecommendedAction } from './types'

const CLOUD_LABEL: Record<Cloud, string> = { aws: 'AWS', azure: 'Azure', gcp: 'GCP' }

function actionLine(a: RecommendedAction): string {
  switch (a.kind) {
    case 'registerShadow': return `- Register ${a.count} shadow agent(s) into governance.`
    case 'remediateResidency': return `- Remediate ${a.count} data-residency violation(s).`
    case 'completeManifests': return `- Complete ${a.count} missing security manifest(s).`
    case 'reviewRestricted': return `- Review ${a.count} agent(s) processing restricted data.`
  }
}

export function formatReportMarkdown(report: ComplianceReport): string {
  const lines: string[] = []
  lines.push('# State of AI Compliance')
  lines.push('')
  lines.push('Prepared for: CISO')
  lines.push('')
  lines.push('## Summary')
  lines.push(`- Total agents discovered: ${report.total}`)
  lines.push(`- Registered: ${report.registered}`)
  lines.push(`- Pending approval: ${report.pending}`)
  lines.push(`- Shadow (unregistered): ${report.shadow}`)
  lines.push(`- Data-residency violations: ${report.residencyViolations}`)
  lines.push(`- Missing security manifests: ${report.missingManifests}`)
  lines.push(`- Agents handling restricted data: ${report.restrictedDataAgents}`)
  lines.push('')
  lines.push('## By cloud')
  for (const c of report.perCloud) {
    lines.push(`- ${CLOUD_LABEL[c.cloud]}: ${c.total} agent(s), ${c.shadow} shadow`)
  }
  if (report.recommendedActions.length > 0) {
    lines.push('')
    lines.push('## Recommended actions')
    for (const a of report.recommendedActions) lines.push(actionLine(a))
  }
  lines.push('')
  return lines.join('\n')
}
