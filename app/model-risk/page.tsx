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
  Briefcase,
  ExternalLink,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import { modelRiskProfiles, getRiskLevel, getRiskColor } from "@/lib/model-risk-data"
import { AppHeader } from "@/components/app-header"

const sampleAppsData: Record<
  string,
  Array<{
    name: string
    description: string
    department: string
    usageType: string
    monthlyQueries: number
    status: string
  }>
> = {
  "chatgpt-5o": [
    {
      name: "Kundeservice Chatbot",
      description: "Customer service automation for insurance queries",
      department: "Customer Service",
      usageType: "Production",
      monthlyQueries: 45000,
      status: "Active",
    },
    {
      name: "Dokumentanalyse",
      description: "Policy document analysis and summarisation",
      department: "Underwriting",
      usageType: "Production",
      monthlyQueries: 12000,
      status: "Active",
    },
    {
      name: "Intern Kunnskapssøk",
      description: "Internal knowledge base search assistant",
      department: "HR & Operations",
      usageType: "Pilot",
      monthlyQueries: 3500,
      status: "Active",
    },
  ],
  "claude-sonnet": [
    {
      name: "Skadebehandling Assistent",
      description: "Claims processing decision support",
      department: "Claims",
      usageType: "Production",
      monthlyQueries: 28000,
      status: "Active",
    },
    {
      name: "Compliance Rapportgenerator",
      description: "Regulatory compliance report generation",
      department: "Legal & Compliance",
      usageType: "Production",
      monthlyQueries: 5000,
      status: "Active",
    },
  ],
  "deepseek-r1": [
    {
      name: "Aktuaranalyse Bot",
      description: "Actuarial data analysis and modelling support",
      department: "Actuarial",
      usageType: "Pilot",
      monthlyQueries: 8000,
      status: "Testing",
    },
    {
      name: "Kodeassistent",
      description: "Developer code assistance and review",
      department: "IT Development",
      usageType: "Internal Tool",
      monthlyQueries: 15000,
      status: "Active",
    },
  ],
  "gemini-2-pro": [
    {
      name: "Markedsanalyse",
      description: "Market trend analysis and reporting",
      department: "Investment",
      usageType: "Production",
      monthlyQueries: 6500,
      status: "Active",
    },
    {
      name: "Multimodal Skadedokumentasjon",
      description: "Image-based claims documentation analysis",
      department: "Claims",
      usageType: "Pilot",
      monthlyQueries: 2200,
      status: "Testing",
    },
  ],
  "mistral-large": [
    {
      name: "Europeisk Compliance Sjekk",
      description: "EU regulatory compliance verification",
      department: "Legal & Compliance",
      usageType: "Production",
      monthlyQueries: 4200,
      status: "Active",
    },
  ],
  "llama-3-70b": [
    {
      name: "Intern Dokumentsøk",
      description: "Internal document search and retrieval",
      department: "Operations",
      usageType: "Internal Tool",
      monthlyQueries: 18000,
      status: "Active",
    },
    {
      name: "Opplæringsassistent",
      description: "Employee training and onboarding support",
      department: "HR",
      usageType: "Pilot",
      monthlyQueries: 3000,
      status: "Active",
    },
  ],
  "whisper-large-v3": [
    {
      name: "Samtaletranskribering",
      description: "Customer call transcription and analysis",
      department: "Customer Service",
      usageType: "Production",
      monthlyQueries: 22000,
      status: "Active",
    },
  ],
  "stable-diffusion-xl": [
    {
      name: "Markedsføringsbilder",
      description: "Marketing image generation and editing",
      department: "Marketing",
      usageType: "Internal Tool",
      monthlyQueries: 1500,
      status: "Active",
    },
  ],
}

const modelPricing: Record<
  string,
  {
    inputCost: string
    outputCost: string
    contextWindow: string
    pricingModel: string
    monthlyEstimate?: string
  }
