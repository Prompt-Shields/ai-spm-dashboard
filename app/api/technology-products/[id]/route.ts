import { ensureFixturesSeeded } from "@/lib/entities/fixtures"
import { jsonError, jsonOk, readJsonBody, withRouteErrors } from "@/lib/entities/route-helpers"
import { technologyProductsStore } from "@/lib/entities/technology-products-store"
import { parseTechnologyProductInput } from "../route"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  ensureFixturesSeeded()
  const found = technologyProductsStore.get(params.id)
  if (!found) return jsonError("not_found", 404)
  return jsonOk({ technologyProduct: found })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  return withRouteErrors(async () => {
    ensureFixturesSeeded()
    if (!technologyProductsStore.get(params.id)) return jsonError("not_found", 404)
    const raw = await readJsonBody(request)
    const incoming = parseTechnologyProductInput({ ...(raw as object), id: params.id })
    return jsonOk({ technologyProduct: technologyProductsStore.upsert(incoming) })
  })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  ensureFixturesSeeded()
  const removed = technologyProductsStore.delete(params.id)
  if (!removed) return jsonError("not_found", 404)
  return jsonOk({ deleted: params.id })
}
