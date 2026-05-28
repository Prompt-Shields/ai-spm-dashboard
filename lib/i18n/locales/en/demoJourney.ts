export const demoJourney = {
  progress: 'Step {current} of {total} · ~{duration}s',
  steps: {
    s1: {
      title: 'Your org has no AI map yet',
      body: "You're starting from zero — like every CISO does. Let's find out what AI your organisation is actually using.",
      cta: 'Launch Discovery Agent →',
    },
    s2: {
      title: 'AI Agent is interviewing your employees',
      body: 'Agents are reaching out across Slack and email. Watch as they extract use cases from natural conversations — no forms, no surveys.',
      cta: 'See the map populate →',
    },
    s3: {
      title: '47 use cases mapped. 12 critical risks identified.',
      body: 'All from agent conversations. No manual entry. Click any node to explore the full risk picture for that use case.',
      cta: 'Assign ownership →',
    },
    s4: {
      title: 'Owners identified and notified',
      body: 'AI suggested owners based on who reported each use case. One click to confirm. Agents automatically send each owner their risk assessment tasks.',
      cta: 'See compliance coverage →',
    },
    s5: {
      title: 'From 0% to 73% EU AI Act coverage — this session.',
      body: 'Every use case is mapped to the frameworks that matter. Gaps are visible. Remediations are one click away. Your AI is now governed.',
      cta: 'Finish demo',
    },
  },
}
