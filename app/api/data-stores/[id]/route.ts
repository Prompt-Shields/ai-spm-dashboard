import { dataStoresStore } from "@/lib/entities/data-stores-store"
import { ensureFixturesSeeded } from "@/lib/entities/fixtures"
import { jsonError, jsonOk, readJsonBody, withRouteErrors } from "@/lib/entities/route-helpers"
import { parseDataStoreInput } from "../route"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  ensureFixturesSeeded()
  const found = dataStoresStore.get(params.id)
  if (!found) return jsonError("not_found", 404)
  return jsonOk({ dataStore: found })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  return withRouteErrors(async () => {
    ensureFixturesSeeded()
    if (!dataStoresStore.get(params.id)) return jsonError("not_found", 404)
    const raw = await readJsonBody(request)
    const incoming = parseDataStoreInput({ ...(raw as object), id: params.id })
    return jsonOk({ dataStore: dataStoresStore.upsert(incoming) })
  })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  ensureFixturesSeeded()
  const removed = dataStoresStore.delete(params.id)
  if (!removed) return jsonError("not_found", 404)
  return jsonOk({ deleted: params.id })
}
