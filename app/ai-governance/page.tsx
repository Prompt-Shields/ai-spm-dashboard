"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { TooltipProvider } from "@/components/ui/tooltip"
import { aiSpmMetrics, aiSpmAssets } from "@/lib/mock-data"
import { insuranceAiRiskRegister, insuranceNetworkTopology } from "@/lib/storebrand-insurance-data"
import { Shield, Database, Network, FileCheck, Clock, ExternalLink, Server, Brain } from "lucide-react"

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
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              AI Governance
            </h1>
            <p className="text-muted-foreground">Security posture and compliance for Storebrand AI systems.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-destructive">{criticalRisks}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">High</p>
                <p className="text-2xl font-bold text-orange-600">{highRisks}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">AI Systems</p>
                <p className="text-2xl font-bold">
                  {insuranceNetworkTopology.filter((n) => n.type === "model").length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Compliance</p>
                <p className="text-2xl font-bold text-primary">{aiSpmMetrics.complianceScore}%</p>
              </CardContent>
            </Card>
          </div>

          <section>
            <h2 className="text-xl font-semibold mb-4">Risk Categories</h2>
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
                    <p className="text-xs text-muted-foreground line-clamp-2">{risk.description}</p>
                    {selectedRisk === risk.id && (
                      <div className="pt-3 border-t mt-3 space-y-2 animate-in fade-in duration-200">
                        <div>
                          <p className="text-xs font-medium">Impact</p>
                          <p className="text-xs text-muted-foreground">{risk.businessImpact}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium">Mitigations</p>
                          <ul className="text-xs text-muted-foreground">
                            {risk.mitigations.slice(0, 2).map((m, i) => (
                              <li key={i}>• {m}</li>
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

          <Tabs defaultValue="topology" className="space-y-4">
            <TabsList>
              <TabsTrigger value="topology">Topology</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="incidents">Incidents</TabsTrigger>
            </TabsList>

            <TabsContent value="topology" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5 text-primary" />
                    Network Topology
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {insuranceNetworkTopology.filter((n) => n.type === "model").length}
                      </p>
                      <p className="text-xs text-muted-foreground">Models</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {insuranceNetworkTopology.filter((n) => n.type === "database").length}
                      </p>
                      <p className="text-xs text-muted-foreground">Databases</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-500">
                        {insuranceNetworkTopology.filter((n) => n.type === "external").length}
                      </p>
                      <p className="text-xs text-muted-foreground">External</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-destructive">
                        {insuranceNetworkTopology.filter((n) => n.riskLevel === "critical").length}
                      </p>
                      <p className="text-xs text-muted-foreground">Critical</p>
                    </div>
                  </div>

                  <div className="flex gap-4 mb-6 flex-wrap text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span>Models</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      <span>Databases</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span>External</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-600"></div>
                      <span>Internal</span>
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
                                <p className="text-xs text-muted-foreground capitalize">{node.type}</p>
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
                            {node.connections && node.connections.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-2">
                                {node.connections.length} connections
                              </p>
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
                    AI Assets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiSpmAssets.map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-sm">{asset.modelName}</h4>
                          <p className="text-xs text-muted-foreground">{asset.useCase}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{asset.riskScore}/100</span>
                          <Badge variant={asset.complianceStatus === "Compliant" ? "success" : "warning"}>
                            {asset.complianceStatus}
                          </Badge>
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
                    Compliance Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">GDPR</h4>
                      <Progress value={92} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">92% compliant</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">EU AI Act</h4>
                      <Progress value={78} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">78% compliant</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Internal Policy</h4>
                      <Progress value={95} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">95% compliant</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="incidents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Recent Incidents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border-l-4 border-l-yellow-500 bg-muted/30 rounded-r-lg">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-sm">Model latency spike</h4>
                        <Badge variant="warning">Medium</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Resolved - 2 days ago</p>
                    </div>
                    <div className="p-3 border-l-4 border-l-green-500 bg-muted/30 rounded-r-lg">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-sm">Scheduled maintenance</h4>
                        <Badge variant="secondary">Low</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Completed - 5 days ago</p>
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
