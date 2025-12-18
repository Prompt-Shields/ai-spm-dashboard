// Model Risk Context data and types

export type ModelProvider = "OpenAI" | "Anthropic" | "Google" | "Meta" | "Stability AI" | "Mistral" | "DeepSeek"
export type ModelCategory = "LLM" | "Image Generation" | "Speech"
export type ModelStatus = "Production" | "Testing" | "Deprecated" | "Evaluation"
export type RiskLevel = "Low Risk" | "Medium Risk" | "High Risk" | "Critical Risk"
export type AlertSeverity = "Low" | "Medium" | "High" | "Critical"

export interface DeepSeekApplication {
  rank: number
  name: string
  description: string
  tokensUsed: string
  useContext: string
}

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
  weaknesses: string[]
  keyRisks: string[]

  // Use cases
  approvedUseCases: string[]

  // Risk alerts
  alerts: ModelRiskAlert[]

  // Warnings
  warnings: string[]

  applications?: DeepSeekApplication[]
  pricing?: any
}

export interface ModelRiskAlert {
  id: string
  type: "Hallucination" | "Bias" | "Toxicity" | "Privacy" | "Security" | "Compliance"
  severity: AlertSeverity
  description: string
  examples: string[]
  detectedDate: string
}

export const deepSeekPricing = {
  model: "DeepSeek V3.2",
  contextWindow: "163,840 tokens",
  inputCost: "$0.24 per million tokens",
  outputCost: "$0.38 per million tokens",
  pricingModel: "Pay-per-use API pricing based on token consumption",
  notes:
    "Pricing applies via OpenRouter API. Enterprise and volume discounts may be available through direct contracts.",
}

