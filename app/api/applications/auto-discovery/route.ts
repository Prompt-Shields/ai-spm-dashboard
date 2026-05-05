// POST /api/applications/auto-discovery
//
// Called by the Promptly macOS app when its usage stream observes a
// person using an AI tool that has no matching Application yet. Idempotent:
// repeated calls for the same (person, promptlyAppId) just bump the
// updatedAt — they do not multiply rows. Only the first call creates the
// stub.
//
// Body: { auth0Sub, promptlyAppId, observedAt }
//
// Response: { application, created } where created=true on first call.

import {
  applicationsStore,
  findShadowApplicationFor
} from "@/lib/entities/applications-store"
import { ensureFixturesSeeded } from "@/lib/entities/fixtures"
import {
  findPersonByAuth0Sub,
  findPersonByEmail
} from "@/lib/entities/persons-store"
import { jsonError, jsonOk, readJsonBody, withRouteErrors } from "@/lib/entities/route-helpers"
import { requireString } from "@/lib/entities/store-base"
import type { Application } from "@/lib/entities/types"
import { DEFAULT_TENANT_ID, nowIso } from "@/lib/entities/types"

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
    const promptlyAppId = requireString(r.promptlyAppId, "promptlyAppId")
    const promptlyAppName = (r.promptlyAppName as string | undefined) ?? promptlyAppId

    // Resolve the person. macOS should have called /api/people/me first;
    // if not, we can't tag this Application with an owner.
    const person = findPersonByAuth0Sub(auth0Sub)
    if (!person) {
      return jsonError("person_not_found_call_people_me_first", 404, { auth0Sub })
    }

    const existing = findShadowApplicationFor(promptlyAppId, person.id)
    if (existing) {
      // Bump updatedAt so the dashboard surfaces this as recent activity
      // even though the Application record itself didn't change.
      const refreshed = applicationsStore.upsert({
        ...existing,
        updatedAt: nowIso()
      })
      return jsonOk({ application: refreshed, created: false })
    }

    // Build a clear shadow record. Risk score defaults to 80 — Shadow
    // alone gives 50 (20 base + 30 shadow penalty); we add 30 for the
    // unknown classification so it surfaces above safer items.
    const application: Application = {
      id: `app-shadow-${promptlyAppId}-${person.id.replace(/^person-/, "")}`,
      tenantId: DEFAULT_TENANT_ID,
      componentName: `${promptlyAppName} (used by ${person.componentName})`,
      description: `Auto-discovered: ${person.componentName} was observed using ${promptlyAppName} with no policy ownership assigned. Promote to Active and assign an Owner / Department after review.`,
      organizationalUnitId: person.organizationalUnitId,
      ownerPersonId: person.id,
      deploymentStatus: "Shadow",
      riskScore: 80,
      autoDiscovered: true,
      autoDiscoveredFromAppId: promptlyAppId,
      tags: ["ai-system", "shadow-ai", promptlyAppId, "auto-discovered"],
      createdAt: nowIso(),
      updatedAt: nowIso()
    }

    return jsonOk({ application: applicationsStore.upsert(application), created: true }, 201)
  })
}

// Suppress unused-import lint when findPersonByEmail isn't called.
void findPersonByEmail
