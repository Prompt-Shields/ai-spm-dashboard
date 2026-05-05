// GET    /api/people/[id]  — fetch one
// PUT    /api/people/[id]  — replace (admin edit)
// DELETE /api/people/[id]  — remove

import { ensureFixturesSeeded } from "@/lib/entities/fixtures"
import { personsStore } from "@/lib/entities/persons-store"
import {
  jsonError,
  jsonOk,
  readJsonBody,
  withRouteErrors
} from "@/lib/entities/route-helpers"
import { parsePersonInput } from "../route"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  ensureFixturesSeeded()
  const found = personsStore.get(params.id)
  if (!found) return jsonError("not_found", 404)
  return jsonOk({ person: found })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  return withRouteErrors(async () => {
    ensureFixturesSeeded()
    const existing = personsStore.get(params.id)
    if (!existing) return jsonError("not_found", 404)
    const raw = await readJsonBody(request)
    const incoming = parsePersonInput({ ...(raw as object), id: params.id })
    return jsonOk({ person: personsStore.upsert(incoming) })
  })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  ensureFixturesSeeded()
  const removed = personsStore.delete(params.id)
  if (!removed) return jsonError("not_found", 404)
  return jsonOk({ deleted: params.id })
}
