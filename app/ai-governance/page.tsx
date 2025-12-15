"use client"

import { AppHeader } from "@/components/app-header"
import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { aiSpmMetrics, aiSpmAssets, securityIncidents, aiAssets, assetManagementMetrics } from "@/lib/mock-data"
import { insuranceAiRiskRegister, insuranceNetworkTopology } from "@/lib/storebrand-insurance-data"
import {
  Shield,
  AlertTriangle,
  Database,
  DollarSign,
  Network,
  AlertCircle,
  Info,
  HelpCircle,
  CheckCircle2,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function AIGovernancePage() {
  const [selectedRisk, setSelectedRisk] = useState(insuranceAiRiskRegister[0])

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

  // Risk statistics
  const criticalRisks = insuranceAiRiskRegister.filter((r) => r.severity === "Critical").length
  const highRisks = insuranceAiRiskRegister.filter((r) => r.severity === "High").length

  const severityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "destructive"
      case "High":
        return "warning"
      case "Medium":
        return "secondary"
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
      case "external":
        return "🌐"
      default:
        return "⚪"
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-8 py-10 space-y-10 max-w-[1600px]">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              AI Governance Control Centre
            </h1>
            <p className="text-muted-foreground max-w-3xl">
              Unified CISO dashboard for security posture, asset management, and risk intelligence. This view integrates
              all AI-related risks, compliance requirements, and operational metrics relevant to Storebrand's insurance
              operations in Norway.
            </p>
          </div>

          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/30">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <AlertCircle className="h-6 w-6 text-primary" />
                    Board-Level Summary
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Executive overview of AI risk exposure for Storebrand leadership
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  Updated: {new Date().toLocaleDateString("en-GB")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-l-primary">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong>What this means for the Board:</strong> AI risk is not a single vulnerability but a systemic
                    exposure created by autonomy, scale, and trust. Traditional security controls do not observe how AI
                    systems reason, retrieve data, or propagate instructions. The risks below are specific to insurance
                    operations including claims processing, underwriting decisions, and customer communications.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-4 pt-2">
                <div className="p-4 bg-card rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Critical Risks</p>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Risks requiring immediate board attention</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-3xl font-bold text-destructive">{criticalRisks}</p>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">High Priority</p>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Risks to address this quarter</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-3xl font-bold text-orange-600">{highRisks}</p>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">AI Systems</p>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total AI models in production</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-3xl font-bold">
                    {insuranceNetworkTopology.filter((n) => n.type === "model").length}
                  </p>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Est. Financial Risk</p>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Potential financial exposure from AI incidents</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-3xl font-bold">£{(aiSpmMetrics.estimatedFinancialRisk / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Insurance AI Risk Categories
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Click any risk category to view detailed information, business impact, and recommended controls
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {insuranceAiRiskRegister.map((risk) => (
                <Card
                  key={risk.id}
                  className={`transition-all hover:shadow-lg cursor-pointer border-l-4 ${
                    selectedRisk.id === risk.id ? "ring-2 ring-primary" : ""
                  } ${
                    risk.severity === "Critical"
                      ? "border-l-destructive"
                      : risk.severity === "High"
                        ? "border-l-orange-500"
                        : "border-l-yellow-500"
                  }`}
                  onClick={() => setSelectedRisk(risk)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm leading-tight">{risk.name}</h3>
                      <Badge variant={severityColor(risk.severity) as any} className="flex-shrink-0 text-xs">
                        {risk.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{risk.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Likelihood:</span>
                      <Badge variant="outline" className="text-xs">
                        {risk.likelihood}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Selected Risk Details */}
          <Card className="border-2">
            <CardHeader className="bg-muted/30">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{selectedRisk.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={severityColor(selectedRisk.severity) as any}>
                      {selectedRisk.severity} Severity
                    </Badge>
                    <Badge variant="outline">Likelihood: {selectedRisk.likelihood}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />
                      What is this risk?
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedRisk.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      Business Impact for Storebrand
                    </h4>
                    <ul className="space-y-1">
                      {selectedRisk.businessImpact.map((impact, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-destructive mt-0.5">•</span>
                          <span>{impact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-orange-500" />
                      Why is this hard to detect?
                    </h4>
                    <ul className="space-y-1">
                      {selectedRisk.detectionChallenges.map((challenge, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span>{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Recommended Controls
                    </h4>
                    <ul className="space-y-1">
                      {selectedRisk.recommendedControls.map((control, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>{control}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Executive KPIs */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Security & Operational Metrics</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Key performance indicators for AI security posture and operational health
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                title="Overall AI Risk Score"
                value={aiSpmMetrics.overallRiskScore}
                subtitle="Lower is better (0-100)"
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
                subtitle={`${recentIncidents.filter((i) => i.status === "Open").length} currently open`}
                icon={AlertTriangle}
                variant={aiSpmMetrics.securityIncidentsYTD > 5 ? "danger" : "success"}
              />
              <KpiCard
                title="Monthly AI Spend"
                value={`£${(assetManagementMetrics.totalCloudCostMonth / 1000).toFixed(1)}k`}
                subtitle="Cloud & compute costs"
                icon={DollarSign}
                variant="default"
              />
            </div>
          </section>

          {/* Tabbed Detail Views */}
          <Tabs defaultValue="network" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
              <TabsTrigger value="network">Network Topology</TabsTrigger>
              <TabsTrigger value="security">Security & Compliance</TabsTrigger>
              <TabsTrigger value="assets">Asset Intelligence</TabsTrigger>
            </TabsList>

            {/* Network Topology View */}
            <TabsContent value="network" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5 text-primary" />
                    AI Asset Network Topology
                  </CardTitle>
                  <CardDescription>
                    Visual representation of Storebrand's AI systems, data flows, and external integrations. Red borders
                    indicate critical risk, orange indicates high risk.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {insuranceNetworkTopology.map((node) => (
                        <div
                          key={node.id}
                          className={`p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                            node.riskLevel === "critical"
                              ? "border-destructive bg-destructive/5"
                              : node.riskLevel === "high"
                                ? "border-orange-500 bg-orange-500/5"
                                : node.riskLevel === "medium"
                                  ? "border-yellow-500 bg-yellow-500/5"
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

                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-3">Understanding the Topology</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        This view shows how AI systems connect to data sources, external APIs, and user touchpoints.
                        Understanding these connections is essential for assessing data flow risks and compliance
                        requirements.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-destructive" />
                          <span className="text-sm">Critical Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-orange-500" />
                          <span className="text-sm">High Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-yellow-500" />
                          <span className="text-sm">Medium Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-green-500" />
                          <span className="text-sm">Low Risk</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security & Compliance View */}
            <TabsContent value="security" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Security Incidents</CardTitle>
                    <CardDescription>
                      Latest incidents requiring attention. Click through to incident management for full details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentIncidents.map((incident) => (
                        <div key={incident.incidentId} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                          <div className="flex-shrink-0 w-16 text-sm text-muted-foreground">
                            {new Date(incident.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{incident.type}</span>
                              <Badge variant={severityColor(incident.severity) as any} className="text-xs">
                                {incident.severity}
                              </Badge>
                              <Badge variant={statusColor(incident.status) as any} className="text-xs">
                                {incident.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{incident.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Regulatory Compliance</CardTitle>
                    <CardDescription>
                      Compliance status across frameworks relevant to Norwegian insurance operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">GDPR Compliance</span>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>EU General Data Protection Regulation</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <span className="text-sm font-semibold">
                            {gdprCompliant}/{aiSpmAssets.length}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${(gdprCompliant / aiSpmAssets.length) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">EU AI Act Compliance</span>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>EU Artificial Intelligence Act requirements</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <span className="text-sm font-semibold">
                            {euAiActCompliant}/{aiSpmAssets.length}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${(euAiActCompliant / aiSpmAssets.length) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">NIST AI RMF</span>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>NIST AI Risk Management Framework</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <span className="text-sm font-semibold">
                            {nistCompliant}/{aiSpmAssets.length}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${(nistCompliant / aiSpmAssets.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold text-sm mb-3">Response Metrics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Mean Time to Detect</p>
                          <p className="text-lg font-semibold">{aiSpmMetrics.mttdHours}h</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Mean Time to Resolve</p>
                          <p className="text-lg font-semibold">{aiSpmMetrics.mttrHours.toFixed(1)}h</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Top Risk Assets</CardTitle>
                  <CardDescription>
                    AI systems ranked by combined risk score. Higher scores indicate greater exposure.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Model Name</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Vulnerabilities</TableHead>
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
                            <span
                              className={`font-bold ${asset.riskScore > 70 ? "text-destructive" : asset.riskScore > 40 ? "text-orange-600" : "text-green-600"}`}
                            >
                              {asset.riskScore}/100
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
                <Card>
                  <CardHeader>
                    <CardTitle>Asset Overview</CardTitle>
                    <CardDescription>
                      Summary of all AI assets deployed across Storebrand insurance operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Total Assets</p>
                          <p className="text-2xl font-bold">{assetManagementMetrics.totalAssets}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Active</p>
                          <p className="text-2xl font-bold text-green-600">{assetManagementMetrics.activeAssets}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Shadow AI</p>
                          <p className="text-2xl font-bold text-destructive">{aiSpmMetrics.shadowAICount}</p>
                          <p className="text-xs text-muted-foreground mt-1">Unapproved usage</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Deprecated</p>
                          <p className="text-2xl font-bold text-muted-foreground">
                            {assetManagementMetrics.deprecatedAssets}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold">Average Drift Score</h4>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Measures how much model behaviour has changed from baseline. Higher scores indicate
                                  potential retraining needed.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <span className="text-lg font-bold">{assetManagementMetrics.averageDriftScore}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${assetManagementMetrics.averageDriftScore > 30 ? "bg-orange-500" : "bg-green-500"}`}
                            style={{ width: `${assetManagementMetrics.averageDriftScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Operational Cost Breakdown</CardTitle>
                    <CardDescription>Top 5 most expensive AI systems by monthly cloud spend</CardDescription>
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
    </TooltipProvider>
  )
}
