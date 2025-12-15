"use client"

import { AppHeader } from "@/components/app-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { aiSpmMetrics, aiSpmAssets, securityIncidents, aiAssets, assetManagementMetrics } from "@/lib/mock-data"
import { aiRiskRegister, networkTopology } from "@/lib/ai-risk-register"
import { Shield, AlertTriangle, Database, DollarSign, Network, TrendingDown, AlertCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

export default function AIGovernancePage() {
  const [selectedRisk, setSelectedRisk] = useState(aiRiskRegister[0])

  // Get top risk assets
  const topRiskAssets = [...aiSpmAssets].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5)

  // Get recent incidents
  const recentIncidents = [...securityIncidents]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4)

  // Sort by cost
  const topExpensiveModels = [...aiAssets]
    .sort((a, b) => b.cloudCostEstimateMonth - a.cloudCostEstimateMonth)
    .slice(0, 5)

  // Compliance breakdown
  const gdprCompliant = aiSpmAssets.filter((a) => a.gdprStatus === "Compliant").length
  const euAiActCompliant = aiSpmAssets.filter((a) => a.euAiActStatus === "Compliant").length
  const nistCompliant = aiSpmAssets.filter((a) => a.nistAiRmfStatus === "Compliant").length

  const severityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "destructive"
      case "High":
        return "destructive"
      case "Medium":
        return "warning"
      case "Low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "success"
      case "In progress":
        return "warning"
      case "Open":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const riskLevelColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-destructive"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-warning"
      case "low":
        return "bg-success"
      default:
        return "bg-muted"
    }
  }

  const nodeTypeIcon = (type: string) => {
    switch (type) {
      case "model":
        return "🤖"
      case "database":
        return "💾"
      case "api":
        return "🔌"
      case "user":
        return "👤"
      case "infrastructure":
        return "☁️"
      default:
        return "⚪"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-8 py-10 space-y-10 max-w-[1600px]">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            AI Governance Control Centre
          </h1>
          <p className="text-muted-foreground">
            Unified CISO dashboard for security posture, asset management, and risk intelligence.
          </p>
        </div>

        {/* Executive KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Overall AI Risk Score"
            value={aiSpmMetrics.overallRiskScore}
            subtitle="Lower is better"
            icon={Shield}
            variant={aiSpmMetrics.overallRiskScore > 50 ? "warning" : "success"}
            trend={aiSpmMetrics.riskTrendVsLastQuarter}
          />
          <KpiCard
            title="Total AI Assets"
            value={assetManagementMetrics.totalAssets}
            subtitle={`${aiSpmMetrics.shadowAICount} shadow AI detected`}
            icon={Database}
            variant={aiSpmMetrics.shadowAICount > 0 ? "danger" : "default"}
          />
          <KpiCard
            title="Security Incidents YTD"
            value={aiSpmMetrics.securityIncidentsYTD}
            subtitle={`${recentIncidents.filter((i) => i.status === "Open").length} open`}
            icon={AlertTriangle}
            variant={aiSpmMetrics.securityIncidentsYTD > 5 ? "danger" : "success"}
          />
          <KpiCard
            title="Monthly AI Spend"
            value={`£${(assetManagementMetrics.totalCloudCostMonth / 1000).toFixed(1)}k`}
            subtitle="Total operational cost"
            icon={DollarSign}
            variant="default"
          />
        </div>

        <Tabs defaultValue="network" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="network">Network Topology</TabsTrigger>
            <TabsTrigger value="risk-register">AI Risk Register</TabsTrigger>
            <TabsTrigger value="security">Security & Compliance</TabsTrigger>
            <TabsTrigger value="assets">Asset Intelligence</TabsTrigger>
          </TabsList>

          {/* Network Topology View */}
          <TabsContent value="network" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  AI Asset Network Topology
                </CardTitle>
                <CardDescription>
                  Visual representation of AI models, infrastructure, and data connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Network visualization (simplified grid layout) */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {networkTopology.map((node) => (
                      <div
                        key={node.id}
                        className={`p-4 border-2 rounded-lg ${
                          node.riskLevel === "critical"
                            ? "border-destructive bg-destructive/5"
                            : node.riskLevel === "high"
                              ? "border-orange-500 bg-orange-500/5"
                              : node.riskLevel === "medium"
                                ? "border-warning bg-warning/5"
                                : "border-border bg-background"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{nodeTypeIcon(node.type)}</span>
                            <div>
                              <h4 className="font-semibold text-sm">{node.label}</h4>
                              <p className="text-xs text-muted-foreground capitalize">{node.type}</p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              node.riskLevel === "critical" || node.riskLevel === "high"
                                ? "destructive"
                                : node.riskLevel === "medium"
                                  ? "warning"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {node.riskLevel}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">{node.department}</p>
                          {node.connections.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {node.connections.length} connection{node.connections.length !== 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="pt-6 border-t">
                    <h4 className="text-sm font-semibold mb-3">Risk Level Legend</h4>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-destructive" />
                        <span className="text-sm">Critical</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-orange-500" />
                        <span className="text-sm">High</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-warning" />
                        <span className="text-sm">Medium</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-success" />
                        <span className="text-sm">Low</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Risk Register View */}
          <TabsContent value="risk-register" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Risk List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Risk Categories</CardTitle>
                  <CardDescription>Select a risk to view details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {aiRiskRegister.map((risk) => (
                      <button
                        key={risk.id}
                        onClick={() => setSelectedRisk(risk)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedRisk.id === risk.id
                            ? "bg-primary/10 border-primary"
                            : "hover:bg-muted border-transparent"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-2">{risk.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">Likelihood: {risk.likelihood}</p>
                          </div>
                          <Badge variant={severityColor(risk.severity) as any} className="text-xs flex-shrink-0">
                            {risk.severity}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Risk Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{selectedRisk.name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={severityColor(selectedRisk.severity) as any}>{selectedRisk.severity}</Badge>
                        <Badge variant="outline">Likelihood: {selectedRisk.likelihood}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Risk Description
                    </h4>
                    <p className="text-sm text-muted-foreground">{selectedRisk.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Business Impact</h4>
                    <ul className="space-y-1">
                      {selectedRisk.businessImpact.map((impact, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-destructive mt-0.5">•</span>
                          <span>{impact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Detection Challenges</h4>
                    <ul className="space-y-1">
                      {selectedRisk.detectionChallenges.map((challenge, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-warning mt-0.5">•</span>
                          <span>{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Recommended Controls</h4>
                    <ul className="space-y-1">
                      {selectedRisk.recommendedControls.map((control, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-success mt-0.5">•</span>
                          <span>{control}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Board-Level Summary */}
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle>Board-Level Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  AI risk is not a single vulnerability but a systemic exposure created by autonomy, scale, and trust.
                  Traditional security controls do not observe how AI systems reason, retrieve data, or propagate
                  instructions. Without continuous adversarial testing across the full AI stack, failures will only be
                  visible after impact.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security & Compliance View */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Security Incidents */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Security Incidents</CardTitle>
                  <CardDescription>Latest incidents ordered by date</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentIncidents.map((incident) => (
                      <div key={incident.incidentId} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                        <div className="flex-shrink-0 w-20 text-sm text-muted-foreground">
                          {new Date(incident.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{incident.type}</span>
                            <Badge variant={severityColor(incident.severity) as any}>{incident.severity}</Badge>
                            <Badge variant={statusColor(incident.status) as any}>{incident.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{incident.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Asset:{" "}
                            {aiSpmAssets.find((a) => a.assetId === incident.assetId)?.modelName || incident.assetId}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Regulatory Compliance */}
              <Card>
                <CardHeader>
                  <CardTitle>Regulatory Compliance</CardTitle>
                  <CardDescription>Status across major frameworks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">GDPR Compliance</span>
                        <span className="text-sm font-semibold">
                          {gdprCompliant}/{aiSpmAssets.length}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${(gdprCompliant / aiSpmAssets.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">EU AI Act Compliance</span>
                        <span className="text-sm font-semibold">
                          {euAiActCompliant}/{aiSpmAssets.length}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${(euAiActCompliant / aiSpmAssets.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">NIST AI RMF Compliance</span>
                        <span className="text-sm font-semibold">
                          {nistCompliant}/{aiSpmAssets.length}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${(nistCompliant / aiSpmAssets.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <h4 className="font-semibold text-sm">Business Impact Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Est. Financial Risk</p>
                        <p className="text-lg font-semibold">
                          £{(aiSpmMetrics.estimatedFinancialRisk / 1000000).toFixed(2)}M
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Mean Time to Detect</p>
                        <p className="text-lg font-semibold">{aiSpmMetrics.mttdHours}h</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Mean Time to Resolve</p>
                        <p className="text-lg font-semibold">{aiSpmMetrics.mttrHours.toFixed(1)}h</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Risk Trend</p>
                        <p className="text-lg font-semibold flex items-center gap-1">
                          <TrendingDown className="h-4 w-4 text-success" />
                          Improving
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Risk Assets Table */}
            <Card>
              <CardHeader>
                <CardTitle>Top Risk Assets</CardTitle>
                <CardDescription>Assets ranked by combined risk score</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Vulnerabilities</TableHead>
                      <TableHead>Sensitive Data</TableHead>
                      <TableHead>Risk Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topRiskAssets.map((asset) => (
                      <TableRow key={asset.assetId}>
                        <TableCell className="font-medium">{asset.modelName}</TableCell>
                        <TableCell>{asset.owner}</TableCell>
                        <TableCell>{asset.department}</TableCell>
                        <TableCell>
                          <Badge variant={asset.highRiskVulnerabilities > 0 ? "destructive" : "secondary"}>
                            {asset.highRiskVulnerabilities} high
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {asset.sensitiveDataTypes.slice(0, 2).map((type) => (
                              <Badge key={type} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                            {asset.sensitiveDataTypes.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{asset.sensitiveDataTypes.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-bold ${
                              asset.riskScore > 70
                                ? "text-destructive"
                                : asset.riskScore > 40
                                  ? "text-warning"
                                  : "text-success"
                            }`}
                          >
                            {asset.riskScore}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Asset Intelligence View */}
          <TabsContent value="assets" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Asset Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Asset Overview</CardTitle>
                  <CardDescription>Distribution and status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Assets</p>
                      <p className="text-2xl font-bold">{assetManagementMetrics.totalAssets}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Active</p>
                      <p className="text-2xl font-bold text-success">{assetManagementMetrics.activeAssets}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Shadow AI</p>
                      <p className="text-2xl font-bold text-destructive">{aiSpmMetrics.shadowAICount}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Deprecated</p>
                      <p className="text-2xl font-bold text-muted-foreground">
                        {assetManagementMetrics.deprecatedAssets}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-3">Average Drift Score</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${assetManagementMetrics.averageDriftScore > 30 ? "bg-warning" : "bg-success"}`}
                            style={{ width: `${assetManagementMetrics.averageDriftScore}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-lg font-bold">{assetManagementMetrics.averageDriftScore}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Expensive Models */}
              <Card>
                <CardHeader>
                  <CardTitle>Operational Cost Breakdown</CardTitle>
                  <CardDescription>Top 5 most expensive models</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topExpensiveModels.map((model, i) => (
                      <div key={model.assetId} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">
                            {i + 1}. {model.modelName}
                          </span>
                          <span className="font-bold">£{model.cloudCostEstimateMonth.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${(model.cloudCostEstimateMonth / topExpensiveModels[0].cloudCostEstimateMonth) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            {model.department}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {model.gpuHoursMonth}h GPU/mo
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 mt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Monthly Spend</span>
                      <span className="text-xl font-bold">
                        £{(assetManagementMetrics.totalCloudCostMonth / 1000).toFixed(1)}k
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
