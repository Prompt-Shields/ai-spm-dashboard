// POST /api/policies/[id]/evaluate — runs the policy's detectors against
// a sample prompt and returns the PolicyTestResult. Used by the Test
// Console tab on the policy detail page.
//
// Crucially: evaluation is a pure simulation. The instance's
// enforcementMode is reflected in the returned `actionThatWouldFire`
// but NO state changes occur — no violations are recorded, no stats
// updated. Test mode is a dry run.

import { NextResponse, type NextRequest } from "next/server"
import { getInstanceById } from "@/lib/policy-engine/server/store"
import { evaluatePolicy } from "@/lib/policy-engine/evaluator"
import type { PolicyTestInput } from "@/lib/policy-templates/types"

export const dynamic = "force-dynamic"

interface EvaluateRequest {
  prompt: string
  expectedOutput?: string
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const instance = getInstanceById(id)
  if (!instance) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  let body: EvaluateRequest
  try {
    body = (await req.json()) as EvaluateRequest
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  if (typeof body.prompt !== "string" || body.prompt.length === 0) {
    return NextResponse.json({ error: "prompt_required" }, { status: 400 })
  }
  // Safety guard — reject huge prompts so the test console can't DoS the server
  if (body.prompt.length > 10_000) {
    return NextResponse.json({ error: "prompt_too_large" }, { status: 413 })
  }

  const input: PolicyTestInput = {
    prompt: body.prompt,
    expectedOutput: body.expectedOutput
  }

  const result = evaluatePolicy(instance, input)
  return NextResponse.json({ result, evaluatedAt: new Date().toISOString() })
}
