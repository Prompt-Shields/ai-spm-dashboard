"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { insuranceAiRiskRegister, insuranceNetworkTopology } from "@/lib/storebrand-insurance-data"
import { aiSpmAssets } from "@/lib/mock-data"
import { Shield, AlertTriangle, Network, Database, FileCheck, ChevronDown, ChevronUp } from "lucide-react"

export default function AIGovernancePage() {
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null)

  const criticalRisks = insuranceAiRiskRegister.filter((r) => r.severity === "Critical").length
  const highRisks = insuranceAiRiskRegister.filter((r) => r.severity === "High").length

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-destructive text-destructive-foreground"
      case "High":
        return "bg-orange-500 text-white"
      case "Medium":
        return "bg-yellow-500 text-black"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case "model":
        return "bg-primary/10 border-primary text-primary"
      case "database":
        return "bg-blue-500/10 border-blue-500 text-blue-600"
      case "external":
        return "bg-orange-500/10 border-orange-500 text-orange-600"
      case "api":
        return "bg-green-500/10 border-green-500 text-green-600"
      default:
        return "bg-muted border-muted-foreground text-muted-foreground"
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-8 py-8 space-y-6 max-w-[1600px]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                AI Governance
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Security posture and compliance for Storebrand AI systems
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{criticalRisks} Critical</Badge>
              <Badge variant="outline">{highRisks} High</Badge>
            </div>
          </div>

          <Tabs defaultValue="risks" className="space-y-4">
            <TabsList>
              <TabsTrigger value="risks">Risk Register</TabsTrigger>
              <TabsTrigger value="topology">Network</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="incidents">Incidents</TabsTrigger>
            </TabsList>

            <TabsContent value="risks" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                    AI Risk Register
                  </CardTitle>
                  <CardDescription>Click to expand risk details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insuranceAiRiskRegister.map((risk) => (
                      <div key={risk.id} className="border rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedRisk(expandedRisk === risk.id ? null : risk.id)}
                          className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <Badge className={getSeverityColor(risk.severity)} variant="secondary">
                              {risk.severity}
                            </Badge>
                            <span className="font-medium text-sm">{risk.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Score: {risk.likelihood * risk.impact}
                            </span>
                            {expandedRisk === risk.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </button>
                        {expandedRisk === risk.id && (
                          <div className="p-4 border-t bg-muted/30 space-y-3">
                            <p className="text-sm">{risk.description}</p>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground mb-1">Business Impact</p>
                                <p>{risk.businessImpact}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-1">Mitigation</p>
                                <p>{risk.mitigationStrategy}</p>
                              </div>
                            </div>
                            <div className="flex gap-4 text-xs text-muted-foreground pt-2">
                              <span>Owner: {risk.owner}</span>
                              <span>Review: {risk.reviewDate}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="topology" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Network className="h-5 w-5 text-primary" />
                    Network Topology
                  </CardTitle>
                  <CardDescription>AI systems, data sources, and integrations</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Summary stats */}
                  <div className="grid grid-cols-4 gap-4 mb-6 p-3 bg-muted/30 rounded-lg text-center">
                    <div>
                      <p className="text-xl font-bold text-primary">
                        {insuranceNetworkTopology.filter((n) => n.type === "model").length}
                      </p>
                      <p className="text-xs text-muted-foreground">Models</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-blue-600">
                        {insuranceNetworkTopology.filter((n) => n.type === "database").length}
                      </p>
                      <p className="text-xs text-muted-foreground">Databases</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-green-600">
                        {insuranceNetworkTopology.filter((n) => n.type === "api").length}
                      </p>
                      <p className="text-xs text-muted-foreground">APIs</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-orange-600">
                        {insuranceNetworkTopology.filter((n) => n.type === "external").length}
                      </p>
                      <p className="text-xs text-muted-foreground">External</p>
                    </div>
                  </div>

                  {/* Node grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {insuranceNetworkTopology.slice(0, 12).map((node) => (
                      <div key={node.id} className={`p-3 rounded-lg border-2 ${getNodeTypeColor(node.type)}`}>
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium text-sm">{node.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {node.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{node.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span>{node.connections?.length || 0} connections</span>
                          <span className="text-muted-foreground">{node.owner}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assets" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    AI Asset Inventory
                  </CardTitle>
                  <CardDescription>Deployed AI models</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium">Model</th>
                          <th className="text-left p-2 font-medium">Department</th>
                          <th className="text-left p-2 font-medium">Risk</th>
                          <th className="text-left p-2 font-medium">Compliance</th>
                          <th className="text-left p-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aiSpmAssets.slice(0, 8).map((asset) => (
                          <tr key={asset.id} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-medium">{asset.modelName}</td>
                            <td className="p-2 text-muted-foreground">{asset.department}</td>
                            <td className="p-2">
                              <Badge
                                variant={
                                  asset.riskScore > 70 ? "destructive" : asset.riskScore > 50 ? "default" : "secondary"
                                }
                              >
                                {asset.riskScore}
                              </Badge>
                            </td>
                            <td className="p-2">{asset.compliance}%</td>
                            <td className="p-2">
                              <Badge variant={asset.status === "Active" ? "default" : "secondary"}>
                                {asset.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    Compliance Status
                  </CardTitle>
                  <CardDescription>GDPR, EU AI Act, Norwegian regulations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">GDPR</span>
                        <Badge variant="default">94%</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Data protection compliance</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">EU AI Act</span>
                        <Badge variant="secondary">78%</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">AI regulation readiness</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Finanstilsynet</span>
                        <Badge variant="default">91%</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Norwegian FSA requirements</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="incidents" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                    Security Incidents
                  </CardTitle>
                  <CardDescription>Recent AI-related incidents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        id: 1,
                        title: "Prompt injection attempt detected",
                        severity: "Medium",
                        date: "2024-03-10",
                        status: "Resolved",
                      },
                      {
                        id: 2,
                        title: "Model drift in claims processing",
                        severity: "High",
                        date: "2024-03-08",
                        status: "Monitoring",
                      },
                      {
                        id: 3,
                        title: "Unauthorised API access blocked",
                        severity: "Low",
                        date: "2024-03-05",
                        status: "Resolved",
                      },
                    ].map((incident) => (
                      <div key={incident.id} className="p-3 border rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{incident.title}</p>
                          <p className="text-xs text-muted-foreground">{incident.date}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant={
                              incident.severity === "High"
                                ? "destructive"
                                : incident.severity === "Medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {incident.severity}
                          </Badge>
                          <Badge variant="outline">{incident.status}</Badge>
                        </div>
                      </div>
                    ))}
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
