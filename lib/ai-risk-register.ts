export interface AIRiskCategory {
  id: string
  name: string
  description: string
  businessImpact: string[]
  likelihood: "Low" | "Medium" | "High" | "Very High"
  detectionChallenges: string[]
  recommendedControls: string[]
  severity: "Low" | "Medium" | "High" | "Critical"
}

export const aiRiskRegister: AIRiskCategory[] = [
  {
    id: "risk-001",
    name: "Prompt Injection & Instruction Manipulation",
    description:
      "Attackers manipulate AI systems by embedding malicious instructions into user inputs, documents, emails, or retrieved content, causing the AI to bypass safeguards or take unauthorised actions.",
    businessImpact: [
      "Data leakage (PII, IP, credentials)",
      "Unauthorised system actions",
      "Compliance breaches (GDPR, internal policy)",
      "Loss of trust in AI-driven services",
    ],
    likelihood: "High",
    detectionChallenges: [
      "Malicious prompts often look statistically similar to benign inputs",
      "Traditional security tools do not inspect AI context or prompt flow",
    ],
    recommendedControls: [
      "Prompt filtering calibrated for risk, not keywords",
      "System-level instruction hardening",
      "Continuous adversarial testing of prompt surfaces",
    ],
    severity: "Critical",
  },
  {
    id: "risk-002",
    name: "RAG Data Poisoning",
    description:
      "Attackers insert malicious or misleading content into knowledge bases or document stores used by AI systems, influencing outputs without modifying the model itself.",
    businessImpact: [
      "Incorrect or harmful AI responses",
      "Regulatory and reputational exposure",
      "Decisions based on compromised authoritative data",
    ],
    likelihood: "Medium",
    detectionChallenges: ["Poisoned documents may not appear malicious", "AI responses remain fluent and confident"],
    recommendedControls: [
      "Validation and monitoring of ingested data",
      "Retrieval-layer logging and anomaly detection",
      "Red-team simulation of poisoning scenarios",
    ],
    severity: "High",
  },
  {
    id: "risk-003",
    name: "AI Agent Autonomy & Worm Propagation",
    description:
      "AI agents operating autonomously can replicate and propagate malicious instructions across systems, workflows, or other agents, creating self-spreading attacks without traditional malware.",
    businessImpact: [
      "Rapid lateral spread of compromise",
      "Cascading system failures",
      "Loss of control over automated processes",
    ],
    likelihood: "Medium",
    detectionChallenges: [
      "Attacks live in text, context, and memory rather than binaries",
      "Existing EDR and malware tools are ineffective",
    ],
    recommendedControls: [
      "Strict agent privilege boundaries",
      "Context sanitisation between agents",
      "Simulation of agent-to-agent attack paths",
    ],
    severity: "High",
  },
  {
    id: "risk-004",
    name: "Cloud & Infrastructure Misuse by AI",
    description:
      "AI systems increasingly manage cloud resources and infrastructure decisions, introducing non-deterministic behaviour into security-critical operations.",
    businessImpact: [
      "Data leakage due to misconfiguration",
      "Excessive cost exposure",
      "Accidental privilege escalation",
    ],
    likelihood: "Medium",
    detectionChallenges: [
      "AI actions are difficult to audit retrospectively",
      "Failures can cascade faster than human response times",
    ],
    recommendedControls: [
      "Least-privilege enforcement for AI-controlled resources",
      "Strong audit trails for AI-driven changes",
      "Infrastructure-level adversarial testing",
    ],
    severity: "High",
  },
  {
    id: "risk-005",
    name: "Backend & Database Integrity Compromise",
    description:
      "Traditional vulnerabilities (e.g. SQL injection) allow attackers to alter or poison data that AI systems rely on, effectively compromising the AI indirectly.",
    businessImpact: ["Corrupted AI outputs", "Silent data manipulation", "Long-term model degradation"],
    likelihood: "Medium",
    detectionChallenges: [
      "Data poisoning is harder to detect than data theft",
      "AI systems trust corrupted data as ground truth",
    ],
    recommendedControls: [
      "Automated penetration testing",
      "Strict input validation and parameterised queries",
      "Monitoring for abnormal data patterns affecting AI outputs",
    ],
    severity: "High",
  },
  {
    id: "risk-006",
    name: "AI Reasoning Errors & Silent Failures",
    description:
      "AI reasoning models can make incorrect decisions while presenting confident, coherent explanations, masking underlying errors.",
    businessImpact: [
      "Faulty decision-making at scale",
      "Legal and regulatory exposure",
      "Over-reliance on AI judgement",
    ],
    likelihood: "High",
    detectionChallenges: ["Errors are subtle, not catastrophic", "Chain-of-thought explanations can be misleading"],
    recommendedControls: [
      "Task difficulty scoring and routing",
      "Human-in-the-loop for high-risk decisions",
      "Stress-testing reasoning under adversarial prompts",
    ],
    severity: "Medium",
  },
  {
    id: "risk-007",
    name: "Model Memorisation & Privacy Leakage",
    description:
      "AI models can memorise sensitive information during training or fine-tuning and later reveal it under certain prompts.",
    businessImpact: [
      "Breach of personal or confidential data",
      "GDPR and contractual violations",
      "Loss of customer trust",
    ],
    likelihood: "Medium",
    detectionChallenges: ["Leakage occurs without database access", "Difficult to audit model internals"],
    recommendedControls: [
      "Training data governance",
      "Post-training model audits",
      "Model editing or sanitisation techniques",
    ],
    severity: "High",
  },
  {
    id: "risk-008",
    name: "Scale Asymmetry (AI-Enabled Attackers)",
    description:
      "Attackers use AI to automate reconnaissance, exploitation, and learning, dramatically increasing attack speed and volume.",
    businessImpact: ["Increased attack frequency", "Faster exploit discovery", "Defensive teams overwhelmed"],
    likelihood: "High",
    detectionChallenges: [
      "Attacks appear normal but occur at scale",
      "SOC tooling not designed for AI-driven pressure",
    ],
    recommendedControls: [
      "Automated, continuous security validation",
      "Shift from annual pentests to ongoing adversarial testing",
      "AI-aware threat modelling",
    ],
    severity: "Critical",
  },
  {
    id: "risk-009",
    name: "Fragmented Security Coverage",
    description:
      "Organisations secure individual AI components (models, prompts, infrastructure) but fail to address risks arising from interactions between layers.",
    businessImpact: [
      "False sense of security",
      "Blind spots exploited by attackers",
      "Ineffective risk reporting to the board",
    ],
    likelihood: "High",
    detectionChallenges: ["No single tool provides end-to-end visibility", "Risks emerge across organisational silos"],
    recommendedControls: [
      "Layered security framework for AI systems",
      "Digital twin or simulation-based testing",
      "Consolidated AI risk reporting",
    ],
    severity: "High",
  },
]

