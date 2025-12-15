// Storebrand Insurance-specific AI governance data

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
  storebrandContext: string
}

export const storebrandAIRisks: InsuranceAIRiskCategory[] = [
  {
    id: "ins-risk-001",
    name: "AI-Driven Claims Processing Errors",
    description:
      "Automated claims assessment systems may incorrectly approve or deny insurance claims due to model hallucinations, bias, or inadequate training data, leading to customer dissatisfaction and regulatory violations.",
    insuranceImpact: [
      "Wrongful claim denials affecting customer trust",
      "Overpayment of fraudulent claims (financial loss)",
      "Regulatory penalties under Norwegian Financial Supervisory Authority (Finanstilsynet) requirements",
      "Discrimination complaints if bias affects certain demographics",
    ],
    regulatoryFramework: [
      "Norwegian Insurance Activity Act (Forsikringsvirksomhetsloven)",
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
      "Human review for all claims above NOK 50,000",
      "Regular bias audits across demographic segments",
      "Explainability requirements for all automated decisions",
      "Monthly accuracy validation against manually reviewed claims",
    ],
    severity: "Critical",
    storebrandContext:
      "Storebrand processes over 100,000 claims annually across life, health, and property insurance. AI-assisted claims processing affects customer trust and brand reputation significantly.",
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
      "Increased complaints to Finanstilsynet",
    ],
    regulatoryFramework: [
      "Consumer Protection Act (Forbrukerkjøpsloven)",
      "Insurance Contracts Act (Forsikringsavtaleloven)",
      "Norwegian Marketing Control Act",
    ],
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
    storebrandContext:
      "Storebrand's digital customer service handles 60% of routine inquiries. Maintaining accuracy while improving efficiency is critical to the digital transformation strategy.",
  },
  {
    id: "ins-risk-003",
    name: "Underwriting Discrimination & Bias",
    description:
      "AI models used for risk assessment and premium calculation may perpetuate or amplify historical biases, leading to discriminatory pricing or coverage decisions that violate equality laws.",
    insuranceImpact: [
      "Legal action for discrimination (age, gender, ethnicity, disability)",
      "Regulatory enforcement by Equality and Anti-Discrimination Ombud",
      "Reputational damage as a responsible Norwegian insurer",
      "Financial penalties and mandatory model retraining",
    ],
    regulatoryFramework: [
      "Equality and Anti-Discrimination Act (Likestillings- og diskrimineringsloven)",
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
      "Regular regulatory dialogue with Finanstilsynet",
    ],
    severity: "Critical",
    storebrandContext:
      "Storebrand is committed to sustainable and responsible insurance. Any perception of unfair treatment directly contradicts corporate values and ESG commitments.",
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
    storebrandContext:
      "Storebrand detects and prevents approximately NOK 40 million in fraud annually. Maintaining effectiveness while ensuring fair treatment is essential.",
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
      "Norwegian Personal Data Act",
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
    storebrandContext:
      "Storebrand handles highly sensitive health, financial, and personal data for 1.7 million Norwegian customers. Privacy is non-negotiable.",
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
    storebrandContext:
      "Storebrand relies on predictive models for pricing across all product lines. Model accuracy directly affects financial stability and regulatory capital requirements.",
  },
  {
    id: "ins-risk-007",
    name: "Third-Party AI Vendor Risk",
    description:
      "Storebrand uses AI solutions from external vendors (claims automation, fraud detection, customer service). Vendor failures, security breaches, or service discontinuation create operational risk.",
    insuranceImpact: [
      "Service disruption affecting customer experience",
      "Data breaches at vendor affecting Storebrand customers",
      "Regulatory non-compliance inherited from vendor practices",
      "Lock-in to problematic vendor technology",
    ],
    regulatoryFramework: [
      "GDPR Article 28 (processor requirements)",
      "Outsourcing Guidelines (Finanstilsynet)",
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
    storebrandContext:
      "Storebrand partners with multiple AI vendors as part of digital transformation. Vendor governance is critical to maintaining operational resilience.",
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
    storebrandContext:
      "Storebrand must demonstrate responsible AI governance to regulators, customers, and ESG rating agencies. Explainability is a competitive differentiator.",
  },
  {
    id: "ins-risk-009",
    name: "AI-Enabled Social Engineering Attacks",
    description:
      "Attackers use AI to create highly convincing phishing attacks, impersonation attempts, or fraudulent claims targeting Storebrand employees and customers.",
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
    storebrandContext:
      "Storebrand employees handle sensitive customer data daily. One successful social engineering attack could compromise thousands of customer records.",
  },
]

// Network topology for Storebrand insurance AI systems
export interface StorebrandNetworkNode {
  id: string
  label: string
  type: "model" | "database" | "api" | "user" | "infrastructure" | "external"
  riskLevel: "low" | "medium" | "high" | "critical"
  department: string
  connections: string[]
  description: string
}

