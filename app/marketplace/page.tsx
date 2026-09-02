// /marketplace — internal skill sharing.
//
// The /adoption Skills tab answers "what is the state of our skill library?"
// for the AI programme lead. This page is the library itself: the place an
// employee finds a skill a colleague built, and the place security decides
// whether it can be shared at all.
//
// Skills come from lib/marketplace/data.ts, which is also what /adoption
// projects its library from — one catalogue, two views.

import { MarketplaceSection } from "@/components/marketplace/marketplace-section"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Skill Marketplace · Atlas AI",
}

export default function MarketplacePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Skill Marketplace</h1>
        <p className="text-sm text-slate-500 mt-0.5 max-w-3xl">
          What colleagues have built, what it saves, and whether it&apos;s safe to share.
          Every skill carries the{' '}
          <span className="font-medium text-slate-700">scan it was approved against</span>, so
          reuse doesn&apos;t mean quietly inheriting someone else&apos;s risk.
        </p>
      </div>

      <MarketplaceSection />
    </div>
  )
}
