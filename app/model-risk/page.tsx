"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, CheckCircle2, RefreshCw, AlertCircle } from "lucide-react"
import { modelRiskProfiles, getModelRiskStatistics, getRiskLevel, getRiskColor } from "@/lib/model-risk-data"

export default function ModelRiskContextPage() {
  const [selectedModelId, setSelectedModelId] = useState<string>(modelRiskProfiles[0].modelId)
  const selectedModel = modelRiskProfiles.find((m) => m.modelId === selectedModelId) || modelRiskProfiles[0]

  const stats = getModelRiskStatistics()

  return (
    <div className="container py-8 px-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Model Risk Context</h1>
          <p className="text-muted-foreground mt-2">Assess model behaviour and context</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedModelId} onValueChange={setSelectedModelId}>
            <SelectTrigger className="w-[280px]">
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
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Analysis
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalModels}</div>
            <p className="text-xs text-muted-foreground mt-1">Models under assessment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <CardTitle className="text-sm font-medium text-muted-foreground">Hallucination Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.modelsWithHallucinationAlerts}</div>
            <p className="text-xs text-muted-foreground mt-1">Models with hallucination issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-sm font-medium text-muted-foreground">Bias Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.modelsWithBiasAlerts}</div>
            <p className="text-xs text-muted-foreground mt-1">Models with bias issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <CardTitle className="text-sm font-medium text-muted-foreground">Toxicity Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.modelsWithToxicityAlerts}</div>
            <p className="text-xs text-muted-foreground mt-1">Models with toxicity issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Model Overview</TabsTrigger>
          <TabsTrigger value="inventory">Model Inventory</TabsTrigger>
          <TabsTrigger value="alerts">Risk Alerts</TabsTrigger>
          <TabsTrigger value="mitigations">Mitigations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Model Details */}
            <Card>
              <CardHeader>
                <CardTitle>Model Details</CardTitle>
                <CardDescription>Information about the selected model</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Name:</p>
                    <p className="text-2xl font-bold">{selectedModel.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Provider:</p>
                    <p className="text-2xl font-bold">{selectedModel.provider}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Version:</p>
                    <p className="text-lg">{selectedModel.version}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Type:</p>
                    <p className="text-lg">
                      {selectedModel.category === "LLM" ? "Large Language Model" : selectedModel.category}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Parameters:</p>
                    <p className="text-lg">{selectedModel.parameters}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Evaluated:</p>
                    <p className="text-lg">{selectedModel.lastEvaluated}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Status:</p>
                  <Badge variant={selectedModel.status === "Production" ? "default" : "secondary"}>
                    {selectedModel.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>Risk scores for the selected model</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Risk */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Risk:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold">{selectedModel.overallRisk}/100</span>
                      <Badge variant="secondary" className={`${getRiskColor(selectedModel.overallRisk)} text-white`}>
                        {getRiskLevel(selectedModel.overallRisk)}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={selectedModel.overallRisk} className="h-3" />
                </div>

                {/* Individual Risk Metrics */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Hallucination:</span>
                      <span className="text-sm font-bold">{selectedModel.hallucinationRisk}/100</span>
                    </div>
                    <Progress value={selectedModel.hallucinationRisk} className="h-2" />
                    <Badge
                      variant="secondary"
                      className={`mt-1 ${getRiskColor(selectedModel.hallucinationRisk)} text-white text-xs`}
                    >
                      {getRiskLevel(selectedModel.hallucinationRisk)}
                    </Badge>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Bias:</span>
                      <span className="text-sm font-bold">{selectedModel.biasRisk}/100</span>
                    </div>
                    <Progress value={selectedModel.biasRisk} className="h-2" />
                    <Badge
                      variant="secondary"
                      className={`mt-1 ${getRiskColor(selectedModel.biasRisk)} text-white text-xs`}
                    >
                      {getRiskLevel(selectedModel.biasRisk)}
                    </Badge>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Toxicity:</span>
                      <span className="text-sm font-bold">{selectedModel.toxicityRisk}/100</span>
                    </div>
                    <Progress value={selectedModel.toxicityRisk} className="h-2" />
                    <Badge
                      variant="secondary"
                      className={`mt-1 ${getRiskColor(selectedModel.toxicityRisk)} text-white text-xs`}
                    >
                      {getRiskLevel(selectedModel.toxicityRisk)}
                    </Badge>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Privacy:</span>
                      <span className="text-sm font-bold">{selectedModel.privacyRisk}/100</span>
                    </div>
                    <Progress value={selectedModel.privacyRisk} className="h-2" />
                    <Badge
                      variant="secondary"
                      className={`mt-1 ${getRiskColor(selectedModel.privacyRisk)} text-white text-xs`}
                    >
                      {getRiskLevel(selectedModel.privacyRisk)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Use Cases */}
            <Card>
              <CardHeader>
                <CardTitle>Use Cases</CardTitle>
                <CardDescription>Approved use cases for this model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedModel.approvedUseCases.map((useCase, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{useCase}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Alerts</CardTitle>
                <CardDescription>Detected issues with this model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedModel.alerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <h4 className="font-semibold text-sm">{alert.type} Alert</h4>
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
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <div className="mt-2">
                        <p className="text-xs font-medium mb-1">Examples:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {alert.examples.map((example, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground">
                              {example}
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
            <CardHeader>
              <CardTitle>Model Inventory</CardTitle>
              <CardDescription>Complete list of all models under assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modelRiskProfiles.map((model) => (
                  <div
                    key={model.modelId}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedModelId(model.modelId)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{model.name}</h4>
                        <Badge variant="outline">{model.provider}</Badge>
                        <Badge variant={model.status === "Production" ? "default" : "secondary"}>{model.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {model.category} • Version {model.version} • {model.parameters}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">Overall Risk</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-bold">{model.overallRisk}/100</span>
                          <Badge
                            variant="secondary"
                            className={`${getRiskColor(model.overallRisk)} text-white text-xs`}
                          >
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

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>All Risk Alerts</CardTitle>
              <CardDescription>Comprehensive view of all detected risks across models</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Risk alerts dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mitigations">
          <Card>
            <CardHeader>
              <CardTitle>Risk Mitigations</CardTitle>
              <CardDescription>Recommended actions to reduce model risks</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Mitigation strategies dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
