// GET / POST  /api/compliance-assessments

import type {
  ApprovalStatus,
  AssessmentType,
  ComplianceAssessment,
  EUAIActRiskLevel
} from "@/lib/entities/types"
import { DEFAULT_TENANT_ID, nowIso, slugify } from "@/lib/entities/types"
import { ensureFixturesSeeded } from "@/lib/entities/fixtures"
import { complianceAssessmentsStore } from "@/lib/entities/compliance-assessments-store"
import {
  optionalBoolean,
  optionalOneOf,
  optionalString,
  optionalStringArray,
  requireOneOf,
  requireString
} from "@/lib/entities/store-base"
import { jsonOk, readJsonBody, withRouteErrors } from "@/lib/entities/route-helpers"

export const dynamic = "force-dynamic"

const ASSESSMENT_TYPES: readonly AssessmentType[] = [
  "EU AI Act",
  "GDPR",
  "NIST AI RMF",
  "ISO 42001",
  "Other"
]

const APPROVAL_STATUSES: readonly ApprovalStatus[] = [
  "Approved",
  "Under Review",
  "Rejected"
]

const RISK_LEVELS: readonly EUAIActRiskLevel[] = [
  "Unacceptable Risk",
  "High-Risk",
  "Limited Risk",
  "Minimal Risk"
]

export async function GET() {
  ensureFixturesSeeded()
  return jsonOk({ complianceAssessments: complianceAssessmentsStore.list() })
}

export async function POST(request: Request) {
  return withRouteErrors(async () => {
    ensureFixturesSeeded()
    const raw = await readJsonBody(request)
    return jsonOk(
      { complianceAssessment: complianceAssessmentsStore.upsert(parseAssessmentInput(raw)) },
      201
    )
  })
}

export function parseAssessmentInput(raw: unknown): ComplianceAssessment {
  if (!raw || typeof raw !== "object") throw new Error("body_must_be_object")
  const r = raw as Record<string, unknown>
  const componentName = requireString(r.componentName, "componentName")
  const id = optionalString(r.id, "id") ?? `ca-${slugify(componentName)}`
  return {
    id,
    tenantId: DEFAULT_TENANT_ID,
    componentName,
    description: optionalString(r.description, "description") ?? "",
    assessmentType: requireOneOf(r.assessmentType, ASSESSMENT_TYPES, "assessmentType"),
    subjectApplicationId: requireString(r.subjectApplicationId, "subjectApplicationId"),
    pass: optionalBoolean(r.pass, "pass") ?? false,
    rationale: optionalString(r.rationale, "rationale") ?? "",
    reviewDate: optionalString(r.reviewDate, "reviewDate") ?? new Date().toISOString().slice(0, 10),
    approvalStatus: requireOneOf(
      r.approvalStatus ?? "Under Review",
      APPROVAL_STATUSES,
      "approvalStatus"
    ),
    approvedByPersonId: optionalString(r.approvedByPersonId, "approvedByPersonId"),
    euAIActRiskLevel: optionalOneOf(r.euAIActRiskLevel, RISK_LEVELS, "euAIActRiskLevel"),
    policyInstanceId: optionalString(r.policyInstanceId, "policyInstanceId"),
    tags: optionalStringArray(r.tags, "tags"),
    createdAt: nowIso(),
    updatedAt: nowIso()
  }
}
