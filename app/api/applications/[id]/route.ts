// GET    /api/applications/[id]
// PUT    /api/applications/[id]
// DELETE /api/applications/[id]

import { applicationsStore } from "@/lib/entities/applications-store"
import { ensureFixturesSeeded } from "@/lib/entities/fixtures"
import {
  jsonError,
  jsonOk,
  readJsonBody,
  withRouteErrors
} from "@/lib/entities/route-helpers"
import { parseApplicationInput } from "../route"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  ensureFixturesSeeded()
  const found = applicationsStore.get(params.id)
  if (!found) return jsonError("not_found", 404)
  return jsonOk({ application: found })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  return withRouteErrors(async () => {
    ensureFixturesSeeded()
    const existing = applicationsStore.get(params.id)
    if (!existing) return jsonError("not_found", 404)
    const raw = await readJsonBody(request)
    const incoming = parseApplicationInput({ ...(raw as object), id: params.id })
    return jsonOk({ application: applicationsStore.upsert(incoming) })
  })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  ensureFixturesSeeded()
  const removed = applicationsStore.delete(params.id)
  if (!removed) return jsonError("not_found", 404)
  return jsonOk({ deleted: params.id })
}
