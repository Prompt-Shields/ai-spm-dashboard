// Model Risk Page Data - Sample Apps and Pricing Information

export const sampleAppsData: Record<
  string,
  Array<{
    name: string
    description: string
    department: string
    usageType: string
    monthlyQueries: number
    status: string
  }>
> = {
  "mrm-001": [
    {
      name: "Kundeservice Chatbot",
      description: "Customer service automation",
      department: "Customer Service",
      usageType: "Production",
      monthlyQueries: 45000,
      status: "Active",
    },
    {
      name: "Dokumentanalyse",
      description: "Policy document analysis",
      department: "Underwriting",
      usageType: "Production",
      monthlyQueries: 12000,
      status: "Active",
    },
    {
      name: "Intern Kunnskapssøk",
      description: "Internal knowledge search",
      department: "HR & Operations",
      usageType: "Pilot",
      monthlyQueries: 3500,
      status: "Active",
    },
  ],
  "mrm-002": [
    {
      name: "Skadebehandling Assistent",
      description: "Claims decision support",
      department: "Claims",
      usageType: "Production",
      monthlyQueries: 28000,
      status: "Active",
    },
    {
      name: "Compliance Rapportgenerator",
      description: "Regulatory report generation",
      department: "Legal & Compliance",
      usageType: "Production",
      monthlyQueries: 5000,
      status: "Active",
    },
  ],
  "mrm-003": [
    {
      name: "Aktuaranalyse Bot",
      description: "Actuarial modelling support",
      department: "Actuarial",
      usageType: "Pilot",
      monthlyQueries: 8000,
      status: "Testing",
    },
    {
      name: "Kodeassistent",
      description: "Developer code assistance",
      department: "IT Development",
      usageType: "Internal Tool",
      monthlyQueries: 15000,
      status: "Active",
    },
  ],
  "mrm-004": [
    {
      name: "Markedsanalyse",
      description: "Market trend analysis",
      department: "Investment",
      usageType: "Production",
      monthlyQueries: 6500,
      status: "Active",
    },
    {
      name: "Multimodal Skadedokumentasjon",
      description: "Image-based claims analysis",
      department: "Claims",
      usageType: "Pilot",
      monthlyQueries: 2200,
      status: "Testing",
    },
  ],
  "mrm-005": [
    {
      name: "Europeisk Compliance Sjekk",
      description: "EU compliance verification",
      department: "Legal & Compliance",
      usageType: "Production",
      monthlyQueries: 4200,
      status: "Active",
    },
    {
      name: "Kontraktsanalyse",
      description: "Contract risk analysis",
      department: "Legal",
      usageType: "Pilot",
      monthlyQueries: 1800,
      status: "Testing",
    },
  ],
  "mrm-006": [
    {
      name: "Intern Dokumentsøk",
      description: "Internal document search",
      department: "Operations",
      usageType: "Internal Tool",
      monthlyQueries: 18000,
      status: "Active",
    },
    {
      name: "Opplæringsassistent",
      description: "Employee training support",
      department: "HR",
      usageType: "Pilot",
      monthlyQueries: 3000,
      status: "Active",
    },
  ],
  "mrm-007": [
    {
      name: "Samtaletranskribering",
      description: "Customer call transcription",
      department: "Customer Service",
      usageType: "Production",
      monthlyQueries: 22000,
      status: "Active",
    },
    {
      name: "Møtenotat Generator",
      description: "Meeting transcription",
      department: "All Departments",
      usageType: "Production",
      monthlyQueries: 8500,
      status: "Active",
    },
  ],
  "mrm-008": [
    {
      name: "Markedsføringsbilder",
      description: "Marketing image generation",
      department: "Marketing",
      usageType: "Internal Tool",
      monthlyQueries: 1500,
      status: "Active",
    },
    {
      name: "Produktvisualisering",
      description: "Product presentations",
      department: "Sales",
      usageType: "Pilot",
      monthlyQueries: 800,
      status: "Testing",
    },
  ],
}

export const publicAppsData: Record<
  string,
  Array<{
    name: string
    description: string
    category: string
    users: string
    website: string
  }>
