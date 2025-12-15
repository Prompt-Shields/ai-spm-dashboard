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
  Shield,
  Brain,
  Activity,
  Info,
  HelpCircle,
  Briefcase,
  ExternalLink,
  Cpu,
  DollarSign,
} from "lucide-react"
import { modelRiskProfiles, getRiskLevel, getRiskColor } from "@/lib/model-risk-data"
import { AppHeader } from "@/components/app-header"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const sampleAppsData: Record<string, { name: string; description: string; category: string; users: string }[]> = {
  "mrm-001": [
    {
      name: "Storebrand Kundechat",
      description: "Customer service chatbot for insurance queries",
      category: "Customer Support",
      users: "150K monthly",
    },
    {
      name: "ClaimsAssist Pro",
      description: "Automated claims processing assistant",
      category: "Claims",
      users: "45K monthly",
    },
    {
      name: "PolicyAdvisor",
      description: "Insurance policy recommendation engine",
      category: "Sales",
      users: "28K monthly",
    },
    {
      name: "DocumentSummariser",
      description: "Summarises lengthy policy documents",
      category: "Operations",
      users: "12K monthly",
    },
  ],
  "mrm-002": [
    {
      name: "ComplianceReview",
      description: "Automated compliance document analysis",
      category: "Compliance",
      users: "8K monthly",
    },
    {
      name: "LegalResearchTool",
      description: "Legal precedent and regulation research",
      category: "Legal",
      users: "5K monthly",
    },
    {
      name: "RiskAssessmentBot",
      description: "Enterprise risk evaluation assistant",
      category: "Risk",
      users: "15K monthly",
    },
  ],
  "mrm-003": [
    {
      name: "CodePilot Internal",
      description: "Internal code assistance for developers",
      category: "Development",
      users: "3K monthly",
    },
    {
      name: "DataAnalyser",
      description: "Statistical analysis and reporting tool",
      category: "Analytics",
      users: "2K monthly",
    },
  ],
  "mrm-004": [
    {
      name: "EmailSummariser",
      description: "Summarises email threads and highlights action items",
      category: "Productivity",
      users: "85K monthly",
    },
    {
      name: "MeetingIntelligence",
      description: "Meeting transcription and action item extraction",
      category: "Productivity",
      users: "42K monthly",
    },
    {
      name: "DocumentSearch",
      description: "Enterprise document search and retrieval",
      category: "Knowledge",
      users: "65K monthly",
    },
  ],
  "mrm-005": [
    {
      name: "SecureInference",
      description: "On-premises AI inference for sensitive data",
      category: "Infrastructure",
      users: "Internal only",
    },
    {
      name: "RAGPipeline",
      description: "Retrieval-augmented generation system",
      category: "Infrastructure",
      users: "Internal only",
    },
  ],
  "mrm-006": [
    {
      name: "CustomUnderwriting",
      description: "Fine-tuned model for underwriting decisions",
      category: "Underwriting",
      users: "Internal only",
    },
    {
      name: "FraudDetectionLLM",
      description: "Language model for fraud pattern detection",
      category: "Fraud",
      users: "Internal only",
    },
  ],
  "mrm-007": [
    {
      name: "CallTranscription",
      description: "Customer call transcription service",
      category: "Customer Service",
      users: "200K calls/month",
    },
    {
      name: "VoiceClaimsIntake",
      description: "Voice-based claims intake system",
      category: "Claims",
      users: "35K monthly",
    },
  ],
  "mrm-008": [
    {
      name: "MarketingImageGen",
      description: "Marketing material image generation",
      category: "Marketing",
      users: "500 monthly",
    },
    {
      name: "PrototypeDesigner",
      description: "UI/UX prototype image generation",
      category: "Design",
      users: "200 monthly",
    },
  ],
}

