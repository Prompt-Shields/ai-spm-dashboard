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
  name: string // Changed from label to name for consistency
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

export const storebrandNetworkTopology: StorebrandNetworkNode[] = [
  // AI Models
  {
    id: "ai-claims",
    name: "Claims Assessment AI",
    type: "model",
    riskLevel: "critical",
    department: "Claims",
    connections: ["db-claims", "db-documents", "infra-azure", "ext-medical"],
    description:
      "Automated claims evaluation for property, casualty, and health insurance using computer vision and NLP. Processes 12,000+ claims monthly.",
    dataClassification: "restricted",
    monthlyTransactions: 12450,
    lastSecurityAudit: "2024-11-15",
    complianceFrameworks: ["EU AI Act", "GDPR", "Solvency II"],
    owner: "Lars Eriksen",
  },
  {
    id: "ai-chatbot",
    name: "Kundeservice AI Chatbot",
    type: "model",
    riskLevel: "high",
    department: "Customer Service",
    connections: ["db-crm", "api-portal", "ext-bankid"],
    description:
      "24/7 Norwegian and English customer support assistant handling policy inquiries, claims status, and general questions. Serves 45,000 conversations monthly.",
    dataClassification: "confidential",
    monthlyTransactions: 45200,
    lastSecurityAudit: "2024-10-22",
    complianceFrameworks: ["EU AI Act", "GDPR"],
    owner: "Ingrid Haugen",
  },
  {
    id: "ai-underwriting",
    name: "Underwriting Risk Engine",
    type: "model",
    riskLevel: "critical",
    department: "Underwriting",
    connections: ["db-actuarial", "db-health", "infra-azure", "ext-folkereg"],
    description:
      "AI-driven risk assessment and premium calculation for life, health, and pension products. Evaluates 8,500 applications monthly with 94% accuracy.",
    dataClassification: "restricted",
    monthlyTransactions: 8520,
    lastSecurityAudit: "2024-11-01",
    complianceFrameworks: ["EU AI Act", "GDPR", "Solvency II", "IDD"],
    owner: "Erik Nordahl",
  },
  {
    id: "ai-fraud",
    name: "Fraud Detection System",
    type: "model",
    riskLevel: "high",
    department: "Risk Management",
    connections: ["db-claims", "db-actuarial", "infra-azure", "int-soc"],
    description:
      "Pattern recognition AI identifying potentially fraudulent claims and applications. Flagged NOK 23M in suspicious activity last quarter.",
    dataClassification: "restricted",
    monthlyTransactions: 34000,
    lastSecurityAudit: "2024-09-30",
    complianceFrameworks: ["EU AI Act", "AML Directive"],
    owner: "Morten Dahl",
  },
  {
    id: "ai-investment",
    name: "Pension Investment Advisor",
    type: "model",
    riskLevel: "high",
    department: "Asset Management",
    connections: ["db-actuarial", "ext-markets", "ext-finanstilsynet", "infra-azure"],
    description:
      "AI-assisted investment decision support for NOK 450B pension fund. Provides portfolio optimisation and ESG screening.",
    dataClassification: "confidential",
    monthlyTransactions: 2800,
    lastSecurityAudit: "2024-10-15",
    complianceFrameworks: ["MiFID II", "SFDR", "EU AI Act"],
    owner: "Kristin Solberg",
  },
  {
    id: "ai-documents",
    name: "Document Processing AI",
    type: "model",
    riskLevel: "medium",
    department: "Operations",
    connections: ["db-documents", "db-crm", "infra-azure"],
    description:
      "Automated extraction of information from policy documents, medical records, and claim forms. Processes 28,000 documents monthly with 97% accuracy.",
    dataClassification: "confidential",
    monthlyTransactions: 28400,
    lastSecurityAudit: "2024-11-08",
    complianceFrameworks: ["GDPR", "EU AI Act"],
    owner: "Hanne Berger",
  },
  {
    id: "ai-sales",
    name: "Product Recommendation Engine",
    type: "model",
    riskLevel: "medium",
    department: "Sales & Marketing",
    connections: ["db-crm", "api-portal", "api-mobile"],
    description:
      "Personalised insurance product recommendations for cross-selling and retention. Increased conversion rate by 18% since deployment.",
    dataClassification: "internal",
    monthlyTransactions: 156000,
    lastSecurityAudit: "2024-10-01",
    complianceFrameworks: ["GDPR", "IDD"],
    owner: "Thomas Lund",
  },
  {
    id: "ai-compliance",
    name: "Regulatory Compliance Monitor",
    type: "model",
    riskLevel: "high",
    department: "Legal & Compliance",
    connections: ["db-actuarial", "ext-finanstilsynet", "int-audit", "infra-azure"],
    description:
      "Automated monitoring of regulatory changes and compliance status across Norwegian and EU frameworks. Tracks 340+ regulatory requirements.",
    dataClassification: "confidential",
    monthlyTransactions: 4200,
    lastSecurityAudit: "2024-11-20",
    complianceFrameworks: ["EU AI Act", "Solvency II", "GDPR"],
    owner: "Liv Andresen",
  },

  // Databases
  {
    id: "db-claims",
    name: "Claims Database (Oracle)",
    type: "database",
    riskLevel: "critical",
    department: "IT Infrastructure",
    connections: [],
    description:
      "Comprehensive claims history with 2.4M records including personal injury, property damage, and health claims dating back 15 years.",
    dataClassification: "restricted",
    monthlyTransactions: 89000,
    lastSecurityAudit: "2024-10-10",
    complianceFrameworks: ["GDPR", "ISO 27001"],
    owner: "IT Operations",
  },
  {
    id: "db-documents",
    name: "Document Repository (SharePoint)",
    type: "database",
    riskLevel: "high",
    department: "IT Infrastructure",
    connections: [],
    description:
      "Central storage for 8.2M policy documents, medical records, and supporting claim documentation with full-text search.",
    dataClassification: "confidential",
    monthlyTransactions: 45000,
    lastSecurityAudit: "2024-09-25",
    complianceFrameworks: ["GDPR", "ISO 27001"],
    owner: "IT Operations",
  },
  {
    id: "db-crm",
    name: "Customer CRM (Salesforce)",
    type: "database",
    riskLevel: "critical",
    department: "IT Infrastructure",
    connections: [],
    description:
      "1.8M customer records including personal information, contact history, 4.2M active policies, and interaction logs.",
    dataClassification: "restricted",
    monthlyTransactions: 234000,
    lastSecurityAudit: "2024-11-05",
    complianceFrameworks: ["GDPR", "ISO 27001"],
    owner: "IT Operations",
  },
  {
    id: "db-actuarial",
    name: "Financial & Actuarial DB",
    type: "database",
    riskLevel: "critical",
    department: "Finance",
    connections: [],
    description:
      "Technical provisions, premium calculations, claims reserves totalling NOK 320B, and actuarial assumptions for all product lines.",
    dataClassification: "restricted",
    monthlyTransactions: 12000,
    lastSecurityAudit: "2024-10-20",
    complianceFrameworks: ["Solvency II", "IFRS 17", "ISO 27001"],
    owner: "Finance Operations",
  },
  {
    id: "db-health",
    name: "Health Records Database",
    type: "database",
    riskLevel: "critical",
    department: "Health Insurance",
    connections: [],
    description:
      "Protected health information (PHI) for 890,000 life and health insurance policyholders. Encrypted at rest and in transit.",
    dataClassification: "restricted",
    monthlyTransactions: 18000,
    lastSecurityAudit: "2024-11-12",
    complianceFrameworks: ["GDPR", "Health Data Act", "ISO 27001"],
    owner: "Health Operations",
  },

  // Infrastructure
  {
    id: "infra-azure",
    name: "Azure Cloud (Norway East)",
    type: "infrastructure",
    riskLevel: "high",
    department: "IT Infrastructure",
    connections: [],
    description:
      "Primary cloud hosting in Norway for AI models, databases, and customer-facing applications. 99.95% uptime SLA.",
    dataClassification: "internal",
    monthlyTransactions: 45000000,
    lastSecurityAudit: "2024-11-01",
    complianceFrameworks: ["ISO 27001", "SOC 2", "GDPR"],
    owner: "Cloud Operations",
  },
  {
    id: "infra-backup",
    name: "Disaster Recovery (Azure Sweden)",
    type: "infrastructure",
    riskLevel: "medium",
    department: "IT Infrastructure",
    connections: [],
    description:
      "Secondary data centre in Sweden for business continuity. RPO: 1 hour, RTO: 4 hours for critical systems.",
    dataClassification: "internal",
    lastSecurityAudit: "2024-10-15",
    complianceFrameworks: ["ISO 22301", "ISO 27001"],
    owner: "Cloud Operations",
  },

  // APIs and Portals
  {
    id: "api-portal",
    name: "Customer Web Portal",
    type: "api",
    riskLevel: "high",
    department: "Digital",
    connections: [],
    description:
      "storebrand.no customer self-service for policy management, claims submission, and pension overview. 420,000 monthly active users.",
    dataClassification: "confidential",
    monthlyTransactions: 890000,
    lastSecurityAudit: "2024-11-18",
    complianceFrameworks: ["WCAG 2.1", "GDPR", "PSD2"],
    owner: "Digital Products",
  },
  {
    id: "api-mobile",
    name: "Mobile App (iOS/Android)",
    type: "api",
    riskLevel: "high",
    department: "Digital",
    connections: [],
    description:
      "Storebrand mobile app for on-the-go policy management and claims photo submission. 180,000 monthly active users.",
    dataClassification: "confidential",
    monthlyTransactions: 340000,
    lastSecurityAudit: "2024-10-28",
    complianceFrameworks: ["WCAG 2.1", "GDPR"],
    owner: "Digital Products",
  },
  {
    id: "api-partner",
    name: "Partner API Gateway",
    type: "api",
    riskLevel: "medium",
    department: "Digital",
    connections: [],
    description:
      "B2B API for insurance distribution partners, brokers, and white-label integrations. 45 active partner connections.",
    dataClassification: "confidential",
    monthlyTransactions: 78000,
    lastSecurityAudit: "2024-09-15",
    complianceFrameworks: ["OAuth 2.0", "API Security Best Practices"],
    owner: "Partner Solutions",
  },

  // Internal Services
  {
    id: "int-soc",
    name: "Security Operations Centre",
    type: "internal",
    riskLevel: "low",
    department: "Information Security",
    connections: [],
    description:
      "24/7 security monitoring, incident response, and threat intelligence for all Storebrand digital assets.",
    dataClassification: "internal",
    lastSecurityAudit: "2024-11-25",
    complianceFrameworks: ["ISO 27001", "NIST CSF"],
    owner: "CISO Office",
  },
  {
    id: "int-audit",
    name: "Internal Audit System",
    type: "internal",
    riskLevel: "low",
    department: "Internal Audit",
    connections: [],
    description: "Audit trail logging and compliance verification for all AI system decisions and data access.",
    dataClassification: "confidential",
    lastSecurityAudit: "2024-10-05",
    complianceFrameworks: ["IIA Standards", "SOX"],
    owner: "Internal Audit",
  },

  // External Systems
  {
    id: "ext-medical",
    name: "Helsenorge Integration",
    type: "external",
    riskLevel: "high",
    department: "External",
    connections: [],
    description:
      "Integration with Norwegian national health portal for verified medical record retrieval with patient consent.",
    dataClassification: "restricted",
    monthlyTransactions: 8500,
    lastSecurityAudit: "2024-11-10",
    complianceFrameworks: ["Health Data Act", "GDPR"],
    owner: "Health Operations",
  },
  {
    id: "ext-bankid",
    name: "BankID Norge",
    type: "external",
    riskLevel: "medium",
    department: "External",
    connections: [],
    description: "National digital identity verification for secure customer authentication. 98% of logins use BankID.",
    dataClassification: "internal",
    monthlyTransactions: 920000,
    lastSecurityAudit: "2024-10-01",
    complianceFrameworks: ["eIDAS", "PSD2"],
    owner: "Identity Services",
  },
  {
    id: "ext-finanstilsynet",
    name: "Finanstilsynet Reporting",
    type: "external",
    riskLevel: "medium",
    department: "External",
    connections: [],
    description:
      "Automated regulatory submissions to Norwegian Financial Supervisory Authority including Solvency II QRTs.",
    dataClassification: "confidential",
    monthlyTransactions: 45,
    lastSecurityAudit: "2024-09-20",
    complianceFrameworks: ["Solvency II", "XBRL"],
    owner: "Regulatory Reporting",
  },
  {
    id: "ext-markets",
    name: "Bloomberg Terminal Feed",
    type: "external",
    riskLevel: "medium",
    department: "External",
    connections: [],
    description: "Real-time financial market data, ESG scores, and analytics for pension investment decisions.",
    dataClassification: "internal",
    monthlyTransactions: 2400000,
    lastSecurityAudit: "2024-08-15",
    complianceFrameworks: ["MiFID II"],
    owner: "Asset Management",
  },
  {
    id: "ext-folkereg",
    name: "Folkeregisteret API",
    type: "external",
    riskLevel: "medium",
    department: "External",
    connections: [],
    description: "Norwegian National Population Register for identity verification and address validation.",
    dataClassification: "confidential",
    monthlyTransactions: 34000,
    lastSecurityAudit: "2024-10-12",
    complianceFrameworks: ["GDPR", "Folkeregisterloven"],
    owner: "Customer Operations",
  },
  {
    id: "ext-kartverket",
    name: "Kartverket Property Data",
    type: "external",
    riskLevel: "low",
    department: "External",
    connections: [],
    description: "Norwegian Mapping Authority data for property insurance valuations and risk assessment.",
    dataClassification: "public",
    monthlyTransactions: 12000,
    lastSecurityAudit: "2024-07-20",
    complianceFrameworks: ["Open Data Directive"],
    owner: "Property Insurance",
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