export const deepSeekApplications: DeepSeekApplication[] = [
  {
    rank: 1,
    name: "Gobii",
    description: "Web browsing agents that are always on",
    tokensUsed: "31.7B tokens",
    useContext: "Autonomous web agents for browsing, research, and data extraction tasks",
  },
  {
    rank: 2,
    name: "Janitor AI",
    description: "Character chat and creation",
    tokensUsed: "10.4B tokens",
    useContext: "Interactive character-based conversations and roleplay applications",
  },
  {
    rank: 3,
    name: "New API",
    description: "Unified AI framework",
    tokensUsed: "6.83B tokens",
    useContext: "API aggregation layer for multi-model orchestration and routing",
  },
  {
    rank: 4,
    name: "Chub AI",
    description: "GenAI for everyone",
    tokensUsed: "4.43B tokens",
    useContext: "Consumer-facing generative AI platform for creative content",
  },
  {
    rank: 5,
    name: "SillyTavern",
    description: "LLM frontend for power users",
    tokensUsed: "4.3B tokens",
    useContext: "Advanced LLM interface with customisation and multi-model support",
  },
  {
    rank: 6,
    name: "liteLLM",
    description: "Open-source library to simplify LLM integrations",
    tokensUsed: "1.79B tokens",
    useContext: "Developer tooling for unified LLM API access and proxy management",
  },
  {
    rank: 7,
    name: "Kilo Code",
    description: "AI coding agent for VS Code",
    tokensUsed: "896M tokens",
    useContext: "IDE-integrated coding assistance and code generation",
  },
  {
    rank: 8,
    name: "Cline",
    description: "Autonomous coding agent right in your IDE",
    tokensUsed: "870M tokens",
    useContext: "Autonomous code writing, debugging, and refactoring agent",
  },
  {
    rank: 9,
    name: "shapes inc",
    description: "General purpose social agents",
    tokensUsed: "850M tokens",
    useContext: "Social AI agents for community engagement and interaction",
  },
  {
    rank: 10,
    name: "Roo Code",
    description: "A whole dev team of AI agents in your IDE",
    tokensUsed: "652M tokens",
    useContext: "Multi-agent coding system for complex development workflows",
  },
  {
    rank: 11,
    name: "easemate.ai",
    description: "AI assistant for study, work, and creativity",
    tokensUsed: "519M tokens",
    useContext: "Productivity assistant for students and professionals",
  },
  {
    rank: 12,
    name: "Fish Audio",
    description: "The most realistic text-to-speech platform",
    tokensUsed: "496M tokens",
    useContext: "Audio generation and voice synthesis applications",
  },
  {
    rank: 13,
    name: "Sophias Lorebary",
    description: "Unofficial JanitorAI extension with advanced features",
    tokensUsed: "450M tokens",
    useContext: "Enhanced character interaction and lore management",
  },
  {
    rank: 14,
    name: "Open WebUI",
    description: "Extensible, self-hosted AI interface",
    tokensUsed: "222M tokens",
    useContext: "Self-hosted LLM interface for privacy-conscious deployments",
  },
  {
    rank: 15,
    name: "Pollar News",
    description: "AI-powered news aggregation and analysis",
    tokensUsed: "203M tokens",
    useContext: "News summarisation and content curation platform",
  },
  {
    rank: 16,
    name: "BLACKBOXAI",
    description: "AI agent for builders",
    tokensUsed: "180M tokens",
    useContext: "Development automation and code generation for builders",
  },
  {
    rank: 17,
    name: "Telegram Lead Scanner",
    description: "Automated lead generation via Telegram",
    tokensUsed: "159M tokens",
    useContext: "Business automation for lead capture and qualification",
  },
  {
    rank: 18,
    name: "SkyrimNet",
    description: "AI-powered gaming companion",
    tokensUsed: "158M tokens",
    useContext: "Gaming NPC dialogue and interactive storytelling",
  },
  {
    rank: 19,
    name: "Miniapps.ai",
    description: "Create and use mini AI-powered apps",
    tokensUsed: "153M tokens",
    useContext: "Low-code AI application builder and marketplace",
  },
  {
    rank: 20,
    name: "DeckCheck",
    description: "AI-powered presentation review",
    tokensUsed: "152M tokens",
    useContext: "Presentation analysis and improvement suggestions",
  },
]

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
    weaknesses: [
      "Output drift across releases may cause inconsistent behaviour",
      "High cost compared to open-source alternatives",
      "Dependent on OpenAI infrastructure availability",
      "Limited customisation without fine-tuning access",
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
        severity: "Low",
        description: "Potential for memorised training data leakage",
        examples: ["Occasionally reproduces verbatim text from training data"],
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
    weaknesses: [
      "Sometimes overly cautious, refusing valid requests",
      "Slower response times than competitors",
      "Limited fine-tuning and customisation options",
      "Higher latency on complex reasoning tasks",
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
    provider: "DeepSeek",
    version: "3.2",
    category: "LLM",
    parameters: "671 billion (37B active MoE)",
    lastEvaluated: "2024-03-25",
    status: "Evaluation",
    overallRisk: 78,
    hallucinationRisk: 75,
    biasRisk: 70,
    toxicityRisk: 58,
    privacyRisk: 85,
    securityRisk: 80,
    complianceRisk: 90,
    strengths: [
      "High performance on coding and maths (GPT-5 class reasoning)",
      "Gold-medal results on 2025 IMO and IOI competitions",
      "Aggressive optimisation and cost-effectiveness ($0.24/M input, $0.38/M output)",
      "163,840 token context window with DeepSeek Sparse Attention (DSA)",
      "Strong agentic tool-use capabilities",
      "Growing open-source community",
    ],
    weaknesses: [
      "China-based provider raises geopolitical and data sovereignty concerns",
      "Unclear training data provenance poses intellectual property risk",
      "Limited safety guardrails compared to Western models",
      "No enterprise SLA or support guarantees",
      "Regulatory uncertainty for EU/EEA deployments",
    ],
    keyRisks: [
      "Unclear training provenance (IP risk)",
      "Higher hallucination in open-ended domains",
      "Fewer safety layers → increased jailbreak risk",
      "Unknown data-handling practices → high privacy risk",
      "Regulatory risk for EU/US enterprises",
      "China-based provider raises geopolitical concerns",
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
    applications: deepSeekApplications,
    pricing: deepSeekPricing,
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
    overallRisk: 52,
    hallucinationRisk: 55,
    biasRisk: 58,
    toxicityRisk: 50,
    privacyRisk: 60,
    securityRisk: 45,
    complianceRisk: 55,
    strengths: [
      "Superior multi-modal capabilities",
      "1M token context window ideal for large documents",
      "Strong math and code reasoning",
      "Excellent integration with Google Cloud ecosystem",
    ],
    weaknesses: [
      "Google data practices may conflict with strict privacy requirements",
      "Less mature enterprise tooling compared to OpenAI",
      "Inconsistent performance across different task types",
      "Limited third-party integration ecosystem",
    ],
    keyRisks: [
      "Google data practices may conflict with strict privacy needs",
      "Less established enterprise track record",
      "May hallucinate on niche domain queries",
    ],
    approvedUseCases: ["Multimodal Document Analysis", "Image-to-Text", "Long Context Research", "Code Reviews"],
    alerts: [
      {
        id: "alert-008",
        type: "Privacy",
        severity: "Medium",
        description: "Google data practices may not align with enterprise privacy policies",
        examples: ["Potential data retention by Google", "Cross-service data usage concerns"],
        detectedDate: "2024-03-20",
      },
      {
        id: "alert-009",
        type: "Hallucination",
        severity: "Medium",
        description: "May hallucinate on niche domain queries",
        examples: ["Generated fictional legal precedents", "Invented technical specifications for legacy systems"],
        detectedDate: "2024-03-21",
      },
    ],
    warnings: ["Verify Google Cloud data residency meets regulatory requirements"],
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
    weaknesses: [
      "Smaller safety research team than US competitors",
      "Less comprehensive documentation and support",
      "Moderate hallucination outside core reasoning tasks",
      "Limited enterprise deployment track record",
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
    weaknesses: [
      "Requires significant in-house ML expertise to deploy safely",
      "No vendor support or SLA guarantees",
      "Enterprise bears full responsibility for safety alignment",
      "Infrastructure costs for self-hosting can be substantial",
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
        examples: ["Can be prompted to bypass safety guidelines", "Requires custom safety layers"],
        detectedDate: "2024-03-16",
      },
      {
        id: "alert-012",
        type: "Bias",
        severity: "Medium",
        description: "Training data biases require monitoring",
        examples: [
          "May reflect biases present in web training data",
          "Requires custom debiasing for sensitive applications",
        ],
        detectedDate: "2024-03-17",
      },
    ],
    warnings: ["Requires dedicated ML ops team for safe deployment"],
  },
  {
    modelId: "mrm-007",
    name: "Whisper Large v3",
    provider: "OpenAI",
    version: "3.0",
    category: "Speech",
    parameters: "1.5 billion",
    lastEvaluated: "2024-03-15",
    status: "Production",
    overallRisk: 35,
    hallucinationRisk: 30,
    biasRisk: 45,
    toxicityRisk: 20,
    privacyRisk: 55,
    securityRisk: 30,
    complianceRisk: 40,
    strengths: [
      "Industry-leading speech recognition accuracy",
      "Excellent multilingual support including Norwegian",
      "Robust to background noise and accents",
      "Can be self-hosted for privacy compliance",
    ],
    weaknesses: [
      "Audio data processing raises privacy concerns",
      "May struggle with heavy dialects or technical jargon",
      "No real-time streaming support in base model",
      "Requires significant compute for on-premise deployment",
    ],
    keyRisks: [
      "Audio data may contain sensitive personal information",
      "Transcription errors in domain-specific terminology",
      "Data retention policies unclear for cloud deployment",
    ],
    approvedUseCases: [
      "Customer Call Transcription",
      "Meeting Notes Generation",
      "Voice-to-Text for Accessibility",
      "Claims Call Analysis",
    ],
    alerts: [
      {
        id: "alert-013",
        type: "Privacy",
        severity: "Medium",
        description: "Audio data processing requires careful data handling",
        examples: ["Customer conversations may contain PII", "Voice biometrics could enable identification"],
        detectedDate: "2024-03-14",
      },
    ],
    warnings: ["Ensure audio data handling complies with GDPR and local regulations"],
  },
  {
    modelId: "mrm-008",
    name: "Stable Diffusion XL",
    provider: "Stability AI",
    version: "1.0",
    category: "Image Generation",
    parameters: "6.6 billion",
    lastEvaluated: "2024-03-10",
    status: "Production",
    overallRisk: 48,
    hallucinationRisk: 25,
    biasRisk: 70,
    toxicityRisk: 65,
    privacyRisk: 35,
    securityRisk: 40,
    complianceRisk: 60,
    strengths: [
      "High-quality image generation",
      "Fully self-hostable for complete data control",
      "Extensive customisation through fine-tuning",
      "Large community and ecosystem of tools",
    ],
    weaknesses: [
      "Can generate inappropriate or biased imagery",
      "Copyright concerns with training data",
      "Requires content moderation guardrails",
      "May produce inconsistent brand imagery without fine-tuning",
    ],
    keyRisks: [
      "Can generate inappropriate content without guardrails",
      "Training data may include copyrighted material",
      "Bias in generated imagery (demographics, stereotypes)",
      "Brand reputation risk from misuse",
    ],
    approvedUseCases: [
      "Marketing Asset Generation",
      "Internal Presentations",
      "Prototype Visualisation",
      "Non-Customer-Facing Content Only",
    ],
    alerts: [
      {
        id: "alert-014",
        type: "Bias",
        severity: "High",
        description: "Demographic bias in generated imagery",
        examples: ["Underrepresentation of diverse demographics", "Stereotypical depictions of certain professions"],
        detectedDate: "2024-03-08",
      },
      {
        id: "alert-015",
        type: "Compliance",
        severity: "Medium",
        description: "Copyright concerns with training data",
        examples: [
          "May reproduce styles of copyrighted works",
          "Unclear legal status for commercial use in some jurisdictions",
        ],
        detectedDate: "2024-03-09",
      },
    ],
    warnings: ["Implement content moderation before any customer-facing deployment"],
  },
]

// Helper functions
export function getRiskLevel(score: number): string {
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
