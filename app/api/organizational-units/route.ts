// GET / POST  /api/organizational-units

import type { OrganizationalUnit } from "@/lib/entities/types"
import { DEFAULT_TENANT_ID, nowIso, slugify } from "@/lib/entities/types"
import { ensureFixturesSeeded } from "@/lib/entities/fixtures"
import { organizationalUnitsStore } from "@/lib/entities/organizational-units-store"
import {
  optionalString,
  optionalStringArray,
  requireString
} from "@/lib/entities/store-base"
import { jsonOk, readJsonBody, withRouteErrors } from "@/lib/entities/route-helpers"

export const dynamic = "force-dynamic"

export async function GET() {
  ensureFixturesSeeded()
  return jsonOk({ organizationalUnits: organizationalUnitsStore.list() })
}

export async function POST(request: Request) {
  return withRouteErrors(async () => {
    ensureFixturesSeeded()
    const raw = await readJsonBody(request)
    return jsonOk(
      { organizationalUnit: organizationalUnitsStore.upsert(parseOrganizationalUnitInput(raw)) },
      201
    )
  })
}

export function parseOrganizationalUnitInput(raw: unknown): OrganizationalUnit {
  if (!raw || typeof raw !== "object") {
    throw new Error("body_must_be_object")
  }
  const r = raw as Record<string, unknown>
  const componentName = requireString(r.componentName, "componentName")
  const id = optionalString(r.id, "id") ?? `org-${slugify(componentName)}`
  return {
    id,
    tenantId: DEFAULT_TENANT_ID,
    componentName,
    description: optionalString(r.description, "description") ?? "",
    parentId: optionalString(r.parentId, "parentId"),
    tags: optionalStringArray(r.tags, "tags"),
    createdAt: nowIso(),
    updatedAt: nowIso()
  }
}
