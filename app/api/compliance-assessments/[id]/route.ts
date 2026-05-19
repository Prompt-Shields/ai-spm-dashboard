import { complianceAssessmentsStore } from "@/lib/entities/compliance-assessments-store"
import { ensureFixturesSeeded } from "@/lib/entities/fixtures"
import { jsonError, jsonOk, readJsonBody, withRouteErrors } from "@/lib/entities/route-helpers"
import { parseAssessmentInput } from "../route"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  ensureFixturesSeeded()
  const found = complianceAssessmentsStore.get(params.id)
  if (!found) return jsonError("not_found", 404)
  return jsonOk({ complianceAssessment: found })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  return withRouteErrors(async () => {
    ensureFixturesSeeded()
    if (!complianceAssessmentsStore.get(params.id)) return jsonError("not_found", 404)
    const raw = await readJsonBody(request)
    const incoming = parseAssessmentInput({ ...(raw as object), id: params.id })
    return jsonOk({ complianceAssessment: complianceAssessmentsStore.upsert(incoming) })
  })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  ensureFixturesSeeded()
  const removed = complianceAssessmentsStore.delete(params.id)
  if (!removed) return jsonError("not_found", 404)
  return jsonOk({ deleted: params.id })
}
