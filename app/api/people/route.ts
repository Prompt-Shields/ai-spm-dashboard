// GET  /api/people           — list every Person in the active tenant
// POST /api/people           — create or upsert a Person (admin path)
//
// macOS Promptly app uses /api/people/me to upsert by Auth0 sub.

import type { Person } from "@/lib/entities/types"
import { DEFAULT_TENANT_ID, nowIso, slugify } from "@/lib/entities/types"
import { ensureFixturesSeeded } from "@/lib/entities/fixtures"
import { personsStore, findPersonByEmail } from "@/lib/entities/persons-store"
import {
  optionalString,
  optionalStringArray,
  requireString
} from "@/lib/entities/store-base"
import { jsonOk, readJsonBody, withRouteErrors } from "@/lib/entities/route-helpers"

export const dynamic = "force-dynamic"

export async function GET() {
  ensureFixturesSeeded()
  return jsonOk({ persons: personsStore.list() })
}

export async function POST(request: Request) {
  return withRouteErrors(async () => {
    ensureFixturesSeeded()
    const raw = await readJsonBody(request)
    const person = parsePersonInput(raw)
    return jsonOk({ person: personsStore.upsert(person) }, 201)
  })
}

/// Strict input validation. `id` is auto-derived from componentName via
/// slugify if not provided (covers admin-via-form creation).
export function parsePersonInput(raw: unknown): Person {
  if (!raw || typeof raw !== "object") {
    throw new Error("body_must_be_object")
  }
  const r = raw as Record<string, unknown>

  const componentName = requireString(r.componentName, "componentName")
  const email = requireString(r.email, "email")
  const role = requireString(r.role, "role")
  const description = optionalString(r.description, "description") ?? ""
  const id =
    optionalString(r.id, "id") ??
    `person-${slugify(componentName)}`
  const auth0Sub = optionalString(r.auth0Sub, "auth0Sub")
  const organizationalUnitId = optionalString(r.organizationalUnitId, "organizationalUnitId")
  const tags = optionalStringArray(r.tags, "tags")

  // De-dupe by email if present — keeps the dashboard form from creating
  // a second row when an admin edits an existing Promptly-emitted person.
  const existing = findPersonByEmail(email)
  const finalId = existing?.id ?? id

  return {
    id: finalId,
    tenantId: DEFAULT_TENANT_ID,
    auth0Sub,
    componentName,
    description,
    email,
    role,
    organizationalUnitId,
    tags,
    createdAt: existing?.createdAt ?? nowIso(),
    updatedAt: nowIso()
  }
}
