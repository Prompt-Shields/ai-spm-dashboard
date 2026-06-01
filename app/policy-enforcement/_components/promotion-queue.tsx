import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { TFunc } from '@/lib/i18n/translate'
import type { PolicyInstance } from '@/lib/policy-templates/types'
import type { PromotionEligibility } from '@/lib/policy-templates/types'
import { PolicyActions } from './policy-actions'

export interface PromotionCandidate {
  instance: PolicyInstance
  eligibility: PromotionEligibility
}

interface Props {
  candidates: PromotionCandidate[]
  t: TFunc
}

export function PromotionQueue({ candidates, t }: Props) {
  if (candidates.length === 0) return null // hide when empty (no zero-state noise)

  return (
    <section className="bg-white border border-emerald-100 rounded-xl shadow-sm overflow-hidden">
      <header className="px-4 py-3 border-b border-emerald-100 bg-emerald-50/40 flex items-start gap-2">
        <ArrowUpRight size={16} className="text-emerald-700 mt-0.5 shrink-0" />
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-slate-900">
            {t('policyEnforcement.dashboard.promotionQueue.heading')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('policyEnforcement.dashboard.promotionQueue.subtitle')}
          </p>
        </div>
        <span className="text-xs font-mono text-emerald-700 tabular-nums">{candidates.length}</span>
      </header>
      <ul className="divide-y divide-emerald-50">
        {candidates.map(({ instance, eligibility }) => {
          const stats = instance.stats
          const fpPct = ((stats?.falsePositiveRate ?? 0) * 100).toFixed(1)
          const daysLeft = Math.max(0, eligibility.daysRequired - eligibility.daysInGuideline)
          return (
            <li key={instance.id} className="flex items-center gap-3 px-4 py-3">
              <Link
                href={`/policy-enforcement/policies/${instance.id}`}
                className="flex-1 min-w-0"
              >
                <div className="text-sm font-medium text-slate-900 truncate">{instance.name}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                  <span>
                    {t('policyEnforcement.dashboard.promotionQueue.ageLabel', {
                      days: eligibility.daysInGuideline,
                    })}
                  </span>
                  <span>
                    {t('policyEnforcement.dashboard.promotionQueue.hitsLabel', {
                      count: stats?.totalHits30d ?? 0,
                    })}
                  </span>
                  <span>
                    {t('policyEnforcement.dashboard.promotionQueue.fpRateLabel', { rate: fpPct })}
                  </span>
                  {eligibility.eligible ? (
                    <span className="text-emerald-700 font-medium">
                      {t('policyEnforcement.dashboard.promotionQueue.eligible')}
                    </span>
                  ) : (
                    <span className="text-amber-600">
                      {t('policyEnforcement.dashboard.promotionQueue.daysToGo', { days: daysLeft })}
                    </span>
                  )}
                </div>
              </Link>
              <PolicyActions id={instance.id} cls="guideline" status={instance.status} />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
