import { ensureFixturesSeeded } from "@/lib/entities/fixtures"
import { organizationalUnitsStore } from "@/lib/entities/organizational-units-store"
import { jsonError, jsonOk, readJsonBody, withRouteErrors } from "@/lib/entities/route-helpers"
import { parseOrganizationalUnitInput } from "../route"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  ensureFixturesSeeded()
  const found = organizationalUnitsStore.get(params.id)
  if (!found) return jsonError("not_found", 404)
  return jsonOk({ organizationalUnit: found })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  return withRouteErrors(async () => {
    ensureFixturesSeeded()
    const existing = organizationalUnitsStore.get(params.id)
    if (!existing) return jsonError("not_found", 404)
    const raw = await readJsonBody(request)
    const incoming = parseOrganizationalUnitInput({ ...(raw as object), id: params.id })
    return jsonOk({ organizationalUnit: organizationalUnitsStore.upsert(incoming) })
  })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  ensureFixturesSeeded()
  const removed = organizationalUnitsStore.delete(params.id)
  if (!removed) return jsonError("not_found", 404)
  return jsonOk({ deleted: params.id })
}
