"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, CheckCircle2, RefreshCw, AlertCircle, Shield, Brain, Activity } from "lucide-react"
import { modelRiskProfiles, getModelRiskStatistics, getRiskLevel, getRiskColor } from "@/lib/model-risk-data"
import { AppHeader } from "@/components/app-header"

export default function ModelRiskContextPage() {
  const [selectedModelId, setSelectedModelId] = useState<string>(modelRiskProfiles[0].modelId)
  const selectedModel = modelRiskProfiles.find((m) => m.modelId === selectedModelId) || modelRiskProfiles[0]

  const stats = getModelRiskStatistics()

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-muted/30">
        <div className="container py-8 px-8 max-w-[1600px] mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight">Model Risk Context</h1>
              <p className="text-muted-foreground text-lg">Assess model behaviour and context</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                <SelectTrigger className="w-[300px] h-11">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {modelRiskProfiles.map((model) => (
                    <SelectItem key={model.modelId} value={model.modelId}>
                      {model.name} ({model.provider})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="default" className="h-11 bg-transparent">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Analysis
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Total Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats.totalModels}</div>
                <p className="text-xs text-muted-foreground mt-2">Models under assessment</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Hallucination Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-yellow-600">{stats.modelsWithHallucinationAlerts}</div>
                <p className="text-xs text-muted-foreground mt-2">Models with hallucination issues</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  Bias Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-600">{stats.modelsWithBiasAlerts}</div>
                <p className="text-xs text-muted-foreground mt-2">Models with bias issues</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-orange-500" />
                  Toxicity Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-orange-600">{stats.modelsWithToxicityAlerts}</div>
                <p className="text-xs text-muted-foreground mt-2">Models with toxicity issues</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
              <TabsTrigger value="overview">Model Overview</TabsTrigger>
              <TabsTrigger value="inventory">Model Inventory</TabsTrigger>
              <TabsTrigger value="alerts">Risk Alerts</TabsTrigger>
              <TabsTrigger value="mitigations">Mitigations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Model Details Card */}
                <Card className="lg:col-span-1">
                  <CardHeader className="border-b bg-muted/50">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Model Details
                    </CardTitle>
                    <CardDescription>Information about the selected model</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {/* Name and Provider */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Name:</p>
                        <p className="text-2xl font-bold">{selectedModel.name}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Provider:</p>
                        <p className="text-2xl font-bold">{selectedModel.provider}</p>
                      </div>
                    </div>

                    {/* Version and Type */}
                    <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Version:</p>
                        <p className="text-lg font-semibold">{selectedModel.version}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Type:</p>
                        <p className="text-lg font-semibold">
                          {selectedModel.category === "LLM" ? "Large Language Model" : selectedModel.category}
                        </p>
                      </div>
                    </div>

                    {/* Parameters and Last Evaluated */}
                    <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Parameters:</p>
                        <p className="text-lg font-semibold">{selectedModel.parameters}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Last Evaluated:</p>
                        <p className="text-lg font-semibold">{selectedModel.lastEvaluated}</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Status:</p>
                      <Badge
                        variant={selectedModel.status === "Production" ? "default" : "secondary"}
                        className="text-sm px-3 py-1"
                      >
                        {selectedModel.status}
                      </Badge>
                    </div>

                    {/* Strengths */}
                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <p className="text-sm font-semibold">Strengths:</p>
                      </div>
                      <ul className="space-y-2">
                        {selectedModel.strengths.map((strength, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-green-500 mt-0.5">•</span>
                            <span className="text-muted-foreground">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Key Risks */}
                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <p className="text-sm font-semibold">Key Risks:</p>
                      </div>
                      <ul className="space-y-2">
                        {selectedModel.keyRisks.map((risk, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span className="text-muted-foreground">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Assessment Card */}
                <Card className="lg:col-span-1">
                  <CardHeader className="border-b bg-muted/50">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Risk Assessment
                    </CardTitle>
                    <CardDescription>Risk scores for the selected model</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {/* Overall Risk - Prominent */}
                    <div className="p-4 bg-muted/50 rounded-lg border-2 border-border">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-base font-semibold">Overall Risk:</span>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-bold">{selectedModel.overallRisk}/100</span>
                          <Badge
                            variant="secondary"
                            className={`${getRiskColor(selectedModel.overallRisk)} text-white text-sm px-3 py-1`}
                          >
                            {getRiskLevel(selectedModel.overallRisk)}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={selectedModel.overallRisk} className="h-4" />
                    </div>

                    {/* Individual Risk Metrics in Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Hallucination */}
                      <div className="p-3 border rounded-lg bg-card space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Hallucination:</span>
                          <span className="text-lg font-bold">{selectedModel.hallucinationRisk}/100</span>
                        </div>
                        <Progress value={selectedModel.hallucinationRisk} className="h-2" />
                        <Badge
                          variant="secondary"
                          className={`${getRiskColor(selectedModel.hallucinationRisk)} text-white text-xs w-full justify-center`}
                        >
                          {getRiskLevel(selectedModel.hallucinationRisk)}
                        </Badge>
                      </div>

                      {/* Bias */}
                      <div className="p-3 border rounded-lg bg-card space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Bias:</span>
                          <span className="text-lg font-bold">{selectedModel.biasRisk}/100</span>
                        </div>
                        <Progress value={selectedModel.biasRisk} className="h-2" />
                        <Badge
                          variant="secondary"
                          className={`${getRiskColor(selectedModel.biasRisk)} text-white text-xs w-full justify-center`}
                        >
                          {getRiskLevel(selectedModel.biasRisk)}
                        </Badge>
                      </div>

                      {/* Toxicity */}
                      <div className="p-3 border rounded-lg bg-card space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Toxicity:</span>
                          <span className="text-lg font-bold">{selectedModel.toxicityRisk}/100</span>
                        </div>
                        <Progress value={selectedModel.toxicityRisk} className="h-2" />
                        <Badge
                          variant="secondary"
                          className={`${getRiskColor(selectedModel.toxicityRisk)} text-white text-xs w-full justify-center`}
                        >
                          {getRiskLevel(selectedModel.toxicityRisk)}
                        </Badge>
                      </div>

                      {/* Privacy */}
                      <div className="p-3 border rounded-lg bg-card space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Privacy:</span>
                          <span className="text-lg font-bold">{selectedModel.privacyRisk}/100</span>
                        </div>
                        <Progress value={selectedModel.privacyRisk} className="h-2" />
                        <Badge
                          variant="secondary"
                          className={`${getRiskColor(selectedModel.privacyRisk)} text-white text-xs w-full justify-center`}
                        >
                          {getRiskLevel(selectedModel.privacyRisk)}
                        </Badge>
                      </div>

                      {/* Security */}
                      <div className="p-3 border rounded-lg bg-card space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Security:</span>
                          <span className="text-lg font-bold">{selectedModel.securityRisk}/100</span>
                        </div>
                        <Progress value={selectedModel.securityRisk} className="h-2" />
                        <Badge
                          variant="secondary"
                          className={`${getRiskColor(selectedModel.securityRisk)} text-white text-xs w-full justify-center`}
                        >
                          {getRiskLevel(selectedModel.securityRisk)}
                        </Badge>
                      </div>

                      {/* Compliance */}
                      <div className="p-3 border rounded-lg bg-card space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Compliance:</span>
                          <span className="text-lg font-bold">{selectedModel.complianceRisk}/100</span>
                        </div>
                        <Progress value={selectedModel.complianceRisk} className="h-2" />
                        <Badge
                          variant="secondary"
                          className={`${getRiskColor(selectedModel.complianceRisk)} text-white text-xs w-full justify-center`}
                        >
                          {getRiskLevel(selectedModel.complianceRisk)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bottom Section - Use Cases and Alerts */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Use Cases */}
                <Card>
                  <CardHeader className="border-b bg-muted/50">
                    <CardTitle>Use Cases</CardTitle>
                    <CardDescription>Approved use cases for this model</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {selectedModel.approvedUseCases.map((useCase, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border">
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm font-medium">{useCase}</span>
                        </div>
                      ))}
                    </div>

                    {selectedModel.warnings && selectedModel.warnings.length > 0 && (
                      <div className="mt-6 pt-6 border-t">
                        <div className="flex items-center gap-2 mb-4">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          <p className="text-sm font-semibold">Warnings & Caveats:</p>
                        </div>
                        <div className="space-y-2">
                          {selectedModel.warnings.map((warning, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200"
                            >
                              <span className="text-orange-500 mt-0.5">⚠</span>
                              <span className="text-sm text-orange-900">{warning}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Risk Alerts */}
                <Card>
                  <CardHeader className="border-b bg-muted/50">
                    <CardTitle>Risk Alerts</CardTitle>
                    <CardDescription>Detected issues with this model</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {selectedModel.alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="border-l-4 border-l-yellow-500 rounded-lg p-4 bg-yellow-50 space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                              <h4 className="font-semibold text-sm text-yellow-900">{alert.type} Alert</h4>
                            </div>
                            <Badge
                              variant="secondary"
                              className={`${
                                alert.severity === "High" || alert.severity === "Critical"
                                  ? "bg-orange-500"
                                  : "bg-yellow-500"
                              } text-white text-xs`}
                            >
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-yellow-900">{alert.description}</p>
                          <div>
                            <p className="text-xs font-semibold text-yellow-900 mb-2">Examples:</p>
                            <ul className="space-y-1">
                              {alert.examples.map((example, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-yellow-800">
                                  <span className="mt-1">•</span>
                                  <span>{example}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6">
              <Card>
                <CardHeader className="border-b bg-muted/50">
                  <CardTitle>Model Inventory</CardTitle>
                  <CardDescription>Complete list of all models under assessment</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {modelRiskProfiles.map((model) => (
                      <div
                        key={model.modelId}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-all ${
                          selectedModelId === model.modelId ? "border-primary bg-primary/5" : "border-border"
                        }`}
                        onClick={() => setSelectedModelId(model.modelId)}
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="font-semibold text-lg">{model.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {model.provider}
                            </Badge>
                            <Badge
                              variant={model.status === "Production" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {model.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {model.category} • Version {model.version} • {model.parameters}
                          </p>
                        </div>
                        <div className="flex items-center gap-6 ml-4">
                          <div className="text-right">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Overall Risk</p>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold">{model.overallRisk}/100</span>
                              <Badge variant="secondary" className={`${getRiskColor(model.overallRisk)} text-white`}>
                                {getRiskLevel(model.overallRisk)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <Card>
                <CardHeader className="border-b bg-muted/50">
                  <CardTitle>All Risk Alerts</CardTitle>
                  <CardDescription>Comprehensive view of all detected risks across models</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {modelRiskProfiles.flatMap((model) =>
                      model.alerts.map((alert) => (
                        <div
                          key={`${model.modelId}-${alert.id}`}
                          className="border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                <h4 className="font-semibold text-sm">{alert.type} Alert</h4>
                                <span className="text-xs text-muted-foreground">• {model.name}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{alert.description}</p>
                            </div>
                            <Badge
                              variant="secondary"
                              className={`${
                                alert.severity === "High" || alert.severity === "Critical"
                                  ? "bg-orange-500"
                                  : "bg-yellow-500"
                              } text-white text-xs flex-shrink-0`}
                            >
                              {alert.severity}
                            </Badge>
                          </div>
                        </div>
                      )),
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mitigations" className="space-y-6">
              <Card>
                <CardHeader className="border-b bg-muted/50">
                  <CardTitle>Risk Mitigations</CardTitle>
                  <CardDescription>Recommended actions to reduce model risks</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="border-l-4 border-l-primary rounded-lg p-4 bg-muted/30">
                      <h4 className="font-semibold mb-2">Implement Guardrails</h4>
                      <p className="text-sm text-muted-foreground">
                        Deploy input/output filtering and content moderation systems to detect and prevent harmful
                        responses.
                      </p>
                    </div>
                    <div className="border-l-4 border-l-primary rounded-lg p-4 bg-muted/30">
                      <h4 className="font-semibold mb-2">Regular Testing & Evaluation</h4>
                      <p className="text-sm text-muted-foreground">
                        Conduct ongoing bias testing, hallucination detection, and safety evaluations using standardised
                        benchmarks.
                      </p>
                    </div>
                    <div className="border-l-4 border-l-primary rounded-lg p-4 bg-muted/30">
                      <h4 className="font-semibold mb-2">Human-in-the-Loop Review</h4>
                      <p className="text-sm text-muted-foreground">
                        Implement human oversight for high-risk decisions and sensitive use cases to catch edge cases
                        and errors.
                      </p>
                    </div>
                    <div className="border-l-4 border-l-primary rounded-lg p-4 bg-muted/30">
                      <h4 className="font-semibold mb-2">Access Controls & Monitoring</h4>
                      <p className="text-sm text-muted-foreground">
                        Enforce strict authentication, audit logging, and real-time monitoring to track usage patterns
                        and detect anomalies.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
