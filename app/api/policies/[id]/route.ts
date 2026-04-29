// GET /api/policies/[id] — fetch a single instance with its template.
// Used by the admin detail page.

import { NextResponse } from "next/server"
import { getInstanceById, ensureDemoStats } from "@/lib/policy-engine/server/store"
import { getTemplateById } from "@/lib/policy-templates/templates"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  ensureDemoStats()
  const instance = getInstanceById(id)
  if (!instance) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  const template = getTemplateById(instance.templateId)
  if (!template) {
    return NextResponse.json({ error: "template_missing" }, { status: 500 })
  }
  return NextResponse.json({ instance, template })
}
