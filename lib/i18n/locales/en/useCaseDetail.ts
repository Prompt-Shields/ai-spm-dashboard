export const useCaseDetail = {
  status: {
    discovered: 'Discovered',
    assessed: 'Assessed',
    owned: 'Owned',
    mitigated: 'Mitigated',
    compliant: 'Compliant',
  },
  compliance: {
    levels: {
      covered: 'Covered',
      partial: 'Partial',
      gap: 'Gap',
    },
    heading: 'Compliance Coverage',
  },
  meta: {
    data: 'Data',
    discovery: 'Discovery',
  },
  sections: {
    aiModels: 'AI Models',
    owner: 'Owner',
    risks: 'Risks',
    mitigations: 'Mitigations',
  },
  owner: {
    none: 'No owner assigned',
    assign: 'Assign →',
  },
  risks: {
    count: '({count})',
    worst: 'Worst: {severity}',
    refs: {
      owasp: 'OWASP {ref}',
      euAiAct: 'EU AI Act {ref}',
    },
  },
  actions: {
    edit: 'Edit Use Case',
    assignOwner: 'Assign Owner',
  },
}