> = {
  "mrm-001": [
    {
      name: "Microsoft Copilot",
      description: "AI assistant for Microsoft 365",
      category: "Productivity",
      users: "100M+",
      website: "copilot.microsoft.com",
    },
    {
      name: "Duolingo Max",
      description: "AI-powered language learning",
      category: "Education",
      users: "50M+",
      website: "duolingo.com",
    },
    {
      name: "Khan Academy Khanmigo",
      description: "AI tutor for learning",
      category: "Education",
      users: "10M+",
      website: "khanacademy.org",
    },
    {
      name: "Stripe Docs AI",
      description: "Docs search and code gen",
      category: "Developer Tools",
      users: "5M+",
      website: "stripe.com",
    },
  ],
  "mrm-002": [
    {
      name: "Notion AI",
      description: "AI writing and docs",
      category: "Productivity",
      users: "30M+",
      website: "notion.so",
    },
    {
      name: "Quillbot",
      description: "AI writing assistant",
      category: "Writing",
      users: "20M+",
      website: "quillbot.com",
    },
    {
      name: "Poe",
      description: "Multi-model AI chat",
      category: "Chat",
      users: "10M+",
      website: "poe.com",
    },
  ],
  "mrm-003": [
    {
      name: "Cursor",
      description: "AI-powered code editor",
      category: "Developer Tools",
      users: "1M+",
      website: "cursor.sh",
    },
    {
      name: "Perplexity",
      description: "AI-powered search",
      category: "Search",
      users: "15M+",
      website: "perplexity.ai",
    },
    {
      name: "OpenRouter",
      description: "Multi-model API",
      category: "Developer Tools",
      users: "500K+",
      website: "openrouter.ai",
    },
  ],
  "mrm-004": [
    {
      name: "Google Workspace",
      description: "AI in Docs, Sheets, Gmail",
      category: "Productivity",
      users: "3B+",
      website: "workspace.google.com",
    },
    {
      name: "Google Search",
      description: "AI-enhanced search",
      category: "Search",
      users: "5B+",
      website: "google.com",
    },
  ],
  "mrm-005": [
    {
      name: "Le Chat",
      description: "Mistral AI assistant",
      category: "Chat",
      users: "1M+",
      website: "chat.mistral.ai",
    },
    {
      name: "Hugging Face",
      description: "Model hosting platform",
      category: "Developer Tools",
      users: "2M+",
      website: "huggingface.co",
    },
  ],
  "mrm-006": [
    {
      name: "Meta AI",
      description: "AI in Facebook, WhatsApp",
      category: "Social",
      users: "500M+",
      website: "meta.ai",
    },
    {
      name: "Ollama",
      description: "Local LLM runner",
      category: "Developer Tools",
      users: "2M+",
      website: "ollama.ai",
    },
  ],
  "mrm-007": [
    {
      name: "Otter.ai",
      description: "Meeting transcription",
      category: "Productivity",
      users: "10M+",
      website: "otter.ai",
    },
    {
      name: "Descript",
      description: "Audio/video editing",
      category: "Media",
      users: "3M+",
      website: "descript.com",
    },
  ],
  "mrm-008": [
    {
      name: "Canva AI",
      description: "AI image generation",
      category: "Design",
      users: "150M+",
      website: "canva.com",
    },
    {
      name: "DreamStudio",
      description: "Stability AI platform",
      category: "Design",
      users: "10M+",
      website: "dreamstudio.ai",
    },
  ],
}

export const modelPricing: Record<
  string,
  {
    inputCost: string
    outputCost: string
    contextWindow: string
    pricingModel: string
    monthlyEstimate: string
    notes: string
  }
> = {
  "mrm-001": {
    inputCost: "$2.50/M tokens",
    outputCost: "$10.00/M tokens",
    contextWindow: "128K tokens",
    pricingModel: "Pay-per-use API",
    monthlyEstimate: "~NOK 45,000",
    notes: "Enterprise tier with volume discounts. GDPR DPA required.",
  },
  "mrm-002": {
    inputCost: "$3.00/M tokens",
    outputCost: "$15.00/M tokens",
    contextWindow: "200K tokens",
    pricingModel: "Pay-per-use API",
    monthlyEstimate: "~NOK 38,000",
    notes: "Enterprise agreements available. Strong privacy commitments.",
  },
  "mrm-003": {
    inputCost: "$0.24/M tokens",
    outputCost: "$0.38/M tokens",
    contextWindow: "164K tokens",
    pricingModel: "Pay-per-use (OpenRouter)",
    monthlyEstimate: "~NOK 5,200",
    notes: "Low cost. No enterprise SLA. Access via OpenRouter.",
  },
  "mrm-004": {
    inputCost: "$1.25/M tokens",
    outputCost: "$5.00/M tokens",
    contextWindow: "1M tokens",
    pricingModel: "Pay-per-use API",
    monthlyEstimate: "~NOK 22,000",
    notes: "Google Cloud integration. 1M context for large documents.",
  },
  "mrm-005": {
    inputCost: "$2.00/M tokens",
    outputCost: "$6.00/M tokens",
    contextWindow: "128K tokens",
    pricingModel: "Pay-per-use API",
    monthlyEstimate: "~NOK 15,000",
    notes: "EU-based. Strong GDPR alignment. Self-hosting available.",
  },
  "mrm-006": {
    inputCost: "$0.70/M tokens",
    outputCost: "$0.90/M tokens",
    contextWindow: "128K tokens",
    pricingModel: "Self-hosted / Cloud",
    monthlyEstimate: "~NOK 8,500",
    notes: "Open-source. Self-host for zero API costs.",
  },
  "mrm-007": {
    inputCost: "$0.006/min audio",
    outputCost: "N/A",
    contextWindow: "30s chunks",
    pricingModel: "Per-minute audio",
    monthlyEstimate: "~NOK 12,000",
    notes: "Self-hostable for privacy. Quality varies by language.",
  },
  "mrm-008": {
    inputCost: "$0.002/image",
    outputCost: "$0.02/image",
    contextWindow: "N/A",
    pricingModel: "Per-image",
    monthlyEstimate: "~NOK 3,500",
    notes: "Self-hostable. Fine-tuning available for brand imagery.",
  },
}
