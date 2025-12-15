"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  Database,
  MessageSquare,
  Server,
  Building2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  Zap,
  Lock,
  HardDrive,
} from "lucide-react"

// End-to-end AI visibility data
const aiModelsInventory = [
  {
    id: "model-1",
    name: "Claims Assessment AI",
    provider: "Internal (Azure OpenAI)",
    version: "v2.4.1",
    type: "Large Language Model",
    status: "production",
    lastUpdated: "2024-11-15",
    dataInputs: ["Claims forms", "Medical records", "Policy documents"],
    dataOutputs: ["Risk assessment", "Claim decision", "Fraud score"],
    promptTemplates: 12,
    monthlyInferences: 45200,
    latencyP95: "1.2s",
    costPerMonth: "NOK 78,500",
    complianceStatus: "compliant",
  },
  {
    id: "model-2",
    name: "Kundeservice Chatbot",
    provider: "Anthropic (Claude)",
    version: "claude-3-sonnet",
    type: "Conversational AI",
    status: "production",
    lastUpdated: "2024-10-22",
    dataInputs: ["Customer queries", "Policy data", "Account history"],
    dataOutputs: ["Response text", "Action triggers", "Sentiment score"],
    promptTemplates: 24,
    monthlyInferences: 156000,
    latencyP95: "0.8s",
    costPerMonth: "NOK 124,200",
    complianceStatus: "compliant",
  },
  {
    id: "model-3",
    name: "Underwriting Risk Engine",
    provider: "Internal (Custom ML)",
    version: "v3.1.0",
    type: "Risk Scoring Model",
    status: "production",
    lastUpdated: "2024-11-01",
    dataInputs: ["Application data", "Health records", "Financial history"],
    dataOutputs: ["Risk score", "Premium calculation", "Exclusions"],
    promptTemplates: 0,
    monthlyInferences: 8520,
    latencyP95: "2.4s",
    costPerMonth: "NOK 45,800",
    complianceStatus: "review-needed",
  },
  {
    id: "model-4",
    name: "Fraud Detection System",
    provider: "Internal (TensorFlow)",
    version: "v1.8.3",
    type: "Anomaly Detection",
    status: "production",
    lastUpdated: "2024-09-30",
    dataInputs: ["Transaction patterns", "Claims history", "Behavioral data"],
    dataOutputs: ["Fraud probability", "Alert triggers", "Investigation queue"],
    promptTemplates: 0,
    monthlyInferences: 34000,
    latencyP95: "0.3s",
    costPerMonth: "NOK 32,100",
    complianceStatus: "compliant",
  },
  {
    id: "model-5",
    name: "Document Processing AI",
    provider: "Google (Document AI)",
    version: "v1.2",
    type: "Document Understanding",
    status: "production",
    lastUpdated: "2024-11-08",
    dataInputs: ["Scanned documents", "PDFs", "Images"],
    dataOutputs: ["Extracted text", "Entity recognition", "Classification"],
    promptTemplates: 8,
    monthlyInferences: 28400,
    latencyP95: "3.1s",
    costPerMonth: "NOK 56,300",
    complianceStatus: "compliant",
  },
]

