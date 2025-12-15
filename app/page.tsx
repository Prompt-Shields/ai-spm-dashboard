"use client"

import type { ChartConfig } from "@/components/ui/chart"

import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { aiSpmMetrics, aiSpmAssets } from "@/lib/mock-data"
import { insuranceAiRiskRegister } from "@/lib/storebrand-insurance-data"
import { Shield, ArrowRight, Brain, AlertTriangle, TrendingDown, HelpCircle, Eye } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import Link from "next/link"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const riskChartConfig: ChartConfig = {
  risk: {
    label: "Risk Score",
    color: "hsl(201 65% 48%)",
  },
}

export default function OverviewPage() {
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
            Risk: <span className="font-bold text-foreground">{payload[0].value}</span>
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
        <main className="container mx-auto px-8 py-10 space-y-8 max-w-[1600px]">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/30">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <Shield className="h-7 w-7 text-primary" />
                    AI Risk Summary
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Executive overview for Storebrand leadership
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  Updated: {new Date().toLocaleDateString("en-GB")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 bg-card rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Critical</p>
                    <UITooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Immediate attention required</p>
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
                      <TooltipContent>
                        <p>Address this quarter</p>
                      </TooltipContent>
                    </UITooltip>
                  </div>
                  <p className="text-3xl font-bold text-orange-600">{highRisks}</p>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Risk Score</p>
                    <UITooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>0-100, lower is better</p>
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
                      <TooltipContent>
                        <p>GDPR, EU AI Act, internal policies</p>
                      </TooltipContent>
                    </UITooltip>
                  </div>
                  <p className="text-3xl font-bold text-primary">{aiSpmMetrics.complianceScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <section>
            <h2 className="text-lg font-semibold mb-4">Risk Overview</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                    Risk Categories
                  </CardTitle>
                  <CardDescription>{totalRisks} categories identified</CardDescription>
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
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Top 5 Risk Assets
                  </CardTitle>
                  <CardDescription>Highest combined risk scores</CardDescription>
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

          <section>
            <h2 className="text-lg font-semibold mb-4">Dashboards</h2>
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    AI Governance
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Risk register, network topology, compliance tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/ai-governance">
                    <Button className="w-full" size="sm">
                      Open
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Model Risk
                  </CardTitle>
                  <CardDescription className="text-sm">Model assessments, risk scores, use cases</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/model-risk">
                    <Button className="w-full" size="sm">
                      Open
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    AI Visibility
                  </CardTitle>
                  <CardDescription className="text-sm">Models, data, prompts, infrastructure, vendors</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/ai-visibility">
                    <Button className="w-full" size="sm">
                      Open
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
