"use client"

import type { ChartConfig } from "@/components/ui/chart"

import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { aiSpmMetrics, aiSpmAssets } from "@/lib/mock-data"
import { insuranceAiRiskRegister } from "@/lib/insurance-data"
import {
  Shield,
  ArrowRight,
  Brain,
  AlertTriangle,
  Info,
  TrendingDown,
  HelpCircle,
  Network,
  FileCheck,
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
                    Executive overview of AI risk exposure for leadership. Navigate to specialised dashboards for
                    detailed analysis and management actions.
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
                      trust. This dashboard provides visibility into emerging risks specific to insurance operations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4 pt-2">
                <div className="p-4 bg-card rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Critical Risks</p>
                    <UITooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Risks requiring immediate attention to prevent severe business impact.</p>
                      </TooltipContent>
                    </UITooltip>
                  </div>
                  <p className="text-3xl font-bold text-destructive">{criticalRisks}</p>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">High Priority</p>
                    <UITooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Risks to address within the current quarter.</p>
                      </TooltipContent>
                    </UITooltip>
                  </div>
                  <p className="text-3xl font-bold text-orange-600">{highRisks}</p>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Overall Risk Score</p>
                    <UITooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Aggregate risk score from 0-100. Lower is better.</p>
                      </TooltipContent>
                    </UITooltip>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">{aiSpmMetrics.overallRiskScore}</p>
                    <span className="text-sm text-muted-foreground">/100</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingDown className="h-3 w-3 text-green-600" />
                    <p className="text-xs text-green-600">Improving</p>
                  </div>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Compliance</p>
                    <UITooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>AI systems meeting GDPR, EU AI Act, and internal requirements.</p>
                      </TooltipContent>
                    </UITooltip>
                  </div>
                  <p className="text-3xl font-bold text-primary">{aiSpmMetrics.complianceScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Risk Overview</h2>
              <p className="text-sm text-muted-foreground mt-1">High-level risk status across AI systems</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Risk Summary Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                    AI Risk Categories
                  </CardTitle>
                  <CardDescription>
                    {totalRisks} risk categories identified across insurance AI operations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-destructive/10 rounded-lg">
                      <p className="text-2xl font-bold text-destructive">{criticalRisks}</p>
                      <p className="text-xs text-muted-foreground">Critical</p>
                    </div>
                    <div className="p-3 bg-orange-500/10 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{highRisks}</p>
                      <p className="text-xs text-muted-foreground">High</p>
                    </div>
                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{totalRisks - criticalRisks - highRisks}</p>
                      <p className="text-xs text-muted-foreground">Medium</p>
                    </div>
                  </div>
                  <Link href="/ai-governance">
                    <Button variant="outline" className="w-full bg-transparent">
                      View All Risk Categories
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Top 5 Risk Assets Chart */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Top 5 Risk Assets
                  </CardTitle>
                  <CardDescription>AI systems with highest combined risk scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={riskHeatmapData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomBarTooltip />} />
                        <Bar dataKey="risk" fill="hsl(201 65% 48%)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Dashboard Navigation Cards */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Dashboard Views</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Navigate to specialised dashboards for detailed analysis
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    AI Governance
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Comprehensive framework for managing AI risk, compliance, and security across the organisation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>Risk Register</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Network className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>Network Topology</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileCheck className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>Compliance</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Brain className="h-4 w-4 text-primary" />
                      <span>Asset Inventory</span>
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
                    Detailed AI model behaviour analysis for hallucination, bias, toxicity, and privacy risks.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Brain className="h-4 w-4 text-primary" />
                      <span>8 Models Assessed</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="h-4 w-4 text-primary" />
                      <span>Risk Scores</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileCheck className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>Use Cases</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>Mitigations</span>
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
        </main>
      </div>
    </TooltipProvider>
  )
}
