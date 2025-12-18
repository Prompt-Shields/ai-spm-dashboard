"use client"

import type { ChartConfig } from "@/components/ui/chart"

import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { aiSpmMetrics, aiSpmAssets } from "@/lib/mock-data"
import { insuranceAiRiskRegister } from "@/lib/insurance-data"
import { Shield, ArrowRight, Brain, AlertTriangle, TrendingDown, FileCheck, Eye, Activity } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import Link from "next/link"

const riskChartConfig: ChartConfig = {
  risk: {
    label: "Risk Score",
    color: "hsl(var(--chart-1))",
  },
}

export default function OverviewPage() {
  const criticalRisks = insuranceAiRiskRegister.filter((r) => r.severity === "Critical").length
  const highRisks = insuranceAiRiskRegister.filter((r) => r.severity === "High").length
  const totalRisks = insuranceAiRiskRegister.length

  const riskHeatmapData = aiSpmAssets.slice(0, 5).map((asset) => ({
    name: asset.modelName.length > 15 ? asset.modelName.substring(0, 15) + "..." : asset.modelName,
    risk: asset.riskScore,
  }))

  const CustomBarTooltip = ({
    active,
    payload,
  }: { active?: boolean; payload?: Array<{ value: number; payload: { name: string } }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg shadow-lg px-3 py-2 text-sm">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-muted-foreground">
            Risk: <span className="font-semibold text-foreground">{payload[0].value}/100</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-6 py-8 space-y-8 max-w-[1400px]">
        <section className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">AI Risk Overview</h1>
            <p className="text-muted-foreground mt-1">Executive summary of AI risk exposure across the organisation</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Critical Risks</p>
                    <p className="text-3xl font-bold text-destructive mt-1">{criticalRisks}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                    <p className="text-3xl font-bold text-warning mt-1">{highRisks}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <p className="text-3xl font-bold">{aiSpmMetrics.overallRiskScore}</p>
                      <span className="text-sm text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-success">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-xs font-medium">-3</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Compliance</p>
                    <p className="text-3xl font-bold text-primary mt-1">{aiSpmMetrics.complianceScore}%</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileCheck className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Risk Distribution</CardTitle>
              <CardDescription>{totalRisks} categories across AI operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-destructive/10 text-center">
                  <p className="text-2xl font-bold text-destructive">{criticalRisks}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Critical</p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10 text-center">
                  <p className="text-2xl font-bold text-warning">{highRisks}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">High</p>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="text-2xl font-bold">{totalRisks - criticalRisks - highRisks}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Medium</p>
                </div>
              </div>
              <Link href="/ai-governance">
                <Button variant="outline" className="w-full bg-transparent">
                  View Risk Register
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Top Risk Assets</CardTitle>
              <CardDescription>AI systems with highest risk scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskHeatmapData} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar dataKey="risk" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Dashboards</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/ai-governance" className="block">
              <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">AI Governance</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Risk register, compliance tracking, and network topology
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="secondary" className="text-xs">
                      Risk Register
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Compliance
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Topology
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/ai-visibility" className="block">
              <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Eye className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">AI Visibility</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    End-to-end visibility across models, data, and vendors
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="secondary" className="text-xs">
                      Models
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Data
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Vendors
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/model-risk" className="block">
              <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">Model Risk</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Detailed model assessments for bias, toxicity, and privacy
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="secondary" className="text-xs">
                      8 Models
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Risk Scores
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Use Cases
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
