"use client"

import { AppHeader } from "@/components/app-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { aiSpmMetrics, assetManagementMetrics, aiSpmAssets, aiAssets } from "@/lib/mock-data"
import { Shield, Database, DollarSign, Activity } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function OverviewPage() {
  // Simulated trend data
  const callsTrendData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    calls: Math.floor(Math.random() * 50000) + 150000,
  }))

  const costTrendData = Array.from({ length: 6 }, (_, i) => ({
    month: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"][i],
    cost: Math.floor(Math.random() * 10000) + 35000,
  }))

  const riskHeatmapData = aiSpmAssets.slice(0, 10).map((asset) => ({
    name: asset.modelName,
    sensitivity: asset.sensitiveDataTypes.length * 20,
    vulnerability: asset.highRiskVulnerabilities * 15 + asset.misconfigurationCount * 5,
    risk: asset.riskScore,
  }))

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-8 py-10 space-y-10 max-w-[1600px]">
        <div>
          <h1 className="text-3xl font-bold mb-2">Governance Overview</h1>
          <p className="text-muted-foreground">
            Unified view of AI security posture and operational metrics across your organisation.
          </p>
        </div>

        {/* Top-level KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Overall AI Risk Score"
            value={aiSpmMetrics.overallRiskScore}
            subtitle="Security posture indicator"
            icon={Shield}
            variant={aiSpmMetrics.overallRiskScore > 50 ? "warning" : "success"}
            trend={aiSpmMetrics.riskTrendVsLastQuarter}
          />
          <KpiCard
            title="Compliance Score"
            value={`${aiSpmMetrics.complianceScore}%`}
            subtitle="Regulatory alignment"
            icon={Activity}
            variant={aiSpmMetrics.complianceScore > 70 ? "success" : "warning"}
          />
          <KpiCard
            title="Active AI Models"
            value={assetManagementMetrics.activeAssets}
            subtitle={`of ${assetManagementMetrics.totalAssets} total`}
            icon={Database}
            variant="default"
          />
          <KpiCard
            title="Monthly Cloud Cost"
            value={`£${(assetManagementMetrics.totalCloudCostMonth / 1000).toFixed(1)}k`}
            subtitle="Operational expenditure"
            icon={DollarSign}
            variant="default"
          />
        </div>

        {/* Explanatory Section */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>About This Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                AI Security Posture Management (AI-SPM)
              </h3>
              <p className="text-sm text-muted-foreground">
                The AI-SPM view provides security and compliance-focused insights for CISOs and security teams. It
                tracks vulnerabilities, data governance, regulatory compliance (GDPR, EU AI Act, NIST AI RMF), security
                incidents, and risk scores across all AI assets.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1 flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                AI Asset Management
              </h3>
              <p className="text-sm text-muted-foreground">
                The AI Asset Management view offers operational and inventory visibility for platform teams. It monitors
                model performance, drift, costs, usage patterns, dependencies, and lifecycle status to ensure efficient
                AI operations.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Security Posture Snapshot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security Posture Snapshot
              </CardTitle>
              <CardDescription>Key security metrics from AI-SPM</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">High-risk incidents (30 days)</span>
                  <span className="font-semibold text-destructive">{aiSpmMetrics.securityIncidentsYTD}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shadow AI assets detected</span>
                  <span className="font-semibold text-warning">{aiSpmMetrics.shadowAICount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Mean Time to Resolve</span>
                  <span className="font-semibold">{aiSpmMetrics.mttrHours.toFixed(1)} hours</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Risk Heat Map (Top 10 Assets)</h4>
                <ChartContainer
                  config={{
                    risk: {
                      label: "Risk Score",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskHeatmapData.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={10} angle={-45} textAnchor="end" height={80} />
                      <YAxis fontSize={10} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="risk" fill="var(--color-risk)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Operational Snapshot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Operational Snapshot
              </CardTitle>
              <CardDescription>Key operational metrics from Asset Management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total AI models</span>
                  <span className="font-semibold">{assetManagementMetrics.totalAssets}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Average drift score</span>
                  <span className="font-semibold">{assetManagementMetrics.averageDriftScore}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Monthly GPU hours</span>
                  <span className="font-semibold">
                    {aiAssets.reduce((sum, a) => sum + a.gpuHoursMonth, 0).toLocaleString()}h
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Cloud Spend Trend (6 months)</h4>
                <ChartContainer
                  config={{
                    cost: {
                      label: "Cost (£)",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={costTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" fontSize={10} />
                      <YAxis fontSize={10} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="cost" stroke="var(--color-cost)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
