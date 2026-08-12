// /adoption — reframed from "is anyone using this" to "is the usage any
// good, and is it paying off". A Head of AI doesn't report seat counts and
// token volume upward; they report quality-weighted ROI and how fast the
// wider workforce is being upskilled.
//
// The old quantity tiles (DAU/MAU, prompt/token counts, guided-tour funnel)
// have been retired from this page in favour of the usage-quality scorecard:
//   - ROI + upskilling headline (value delivered, return on spend, % upskilled)
//   - Four quality dimensions (outcome, leverage, trajectory, diffusion)
//   - The transcript→scorecard pipeline that produces them
//
// See lib/usage-quality-data.ts for the (mock) telemetry model.

import { UsageQualitySection } from "@/components/usage-quality-section"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Adoption · Atlas AI"
}

export default function AdoptionPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Adoption &amp; ROI</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Not how much AI is used — how <span className="font-medium text-slate-700">well</span>{" "}
          it&apos;s used, what that&apos;s worth, and how fast good practice is
          spreading across the workforce. Quality-weighted, so abandoned or
          reworked output never counts as value.
        </p>
      </div>

      <UsageQualitySection />
    </div>
  )
}
