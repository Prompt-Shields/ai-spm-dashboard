// POST /api/people/me — Promptly macOS app upserts the current user.
// Idempotent: dedupe by Auth0 sub first, then by email; insert only on miss.
//
// Expected body shape:
//   { auth0Sub, email, firstName, lastName, role?, organizationalUnitId? }

import type { Person } from "@/lib/entities/types"
import { DEFAULT_TENANT_ID, nowIso, slugify } from "@/lib/entities/types"
import { ensureFixturesSeeded } from "@/lib/entities/fixtures"
import {
  findPersonByAuth0Sub,
  findPersonByEmail,
  personsStore
} from "@/lib/entities/persons-store"
import {
  optionalString,
  requireString
} from "@/lib/entities/store-base"
import { jsonOk, readJsonBody, withRouteErrors } from "@/lib/entities/route-helpers"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  return withRouteErrors(async () => {
    ensureFixturesSeeded()
    const raw = await readJsonBody(request)
    if (!raw || typeof raw !== "object") {
      throw new Error("body_must_be_object")
    }
    const r = raw as Record<string, unknown>

    const auth0Sub = requireString(r.auth0Sub, "auth0Sub")
    const email = requireString(r.email, "email")
    const firstName = optionalString(r.firstName, "firstName") ?? ""
    const lastName = optionalString(r.lastName, "lastName") ?? ""
    const role = optionalString(r.role, "role") ?? "Employee"
    const organizationalUnitId = optionalString(r.organizationalUnitId, "organizationalUnitId")

    const componentName = `${firstName} ${lastName}`.trim() || email

    // 1. dedupe by Auth0 sub (the canonical key)
    let existing = findPersonByAuth0Sub(auth0Sub)
    // 2. fall back to email so we don't create a duplicate when an
    //    admin pre-created a Person via the dashboard before the macOS
    //    app first emitted.
    if (!existing) existing = findPersonByEmail(email)

    const id = existing?.id ?? `person-${slugify(componentName)}`
    const now = nowIso()
    const merged: Person = {
      id,
      tenantId: DEFAULT_TENANT_ID,
      auth0Sub,
      componentName,
      description: existing?.description ?? "",
      email,
      // Don't clobber an admin-edited role with a default.
      role: existing?.role ?? role,
      organizationalUnitId: existing?.organizationalUnitId ?? organizationalUnitId,
      tags: existing?.tags ?? [],
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    }

    return jsonOk({ person: personsStore.upsert(merged) }, 201)
  })
}