const dataSourcesInventory = [
  {
    id: "data-1",
    name: "Customer CRM Database",
    type: "Relational Database",
    classification: "confidential",
    location: "Azure Norway East",
    recordCount: "2.4M customers",
    refreshFrequency: "Real-time",
    retentionPeriod: "7 years",
    encryptionStatus: "AES-256 at rest, TLS 1.3 in transit",
    accessControls: "RBAC with MFA",
    gdprCompliant: true,
    connectedModels: ["model-2", "model-5"],
    lastAudit: "2024-10-15",
    dataOwner: "Customer Operations",
  },
  {
    id: "data-2",
    name: "Claims Processing System",
    type: "Document Store",
    classification: "restricted",
    location: "Azure Norway East",
    recordCount: "8.7M claims",
    refreshFrequency: "Real-time",
    retentionPeriod: "10 years",
    encryptionStatus: "AES-256 at rest, TLS 1.3 in transit",
    accessControls: "RBAC with MFA + IP whitelist",
    gdprCompliant: true,
    connectedModels: ["model-1", "model-4"],
    lastAudit: "2024-11-01",
    dataOwner: "Claims Department",
  },
  {
    id: "data-3",
    name: "Health Records Vault",
    type: "Encrypted Data Lake",
    classification: "restricted",
    location: "Azure Norway East (Isolated)",
    recordCount: "1.2M records",
    refreshFrequency: "Daily batch",
    retentionPeriod: "15 years",
    encryptionStatus: "AES-256 + HSM key management",
    accessControls: "Zero-trust + biometric",
    gdprCompliant: true,
    connectedModels: ["model-1", "model-3"],
    lastAudit: "2024-11-20",
    dataOwner: "Medical Underwriting",
  },
  {
    id: "data-4",
    name: "Actuarial Data Warehouse",
    type: "Analytics Database",
    classification: "confidential",
    location: "Azure Norway East",
    recordCount: "15 years historical",
    refreshFrequency: "Weekly",
    retentionPeriod: "Indefinite",
    encryptionStatus: "AES-256 at rest",
    accessControls: "RBAC + data masking",
    gdprCompliant: true,
    connectedModels: ["model-3", "model-4"],
    lastAudit: "2024-09-30",
    dataOwner: "Risk Analytics",
  },
  {
    id: "data-5",
    name: "External Market Data Feed",
    type: "API Integration",
    classification: "internal",
    location: "Third-party (Bloomberg)",
    recordCount: "Real-time feeds",
    refreshFrequency: "Continuous",
    retentionPeriod: "90 days",
    encryptionStatus: "TLS 1.3 in transit",
    accessControls: "API key + IP whitelist",
    gdprCompliant: true,
    connectedModels: [],
    lastAudit: "2024-10-01",
    dataOwner: "Investment Team",
  },
]

const promptsInventory = [
  {
    id: "prompt-1",
    name: "Claims Initial Assessment",
    model: "Claims Assessment AI",
    category: "Decision Support",
    version: "v3.2",
    lastModified: "2024-11-10",
    status: "approved",
    riskLevel: "high",
    injectionProtection: true,
    outputValidation: true,
    humanReview: "Required for >NOK 100k",
    avgTokens: 2400,
    description:
      "Evaluates incoming claims against policy terms and historical patterns to provide initial assessment.",
  },
  {
    id: "prompt-2",
    name: "Customer Query Response",
    model: "Kundeservice Chatbot",
    category: "Customer Service",
    version: "v5.1",
    lastModified: "2024-11-18",
    status: "approved",
    riskLevel: "medium",
    injectionProtection: true,
    outputValidation: true,
    humanReview: "Escalation triggers",
    avgTokens: 850,
    description: "Handles general customer inquiries with policy-aware responses in Norwegian and English.",
  },
  {
    id: "prompt-3",
    name: "Policy Terms Explanation",
    model: "Kundeservice Chatbot",
    category: "Information",
    version: "v2.8",
    lastModified: "2024-10-25",
    status: "approved",
    riskLevel: "low",
    injectionProtection: true,
    outputValidation: true,
    humanReview: "Not required",
    avgTokens: 1200,
    description: "Explains insurance policy terms and conditions in plain language.",
  },
  {
    id: "prompt-4",
    name: "Fraud Pattern Analysis",
    model: "Claims Assessment AI",
    category: "Risk Detection",
    version: "v1.4",
    lastModified: "2024-09-15",
    status: "approved",
    riskLevel: "high",
    injectionProtection: true,
    outputValidation: true,
    humanReview: "Always required",
    avgTokens: 3200,
    description: "Analyses claim submissions for fraud indicators and suspicious patterns.",
  },
  {
    id: "prompt-5",
    name: "Document Classification",
    model: "Document Processing AI",
    category: "Automation",
    version: "v2.0",
    lastModified: "2024-11-05",
    status: "approved",
    riskLevel: "low",
    injectionProtection: true,
    outputValidation: true,
    humanReview: "Sampling only",
    avgTokens: 600,
    description: "Classifies incoming documents by type and routes to appropriate processing queues.",
  },
  {
    id: "prompt-6",
    name: "Underwriting Summary",
    model: "Claims Assessment AI",
    category: "Decision Support",
    version: "v1.9",
    lastModified: "2024-10-30",
    status: "under-review",
    riskLevel: "high",
    injectionProtection: true,
    outputValidation: true,
    humanReview: "Always required",
    avgTokens: 2800,
    description: "Generates comprehensive underwriting summaries for complex applications.",
  },
]

