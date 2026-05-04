// Policy Enforcement landing page. Lists every PolicyInstance the org
// has cloned from a template, grouped by class (Strict / Guideline / Draft).

import Link from "next/link"
import {
  listAllInstances,
  ensureDemoStats
} from "@/lib/policy-engine/server/store"
import { getTemplateById } from "@/lib/policy-templates/templates"
import { POLICY_CATEGORIES_META } from "@/lib/policy-templates/templates"
import { classOf } from "@/lib/policy-templates/types"
import {
  checkPromotionEligibility,
  policyClassIcon,
  policyClassLabel
} from "@/lib/policy-engine/promotion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default function PolicyEnforcementListPage() {
  ensureDemoStats()
  const instances = listAllInstances()

  const strict = instances.filter((i) => classOf(i.enforcementMode) === "strict" && i.status !== "archived")
  const guideline = instances.filter((i) => classOf(i.enforcementMode) === "guideline" && i.status !== "archived")
  const totalApps = new Set(instances.flatMap((i) => i.appliesTo.applicationIds)).size
  const totalBlocks30d = strict.reduce((sum, i) => sum + (i.stats?.blockCount30d ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Policy Enforcement</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Promote Guidelines to Strict once you trust the false-positive rate.
          </p>
        </div>
        <Link
          href="/policy-enforcement/templates"
          className="px-4 py-2 rounded-md text-sm font-medium bg-foreground text-background hover:opacity-90"
        >
          + New from template
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Strictly enforced" value={strict.length} icon="🛡️" />
        <SummaryCard label="Guidelines (observing)" value={guideline.length} icon="📘" />
        <SummaryCard label="Apps under policy" value={totalApps} icon="🔗" />
      </div>

      {totalBlocks30d > 0 && (
        <div className="rounded-md border bg-green-50/50 dark:bg-green-950/10 px-4 py-3 text-sm">
          <span className="font-medium">{totalBlocks30d.toLocaleString()}</span>
          <span className="text-muted-foreground"> blocks in the last 30 days across all Strict policies.</span>
        </div>
      )}

      <Section title="🛡️ Strictly Enforced" subtitle="Live policies blocking or redacting traffic in real time.">
        {strict.length === 0 ? (
          <EmptyState message="No Strict policies yet. Promote a Guideline once it's earned its keep." />
        ) : (
          strict.map((instance) => <PolicyRow key={instance.id} instance={instance} />)
        )}
      </Section>

      <Section title="📘 Guidelines" subtitle="Policies in observation mode. Logging only — no traffic altered.">
        {guideline.length === 0 ? (
          <EmptyState message="No Guidelines yet. Clone a template to get started." />
        ) : (
          guideline.map((instance) => <PolicyRow key={instance.id} instance={instance} />)
        )}
      </Section>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────

function SummaryCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold tabular-nums">{value}</div>
        </div>
      </div>
    </Card>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="p-6 border-dashed">
      <p className="text-sm text-muted-foreground text-center">{message}</p>
    </Card>
  )
}

function PolicyRow({ instance }: { instance: ReturnType<typeof listAllInstances>[number] }) {
  const cls = classOf(instance.enforcementMode)
  const template = getTemplateById(instance.templateId)
  const categoryMeta = template ? POLICY_CATEGORIES_META[template.category] : null
  const eligibility = template ? checkPromotionEligibility(instance, template) : null

  // Find pending approval state
  const lastEvent = instance.promotionHistory.at(-1)
  const pendingApprovers =
    lastEvent?.to === "strict" && lastEvent.approvers
      ? lastEvent.approvers.filter((a) => a.status === "pending")
      : []
  const hasPendingPromotion = pendingApprovers.length > 0 && cls === "guideline"

  return (
    <Link
      href={`/policy-enforcement/policies/${instance.id}`}
      className="block group"
    >
      <Card
        className={cn(
          "p-4 transition-shadow group-hover:shadow-md",
          cls === "guideline" && "border-dashed",
          cls === "strict" && "border-2"
        )}
      >
        <div className="flex items-start gap-4">
          <div className="text-2xl shrink-0 pt-0.5">{policyClassIcon(cls)}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold">{instance.name}</h3>
              {cls === "strict" && (
                <Badge variant="success" className="font-mono text-[10px]">
                  ● LIVE
                </Badge>
              )}
              {hasPendingPromotion && (
                <Badge variant="warning" className="text-[10px]">
                  Awaiting {pendingApprovers.length} approval(s)
                </Badge>
              )}
              {categoryMeta && (
                <Badge variant="outline" className="text-[10px]">
                  {categoryMeta.label}
                </Badge>
              )}
              {template?.owaspReference && (
                <Badge variant="outline" className="font-mono text-[10px]">
                  {template.owaspReference}
                </Badge>
              )}
            </div>

            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
              <span>
                Apps:{" "}
                <span className="font-mono font-medium text-foreground">
                  {instance.appliesTo.applicationIds.length || "all"}
                </span>
              </span>
              {cls === "strict" && (
                <>
                  <span>
                    Hits/30d:{" "}
                    <span className="font-mono font-medium text-foreground">
                      {instance.stats?.totalHits30d ?? 0}
                    </span>
                  </span>
                  <span>
                    FP rate:{" "}
                    <span className="font-mono font-medium text-foreground">
                      {((instance.stats?.falsePositiveRate ?? 0) * 100).toFixed(1)}%
                    </span>
                  </span>
                </>
              )}
              {cls === "guideline" && eligibility && (
                <span
                  className={cn(
                    eligibility.eligible
                      ? "text-green-700 dark:text-green-400 font-medium"
                      : ""
                  )}
                >
                  {eligibility.eligible
                    ? "Eligible to promote"
                    : eligibility.daysInGuideline < eligibility.daysRequired
                      ? `Promote in ${eligibility.daysRequired - eligibility.daysInGuideline}d`
                      : "Not yet eligible"}
                </span>
              )}
            </div>
          </div>

          <div className="text-xs text-muted-foreground shrink-0 self-center">
            <span className="opacity-50 group-hover:opacity-100 transition-opacity">
              View →
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
