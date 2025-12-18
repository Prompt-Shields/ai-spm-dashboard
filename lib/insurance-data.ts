// Insurance-specific AI governance data

export interface InsuranceAIRiskCategory {
  id: string
  name: string
  description: string
  insuranceImpact: string[]
  regulatoryFramework: string[]
  likelihood: "Low" | "Medium" | "High" | "Very High"
  detectionChallenges: string[]
  recommendedControls: string[]
  severity: "Low" | "Medium" | "High" | "Critical"
  companyContext: string
}

export const insuranceAIRisks: InsuranceAIRiskCategory[] = [
  {
    id: "ins-risk-001",
    name: "AI-Driven Claims Processing Errors",
    description:
      "Automated claims assessment systems may incorrectly approve or deny insurance claims due to model hallucinations, bias, or inadequate training data, leading to customer dissatisfaction and regulatory violations.",
    insuranceImpact: [
      "Wrongful claim denials affecting customer trust",
      "Overpayment of fraudulent claims (financial loss)",
      "Regulatory penalties under Financial Supervisory Authority requirements",
      "Discrimination complaints if bias affects certain demographics",
    ],
    regulatoryFramework: [
      "Insurance Activity Act",
      "GDPR Article 22 (Automated Decision-Making)",
      "EU AI Act High-Risk Classification",
    ],
    likelihood: "High",
    detectionChallenges: [
      "Claims decisions appear reasonable but contain subtle errors",
      "Bias patterns emerge only across large datasets",
      "Model confidence scores don't correlate with accuracy",
    ],
    recommendedControls: [
      "Human review for all claims above threshold",
      "Regular bias audits across demographic segments",
      "Explainability requirements for all automated decisions",
      "Monthly accuracy validation against manually reviewed claims",
    ],
    severity: "Critical",
    companyContext:
      "The company processes over 100,000 claims annually across life, health, and property insurance. AI-assisted claims processing affects customer trust and brand reputation significantly.",
  },
  {
    id: "ins-risk-002",
    name: "Customer Service Chatbot Misinformation",
    description:
      "AI-powered customer service agents may provide incorrect policy information, misadvise customers on coverage, or fail to properly escalate sensitive issues, creating liability exposure.",
    insuranceImpact: [
      "Customers make financial decisions based on incorrect AI advice",
      "Liability for misinformation provided by AI representatives",
      "Loss of customer confidence in digital channels",
      "Increased complaints to regulators",
    ],
    regulatoryFramework: ["Consumer Protection Act", "Insurance Contracts Act", "Marketing Control Act"],
    likelihood: "High",
    detectionChallenges: [
      "Chatbot responses sound confident and professional even when incorrect",
      "Hard to distinguish between helpful simplification and harmful misinformation",
      "Customers may not report issues until claims are denied",
    ],
    recommendedControls: [
      "Knowledge base validation and version control",
      "Clear disclaimers that AI provides general guidance only",
      "Mandatory human escalation for policy-specific advice",
      "Conversation logging and quality assurance sampling",
      "Regular testing with edge-case customer queries",
    ],
    severity: "High",
    companyContext:
      "Digital customer service handles 60% of routine inquiries. Maintaining accuracy while improving efficiency is critical to the digital transformation strategy.",
  },
  {
    id: "ins-risk-003",
    name: "Underwriting Discrimination & Bias",
    description:
      "AI models used for risk assessment and premium calculation may perpetuate or amplify historical biases, leading to discriminatory pricing or coverage decisions that violate equality laws.",
    insuranceImpact: [
      "Legal action for discrimination (age, gender, ethnicity, disability)",
      "Regulatory enforcement by Equality and Anti-Discrimination authorities",
      "Reputational damage as a responsible insurer",
      "Financial penalties and mandatory model retraining",
    ],
    regulatoryFramework: [
      "Equality and Anti-Discrimination Act",
      "GDPR Article 9 (Special Category Data)",
      "EU AI Act Prohibited Practices",
      "Insurance Directives (Solvency II)",
    ],
    likelihood: "Medium",
    detectionChallenges: [
      "Bias may be indirect through correlated features (redlining)",
      "Historical data reflects societal inequalities",
      "Actuarial risk factors may conflict with anti-discrimination law",
    ],
    recommendedControls: [
      "Fairness testing across protected characteristics",
      "Independent third-party bias audits annually",
      "Documented rationale for all risk factors used",
      "Prohibition on proxy variables for protected attributes",
      "Regular regulatory dialogue",
    ],
    severity: "Critical",
    companyContext:
      "The company is committed to sustainable and responsible insurance. Any perception of unfair treatment directly contradicts corporate values and ESG commitments.",
  },
  {
    id: "ins-risk-004",
    name: "Fraud Detection False Positives",
    description:
      "AI-based fraud detection systems may incorrectly flag legitimate claims as fraudulent, causing delays, customer frustration, and potential legal challenges.",
    insuranceImpact: [
      "Damaged customer relationships due to false accusations",
      "Increased operational costs investigating false positives",
      "Regulatory complaints about unfair treatment",
      "Legal exposure if customers face financial hardship from delayed claims",
    ],
    regulatoryFramework: [
      "Insurance Contracts Act (processing timelines)",
      "GDPR (right to challenge automated decisions)",
      "Consumer Protection legislation",
    ],
    likelihood: "Medium",
    detectionChallenges: [
      "Balancing fraud detection sensitivity with false positive rates",
      "Unusual but legitimate claims trigger fraud flags",
      "Model explanations don't always clarify why claim was flagged",
    ],
    recommendedControls: [
      "Tiered review process with human oversight",
      "Clear customer communication when fraud investigation initiated",
      "Regular calibration of detection thresholds",
      "Fast-track appeals process for disputed flags",
      "Transparency reporting on false positive rates",
    ],
    severity: "Medium",
    companyContext:
      "The company detects and prevents approximately $5 million in fraud annually. Maintaining effectiveness while ensuring fair treatment is essential.",
  },
  {
    id: "ins-risk-005",
    name: "Data Privacy Violations in AI Training",
    description:
      "AI models trained on customer data (health records, financial information, personal details) may memorise and leak sensitive information, violating GDPR and customer trust.",
    insuranceImpact: [
      "GDPR fines up to 4% of global turnover",
      "Loss of customer trust and potential customer exodus",
      "Data breach notification requirements",
      "Long-term reputational damage",
    ],
    regulatoryFramework: [
      "GDPR Articles 5, 25, 32 (data protection by design)",
      "Personal Data Act",
      "Sector-specific health data protection rules",
    ],
    likelihood: "Medium",
    detectionChallenges: [
      "Data leakage may not be obvious until specific prompts trigger it",
      "Difficult to audit model internals for memorised information",
      "Anonymisation techniques may be insufficient for AI training",
    ],
    recommendedControls: [
      "Privacy-preserving machine learning techniques (federated learning, differential privacy)",
      "Data minimisation in training datasets",
      "Regular privacy impact assessments",
      "Strict access controls on training data",
      "Third-party privacy audits before production deployment",
    ],
    severity: "Critical",
    companyContext:
      "The company handles highly sensitive health, financial, and personal data for 1.7 million customers. Privacy is non-negotiable.",
  },
  {
    id: "ins-risk-006",
    name: "Model Drift & Performance Degradation",
    description:
      "AI models deployed in production may gradually become less accurate as customer behaviour, market conditions, or claim patterns change, without obvious warning signs.",
    insuranceImpact: [
      "Incorrect pricing leading to inadequate reserves",
      "Claims processing errors increase over time",
      "Competitive disadvantage if pricing becomes uncompetitive",
      "Solvency ratio impacts",
    ],
    regulatoryFramework: [
      "Solvency II (capital adequacy requirements)",
      "Own Risk and Solvency Assessment (ORSA) documentation",
      "Model risk management frameworks",
    ],
    likelihood: "High",
    detectionChallenges: [
      "Gradual degradation harder to notice than sudden failure",
      "Business metrics may lag behind model performance",
      "Difficult to distinguish model issues from market changes",
    ],
    recommendedControls: [
      "Continuous monitoring dashboards for model performance",
      "Automated alerts for distribution shift detection",
      "Quarterly model revalidation",
      "A/B testing framework for model updates",
      "Clear model retirement and retraining procedures",
    ],
    severity: "High",
    companyContext:
      "The company relies on predictive models for pricing across all product lines. Model accuracy directly affects financial stability and regulatory capital requirements.",
  },
  {
    id: "ins-risk-007",
    name: "Third-Party AI Vendor Risk",
    description:
      "The company uses AI solutions from external vendors (claims automation, fraud detection, customer service). Vendor failures, security breaches, or service discontinuation create operational risk.",
    insuranceImpact: [
      "Service disruption affecting customer experience",
      "Data breaches at vendor affecting customers",
      "Regulatory non-compliance inherited from vendor practices",
      "Lock-in to problematic vendor technology",
    ],
    regulatoryFramework: [
      "GDPR Article 28 (processor requirements)",
      "Outsourcing Guidelines",
      "Digital Operational Resilience Act (DORA)",
    ],
    likelihood: "Medium",
    detectionChallenges: [
      "Limited visibility into vendor model development",
      "Vendor may not disclose security incidents promptly",
      "Contractual limitations on auditing vendor practices",
    ],
    recommendedControls: [
      "Comprehensive vendor due diligence process",
      "Right-to-audit clauses in vendor contracts",
      "Vendor performance SLAs with financial penalties",
      "Exit strategy and data portability requirements",
      "Regular vendor risk reviews and compliance attestations",
    ],
    severity: "High",
    companyContext:
      "The company partners with multiple AI vendors as part of digital transformation. Vendor governance is critical to maintaining operational resilience.",
  },
  {
    id: "ins-risk-008",
    name: "Explainability Failures in Regulatory Reporting",
    description:
      "Complex AI models may produce decisions that cannot be adequately explained to regulators, customers, or internal stakeholders, violating transparency requirements.",
    insuranceImpact: [
      "Regulatory censure for inadequate model documentation",
      "Customer complaints about opaque decision-making",
      "Board-level governance challenges",
      "Inability to defend decisions in legal proceedings",
    ],
    regulatoryFramework: [
      "GDPR Article 22 (right to explanation)",
      "EU AI Act transparency requirements",
      "Solvency II (model risk management)",
    ],
    likelihood: "High",
    detectionChallenges: [
      "Technical explanations don't satisfy non-technical stakeholders",
      "Model explanations may be post-hoc rationalisations",
      "Trade-off between model performance and explainability",
    ],
    recommendedControls: [
      "Explainable AI (XAI) techniques for all high-risk models",
      "Non-technical documentation for board and regulators",
      "Decision audit trails linking inputs to outputs",
      "Prefer simpler, interpretable models where feasible",
      "Regular explainability testing with diverse stakeholders",
    ],
    severity: "High",
    companyContext:
      "The company must demonstrate responsible AI governance to regulators, customers, and ESG rating agencies. Explainability is a competitive differentiator.",
  },
  {
    id: "ins-risk-009",
    name: "AI-Enabled Social Engineering Attacks",
    description:
      "Attackers use AI to create highly convincing phishing attacks, impersonation attempts, or fraudulent claims targeting employees and customers.",
    insuranceImpact: [
      "Financial fraud losses",
      "Data breaches via compromised employee accounts",
      "Damage to brand reputation",
      "Operational disruption",
    ],
    regulatoryFramework: [
      "NIS2 Directive (Network and Information Security)",
      "GDPR (security of processing)",
      "Cybersecurity requirements under DORA",
    ],
    likelihood: "High",
    detectionChallenges: [
      "AI-generated attacks more sophisticated than traditional phishing",
      "Voice/video deepfakes difficult to detect",
      "Employees may not recognize advanced social engineering",
    ],
    recommendedControls: [
      "Enhanced employee security awareness training",
      "Multi-factor authentication for all sensitive operations",
      "AI-powered phishing detection and response",
      "Clear verification procedures for unusual requests",
      "Regular social engineering testing (red team exercises)",
    ],
    severity: "High",
    companyContext:
      "Employees handle sensitive customer data daily. One successful social engineering attack could compromise thousands of customer records.",
  },
]

