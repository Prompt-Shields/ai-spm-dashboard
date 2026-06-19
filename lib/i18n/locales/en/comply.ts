export const comply = {
  title: 'AI Compliance',
  subtitle: 'Framework coverage across all AI use cases',
  exportReport: 'Export Compliance Report',
  boardReport: 'Board report',
  coverageGaps: '{count} gaps remaining',
  iso42001Journey: {
    eyebrow: 'Guided journey',
    heading: 'Achieve ISO/IEC 42001 compliance',
    body: 'Walk an admin through the seven AI-management-system clauses step by step — closing gaps and raising coverage toward certification-ready.',
    cta: 'Start ISO 42001 journey →',
    resume: 'Resume journey →',
    status: '{completed} of {total} clauses complete',
    ready: 'Certification-ready',
  },
  breakdown: {
    heading: 'Overall Coverage Breakdown',
    stats: '{covered} covered · {partial} partial · {gap} gap',
    legend: {
      covered: 'Covered',
      partial: 'Partial',
      gap: 'Gap',
    },
  },
  priority: {
    heading: 'Priority Remediations',
    urgency: {
      critical: 'CRITICAL',
      high: 'HIGH',
      medium: 'MEDIUM',
    },
    deadlineLabel: 'Deadline: {deadline}',
    assign: 'Assign →',
    actions: {
      gdpr: 'Enforce PII redaction + lawful-basis checks on restricted-data use cases',
      euAiAct: 'Assign human oversight to 8 high-risk use cases',
      owaspLlm: 'Apply prompt injection guards on 6 customer-facing LLMs',
      nistAiRmf: 'Document AI risk assessments for 12 unassessed use cases',
    },
    deadlines: {
      gdpr: 'Ongoing',
      euAiAct: 'Aug 2026',
      owaspLlm: 'Q2 2026',
      nistAiRmf: 'Q3 2026',
    },
  },
  gapTable: {
    heading: 'Compliance Gaps — Action Required',
    columns: {
      useCase: 'Use Case',
      department: 'Department',
      action: 'Action',
    },
    assignRemediation: 'Assign remediation →',
  },
}
