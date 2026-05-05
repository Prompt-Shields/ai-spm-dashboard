// GET    /api/references/[id]
// DELETE /api/references/[id]
//
// No PUT — references are immutable. Recreate to change.

import { ensureFixturesSeeded } from "@/lib/entities/fixtures"
import { referencesStore } from "@/lib/entities/references-store"
import { jsonError, jsonOk } from "@/lib/entities/route-helpers"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  ensureFixturesSeeded()
  const found = referencesStore.get(params.id)
  if (!found) return jsonError("not_found", 404)
  return jsonOk({ reference: found })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  ensureFixturesSeeded()
  const removed = referencesStore.delete(params.id)
  if (!removed) return jsonError("not_found", 404)
  return jsonOk({ deleted: params.id })
}
