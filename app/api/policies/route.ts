// GET /api/policies — feeds the Promptly PEP (and any other on-device
// enforcement client) the bundle of active policy instances + their
// referenced templates.
//
// Wire format mirrors the Swift `ActivePoliciesResponse` in
// prompt-shields-macos-widget/PromptShields.MacOS.Widget/Managers/Policy/PolicyTypes.swift.
// A test (Swift PolicyTypesTests) pins to the exact JSON shape — keep
// these in sync.

import { NextResponse } from "next/server"
import {
  listActiveInstances,
  getReferencedTemplates
} from "@/lib/policy-engine/server/store"

export const dynamic = "force-dynamic"

export async function GET() {
  const instances = listActiveInstances()
  const templates = getReferencedTemplates(instances)

  return NextResponse.json({
    instances,
    templates,
    snapshotAt: new Date().toISOString()
  })
}
