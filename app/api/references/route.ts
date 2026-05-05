// GET  /api/references                 — list with ?source=, ?target=, ?type= filters
// POST /api/references                 — create a manual edge

import type { Reference, ReferenceType } from "@/lib/entities/types"
import { DEFAULT_TENANT_ID, nowIso } from "@/lib/entities/types"
import { ensureFixturesSeeded } from "@/lib/entities/fixtures"
import { queryReferences, referencesStore } from "@/lib/entities/references-store"
import {
  optionalString,
  requireOneOf,
  requireString
} from "@/lib/entities/store-base"
import { jsonOk, readJsonBody, withRouteErrors } from "@/lib/entities/route-helpers"

export const dynamic = "force-dynamic"

const REFERENCE_TYPES: readonly ReferenceType[] = [
  "Is Realized By",
  "Deploys",
  "Is Owner Of",
  "Observed Use",
  "Belongs To",
  "Reads From",
  "Runs On",
  "Has Subject"
]

export async function GET(request: Request) {
  ensureFixturesSeeded()
  const url = new URL(request.url)
  const source = url.searchParams.get("source") ?? undefined
  const target = url.searchParams.get("target") ?? undefined
  const typeParam = url.searchParams.get("type") ?? undefined
  const type = typeParam ? requireOneOf(typeParam, REFERENCE_TYPES, "type") : undefined

  return jsonOk({
    references: queryReferences({ sourceId: source, targetId: target, type })
  })
}

export async function POST(request: Request) {
  return withRouteErrors(async () => {
    ensureFixturesSeeded()
    const raw = await readJsonBody(request)
    return jsonOk({ reference: referencesStore.upsert(parseReferenceInput(raw)) }, 201)
  })
}

export function parseReferenceInput(raw: unknown): Reference {
  if (!raw || typeof raw !== "object") throw new Error("body_must_be_object")
  const r = raw as Record<string, unknown>

  const sourceId = requireString(r.sourceId, "sourceId")
  const targetId = requireString(r.targetId, "targetId")
  const type = requireOneOf(r.type, REFERENCE_TYPES, "type")
  const description = optionalString(r.description, "description") ?? ""
  const id =
    optionalString(r.id, "id") ??
    `ref-${sourceId}-${type.replace(/\s+/g, "_").toLowerCase()}-${targetId}`

  return {
    id,
    tenantId: DEFAULT_TENANT_ID,
    sourceId,
    targetId,
    type,
    description,
    autoDerived: false,
    createdAt: nowIso(),
    updatedAt: nowIso()
  }
}