export default function ModelRiskContextPage() {
  const [selectedModelId, setSelectedModelId] = useState<string>(modelRiskProfiles[0].modelId)
  const selectedModel = modelRiskProfiles.find((m) => m.modelId === selectedModelId) || modelRiskProfiles[0]

  // Get sample apps for selected model
  const modelSampleApps = sampleAppsData[selectedModelId] || []

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
            <Button variant="outline" size="default" className="h-11 bg-transparent">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Analysis
            </Button>
          </div>

          <Card className="border-2">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Cpu className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Model Inventory</CardTitle>
                    <CardDescription>Select a model to view its detailed risk assessment</CardDescription>
                  </div>
                </div>
                <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                  <SelectTrigger className="w-[300px] h-11">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {modelRiskProfiles.map((model) => (
                      <SelectItem key={model.modelId} value={model.modelId}>
                        <div className="flex items-center justify-between w-full gap-4">
                          <span>
                            {model.name} ({model.provider})
                          </span>
                          <Badge
                            variant="secondary"
                            className={`${getRiskColor(model.overallRisk)} text-white text-xs ml-2`}
                          >
                            {model.overallRisk}/100
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Model cards grid showing all models with risk scores */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {modelRiskProfiles.map((model) => (
                  <button
                    key={model.modelId}
                    onClick={() => setSelectedModelId(model.modelId)}
                    className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                      model.modelId === selectedModelId
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">{model.name}</p>
                        <p className="text-xs text-muted-foreground">{model.provider}</p>
                      </div>
                      <Badge variant="secondary" className={`${getRiskColor(model.overallRisk)} text-white text-xs`}>
                        {getRiskLevel(model.overallRisk)}
                      </Badge>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Overall Risk</span>
                        <span className="font-semibold">{model.overallRisk}/100</span>
                      </div>
                      <Progress value={model.overallRisk} className="h-2" />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {model.category}
                      </Badge>
                      <Badge variant={model.status === "Production" ? "default" : "secondary"} className="text-xs">
                        {model.status}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

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

          {/* Approved Use Cases - Prominent Section */}
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

          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-[700px]">
              <TabsTrigger value="details">Model Details</TabsTrigger>
              <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
              <TabsTrigger value="apps">Sample Apps</TabsTrigger>
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
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
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
                        description: "Risk of exposing or memorising sensitive data",
                      },
                      {
                        label: "Security",
                        value: selectedModel.securityRisk,
                        description: "Vulnerability to adversarial attacks and jailbreaks",
                      },
                      {
                        label: "Compliance",
                        value: selectedModel.complianceRisk,
                        description: "Alignment with regulatory requirements (GDPR, etc.)",
                      },
                    ].map((metric) => (
                      <Card key={metric.label} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{metric.label}</span>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-[200px]">{metric.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <span className="font-bold">{metric.value}/100</span>
                        </div>
                        <Progress value={metric.value} className="h-2 mb-2" />
                        <Badge variant="secondary" className={`${getRiskColor(metric.value)} text-white text-xs`}>
                          {getRiskLevel(metric.value)}
                        </Badge>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="apps" className="space-y-6">
              <Card>
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="h-5 w-5 text-primary" />
                    Applications Using {selectedModel.name}
                  </CardTitle>
                  <CardDescription>Sample applications deployed at Storebrand that utilise this model</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {modelSampleApps.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {modelSampleApps.map((app, idx) => (
                        <Card key={idx} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">{app.name}</h4>
                                <p className="text-sm text-muted-foreground">{app.description}</p>
                              </div>
                              <Badge variant="outline">{app.category}</Badge>
                            </div>
                            <div className="mt-3 pt-3 border-t flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Active Users</span>
                              <span className="text-sm font-semibold">{app.users}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No sample applications registered for this model yet.</p>
                    </div>
                  )}

                  {/* DeepSeek-specific external applications */}
                  {selectedModel.applications && selectedModel.applications.length > 0 && (
                    <div className="mt-8 pt-6 border-t">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <ExternalLink className="h-5 w-5 text-blue-700" />
                        </div>
                        <div>
                          <h3 className="font-semibold">External Applications Using This Model</h3>
                          <p className="text-sm text-muted-foreground">
                            Top public applications via OpenRouter (for risk awareness)
                          </p>
                        </div>
                      </div>

                      {/* Pricing info */}
                      {selectedModel.pricing && (
                        <Card className="mb-4 border-blue-200 bg-blue-50/50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="h-4 w-4 text-blue-600" />
                              <span className="font-semibold text-sm">Pricing Information</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Input Cost</p>
                                <p className="font-semibold">{selectedModel.pricing.inputCost}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Output Cost</p>
                                <p className="font-semibold">{selectedModel.pricing.outputCost}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Context Window</p>
                                <p className="font-semibold">{selectedModel.pricing.contextWindow}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Pricing Model</p>
                                <p className="font-semibold">Pay-per-use</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <div className="grid gap-3">
                        {selectedModel.applications.slice(0, 10).map((app, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-white">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-mono text-muted-foreground w-6">#{app.rank}</span>
                              <div>
                                <p className="font-semibold text-sm">{app.name}</p>
                                <p className="text-xs text-muted-foreground">{app.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">{app.tokensUsed}</p>
                              <p className="text-xs text-muted-foreground">tokens used</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mitigations" className="space-y-6">
              <Card>
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Recommended Mitigations for {selectedModel.name}
                  </CardTitle>
                  <CardDescription>Actions to reduce risk when deploying this model in production</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedModel.hallucinationRisk > 50 && (
                      <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Brain className="h-4 w-4 text-blue-500" />
                            Hallucination Mitigation
                          </h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Implement fact-checking against authoritative sources</li>
                            <li>• Use retrieval-augmented generation (RAG) with verified data</li>
                            <li>• Require human review for factual claims</li>
                            <li>• Add confidence scoring to outputs</li>
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                    {selectedModel.biasRisk > 50 && (
                      <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-purple-500" />
                            Bias Mitigation
                          </h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Conduct regular fairness audits</li>
                            <li>• Use diverse evaluation datasets</li>
                            <li>• Implement debiasing techniques in prompts</li>
                            <li>• Monitor demographic parity in outputs</li>
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                    {selectedModel.privacyRisk > 50 && (
                      <Card className="border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-red-500" />
                            Privacy Mitigation
                          </h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Use data anonymisation before processing</li>
                            <li>• Implement PII detection and redaction</li>
                            <li>• Deploy in enterprise-isolated environments</li>
                            <li>• Establish data retention policies</li>
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                    {selectedModel.securityRisk > 50 && (
                      <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            Security Mitigation
                          </h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Implement input validation and sanitisation</li>
                            <li>• Add prompt injection detection</li>
                            <li>• Use output filtering for sensitive content</li>
                            <li>• Monitor for adversarial attacks</li>
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                    {selectedModel.complianceRisk > 50 && (
                      <Card className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Compliance Mitigation
                          </h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Document model usage and decisions</li>
                            <li>• Implement audit trails for AI outputs</li>
                            <li>• Ensure GDPR-compliant data processing</li>
                            <li>• Maintain model cards and transparency reports</li>
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                    <Card className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4 text-primary" />
                          General Best Practices
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Establish human-in-the-loop for critical decisions</li>
                          <li>• Implement continuous monitoring and alerting</li>
                          <li>• Create incident response procedures</li>
                          <li>• Conduct regular model evaluations</li>
                        </ul>
                      </CardContent>
                    </Card>
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
