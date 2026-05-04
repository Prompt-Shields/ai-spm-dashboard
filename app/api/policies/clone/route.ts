// POST /api/policies/clone — server-side clone of a Template into a new
// Policy Instance, persisted in the in-memory server store.
//
// Body: {
//   templateId: string,
//   name?: string,
//   createdBy: string,
//   appliesTo?: { applicationIds?, dataClassifications?, riskTiers?, departments? }
// }
//
// All new instances start as Guideline (mode: "log") regardless of the
// template's suggested default — promotion to Strict requires the
// dedicated /promote + /approve flow.

import { NextResponse, type NextRequest } from "next/server"
import { upsertInstance } from "@/lib/policy-engine/server/store"
import { getTemplateById } from "@/lib/policy-templates/templates"
import { AUTO_DEMOTE_DEFAULTS } from "@/lib/policy-engine/promotion"
import type { PolicyInstance, PolicyTemplate } from "@/lib/policy-templates/types"

export const dynamic = "force-dynamic"

interface CloneRequest {
  templateId: string
  name?: string
  createdBy: string
  appliesTo?: {
    applicationIds?: string[]
    dataClassifications?: string[]
    riskTiers?: string[]
    departments?: string[]
  }
}

export async function POST(req: NextRequest) {
  let body: CloneRequest
  try {
    body = (await req.json()) as CloneRequest
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  if (!body.templateId) {
    return NextResponse.json({ error: "templateId_required" }, { status: 400 })
  }
  if (!body.createdBy) {
    return NextResponse.json({ error: "createdBy_required" }, { status: 400 })
  }

  const template = getTemplateById(body.templateId)
  if (!template) {
    return NextResponse.json({ error: "template_not_found" }, { status: 404 })
  }

  const id = generateInstanceId()
  const now = new Date().toISOString()

  const instance: PolicyInstance = {
    id,
    name: body.name ?? template.name,
    templateId: template.id,
    templateVersion: template.version,
    parameterValues: defaultParameterValues(template),
    enforcementMode: "log", // ALWAYS Guideline on clone
    severity: template.severity,
    appliesTo: {
      applicationIds: body.appliesTo?.applicationIds ?? [],
      dataClassifications:
        body.appliesTo?.dataClassifications ??
        template.defaults.appliesTo.dataClassifications ??
        [],
      riskTiers:
        body.appliesTo?.riskTiers ?? template.defaults.appliesTo.riskTiers ?? [],
      departments:
        body.appliesTo?.departments ?? template.defaults.appliesTo.departments ?? []
    },
    allowList: [],
    reviewers: [],
    notifications: {},
    status: "active", // Guidelines start as active in observation mode
    createdBy: body.createdBy,
    createdAt: now,
    updatedAt: now,
    activatedAt: now,
    promotionHistory: [],
    autoDemote: { ...AUTO_DEMOTE_DEFAULTS },
    rolloutStrategy: "all"
  }

  upsertInstance(instance)

  return NextResponse.json({ ok: true, instance }, { status: 201 })
}

// ─── Helpers ─────────────────────────────────────────────────────────

function generateInstanceId(): string {
  return `policy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function defaultParameterValues(template: PolicyTemplate): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (const param of template.tunableParameters) {
    values[param.key] = param.default
  }
  return values
}
