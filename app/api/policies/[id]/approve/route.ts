// POST /api/policies/[id]/approve — a single approver signs off.
//
// Body: {
//   role: string,
//   approverId: string,
//   decision: "approved" | "rejected",
//   notes?: string
// }
//
// Behaviour:
//   - Updates the matching ApprovalRecord on the most recent pending
//     PromotionEvent.
//   - If decision = "approved" and ALL approvers are now approved,
//     flips enforcementMode to Strict ("block" by default).
//   - If decision = "rejected", marks the promotion event as rejected
//     and the policy stays in Guideline.

import { NextResponse, type NextRequest } from "next/server"
import { getInstanceById, upsertInstance } from "@/lib/policy-engine/server/store"
import { getTemplateById } from "@/lib/policy-templates/templates"
import type { ApprovalRecord, EnforcementMode } from "@/lib/policy-templates/types"

export const dynamic = "force-dynamic"

interface ApproveRequest {
  role: string
  approverId: string
  decision: "approved" | "rejected"
  notes?: string
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const instance = getInstanceById(id)
  if (!instance) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  let body: ApproveRequest
  try {
    body = (await req.json()) as ApproveRequest
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  if (!body.role || !body.approverId || !body.decision) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 })
  }

  const history = [...instance.promotionHistory]
  const lastIdx = history.length - 1
  const last = history[lastIdx]

  if (!last || last.to !== "strict" || !last.approvers) {
    return NextResponse.json({ error: "no_pending_promotion" }, { status: 409 })
  }

  const target = last.approvers.find((a) => a.role === body.role)
  if (!target) {
    return NextResponse.json({ error: "approver_role_not_required" }, { status: 400 })
  }
  if (target.status !== "pending") {
    return NextResponse.json(
      { error: "approver_already_decided", currentStatus: target.status },
      { status: 409 }
    )
  }

  // Apply this approver's decision (immutably re-create the array)
  const updatedApprovers: ApprovalRecord[] = last.approvers.map((a) =>
    a.role === body.role
      ? {
          ...a,
          status: body.decision,
          approverId: body.approverId,
          at: new Date().toISOString(),
          notes: body.notes
        }
      : a
  )

  history[lastIdx] = { ...last, approvers: updatedApprovers }

  // If rejected, freeze in Guideline. If all approved, promote to Strict.
  let enforcementMode: EnforcementMode = instance.enforcementMode
  let promoted = false
  let rejected = false

  if (body.decision === "rejected") {
    rejected = true
    // Keep the rejection event in history but the policy stays as it was.
  } else {
    const allApproved = updatedApprovers.every((a) => a.status === "approved")
    if (allApproved) {
      const template = getTemplateById(instance.templateId)
      const target =
        template?.defaults.enforcementMode === "redact" ? "redact" : "block"
      enforcementMode = target
      promoted = true
    }
  }

  const updated = upsertInstance({
    ...instance,
    enforcementMode,
    promotionHistory: history,
    updatedAt: new Date().toISOString()
  })

  return NextResponse.json({
    ok: true,
    instance: updated,
    promoted,
    rejected,
    remainingApprovers: updatedApprovers.filter((a) => a.status === "pending").map((a) => a.role)
  })
}
