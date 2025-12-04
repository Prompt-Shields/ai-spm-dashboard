"use client"

import { AppHeader } from "@/components/app-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { assetManagementMetrics, aiAssets } from "@/lib/mock-data"
import { Database, TrendingUp, DollarSign, Activity, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Pie, PieChart, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function AssetManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAsset, setSelectedAsset] = useState(aiAssets[0])

  // Filter assets based on search
  const filteredAssets = aiAssets.filter(
    (asset) =>
      asset.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.owner.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Sort by cost
  const topExpensiveModels = [...aiAssets]
    .sort((a, b) => b.cloudCostEstimateMonth - a.cloudCostEstimateMonth)
    .slice(0, 5)

  // Cost by department
  const costByDepartment = Object.entries(
    aiAssets.reduce(
      (acc, asset) => {
        acc[asset.department] = (acc[asset.department] || 0) + asset.cloudCostEstimateMonth
        return acc
      },
      {} as Record<string, number>,
    ),
  ).map(([dept, cost]) => ({ department: dept, cost: Math.round(cost) }))

  // Drift trend simulation for selected asset
  const driftTrendData = Array.from({ length: 12 }, (_, i) => ({
    week: `W${i + 1}`,
    drift: Math.max(0, selectedAsset.driftScore + (Math.random() - 0.5) * 10),
  }))

  // Latency trend simulation
  const latencyTrendData = Array.from({ length: 12 }, (_, i) => ({
    week: `W${i + 1}`,
    latency: Math.max(50, selectedAsset.averageLatencyMs + (Math.random() - 0.5) * 100),
  }))

  const statusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "success"
      case "Shadow":
        return "destructive"
      case "Testing":
        return "warning"
      case "Deprecated":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-8 py-10 space-y-10 max-w-[1600px]">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Database className="h-8 w-8 text-primary" />
            AI Asset Management
          </h1>
          <p className="text-muted-foreground">Operational and inventory visibility for platform teams.</p>
        </div>

        {/* KPI Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total AI Assets"
            value={assetManagementMetrics.totalAssets}
            subtitle={`${assetManagementMetrics.activeAssets} active`}
            icon={Database}
            variant="default"
          />
          <KpiCard
            title="Active vs Deprecated"
            value={`${assetManagementMetrics.activeAssets}:${assetManagementMetrics.deprecatedAssets}`}
            subtitle="Active to deprecated ratio"
            icon={Activity}
            variant="success"
          />
          <KpiCard
            title="Monthly Cloud Cost"
            value={`£${(assetManagementMetrics.totalCloudCostMonth / 1000).toFixed(1)}k`}
            subtitle="Total operational expenditure"
            icon={DollarSign}
            variant="default"
          />
          <KpiCard
            title="Average Drift Score"
            value={assetManagementMetrics.averageDriftScore}
            subtitle="Model performance indicator"
            icon={TrendingUp}
            variant={assetManagementMetrics.averageDriftScore > 30 ? "warning" : "success"}
          />
        </div>

        {/* Shadow AI Panel */}
        {assetManagementMetrics.shadowAIAssets.length > 0 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">Shadow AI Detected</CardTitle>
              <CardDescription>The following assets require governance attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {assetManagementMetrics.shadowAIAssets.map((asset) => (
                  <div key={asset.assetId} className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div>
                      <p className="font-medium">{asset.modelName}</p>
                      <p className="text-sm text-muted-foreground">
                        {asset.department} • Owner: {asset.owner}
                      </p>
                    </div>
                    <Badge variant="destructive">Shadow</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Asset Catalogue Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>AI Asset Catalogue</CardTitle>
                <CardDescription>Searchable inventory of all AI models</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model Name</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Monthly Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.slice(0, 10).map((asset) => (
                  <TableRow
                    key={asset.assetId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <TableCell className="font-medium">{asset.modelName}</TableCell>
                    <TableCell>{asset.version}</TableCell>
                    <TableCell>{asset.owner}</TableCell>
                    <TableCell>{asset.department}</TableCell>
                    <TableCell>
                      <Badge variant={statusColor(asset.deploymentStatus) as any}>{asset.deploymentStatus}</Badge>
                    </TableCell>
                    <TableCell>{new Date(asset.lastUpdated).toLocaleDateString("en-GB")}</TableCell>
                    <TableCell className="text-right font-medium">
                      £{asset.cloudCostEstimateMonth.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Performance and Drift Charts */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>{selectedAsset.modelName} - Drift and latency trends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Drift Score (12 weeks)</h4>
                <ChartContainer
                  config={{
                    drift: {
                      label: "Drift Score",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[150px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={driftTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" fontSize={10} />
                      <YAxis fontSize={10} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="drift" fill="var(--color-drift)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Average Latency (ms)</h4>
                <ChartContainer
                  config={{
                    latency: {
                      label: "Latency (ms)",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[150px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={latencyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" fontSize={10} />
                      <YAxis fontSize={10} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="latency" fill="var(--color-latency)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Lifecycle Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Asset Lifecycle</CardTitle>
              <CardDescription>{selectedAsset.modelName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-24 text-sm text-muted-foreground">
                      {new Date(selectedAsset.creationDate).toLocaleDateString("en-GB")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="font-medium text-sm">Created</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Initial deployment • {selectedAsset.architecture}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-24 text-sm text-muted-foreground">
                      {new Date(selectedAsset.lastUpdated).toLocaleDateString("en-GB")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-success" />
                        <span className="font-medium text-sm">Last Updated</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Version {selectedAsset.version} deployed</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <h4 className="font-semibold text-sm">Key Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Model Accuracy</p>
                      <p className="text-lg font-semibold">{selectedAsset.modelAccuracy}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Throughput</p>
                      <p className="text-lg font-semibold">{selectedAsset.throughputQps} QPS</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">GPU Hours/Month</p>
                      <p className="text-lg font-semibold">{selectedAsset.gpuHoursMonth}h</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Dataset Size</p>
                      <p className="text-lg font-semibold">{selectedAsset.datasetSizeGb} GB</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-sm mb-2">Dependencies</h4>
                  <div className="flex gap-1 flex-wrap">
                    {selectedAsset.dependencyLibraries.map((lib) => (
                      <Badge key={lib} variant="outline" className="text-xs">
                        {lib}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Operational Cost Module */}
          <Card>
            <CardHeader>
              <CardTitle>Operational Cost Breakdown</CardTitle>
              <CardDescription>Monthly cloud spend by department</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  cost: {
                    label: "Cost (£)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costByDepartment}
                      dataKey="cost"
                      nameKey="department"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.department}: £${entry.cost.toLocaleString()}`}
                    >
                      {costByDepartment.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>

              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Top 5 Most Expensive Models</h4>
                <div className="space-y-2">
                  {topExpensiveModels.map((model, i) => (
                    <div key={model.assetId} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {i + 1}. {model.modelName}
                      </span>
                      <span className="font-semibold">£{model.cloudCostEstimateMonth.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>Top models by call volume (last 30 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...aiAssets]
                  .sort((a, b) => b.callsLast30Days - a.callsLast30Days)
                  .slice(0, 8)
                  .map((asset) => (
                    <div key={asset.assetId} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{asset.modelName}</span>
                        <span className="text-muted-foreground">{asset.callsLast30Days.toLocaleString()} calls</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${(asset.callsLast30Days / Math.max(...aiAssets.map((a) => a.callsLast30Days))) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="flex gap-1">
                        {asset.topUseCases.slice(0, 2).map((useCase) => (
                          <Badge key={useCase} variant="outline" className="text-xs">
                            {useCase}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
