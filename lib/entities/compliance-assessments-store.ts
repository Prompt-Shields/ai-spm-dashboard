// ComplianceAssessment CRUD store. Decision #4: separate first-class
// entity (matches the Ardoq Compliance Assurance workspace shape
// directly) rather than overloading PolicyInstance with assessment
// metadata. PolicyInstance stays focused on detection rules; an
// assessment can reference a PolicyInstance for evidence.

import type { ComplianceAssessment, CustomId, TenantId } from "./types"
import { createMemoryStore } from "./store-base"
import { DEFAULT_TENANT_ID } from "./types"

export const complianceAssessmentsStore = createMemoryStore<ComplianceAssessment>("compliance-assessments")

export function listAssessmentsForApplication(
  applicationId: CustomId,
  tenantId: TenantId = DEFAULT_TENANT_ID
): ComplianceAssessment[] {
  return complianceAssessmentsStore
    .list(tenantId)
    .filter((a) => a.subjectApplicationId === applicationId)
}

/// Latest assessment per subject application — used by the risk-score
/// computation (`-20` if the most recent assessment passed).
export function latestAssessmentForApplication(
  applicationId: CustomId,
  tenantId: TenantId = DEFAULT_TENANT_ID
): ComplianceAssessment | undefined {
  return listAssessmentsForApplication(applicationId, tenantId).sort((a, b) =>
    b.reviewDate.localeCompare(a.reviewDate)
  )[0]
}