const infrastructureInventory = [
  {
    id: "infra-1",
    name: "Azure OpenAI Service",
    type: "AI Platform",
    provider: "Microsoft Azure",
    region: "Norway East",
    status: "healthy",
    uptime: 99.97,
    lastIncident: "2024-08-12",
    securityCertifications: ["ISO 27001", "SOC 2", "GDPR"],
    networkIsolation: "Private endpoints",
    costPerMonth: "NOK 245,000",
    connectedModels: ["model-1", "model-2"],
    scalingPolicy: "Auto-scale 2-10 instances",
    backupStrategy: "Multi-region failover",
  },
  {
    id: "infra-2",
    name: "ML Training Cluster",
    type: "Compute Cluster",
    provider: "Microsoft Azure",
    region: "Norway East",
    status: "healthy",
    uptime: 99.89,
    lastIncident: "2024-10-03",
    securityCertifications: ["ISO 27001", "SOC 2"],
    networkIsolation: "VNet isolated",
    costPerMonth: "NOK 128,000",
    connectedModels: ["model-3", "model-4"],
    scalingPolicy: "On-demand GPU allocation",
    backupStrategy: "Model checkpointing",
  },
  {
    id: "infra-3",
    name: "Inference API Gateway",
    type: "API Management",
    provider: "Microsoft Azure",
    region: "Norway East + West Europe",
    status: "healthy",
    uptime: 99.99,
    lastIncident: "2024-05-22",
    securityCertifications: ["ISO 27001", "PCI DSS"],
    networkIsolation: "WAF protected",
    costPerMonth: "NOK 34,500",
    connectedModels: ["model-1", "model-2", "model-3", "model-4", "model-5"],
    scalingPolicy: "Global load balancing",
    backupStrategy: "Active-active failover",
  },
  {
    id: "infra-4",
    name: "Model Registry",
    type: "MLOps Platform",
    provider: "Azure ML",
    region: "Norway East",
    status: "healthy",
    uptime: 99.95,
    lastIncident: "2024-09-18",
    securityCertifications: ["ISO 27001"],
    networkIsolation: "Private endpoints",
    costPerMonth: "NOK 12,800",
    connectedModels: ["model-1", "model-2", "model-3", "model-4", "model-5"],
    scalingPolicy: "N/A",
    backupStrategy: "Geo-redundant storage",
  },
  {
    id: "infra-5",
    name: "Logging & Monitoring",
    type: "Observability",
    provider: "Azure Monitor + Datadog",
    region: "Norway East",
    status: "healthy",
    uptime: 99.98,
    lastIncident: "2024-07-09",
    securityCertifications: ["SOC 2", "GDPR"],
    networkIsolation: "Secure log forwarding",
    costPerMonth: "NOK 45,200",
    connectedModels: ["model-1", "model-2", "model-3", "model-4", "model-5"],
    scalingPolicy: "Auto-retention policies",
    backupStrategy: "90-day retention",
  },
]

