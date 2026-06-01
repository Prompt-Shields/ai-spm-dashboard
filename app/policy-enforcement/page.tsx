// Policy Enforcement dashboard. Five sections, top-to-bottom:
//   1. Header (title + "New from template")
//   2. KPI strip (Strict · Loose · Coverage · Blocks 30d · Promotions ready)
//   3. Violations panel (30-day stacked chart + top policies + top apps + recent events)
//   4. Promotion queue (Loose policies eligible — or close to it — for promotion)
//   5. Two-pane policy controls (Strict | Loose) with inline action controls

import Link from 'next/link'
import {
  listAllInstances,
  ensureDemoStats,
  getDashboardSnapshot,
} from '@/lib/policy-engine/server/store'
import { getTemplateById } from '@/lib/policy-templates/templates'
import { classOf } from '@/lib/policy-templates/types'
import { checkPromotionEligibility } from '@/lib/policy-engine/promotion'
import { getT } from '@/lib/i18n/server'
import { KpiStrip } from './_components/kpi-strip'
import { ViolationsPanel } from './_components/violations-panel'
import { PromotionQueue, type PromotionCandidate } from './_components/promotion-queue'
import { PolicyPane } from './_components/policy-pane'

export const dynamic = 'force-dynamic'

export default async function PolicyEnforcementDashboardPage() {
  const t = await getT()
  ensureDemoStats()
  const all = listAllInstances()
  const active = all.filter((i) => i.status !== 'archived')

  const strict = active.filter((i) => classOf(i.enforcementMode) === 'strict')
  const guideline = active.filter((i) => classOf(i.enforcementMode) === 'guideline')

  // Promotion candidates: Guideline policies where eligibility says eligible,
  // OR they're within 7 days of eligibility (so the queue surfaces what's coming).
  const candidates: PromotionCandidate[] = []
  for (const instance of guideline) {
    if (instance.status !== 'active') continue
    const template = getTemplateById(instance.templateId)
    if (!template) continue
    const eligibility = checkPromotionEligibility(instance, template)
    const nearlyEligible =
      !eligibility.eligible &&
      eligibility.daysRequired - eligibility.daysInGuideline <= 7 &&
      eligibility.daysInGuideline > 0
    if (eligibility.eligible || nearlyEligible) candidates.push({ instance, eligibility })
  }
  candidates.sort((a, b) => b.eligibility.daysInGuideline - a.eligibility.daysInGuideline)

  const snapshot = getDashboardSnapshot()
  const promotionsReady = candidates.filter((c) => c.eligibility.eligible).length

  return (
    <div className="space-y-5">
      {/* 1. Header */}
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {t('policyEnforcement.list.title')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t('policyEnforcement.list.subtitle')}</p>
        </div>
        <Link
          href="/policy-enforcement/templates"
          className="px-4 py-2 rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-700 transition-colors"
        >
          {t('policyEnforcement.list.newFromTemplate')}
        </Link>
      </div>

      {/* 2. KPI strip */}
      <KpiStrip snapshot={snapshot} promotionsReady={promotionsReady} t={t} />

      {/* 3. Violations panel */}
      <ViolationsPanel t={t} />

      {/* 4. Promotion queue (hidden when empty) */}
      <PromotionQueue candidates={candidates} t={t} />

      {/* 5. Two-pane policy controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PolicyPane variant="strict" instances={strict} t={t} />
        <PolicyPane variant="guideline" instances={guideline} t={t} />
      </div>
    </div>
  )
}