export interface NetworkNode {
  id: string
  label: string
  type: "model" | "database" | "api" | "user" | "infrastructure"
  riskLevel: "low" | "medium" | "high" | "critical"
  department: string
  connections: string[]
}

export const networkTopology: NetworkNode[] = [
  {
    id: "node-001",
    label: "CustomerServiceGPT",
    type: "model",
    riskLevel: "high",
    department: "Customer Support",
    connections: ["node-010", "node-011", "node-015"],
  },
  {
    id: "node-002",
    label: "LegalDocReviewer",
    type: "model",
    riskLevel: "low",
    department: "Legal",
    connections: ["node-012", "node-015"],
  },
  {
    id: "node-003",
    label: "HealthcareAnalytics",
    type: "model",
    riskLevel: "critical",
    department: "Healthcare",
    connections: ["node-013", "node-014", "node-015"],
  },
  {
    id: "node-004",
    label: "MarketingCopilot",
    type: "model",
    riskLevel: "critical",
    department: "Marketing",
    connections: ["node-010", "node-016"],
  },
  {
    id: "node-005",
    label: "FraudDetector",
    type: "model",
    riskLevel: "low",
    department: "Risk Management",
    connections: ["node-012", "node-014", "node-015"],
  },
  {
    id: "node-010",
    label: "Customer Database",
    type: "database",
    riskLevel: "high",
    department: "IT",
    connections: [],
  },
  {
    id: "node-011",
    label: "Public API",
    type: "api",
    riskLevel: "medium",
    department: "IT",
    connections: [],
  },
  {
    id: "node-012",
    label: "Financial DB",
    type: "database",
    riskLevel: "high",
    department: "Finance",
    connections: [],
  },
  {
    id: "node-013",
    label: "PHI Database",
    type: "database",
    riskLevel: "critical",
    department: "Healthcare",
    connections: [],
  },
  {
    id: "node-014",
    label: "Azure Cloud",
    type: "infrastructure",
    riskLevel: "medium",
    department: "IT",
    connections: [],
  },
  {
    id: "node-015",
    label: "AWS Infrastructure",
    type: "infrastructure",
    riskLevel: "medium",
    department: "IT",
    connections: [],
  },
  {
    id: "node-016",
    label: "External Users",
    type: "user",
    riskLevel: "high",
    department: "External",
    connections: [],
  },
]
