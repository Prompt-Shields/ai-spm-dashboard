"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Database, MessageSquare, Server, Building2, Eye, AlertTriangle, CheckCircle2 } from "lucide-react"

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

// Simplified sample data
const modelsData = [
  {
    id: 1,
    name: "ChatGPT-5o",
    provider: "OpenAI",
    version: "5.0",
    type: "LLM",
    status: "Production",
    riskScore: 72,
    dataInputs: ["Customer queries", "Policy docs"],
    dataOutputs: ["Responses", "Summaries"],
  },
  {
    id: 2,
    name: "Claude Sonnet",
    provider: "Anthropic",
    version: "4.5",
    type: "LLM",
    status: "Production",
    riskScore: 65,
    dataInputs: ["Claims data", "Contracts"],
    dataOutputs: ["Analysis", "Reports"],
  },
  {
    id: 3,
    name: "DeepSeek R1",
    provider: "DeepSeek",
    version: "3.2",
    type: "LLM",
    status: "Pilot",
    riskScore: 78,
    dataInputs: ["Code", "Docs"],
    dataOutputs: ["Code", "Analysis"],
  },
  {
    id: 4,
    name: "Gemini 2.0",
    provider: "Google",
    version: "2.0",
    type: "Multimodal",
    status: "Testing",
    riskScore: 68,
    dataInputs: ["Images", "Text"],
    dataOutputs: ["Analysis", "Summaries"],
  },
  {
    id: 5,
    name: "Whisper v3",
    provider: "OpenAI",
    version: "3.0",
    type: "Speech",
    status: "Production",
    riskScore: 45,
    dataInputs: ["Audio"],
    dataOutputs: ["Transcripts"],
  },
]

const dataSourcesData = [
  {
    id: 1,
    name: "Customer Database",
    type: "PostgreSQL",
    classification: "Confidential",
    encryption: "AES-256",
    accessControl: "RBAC",
    gdprCompliant: true,
  },
  {
    id: 2,
    name: "Claims Repository",
    type: "MongoDB",
    classification: "Restricted",
    encryption: "AES-256",
    accessControl: "RBAC",
    gdprCompliant: true,
  },
  {
    id: 3,
    name: "Policy Documents",
    type: "S3",
    classification: "Internal",
    encryption: "AES-256",
    accessControl: "IAM",
    gdprCompliant: true,
  },
  {
    id: 4,
    name: "Analytics Lake",
    type: "Snowflake",
    classification: "Internal",
    encryption: "AES-256",
    accessControl: "RBAC",
    gdprCompliant: true,
  },
  {
    id: 5,
    name: "External APIs",
    type: "REST",
    classification: "Public",
    encryption: "TLS 1.3",
    accessControl: "API Keys",
    gdprCompliant: true,
  },
]

const promptsData = [
  {
    id: 1,
    name: "Customer Support",
    version: "2.1",
    riskLevel: "Low",
    injectionProtection: true,
    humanReview: false,
    usageCount: 45000,
  },
  {
    id: 2,
    name: "Claims Analysis",
    version: "1.8",
    riskLevel: "Medium",
    injectionProtection: true,
    humanReview: true,
    usageCount: 12000,
  },
  {
    id: 3,
    name: "Underwriting Assistant",
    version: "3.0",
    riskLevel: "High",
    injectionProtection: true,
    humanReview: true,
    usageCount: 8500,
  },
  {
    id: 4,
    name: "Document Summariser",
    version: "1.5",
    riskLevel: "Low",
    injectionProtection: true,
    humanReview: false,
    usageCount: 22000,
  },
  {
    id: 5,
    name: "Fraud Detection",
    version: "2.3",
    riskLevel: "High",
    injectionProtection: true,
    humanReview: true,
    usageCount: 6200,
  },
]

const infrastructureData = [
  {
    id: 1,
    name: "Azure OpenAI",
    type: "Cloud API",
    status: "Healthy",
    uptime: 99.9,
    monthlyCost: 45000,
    certifications: ["SOC 2", "ISO 27001"],
  },
  {
    id: 2,
    name: "AWS Bedrock",
    type: "Cloud API",
    status: "Healthy",
    uptime: 99.8,
    monthlyCost: 32000,
    certifications: ["SOC 2", "HIPAA"],
  },
  {
    id: 3,
    name: "GPU Cluster",
    type: "On-premise",
    status: "Healthy",
    uptime: 99.5,
    monthlyCost: 28000,
    certifications: ["ISO 27001"],
  },
  {
    id: 4,
    name: "Vector DB",
    type: "Managed",
    status: "Healthy",
    uptime: 99.7,
    monthlyCost: 8500,
    certifications: ["SOC 2"],
  },
  {
    id: 5,
    name: "ML Platform",
    type: "Hybrid",
    status: "Maintenance",
    uptime: 98.2,
    monthlyCost: 15000,
    certifications: ["SOC 2", "ISO 27001"],
  },
]

