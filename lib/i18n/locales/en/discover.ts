export const discover = {
  title: 'Discover',
  subtitle:
    'Six ways to discover the AI tools and use cases across your organisation — use one or combine them',
  cards: {
    voiceInterview: {
      title: 'AI Voice Interview',
      description:
        'Voice-interview any employee. The AI agent asks about their AI tools and autonomous agents, and documents each use case straight from the conversation.',
      action: 'Start Voice Interview',
    },
    defenderImport: {
      title: 'Defender Screenshot Import',
      description:
        'Upload a screenshot of the shadow-app list from Microsoft Defender for Cloud Apps. The agent extracts the applications, enriches each one, and adds them to your inventory.',
      action: 'Import Screenshot',
    },
    cisoCampaign: {
      title: 'AI Discovery Campaign',
      description:
        'Send AI agents to interview every department. Agents ask about AI tool usage, data handling, and risk exposure.',
      action: 'Launch Campaign',
    },
    agenticMonitoring: {
      title: 'Agentic Monitoring',
      description:
        'Always-on agents on endpoints, desktop apps and the browser extension. AI usage is observed in real time and use cases surface automatically — no outreach, no waiting.',
      action: 'View Activity',
    },
    selfRegistration: {
      title: 'Employee Self-Registration',
      description:
        'Share a link with staff. An AI agent interviews them conversationally and extracts use case data automatically.',
      action: 'Copy Link',
    },
    autoDetect: {
      title: 'Integrations',
      description:
        'Connect to your existing systems — Entra-ID, your SaaS estate and CASB — to auto-detect ungoverned AI tools the moment they appear.',
      action: 'Review Alerts',
      badge: '{count} new',
    },
  },
  stats: {
    toolsDiscovered: 'AI Tools Discovered',
    vendorsInUse: 'Vendors in Use',
    useCasesIdentified: 'Use Cases Identified',
    shadowAiDetected: 'Shadow AI Detected',
  },
  conversations: 'Agent Conversations',
  sampleData: 'Sample data',
}
