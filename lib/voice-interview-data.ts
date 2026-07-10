// Voice Interview — seeded, deterministic demo script.
//
// Drives the simulated voice interview at /discover/voice-interview. An AI
// governance agent "voice-interviews" an employee; the transcript plays back
// theatrically (no real audio capture) and two AI use cases are documented
// from the conversation — one classic AI tool usage, one autonomous/agentic
// system. Content is illustrative English-only sample data, mirroring the
// AGENT_CONVERSATIONS pattern in aimaps-data.ts (UI chrome is translated via
// the `voiceInterview` i18n namespace; this script is not).

export type SpeakerRole = 'interviewer' | 'candidate'

export interface VoiceTurn {
  role: SpeakerRole
  text: string
  /** When this turn is reached, surface the extraction with this id. */
  reveals?: string
}

/** A documented classic AI-tool use case (à la UseCase). */
export interface AiUseCaseExtraction {
  kind: 'ai'
  name: string
  tool: string
  model: string
  department: string
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted'
  owner: string
  /** Short risk highlight, e.g. "Personal account · unmanaged". */
  flag: string
}

/** A documented autonomous/agentic system (à la DiscoveredAgent). */
export interface AgenticUseCaseExtraction {
  kind: 'agentic'
  name: string
  purpose: string
  /** What it was built with, e.g. "n8n + OpenAI". */
  framework: string
  autonomy: 'assisted' | 'supervised' | 'autonomous'
  /** System the agent writes to, e.g. "Salesforce". */
  writesTo: string
  protocol: 'mcp' | 'a2a' | 'none'
  approvalState: 'approved' | 'pending' | 'unregistered'
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted'
}

export type VoiceExtraction = AiUseCaseExtraction | AgenticUseCaseExtraction

export interface VoiceInterviewScript {
  candidate: { name: string; role: string; department: string; initials: string }
  estimatedMinutes: number
  turns: VoiceTurn[]
  /** Extractions keyed by the id referenced from a turn's `reveals`. */
  extractions: Record<string, VoiceExtraction>
}

export const VOICE_INTERVIEW: VoiceInterviewScript = {
  candidate: {
    name: 'Marcus Feld',
    role: 'Senior Manager',
    department: 'Revenue Operations',
    initials: 'MF',
  },
  estimatedMinutes: 3,
  turns: [
    {
      role: 'interviewer',
      text: "Hi Marcus, thanks for hopping on. I'm the AI governance assistant — this only takes about three minutes. To start: what AI tools do you use day to day in Revenue Operations?",
    },
    {
      role: 'candidate',
      text: 'Mainly ChatGPT. I use it to clean up and personalise the sales follow-up emails our reps send out.',
    },
    {
      role: 'interviewer',
      text: 'Got it. When you paste content in, does it ever include customer details — account names, deal sizes, contract terms?',
    },
    {
      role: 'candidate',
      text: 'Yeah, usually the account name and the deal amount so the email feels tailored. Sometimes the renewal date too.',
    },
    {
      role: 'interviewer',
      text: "Understood — that's customer commercial data. Which model is it, do you know? A personal account or the company workspace?",
    },
    {
      role: 'candidate',
      text: "It's my own ChatGPT Plus, GPT-4o. Not the company one — the team workspace felt slower so I just use mine.",
      reveals: 'ai',
    },
    {
      role: 'interviewer',
      text: "Thanks, that's helpful. Beyond chat tools — is anything running on its own, without you prompting it each time? An automation or an agent?",
    },
    {
      role: 'candidate',
      text: 'Actually yes. I built a little workflow in n8n that watches our shared inbox, drafts a quote with an LLM, and pushes it into Salesforce as a draft opportunity.',
    },
    {
      role: 'interviewer',
      text: 'So it acts end to end on its own? Does a human approve the quote before it reaches Salesforce, or does the agent write it directly?',
    },
    {
      role: 'candidate',
      text: 'It writes the draft opportunity directly. A rep reviews it later, but the agent creates the record on its own. It has been running for a couple of months.',
      reveals: 'agentic',
    },
    {
      role: 'interviewer',
      text: "That's exactly the kind of thing we want on the register. Does that workflow use any special connectors or protocol to reach Salesforce and the inbox?",
    },
    {
      role: 'candidate',
      text: 'It just uses the Salesforce API and a Gmail node — no fancy protocol, only the built-in integrations.',
    },
    {
      role: 'interviewer',
      text: "Perfect. I've documented two use cases from this — a personal ChatGPT workflow handling customer data, and an autonomous quote agent writing to Salesforce. I'll file both to the registry for review. Thanks, Marcus!",
    },
  ],
  extractions: {
    ai: {
      kind: 'ai',
      name: 'Sales email personalisation',
      tool: 'ChatGPT (personal account)',
      model: 'GPT-4o',
      department: 'Revenue Operations',
      dataClassification: 'confidential',
      owner: 'Marcus Feld',
      flag: 'Personal account · unmanaged',
    },
    agentic: {
      kind: 'agentic',
      name: 'Autonomous quote-drafting agent',
      purpose: 'Watches the shared inbox, drafts quotes with an LLM, and writes draft opportunities into Salesforce',
      framework: 'n8n + OpenAI',
      autonomy: 'autonomous',
      writesTo: 'Salesforce',
      protocol: 'none',
      approvalState: 'unregistered',
      dataClassification: 'confidential',
    },
  },
}