const vendorsData = [
  {
    id: 1,
    name: "OpenAI",
    contractEnd: "2025-12-31",
    slaUptime: 99.9,
    euAiActCompliant: "Partial",
    dataResidency: "US/EU",
    exitStrategy: "Documented",
  },
  {
    id: 2,
    name: "Anthropic",
    contractEnd: "2025-09-30",
    slaUptime: 99.5,
    euAiActCompliant: "Yes",
    dataResidency: "US",
    exitStrategy: "Documented",
  },
  {
    id: 3,
    name: "Google Cloud",
    contractEnd: "2026-03-31",
    slaUptime: 99.9,
    euAiActCompliant: "Yes",
    dataResidency: "EU",
    exitStrategy: "Documented",
  },
  {
    id: 4,
    name: "Microsoft Azure",
    contractEnd: "2026-06-30",
    slaUptime: 99.95,
    euAiActCompliant: "Yes",
    dataResidency: "Norway",
    exitStrategy: "Documented",
  },
  {
    id: 5,
    name: "DeepSeek",
    contractEnd: "2025-06-30",
    slaUptime: 99.0,
    euAiActCompliant: "No",
    dataResidency: "China",
    exitStrategy: "In Progress",
  },
]

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
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            AI Visibility
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            End-to-end visibility across models, data, prompts, infrastructure, and vendors
          </p>
        </div>

        {/* Summary Cards */}
        {/* Simplified summary cards */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Models</span>
            </div>
            <p className="text-2xl font-bold">{modelsData.length}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Data Sources</span>
            </div>
            <p className="text-2xl font-bold">{dataSourcesData.length}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Prompts</span>
            </div>
            <p className="text-2xl font-bold">{promptsData.length}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Server className="h-4 w-4 text-teal-500" />
              <span className="text-sm font-medium">Infrastructure</span>
            </div>
            <p className="text-2xl font-bold">{infrastructureData.length}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Vendors</span>
            </div>
            <p className="text-2xl font-bold">{vendorsData.length}</p>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="models" className="space-y-4">
          <TabsList>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
          </TabsList>

          {/* Models Tab */}
          <TabsContent value="models">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Models
                </CardTitle>
                <CardDescription>Deployed models with risk scores and data flows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {modelsData.map((model) => (
                    <div key={model.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{model.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {model.provider} · {model.type} · v{model.version}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={model.status === "Production" ? "default" : "secondary"}>
                            {model.status}
                          </Badge>
                          <Badge variant={model.riskScore > 70 ? "destructive" : "outline"}>
                            Risk: {model.riskScore}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Data Inputs</p>
                          <div className="flex flex-wrap gap-1">
                            {model.dataInputs.map((input, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {input}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Data Outputs</p>
                          <div className="flex flex-wrap gap-1">
                            {model.dataOutputs.map((output, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {output}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  Data Sources
                </CardTitle>
                <CardDescription>Data sources with classification and security controls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Classification</th>
                        <th className="text-left p-2">Encryption</th>
                        <th className="text-left p-2">Access</th>
                        <th className="text-left p-2">GDPR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataSourcesData.map((source) => (
                        <tr key={source.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{source.name}</td>
                          <td className="p-2 text-muted-foreground">{source.type}</td>
                          <td className="p-2">
                            <Badge
                              variant={
                                source.classification === "Restricted"
                                  ? "destructive"
                                  : source.classification === "Confidential"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {source.classification}
                            </Badge>
                          </td>
                          <td className="p-2">{source.encryption}</td>
                          <td className="p-2">{source.accessControl}</td>
                          <td className="p-2">
                            {source.gdprCompliant ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prompts Tab */}
          <TabsContent value="prompts">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                  Prompt Templates
                </CardTitle>
                <CardDescription>Prompt governance with risk levels and controls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Template</th>
                        <th className="text-left p-2">Version</th>
                        <th className="text-left p-2">Risk</th>
                        <th className="text-left p-2">Injection Protection</th>
                        <th className="text-left p-2">Human Review</th>
                        <th className="text-left p-2">Usage/mo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promptsData.map((prompt) => (
                        <tr key={prompt.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{prompt.name}</td>
                          <td className="p-2 text-muted-foreground">v{prompt.version}</td>
                          <td className="p-2">
                            <Badge
                              variant={
                                prompt.riskLevel === "High"
                                  ? "destructive"
                                  : prompt.riskLevel === "Medium"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {prompt.riskLevel}
                            </Badge>
                          </td>
                          <td className="p-2">
                            {prompt.injectionProtection ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            )}
                          </td>
                          <td className="p-2">
                            {prompt.humanReview ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-2">{prompt.usageCount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Infrastructure Tab */}
          <TabsContent value="infrastructure">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Server className="h-5 w-5 text-teal-500" />
                  Infrastructure
                </CardTitle>
                <CardDescription>Compute and platform services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {infrastructureData.map((infra) => (
                    <div key={infra.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{infra.name}</h3>
                          <p className="text-sm text-muted-foreground">{infra.type}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={infra.status === "Healthy" ? "default" : "secondary"}>{infra.status}</Badge>
                          <Badge variant="outline">{infra.uptime}% uptime</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex gap-1">
                          {infra.certifications.map((cert, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-muted-foreground">NOK {infra.monthlyCost.toLocaleString()}/mo</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vendors Tab */}
          <TabsContent value="vendors">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-500" />
                  AI Vendors
                </CardTitle>
                <CardDescription>Third-party providers with compliance status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Vendor</th>
                        <th className="text-left p-2">Contract End</th>
                        <th className="text-left p-2">SLA</th>
                        <th className="text-left p-2">EU AI Act</th>
                        <th className="text-left p-2">Data Residency</th>
                        <th className="text-left p-2">Exit Strategy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorsData.map((vendor) => (
                        <tr key={vendor.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{vendor.name}</td>
                          <td className="p-2 text-muted-foreground">{vendor.contractEnd}</td>
                          <td className="p-2">{vendor.slaUptime}%</td>
                          <td className="p-2">
                            <Badge
                              variant={
                                vendor.euAiActCompliant === "Yes"
                                  ? "default"
                                  : vendor.euAiActCompliant === "Partial"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {vendor.euAiActCompliant}
                            </Badge>
                          </td>
                          <td className="p-2">{vendor.dataResidency}</td>
                          <td className="p-2">
                            <Badge variant={vendor.exitStrategy === "Documented" ? "outline" : "secondary"}>
                              {vendor.exitStrategy}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
