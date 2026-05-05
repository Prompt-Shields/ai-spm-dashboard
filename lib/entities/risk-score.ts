// Risk score computation per Application. Pure function — caller
// passes in the current Application + recent telemetry counters and
// gets a 0–100 number back. No I/O.
//
// Formula (from docs/ai-spm-crud-plan.md §7):
//   base                              20
//   + shadow penalty                  +30 if deploymentStatus === "Shadow"
//   + classification weight           +20 × {restricted: 1, confidential: 0.7, internal: 0.3, public: 0}
//   + violation rate                  +30 × min(violationCount30d / max(usageCount30d, 1), 1)
//   - latest compliance pass          -20 if latest assessment passed
//   clamp                              [0, 100]

import type { Application, ComplianceAssessment } from "./types"

export interface RiskInputs {
  application: Application
  usageCount30d: number
  violationCount30d: number
  latestAssessment?: ComplianceAssessment
}

const CLASSIFICATION_WEIGHTS: Record<string, number> = {
  restricted: 1,
  confidential: 0.7,
  internal: 0.3,
  public: 0
}

export function computeRiskScore(inputs: RiskInputs): number {
  const { application, usageCount30d, violationCount30d, latestAssessment } = inputs

  let score = 20 // base

  if (application.deploymentStatus === "Shadow") {
    score += 30
  }

  const classification = application.dataClassification
  if (classification && classification in CLASSIFICATION_WEIGHTS) {
    score += 20 * CLASSIFICATION_WEIGHTS[classification]
  }

  const safeUsage = Math.max(usageCount30d, 1)
  const violationRate = Math.min(violationCount30d / safeUsage, 1)
  score += 30 * violationRate

  if (latestAssessment?.pass) {
    score -= 20
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}
