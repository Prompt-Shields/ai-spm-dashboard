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
import { Brain, Database, FileText, Server, Building2, CheckCircle, AlertTriangle, Shield, Lock } from "lucide-react"
import { useT } from "@/lib/i18n/provider"

export default function AIVisibilityPage() {
  const t = useT()
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
      <main className="container mx-auto px-6 py-8 max-w-[1400px] space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">{t('aiVisibility.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('aiVisibility.subtitle')}
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setActiveTab("models")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.totalModels}</p>
                  <p className="text-xs text-muted-foreground">{t('aiVisibility.summary.models')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setActiveTab("data")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Database className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.totalDataSources}</p>
                  <p className="text-xs text-muted-foreground">{t('aiVisibility.summary.dataSources')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setActiveTab("prompts")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.totalPrompts}</p>
                  <p className="text-xs text-muted-foreground">{t('aiVisibility.summary.prompts')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setActiveTab("infrastructure")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Server className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.totalInfrastructure}</p>
                  <p className="text-xs text-muted-foreground">{t('aiVisibility.summary.infrastructure')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setActiveTab("vendors")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.totalVendors}</p>
                  <p className="text-xs text-muted-foreground">{t('aiVisibility.summary.vendors')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="models">{t('aiVisibility.tabs.models')}</TabsTrigger>
            <TabsTrigger value="data">{t('aiVisibility.tabs.data')}</TabsTrigger>
            <TabsTrigger value="prompts">{t('aiVisibility.tabs.prompts')}</TabsTrigger>
            <TabsTrigger value="infrastructure">{t('aiVisibility.tabs.infrastructure')}</TabsTrigger>
            <TabsTrigger value="vendors">{t('aiVisibility.tabs.vendors')}</TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="mt-4 space-y-3">
            {aiModelsInventory.map((model) => (
              <Card key={model.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{model.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {model.provider} | {model.version}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{t('aiVisibility.model.inferences', { count: model.monthlyInferences.toLocaleString() })}</span>
                          <span>{t('aiVisibility.model.p95', { value: model.latencyP95 })}</span>
                          <span>{model.costPerMonth}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getStatusBadge(model.status)}>{model.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="data" className="mt-4 space-y-3">
            {dataSourcesInventory.map((source) => (
              <Card key={source.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Database className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">{source.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {source.type} | {source.location}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{source.recordCount}</span>
                          <span>{t('aiVisibility.data.owner', { owner: source.dataOwner })}</span>
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
          </TabsContent>

          <TabsContent value="prompts" className="mt-4 space-y-3">
            {promptsInventory.map((prompt) => (
              <Card key={prompt.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">{prompt.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {prompt.model} | {prompt.category}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{prompt.description}</p>
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
          </TabsContent>

          <TabsContent value="infrastructure" className="mt-4 space-y-3">
            {infrastructureInventory.map((infra) => (
              <Card key={infra.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Server className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">{infra.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {infra.type} | {infra.provider}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{t('aiVisibility.infra.uptime', { uptime: infra.uptime })}</span>
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
          </TabsContent>

          <TabsContent value="vendors" className="mt-4 space-y-3">
            {vendorAIInventory.map((vendor) => (
              <Card key={vendor.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">{vendor.name}</h3>
                        <p className="text-sm text-muted-foreground">{vendor.service}</p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{t('aiVisibility.vendor.annualSpend', { amount: vendor.annualSpend })}</span>
                          <span>{t('aiVisibility.vendor.sla', { uptime: vendor.actualUptime })}</span>
                          <span>{t('aiVisibility.vendor.expires', { date: vendor.contractExpiry })}</span>
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
                          {t('aiVisibility.vendor.pending')}
                        </Badge>
                      )}
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
