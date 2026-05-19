// POST /api/policies/[id]/promote — initiates a promotion request.
//
// Body: {
//   approverRoles: string[],
//   rolloutStrategy: "all" | "canary" | "phased",
//   rolloutCanaryAppId?: string,
//   rolloutPercentage?: number,
//   autoRevertOnHighFp: boolean,
//   autoRevertThreshold: number,
//   requestedBy: string
// }
//
// This does NOT switch the policy to Strict. It records a pending
// PromotionEvent with approvers in "pending" status. Admins call
// /approve to actually flip the mode once all approvers sign off.

import { NextResponse, type NextRequest } from "next/server"
import { getInstanceById, upsertInstance } from "@/lib/policy-engine/server/store"
import type { ApprovalRecord, PromotionEvent } from "@/lib/policy-templates/types"

export const dynamic = "force-dynamic"

interface PromoteRequest {
  approverRoles: string[]
  rolloutStrategy: "all" | "canary" | "phased"
  rolloutCanaryAppId?: string
  rolloutPercentage?: number
  autoRevertOnHighFp?: boolean
  autoRevertThreshold?: number
  requestedBy: string
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const instance = getInstanceById(id)
  if (!instance) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  let body: PromoteRequest
  try {
    body = (await req.json()) as PromoteRequest
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  if (!Array.isArray(body.approverRoles) || body.approverRoles.length === 0) {
    return NextResponse.json({ error: "approverRoles_required" }, { status: 400 })
  }

  // Reject if a pending promotion already exists
  const lastEvent = instance.promotionHistory.at(-1)
  const hasPendingPromotion =
    lastEvent?.to === "strict" &&
    lastEvent.approvers?.some((a) => a.status === "pending")
  if (hasPendingPromotion) {
    return NextResponse.json(
      { error: "promotion_already_pending" },
      { status: 409 }
    )
  }

  const approvers: ApprovalRecord[] = body.approverRoles.map((role) => ({
    role,
    status: "pending"
  }))

  const event: PromotionEvent = {
    from: "guideline",
    to: "strict",
    at: new Date().toISOString(),
    by: body.requestedBy,
    reason: `Promotion requested. Strategy: ${body.rolloutStrategy}`,
    approvers
  }

  const updated = upsertInstance({
    ...instance,
    rolloutStrategy: body.rolloutStrategy,
    rolloutCanaryAppId: body.rolloutCanaryAppId,
    rolloutPercentage: body.rolloutPercentage,
    autoDemote: {
      enabled: body.autoRevertOnHighFp ?? instance.autoDemote.enabled,
      fpRateThreshold: body.autoRevertThreshold ?? instance.autoDemote.fpRateThreshold,
      windowMinutes: instance.autoDemote.windowMinutes,
      graceSeconds: instance.autoDemote.graceSeconds
    },
    promotionHistory: [...instance.promotionHistory, event],
    updatedAt: new Date().toISOString()
  })

  return NextResponse.json({
    ok: true,
    instance: updated,
    pendingApprovers: approvers
  })
}
