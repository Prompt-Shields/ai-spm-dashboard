"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { modelRiskProfiles } from "@/lib/model-risk-data"
import { sampleAppsData, publicAppsData, modelPricing } from "@/lib/model-risk-page-data"
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  ExternalLink,
  Building2,
  DollarSign,
  Globe,
  Info,
} from "lucide-react"

export default function ModelRiskContextPage() {
  const [selectedModelId, setSelectedModelId] = useState<string>(modelRiskProfiles[0].modelId)
  const selectedModel = modelRiskProfiles.find((m) => m.modelId === selectedModelId) || modelRiskProfiles[0]

  const getRiskBadgeVariant = (score: number) => {
    if (score >= 80) return "destructive"
    if (score >= 65) return "destructive"
    if (score >= 40) return "warning"
    return "success"
  }

  const getRiskBarColor = (score: number) => {
    if (score >= 80) return "bg-red-500"
    if (score >= 65) return "bg-orange-500"
    if (score >= 40) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getRiskLabel = (score: number) => {
    if (score >= 80) return "Critical"
    if (score >= 65) return "High"
    if (score >= 40) return "Medium"
    return "Low"
  }

  const overallRisk = Math.round(
    (selectedModel.hallucinationRisk +
      selectedModel.biasRisk +
      selectedModel.toxicityRisk +
      selectedModel.privacyRisk) /
      4,
  )

  const internalApps = sampleAppsData[selectedModelId] || []
  const externalApps = publicAppsData[selectedModelId] || []
  const pricing = modelPricing[selectedModelId]

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-8 py-10 max-w-[1600px] space-y-8">
        {/* Header with Model Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              Model Risk Context
            </h1>
            <p className="text-muted-foreground mt-1">Assess AI model behaviour, risks, and approved use cases</p>
          </div>
          <Select value={selectedModelId} onValueChange={setSelectedModelId}>
            <SelectTrigger className="w-[280px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modelRiskProfiles.map((model) => (
                <SelectItem key={model.modelId} value={model.modelId}>
                  {model.name} ({model.provider})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Overall Risk Score Card */}
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Overall Score */}
              <div className="flex items-center gap-6">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold ${getRiskBarColor(overallRisk)}`}
                >
                  {overallRisk}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedModel.name}</h2>
                  <p className="text-muted-foreground">{selectedModel.provider}</p>
                  <Badge variant={getRiskBadgeVariant(overallRisk)} className="mt-2">
                    {getRiskLabel(overallRisk)} Risk
                  </Badge>
                </div>
              </div>

              {/* Risk Dimensions */}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Hallucination", score: selectedModel.hallucinationRisk },
                  { label: "Bias", score: selectedModel.biasRisk },
                  { label: "Toxicity", score: selectedModel.toxicityRisk },
                  { label: "Privacy", score: selectedModel.privacyRisk },
                ].map((dim) => (
                  <div key={dim.label} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{dim.label}</span>
                      <span className="text-sm font-bold">{dim.score}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${getRiskBarColor(dim.score)}`} style={{ width: `${dim.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approved Use Cases - Prominent */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Approved Use Cases
            </CardTitle>
            <CardDescription>Authorised applications for this model</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(selectedModel.approvedUseCases || []).map((useCase, i) => (
                <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {useCase}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Model Details</TabsTrigger>
            <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
            <TabsTrigger value="apps">Sample Apps</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="mitigations">Mitigations</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Model Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Model Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provider</span>
                    <span className="font-medium">{selectedModel.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version</span>
                    <span className="font-medium">{selectedModel.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{selectedModel.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Parameters</span>
                    <span className="font-medium">{selectedModel.parameters}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Evaluated</span>
                    <span className="font-medium">{selectedModel.lastEvaluated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={selectedModel.status === "Production" ? "success" : "secondary"}>
                      {selectedModel.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Strengths & Weaknesses */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Strengths & Weaknesses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-2">Strengths</p>
                    <ul className="space-y-1">
                      {(selectedModel.strengths || []).slice(0, 3).map((s, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-2">Weaknesses</p>
                    <ul className="space-y-1">
                      {(selectedModel.weaknesses || []).slice(0, 3).map((w, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  label: "Hallucination Risk",
                  score: selectedModel.hallucinationRisk,
                  desc: "Tendency to generate false information",
                },
                { label: "Bias Risk", score: selectedModel.biasRisk, desc: "Potential for unfair outcomes" },
                { label: "Toxicity Risk", score: selectedModel.toxicityRisk, desc: "Harmful content generation" },
                { label: "Privacy Risk", score: selectedModel.privacyRisk, desc: "Data exposure concerns" },
              ].map((risk) => (
                <Card key={risk.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{risk.label}</h4>
                        <p className="text-xs text-muted-foreground">{risk.desc}</p>
                      </div>
                      <Badge variant={getRiskBadgeVariant(risk.score)}>{risk.score}/100</Badge>
                    </div>
                    <Progress value={risk.score} className="h-2" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Risk Alerts */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(selectedModel.riskAlerts || []).slice(0, 3).map((alert, i) => (
                  <div key={i} className="p-3 bg-muted/50 rounded-lg border-l-4 border-l-orange-500">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                      </div>
                      <Badge variant={alert.severity === "High" ? "destructive" : "warning"} className="text-xs">
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="apps" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Internal Apps */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Internal Applications
                  </CardTitle>
                  <CardDescription>Internal systems using this model</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {internalApps.length > 0 ? (
                    internalApps.map((app, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{app.name}</h4>
                            <p className="text-xs text-muted-foreground">{app.description}</p>
                          </div>
                          <Badge variant={app.status === "Active" ? "success" : "secondary"} className="text-xs">
                            {app.status}
                          </Badge>
                        </div>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{app.department}</span>
                          <span>{app.monthlyQueries.toLocaleString()} queries/mo</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No internal applications registered</p>
                  )}
                </CardContent>
              </Card>

              {/* Public Apps */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Public Applications
                  </CardTitle>
                  <CardDescription>Known external apps using this model</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {externalApps.length > 0 ? (
                    externalApps.map((app, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{app.name}</h4>
                            <p className="text-xs text-muted-foreground">{app.description}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {app.users} users
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>{app.category}</span>
                          <a
                            href={`https://${app.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            {app.website}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No public applications registered</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pricing">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Pricing Information
                </CardTitle>
                <CardDescription>Cost structure for {selectedModel.name}</CardDescription>
              </CardHeader>
              <CardContent>
                {pricing ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Input Cost</p>
                        <p className="text-lg font-bold">{pricing.inputCost}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Output Cost</p>
                        <p className="text-lg font-bold">{pricing.outputCost}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Context Window</p>
                        <p className="text-lg font-bold">{pricing.contextWindow}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Est. Monthly</p>
                        <p className="text-lg font-bold text-primary">{pricing.monthlyEstimate}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Pricing Notes</p>
                          <p className="text-sm text-blue-700">{pricing.notes}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Pricing information not available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mitigations">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Risk Mitigations
                </CardTitle>
                <CardDescription>Controls in place for {selectedModel.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {(selectedModel.mitigations || []).map((mitigation, i) => (
                    <div key={i} className="p-3 border rounded-lg flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                      <span className="text-sm">{mitigation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
