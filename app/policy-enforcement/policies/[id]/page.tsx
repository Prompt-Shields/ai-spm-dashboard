// Policy detail page — server component that loads instance + template
// and renders the interactive admin client.

import Link from "next/link"
import { notFound } from "next/navigation"
import {
  getInstanceById,
  ensureDemoStats
} from "@/lib/policy-engine/server/store"
import { getTemplateById } from "@/lib/policy-templates/templates"
import { aiSpmAssets } from "@/lib/mock-data"
import { PolicyDetailClient } from "./client"
import { getT } from "@/lib/i18n/server"

export const dynamic = "force-dynamic"

export default async function PolicyDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const t = await getT()
  const { id } = await params
  ensureDemoStats()
  const instance = getInstanceById(id)
  if (!instance) return notFound()

  const template = getTemplateById(instance.templateId)
  if (!template) return notFound()

  const applications = aiSpmAssets.map((a) => ({
    id: a.assetId,
    name: a.modelName
  }))

  return (
    <div className="space-y-6">
      <Link
        href="/policy-enforcement"
        className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        {t('policyEnforcement.backToPolicies')}
      </Link>

      <PolicyDetailClient
        initialInstance={instance}
        template={template}
        applications={applications}
      />
    </div>
  )
}
