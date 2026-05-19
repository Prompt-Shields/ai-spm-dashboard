// Template library — browse all 15 starter templates.
// Server component renders the catalogue; the client child handles
// search + category filtering without round-trips.

import Link from "next/link"
import {
  POLICY_TEMPLATES,
  POLICY_CATEGORIES_META
} from "@/lib/policy-templates/templates"
import { TemplateLibraryClient } from "./client"

export const dynamic = "force-static"

export default function TemplateLibraryPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/policy-enforcement"
        className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        ← All policies
      </Link>

      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Template library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {POLICY_TEMPLATES.length} starter policies covering OWASP LLM Top 10,
            EU AI Act, GDPR, industry regulations, shadow AI, and content safety.
            Clone to start observing — admins decide when to promote to Strict.
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
