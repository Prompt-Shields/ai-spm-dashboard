import { DashboardHeader } from "@/components/dashboard-header"
import { ExecutiveOverview } from "@/components/executive-overview"
import { AIUsageVisibility } from "@/components/ai-usage-visibility"
import { RiskCompliance } from "@/components/risk-compliance"
import { ShadowAIInventory } from "@/components/shadow-ai-inventory"
import { PolicyCompliance } from "@/components/policy-compliance"
import { AIAdoptionInsights } from "@/components/ai-adoption-insights"
import { AlertsNotifications } from "@/components/alerts-notifications"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader />

      <main className="container mx-auto px-8 py-10 space-y-10 max-w-[1600px]">
        <ExecutiveOverview />

        <div className="grid gap-6 lg:grid-cols-2">
          <AIUsageVisibility />
          <RiskCompliance />
        </div>

        <ShadowAIInventory />

        <div className="grid gap-6 lg:grid-cols-2">
          <PolicyCompliance />
          <AIAdoptionInsights />
        </div>

        <AlertsNotifications />
      </main>
    </div>
  )
}
