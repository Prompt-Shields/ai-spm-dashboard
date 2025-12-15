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
  Briefcase,
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
          {/* Header */}
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

          {/* Explanation Card */}
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

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50/50 to-background">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Briefcase className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <CardTitle className="text-xl">Approved Use Cases for {selectedModel.name}</CardTitle>
                  <CardDescription>
                    These applications have been reviewed and approved for this model at Storebrand
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {selectedModel.approvedUseCases.map((useCase, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 rounded-lg bg-white border border-green-200 shadow-sm"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-medium">{useCase}</span>
                  </div>
                ))}
              </div>

              {selectedModel.warnings && selectedModel.warnings.length > 0 && (
                <div className="mt-6 pt-4 border-t border-green-200">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Important Warnings for This Model
                  </p>
                  <div className="grid gap-2 md:grid-cols-2">
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

          {/* Main Content Tabs - Reorganized to remove duplicate content */}
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
              <TabsTrigger value="details">Model Details</TabsTrigger>
              <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
              <TabsTrigger value="inventory">All Models</TabsTrigger>
              <TabsTrigger value="mitigations">Mitigations</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Model Details Card */}
                <Card>
                  <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Model Information
                    </CardTitle>
                    <CardDescription>Technical specifications and capabilities</CardDescription>
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

                {/* Active Alerts Card */}
                <Card>
                  <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      Active Risk Alerts
                    </CardTitle>
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

            <TabsContent value="risks" className="space-y-6">
              <Card>
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Risk Assessment for {selectedModel.name}
                  </CardTitle>
                  <CardDescription>
                    Detailed risk scores across all dimensions. Scores range from 0-100 where lower is better.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Overall Risk */}
                  <div className="p-6 bg-muted/30 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-lg font-semibold">Overall Risk Score</span>
                        <p className="text-sm text-muted-foreground">Weighted average of all risk dimensions</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-4xl font-bold">{selectedModel.overallRisk}</span>
                        <span className="text-2xl text-muted-foreground">/100</span>
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

                  {/* Individual Metrics Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        label: "Hallucination",
                        value: selectedModel.hallucinationRisk,
                        description: "Risk of generating plausible but false information",
                      },
                      {
                        label: "Bias",
                        value: selectedModel.biasRisk,
                        description: "Potential for unfair treatment of demographic groups",
                      },
                      {
                        label: "Toxicity",
                        value: selectedModel.toxicityRisk,
                        description: "Likelihood of generating harmful content",
                      },
                      {
                        label: "Privacy",
                        value: selectedModel.privacyRisk,
                        description: "Risk of exposing sensitive data",
                      },
                      {
                        label: "Security",
                        value: selectedModel.securityRisk,
                        description: "Vulnerability to adversarial attacks",
                      },
                      {
                        label: "Compliance",
                        value: selectedModel.complianceRisk,
                        description: "Alignment with regulatory requirements",
                      },
                    ].map((metric) => (
                      <Card key={metric.label} className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold">{metric.label}</span>
                          <span className="text-xl font-bold">{metric.value}/100</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{metric.description}</p>
                        <Progress value={metric.value} className="h-2 mb-2" />
                        <Badge
                          variant="secondary"
                          className={`${getRiskColor(metric.value)} text-white text-xs w-full justify-center`}
                        >
                          {getRiskLevel(metric.value)}
                        </Badge>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Model Inventory tab */}
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
                          <p className="text-xs text-muted-foreground">
                            {model.approvedUseCases.length} approved use cases
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

            {/* Mitigations tab */}
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
