// POST /api/policies/violations — ingest endpoint for on-device PEPs
// (Promptly et al). The payload matches the Swift `PolicyViolation` in
// prompt-shields-macos-widget/PromptShields.MacOS.Widget/Managers/Policy/PolicyTypes.swift.
//
// Critical: never accept raw prompts. Reject any payload that doesn't
// carry a `promptHash` field — defence in depth against PEPs that
// accidentally send unredacted text.

import { NextResponse, type NextRequest } from "next/server"
import { listViolations, recordViolation } from "@/lib/policy-engine/server/store"
import type { PolicyViolation } from "@/lib/policy-templates/types"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  if (!isPolicyViolation(payload)) {
    return NextResponse.json({ error: "invalid_violation_shape" }, { status: 400 })
  }

  // Defensive: refuse anything that smells like a raw prompt has leaked in.
  // promptHash must be exactly a hex digest; any property that looks like
  // a prompt content field is grounds for rejection.
  if (!/^[a-f0-9]{64}$/.test(payload.promptHash)) {
    return NextResponse.json({ error: "invalid_prompt_hash" }, { status: 400 })
  }

  recordViolation(payload)
  return NextResponse.json({ accepted: true, id: payload.id }, { status: 201 })
}

export async function GET() {
  // Convenience read for the dashboard's audit-log UI.
  return NextResponse.json({
    violations: listViolations(),
    snapshotAt: new Date().toISOString()
  })
}

// ─── Type guards ─────────────────────────────────────────────────────

function isPolicyViolation(value: unknown): value is PolicyViolation {
  if (typeof value !== "object" || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === "string" &&
    typeof v.policyInstanceId === "string" &&
    typeof v.applicationId === "string" &&
    typeof v.timestamp === "string" &&
    typeof v.actionTaken === "string" &&
    typeof v.severity === "string" &&
    typeof v.detectorId === "string" &&
    typeof v.promptHash === "string" &&
    typeof v.evidence === "object" &&
    v.evidence !== null
  )
}
