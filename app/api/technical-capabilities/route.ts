// GET /api/technical-capabilities — read-only seeded hierarchy.
//
// Required by Ardoq AI Lens to detect AI Systems via the Is Realized By
// reference type. Level 1 root must be exactly "Artificial Intelligence".
// Mutating endpoints intentionally absent — extend the seed in
// `lib/entities/fixtures.ts` if a new branch is needed.

import { ensureFixturesSeeded } from "@/lib/entities/fixtures"
import { technicalCapabilitiesStore } from "@/lib/entities/technical-capabilities-store"
import { jsonOk } from "@/lib/entities/route-helpers"

export const dynamic = "force-dynamic"

export async function GET() {
  ensureFixturesSeeded()
  return jsonOk({ technicalCapabilities: technicalCapabilitiesStore.list() })
}
