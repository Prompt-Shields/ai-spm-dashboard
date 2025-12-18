"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { aiSpmMetrics, aiSpmAssets } from "@/lib/mock-data"
import { insuranceAiRiskRegister, insuranceNetworkTopology } from "@/lib/insurance-data"
import {
  AlertTriangle,
  Brain,
  Clock,
  FileCheck,
  Network,
  Database,
  Server,
  Globe,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

export default function AIGovernancePage() {
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null)

  const criticalRisks = insuranceAiRiskRegister.filter((r) => r.severity === "Critical").length
  const highRisks = insuranceAiRiskRegister.filter((r) => r.severity === "High").length

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "model":
        return Brain
      case "database":
        return Database
      case "external":
        return Globe
      case "infrastructure":
        return Server
      default:
        return Network
    }
  }

  const getNodeColor = (type: string) => {
    switch (type) {
      case "model":
        return "bg-primary text-white"
      case "database":
        return "bg-blue-500 text-white"
      case "external":
        return "bg-orange-500 text-white"
      case "infrastructure":
        return "bg-purple-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "destructive"
      case "High":
        return "destructive"
      case "Medium":
        return "warning"
      default:
        return "secondary"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-6 py-8 space-y-8 max-w-[1400px]">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">AI Governance</h1>
          <p className="text-muted-foreground mt-1">Risk management, compliance, and network topology</p>
        </div>

        {/* Stats Row */}
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
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">AI Systems</p>
                  <p className="text-3xl font-bold mt-1">
                    {insuranceNetworkTopology.filter((n) => n.type === "model").length}
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

        {/* Tabbed Content */}
        <Tabs defaultValue="risks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="risks">Risk Register</TabsTrigger>
            <TabsTrigger value="topology">Network Topology</TabsTrigger>
            <TabsTrigger value="inventory">AI Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="risks" className="space-y-4">
            <div className="space-y-3">
              {insuranceAiRiskRegister.map((risk) => (
                <Card
                  key={risk.id}
                  className="cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => setExpandedRisk(expandedRisk === risk.id ? null : risk.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {expandedRisk === risk.id ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{risk.category}</h4>
                          <p className="text-sm text-muted-foreground mt-0.5">{risk.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityBadge(risk.severity)}>{risk.severity}</Badge>
                        <span className="text-sm font-medium">{risk.inherentRisk}</span>
                      </div>
                    </div>

                    {expandedRisk === risk.id && (
                      <div className="mt-4 pt-4 border-t grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Impact</p>
                          <p className="text-sm text-muted-foreground">{risk.businessImpact}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Mitigation</p>
                          <p className="text-sm text-muted-foreground">{risk.mitigationStrategy}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Owner</p>
                          <p className="text-sm text-muted-foreground">{risk.owner}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Residual Risk</p>
                          <p className="text-sm font-bold">{risk.residualRisk}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="topology" className="space-y-4">
            {/* Legend */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-sm">AI Models</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm">Databases</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm">External</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm">Infrastructure</span>
              </div>
            </div>

            {/* Nodes Grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {insuranceNetworkTopology.map((node) => {
                const IconComponent = getNodeIcon(node.type)
                return (
                  <Card key={node.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getNodeColor(node.type)}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{node.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">{node.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant={
                                node.riskLevel === "critical"
                                  ? "destructive"
                                  : node.riskLevel === "high"
                                    ? "warning"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {node.riskLevel}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{node.dataClassification}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-3">
            {aiSpmAssets.map((asset) => (
              <Card key={asset.id}>
                <CardContent className="p-4">
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
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(asset.lastUpdated).toLocaleDateString("en-GB")}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground">Risk</span>
                        <span
                          className={`font-bold ${asset.riskScore >= 70 ? "text-destructive" : asset.riskScore >= 40 ? "text-warning" : "text-success"}`}
                        >
                          {asset.riskScore}
                        </span>
                      </div>
                      <Progress value={asset.riskScore} className="w-20 h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
