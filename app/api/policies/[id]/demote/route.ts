// POST /api/policies/[id]/demote — flip a Strict policy back to Guideline.
//
// Body: { by: string, reason?: string }
//
// Always allowed — this is the safety valve. No approvals required because
// reducing enforcement (less restrictive) doesn't need second-signature.

import { NextResponse, type NextRequest } from "next/server"
import { getInstanceById, upsertInstance } from "@/lib/policy-engine/server/store"
import { demoteToGuideline } from "@/lib/policy-engine/promotion"
import { classOf } from "@/lib/policy-templates/types"

export const dynamic = "force-dynamic"

interface DemoteRequest {
  by: string
  reason?: string
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const instance = getInstanceById(id)
  if (!instance) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  if (classOf(instance.enforcementMode) !== "strict") {
    return NextResponse.json({ error: "not_strict" }, { status: 409 })
  }

  let body: DemoteRequest
  try {
    body = (await req.json()) as DemoteRequest
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }
  if (!body.by) {
    return NextResponse.json({ error: "missing_by" }, { status: 400 })
  }

  const demoted = demoteToGuideline({ instance, by: body.by, reason: body.reason })
  const updated = upsertInstance(demoted)

  return NextResponse.json({ ok: true, instance: updated })
}
