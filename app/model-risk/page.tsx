"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Shield,
  Brain,
  Activity,
  Info,
  HelpCircle,
} from "lucide-react"
import { modelRiskProfiles, getModelRiskStatistics, getRiskLevel, getRiskColor } from "@/lib/model-risk-data"
import { AppHeader } from "@/components/app-header"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ModelRiskContextPage() {
  const [selectedModelId, setSelectedModelId] = useState<string>(modelRiskProfiles[0].modelId)
  const selectedModel = modelRiskProfiles.find((m) => m.modelId === selectedModelId) || modelRiskProfiles[0]

  const stats = getModelRiskStatistics()

  return (
    <TooltipProvider>
      <AppHeader />
      <div className="min-h-screen bg-background">
        <div className="container py-8 px-8 max-w-[1600px] mx-auto space-y-8">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Brain className="h-8 w-8 text-primary" />
                Model Risk Context
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Assess individual AI model behaviour, safety characteristics, and risk profiles. This view helps you
                make informed decisions about which models are appropriate for specific insurance use cases at
                Storebrand.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                <SelectTrigger className="w-[280px] h-11">
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

          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm mb-1">Understanding Model Risk Scores</p>
                  <p className="text-sm text-muted-foreground">
                    Each model is assessed across six dimensions: hallucination (generating false information), bias
                    (unfair treatment of groups), toxicity (harmful content generation), privacy (data leakage risk),
                    security (vulnerability to attacks), and compliance (regulatory alignment). Scores range from 0-100
                    where higher scores indicate greater risk. For insurance operations, we recommend models with
                    overall risk below 60 for customer-facing applications.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Total Models
                  </p>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Number of AI models evaluated for use at Storebrand</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-3xl font-bold">{stats.totalModels}</p>
                <p className="text-xs text-muted-foreground mt-1">Models under assessment</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Hallucination Alerts
                  </p>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Models that may generate plausible but incorrect information</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-3xl font-bold text-yellow-600">{stats.modelsWithHallucinationAlerts}</p>
                <p className="text-xs text-muted-foreground mt-1">May generate false information</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    Bias Alerts
                  </p>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Models with potential for unfair treatment of demographic groups</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-3xl font-bold text-blue-600">{stats.modelsWithBiasAlerts}</p>
                <p className="text-xs text-muted-foreground mt-1">Potential fairness issues</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4 text-orange-500" />
                    Toxicity Alerts
                  </p>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Models that may generate harmful or inappropriate content</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-3xl font-bold text-orange-600">{stats.modelsWithToxicityAlerts}</p>
                <p className="text-xs text-muted-foreground mt-1">Content safety concerns</p>
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
                <Card>
                  <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Model Details
                    </CardTitle>
                    <CardDescription>Information about the selected model</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Name</p>
                        <p className="text-lg font-bold">{selectedModel.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Provider</p>
                        <p className="text-lg font-bold">{selectedModel.provider}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Version</p>
                        <p className="font-semibold">{selectedModel.version}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Type</p>
                        <p className="font-semibold">
                          {selectedModel.category === "LLM" ? "Large Language Model" : selectedModel.category}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Parameters</p>
                        <p className="font-semibold">{selectedModel.parameters}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Status</p>
                        <Badge variant={selectedModel.status === "Production" ? "default" : "secondary"}>
                          {selectedModel.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <p className="text-sm font-semibold">Model Strengths</p>
                      </div>
                      <ul className="space-y-1">
                        {selectedModel.strengths.map((strength, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-green-600 mt-0.5">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <p className="text-sm font-semibold">Key Risks to Consider</p>
                      </div>
                      <ul className="space-y-1">
                        {selectedModel.keyRisks.map((risk, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Assessment Card */}
                <Card>
                  <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Risk Assessment
                    </CardTitle>
                    <CardDescription>Risk scores for the selected model (0-100, lower is better)</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {/* Overall Risk */}
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Overall Risk</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{selectedModel.overallRisk}/100</span>
                          <Badge
                            variant="secondary"
                            className={`${getRiskColor(selectedModel.overallRisk)} text-white`}
                          >
                            {getRiskLevel(selectedModel.overallRisk)}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={selectedModel.overallRisk} className="h-3" />
                    </div>

                    {/* Individual Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Hallucination", value: selectedModel.hallucinationRisk },
                        { label: "Bias", value: selectedModel.biasRisk },
                        { label: "Toxicity", value: selectedModel.toxicityRisk },
                        { label: "Privacy", value: selectedModel.privacyRisk },
                        { label: "Security", value: selectedModel.securityRisk },
                        { label: "Compliance", value: selectedModel.complianceRisk },
                      ].map((metric) => (
                        <div key={metric.label} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{metric.label}</span>
                            <span className="font-bold">{metric.value}/100</span>
                          </div>
                          <Progress value={metric.value} className="h-2" />
                          <Badge
                            variant="secondary"
                            className={`${getRiskColor(metric.value)} text-white text-xs mt-2 w-full justify-center`}
                          >
                            {getRiskLevel(metric.value)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Use Cases and Alerts */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader className="border-b bg-muted/30">
                    <CardTitle>Approved Use Cases</CardTitle>
                    <CardDescription>Safe applications for this model at Storebrand</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      {selectedModel.approvedUseCases.map((useCase, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200"
                        >
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm font-medium text-green-900">{useCase}</span>
                        </div>
                      ))}
                    </div>

                    {selectedModel.warnings && selectedModel.warnings.length > 0 && (
                      <div className="mt-6 pt-4 border-t">
                        <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          Important Warnings
                        </p>
                        <div className="space-y-2">
                          {selectedModel.warnings.map((warning, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                              <p className="text-sm text-orange-900">{warning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="border-b bg-muted/30">
                    <CardTitle>Active Risk Alerts</CardTitle>
                    <CardDescription>Current issues detected with this model</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {selectedModel.alerts.map((alert) => (
                        <div key={alert.id} className="border-l-4 border-l-yellow-500 rounded-lg p-4 bg-yellow-50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              <h4 className="font-semibold text-sm text-yellow-900">{alert.type} Alert</h4>
                            </div>
                            <Badge
                              variant="secondary"
                              className={`${alert.severity === "High" || alert.severity === "Critical" ? "bg-orange-500" : "bg-yellow-500"} text-white text-xs`}
                            >
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-yellow-900 mb-2">{alert.description}</p>
                          <div>
                            <p className="text-xs font-semibold text-yellow-900 mb-1">Examples:</p>
                            <ul className="space-y-1">
                              {alert.examples.map((example, idx) => (
                                <li key={idx} className="text-xs text-yellow-800 flex items-start gap-1">
                                  <span>•</span>
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
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle>Model Inventory</CardTitle>
                  <CardDescription>
                    All models evaluated for use at Storebrand. Click any model to view detailed assessment.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {modelRiskProfiles.map((model) => (
                      <div
                        key={model.modelId}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-all ${
                          selectedModelId === model.modelId ? "border-primary bg-primary/5" : "border-border"
                        }`}
                        onClick={() => setSelectedModelId(model.modelId)}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{model.name}</h4>
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
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Overall Risk</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold">{model.overallRisk}/100</span>
                            <Badge variant="secondary" className={`${getRiskColor(model.overallRisk)} text-white`}>
                              {getRiskLevel(model.overallRisk)}
                            </Badge>
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
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle>All Risk Alerts</CardTitle>
                  <CardDescription>
                    Comprehensive view of all detected risks across all evaluated models
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {modelRiskProfiles.flatMap((model) =>
                      model.alerts.map((alert) => (
                        <div
                          key={`${model.modelId}-${alert.id}`}
                          className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/30"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              <span className="font-semibold text-sm">{alert.type} Alert</span>
                              <span className="text-xs text-muted-foreground">• {model.name}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{alert.description}</p>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`${alert.severity === "High" || alert.severity === "Critical" ? "bg-orange-500" : "bg-yellow-500"} text-white text-xs`}
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                      )),
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mitigations" className="space-y-6">
              <Card>
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle>Risk Mitigations</CardTitle>
                  <CardDescription>
                    Recommended actions to reduce AI model risks in insurance operations
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {[
                      {
                        title: "Implement Guardrails",
                        description:
                          "Deploy input/output filtering and content moderation systems to detect and prevent harmful responses. Essential for customer-facing chatbots and claims processing.",
                      },
                      {
                        title: "Regular Testing & Evaluation",
                        description:
                          "Conduct ongoing bias testing, hallucination detection, and safety evaluations. For insurance, focus on underwriting fairness and claims accuracy.",
                      },
                      {
                        title: "Human-in-the-Loop Review",
                        description:
                          "Implement human oversight for high-risk decisions such as claim denials, coverage recommendations, and premium calculations.",
                      },
                      {
                        title: "Access Controls & Monitoring",
                        description:
                          "Enforce strict authentication, audit logging, and real-time monitoring. Track all AI decisions for regulatory compliance and customer disputes.",
                      },
                      {
                        title: "Data Governance",
                        description:
                          "Ensure training data and prompts do not contain sensitive customer information. Implement data minimisation principles for all AI interactions.",
                      },
                    ].map((mitigation, index) => (
                      <div key={index} className="border-l-4 border-l-primary rounded-lg p-4 bg-muted/30">
                        <h4 className="font-semibold mb-2">{mitigation.title}</h4>
                        <p className="text-sm text-muted-foreground">{mitigation.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  )
}
