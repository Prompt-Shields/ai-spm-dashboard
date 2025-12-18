"use client"

import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Shield, Brain, Building2, DollarSign, Users, TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, PieChart, Pie } from "recharts"
import Link from "next/link"

const usageByLLM = [
  { name: "GPT-4o", requests: 145000, cost: 12400, risk: 72 },
  { name: "Claude 3", requests: 98000, cost: 8900, risk: 45 },
  { name: "Gemini Pro", requests: 67000, cost: 5200, risk: 38 },
  { name: "Llama 3", requests: 34000, cost: 1200, risk: 52 },
  { name: "Mistral", requests: 23000, cost: 890, risk: 41 },
]

const usageByDepartment = [
  { name: "Claims", users: 145, requests: 89000, cost: 7800, color: "hsl(var(--chart-1))" },
  { name: "Underwriting", users: 78, requests: 67000, cost: 5900, color: "hsl(var(--chart-2))" },
  { name: "Customer Service", users: 234, requests: 123000, cost: 4200, color: "hsl(var(--chart-3))" },
  { name: "Risk & Compliance", users: 45, requests: 34000, cost: 3100, color: "hsl(var(--chart-4))" },
  { name: "IT Operations", users: 67, requests: 45000, cost: 2800, color: "hsl(var(--chart-5))" },
]

const totalRequests = usageByLLM.reduce((acc, llm) => acc + llm.requests, 0)
const totalCost = usageByLLM.reduce((acc, llm) => acc + llm.cost, 0)
const totalUsers = usageByDepartment.reduce((acc, dept) => acc + dept.users, 0)
const avgRisk = Math.round(usageByLLM.reduce((acc, llm) => acc + llm.risk, 0) / usageByLLM.length)

export default function OverviewPage() {
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean
    payload?: Array<{ value: number; payload: { name: string; cost?: number; risk?: number } }>
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border rounded-lg shadow-lg px-3 py-2 text-sm">
          <p className="font-medium">{data.name}</p>
          <p className="text-muted-foreground">{payload[0].value.toLocaleString()} requests</p>
          {data.cost && <p className="text-muted-foreground">${data.cost.toLocaleString()}</p>}
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-6 py-8 space-y-6 max-w-[1400px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">AI Adoption Overview</h1>
            <p className="text-muted-foreground mt-1">Monitor AI usage across models, departments, risk, and cost</p>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold mt-1">{(totalRequests / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-success flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" /> +12% this month
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold mt-1">{totalUsers}</p>
                  <p className="text-xs text-muted-foreground mt-1">Across 5 departments</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Cost</p>
                  <p className="text-2xl font-bold mt-1">${(totalCost / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-warning flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" /> +8% vs budget
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Risk Score</p>
                  <p className="text-2xl font-bold mt-1">{avgRisk}/100</p>
                  <p className="text-xs text-muted-foreground mt-1">Across all LLMs</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Usage by LLM */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Usage by LLM</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageByLLM} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}K`} />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="requests" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Usage by Department */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Usage by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="h-[180px] w-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={usageByDepartment}
                        dataKey="requests"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {usageByDepartment.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${(value / 1000).toFixed(0)}K requests`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {usageByDepartment.map((dept, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                        <span>{dept.name}</span>
                      </div>
                      <span className="font-medium">{dept.users} users</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk & Cost Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">LLM Risk & Cost Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usageByLLM.map((llm, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{llm.name}</p>
                      <p className="text-xs text-muted-foreground">{(llm.requests / 1000).toFixed(0)}K requests</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Cost</p>
                      <p className="font-medium text-sm">${llm.cost.toLocaleString()}</p>
                    </div>
                    <div className="w-24">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Risk</span>
                        <span
                          className={`text-xs font-medium ${llm.risk >= 60 ? "text-destructive" : llm.risk >= 40 ? "text-warning" : "text-success"}`}
                        >
                          {llm.risk}
                        </span>
                      </div>
                      <Progress value={llm.risk} className="h-1.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/ai-governance" className="block">
            <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-medium">AI Governance</span>
                </div>
                <p className="text-sm text-muted-foreground">Risk register and compliance</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/ai-visibility" className="block">
            <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span className="font-medium">AI Visibility</span>
                </div>
                <p className="text-sm text-muted-foreground">Models, data, and vendors</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/model-risk" className="block">
            <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <span className="font-medium">Model Risk</span>
                </div>
                <p className="text-sm text-muted-foreground">Detailed model assessments</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
