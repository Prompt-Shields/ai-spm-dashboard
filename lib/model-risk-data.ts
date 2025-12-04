// Model Risk Context data and types

export type ModelProvider = "OpenAI" | "Anthropic" | "Google" | "Meta" | "Stability AI"
export type ModelCategory = "LLM" | "Image Generation" | "Speech"
export type ModelStatus = "Production" | "Testing" | "Deprecated"
export type RiskLevel = "Low Risk" | "Medium Risk" | "High Risk" | "Critical Risk"
export type AlertSeverity = "Low" | "Medium" | "High" | "Critical"

export interface ModelRiskProfile {
  modelId: string
  name: string
  provider: ModelProvider
  version: string
  category: ModelCategory
  parameters: string
  lastEvaluated: string
  status: ModelStatus

  // Risk scores (0-100, higher = more risk)
  overallRisk: number
  hallucinationRisk: number
  biasRisk: number
  toxicityRisk: number
  privacyRisk: number

  // Use cases
  approvedUseCases: string[]

  // Risk alerts
  alerts: ModelRiskAlert[]
}

export interface ModelRiskAlert {
  id: string
  type: "Hallucination" | "Bias" | "Toxicity" | "Privacy"
  severity: AlertSeverity
  description: string
  examples: string[]
  detectedDate: string
}

