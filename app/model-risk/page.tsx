"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { modelRiskProfiles } from "@/lib/model-risk-data"
import { sampleAppsData, publicAppsData, modelPricing } from "@/lib/model-risk-page-data"
import { Brain, AlertTriangle, CheckCircle, XCircle, Shield, Building2, DollarSign, Globe } from "lucide-react"

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              Model Risk
            </h1>
            <p className="text-muted-foreground mt-1">Model behaviour and risk assessment</p>
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

        <Card className="border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
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
                    {getRiskLabel(overallRisk)}
                  </Badge>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Hallucination", score: selectedModel.hallucinationRisk },
                  { label: "Bias", score: selectedModel.biasRisk },
                  { label: "Toxicity", score: selectedModel.toxicityRisk },
                  { label: "Privacy", score: selectedModel.privacyRisk },
                ].map((dim) => (
                  <div key={dim.label} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">{dim.label}</span>
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Approved Use Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(selectedModel.approvedUseCases || []).map((useCase, i) => (
                <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {useCase}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="risk">Risk</TabsTrigger>
            <TabsTrigger value="apps">Apps</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="mitigations">Mitigations</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Information</CardTitle>
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
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={selectedModel.status === "Production" ? "success" : "secondary"}>
                      {selectedModel.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

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
                { label: "Hallucination", score: selectedModel.hallucinationRisk },
                { label: "Bias", score: selectedModel.biasRisk },
                { label: "Toxicity", score: selectedModel.toxicityRisk },
                { label: "Privacy", score: selectedModel.privacyRisk },
              ].map((risk) => (
                <Card key={risk.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{risk.label}</h4>
                      <Badge variant={getRiskBadgeVariant(risk.score)}>{risk.score}/100</Badge>
                    </div>
                    <Progress value={risk.score} className="h-2" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(selectedModel.riskAlerts || []).slice(0, 3).map((alert, i) => (
                  <div key={i} className="p-3 bg-muted/50 rounded-lg border-l-4 border-l-orange-500">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm">{alert.title}</h4>
                      <Badge variant={alert.severity === "High" ? "destructive" : "warning"} className="text-xs">
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="apps" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Internal Apps
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {internalApps.length > 0 ? (
                    internalApps.map((app, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm">{app.name}</h4>
                          <Badge variant={app.status === "Active" ? "success" : "secondary"} className="text-xs">
                            {app.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{app.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No internal apps</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Public Apps
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {externalApps.length > 0 ? (
                    externalApps.map((app, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm">{app.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {app.users}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{app.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No public apps</p>
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
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pricing ? (
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Input</p>
                      <p className="text-lg font-bold">{pricing.inputCost}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Output</p>
                      <p className="text-lg font-bold">{pricing.outputCost}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Context</p>
                      <p className="text-lg font-bold">{pricing.contextWindow}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Est. Monthly</p>
                      <p className="text-lg font-bold text-primary">{pricing.monthlyEstimate}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No pricing data</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mitigations">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Mitigations
                </CardTitle>
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
