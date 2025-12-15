"use client"

import type { ChartConfig } from "@/components/ui/chart"

import { AppHeader } from "@/components/app-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { aiSpmMetrics, assetManagementMetrics, aiSpmAssets } from "@/lib/mock-data"
import { insuranceAiRiskRegister } from "@/lib/storebrand-insurance-data"
import {
  Shield,
  Database,
  DollarSign,
  ArrowRight,
  Brain,
  AlertTriangle,
  Info,
  TrendingDown,
  AlertCircle,
  HelpCircle,
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import Link from "next/link"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const riskChartConfig: ChartConfig = {
  risk: {
    label: "Risk Score",
    color: "hsl(201 65% 48%)", // Teal blue for better visibility
  },
}

export default function OverviewPage() {
  // Calculate risk statistics
  const criticalRisks = insuranceAiRiskRegister.filter((r) => r.severity === "Critical").length
  const highRisks = insuranceAiRiskRegister.filter((r) => r.severity === "High").length
  const totalRisks = insuranceAiRiskRegister.length

  const riskHeatmapData = aiSpmAssets.slice(0, 5).map((asset) => ({
    name: asset.modelName.length > 12 ? asset.modelName.substring(0, 12) + "..." : asset.modelName,
    risk: asset.riskScore,
  }))

  const CustomBarTooltip = ({
    active,
    payload,
  }: { active?: boolean; payload?: Array<{ value: number; payload: { name: string } }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg px-3 py-2 text-sm">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-muted-foreground">
            Risk Score: <span className="font-bold text-foreground">{payload[0].value}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-8 py-10 space-y-10 max-w-[1600px]">
          {/* Board-Level Summary Card */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/30">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl font-bold flex items-center gap-3">
                    <Shield className="h-8 w-8 text-primary" />
                    Board-Level AI Risk Summary
                  </CardTitle>
                  <CardDescription className="text-base mt-2 max-w-3xl">
                    Executive overview of AI risk exposure for Storebrand leadership. This dashboard provides a unified
                    view of security posture, compliance status, and operational metrics across all AI systems deployed
                    in insurance operations.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  Last updated: {new Date().toLocaleDateString("en-GB")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key insight message */}
              <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-l-primary">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm mb-1">Key Insight for Leadership</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      AI risk is not a single vulnerability but a systemic exposure created by autonomy, scale, and
                      trust. Traditional security controls do not observe how AI systems reason, retrieve data, or
                      propagate instructions. Without continuous adversarial testing across the full AI stack, failures
                      will only be visible after impact. This dashboard provides visibility into these emerging risks
                      specific to Storebrand&apos;s insurance operations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Executive metrics */}
              <div className="grid gap-4 md:grid-cols-4 pt-2">
                <div className="p-4 bg-card rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Critical Risk Categories</p>
                    <UITooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          Risks that could cause severe business impact, regulatory fines, or reputational damage if not
                          addressed immediately.
                        </p>
                      </TooltipContent>
                    </UITooltip>
                  </div>
                  <p className="text-3xl font-bold text-destructive">{criticalRisks}</p>
                  <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">High Priority Risks</p>
                    <UITooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          Risks that should be addressed within the current quarter to prevent escalation to critical
                          status.
                        </p>
                      </TooltipContent>
                    </UITooltip>
                  </div>
                  <p className="text-3xl font-bold text-orange-600">{highRisks}</p>
                  <p className="text-xs text-muted-foreground mt-1">Address within quarter</p>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Overall AI Risk Score</p>
                    <UITooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          Aggregate risk score from 0-100. Lower is better. Score above 50 indicates elevated risk
                          posture.
                        </p>
                      </TooltipContent>
                    </UITooltip>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">{aiSpmMetrics.overallRiskScore}</p>
                    <span className="text-sm text-muted-foreground">/100</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingDown className="h-3 w-3 text-green-600" />
                    <p className="text-xs text-green-600">Improving from last quarter</p>
                  </div>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Compliance Score</p>
                    <UITooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Percentage of AI systems meeting GDPR, EU AI Act, and internal policy requirements.</p>
                      </TooltipContent>
                    </UITooltip>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-primary">{aiSpmMetrics.complianceScore}%</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Regulatory alignment</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Categories Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  AI Risk Categories for Insurance
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Click any category to explore detailed risk information in the AI Governance dashboard
                </p>
              </div>
              <Link href="/ai-governance">
                <Button variant="outline" size="sm">
                  View All Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {insuranceAiRiskRegister.slice(0, 6).map((risk) => (
                <Link key={risk.id} href="/ai-governance">
                  <Card
                    className={`h-full transition-all hover:shadow-md cursor-pointer border-l-4 ${
                      risk.severity === "Critical"
                        ? "border-l-destructive hover:border-destructive"
                        : risk.severity === "High"
                          ? "border-l-orange-500 hover:border-orange-500"
                          : "border-l-yellow-500 hover:border-yellow-500"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-sm leading-tight">{risk.name}</h3>
                        <Badge
                          variant={
                            risk.severity === "Critical"
                              ? "destructive"
                              : risk.severity === "High"
                                ? "warning"
                                : "secondary"
                          }
                          className="flex-shrink-0 text-xs"
                        >
                          {risk.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{risk.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Showing 6 of {totalRisks} risk categories. View AI Governance for complete risk register.
            </p>
          </section>

          {/* Operational KPIs */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Operational Metrics</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time indicators of AI system health, security, and operational efficiency
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                title="Active AI Models"
                value={assetManagementMetrics.activeAssets}
                subtitle={`of ${assetManagementMetrics.totalAssets} total deployed`}
                icon={Database}
                variant="default"
              />
              <KpiCard
                title="Shadow AI Detected"
                value={aiSpmMetrics.shadowAICount}
                subtitle="Unapproved AI usage"
                icon={AlertCircle}
                variant={aiSpmMetrics.shadowAICount > 0 ? "danger" : "success"}
              />
              <KpiCard
                title="Security Incidents YTD"
                value={aiSpmMetrics.securityIncidentsYTD}
                subtitle="Requires investigation"
                icon={AlertTriangle}
                variant={aiSpmMetrics.securityIncidentsYTD > 5 ? "danger" : "success"}
              />
              <KpiCard
                title="Monthly AI Spend"
                value={`NOK ${(assetManagementMetrics.totalCloudCostMonth / 1000).toFixed(1)}k`}
                subtitle="Cloud & compute costs"
                icon={DollarSign}
                variant="default"
              />
            </div>
          </section>

          {/* Dashboard Navigation Cards */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Dashboard Views</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Navigate to specialised dashboards for detailed analysis and management
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    AI Governance Dashboard
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Comprehensive view for CISOs and risk managers. Includes network topology, full risk register,
                    security incidents, and compliance tracking specific to Storebrand&apos;s insurance operations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="h-4 w-4 text-primary" />
                      <span>9 insurance-specific AI risk categories</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Database className="h-4 w-4 text-primary" />
                      <span>Network topology of AI systems</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>GDPR, EU AI Act, NIST compliance tracking</span>
                    </div>
                  </div>
                  <Link href="/ai-governance">
                    <Button className="w-full">
                      Open AI Governance
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Model Risk Context
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Detailed AI model behaviour analysis. Assess individual models for hallucination, bias, toxicity,
                    and privacy risks. Essential for model selection and ongoing monitoring decisions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Brain className="h-4 w-4 text-primary" />
                      <span>8 major AI models assessed</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4 text-primary" />
                      <span>Hallucination & bias risk scores</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>Approved use cases per model</span>
                    </div>
                  </div>
                  <Link href="/model-risk">
                    <Button className="w-full">
                      Open Model Risk Context
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Risk Heat Map */}
          <section>
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                      Top 5 Risk Assets
                    </CardTitle>
                    <CardDescription className="mt-1">
                      AI systems with the highest combined risk scores based on vulnerabilities, sensitive data
                      exposure, and misconfiguration count
                    </CardDescription>
                  </div>
                  <UITooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-5 w-5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Risk scores range from 0-100. Scores above 70 are critical, 40-70 are elevated, below 40 are
                        acceptable.
                      </p>
                    </TooltipContent>
                  </UITooltip>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskHeatmapData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" domain={[0, 100]} fontSize={11} />
                      <YAxis dataKey="name" type="category" fontSize={11} width={100} />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Bar dataKey="risk" fill="hsl(201 65% 48%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </TooltipProvider>
  )
}
