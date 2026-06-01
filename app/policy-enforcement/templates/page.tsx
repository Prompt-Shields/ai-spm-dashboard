// Template library — browse all 15 starter templates.
// Server component renders the catalogue; the client child handles
// search + category filtering without round-trips.

import Link from "next/link"
import {
  POLICY_TEMPLATES,
  POLICY_CATEGORIES_META
} from "@/lib/policy-templates/templates"
import { TemplateLibraryClient } from "./client"
import { getT } from "@/lib/i18n/server"

export const dynamic = "force-static"

export default async function TemplateLibraryPage() {
  const t = await getT()
  return (
    <div className="space-y-6">
      <Link
        href="/policy-enforcement"
        className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        {t('policyEnforcement.backToPolicies')}
      </Link>

      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('policyEnforcement.templates.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('policyEnforcement.templates.subtitle', { count: POLICY_TEMPLATES.length })}
          </p>
        </div>
      </div>

      <TemplateLibraryClient
        templates={POLICY_TEMPLATES}
        categoryMeta={POLICY_CATEGORIES_META}
      />
    </div>
  )
}
