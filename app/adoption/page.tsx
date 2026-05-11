// /adoption — the dashboard's "is anyone actually using this" page.
// Surfaces two slices of Promptly's on-device telemetry:
//   - AdoptionSummarySection: DAU/MAU, top apps, risk action mix
//   - TourFunnelSection: guided-tour engagement funnel
// Future adoption-flavoured tiles (tutorials completed, templates
// invoked, ticket deflection) will land here too.

import { AdoptionSummarySection } from "@/components/adoption-summary-section"
import { TourFunnelSection } from "@/components/tour-funnel-section"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Adoption · Atlas AI"
}

export default function AdoptionPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Adoption</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Engagement signals from Promptly's on-device telemetry. Used to
          measure whether employees actually work through the guidance the
          app puts in front of them.
        </p>
      </div>

      <AdoptionSummarySection />
      <TourFunnelSection />
    </div>
  )
}