// Network topology for insurance AI systems
export interface NetworkNode {
  id: string
  name: string
  type: "model" | "database" | "api" | "user" | "infrastructure" | "external" | "internal"
  riskLevel: "low" | "medium" | "high" | "critical"
  department: string
  connections: string[]
  description: string
  dataClassification?: "public" | "internal" | "confidential" | "restricted"
  monthlyTransactions?: number
  lastSecurityAudit?: string
  complianceFrameworks?: string[]
  owner?: string
}

export const networkTopology: NetworkNode[] = [
  // AI Models
  {
    id: "ai-claims",
    name: "Claims Assessment AI",
    type: "model",
    riskLevel: "critical",
    department: "Claims",
    connections: ["db-claims", "db-documents", "infra-cloud", "ext-medical"],
    description:
      "Automated claims evaluation for property, casualty, and health insurance using computer vision and NLP. Processes 12,000+ claims monthly.",
    dataClassification: "restricted",
    monthlyTransactions: 12450,
    lastSecurityAudit: "2024-11-15",
    complianceFrameworks: ["EU AI Act", "GDPR", "Solvency II"],
    owner: "Claims Director",
  },
  {
    id: "ai-chatbot",
    name: "Customer Service AI Chatbot",
    type: "model",
    riskLevel: "high",
    department: "Customer Service",
    connections: ["db-crm", "api-portal", "ext-identity"],
    description:
      "24/7 customer support assistant handling policy inquiries, claims status, and general questions. Serves 45,000 conversations monthly.",
    dataClassification: "confidential",
    monthlyTransactions: 45200,
    lastSecurityAudit: "2024-10-22",
    complianceFrameworks: ["EU AI Act", "GDPR"],
    owner: "Customer Service Manager",
  },
  {
    id: "ai-underwriting",
    name: "Underwriting Risk Engine",
    type: "model",
    riskLevel: "critical",
    department: "Underwriting",
    connections: ["db-actuarial", "db-health", "infra-cloud", "ext-registry"],
    description:
      "AI-driven risk assessment and premium calculation for life, health, and pension products. Evaluates 8,500 applications monthly with 94% accuracy.",
    dataClassification: "restricted",
    monthlyTransactions: 8520,
    lastSecurityAudit: "2024-11-01",
    complianceFrameworks: ["EU AI Act", "GDPR", "Solvency II", "IDD"],
    owner: "Underwriting Director",
  },
  {
    id: "ai-fraud",
    name: "Fraud Detection System",
    type: "model",
    riskLevel: "high",
    department: "Risk Management",
    connections: ["db-claims", "db-actuarial", "infra-cloud", "int-soc"],
    description:
      "Pattern recognition AI identifying potentially fraudulent claims and applications. Flagged $3M in suspicious activity last quarter.",
    dataClassification: "restricted",
    monthlyTransactions: 34000,
    lastSecurityAudit: "2024-09-30",
    complianceFrameworks: ["EU AI Act", "AML Directive"],
    owner: "Risk Manager",
  },
  {
    id: "ai-investment",
    name: "Pension Investment Advisor",
    type: "model",
    riskLevel: "high",
    department: "Asset Management",
    connections: ["db-actuarial", "ext-markets", "ext-regulator", "infra-cloud"],
    description:
      "AI-assisted investment decision support for pension fund. Provides portfolio optimisation and ESG screening.",
    dataClassification: "confidential",
    monthlyTransactions: 2800,
    lastSecurityAudit: "2024-10-15",
    complianceFrameworks: ["MiFID II", "SFDR", "EU AI Act"],
    owner: "Investment Director",
  },
  // Databases
  {
    id: "db-claims",
    name: "Claims Database",
    type: "database",
    riskLevel: "critical",
    department: "IT Infrastructure",
    connections: [],
    description:
      "Comprehensive claims history with 2.4M records including personal injury, property damage, and health claims.",
    dataClassification: "restricted",
    monthlyTransactions: 85000,
    lastSecurityAudit: "2024-11-10",
    complianceFrameworks: ["GDPR", "SOC 2"],
    owner: "Database Administrator",
  },
  {
    id: "db-crm",
    name: "Customer CRM Database",
    type: "database",
    riskLevel: "high",
    department: "IT Infrastructure",
    connections: [],
    description: "Central customer relationship database with 1.7M customer profiles and interaction history.",
    dataClassification: "confidential",
    monthlyTransactions: 450000,
    lastSecurityAudit: "2024-10-28",
    complianceFrameworks: ["GDPR"],
    owner: "Database Administrator",
  },
  {
    id: "db-actuarial",
    name: "Actuarial Data Warehouse",
    type: "database",
    riskLevel: "high",
    department: "Actuarial",
    connections: [],
    description: "Historical risk data, mortality tables, and pricing models supporting actuarial calculations.",
    dataClassification: "confidential",
    monthlyTransactions: 12000,
    lastSecurityAudit: "2024-09-15",
    complianceFrameworks: ["Solvency II", "GDPR"],
    owner: "Chief Actuary",
  },
  // External Systems
  {
    id: "ext-medical",
    name: "Medical Records API",
    type: "external",
    riskLevel: "critical",
    department: "External",
    connections: [],
    description: "Secure integration with healthcare providers for medical records verification in health claims.",
    dataClassification: "restricted",
    monthlyTransactions: 3200,
    lastSecurityAudit: "2024-11-01",
    complianceFrameworks: ["GDPR", "HIPAA-equivalent"],
    owner: "Integration Manager",
  },
  {
    id: "ext-identity",
    name: "Identity Verification Service",
    type: "external",
    riskLevel: "high",
    department: "External",
    connections: [],
    description: "Electronic identity verification for secure customer authentication.",
    dataClassification: "confidential",
    monthlyTransactions: 28000,
    lastSecurityAudit: "2024-10-20",
    complianceFrameworks: ["eIDAS", "GDPR"],
    owner: "Security Manager",
  },
  {
    id: "ext-regulator",
    name: "Regulatory Reporting Gateway",
    type: "external",
    riskLevel: "high",
    department: "External",
    connections: [],
    description: "Automated regulatory reporting submission to financial supervisory authority.",
    dataClassification: "confidential",
    monthlyTransactions: 450,
    lastSecurityAudit: "2024-11-05",
    complianceFrameworks: ["Solvency II", "GDPR"],
    owner: "Compliance Officer",
  },
  // Infrastructure
  {
    id: "infra-cloud",
    name: "Cloud Platform",
    type: "infrastructure",
    riskLevel: "high",
    department: "IT Infrastructure",
    connections: [],
    description: "Primary cloud infrastructure hosting AI workloads with GPU clusters for model training.",
    dataClassification: "internal",
    monthlyTransactions: 2500000,
    lastSecurityAudit: "2024-11-12",
    complianceFrameworks: ["ISO 27001", "SOC 2", "GDPR"],
    owner: "Cloud Architect",
  },
  // Internal Services
  {
    id: "int-soc",
    name: "Security Operations Centre",
    type: "internal",
    riskLevel: "medium",
    department: "Security",
    connections: [],
    description: "24/7 security monitoring, incident response, and threat intelligence for all digital assets.",
    dataClassification: "confidential",
    monthlyTransactions: 15000,
    lastSecurityAudit: "2024-11-18",
    complianceFrameworks: ["ISO 27001", "NIST"],
    owner: "CISO",
  },
  // APIs
  {
    id: "api-portal",
    name: "Customer Portal",
    type: "api",
    riskLevel: "medium",
    department: "Digital",
    connections: [],
    description: "Customer self-service for policy management, claims submission, and account overview.",
    dataClassification: "confidential",
    monthlyTransactions: 420000,
    lastSecurityAudit: "2024-10-30",
    complianceFrameworks: ["GDPR", "PCI DSS"],
    owner: "Digital Product Manager",
  },
]

// Export aliases for backward compatibility
export const insuranceAiRiskRegister = insuranceAIRisks.map((risk) => ({
  ...risk,
  businessImpact: risk.insuranceImpact.join("; "),
  mitigations: risk.recommendedControls,
}))

export const insuranceNetworkTopology = networkTopology
