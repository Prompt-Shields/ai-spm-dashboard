"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { modelRiskProfiles, getRiskLevel } from "@/lib/model-risk-data"
import {
  AlertTriangle,
  Shield,
  CheckCircle2,
  XCircle,
  Info,
  DollarSign,
  Building2,
  Globe,
  ExternalLink,
  Cpu,
  Calendar,
  Activity,
} from "lucide-react"

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
  "mrm-001": [
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
  "mrm-002": [
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
  "mrm-003": [
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
  "mrm-004": [
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
  "mrm-005": [
    {
      name: "Europeisk Compliance Sjekk",
      description: "EU regulatory compliance verification",
      department: "Legal & Compliance",
      usageType: "Production",
      monthlyQueries: 4200,
      status: "Active",
    },
    {
      name: "Kontraktsanalyse",
      description: "Contract analysis and risk flagging",
      department: "Legal",
      usageType: "Pilot",
      monthlyQueries: 1800,
      status: "Testing",
    },
  ],
  "mrm-006": [
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
  "mrm-007": [
    {
      name: "Samtaletranskribering",
      description: "Customer call transcription and analysis",
      department: "Customer Service",
      usageType: "Production",
      monthlyQueries: 22000,
      status: "Active",
    },
    {
      name: "Møtenotat Generator",
      description: "Automated meeting transcription and summaries",
      department: "All Departments",
      usageType: "Production",
      monthlyQueries: 8500,
      status: "Active",
    },
  ],
  "mrm-008": [
    {
      name: "Markedsføringsbilder",
      description: "Marketing image generation and editing",
      department: "Marketing",
      usageType: "Internal Tool",
      monthlyQueries: 1500,
      status: "Active",
    },
    {
      name: "Produktvisualisering",
      description: "Insurance product visualisation for presentations",
      department: "Sales",
      usageType: "Pilot",
      monthlyQueries: 800,
      status: "Testing",
    },
  ],
}

const publicAppsData: Record<
  string,
  Array<{
    name: string
    description: string
    category: string
    users: string
    website: string
  }>
> = {
  "mrm-001": [
    {
      name: "Microsoft Copilot",
      description: "AI assistant integrated into Microsoft 365 suite for productivity",
      category: "Productivity",
      users: "100M+",
      website: "copilot.microsoft.com",
    },
    {
      name: "Duolingo Max",
      description: "AI-powered language learning with roleplay and explanations",
      category: "Education",
      users: "50M+",
      website: "duolingo.com",
    },
    {
      name: "Khan Academy Khanmigo",
      description: "AI tutor for personalised learning and homework help",
      category: "Education",
      users: "10M+",
      website: "khanacademy.org",
    },
    {
      name: "Stripe Docs AI",
      description: "Intelligent documentation search and code generation",
      category: "Developer Tools",
      users: "5M+",
      website: "stripe.com",
    },
    {
      name: "Intercom Fin",
      description: "AI customer service agent for support automation",
      category: "Customer Service",
      users: "25K+ businesses",
      website: "intercom.com",
    },
  ],
  "mrm-002": [
    {
      name: "Notion AI",
      description: "AI writing assistant integrated into Notion workspace",
      category: "Productivity",
      users: "30M+",
      website: "notion.so",
    },
    {
      name: "Quora Poe",
      description: "Multi-model AI chat platform with Claude integration",
      category: "Chat Platform",
      users: "10M+",
      website: "poe.com",
    },
    {
      name: "DuckDuckGo AI Chat",
      description: "Privacy-focused AI chat with Claude",
      category: "Search & Chat",
      users: "50M+",
      website: "duckduckgo.com",
    },
    {
      name: "Sourcegraph Cody",
      description: "AI coding assistant for code understanding and generation",
      category: "Developer Tools",
      users: "1M+",
      website: "sourcegraph.com",
    },
  ],
  "mrm-003": [
    {
      name: "Perplexity AI",
      description: "AI-powered search engine with DeepSeek integration",
      category: "Search",
      users: "15M+",
      website: "perplexity.ai",
    },
    {
      name: "Poe by Quora",
      description: "Multi-model chat platform offering DeepSeek access",
      category: "Chat Platform",
      users: "10M+",
      website: "poe.com",
    },
    {
      name: "OpenRouter",
      description: "AI model routing platform with DeepSeek V3.2",
      category: "Developer Platform",
      users: "500K+",
      website: "openrouter.ai",
    },
    {
      name: "Cursor IDE",
      description: "AI-first code editor with DeepSeek for coding tasks",
      category: "Developer Tools",
      users: "1M+",
      website: "cursor.com",
    },
    {
      name: "Jan.ai",
      description: "Open-source desktop app for local AI with DeepSeek support",
      category: "Local AI",
      users: "200K+",
      website: "jan.ai",
    },
  ],
  "mrm-004": [
    {
      name: "Google Workspace AI",
      description: "AI features in Gmail, Docs, Sheets powered by Gemini",
      category: "Productivity",
      users: "3B+",
      website: "workspace.google.com",
    },
    {
      name: "Google Search AI Overview",
      description: "AI-generated search summaries and answers",
      category: "Search",
      users: "4B+",
      website: "google.com",
    },
    {
      name: "Android AI Features",
      description: "On-device AI for photos, messages, and accessibility",
      category: "Mobile OS",
      users: "2B+",
      website: "android.com",
    },
    {
      name: "Grammarly",
      description: "AI writing assistant with Gemini-powered suggestions",
      category: "Writing",
      users: "30M+",
      website: "grammarly.com",
    },
  ],
  "mrm-005": [
    {
      name: "Le Chat by Mistral",
      description: "Official Mistral AI chatbot with web search",
      category: "Chat Platform",
      users: "5M+",
      website: "chat.mistral.ai",
    },
    {
      name: "Brave Search AI",
      description: "Privacy-focused search with Mistral AI answers",
      category: "Search",
      users: "25M+",
      website: "search.brave.com",
    },
    {
      name: "Hugging Face Chat",
      description: "Open-source chat platform featuring Mistral models",
      category: "Developer Platform",
      users: "2M+",
      website: "huggingface.co",
    },
    {
      name: "Dust.tt",
      description: "Enterprise AI assistant platform using Mistral",
      category: "Enterprise",
      users: "10K+ businesses",
      website: "dust.tt",
    },
  ],
  "mrm-006": [
    {
      name: "Meta AI",
      description: "AI assistant in Facebook, Instagram, WhatsApp, Messenger",
      category: "Social Media",
      users: "3B+",
      website: "meta.ai",
    },
    {
      name: "Groq Cloud",
      description: "Ultra-fast inference platform featuring Llama models",
      category: "Developer Platform",
      users: "500K+",
      website: "groq.com",
    },
    {
      name: "Together AI",
      description: "AI cloud platform with optimised Llama hosting",
      category: "Developer Platform",
      users: "100K+",
      website: "together.ai",
    },
    {
      name: "Ollama",
      description: "Local AI runtime for running Llama on personal devices",
      category: "Local AI",
      users: "1M+",
      website: "ollama.com",
    },
    {
      name: "Replicate",
      description: "ML model hosting platform with Llama deployment",
      category: "Developer Platform",
      users: "200K+",
      website: "replicate.com",
    },
  ],
  "mrm-007": [
    {
      name: "Otter.ai",
      description: "AI meeting transcription and note-taking service",
      category: "Productivity",
      users: "25M+",
      website: "otter.ai",
    },
    {
      name: "Descript",
      description: "AI-powered audio/video editing with transcription",
      category: "Media Production",
      users: "5M+",
      website: "descript.com",
    },
    {
      name: "Riverside.fm",
      description: "Podcast recording platform with AI transcription",
      category: "Media Production",
      users: "2M+",
      website: "riverside.fm",
    },
    {
      name: "Grain",
      description: "AI meeting recorder for sales and customer success",
      category: "Sales Tools",
      users: "500K+",
      website: "grain.com",
    },
    {
      name: "MacWhisper",
      description: "Native macOS app for local audio transcription",
      category: "Desktop App",
      users: "100K+",
      website: "goodsnooze.gumroad.com",
    },
  ],
  "mrm-008": [
    {
      name: "Canva AI",
      description: "AI image generation and editing in design platform",
      category: "Design",
      users: "150M+",
      website: "canva.com",
    },
    {
      name: "DreamStudio",
      description: "Official Stability AI image generation platform",
      category: "Image Generation",
      users: "10M+",
      website: "dreamstudio.ai",
    },
    {
      name: "NightCafe Studio",
      description: "AI art generator community platform",
      category: "Art & Creative",
      users: "5M+",
      website: "nightcafe.studio",
    },
    {
      name: "Clipdrop",
      description: "AI-powered image editing and generation tools",
      category: "Image Editing",
      users: "15M+",
      website: "clipdrop.co",
    },
    {
      name: "Leonardo.ai",
      description: "AI image generation for game assets and art",
      category: "Game Development",
      users: "8M+",
      website: "leonardo.ai",
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
    monthlyEstimate: string
    notes: string
  }
> = {
  "mrm-001": {
    inputCost: "$2.50 per million tokens",
    outputCost: "$10.00 per million tokens",
    contextWindow: "128,000 tokens",
    pricingModel: "Pay-per-use API",
    monthlyEstimate: "~NOK 45,000",
    notes: "Enterprise tier available with volume discounts. Data processing addendum required for GDPR compliance.",
  },
  "mrm-002": {
    inputCost: "$3.00 per million tokens",
    outputCost: "$15.00 per million tokens",
    contextWindow: "200,000 tokens",
    pricingModel: "Pay-per-use API",
    monthlyEstimate: "~NOK 38,000",
    notes: "Anthropic offers enterprise agreements with dedicated support. Strong data privacy commitments.",
  },
  "mrm-003": {
    inputCost: "$0.24 per million tokens",
    outputCost: "$0.38 per million tokens",
    contextWindow: "163,840 tokens",
    pricingModel: "Pay-per-use API (via OpenRouter)",
    monthlyEstimate: "~NOK 5,200",
    notes:
      "Significantly cheaper than Western alternatives. Access via OpenRouter or direct API. No enterprise SLA available.",
  },
  "mrm-004": {
    inputCost: "$1.25 per million tokens",
    outputCost: "$5.00 per million tokens",
    contextWindow: "1,000,000 tokens",
    pricingModel: "Pay-per-use API",
    monthlyEstimate: "~NOK 22,000",
    notes: "Google Cloud integration available. 1M context window ideal for large document processing.",
  },
  "mrm-005": {
    inputCost: "$2.00 per million tokens",
    outputCost: "$6.00 per million tokens",
    contextWindow: "128,000 tokens",
    pricingModel: "Pay-per-use API",
    monthlyEstimate: "~NOK 15,000",
    notes: "EU-based company with strong GDPR alignment. Self-hosting option available for sensitive workloads.",
  },
  "mrm-006": {
    inputCost: "$0.70 per million tokens",
    outputCost: "$0.90 per million tokens",
    contextWindow: "128,000 tokens",
    pricingModel: "Self-hosted / Cloud API",
    monthlyEstimate: "~NOK 8,500",
    notes:
      "Open-source model - can be self-hosted for zero API costs. Infrastructure costs apply for on-premise deployment.",
  },
  "mrm-007": {
    inputCost: "$0.006 per minute of audio",
    outputCost: "N/A (audio input only)",
    contextWindow: "30 second chunks",
    pricingModel: "Per-minute audio processing",
    monthlyEstimate: "~NOK 12,000",
    notes: "Can be self-hosted for privacy. Processing time varies with audio quality and language.",
  },
  "mrm-008": {
    inputCost: "$0.002 per image (prompt)",
    outputCost: "$0.02 per image generated",
    contextWindow: "N/A (image model)",
    pricingModel: "Per-image generation",
    monthlyEstimate: "~NOK 3,500",
    notes: "Fully self-hostable. Fine-tuning available for brand-specific imagery. Content moderation recommended.",
  },
}

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

  const sampleApps = sampleAppsData[selectedModel.modelId] || []
  const publicApps = publicAppsData[selectedModel.modelId] || []
  const pricing = modelPricing[selectedModel.modelId]

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Model Risk Context</h1>
          <p className="text-muted-foreground">
            Assess AI model behaviour, safety metrics, and deployment risks for Storebrand&apos;s approved models
          </p>
        </div>

        {/* Model Selector with Risk Score */}
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Dropdown Selector */}
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Select Model</label>
                <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                  <SelectTrigger className="w-full lg:w-[400px]">
                    <SelectValue placeholder="Choose a model to assess" />
                  </SelectTrigger>
                  <SelectContent>
                    {modelRiskProfiles.map((model) => (
                      <SelectItem key={model.modelId} value={model.modelId}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-muted-foreground">({model.provider})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Overall Risk Score Display */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Overall Risk Score</p>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-4xl font-bold ${
                        selectedModel.overallRisk >= 65
                          ? "text-red-600"
                          : selectedModel.overallRisk >= 40
                            ? "text-yellow-600"
                            : "text-green-600"
                      }`}
                    >
                      {selectedModel.overallRisk}
                    </span>
                    <span className="text-2xl text-muted-foreground">/100</span>
                    <Badge variant={getRiskBadgeVariant(selectedModel.overallRisk)} className="ml-2">
                      {getRiskLevel(selectedModel.overallRisk)}
                    </Badge>
                  </div>
                </div>

                {/* Quick Status Indicators */}
                <div className="hidden lg:flex items-center gap-4 pl-6 border-l">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant={selectedModel.status === "Production" ? "default" : "secondary"}>
                      {selectedModel.status}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Provider</p>
                    <p className="font-medium text-sm">{selectedModel.provider}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Last Evaluated</p>
                    <p className="font-medium text-sm">{selectedModel.lastEvaluated}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Dimension Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              {[
                { label: "Hallucination", score: selectedModel.hallucinationRisk, icon: AlertTriangle },
                { label: "Bias", score: selectedModel.biasRisk, icon: Activity },
                { label: "Toxicity", score: selectedModel.toxicityRisk, icon: Shield },
                { label: "Privacy", score: selectedModel.privacyRisk, icon: Shield },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span
                      className={`text-sm font-bold ${item.score >= 65 ? "text-red-600" : item.score >= 40 ? "text-yellow-600" : "text-green-600"}`}
                    >
                      {item.score}/100
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getRiskBarColor(item.score)} transition-all`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Approved Use Cases - Prominent Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <CardTitle>Approved Use Cases at Storebrand</CardTitle>
            </div>
            <CardDescription>
              These use cases have been reviewed and approved for deployment with {selectedModel.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(selectedModel.approvedUseCases || []).map((useCase, index) => (
                <Badge key={index} variant="outline" className="bg-green-50 border-green-200 text-green-800 px-3 py-1">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {useCase}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Model Details</TabsTrigger>
            <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
            <TabsTrigger value="apps">Sample Apps</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="mitigations">Mitigations</TabsTrigger>
          </TabsList>

          {/* Model Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Model Information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-primary" />
                    <CardTitle>Model Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedModel.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Provider</p>
                      <p className="font-medium">{selectedModel.provider}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Version</p>
                      <p className="font-medium">{selectedModel.version}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{selectedModel.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Parameters</p>
                      <p className="font-medium">{selectedModel.parameters}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={selectedModel.status === "Production" ? "default" : "secondary"}>
                        {selectedModel.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Warnings */}
              {selectedModel.warnings && selectedModel.warnings.length > 0 && (
                <Card className="border-amber-200 bg-amber-50/50">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <CardTitle className="text-amber-800">Warnings</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedModel.warnings.map((warning, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-amber-800">
                          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Strengths and Weaknesses */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <CardTitle>Strengths</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(selectedModel.strengths || []).map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <CardTitle>Weaknesses</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(selectedModel.weaknesses || []).map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Risk Assessment Tab */}
          <TabsContent value="risk" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Detailed Risk Scores */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Scores by Category</CardTitle>
                  <CardDescription>Detailed breakdown of risk metrics for {selectedModel.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      label: "Hallucination Risk",
                      score: selectedModel.hallucinationRisk,
                      desc: "Tendency to generate false information",
                    },
                    {
                      label: "Bias Risk",
                      score: selectedModel.biasRisk,
                      desc: "Potential for unfair or prejudiced outputs",
                    },
                    {
                      label: "Toxicity Risk",
                      score: selectedModel.toxicityRisk,
                      desc: "Risk of generating harmful content",
                    },
                    {
                      label: "Privacy Risk",
                      score: selectedModel.privacyRisk,
                      desc: "Data leakage and privacy concerns",
                    },
                    {
                      label: "Security Risk",
                      score: selectedModel.securityRisk,
                      desc: "Vulnerability to adversarial attacks",
                    },
                    {
                      label: "Compliance Risk",
                      score: selectedModel.complianceRisk,
                      desc: "Regulatory and policy compliance issues",
                    },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{item.score}/100</span>
                          <Badge variant={getRiskBadgeVariant(item.score)} className="text-xs">
                            {getRiskLevel(item.score)}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={item.score} className={`h-2 ${getRiskBarColor(item.score)}`} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Risk Alerts */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <CardTitle>Active Risk Alerts</CardTitle>
                  </div>
                  <CardDescription>Detected issues requiring attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(selectedModel.alerts || []).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${
                        alert.severity === "Critical"
                          ? "bg-red-50 border-red-200"
                          : alert.severity === "High"
                            ? "bg-orange-50 border-orange-200"
                            : "bg-yellow-50 border-yellow-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            className={`h-4 w-4 ${
                              alert.severity === "Critical"
                                ? "text-red-600"
                                : alert.severity === "High"
                                  ? "text-orange-600"
                                  : "text-yellow-600"
                            }`}
                          />
                          <span className="font-medium">{alert.type} Alert</span>
                        </div>
                        <Badge
                          variant={
                            alert.severity === "Critical"
                              ? "destructive"
                              : alert.severity === "High"
                                ? "destructive"
                                : "warning"
                          }
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{alert.description}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Detected: {alert.detectedDate}
                      </div>
                    </div>
                  ))}
                  {(!selectedModel.alerts || selectedModel.alerts.length === 0) && (
                    <p className="text-muted-foreground text-center py-4">No active alerts for this model</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sample Apps Tab */}
          <TabsContent value="apps" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Internal Storebrand Apps */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle>Storebrand Internal Applications</CardTitle>
                  </div>
                  <CardDescription>Applications deployed within Storebrand using {selectedModel.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {sampleApps.length > 0 ? (
                    <div className="space-y-4">
                      {sampleApps.map((app, index) => (
                        <div key={index} className="p-4 rounded-lg border bg-muted/20">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold">{app.name}</h4>
                            <Badge variant={app.status === "Active" ? "success" : "secondary"}>{app.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{app.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Department:</span>{" "}
                              <span className="font-medium">{app.department}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Type:</span>{" "}
                              <span className="font-medium">{app.usageType}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Monthly Queries:</span>{" "}
                              <span className="font-medium">{app.monthlyQueries.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No internal applications currently deployed with this model
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Public Apps */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <CardTitle>Public Applications</CardTitle>
                  </div>
                  <CardDescription>Well-known applications using {selectedModel.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {publicApps.length > 0 ? (
                    <div className="space-y-4">
                      {publicApps.map((app, index) => (
                        <div key={index} className="p-4 rounded-lg border bg-blue-50/30">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold">{app.name}</h4>
                            <Badge variant="outline">{app.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{app.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              Users: <span className="font-medium text-foreground">{app.users}</span>
                            </span>
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
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No public application data available for this model
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <CardTitle>Pricing Information for {selectedModel.name}</CardTitle>
                </div>
                <CardDescription>
                  Cost structure and estimated monthly expenditure based on current Storebrand usage patterns
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
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Provider Notes</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{pricing.notes}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Pricing information not available for this model.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mitigations Tab */}
          <TabsContent value="mitigations" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <CardTitle>Risk Mitigation Strategies</CardTitle>
                </div>
                <CardDescription>
                  Recommended controls and safeguards for deploying {selectedModel.name} at Storebrand
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      title: "Output Validation",
                      description:
                        "Implement automated fact-checking and human review workflows for high-stakes outputs",
                      priority: "High",
                    },
                    {
                      title: "Access Controls",
                      description: "Restrict model access to approved personnel with role-based permissions",
                      priority: "High",
                    },
                    {
                      title: "Monitoring & Logging",
                      description: "Deploy comprehensive logging for all model interactions and outputs",
                      priority: "Medium",
                    },
                    {
                      title: "Rate Limiting",
                      description: "Implement usage quotas to control costs and prevent misuse",
                      priority: "Medium",
                    },
                    {
                      title: "Content Filtering",
                      description: "Apply input/output filters to prevent harmful or inappropriate content",
                      priority: "High",
                    },
                    {
                      title: "Regular Audits",
                      description: "Schedule quarterly reviews of model performance and risk metrics",
                      priority: "Medium",
                    },
                    {
                      title: "Incident Response",
                      description: "Establish clear procedures for handling model failures or security incidents",
                      priority: "High",
                    },
                    {
                      title: "User Training",
                      description: "Provide training on responsible AI use and limitation awareness",
                      priority: "Low",
                    },
                  ].map((mitigation, index) => (
                    <div key={index} className="p-4 rounded-lg border bg-green-50/30">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{mitigation.title}</h4>
                        <Badge
                          variant={
                            mitigation.priority === "High"
                              ? "destructive"
                              : mitigation.priority === "Medium"
                                ? "warning"
                                : "secondary"
                          }
                        >
                          {mitigation.priority}
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
