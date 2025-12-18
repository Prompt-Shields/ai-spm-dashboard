"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { aiSpmMetrics, aiSpmAssets } from "@/lib/mock-data"
import { insuranceAiRiskRegister, insuranceNetworkTopology } from "@/lib/insurance-data"
import {
  Shield,
  AlertTriangle,
  Database,
  Network,
  FileCheck,
  Clock,
  ExternalLink,
  Server,
  Brain,
  HelpCircle,
  Info,
} from "lucide-react"

export default function AIGovernancePage() {
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null)

  // Calculate metrics
  const criticalRisks = insuranceAiRiskRegister.filter((r) => r.severity === "Critical").length
  const highRisks = insuranceAiRiskRegister.filter((r) => r.severity === "High").length
  const totalRisks = insuranceAiRiskRegister.length

  const getNodeColor = (type: string) => {
    switch (type) {
      case "model":
        return "bg-primary text-primary-foreground"
      case "database":
        return "bg-blue-600 text-white"
      case "external":
        return "bg-orange-500 text-white"
      case "internal":
        return "bg-green-600 text-white"
      case "infrastructure":
        return "bg-purple-600 text-white"
      case "api":
        return "bg-cyan-600 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "model":
        return Brain
      case "database":
        return Database
      case "external":
        return ExternalLink
      case "internal":
        return Server
      case "infrastructure":
        return Server
      case "api":
        return ExternalLink
      default:
        return Network
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-8 py-10 space-y-8 max-w-[1600px]">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                AI Governance Dashboard
              </h1>
              <p className="text-muted-foreground max-w-4xl">
                Centralised governance and security posture management for AI systems.
              </p>
            </div>

            {/* AI Governance Principles Card */}
            <Card className="border-l-4 border-l-primary bg-muted/30">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm mb-1">What is AI Governance?</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        AI Governance is the framework of policies, processes, and controls that ensure AI systems are
                        developed, deployed, and operated responsibly. This means ensuring AI systems comply with
                        regulations, EU AI Act requirements, and internal ethical standards while delivering value to
                        insurance customers.
                      </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 pt-2">
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-primary">Accountability</h4>
                        <p className="text-xs text-muted-foreground">
                          Clear ownership and responsibility for every AI system, with defined escalation paths for
                          incidents.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-primary">Transparency</h4>
                        <p className="text-xs text-muted-foreground">
                          Explainable AI decisions for customers, regulators, and internal stakeholders with audit
                          trails.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-primary">Compliance</h4>
                        <p className="text-xs text-muted-foreground">
                          Adherence to GDPR, EU AI Act, Finanstilsynet guidelines, and ESG reporting requirements.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* End AI Governance Introduction */}

          {/* Quick Stats Row */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Critical Risks</p>
                    <p className="text-2xl font-bold text-destructive">{criticalRisks}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-destructive/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">High Priority</p>
                    <p className="text-2xl font-bold text-orange-600">{highRisks}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">AI Systems</p>
                    <p className="text-2xl font-bold">
                      {insuranceNetworkTopology.filter((n) => n.type === "model").length}
                    </p>
                  </div>
                  <Brain className="h-8 w-8 text-primary/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Compliance Score</p>
                    <p className="text-2xl font-bold text-primary">{aiSpmMetrics.complianceScore}%</p>
                  </div>
                  <FileCheck className="h-8 w-8 text-primary/20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Categories Section */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Insurance AI Risk Categories
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Click any risk category to view detailed information, mitigations, and affected systems
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {insuranceAiRiskRegister.map((risk) => (
                <Card
                  key={risk.id}
                  className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${
                    selectedRisk === risk.id ? "ring-2 ring-primary" : ""
                  } ${
                    risk.severity === "Critical"
                      ? "border-l-destructive"
                      : risk.severity === "High"
                        ? "border-l-orange-500"
                        : "border-l-yellow-500"
                  }`}
                  onClick={() => setSelectedRisk(selectedRisk === risk.id ? null : risk.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm">{risk.name}</h3>
                      <Badge
                        variant={
                          risk.severity === "Critical"
                            ? "destructive"
                            : risk.severity === "High"
                              ? "warning"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {risk.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{risk.description}</p>
                    {selectedRisk === risk.id && (
                      <div className="pt-3 border-t space-y-3 animate-in fade-in duration-200">
                        <div>
                          <p className="text-xs font-medium mb-1">Business Impact</p>
                          <p className="text-xs text-muted-foreground">{risk.businessImpact}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium mb-1">Key Mitigations</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {risk.mitigations.slice(0, 2).map((m, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-primary">•</span>
                                {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Tabbed Content */}
          <Tabs defaultValue="topology" className="space-y-4">
            <TabsList>
              <TabsTrigger value="topology">Network Topology</TabsTrigger>
              <TabsTrigger value="assets">Asset Inventory</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="incidents">Incidents</TabsTrigger>
            </TabsList>

            <TabsContent value="topology" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Network className="h-5 w-5 text-primary" />
                        AI System Network Topology
                      </CardTitle>
                      <CardDescription>
                        Visual representation of AI systems, data sources, and external integrations. Click on any node
                        for details.
                      </CardDescription>
                    </div>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-5 w-5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          This topology shows how AI models connect to internal databases and external systems. Each
                          connection represents a data flow that must be secured and monitored.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {insuranceNetworkTopology.filter((n) => n.type === "model").length}
                      </p>
                      <p className="text-xs text-muted-foreground">AI Models</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {insuranceNetworkTopology.filter((n) => n.type === "database").length}
                      </p>
                      <p className="text-xs text-muted-foreground">Databases</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-500">
                        {insuranceNetworkTopology.filter((n) => n.type === "external").length}
                      </p>
                      <p className="text-xs text-muted-foreground">External Systems</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-destructive">
                        {insuranceNetworkTopology.filter((n) => n.riskLevel === "critical").length}
                      </p>
                      <p className="text-xs text-muted-foreground">Critical Risk Nodes</p>
                    </div>
                  </div>

                  <div className="flex gap-4 mb-6 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="text-xs">AI Models</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      <span className="text-xs">Databases</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-xs">External Systems</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-600"></div>
                      <span className="text-xs">Internal Services</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                      <span className="text-xs">Infrastructure</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-cyan-600"></div>
                      <span className="text-xs">APIs & Portals</span>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {insuranceNetworkTopology.map((node) => {
                      const IconComponent = getNodeIcon(node.type)
                      const nodeColor =
                        node.type === "infrastructure"
                          ? "bg-purple-600 text-white"
                          : node.type === "api"
                            ? "bg-cyan-600 text-white"
                            : getNodeColor(node.type)
                      return (
                        <Card key={node.id} className="border hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${nodeColor}`}>
                                <IconComponent className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm">{node.name}</h4>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {node.type} | {node.department}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  node.riskLevel === "critical"
                                    ? "destructive"
                                    : node.riskLevel === "high"
                                      ? "destructive"
                                      : node.riskLevel === "medium"
                                        ? "warning"
                                        : "secondary"
                                }
                                className="text-xs shrink-0"
                              >
                                {node.riskLevel}
                              </Badge>
                            </div>

                            <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{node.description}</p>

                            <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-xs">
                              {node.monthlyTransactions && (
                                <div>
                                  <span className="text-muted-foreground">Monthly Txns:</span>
                                  <span className="ml-1 font-medium">{node.monthlyTransactions.toLocaleString()}</span>
                                </div>
                              )}
                              {node.dataClassification && (
                                <div>
                                  <span className="text-muted-foreground">Data:</span>
                                  <span
                                    className={`ml-1 font-medium capitalize ${
                                      node.dataClassification === "restricted"
                                        ? "text-destructive"
                                        : node.dataClassification === "confidential"
                                          ? "text-orange-600"
                                          : ""
                                    }`}
                                  >
                                    {node.dataClassification}
                                  </span>
                                </div>
                              )}
                            </div>

                            {node.connections && node.connections.length > 0 && (
                              <div className="mt-2 pt-2 border-t">
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-medium">{node.connections.length}</span> connection(s):{" "}
                                  {node.connections
                                    .slice(0, 2)
                                    .map((c) => {
                                      const connected = insuranceNetworkTopology.find((n) => n.id === c)
                                      return connected?.name || c
                                    })
                                    .join(", ")}
                                  {node.connections.length > 2 ? "..." : ""}
                                </p>
                              </div>
                            )}

                            {node.owner && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                Owner: <span className="font-medium">{node.owner}</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI Model Inventory
                  </CardTitle>
                  <CardDescription>Complete inventory of AI models deployed across operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiSpmAssets.map((asset) => (
                      <div key={asset.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{asset.modelName}</h4>
                              <Badge variant="outline" className="text-xs">
                                {asset.modelType}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{asset.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Owner: {asset.owner}</span>
                              <span>Version: {asset.version}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Last updated: {new Date(asset.lastUpdated).toLocaleDateString("en-GB")}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-muted-foreground">Risk Score</span>
                              <span
                                className={`font-bold ${asset.riskScore >= 70 ? "text-destructive" : asset.riskScore >= 40 ? "text-orange-600" : "text-green-600"}`}
                              >
                                {asset.riskScore}
                              </span>
                            </div>
                            <Progress value={asset.riskScore} className="w-24 h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    Regulatory Compliance Status
                  </CardTitle>
                  <CardDescription>
                    Compliance tracking for GDPR, EU AI Act, and Norwegian financial regulations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">GDPR Compliance</h4>
                          <p className="text-sm text-muted-foreground">
                            Data protection and privacy requirements for AI systems
                          </p>
                        </div>
                        <Badge variant="success">94%</Badge>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">EU AI Act Readiness</h4>
                          <p className="text-sm text-muted-foreground">
                            High-risk AI system classification and requirements
                          </p>
                        </div>
                        <Badge variant="warning">78%</Badge>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">Finanstilsynet Guidelines</h4>
                          <p className="text-sm text-muted-foreground">
                            Norwegian Financial Supervisory Authority AI requirements
                          </p>
                        </div>
                        <Badge variant="success">91%</Badge>
                      </div>
                      <Progress value={91} className="h-2" />
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">NIST AI RMF</h4>
                          <p className="text-sm text-muted-foreground">AI Risk Management Framework alignment</p>
                        </div>
                        <Badge variant="warning">82%</Badge>
                      </div>
                      <Progress value={82} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="incidents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                    Security Incidents
                  </CardTitle>
                  <CardDescription>Recent AI-related security incidents requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 border-l-4 border-l-destructive rounded-lg bg-muted/30">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">Prompt Injection Attempt Detected</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Malicious prompt detected in customer service chatbot attempting to extract policy data
                          </p>
                        </div>
                        <Badge variant="destructive">Critical</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">2 hours ago • Claims Processing Bot</p>
                    </div>
                    <div className="p-4 border-l-4 border-l-orange-500 rounded-lg bg-muted/30">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">Model Drift Warning</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Underwriting model showing 15% accuracy degradation over past 30 days
                          </p>
                        </div>
                        <Badge variant="warning">High</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">1 day ago • Risk Assessment Model</p>
                    </div>
                    <div className="p-4 border-l-4 border-l-yellow-500 rounded-lg bg-muted/30">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">Unusual API Access Pattern</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Spike in API calls to fraud detection model outside normal business hours
                          </p>
                        </div>
                        <Badge variant="secondary">Medium</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">3 days ago • Fraud Detection System</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </TooltipProvider>
  )
}