const vendorAIInventory = [
  {
    id: "vendor-1",
    name: "Anthropic",
    service: "Claude API",
    contractStatus: "active",
    contractExpiry: "2025-12-31",
    annualSpend: "NOK 1,490,400",
    slaUptime: 99.9,
    actualUptime: 99.94,
    dataProcessingLocation: "EU (Ireland)",
    gdprDpa: true,
    aiActCompliant: true,
    securityAudit: "2024-09-15",
    riskRating: "low",
    primaryContact: "enterprise-support@anthropic.com",
    useCases: ["Customer chatbot", "Document summarisation"],
    exitStrategy: "Azure OpenAI fallback configured",
  },
  {
    id: "vendor-2",
    name: "Google Cloud",
    service: "Document AI + Vertex AI",
    contractStatus: "active",
    contractExpiry: "2025-06-30",
    annualSpend: "NOK 675,600",
    slaUptime: 99.95,
    actualUptime: 99.97,
    dataProcessingLocation: "EU (Finland)",
    gdprDpa: true,
    aiActCompliant: true,
    securityAudit: "2024-10-01",
    riskRating: "low",
    primaryContact: "cloud-support@google.com",
    useCases: ["Document processing", "OCR extraction"],
    exitStrategy: "Azure Form Recognizer alternative",
  },
  {
    id: "vendor-3",
    name: "Microsoft Azure",
    service: "Azure OpenAI + Azure ML",
    contractStatus: "active",
    contractExpiry: "2026-03-31",
    annualSpend: "NOK 4,476,000",
    slaUptime: 99.9,
    actualUptime: 99.87,
    dataProcessingLocation: "Norway East",
    gdprDpa: true,
    aiActCompliant: true,
    securityAudit: "2024-11-01",
    riskRating: "low",
    primaryContact: "azure-enterprise@microsoft.com",
    useCases: ["Claims AI", "Training infrastructure", "Model hosting"],
    exitStrategy: "Multi-cloud strategy in place",
  },
  {
    id: "vendor-4",
    name: "Datadog",
    service: "AI Observability",
    contractStatus: "active",
    contractExpiry: "2025-09-30",
    annualSpend: "NOK 542,400",
    slaUptime: 99.9,
    actualUptime: 99.96,
    dataProcessingLocation: "EU (Germany)",
    gdprDpa: true,
    aiActCompliant: true,
    securityAudit: "2024-08-20",
    riskRating: "low",
    primaryContact: "enterprise@datadoghq.com",
    useCases: ["Model monitoring", "Performance tracking"],
    exitStrategy: "Azure Monitor primary backup",
  },
  {
    id: "vendor-5",
    name: "Weights & Biases",
    service: "MLOps Platform",
    contractStatus: "evaluation",
    contractExpiry: "2025-03-31",
    annualSpend: "NOK 180,000",
    slaUptime: 99.5,
    actualUptime: 99.82,
    dataProcessingLocation: "EU (Ireland)",
    gdprDpa: true,
    aiActCompliant: "pending",
    securityAudit: "2024-11-15",
    riskRating: "medium",
    primaryContact: "sales@wandb.com",
    useCases: ["Experiment tracking", "Model versioning"],
    exitStrategy: "Azure ML native alternative",
  },
]

// Summary statistics
const visibilitySummary = {
  totalModels: aiModelsInventory.length,
  totalDataSources: dataSourcesInventory.length,
  totalPrompts: promptsInventory.length,
  totalInfrastructure: infrastructureInventory.length,
  totalVendors: vendorAIInventory.length,
  modelsInProduction: aiModelsInventory.filter((m) => m.status === "production").length,
  promptsApproved: promptsInventory.filter((p) => p.status === "approved").length,
  vendorsCompliant: vendorAIInventory.filter((v) => v.aiActCompliant === true).length,
  totalMonthlyInferences: aiModelsInventory.reduce((sum, m) => sum + m.monthlyInferences, 0),
  totalMonthlyCost: "NOK 2.1M",
  dataClassificationBreakdown: {
    restricted: dataSourcesInventory.filter((d) => d.classification === "restricted").length,
    confidential: dataSourcesInventory.filter((d) => d.classification === "confidential").length,
    internal: dataSourcesInventory.filter((d) => d.classification === "internal").length,
  },
}