> = {
  "chatgpt-5o": {
    inputCost: "$2.50 per million tokens",
    outputCost: "$10.00 per million tokens",
    contextWindow: "128,000 tokens",
    pricingModel: "Pay-per-use API",
    monthlyEstimate: "~NOK 45,000",
  },
  "claude-sonnet": {
    inputCost: "$3.00 per million tokens",
    outputCost: "$15.00 per million tokens",
    contextWindow: "200,000 tokens",
    pricingModel: "Pay-per-use API",
    monthlyEstimate: "~NOK 38,000",
  },
  "deepseek-r1": {
    inputCost: "$0.24 per million tokens",
    outputCost: "$0.38 per million tokens",
    contextWindow: "163,840 tokens",
    pricingModel: "Pay-per-use API (OpenRouter)",
    monthlyEstimate: "~NOK 5,200",
  },
  "gemini-2-pro": {
    inputCost: "$1.25 per million tokens",
    outputCost: "$5.00 per million tokens",
    contextWindow: "1,000,000 tokens",
    pricingModel: "Pay-per-use API",
    monthlyEstimate: "~NOK 22,000",
  },
  "mistral-large": {
    inputCost: "$2.00 per million tokens",
    outputCost: "$6.00 per million tokens",
    contextWindow: "128,000 tokens",
    pricingModel: "Pay-per-use API",
    monthlyEstimate: "~NOK 15,000",
  },
  "llama-3-70b": {
    inputCost: "$0.70 per million tokens",
    outputCost: "$0.90 per million tokens",
    contextWindow: "128,000 tokens",
    pricingModel: "Self-hosted / API",
    monthlyEstimate: "~NOK 8,500",
  },
  "whisper-large-v3": {
    inputCost: "$0.006 per minute",
    outputCost: "N/A (audio input only)",
    contextWindow: "30 seconds chunks",
    pricingModel: "Per-minute audio processing",
    monthlyEstimate: "~NOK 12,000",
  },
  "stable-diffusion-xl": {
    inputCost: "$0.002 per image",
    outputCost: "$0.02 per image generated",
    contextWindow: "N/A (image model)",
    pricingModel: "Per-image generation",
    monthlyEstimate: "~NOK 3,500",
  },
}

