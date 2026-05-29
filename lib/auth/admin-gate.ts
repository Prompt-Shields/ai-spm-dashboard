// admin-gate.ts — shared-secret guard for admin-only Next.js routes.
//
// Stopgap until the atlas.ai auth port lands (see comment block in
// app/api/ardoq/export/route.ts). Real implementation will swap this
// for a session-based check; the call sites won't change.
//
// Why a shared secret and not "open in dev / closed in prod"?
//   Routes like /api/ardoq/export dump the entire tenant inventory.
//   If we leave them open in dev and gate only in prod, a developer
//   could ship a dev build to staging and accidentally expose them.
//   Forcing a deliberate env var in every environment means the gate
//   is the same shape everywhere, just with different secrets.
//
// Usage:
//
//   import { requireAdminAuth } from "@/lib/auth/admin-gate"
//
//   export async function GET(req: NextRequest) {
//     const denial = requireAdminAuth(req)
//     if (denial) return denial
//     // ... handler ...
//   }
//
// Behaviour:
//   - process.env.ATLAS_ADMIN_API_KEY unset → 503 with a clear message
//     telling the operator to set it. Refuses to fall open under any
//     circumstance.
//   - Authorization header missing or not `Bearer <key>` → 401
//   - Key mismatch (constant-time compare) → 401
//   - Match → returns null (the route handler proceeds)

import { NextResponse, type NextRequest } from "next/server"

/**
 * Validates the `Authorization: Bearer <key>` header against the
 * `ATLAS_ADMIN_API_KEY` env var. Returns:
 *   - null when the request is authorised → handler proceeds
 *   - a NextResponse to return immediately when denied
 *
 * Never throws. Always returns one of the two shapes so route
 * handlers can stay one-line: `if (denial) return denial`.
 */
export function requireAdminAuth(req: NextRequest): NextResponse | null {
  const expected = process.env.ATLAS_ADMIN_API_KEY

  // Refuse to fall open. Operator MUST configure this in every env.
  if (!expected || !expected.trim()) {
    return NextResponse.json(
      {
        error: "endpoint_not_configured",
        message:
          "ATLAS_ADMIN_API_KEY is not set. Configure it in the deployment " +
          "environment before this endpoint becomes reachable. See " +
          "docs/auth-stopgap.md (or lib/auth/admin-gate.ts) for the rationale.",
      },
      { status: 503 },
    )
  }

  const header = req.headers.get("authorization") || ""
  // Expected shape: `Bearer <key>`. Case-insensitive on the scheme,
  // strict on the rest.
  const match = header.match(/^Bearer\s+(.+)$/i)
  if (!match) {
    return NextResponse.json(
      {
        error: "unauthorized",
        message: "Missing or malformed Authorization header.",
      },
      { status: 401 },
    )
  }

  const presented = match[1].trim()
  if (!constantTimeEquals(presented, expected.trim())) {
    return NextResponse.json(
      { error: "unauthorized", message: "Invalid admin API key." },
      { status: 401 },
    )
  }

  return null
}

/**
 * Constant-time string equality — avoids leaking key length / prefix
 * info via timing side-channels. The early-return on length mismatch
 * is fine because key length itself isn't sensitive.
 */
function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}