// Sample model risk profiles
export const modelRiskProfiles: ModelRiskProfile[] = [
  {
    modelId: "mrm-001",
    name: "GPT-4o",
    provider: "OpenAI",
    version: "1.0",
    category: "LLM",
    parameters: "1.8 trillion",
    lastEvaluated: "2024-03-15",
    status: "Production",
    overallRisk: 72,
    hallucinationRisk: 68,
    biasRisk: 75,
    toxicityRisk: 65,
    privacyRisk: 80,
    approvedUseCases: ["Customer Support", "Content Generation", "Code Assistance"],
    alerts: [
      {
        id: "alert-001",
        type: "Hallucination",
        severity: "Medium",
        description: "Tendency to generate plausible but incorrect information in specialised domains",
        examples: [
          "Generated incorrect medical advice when prompted about rare conditions",
          "Fabricated technical specifications for non-existent products",
        ],
        detectedDate: "2024-03-10",
      },
      {
        id: "alert-002",
        type: "Bias",
        severity: "Medium",
        description: "Detected gender bias in career recommendations and leadership descriptions",
        examples: [
          "Disproportionately suggested nursing roles for female candidates",
          "Used masculine pronouns when describing executive positions",
        ],
        detectedDate: "2024-03-12",
      },
      {
        id: "alert-003",
        type: "Privacy",
        severity: "High",
        description: "Potential memorisation of training data including personal information",
        examples: [
          "Reproduced verbatim text from publicly available sources with identifiable information",
          "Generated outputs containing patterns similar to email addresses and phone numbers",
        ],
        detectedDate: "2024-03-14",
      },
    ],
  },
  {
    modelId: "mrm-002",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    version: "3.0",
    category: "LLM",
    parameters: "Unknown",
    lastEvaluated: "2024-03-20",
    status: "Production",
    overallRisk: 58,
    hallucinationRisk: 52,
    biasRisk: 61,
    toxicityRisk: 48,
    privacyRisk: 70,
    approvedUseCases: ["Legal Analysis", "Research", "Content Moderation"],
    alerts: [
      {
        id: "alert-004",
        type: "Bias",
        severity: "Medium",
        description: "Cultural bias detected in translation and localisation tasks",
        examples: [
          "Favoured Western perspectives when translating idioms",
          "Applied US-centric interpretations to ambiguous legal terms",
        ],
        detectedDate: "2024-03-18",
      },
    ],
  },
  {
    modelId: "mrm-003",
    name: "Gemini Pro",
    provider: "Google",
    version: "1.5",
    category: "LLM",
    parameters: "540 billion",
    lastEvaluated: "2024-03-22",
    status: "Production",
    overallRisk: 65,
    hallucinationRisk: 62,
    biasRisk: 68,
    toxicityRisk: 58,
    privacyRisk: 72,
    approvedUseCases: ["Data Analysis", "Research", "Summarisation"],
    alerts: [
      {
        id: "alert-005",
        type: "Hallucination",
        severity: "Medium",
        description: "Generates confident but inaccurate statistical interpretations",
        examples: [
          "Misinterpreted correlation as causation in data analysis",
          "Provided incorrect confidence intervals for statistical tests",
        ],
        detectedDate: "2024-03-20",
      },
      {
        id: "alert-006",
        type: "Bias",
        severity: "Medium",
        description: "Geographic bias in search results and recommendations",
        examples: [
          "Prioritised US-based sources over international alternatives",
          "Applied regional stereotypes in cultural queries",
        ],
        detectedDate: "2024-03-21",
      },
    ],
  },
  {
    modelId: "mrm-004",
    name: "Llama 3 70B",
    provider: "Meta",
    version: "3.0",
    category: "LLM",
    parameters: "70 billion",
    lastEvaluated: "2024-03-18",
    status: "Testing",
    overallRisk: 78,
    hallucinationRisk: 82,
    biasRisk: 75,
    toxicityRisk: 72,
    privacyRisk: 78,
    approvedUseCases: ["Internal Testing", "Research"],
    alerts: [
      {
        id: "alert-007",
        type: "Hallucination",
        severity: "High",
        description: "Frequent fabrication of citations and references",
        examples: [
          "Created non-existent academic papers with realistic-looking citations",
          "Generated fake URLs and DOIs for research references",
        ],
        detectedDate: "2024-03-16",
      },
      {
        id: "alert-008",
        type: "Toxicity",
        severity: "Medium",
        description: "Occasionally generates inappropriate or offensive content",
        examples: [
          "Produced stereotypical descriptions when prompted about cultural groups",
          "Failed to reject some requests for harmful content generation",
        ],
        detectedDate: "2024-03-17",
      },
    ],
  },
  {
    modelId: "mrm-005",
    name: "Stable Diffusion XL",
    provider: "Stability AI",
    version: "1.0",
    category: "Image Generation",
    parameters: "3.5 billion",
    lastEvaluated: "2024-03-25",
    status: "Production",
    overallRisk: 85,
    hallucinationRisk: 0,
    biasRisk: 88,
    toxicityRisk: 82,
    privacyRisk: 85,
    approvedUseCases: ["Marketing Materials", "Design Prototyping"],
    alerts: [
      {
        id: "alert-009",
        type: "Bias",
        severity: "High",
        description: "Significant demographic bias in human representation",
        examples: [
          "Overrepresented certain ethnicities in professional contexts",
          "Stereotypical gender representations in career-related images",
        ],
        detectedDate: "2024-03-23",
      },
      {
        id: "alert-010",
        type: "Toxicity",
        severity: "High",
        description: "Can generate inappropriate or harmful imagery",
        examples: [
          "Insufficient filtering for violent content requests",
          "Generated stereotypical or offensive depictions despite content filters",
        ],
        detectedDate: "2024-03-24",
      },
    ],
  },
  {
    modelId: "mrm-006",
    name: "DALL-E 3",
    provider: "OpenAI",
    version: "3.0",
    category: "Image Generation",
    parameters: "Unknown",
    lastEvaluated: "2024-03-28",
    status: "Production",
    overallRisk: 68,
    hallucinationRisk: 0,
    biasRisk: 72,
    toxicityRisk: 58,
    privacyRisk: 75,
    approvedUseCases: ["Creative Design", "Marketing", "Prototyping"],
    alerts: [
      {
        id: "alert-011",
        type: "Bias",
        severity: "Medium",
        description: "Demographic representation bias in generated images",
        examples: ["Limited diversity in professional setting imagery", "Gender stereotypes in activity-based prompts"],
        detectedDate: "2024-03-26",
      },
    ],
  },
  {
    modelId: "mrm-007",
    name: "CodeLlama 34B",
    provider: "Meta",
    version: "1.0",
    category: "LLM",
    parameters: "34 billion",
    lastEvaluated: "2024-03-12",
    status: "Production",
    overallRisk: 55,
    hallucinationRisk: 58,
    biasRisk: 48,
    toxicityRisk: 42,
    privacyRisk: 72,
    approvedUseCases: ["Code Generation", "Code Review", "Development Support"],
    alerts: [
      {
        id: "alert-012",
        type: "Hallucination",
        severity: "Medium",
        description: "Generates non-existent APIs and library functions",
        examples: [
          "Suggested non-existent Python libraries for specific tasks",
          "Created plausible but incorrect API endpoints",
        ],
        detectedDate: "2024-03-10",
      },
      {
        id: "alert-013",
        type: "Privacy",
        severity: "Medium",
        description: "May reproduce code snippets from training data",
        examples: [
          "Generated code patterns highly similar to open-source projects",
          "Potential memorisation of common code templates with embedded credentials",
        ],
        detectedDate: "2024-03-11",
      },
    ],
  },
  {
    modelId: "mrm-008",
    name: "Whisper Large v3",
    provider: "OpenAI",
    version: "3.0",
    category: "Speech",
    parameters: "1.5 billion",
    lastEvaluated: "2024-03-30",
    status: "Production",
    overallRisk: 62,
    hallucinationRisk: 65,
    biasRisk: 58,
    toxicityRisk: 52,
    privacyRisk: 72,
    approvedUseCases: ["Transcription", "Accessibility", "Meeting Notes"],
    alerts: [
      {
        id: "alert-014",
        type: "Hallucination",
        severity: "Medium",
        description: "Fabricates speech content in low-quality audio",
        examples: [
          "Added non-existent words in noisy audio segments",
          "Inserted plausible but incorrect technical terms in poor quality recordings",
        ],
        detectedDate: "2024-03-28",
      },
      {
        id: "alert-015",
        type: "Bias",
        severity: "Medium",
        description: "Accent and dialect recognition disparities",
        examples: [
          "Lower accuracy for non-standard English accents",
          "Inconsistent performance across different demographic groups",
        ],
        detectedDate: "2024-03-29",
      },
    ],
  },
]