export const storebrandNetworkTopology: StorebrandNetworkNode[] = [
  {
    id: "node-001",
    label: "Claims Assessment AI",
    type: "model",
    riskLevel: "critical",
    department: "Claims",
    connections: ["node-010", "node-011", "node-015", "node-020"],
    description: "Automated claims evaluation for property and casualty insurance using computer vision and NLP",
  },
  {
    id: "node-002",
    label: "Customer Service Chatbot",
    type: "model",
    riskLevel: "high",
    department: "Customer Service",
    connections: ["node-012", "node-016", "node-021"],
    description: "24/7 customer support assistant handling policy inquiries, claims status, and general questions",
  },
  {
    id: "node-003",
    label: "Underwriting Risk Model",
    type: "model",
    riskLevel: "critical",
    department: "Underwriting",
    connections: ["node-013", "node-014", "node-015"],
    description: "AI-driven risk assessment and premium calculation for life and health insurance products",
  },
  {
    id: "node-004",
    label: "Fraud Detection System",
    type: "model",
    riskLevel: "high",
    department: "Risk Management",
    connections: ["node-010", "node-013", "node-015"],
    description: "Pattern recognition AI identifying potentially fraudulent claims and applications",
  },
  {
    id: "node-005",
    label: "Investment Portfolio AI",
    type: "model",
    riskLevel: "high",
    department: "Asset Management",
    connections: ["node-014", "node-017", "node-022"],
    description: "AI-assisted investment decision support for pension fund management",
  },
  {
    id: "node-006",
    label: "Document Processing AI",
    type: "model",
    riskLevel: "medium",
    department: "Operations",
    connections: ["node-011", "node-012"],
    description: "Automated extraction of information from policy documents, medical records, and claim forms",
  },
  {
    id: "node-007",
    label: "Sales Recommendation Engine",
    type: "model",
    riskLevel: "medium",
    department: "Sales & Marketing",
    connections: ["node-012", "node-016"],
    description: "Personalised product recommendations for cross-selling and customer retention",
  },
  {
    id: "node-010",
    label: "Claims Database",
    type: "database",
    riskLevel: "critical",
    department: "IT",
    connections: [],
    description: "Comprehensive claims history including personal injury, property damage, and health claims",
  },
  {
    id: "node-011",
    label: "Document Repository",
    type: "database",
    riskLevel: "high",
    department: "IT",
    connections: [],
    description: "Central storage for policy documents, medical records, and supporting claim documentation",
  },
  {
    id: "node-012",
    label: "Customer CRM Database",
    type: "database",
    riskLevel: "critical",
    department: "IT",
    connections: [],
    description: "Customer personal information, contact history, policies held, and interaction records",
  },
  {
    id: "node-013",
    label: "Financial & Actuarial DB",
    type: "database",
    riskLevel: "critical",
    department: "Finance",
    connections: [],
    description: "Reserves, premiums, claims payments, and actuarial assumptions",
  },
  {
    id: "node-014",
    label: "Health Records Database",
    type: "database",
    riskLevel: "critical",
    department: "Health Insurance",
    connections: [],
    description: "Protected health information (PHI) for life and health insurance underwriting",
  },
  {
    id: "node-015",
    label: "Azure Cloud Infrastructure",
    type: "infrastructure",
    riskLevel: "high",
    department: "IT",
    connections: [],
    description: "Primary cloud hosting for AI models, databases, and customer-facing applications",
  },
  {
    id: "node-016",
    label: "Public Web Portal",
    type: "api",
    riskLevel: "high",
    department: "Digital",
    connections: [],
    description: "Customer-facing website and mobile app for policy management and claims submission",
  },
  {
    id: "node-017",
    label: "Market Data Feeds",
    type: "external",
    riskLevel: "medium",
    department: "External",
    connections: [],
    description: "Real-time financial market data for investment decisions",
  },
  {
    id: "node-020",
    label: "Medical Provider API",
    type: "external",
    riskLevel: "high",
    department: "External",
    connections: [],
    description: "Integration with Norwegian health system for medical record verification",
  },
  {
    id: "node-021",
    label: "BankID Authentication",
    type: "external",
    riskLevel: "medium",
    department: "External",
    connections: [],
    description: "National digital identity verification for secure customer authentication",
  },
  {
    id: "node-022",
    label: "Regulatory Reporting API",
    type: "external",
    riskLevel: "medium",
    department: "External",
    connections: [],
    description: "Automated submissions to Finanstilsynet for compliance reporting",
  },
]

export const insuranceAiRiskRegister = storebrandAIRisks.map((risk) => ({
  id: risk.id,
  name: risk.name,
  description: risk.description,
  severity: risk.severity,
  likelihood: risk.likelihood,
  businessImpact: risk.insuranceImpact,
  detectionChallenges: risk.detectionChallenges,
  recommendedControls: risk.recommendedControls,
}))

export const insuranceNetworkTopology = storebrandNetworkTopology
