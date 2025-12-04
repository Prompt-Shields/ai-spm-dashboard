// Model Risk Context data and types

export type ModelProvider = "OpenAI" | "Anthropic" | "Google" | "Meta" | "Stability AI" | "Mistral"
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
  securityRisk: number
  complianceRisk: number

  // Additional context
  strengths: string[]
  keyRisks: string[]

  // Use cases
  approvedUseCases: string[]

  // Risk alerts
  alerts: ModelRiskAlert[]

  // Warnings
  warnings: string[]
}

export interface ModelRiskAlert {
  id: string
  type: "Hallucination" | "Bias" | "Toxicity" | "Privacy" | "Security" | "Compliance"
  severity: AlertSeverity
  description: string
  examples: string[]
  detectedDate: string
}

export const modelRiskProfiles: ModelRiskProfile[] = [
  {
    modelId: "mrm-001",
    name: "ChatGPT-5o",
    provider: "OpenAI",
    version: "1.0",
    category: "LLM",
    parameters: "1.8 trillion",
    lastEvaluated: "2024-03-15",
    status: "Production",
    overallRisk: 70,
    hallucinationRisk: 68,
    biasRisk: 75,
    toxicityRisk: 65,
    privacyRisk: 70,
    securityRisk: 55,
    complianceRisk: 65,
    strengths: [
      "Excellent reasoning and instruction following",
      "Large ecosystem, high compatibility with enterprise workflows",
      "Strong safety research commitment",
      "Option for strict enterprise isolation",
    ],
    keyRisks: [
      "Output drift across releases (operational risk)",
      "Moderate hallucination under domain-specific queries",
      "Privacy risk if not used in enterprise mode",
      "Jailbreak attempts still possible despite strong guardrails",
    ],
    approvedUseCases: ["Customer Support", "Knowledge Work Support", "Code Assistance", "Document Analysis"],
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
        severity: "Medium",
        description: "Potential memorisation of training data including personal information",
        examples: [
          "Reproduced verbatim text from publicly available sources with identifiable information",
          "Generated outputs containing patterns similar to email addresses and phone numbers",
        ],
        detectedDate: "2024-03-14",
      },
    ],
    warnings: ["Not suitable for high-regulation outputs (legal, compliance, finance) without human review"],
  },
  {
    modelId: "mrm-002",
    name: "Claude Sonnet",
    provider: "Anthropic",
    version: "3.0",
    category: "LLM",
    parameters: "Unknown",
    lastEvaluated: "2024-03-20",
    status: "Production",
    overallRisk: 45,
    hallucinationRisk: 40,
    biasRisk: 60,
    toxicityRisk: 48,
    privacyRisk: 30,
    securityRisk: 25,
    complianceRisk: 40,
    strengths: [
      "Best-in-class safety and robustness",
      "Lower hallucination rate than GPT models",
      "Excellent at long-context reasoning",
      "Strong privacy and governance transparency",
    ],
    keyRisks: [
      "Sometimes overly cautious (under-generates)",
      "Bias patterns less documented",
      "Limited fine-grained control compared with OpenAI",
    ],
    approvedUseCases: [
      "Policy-Sensitive Outputs",
      "Compliance-Related Use Cases",
      "Legal Research Support",
      "Enterprise-Wide Safe Defaults",
    ],
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
    warnings: ["Slow or conservative responses may frustrate power-users expecting GPT-5o-level creativity"],
  },
  {
    modelId: "mrm-003",
    name: "DeepSeek R1",
    provider: "Meta",
    version: "1.0",
    category: "LLM",
    parameters: "Unknown",
    lastEvaluated: "2024-03-22",
    status: "Testing",
    overallRisk: 85,
    hallucinationRisk: 75,
    biasRisk: 70,
    toxicityRisk: 58,
    privacyRisk: 85,
    securityRisk: 80,
    complianceRisk: 90,
    strengths: [
      "High performance on coding and maths",
      "Aggressive optimisation and cost-effectiveness",
      "Growing open-source community",
    ],
    keyRisks: [
      "Unclear training provenance (IP risk)",
      "Higher hallucination in open-ended domains",
      "Fewer safety layers → increased jailbreak risk",
      "Unknown data-handling practices → high privacy risk",
      "Regulatory risk for EU/US enterprises",
    ],
    approvedUseCases: ["Local/Offline Inference Only", "Internal R&D Exploration", "Non-Sensitive Internal Workloads"],
    alerts: [
      {
        id: "alert-005",
        type: "Privacy",
        severity: "High",
        description: "Unknown data-handling practices pose high privacy risk",
        examples: ["Unclear training data provenance", "No transparency on data retention policies"],
        detectedDate: "2024-03-20",
      },
      {
        id: "alert-006",
        type: "Compliance",
        severity: "Critical",
        description: "Regulatory risk for EU/US enterprises",
        examples: ["May not meet GDPR requirements", "Unclear compliance with industry regulations"],
        detectedDate: "2024-03-21",
      },
      {
        id: "alert-007",
        type: "Security",
        severity: "High",
        description: "Increased jailbreak risk due to fewer safety layers",
        examples: ["Can generate harmful content with specific prompting", "Limited content filtering capabilities"],
        detectedDate: "2024-03-22",
      },
    ],
    warnings: ["Not recommended for regulated industries or customer-facing applications"],
  },
  {
    modelId: "mrm-004",
    name: "Gemini 2.0 Pro",
    provider: "Google",
    version: "2.0",
    category: "LLM",
    parameters: "540 billion",
    lastEvaluated: "2024-03-22",
    status: "Production",
    overallRisk: 65,
    hallucinationRisk: 65,
    biasRisk: 70,
    toxicityRisk: 58,
    privacyRisk: 60,
    securityRisk: 55,
    complianceRisk: 60,
    strengths: [
      "Strong factual grounding via Google Search integration",
      "Excellent multimodal understanding",
      "Deep integration with enterprise tooling (Workspace, Android)",
    ],
    keyRisks: [
      "Search-linked outputs may mix real-time data with incomplete grounding",
      "Moderate hallucination rate",
      "Privacy risk depending on Workspace settings",
      "Limited transparency in model training",
    ],
    approvedUseCases: ["Email Summarisation", "Document Analysis", "Internal Productivity Use Cases"],
    alerts: [
      {
        id: "alert-008",
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
        id: "alert-009",
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
    warnings: ["Search-augmented answers require validation"],
  },
  {
    modelId: "mrm-005",
    name: "Mistral Large",
    provider: "Mistral",
    version: "2.0",
    category: "LLM",
    parameters: "123 billion",
    lastEvaluated: "2024-03-18",
    status: "Production",
    overallRisk: 58,
    hallucinationRisk: 60,
    biasRisk: 65,
    toxicityRisk: 55,
    privacyRisk: 45,
    securityRisk: 60,
    complianceRisk: 50,
    strengths: [
      "EU-friendly governance posture",
      "Cost-effective",
      "High performance on structured tasks",
      "Suitable for on-prem use",
    ],
    keyRisks: [
      "Smaller safety/alignment budget compared with US models",
      "Moderate hallucination outside reasoning tasks",
      "Dependency on enterprise to harden security",
    ],
    approvedUseCases: ["Local Secure Inference", "Regulated-Industry Deployments", "Multi-Model Orchestration Stacks"],
    alerts: [
      {
        id: "alert-010",
        type: "Security",
        severity: "Medium",
        description: "Requires internal governance and monitoring",
        examples: ["Limited built-in safety guardrails", "Needs enterprise-level security hardening"],
        detectedDate: "2024-03-16",
      },
    ],
    warnings: ["Requires internal governance and monitoring"],
  },
  {
    modelId: "mrm-006",
    name: "Llama 3.1 70B",
    provider: "Meta",
    version: "3.1",
    category: "LLM",
    parameters: "70 billion",
    lastEvaluated: "2024-03-18",
    status: "Production",
    overallRisk: 60,
    hallucinationRisk: 62,
    biasRisk: 68,
    toxicityRisk: 55,
    privacyRisk: 40,
    securityRisk: 70,
    complianceRisk: 55,
    strengths: [
      "Fully transparent and self-hostable",
      "Cost-effective at scale",
      "Very high controllability and fine-tuning potential",
    ],
    keyRisks: [
      "Enterprises bear full responsibility for safety, privacy, alignment",
      "Jailbreak risk if not hardened",
      "Training datasets still partly unclear",
      "Moderate hallucination",
    ],
    approvedUseCases: ["Custom Vertical Models", "On-Prem Secure Inference", "Large Enterprise RAG Systems"],
    alerts: [
      {
        id: "alert-011",
        type: "Security",
        severity: "Medium",
        description: "Jailbreak risk if not properly hardened",
        examples: [
          "Can generate inappropriate content without proper safeguards",
          "Requires custom safety layers for production use",
        ],
        detectedDate: "2024-03-16",
      },
      {
        id: "alert-012",
        type: "Hallucination",
        severity: "Medium",
        description: "Moderate hallucination in open-ended tasks",
        examples: ["Generates plausible but incorrect factual information", "May fabricate citations and references"],
        detectedDate: "2024-03-17",
      },
    ],
    warnings: ["Safety outcomes depend entirely on internal controls"],
  },
  {
    modelId: "mrm-007",
    name: "Whisper Large v3",
    provider: "OpenAI",
    version: "3.0",
    category: "Speech",
    parameters: "1.5 billion",
    lastEvaluated: "2024-03-30",
    status: "Production",
    overallRisk: 60,
    hallucinationRisk: 40,
    biasRisk: 70,
    toxicityRisk: 52,
    privacyRisk: 75,
    securityRisk: 55,
    complianceRisk: 60,
    strengths: [
      "Industry-leading transcription accuracy",
      "Multi-language support",
      "Robust to audio quality variations",
    ],
    keyRisks: [
      "Transcription errors may lead to misinterpreted instructions",
      "Sensitive audio data exposure",
      "Not suitable for regulated medical or legal dictation without review",
    ],
    approvedUseCases: ["Transcription", "Customer Service", "Meeting Intelligence"],
    alerts: [
      {
        id: "alert-013",
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
        id: "alert-014",
        type: "Bias",
        severity: "Medium",
        description: "Accent and dialect recognition disparities",
        examples: [
          "Lower accuracy for non-standard English accents",
          "Inconsistent performance across different demographic groups",
        ],
        detectedDate: "2024-03-29",
      },
      {
        id: "alert-015",
        type: "Privacy",
        severity: "High",
        description: "Sensitive audio data exposure risk",
        examples: [
          "Audio contains personally identifiable information",
          "Risk of data retention beyond expected lifecycle",
        ],
        detectedDate: "2024-03-30",
      },
    ],
    warnings: ["Not suitable for regulated medical or legal dictation without review"],
  },
  {
    modelId: "mrm-008",
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
    securityRisk: 75,
    complianceRisk: 80,
    strengths: ["High-quality image generation", "Open-source and customisable", "Strong community support"],
    keyRisks: [
      "Significant demographic bias in human representation",
      "Can generate inappropriate or harmful imagery",
      "Limited content filtering",
    ],
    approvedUseCases: ["Marketing Materials", "Design Prototyping"],
    alerts: [
      {
        id: "alert-016",
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
        id: "alert-017",
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
    warnings: ["Requires strict content moderation for public-facing applications"],
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
    case "Security":
      return "🛡️"
    case "Compliance":
      return "📋"
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
