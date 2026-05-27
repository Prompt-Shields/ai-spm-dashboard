export const comply = {
  title: 'Comply',
  subtitle: 'Framework coverage across all AI use cases',
  exportReport: 'Export Compliance Report',
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
      euAiAct: 'Assign human oversight to 8 high-risk use cases',
      owaspLlm: 'Apply prompt injection guards on 6 customer-facing LLMs',
      nistAiRmf: 'Document AI risk assessments for 12 unassessed use cases',
    },
    deadlines: {
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