// Helper functions
export function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return "Critical Risk"
  if (score >= 65) return "High Risk"
  if (score >= 40) return "Medium Risk"
  return "Low Risk"
}

export function getRiskColor(score: number): string {
  if (score >= 80) return "bg-red-500"
  if (score >= 65) return "bg-orange-500"
  if (score >= 40) return "bg-yellow-500"
  return "bg-green-500"
}

export function getAlertIcon(type: ModelRiskAlert["type"]): string {
  switch (type) {
    case "Hallucination":
      return "⚠️"
    case "Bias":
      return "⚖️"
    case "Toxicity":
      return "☠️"
    case "Privacy":
      return "🔒"
    default:
      return "⚠️"
  }
}

// Statistics
export function getModelRiskStatistics() {
  const totalModels = modelRiskProfiles.length
  const modelsWithHallucinationAlerts = modelRiskProfiles.filter((m) =>
    m.alerts.some((a) => a.type === "Hallucination"),
  ).length
  const modelsWithBiasAlerts = modelRiskProfiles.filter((m) => m.alerts.some((a) => a.type === "Bias")).length
  const modelsWithToxicityAlerts = modelRiskProfiles.filter((m) => m.alerts.some((a) => a.type === "Toxicity")).length

  const avgOverallRisk = Math.round(modelRiskProfiles.reduce((sum, m) => sum + m.overallRisk, 0) / totalModels)
  const avgHallucinationRisk = Math.round(
    modelRiskProfiles.reduce((sum, m) => sum + m.hallucinationRisk, 0) / totalModels,
  )
  const avgBiasRisk = Math.round(modelRiskProfiles.reduce((sum, m) => sum + m.biasRisk, 0) / totalModels)
  const avgToxicityRisk = Math.round(modelRiskProfiles.reduce((sum, m) => sum + m.toxicityRisk, 0) / totalModels)
  const avgPrivacyRisk = Math.round(modelRiskProfiles.reduce((sum, m) => sum + m.privacyRisk, 0) / totalModels)

  return {
    totalModels,
    modelsWithHallucinationAlerts,
    modelsWithBiasAlerts,
    modelsWithToxicityAlerts,
    avgOverallRisk,
    avgHallucinationRisk,
    avgBiasRisk,
    avgToxicityRisk,
    avgPrivacyRisk,
  }
}
