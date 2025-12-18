"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  aiModelsInventory,
  dataSourcesInventory,
  promptsInventory,
  infrastructureInventory,
  vendorAIInventory,
  getVisibilitySummary,
} from "@/lib/ai-visibility-data"
import {
  Eye,
  Brain,
  Database,
  FileText,
  Server,
  Building2,
  CheckCircle,
  AlertTriangle,
  Shield,
  Lock,
} from "lucide-react"

export default function AIVisibilityPage() {
  const [activeTab, setActiveTab] = useState("models")
  const summary = getVisibilitySummary()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "production":
      case "healthy":
      case "active":
      case "approved":
      case "compliant":
        return "success"
      case "review-needed":
      case "under-review":
      case "evaluation":
        return "warning"
      default:
        return "secondary"
    }
  }

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case "restricted":
        return "destructive"
      case "confidential":
        return "warning"
      default:
        return "secondary"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-8 py-10 max-w-[1600px] space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Eye className="h-8 w-8 text-primary" />
            AI Visibility Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            End-to-end visibility across models, data, prompts, infrastructure, and vendors
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="cursor-pointer hover:border-primary/50" onClick={() => setActiveTab("models")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.totalModels}</p>
                  <p className="text-xs text-muted-foreground">AI Models</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50" onClick={() => setActiveTab("data")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Database className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.totalDataSources}</p>
                  <p className="text-xs text-muted-foreground">Data Sources</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50" onClick={() => setActiveTab("prompts")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.totalPrompts}</p>
                  <p className="text-xs text-muted-foreground">Prompts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50" onClick={() => setActiveTab("infrastructure")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Server className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.totalInfrastructure}</p>
                  <p className="text-xs text-muted-foreground">Infrastructure</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50" onClick={() => setActiveTab("vendors")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.totalVendors}</p>
                  <p className="text-xs text-muted-foreground">Vendors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="mt-4">
            <div className="grid gap-4">
              {aiModelsInventory.map((model) => (
                <Card key={model.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Brain className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{model.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {model.provider} | {model.version}
                          </p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{model.monthlyInferences.toLocaleString()} inferences/mo</span>
                            <span>P95: {model.latencyP95}</span>
                            <span>{model.costPerMonth}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getStatusBadge(model.status)}>{model.status}</Badge>
                        <Badge variant={getStatusBadge(model.complianceStatus)}>{model.complianceStatus}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="data" className="mt-4">
            <div className="grid gap-4">
              {dataSourcesInventory.map((source) => (
                <Card key={source.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <Database className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{source.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {source.type} | {source.location}
                          </p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{source.recordCount}</span>
                            <span>Owner: {source.dataOwner}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getClassificationBadge(source.classification)}>{source.classification}</Badge>
                        {source.gdprCompliant && (
                          <Badge variant="success">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            GDPR
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="prompts" className="mt-4">
            <div className="grid gap-4">
              {promptsInventory.map((prompt) => (
                <Card key={prompt.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <FileText className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{prompt.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {prompt.model} | {prompt.category}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{prompt.description}</p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>~{prompt.avgTokens} tokens</span>
                            <span>Review: {prompt.humanReview}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getStatusBadge(prompt.status)}>{prompt.status}</Badge>
                        <Badge
                          variant={
                            prompt.riskLevel === "high"
                              ? "destructive"
                              : prompt.riskLevel === "medium"
                                ? "warning"
                                : "secondary"
                          }
                        >
                          {prompt.riskLevel}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="infrastructure" className="mt-4">
            <div className="grid gap-4">
              {infrastructureInventory.map((infra) => (
                <Card key={infra.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <Server className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{infra.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {infra.type} | {infra.provider}
                          </p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Uptime: {infra.uptime}%</span>
                            <span>{infra.region}</span>
                            <span>{infra.costPerMonth}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="success">{infra.status}</Badge>
                        <Badge variant="outline">
                          <Lock className="h-3 w-3 mr-1" />
                          {infra.networkIsolation}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="vendors" className="mt-4">
            <div className="grid gap-4">
              {vendorAIInventory.map((vendor) => (
                <Card key={vendor.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                          <Building2 className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{vendor.name}</h3>
                          <p className="text-sm text-muted-foreground">{vendor.service}</p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{vendor.annualSpend}/year</span>
                            <span>SLA: {vendor.actualUptime}%</span>
                            <span>Expires: {vendor.contractExpiry}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getStatusBadge(vendor.contractStatus)}>{vendor.contractStatus}</Badge>
                        {vendor.aiActCompliant === true ? (
                          <Badge variant="success">
                            <Shield className="h-3 w-3 mr-1" />
                            EU AI Act
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
