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
import { getT } from "@/lib/i18n/server"
import type { TFunc } from "@/lib/i18n/translate"

export const dynamic = "force-dynamic"

export default async function PolicyEnforcementListPage() {
  const t = await getT()
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
          <h1 className="text-2xl font-semibold tracking-tight">{t('policyEnforcement.list.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('policyEnforcement.list.subtitle')}
          </p>
        </div>
        <Link
          href="/policy-enforcement/templates"
          className="px-4 py-2 rounded-md text-sm font-medium bg-foreground text-background hover:opacity-90"
        >
          {t('policyEnforcement.list.newFromTemplate')}
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label={t('policyEnforcement.list.summary.strictlyEnforced')} value={strict.length} icon="🛡️" />
        <SummaryCard label={t('policyEnforcement.list.summary.guidelinesObserving')} value={guideline.length} icon="📘" />
        <SummaryCard label={t('policyEnforcement.list.summary.appsUnderPolicy')} value={totalApps} icon="🔗" />
      </div>

      {totalBlocks30d > 0 && (
        <div className="rounded-md border bg-green-50/50 dark:bg-green-950/10 px-4 py-3 text-sm text-muted-foreground">
          {t('policyEnforcement.list.blocksBanner', { count: totalBlocks30d.toLocaleString() })}
        </div>
      )}

      <Section title={t('policyEnforcement.list.strictSection.title')} subtitle={t('policyEnforcement.list.strictSection.subtitle')}>
        {strict.length === 0 ? (
          <EmptyState message={t('policyEnforcement.list.strictSection.empty')} />
        ) : (
          strict.map((instance) => <PolicyRow key={instance.id} instance={instance} t={t} />)
        )}
      </Section>

      <Section title={t('policyEnforcement.list.guidelineSection.title')} subtitle={t('policyEnforcement.list.guidelineSection.subtitle')}>
        {guideline.length === 0 ? (
          <EmptyState message={t('policyEnforcement.list.guidelineSection.empty')} />
        ) : (
          guideline.map((instance) => <PolicyRow key={instance.id} instance={instance} t={t} />)
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

function PolicyRow({ instance, t }: { instance: ReturnType<typeof listAllInstances>[number]; t: TFunc }) {
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
                  {t('policyEnforcement.list.row.live')}
                </Badge>
              )}
              {hasPendingPromotion && (
                <Badge variant="warning" className="text-[10px]">
                  {t('policyEnforcement.list.row.awaitingApprovals', { count: pendingApprovers.length })}
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
                {t('policyEnforcement.list.row.appsLabel')}{" "}
                <span className="font-mono font-medium text-foreground">
                  {instance.appliesTo.applicationIds.length || t('policyEnforcement.list.row.appsAll')}
                </span>
              </span>
              {cls === "strict" && (
                <>
                  <span>
                    {t('policyEnforcement.list.row.hits30dLabel')}{" "}
                    <span className="font-mono font-medium text-foreground">
                      {instance.stats?.totalHits30d ?? 0}
                    </span>
                  </span>
                  <span>
                    {t('policyEnforcement.list.row.fpRateLabel')}{" "}
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
                    ? t('policyEnforcement.list.row.eligibleToPromote')
                    : eligibility.daysInGuideline < eligibility.daysRequired
                      ? t('policyEnforcement.list.row.promoteInDays', { days: eligibility.daysRequired - eligibility.daysInGuideline })
                      : t('policyEnforcement.list.row.notYetEligible')}
                </span>
              )}
            </div>
          </div>

          <div className="text-xs text-muted-foreground shrink-0 self-center">
            <span className="opacity-50 group-hover:opacity-100 transition-opacity">
              {t('policyEnforcement.list.row.view')}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
