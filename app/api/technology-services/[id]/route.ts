import { ensureFixturesSeeded } from "@/lib/entities/fixtures"
import { jsonError, jsonOk, readJsonBody, withRouteErrors } from "@/lib/entities/route-helpers"
import { technologyServicesStore } from "@/lib/entities/technology-services-store"
import { parseTechnologyServiceInput } from "../route"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  ensureFixturesSeeded()
  const found = technologyServicesStore.get(params.id)
  if (!found) return jsonError("not_found", 404)
  return jsonOk({ technologyService: found })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  return withRouteErrors(async () => {
    ensureFixturesSeeded()
    if (!technologyServicesStore.get(params.id)) return jsonError("not_found", 404)
    const raw = await readJsonBody(request)
    const incoming = parseTechnologyServiceInput({ ...(raw as object), id: params.id })
    return jsonOk({ technologyService: technologyServicesStore.upsert(incoming) })
  })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  ensureFixturesSeeded()
  const removed = technologyServicesStore.delete(params.id)
  if (!removed) return jsonError("not_found", 404)
  return jsonOk({ deleted: params.id })
}