export default function AIVisibilityPage() {
  const [selectedTab, setSelectedTab] = useState("models")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "production":
      case "healthy":
      case "active":
      case "approved":
      case "compliant":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case "review-needed":
      case "under-review":
      case "evaluation":
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Review Needed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "low":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Low Risk</Badge>
      case "medium":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Medium Risk</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High Risk</Badge>
      case "critical":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Critical Risk</Badge>
      default:
        return <Badge variant="secondary">{risk}</Badge>
    }
  }

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case "restricted":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Restricted</Badge>
      case "confidential":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Confidential</Badge>
      case "internal":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Internal</Badge>
      case "public":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Public</Badge>
      default:
        return <Badge variant="secondary">{classification}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-8 py-8 max-w-[1600px]">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">AI Visibility Dashboard</h1>
          </div>
          <p className="text-muted-foreground max-w-3xl">
            End-to-end visibility across Storebrand&apos;s AI ecosystem. Track models, data sources, prompts,
            infrastructure, and vendor relationships from a single unified view.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Brain className="h-4 w-4" />
                <span className="text-xs font-medium">AI Models</span>
              </div>
              <p className="text-2xl font-bold">{visibilitySummary.totalModels}</p>
              <p className="text-xs text-muted-foreground">{visibilitySummary.modelsInProduction} in production</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Database className="h-4 w-4" />
                <span className="text-xs font-medium">Data Sources</span>
              </div>
              <p className="text-2xl font-bold">{visibilitySummary.totalDataSources}</p>
              <p className="text-xs text-muted-foreground">
                {visibilitySummary.dataClassificationBreakdown.restricted} restricted
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs font-medium">Prompts</span>
              </div>
              <p className="text-2xl font-bold">{visibilitySummary.totalPrompts}</p>
              <p className="text-xs text-muted-foreground">{visibilitySummary.promptsApproved} approved</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-teal-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Server className="h-4 w-4" />
                <span className="text-xs font-medium">Infrastructure</span>
              </div>
              <p className="text-2xl font-bold">{visibilitySummary.totalInfrastructure}</p>
              <p className="text-xs text-muted-foreground">All healthy</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Building2 className="h-4 w-4" />
                <span className="text-xs font-medium">Vendors</span>
              </div>
              <p className="text-2xl font-bold">{visibilitySummary.totalVendors}</p>
              <p className="text-xs text-muted-foreground">{visibilitySummary.vendorsCompliant} AI Act compliant</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Zap className="h-4 w-4" />
                <span className="text-xs font-medium">Monthly Inferences</span>
              </div>
              <p className="text-2xl font-bold">{(visibilitySummary.totalMonthlyInferences / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground">{visibilitySummary.totalMonthlyCost} cost</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Models
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data
            </TabsTrigger>
            <TabsTrigger value="prompts" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Prompts
            </TabsTrigger>
            <TabsTrigger value="infrastructure" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Infra
            </TabsTrigger>
            <TabsTrigger value="vendors" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Vendors
            </TabsTrigger>
          </TabsList>

          {/* Models Tab */}
          <TabsContent value="models" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Models Inventory
                </CardTitle>
                <CardDescription>
                  Complete inventory of AI models deployed across Storebrand, including version tracking, performance
                  metrics, and compliance status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiModelsInventory.map((model) => (
                    <Card key={model.id} className="border bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">{model.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {model.provider} | {model.version}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(model.status)}
                            {getStatusBadge(model.complianceStatus)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Type</p>
                            <p className="font-medium">{model.type}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Monthly Inferences</p>
                            <p className="font-medium">{model.monthlyInferences.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Latency (P95)</p>
                            <p className="font-medium">{model.latencyP95}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Monthly Cost</p>
                            <p className="font-medium">{model.costPerMonth}</p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground mb-1">Data Inputs</p>
                              <div className="flex flex-wrap gap-1">
                                {model.dataInputs.map((input) => (
                                  <Badge key={input} variant="outline" className="text-xs">
                                    {input}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">Data Outputs</p>
                              <div className="flex flex-wrap gap-1">
                                {model.dataOutputs.map((output) => (
                                  <Badge key={output} variant="outline" className="text-xs">
                                    {output}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {model.promptTemplates} prompt templates
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Updated {model.lastUpdated}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  Data Sources Inventory
                </CardTitle>
                <CardDescription>
                  All data sources feeding into AI systems, with classification levels, access controls, and compliance
                  status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dataSourcesInventory.map((source) => (
                    <Card key={source.id} className="border bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">{source.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {source.type} | {source.location}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {getClassificationBadge(source.classification)}
                            {source.gdprCompliant && (
                              <Badge className="bg-green-100 text-green-800 border-green-200">GDPR Compliant</Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Records</p>
                            <p className="font-medium">{source.recordCount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Refresh</p>
                            <p className="font-medium">{source.refreshFrequency}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Retention</p>
                            <p className="font-medium">{source.retentionPeriod}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Owner</p>
                            <p className="font-medium">{source.dataOwner}</p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1 flex items-center gap-1">
                              <Lock className="h-3 w-3" /> Encryption
                            </p>
                            <p className="font-medium">{source.encryptionStatus}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1 flex items-center gap-1">
                              <Shield className="h-3 w-3" /> Access Controls
                            </p>
                            <p className="font-medium">{source.accessControls}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Brain className="h-3 w-3" />
                            {source.connectedModels.length} connected models
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last audit {source.lastAudit}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prompts Tab */}
          <TabsContent value="prompts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                  Prompt Templates Inventory
                </CardTitle>
                <CardDescription>
                  Governance and visibility over all prompt templates, including version control, risk classification,
                  and security controls.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {promptsInventory.map((prompt) => (
                    <Card key={prompt.id} className="border bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">{prompt.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {prompt.model} | {prompt.version}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(prompt.status)}
                            {getRiskBadge(prompt.riskLevel)}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">{prompt.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Category</p>
                            <p className="font-medium">{prompt.category}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avg Tokens</p>
                            <p className="font-medium">{prompt.avgTokens.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Human Review</p>
                            <p className="font-medium">{prompt.humanReview}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Last Modified</p>
                            <p className="font-medium">{prompt.lastModified}</p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {prompt.injectionProtection ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                            )}
                            <span className="text-sm">Injection Protection</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {prompt.outputValidation ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                            )}
                            <span className="text-sm">Output Validation</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Infrastructure Tab */}
          <TabsContent value="infrastructure" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-teal-500" />
                  AI Infrastructure Inventory
                </CardTitle>
                <CardDescription>
                  Compute, storage, and platform services supporting AI workloads, including health status, costs, and
                  security posture.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {infrastructureInventory.map((infra) => (
                    <Card key={infra.id} className="border bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">{infra.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {infra.provider} | {infra.region}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(infra.status)}
                            <Badge variant="outline">{infra.type}</Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-muted-foreground">Uptime</p>
                            <p className="font-medium">{infra.uptime}%</p>
                            <Progress value={infra.uptime} className="h-1 mt-1" />
                          </div>
                          <div>
                            <p className="text-muted-foreground">Monthly Cost</p>
                            <p className="font-medium">{infra.costPerMonth}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Last Incident</p>
                            <p className="font-medium">{infra.lastIncident}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Scaling</p>
                            <p className="font-medium">{infra.scalingPolicy}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1">Security Certifications</p>
                            <div className="flex flex-wrap gap-1">
                              {infra.securityCertifications.map((cert) => (
                                <Badge key={cert} variant="outline" className="text-xs">
                                  {cert}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Network Isolation</p>
                            <p className="font-medium">{infra.networkIsolation}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Brain className="h-3 w-3" />
                            {infra.connectedModels.length} connected models
                          </span>
                          <span className="flex items-center gap-1">
                            <HardDrive className="h-3 w-3" />
                            {infra.backupStrategy}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-500" />
                  AI Vendor Inventory
                </CardTitle>
                <CardDescription>
                  Third-party AI service providers, contract status, compliance posture, and exit strategies for vendor
                  risk management.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendorAIInventory.map((vendor) => (
                    <Card key={vendor.id} className="border bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">{vendor.name}</h4>
                            <p className="text-sm text-muted-foreground">{vendor.service}</p>
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(vendor.contractStatus)}
                            {getRiskBadge(vendor.riskRating)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-muted-foreground">Annual Spend</p>
                            <p className="font-medium">{vendor.annualSpend}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Contract Expiry</p>
                            <p className="font-medium">{vendor.contractExpiry}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">SLA Uptime</p>
                            <p className="font-medium">
                              {vendor.slaUptime}% (actual: {vendor.actualUptime}%)
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Data Location</p>
                            <p className="font-medium">{vendor.dataProcessingLocation}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-muted-foreground mb-1">Use Cases</p>
                            <div className="flex flex-wrap gap-1">
                              {vendor.useCases.map((useCase) => (
                                <Badge key={useCase} variant="outline" className="text-xs">
                                  {useCase}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Exit Strategy</p>
                            <p className="font-medium text-sm">{vendor.exitStrategy}</p>
                          </div>
                        </div>

                        <div className="pt-4 border-t flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {vendor.gdprDpa ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                            )}
                            <span className="text-sm">GDPR DPA</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {vendor.aiActCompliant === true ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : vendor.aiActCompliant === "pending" ? (
                              <Clock className="h-4 w-4 text-amber-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-sm">EU AI Act</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Last audit: {vendor.securityAudit}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
