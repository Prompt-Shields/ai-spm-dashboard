// /adoption — the dashboard's "is anyone actually using this" page.
// Currently hosts only the guided-tour engagement section; future
// adoption-flavoured tiles (DAU/MAU, tutorials completed, templates
// invoked, ticket deflection) will land here too.

import { TourFunnelSection } from "@/components/tour-funnel-section"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Adoption · Atlas AI"
}

export default function AdoptionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Adoption</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Engagement signals from Promptly's on-device telemetry. Used to
          measure whether employees actually work through the guidance the
          app puts in front of them.
        </p>
      </div>

      <TourFunnelSection />
    </div>
  )
}