export default function ModelRiskContextPage() {
  const [selectedModelId, setSelectedModelId] = useState<string>(modelRiskProfiles[0].modelId)
  const selectedModel = modelRiskProfiles.find((m) => m.modelId === selectedModelId) || modelRiskProfiles[0]

  const modelSampleApps = sampleAppsData[selectedModelId] || []
  const pricing = modelPricing[selectedModelId]

  const getRiskTrendIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="h-4 w-4 text-red-500" />
    if (score <= 40) return <TrendingDown className="h-4 w-4 text-green-500" />
    return <Minus className="h-4 w-4 text-amber-500" />
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Model Risk Context</h1>
          <p className="text-muted-foreground text-lg">
            Assess AI model behaviour, safety metrics, and operational risk for Storebrand{"'"}s AI portfolio
          </p>
        </div>

        <Card className="border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Brain className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Select Model for Assessment</CardTitle>
                  <CardDescription>Choose an AI model to view its detailed risk profile and metrics</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                  <SelectTrigger className="w-[320px] h-12 text-base">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {modelRiskProfiles.map((model) => (
                      <SelectItem key={model.modelId} value={model.modelId} className="py-3">
                        <div className="flex items-center justify-between w-full gap-4">
                          <div className="flex flex-col">
                            <span className="font-medium">{model.name}</span>
                            <span className="text-xs text-muted-foreground">{model.provider}</span>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`${getRiskColor(model.overallRisk)} text-white text-xs ml-4`}
                          >
                            {model.overallRisk}/100
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="h-12 w-12 bg-transparent">
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Overall Risk Score - Large Display */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-muted/30 rounded-xl">
                <p className="text-sm text-muted-foreground mb-2">Overall Risk Score</p>
                <div
                  className={`text-6xl font-bold ${
                    selectedModel.overallRisk >= 70
                      ? "text-red-600"
                      : selectedModel.overallRisk >= 50
                        ? "text-amber-600"
                        : "text-green-600"
                  }`}
                >
                  {selectedModel.overallRisk}
                </div>
                <p className="text-sm text-muted-foreground mt-1">out of 100</p>
                <Badge className={`mt-3 ${getRiskColor(selectedModel.overallRisk)} text-white px-4 py-1 text-sm`}>
                  {getRiskLevel(selectedModel.overallRisk)} Risk
                </Badge>
                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                  {getRiskTrendIcon(selectedModel.overallRisk)}
                  <span>vs last assessment</span>
                </div>
              </div>

              {/* Risk Dimension Indicators */}
              <div className="lg:col-span-8 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    label: "Hallucination Risk",
                    value: selectedModel.hallucinationRisk,
                    icon: Brain,
                    desc: "Likelihood of generating false information",
                  },
                  {
                    label: "Bias Risk",
                    value: selectedModel.biasRisk,
                    icon: Activity,
                    desc: "Potential for unfair or discriminatory outputs",
                  },
                  {
                    label: "Toxicity Risk",
                    value: selectedModel.toxicityRisk,
                    icon: AlertTriangle,
                    desc: "Risk of harmful or offensive content",
                  },
                  {
                    label: "Privacy Risk",
                    value: selectedModel.privacyRisk,
                    icon: Shield,
                    desc: "Data leakage and privacy concerns",
                  },
                ].map((metric) => (
                  <div key={metric.label} className="p-4 bg-muted/20 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <metric.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{metric.label}</span>
                      </div>
                      <span
                        className={`text-lg font-bold ${
                          metric.value >= 70 ? "text-red-600" : metric.value >= 50 ? "text-amber-600" : "text-green-600"
                        }`}
                      >
                        {metric.value}
                      </span>
                    </div>
                    <Progress value={metric.value} className="h-2 mb-2" />
                    <p className="text-xs text-muted-foreground">{metric.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Quick Info Bar */}
            <div className="mt-6 p-4 bg-muted/20 rounded-lg border flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Provider:</span>
                <span className="font-medium">{selectedModel.provider}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Category:</span>
                <Badge variant="outline">{selectedModel.category}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={selectedModel.status === "Production" ? "default" : "secondary"}>
                  {selectedModel.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Parameters:</span>
                <span className="font-medium">{selectedModel.parameters}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Last Evaluated:</span>
                <span className="font-medium">{selectedModel.lastEvaluated}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approved Use Cases - Prominent Section */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <CardTitle>Approved Use Cases for {selectedModel.name}</CardTitle>
            </div>
            <CardDescription>
              These use cases have been reviewed and approved by the AI Governance Committee for this model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {selectedModel.useCases.map((useCase, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="font-medium text-green-900 dark:text-green-100">{useCase}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="details" className="gap-2">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Model Details</span>
              <span className="sm:hidden">Details</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Pricing</span>
              <span className="sm:hidden">Cost</span>
            </TabsTrigger>
            <TabsTrigger value="apps" className="gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Sample Apps</span>
              <span className="sm:hidden">Apps</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Risk Alerts</span>
              <span className="sm:hidden">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="mitigations" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Mitigations</span>
              <span className="sm:hidden">Actions</span>
            </TabsTrigger>
          </TabsList>

          {/* Model Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Model Information</CardTitle>
                  <CardDescription>Technical specifications and metadata</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    {[
                      { label: "Model Name", value: selectedModel.name },
                      { label: "Provider", value: selectedModel.provider },
                      { label: "Version", value: selectedModel.version },
                      { label: "Category", value: selectedModel.category },
                      { label: "Parameters", value: selectedModel.parameters },
                      { label: "Context Window", value: pricing?.contextWindow || "N/A" },
                      { label: "Last Evaluated", value: selectedModel.lastEvaluated },
                      { label: "Status", value: selectedModel.status },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center py-2 border-b last:border-0">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <span className="font-medium text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Strengths & Capabilities</CardTitle>
                  <CardDescription>Key features and recommended applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {selectedModel.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <CardTitle>Pricing Information for {selectedModel.name}</CardTitle>
                </div>
                <CardDescription>
                  Cost structure and estimated monthly expenditure based on current usage patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pricing ? (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Cost Structure
                      </h4>
                      <div className="space-y-3">
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-sm text-muted-foreground">Input Cost</p>
                          <p className="text-xl font-bold text-primary">{pricing.inputCost}</p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-sm text-muted-foreground">Output Cost</p>
                          <p className="text-xl font-bold text-primary">{pricing.outputCost}</p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-sm text-muted-foreground">Context Window</p>
                          <p className="text-lg font-semibold">{pricing.contextWindow}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Usage Summary
                      </h4>
                      <div className="p-6 bg-primary/5 rounded-xl border border-primary/20">
                        <p className="text-sm text-muted-foreground mb-1">Estimated Monthly Cost</p>
                        <p className="text-3xl font-bold text-primary">{pricing.monthlyEstimate}</p>
                        <p className="text-xs text-muted-foreground mt-2">Based on current Storebrand usage</p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">Pricing Model</p>
                        <p className="font-medium">{pricing.pricingModel}</p>
                      </div>
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-amber-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                              Cost Optimisation Note
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                              Consider caching frequent queries and implementing token limits to reduce costs.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Pricing information not available for this model.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sample Apps Tab */}
          <TabsContent value="apps" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <CardTitle>Applications Using {selectedModel.name}</CardTitle>
                </div>
                <CardDescription>
                  Internal Storebrand applications and systems currently utilising this model
                </CardDescription>
              </CardHeader>
              <CardContent>
                {modelSampleApps.length > 0 ? (
                  <div className="space-y-4">
                    {modelSampleApps.map((app, index) => (
                      <div key={index} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{app.name}</h4>
                              <Badge variant={app.status === "Active" ? "default" : "secondary"} className="text-xs">
                                {app.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{app.description}</p>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Department: </span>
                              <span className="font-medium">{app.department}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Type: </span>
                              <Badge variant="outline" className="text-xs">
                                {app.usageType}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Monthly Queries: </span>
                              <span className="font-medium">{app.monthlyQueries.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No applications currently registered for this model.</p>
                  </div>
                )}

                {/* External Apps for DeepSeek */}
                {selectedModelId === "deepseek-r1" && (
                  <div className="mt-8 pt-6 border-t">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      External Applications (via OpenRouter)
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {[
                        { name: "Cline", users: "2.2M" },
                        { name: "OpenRouter Chat", users: "1.8M" },
                        { name: "Roo Code", users: "892K" },
                        { name: "LibreChat", users: "756K" },
                        { name: "Kortex AI", users: "634K" },
                        { name: "Big-AGI", users: "523K" },
                      ].map((app) => (
                        <div key={app.name} className="p-3 bg-muted/30 rounded-lg border">
                          <p className="font-medium text-sm">{app.name}</p>
                          <p className="text-xs text-muted-foreground">{app.users} monthly users</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <CardTitle>Active Risk Alerts</CardTitle>
                </div>
                <CardDescription>
                  Detected issues and warnings requiring attention for {selectedModel.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedModel.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        alert.severity === "High"
                          ? "border-l-red-500 bg-red-50 dark:bg-red-950/20"
                          : alert.severity === "Medium"
                            ? "border-l-amber-500 bg-amber-50 dark:bg-amber-950/20"
                            : "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle
                              className={`h-4 w-4 ${
                                alert.severity === "High"
                                  ? "text-red-600"
                                  : alert.severity === "Medium"
                                    ? "text-amber-600"
                                    : "text-blue-600"
                              }`}
                            />
                            <span className="font-semibold">{alert.type} Alert</span>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${
                                alert.severity === "High"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : alert.severity === "Medium"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              }`}
                            >
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Examples:</p>
                            <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                              {alert.examples.map((example, i) => (
                                <li key={i}>{example}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{alert.detectedDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mitigations Tab */}
          <TabsContent value="mitigations" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Risk Mitigation Strategies</CardTitle>
                </div>
                <CardDescription>Recommended controls and safeguards for {selectedModel.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      title: "Output Validation",
                      description: "Implement automated fact-checking and citation verification for all model outputs",
                      status: "Implemented",
                    },
                    {
                      title: "Bias Monitoring",
                      description: "Regular fairness audits across protected characteristics with quarterly reporting",
                      status: "In Progress",
                    },
                    {
                      title: "Content Filtering",
                      description: "Deploy toxicity classifiers and content moderation pipelines",
                      status: "Implemented",
                    },
                    {
                      title: "Privacy Controls",
                      description: "PII detection and redaction in both inputs and outputs with audit logging",
                      status: "Implemented",
                    },
                    {
                      title: "Rate Limiting",
                      description: "Implement per-user and per-application rate limits to prevent abuse",
                      status: "Implemented",
                    },
                    {
                      title: "Human Review",
                      description: "Mandatory human oversight for high-stakes decisions in claims and underwriting",
                      status: "In Progress",
                    },
                  ].map((mitigation, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold">{mitigation.title}</h4>
                        <Badge
                          variant={mitigation.status === "Implemented" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {mitigation.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{mitigation.description}</p>
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
