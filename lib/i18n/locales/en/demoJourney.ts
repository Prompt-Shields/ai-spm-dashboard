export const demoJourney = {
  progress: 'Step {current} of {total} · ~{duration}s',
  steps: {
    s1: {
      title: 'Your org has no AI map yet',
      body: "You're starting from zero. Whether you're the CISO, CIO, Head of GRC, or Head of AI — this is where governance begins. Let's find out what AI your organisation is actually using.",
      cta: 'Launch Discovery Agent →',
    },
    s2: {
      title: 'Discovery is running',
      body: 'Agentic monitoring on endpoints, agents interviewing employees on a repeated basis, employees self-registering, and your SaaS estate scanned automatically. Every method feeds the same map.',
      cta: 'See the map populate →',
    },
    s3: {
      title: '47 use cases mapped. 12 critical risks identified.',
      body: 'No spreadsheets, no manual data collection, no partial views. Every AI use case across every department — automatically surfaced and centralised in one map. Click any node to explore the full risk picture.',
      cta: 'Assign ownership →',
    },
    s4: {
      title: 'Owners identified and notified',
      body: 'AI suggested owners based on who reported each use case. One click to confirm. Agents automatically send each owner their risk assessment tasks.',
      cta: 'See compliance coverage →',
    },
    s5: {
      title: 'From zero to mapped — across EU AI Act, NIS2, ISO 42001 and more',
      body: 'Every use case is mapped to the regulations and frameworks that matter to your organisation. Gaps are visible. Remediations are one click away.',
      cta: 'Finish demo',
    },
  },
}
