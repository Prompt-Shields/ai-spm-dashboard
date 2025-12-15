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
import { Eye, Brain, Database, FileText, Server, Building2 } from "lucide-react"

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
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Eye className="h-8 w-8 text-primary" />
            AI Visibility
          </h1>
          <p className="text-muted-foreground mt-1">Models, data, prompts, infrastructure, and vendors</p>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <Card className="cursor-pointer hover:border-primary/50" onClick={() => setActiveTab("models")}>
            <CardContent className="p-4 flex items-center gap-3">
              <Brain className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{summary.totalModels}</p>
                <p className="text-xs text-muted-foreground">Models</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50" onClick={() => setActiveTab("data")}>
            <CardContent className="p-4 flex items-center gap-3">
              <Database className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{summary.totalDataSources}</p>
                <p className="text-xs text-muted-foreground">Data</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50" onClick={() => setActiveTab("prompts")}>
            <CardContent className="p-4 flex items-center gap-3">
              <FileText className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{summary.totalPrompts}</p>
                <p className="text-xs text-muted-foreground">Prompts</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50" onClick={() => setActiveTab("infrastructure")}>
            <CardContent className="p-4 flex items-center gap-3">
              <Server className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{summary.totalInfrastructure}</p>
                <p className="text-xs text-muted-foreground">Infra</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50" onClick={() => setActiveTab("vendors")}>
            <CardContent className="p-4 flex items-center gap-3">
              <Building2 className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{summary.totalVendors}</p>
                <p className="text-xs text-muted-foreground">Vendors</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content - simplified labels */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            <TabsTrigger value="infrastructure">Infra</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="mt-4">
            <div className="grid gap-3">
              {aiModelsInventory.map((model) => (
                <Card key={model.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Brain className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-medium">{model.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {model.provider} | {model.monthlyInferences.toLocaleString()}/mo | {model.costPerMonth}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getStatusBadge(model.status)}>{model.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="data" className="mt-4">
            <div className="grid gap-3">
              {dataSourcesInventory.map((source) => (
                <Card key={source.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Database className="h-5 w-5 text-blue-500" />
                        <div>
                          <h3 className="font-medium">{source.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {source.type} | {source.recordCount} | {source.dataOwner}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getClassificationBadge(source.classification)}>{source.classification}</Badge>
                        {source.gdprCompliant && <Badge variant="success">GDPR</Badge>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="prompts" className="mt-4">
            <div className="grid gap-3">
              {promptsInventory.map((prompt) => (
                <Card key={prompt.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-purple-500" />
                        <div>
                          <h3 className="font-medium">{prompt.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {prompt.model} | {prompt.category} | ~{prompt.avgTokens} tokens
                          </p>
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
            <div className="grid gap-3">
              {infrastructureInventory.map((infra) => (
                <Card key={infra.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Server className="h-5 w-5 text-green-500" />
                        <div>
                          <h3 className="font-medium">{infra.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {infra.provider} | {infra.region} | {infra.uptime}% uptime | {infra.costPerMonth}
                          </p>
                        </div>
                      </div>
                      <Badge variant="success">{infra.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="vendors" className="mt-4">
            <div className="grid gap-3">
              {vendorAIInventory.map((vendor) => (
                <Card key={vendor.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-orange-500" />
                        <div>
                          <h3 className="font-medium">{vendor.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {vendor.service} | {vendor.annualSpend}/yr | Expires: {vendor.contractExpiry}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getStatusBadge(vendor.contractStatus)}>{vendor.contractStatus}</Badge>
                        {vendor.aiActCompliant === true ? (
                          <Badge variant="success">EU AI Act</Badge>
                        ) : (
                          <Badge variant="warning">Pending</Badge>
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
