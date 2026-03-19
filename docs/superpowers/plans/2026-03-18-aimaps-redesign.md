# AIMaps Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the ai-spm-dashboard into AIMaps — a use case-first AI governance platform with agent-driven discovery, relationship graph mapping, and a 5-step onboarding demo journey for the Ardoq CPO meeting.

**Architecture:** Next.js 15 App Router, all data in `/lib/` as TypeScript mock objects. The Map page (`/`) renders a force-directed SVG graph. A `DemoJourney` overlay mounts in the root layout and programmatically navigates through pages. No backend.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, react-force-graph-2d (dynamic import, ssr:false), framer-motion

---

## File Map

**Create:**
- `lib/aimaps-types.ts` — All TypeScript interfaces
- `lib/aimaps-data.ts` — 47 use cases, risks, mitigations, persons, agent conversations
- `components/use-case-graph.tsx` — Dynamic-imported force graph (ssr:false)
- `components/use-case-detail-panel.tsx` — Slide-in right panel
- `components/agent-conversation-card.tsx` — Animated typewriter chat thread
- `components/discovery-feed.tsx` — Live feed of conversations + extracted use cases
- `components/demo-journey.tsx` — Step overlay, mounts in root layout
- `components/risk-chip.tsx` — Coloured chip (OWASP/NIST/EU AI Act ref)
- `components/compliance-coverage-card.tsx` — Framework % card
- `components/owner-detail-panel.tsx` — Slide-in owner panel
- `app/discover/page.tsx` — Discover page
- `app/register/page.tsx` — Register page
- `app/owners/page.tsx` — Owners page
- `app/comply/page.tsx` — Comply page

**Modify:**
- `app/page.tsx` — Replace with Map page
- `app/layout.tsx` — New nav + DemoJourney overlay
- `components/app-header.tsx` — New 5-item nav (Map/Discover/Register/Owners/Comply)

**Delete (routes replaced):**
- `app/ai-governance/` → replaced by `/register`
- `app/ai-visibility/` → features merged into map/register
- `app/model-risk/` → replaced by `/comply`

---

## Task 1: Install Dependencies

**Files:** `package.json`

- [ ] Run: `npm install react-force-graph-2d framer-motion`
- [ ] Verify no peer dependency errors
- [ ] Commit: `chore: add react-force-graph-2d and framer-motion`

---

## Task 2: Data Types + Mock Data

**Files:**
- Create: `lib/aimaps-types.ts`
- Create: `lib/aimaps-data.ts`

- [ ] Create `lib/aimaps-types.ts`:

```typescript
export interface AIModel {
  id: string
  name: string
  provider: string
  type: 'llm' | 'classifier' | 'vision' | 'embedding'
}

export interface Mitigation {
  id: string
  name: string
  description: string
  status: 'applied' | 'pending' | 'not-applied'
  ownerId?: string
  dueDate?: string
}

export type ComplianceLevel = 'covered' | 'partial' | 'gap'

export interface ComplianceStatus {
  euAiAct: ComplianceLevel
  nistAiRmf: ComplianceLevel
  owaspLlm: ComplianceLevel
  iso42001: ComplianceLevel
}

export interface Risk {
  id: string
  name: string
  category: 'hallucination' | 'data-leakage' | 'prompt-injection' | 'bias' | 'ip-exposure' | 'compliance' | 'shadow-ai'
  severity: 'critical' | 'high' | 'medium' | 'low'
  owaspRef?: string
  nistRef?: string
  euAiActRef?: string
  mitigations: Mitigation[]
}

export interface Person {
  id: string
  name: string
  email: string
  department: string
  role: string
  useCaseIds: string[]
  assessmentsPending: number
  assessmentsComplete: number
}

export type UseCaseStatus = 'discovered' | 'assessed' | 'owned' | 'mitigated' | 'compliant'
export type DiscoveryMethod = 'agent-campaign' | 'self-register' | 'auto-detect' | 'shadow-ai'

export interface UseCase {
  id: string
  name: string
  description: string
  department: string
  models: AIModel[]
  ownerId: string | null
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted'
  risks: Risk[]
  mitigations: Mitigation[]
  complianceStatus: ComplianceStatus
  discoveryMethod: DiscoveryMethod
  status: UseCaseStatus
  createdAt: string
  lastReviewedAt: string
}

export type MessageRole = 'agent' | 'employee'

export interface Message {
  role: MessageRole
  text: string
  timestamp: string
  extracted?: string
}

export interface AgentConversation {
  id: string
  employeeId: string
  employeeName: string
  department: string
  channel: 'slack' | 'email' | 'web'
  status: 'in-progress' | 'complete' | 'no-response'
  messages: Message[]
  extractedUseCaseId: string | null
}
```

- [ ] Create `lib/aimaps-data.ts` with full mock dataset. Include:
  - `AI_MODELS`: GPT-4o, Claude 3.5 Sonnet, Gemini Pro, Llama 3, Mistral, GitHub Copilot
  - `PERSONS`: 10 people across 8 departments
  - `USE_CASES`: 35 registered use cases (5 per dept) + 12 shadow AI = 47 total
  - Each use case has 2-3 risks with mitigations and compliance status
  - `AGENT_CONVERSATIONS`: 8 conversations (one per dept), each with 3-4 message exchanges and extracted use case
  - `DISCOVERY_STATS`: `{ outreachSent: 142, responded: 89, useCasesFound: 47, shadowAiFound: 12, percentComplete: 100 }`

Full mock data structure example:
```typescript
import type { UseCase, Person, AgentConversation, AIModel } from './aimaps-types'

export const AI_MODELS: AIModel[] = [
  { id: 'gpt4o', name: 'GPT-4o', provider: 'OpenAI', type: 'llm' },
  { id: 'claude35', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', type: 'llm' },
  { id: 'gemini', name: 'Gemini Pro', provider: 'Google', type: 'llm' },
  { id: 'copilot', name: 'GitHub Copilot', provider: 'Microsoft', type: 'llm' },
  { id: 'llama3', name: 'Llama 3', provider: 'Meta', type: 'llm' },
  { id: 'mistral', name: 'Mistral Large', provider: 'Mistral AI', type: 'llm' },
]

export const PERSONS: Person[] = [
  { id: 'sarah-chen', name: 'Sarah Chen', email: 'sarah.chen@company.com', department: 'Legal', role: 'Senior Counsel', useCaseIds: ['contract-review', 'legal-brief-summariser', 'clause-extractor', 'compliance-checker', 'nda-drafting'], assessmentsPending: 2, assessmentsComplete: 3 },
  { id: 'james-okafor', name: 'James Okafor', email: 'james.okafor@company.com', department: 'IT', role: 'Engineering Lead', useCaseIds: ['code-assistant', 'infrastructure-monitoring', 'incident-summariser', 'security-log-analyser', 'deployment-describer'], assessmentsPending: 1, assessmentsComplete: 4 },
  { id: 'emma-fischer', name: 'Emma Fischer', email: 'emma.fischer@company.com', department: 'Claims', role: 'Claims Director', useCaseIds: ['fraud-detection', 'claims-triage', 'damage-assessment', 'claims-letter-gen', 'subrogation-analyser'], assessmentsPending: 3, assessmentsComplete: 2 },
  { id: 'alex-kumar', name: 'Alex Kumar', email: 'alex.kumar@company.com', department: 'Customer Service', role: 'CS Manager', useCaseIds: ['customer-chatbot', 'complaint-classifier', 'sentiment-tracker', 'response-suggester', 'faq-generator'], assessmentsPending: 0, assessmentsComplete: 5 },
  { id: 'priya-sharma', name: 'Priya Sharma', email: 'priya.sharma@company.com', department: 'HR', role: 'HR Director', useCaseIds: ['cv-screening', 'job-description-gen', 'interview-scorer', 'onboarding-assistant', 'salary-benchmarker'], assessmentsPending: 4, assessmentsComplete: 1 },
  { id: 'marco-rossi', name: 'Marco Rossi', email: 'marco.rossi@company.com', department: 'Finance', role: 'CFO', useCaseIds: ['report-generator', 'budget-forecasting', 'invoice-classifier', 'expense-anomaly', 'earnings-summariser'], assessmentsPending: 1, assessmentsComplete: 4 },
  { id: 'lisa-wang', name: 'Lisa Wang', email: 'lisa.wang@company.com', department: 'Risk & Compliance', role: 'CRO', useCaseIds: ['risk-scoring', 'regulatory-change', 'policy-gap', 'audit-trail', 'sanctions-screener'], assessmentsPending: 0, assessmentsComplete: 5 },
  { id: 'tom-bradley', name: 'Tom Bradley', email: 'tom.bradley@company.com', department: 'Underwriting', role: 'Chief Underwriter', useCaseIds: ['policy-risk', 'pricing-explainer', 'risk-appetite', 'portfolio-analyser', 'renewal-predictor'], assessmentsPending: 2, assessmentsComplete: 3 },
  { id: 'unowned-1', name: 'Unknown', email: '', department: 'Unknown', role: 'Unknown', useCaseIds: [], assessmentsPending: 0, assessmentsComplete: 0 },
]

// Use cases — build all 47. For brevity, here is the pattern:
export const USE_CASES: UseCase[] = [
  {
    id: 'contract-review',
    name: 'Contract Review AI',
    description: 'Uses GPT-4o to review and summarise legal contracts, flagging unusual clauses and risks for legal counsel review.',
    department: 'Legal',
    models: [AI_MODELS[0]],
    ownerId: 'sarah-chen',
    dataClassification: 'confidential',
    risks: [
      {
        id: 'r-hallucination-legal',
        name: 'Hallucination in legal analysis',
        category: 'hallucination',
        severity: 'critical',
        owaspRef: 'LLM09',
        nistRef: 'GOVERN 1.1',
        euAiActRef: 'Art. 9',
        mitigations: [
          { id: 'm1', name: 'Human review gate', description: 'All AI output reviewed by qualified legal counsel before use', status: 'applied' },
          { id: 'm2', name: 'Output confidence scoring', description: 'Flag low-confidence outputs for additional review', status: 'pending' },
        ],
      },
      {
        id: 'r-data-leak-legal',
        name: 'Confidential data sent to external LLM',
        category: 'data-leakage',
        severity: 'high',
        owaspRef: 'LLM06',
        nistRef: 'MANAGE 2.2',
        euAiActRef: 'Art. 10',
        mitigations: [
          { id: 'm3', name: 'Data minimisation policy', description: 'Strip PII and client names before sending to LLM', status: 'pending' },
        ],
      },
    ],
    mitigations: [],
    complianceStatus: { euAiAct: 'partial', nistAiRmf: 'partial', owaspLlm: 'covered', iso42001: 'gap' },
    discoveryMethod: 'agent-campaign',
    status: 'assessed',
    createdAt: '2026-03-10T09:00:00Z',
    lastReviewedAt: '2026-03-15T14:30:00Z',
  },
  // ... (implement remaining 46 use cases following the same pattern)
]

export const AGENT_CONVERSATIONS: AgentConversation[] = [
  {
    id: 'conv-legal',
    employeeId: 'sarah-chen',
    employeeName: 'Sarah Chen',
    department: 'Legal',
    channel: 'slack',
    status: 'complete',
    messages: [
      { role: 'agent', text: 'Hi Sarah — I\'m helping your security team understand how AI is being used across the organisation. Are you currently using any AI tools in your daily work?', timestamp: '2026-03-18T09:01:00Z' },
      { role: 'employee', text: 'Yes, we use ChatGPT for drafting contracts and summarising legal briefs.', timestamp: '2026-03-18T09:03:00Z' },
      { role: 'agent', text: 'Thanks! Does the contract text include any client-confidential information such as names, deal terms, or financial data?', timestamp: '2026-03-18T09:03:30Z' },
      { role: 'employee', text: 'Yes, client names and deal terms are included.', timestamp: '2026-03-18T09:05:00Z' },
      { role: 'agent', text: 'Got it. Who reviews the AI output before it\'s used — or does it go directly into documents?', timestamp: '2026-03-18T09:05:30Z' },
      { role: 'employee', text: 'I always review it, but junior associates sometimes use it directly.', timestamp: '2026-03-18T09:07:00Z', extracted: 'Use case extracted: Contract Review AI · GPT-4o · Confidential data · Owner: Sarah Chen' },
    ],
    extractedUseCaseId: 'contract-review',
  },
  {
    id: 'conv-it',
    employeeId: 'james-okafor',
    employeeName: 'James Okafor',
    department: 'IT',
    channel: 'slack',
    status: 'complete',
    messages: [
      { role: 'agent', text: 'Hi James — quick question from the security team. Is your engineering team using any AI coding assistants or automation tools?', timestamp: '2026-03-18T09:10:00Z' },
      { role: 'employee', text: 'Yes, GitHub Copilot for the whole team, and some people use Claude for code reviews.', timestamp: '2026-03-18T09:12:00Z' },
      { role: 'agent', text: 'Does Copilot have access to any proprietary internal codebases or API keys in the repo context?', timestamp: '2026-03-18T09:12:30Z' },
      { role: 'employee', text: 'It has access to our internal repos yes, including some that have config files.', timestamp: '2026-03-18T09:14:00Z', extracted: 'Use case extracted: Code Assistant · GitHub Copilot · Internal codebase · Owner: James Okafor' },
    ],
    extractedUseCaseId: 'code-assistant',
  },
  {
    id: 'conv-hr',
    employeeId: 'priya-sharma',
    employeeName: 'Priya Sharma',
    department: 'HR',
    channel: 'email',
    status: 'complete',
    messages: [
      { role: 'agent', text: 'Hi Priya, the security team is conducting an AI use case review. Does HR currently use any AI tools for recruitment or employee management?', timestamp: '2026-03-18T09:20:00Z' },
      { role: 'employee', text: 'Yes — we use an AI tool to screen CVs and rank candidates. Also using ChatGPT for writing job descriptions.', timestamp: '2026-03-18T09:45:00Z' },
      { role: 'agent', text: 'The CV screening tool — does it process any protected characteristics data like age, nationality, or gender from the CVs?', timestamp: '2026-03-18T09:46:00Z' },
      { role: 'employee', text: 'The CVs often include photos and dates of birth. We haven\'t configured it to ignore those.', timestamp: '2026-03-18T10:10:00Z', extracted: 'Use case extracted: CV Screening · AI Classifier · Sensitive personal data · Owner: Priya Sharma · HIGH RISK: Bias' },
    ],
    extractedUseCaseId: 'cv-screening',
  },
  {
    id: 'conv-shadow-1',
    employeeId: 'unowned-1',
    employeeName: 'Michael Torres',
    department: 'Finance',
    channel: 'web',
    status: 'complete',
    messages: [
      { role: 'agent', text: 'Hi Michael — I noticed ChatPDF was accessed from your machine using your corporate credentials. Are you using this for work purposes?', timestamp: '2026-03-18T10:00:00Z' },
      { role: 'employee', text: 'Oh yes, I use it to read client contracts and financial reports. It\'s much faster than reading the full PDFs.', timestamp: '2026-03-18T10:02:00Z' },
      { role: 'agent', text: 'Are those documents confidential? And was this tool approved by IT?', timestamp: '2026-03-18T10:02:30Z' },
      { role: 'employee', text: 'They\'re definitely confidential... I didn\'t know I needed approval. I just googled a tool that worked.', timestamp: '2026-03-18T10:04:00Z', extracted: '⚠️ Shadow AI detected: ChatPDF · Confidential contracts uploaded to unapproved external service · Owner: Michael Torres' },
    ],
    extractedUseCaseId: null,
  },
]

export const DISCOVERY_STATS = {
  outreachSent: 142,
  responded: 89,
  useCasesFound: 47,
  shadowAiFound: 12,
  percentComplete: 100,
}
```

- [ ] Commit: `feat: add AIMaps data types and mock dataset`

---

## Task 3: Shared Components — RiskChip + ComplianceCoverageCard

**Files:**
- Create: `components/risk-chip.tsx`
- Create: `components/compliance-coverage-card.tsx`

- [ ] Create `components/risk-chip.tsx`:

```tsx
import { cn } from '@/lib/utils'
import type { Risk } from '@/lib/aimaps-types'

const SEVERITY_STYLES = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-green-100 text-green-700 border-green-200',
}

interface RiskChipProps {
  risk: Risk
  showRef?: boolean
}

export function RiskChip({ risk, showRef = true }: RiskChipProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
      SEVERITY_STYLES[risk.severity]
    )}>
      {risk.name}
      {showRef && risk.owaspRef && (
        <span className="opacity-60 font-mono text-[10px]">{risk.owaspRef}</span>
      )}
    </span>
  )
}
```

- [ ] Create `components/compliance-coverage-card.tsx`:

```tsx
import type { ComplianceLevel } from '@/lib/aimaps-types'

const LEVEL_COLOR: Record<ComplianceLevel, string> = {
  covered: 'bg-green-500',
  partial: 'bg-yellow-400',
  gap: 'bg-red-400',
}

const LEVEL_LABEL: Record<ComplianceLevel, string> = {
  covered: 'Covered',
  partial: 'Partial',
  gap: 'Gap',
}

interface FrameworkCoverage {
  name: string
  percentage: number
  gapCount: number
  color: string
}

interface ComplianceCoverageCardProps {
  framework: FrameworkCoverage
}

export function ComplianceCoverageCard({ framework }: ComplianceCoverageCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-800">{framework.name}</span>
        <span className="text-lg font-bold" style={{ color: framework.color }}>
          {framework.percentage}%
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${framework.percentage}%`, backgroundColor: framework.color }}
        />
      </div>
      <div className="text-xs text-slate-500">
        {framework.gapCount} gaps remaining
      </div>
    </div>
  )
}
```

- [ ] Commit: `feat: add RiskChip and ComplianceCoverageCard components`

---

## Task 4: App Header + Layout

**Files:**
- Modify: `components/app-header.tsx`
- Modify: `app/layout.tsx`

- [ ] Replace `components/app-header.tsx` with new 5-item nav:

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', label: 'Map', icon: '🗺️' },
  { href: '/discover', label: 'Discover', icon: '🤖' },
  { href: '/register', label: 'Register', icon: '📋' },
  { href: '/owners', label: 'Owners', icon: '👤' },
  { href: '/comply', label: 'Comply', icon: '✅' },
]

interface AppHeaderProps {
  onStartDemo?: () => void
}

export function AppHeader({ onStartDemo }: AppHeaderProps) {
  const pathname = usePathname()

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-screen-xl mx-auto px-6 flex items-center gap-6 h-14">
        {/* Logo */}
        <div className="flex items-center gap-2 pr-6 border-r border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="text-sm font-bold text-slate-900">AIMaps</span>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1 flex-1">
          {NAV.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
                pathname === href
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              )}
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="bg-red-50 border border-red-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600">
            ⚠️ 12 critical
          </div>
          <button
            onClick={onStartDemo}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            ▶ Start Demo
          </button>
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
            JK
          </div>
        </div>
      </div>
    </header>
  )
}
```

- [ ] Update `app/layout.tsx` to mount `DemoJourney` (import will exist after Task 8) and pass `onStartDemo` to header. For now use the header without demo prop:

```tsx
import type { Metadata } from 'next'
import './globals.css'
import { AppHeader } from '@/components/app-header'

export const metadata: Metadata = {
  title: 'AIMaps — AI Use Case Governance',
  description: 'Map your organisation\'s AI use cases to risks, owners, and compliance frameworks',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen">
        <AppHeader />
        <main className="max-w-screen-xl mx-auto px-6 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
```

- [ ] Run `npm run dev`, verify new nav renders correctly
- [ ] Commit: `feat: update app header and layout for AIMaps navigation`

---

## Task 5: Map Page (/)

**Files:**
- Create: `components/use-case-graph.tsx`
- Create: `components/use-case-detail-panel.tsx`
- Modify: `app/page.tsx`

- [ ] Create `components/use-case-graph.tsx`. This component uses react-force-graph-2d with dynamic import:

```tsx
'use client'
import dynamic from 'next/dynamic'
import { useMemo, useCallback, useState } from 'react'
import type { UseCase, Person } from '@/lib/aimaps-types'

// Dynamic import to avoid SSR issues with canvas
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

interface GraphNode {
  id: string
  label: string
  type: 'usecase' | 'model' | 'owner' | 'risk' | 'mitigation'
  severity?: string
  val: number
  color: string
  data?: UseCase
}

interface GraphLink {
  source: string
  target: string
  type: 'uses' | 'owned-by' | 'has-risk' | 'has-mitigation'
  color: string
}

const NODE_COLORS = {
  usecase: '#6366f1',
  model: '#0ea5e9',
  owner: '#f59e0b',
  risk: '#ef4444',
  mitigation: '#22c55e',
}

interface UseCaseGraphProps {
  useCases: UseCase[]
  persons: Person[]
  filterDept?: string
  filterSeverity?: string
  onSelectUseCase: (uc: UseCase) => void
}

export function UseCaseGraph({ useCases, persons, filterDept, filterSeverity, onSelectUseCase }: UseCaseGraphProps) {
  const filtered = useMemo(() =>
    useCases.filter(uc =>
      (!filterDept || filterDept === 'all' || uc.department === filterDept) &&
      (!filterSeverity || filterSeverity === 'all' || uc.risks.some(r => r.severity === filterSeverity))
    ), [useCases, filterDept, filterSeverity])

  const { nodes, links } = useMemo(() => {
    const nodes: GraphNode[] = []
    const links: GraphLink[] = []
    const seenModels = new Set<string>()
    const seenOwners = new Set<string>()

    filtered.forEach(uc => {
      nodes.push({ id: uc.id, label: uc.name, type: 'usecase', val: 8 + uc.risks.length * 2, color: NODE_COLORS.usecase, data: uc })

      uc.models.forEach(m => {
        if (!seenModels.has(m.id)) {
          nodes.push({ id: m.id, label: m.name, type: 'model', val: 5, color: NODE_COLORS.model })
          seenModels.add(m.id)
        }
        links.push({ source: uc.id, target: m.id, type: 'uses', color: '#93c5fd' })
      })

      if (uc.ownerId) {
        const owner = persons.find(p => p.id === uc.ownerId)
        if (owner) {
          if (!seenOwners.has(owner.id)) {
            nodes.push({ id: owner.id, label: owner.name, type: 'owner', val: 5, color: NODE_COLORS.owner })
            seenOwners.add(owner.id)
          }
          links.push({ source: uc.id, target: owner.id, type: 'owned-by', color: '#fcd34d' })
        }
      }

      uc.risks.slice(0, 2).forEach(risk => {
        const riskNodeId = `${uc.id}-${risk.id}`
        nodes.push({ id: riskNodeId, label: risk.name, type: 'risk', severity: risk.severity, val: 4, color: NODE_COLORS.risk })
        links.push({ source: uc.id, target: riskNodeId, type: 'has-risk', color: '#fca5a5' })
      })
    })

    return { nodes, links }
  }, [filtered, persons])

  const handleNodeClick = useCallback((node: GraphNode) => {
    if (node.type === 'usecase' && node.data) {
      onSelectUseCase(node.data)
    }
  }, [onSelectUseCase])

  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-white border border-slate-200">
      <ForceGraph2D
        graphData={{ nodes, links }}
        nodeLabel="label"
        nodeColor={(n: GraphNode) => n.color}
        nodeVal={(n: GraphNode) => n.val}
        linkColor={(l: GraphLink) => l.color}
        linkWidth={1.5}
        onNodeClick={handleNodeClick}
        backgroundColor="#ffffff"
        width={undefined}
        height={undefined}
        nodeCanvasObject={(node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const label = node.label
          const fontSize = Math.max(10 / globalScale, 3)
          ctx.font = `${fontSize}px Sans-Serif`
          ctx.fillStyle = node.color
          ctx.beginPath()
          ctx.arc(node.x ?? 0, node.y ?? 0, node.val / 2, 0, 2 * Math.PI)
          ctx.fill()
          if (globalScale > 0.8) {
            ctx.fillStyle = '#1e293b'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.fillText(label.length > 15 ? label.substring(0, 14) + '…' : label, node.x ?? 0, (node.y ?? 0) + node.val / 2 + 2)
          }
        }}
      />
    </div>
  )
}
```

- [ ] Create `components/use-case-detail-panel.tsx`:

```tsx
'use client'
import { X } from 'lucide-react'
import type { UseCase, Person } from '@/lib/aimaps-types'
import { RiskChip } from './risk-chip'

const STATUS_LABEL: Record<string, string> = {
  discovered: 'Discovered',
  assessed: 'Assessed',
  owned: 'Owned',
  mitigated: 'Mitigated',
  compliant: 'Compliant',
}

const STATUS_COLOR: Record<string, string> = {
  discovered: 'bg-slate-100 text-slate-600',
  assessed: 'bg-blue-100 text-blue-700',
  owned: 'bg-yellow-100 text-yellow-700',
  mitigated: 'bg-purple-100 text-purple-700',
  compliant: 'bg-green-100 text-green-700',
}

interface UseCaseDetailPanelProps {
  useCase: UseCase
  owner: Person | undefined
  onClose: () => void
}

export function UseCaseDetailPanel({ useCase, owner, onClose }: UseCaseDetailPanelProps) {
  return (
    <div className="fixed right-0 top-14 bottom-0 w-96 bg-white border-l border-slate-200 shadow-xl z-30 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{useCase.name}</h2>
          <span className="text-xs text-slate-500">{useCase.department}</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 mt-0.5">
          <X size={18} />
        </button>
      </div>

      <div className="px-5 py-4 space-y-5">
        {/* Status */}
        <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[useCase.status]}`}>
          {STATUS_LABEL[useCase.status]}
        </span>

        {/* Description */}
        <p className="text-sm text-slate-600">{useCase.description}</p>

        {/* Model */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">AI Models</div>
          <div className="flex flex-wrap gap-1.5">
            {useCase.models.map(m => (
              <span key={m.id} className="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-2.5 py-0.5 rounded-full font-medium">
                {m.name}
              </span>
            ))}
          </div>
        </div>

        {/* Owner */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Owner</div>
          {owner ? (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
                {owner.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-800">{owner.name}</div>
                <div className="text-xs text-slate-500">{owner.role}</div>
              </div>
            </div>
          ) : (
            <span className="text-sm text-red-500 font-medium">⚠️ Unowned</span>
          )}
        </div>

        {/* Data classification */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Data Classification</div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            useCase.dataClassification === 'restricted' ? 'bg-red-100 text-red-700' :
            useCase.dataClassification === 'confidential' ? 'bg-orange-100 text-orange-700' :
            useCase.dataClassification === 'internal' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {useCase.dataClassification.charAt(0).toUpperCase() + useCase.dataClassification.slice(1)}
          </span>
        </div>

        {/* Risks */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Risks ({useCase.risks.length})</div>
          <div className="space-y-2">
            {useCase.risks.map(risk => (
              <div key={risk.id} className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                <RiskChip risk={risk} />
                <p className="text-xs text-slate-500 mt-1.5">{risk.name}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {risk.owaspRef && <span className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">OWASP {risk.owaspRef}</span>}
                  {risk.euAiActRef && <span className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">EU AI Act {risk.euAiActRef}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mitigations */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Mitigations</div>
          <div className="space-y-1.5">
            {useCase.risks.flatMap(r => r.mitigations).map(m => (
              <div key={m.id} className="flex items-start gap-2">
                <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  m.status === 'applied' ? 'bg-green-100 text-green-700' :
                  m.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {m.status === 'applied' ? '✓' : m.status === 'pending' ? '…' : '○'}
                </span>
                <div>
                  <div className="text-xs font-medium text-slate-700">{m.name}</div>
                  <div className="text-xs text-slate-400">{m.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] Replace `app/page.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { USE_CASES, PERSONS, DISCOVERY_STATS } from '@/lib/aimaps-data'
import { UseCaseGraph } from '@/components/use-case-graph'
import { UseCaseDetailPanel } from '@/components/use-case-detail-panel'
import type { UseCase } from '@/lib/aimaps-types'

const DEPARTMENTS = ['all', ...Array.from(new Set(USE_CASES.map(uc => uc.department)))]
const SEVERITIES = ['all', 'critical', 'high', 'medium', 'low']

export default function MapPage() {
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null)
  const [filterDept, setFilterDept] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')

  const criticalCount = USE_CASES.flatMap(uc => uc.risks).filter(r => r.severity === 'critical').length
  const ownedCount = USE_CASES.filter(uc => uc.ownerId).length
  const euCoverage = Math.round(USE_CASES.filter(uc => uc.complianceStatus.euAiAct === 'covered').length / USE_CASES.length * 100)
  const owner = selectedUseCase ? PERSONS.find(p => p.id === selectedUseCase.ownerId) : undefined

  return (
    <div>
      {/* Page title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">AI Use Case Map</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {DISCOVERY_STATS.useCasesFound} use cases discovered across 8 departments · Last updated by AI Agent
          </p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Use Cases', value: DISCOVERY_STATS.useCasesFound, color: 'text-indigo-600', sub: '+8 this week', subColor: 'text-green-600' },
          { label: 'Critical Risks', value: criticalCount, color: 'text-red-500', sub: '3 unowned', subColor: 'text-red-400' },
          { label: 'Owners Assigned', value: ownedCount, color: 'text-sky-600', sub: `${USE_CASES.length - ownedCount} pending`, subColor: 'text-amber-500' },
          { label: 'EU AI Act', value: `${euCoverage}%`, color: 'text-green-600', sub: 'coverage', subColor: 'text-slate-400' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">{kpi.label}</div>
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className={`text-xs mt-0.5 ${kpi.subColor}`}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-medium text-slate-500">Filter:</span>
        <select
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d === 'all' ? 'All Departments' : d}</option>)}
        </select>
        <select
          value={filterSeverity}
          onChange={e => setFilterSeverity(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {SEVERITIES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Risk Levels' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>

        {/* Legend */}
        <div className="ml-auto flex items-center gap-4">
          {[
            { color: '#6366f1', label: 'Use Case' },
            { color: '#0ea5e9', label: 'AI Model' },
            { color: '#f59e0b', label: 'Owner' },
            { color: '#ef4444', label: 'Risk' },
            { color: '#22c55e', label: 'Mitigation' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Graph */}
      <div style={{ height: 'calc(100vh - 320px)', minHeight: '400px' }}>
        <UseCaseGraph
          useCases={USE_CASES}
          persons={PERSONS}
          filterDept={filterDept}
          filterSeverity={filterSeverity}
          onSelectUseCase={setSelectedUseCase}
        />
      </div>

      {/* Detail panel */}
      {selectedUseCase && (
        <UseCaseDetailPanel
          useCase={selectedUseCase}
          owner={owner}
          onClose={() => setSelectedUseCase(null)}
        />
      )}
    </div>
  )
}
```

- [ ] Run `npm run dev`, verify map renders with nodes
- [ ] Commit: `feat: add Map page with force-directed use case graph`

---

## Task 6: Discover Page

**Files:**
- Create: `components/agent-conversation-card.tsx`
- Create: `components/discovery-feed.tsx`
- Create: `app/discover/page.tsx`

- [ ] Create `components/agent-conversation-card.tsx`:

```tsx
'use client'
import { useState, useEffect } from 'react'
import type { AgentConversation } from '@/lib/aimaps-types'

interface AgentConversationCardProps {
  conversation: AgentConversation
  autoPlay?: boolean
  delay?: number
}

const CHANNEL_ICON = { slack: '💬', email: '📧', web: '🌐' }
const STATUS_STYLE = {
  complete: 'bg-green-100 text-green-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  'no-response': 'bg-slate-100 text-slate-500',
}

export function AgentConversationCard({ conversation, autoPlay = false, delay = 0 }: AgentConversationCardProps) {
  const [visibleCount, setVisibleCount] = useState(autoPlay ? 0 : conversation.messages.length)

  useEffect(() => {
    if (!autoPlay) return
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setVisibleCount(c => {
          if (c >= conversation.messages.length) {
            clearInterval(interval)
            return c
          }
          return c + 1
        })
      }, 1200)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timeout)
  }, [autoPlay, delay, conversation.messages.length])

  const visibleMessages = conversation.messages.slice(0, visibleCount)
  const lastExtracted = visibleMessages.findLast(m => m.extracted)

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{CHANNEL_ICON[conversation.channel]}</span>
          <div>
            <div className="text-sm font-semibold text-slate-800">{conversation.employeeName}</div>
            <div className="text-xs text-slate-500">{conversation.department}</div>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[conversation.status]}`}>
          {conversation.status === 'in-progress' ? 'In progress' : conversation.status === 'complete' ? 'Complete' : 'No response'}
        </span>
      </div>

      {/* Messages */}
      <div className="space-y-2">
        {visibleMessages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'agent' ? '' : 'flex-row-reverse'}`}>
            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
              msg.role === 'agent' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {msg.role === 'agent' ? 'AI' : msg.role === 'employee' ? conversation.employeeName[0] : '?'}
            </div>
            <div className={`text-xs px-3 py-2 rounded-xl max-w-xs leading-relaxed ${
              msg.role === 'agent'
                ? 'bg-indigo-50 text-indigo-800 rounded-tl-none'
                : 'bg-slate-100 text-slate-700 rounded-tr-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Extracted badge */}
        {lastExtracted?.extracted && (
          <div className="mt-2 text-[10px] font-medium text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
            ✓ {lastExtracted.extracted}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] Create `app/discover/page.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { AGENT_CONVERSATIONS, DISCOVERY_STATS } from '@/lib/aimaps-data'
import { AgentConversationCard } from '@/components/agent-conversation-card'

export default function DiscoverPage() {
  const [campaignLaunched, setCampaignLaunched] = useState(false)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Discover</h1>
        <p className="text-sm text-slate-500 mt-0.5">AI agents interview your employees to map AI use cases — no forms, no manual entry</p>
      </div>

      {/* Entry point cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: '📡',
            title: 'CISO Discovery Campaign',
            description: 'Send AI agents to interview all departments. Agents ask about AI tool usage, data handling, and risk exposure.',
            action: 'Launch Campaign',
            color: 'indigo',
            onClick: () => setCampaignLaunched(true),
          },
          {
            icon: '🔗',
            title: 'Employee Self-Register',
            description: 'Share a link with staff. An AI agent interviews them conversationally and extracts use case data automatically.',
            action: 'Copy Link',
            color: 'sky',
            onClick: () => {},
          },
          {
            icon: '🔍',
            title: 'Auto-Detect (Okta)',
            description: '12 new AI tools detected in your SaaS estate this week. Click to trigger intake agents for unknown tools.',
            action: 'Review Alerts',
            color: 'amber',
            badge: '12 new',
            onClick: () => {},
          },
        ].map(card => (
          <div key={card.title} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="text-2xl mb-3">{card.icon}</div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">{card.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">{card.description}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={card.onClick}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  card.color === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' :
                  card.color === 'sky' ? 'bg-sky-100 hover:bg-sky-200 text-sky-700' :
                  'bg-amber-100 hover:bg-amber-200 text-amber-700'
                }`}
              >
                {card.action}
              </button>
              {card.badge && (
                <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{card.badge}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Outreach Sent', value: DISCOVERY_STATS.outreachSent, color: 'text-slate-800' },
          { label: 'Responded', value: DISCOVERY_STATS.responded, color: 'text-sky-600' },
          { label: 'Use Cases Found', value: DISCOVERY_STATS.useCasesFound, color: 'text-indigo-600' },
          { label: 'Shadow AI Detected', value: DISCOVERY_STATS.shadowAiFound, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Conversation feed */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Agent Conversations</h2>
        <div className="grid grid-cols-2 gap-4">
          {AGENT_CONVERSATIONS.map((conv, i) => (
            <AgentConversationCard
              key={conv.id}
              conversation={conv}
              autoPlay={campaignLaunched}
              delay={i * 800}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] Commit: `feat: add Discover page with agent conversation feed`

---

## Task 7: Register Page

**Files:**
- Create: `app/register/page.tsx`

- [ ] Create `app/register/page.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { USE_CASES, PERSONS } from '@/lib/aimaps-data'
import { RiskChip } from '@/components/risk-chip'
import type { UseCase } from '@/lib/aimaps-types'

const STATUS_LABEL: Record<string, string> = {
  discovered: 'Discovered', assessed: 'Assessed', owned: 'Owned', mitigated: 'Mitigated', compliant: 'Compliant',
}
const STATUS_COLOR: Record<string, string> = {
  discovered: 'bg-slate-100 text-slate-600', assessed: 'bg-blue-100 text-blue-700',
  owned: 'bg-yellow-100 text-yellow-700', mitigated: 'bg-purple-100 text-purple-700',
  compliant: 'bg-green-100 text-green-700',
}

export default function RegisterPage() {
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const depts = ['all', ...Array.from(new Set(USE_CASES.map(uc => uc.department)))]

  const filtered = USE_CASES.filter(uc =>
    (filterDept === 'all' || uc.department === filterDept) &&
    (filterStatus === 'all' || uc.status === filterStatus) &&
    (!search || uc.name.toLowerCase().includes(search.toLowerCase()) || uc.department.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Register</h1>
          <p className="text-sm text-slate-500 mt-0.5">{USE_CASES.length} use cases · {USE_CASES.filter(uc => uc.discoveryMethod === 'shadow-ai').length} shadow AI</p>
        </div>
        <button className="text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg">
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search use cases..."
          className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
        />
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {depts.map(d => <option key={d} value={d}>{d === 'all' ? 'All Departments' : d}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {['all','discovered','assessed','owned','mitigated','compliant'].map(s => (
            <option key={s} value={s}>{s === 'all' ? 'All Statuses' : STATUS_LABEL[s]}</option>
          ))}
        </select>
        <div className="ml-auto text-xs text-slate-400 flex items-center">{filtered.length} results</div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Use Case', 'Department', 'Model', 'Owner', 'Top Risk', 'Status'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(uc => {
              const owner = PERSONS.find(p => p.id === uc.ownerId)
              const topRisk = uc.risks.sort((a, b) =>
                ['critical','high','medium','low'].indexOf(a.severity) - ['critical','high','medium','low'].indexOf(b.severity)
              )[0]

              return (
                <>
                  <tr
                    key={uc.id}
                    className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setExpanded(expanded === uc.id ? null : uc.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 text-sm">{uc.name}</div>
                      {uc.discoveryMethod === 'shadow-ai' && (
                        <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">Shadow AI</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{uc.department}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{uc.models.map(m => m.name).join(', ')}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{owner?.name ?? <span className="text-red-400">Unowned</span>}</td>
                    <td className="px-4 py-3">{topRisk ? <RiskChip risk={topRisk} showRef={false} /> : <span className="text-xs text-slate-300">—</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[uc.status]}`}>
                        {STATUS_LABEL[uc.status]}
                      </span>
                    </td>
                  </tr>
                  {expanded === uc.id && (
                    <tr key={`${uc.id}-exp`} className="bg-slate-50">
                      <td colSpan={6} className="px-6 py-4">
                        <p className="text-xs text-slate-600 mb-2">{uc.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {uc.risks.map(r => <RiskChip key={r.id} risk={r} />)}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] Commit: `feat: add Register page with filterable use case table`

---

## Task 8: Owners Page

**Files:**
- Create: `components/owner-detail-panel.tsx`
- Create: `app/owners/page.tsx`

- [ ] Create `components/owner-detail-panel.tsx`:

```tsx
'use client'
import { X } from 'lucide-react'
import type { Person, UseCase } from '@/lib/aimaps-types'

interface OwnerDetailPanelProps {
  person: Person
  useCases: UseCase[]
  onClose: () => void
}

export function OwnerDetailPanel({ person, useCases, onClose }: OwnerDetailPanelProps) {
  const personUseCases = useCases.filter(uc => uc.ownerId === person.id)

  return (
    <div className="fixed right-0 top-14 bottom-0 w-96 bg-white border-l border-slate-200 shadow-xl z-30 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700">
            {person.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">{person.name}</h2>
            <p className="text-xs text-slate-500">{person.role} · {person.department}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 mt-1">
          <X size={18} />
        </button>
      </div>

      <div className="px-5 py-4 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-yellow-600">{person.assessmentsPending}</div>
            <div className="text-xs text-slate-500 mt-0.5">Pending</div>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-green-600">{person.assessmentsComplete}</div>
            <div className="text-xs text-slate-500 mt-0.5">Completed</div>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Use Cases ({personUseCases.length})
          </div>
          <div className="space-y-2">
            {personUseCases.map(uc => (
              <div key={uc.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50">
                <div className="text-sm font-medium text-slate-800">{uc.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {uc.risks.length} risks · {uc.models.map(m => m.name).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {person.assessmentsPending > 0 && (
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
            Send Assessment Reminder
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] Create `app/owners/page.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { PERSONS, USE_CASES } from '@/lib/aimaps-data'
import { OwnerDetailPanel } from '@/components/owner-detail-panel'
import type { Person } from '@/lib/aimaps-types'

export default function OwnersPage() {
  const [selected, setSelected] = useState<Person | null>(null)
  const unownedCount = USE_CASES.filter(uc => !uc.ownerId).length
  const totalPending = PERSONS.reduce((sum, p) => sum + p.assessmentsPending, 0)
  const totalComplete = PERSONS.reduce((sum, p) => sum + p.assessmentsComplete, 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Owners</h1>
        <p className="text-sm text-slate-500 mt-0.5">People accountable for AI use cases across the organisation</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Owners', value: PERSONS.length - 1, color: 'text-indigo-600' },
          { label: 'Pending Assessments', value: totalPending, color: 'text-amber-600' },
          { label: 'Completed', value: totalComplete, color: 'text-green-600' },
          { label: 'Unowned Use Cases', value: unownedCount, color: 'text-red-500' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">{kpi.label}</div>
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Notify all button */}
      {totalPending > 0 && (
        <div className="mb-4">
          <button className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
            🤖 Notify All Pending Owners via AI Agent
          </button>
        </div>
      )}

      {/* Owners table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Owner', 'Department', 'Use Cases', 'Pending', 'Completed', ''].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERSONS.filter(p => p.id !== 'unowned-1').map(person => (
              <tr key={person.id} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => setSelected(person)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{person.name}</div>
                      <div className="text-xs text-slate-400">{person.role}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{person.department}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{person.useCaseIds.length}</td>
                <td className="px-4 py-3">
                  {person.assessmentsPending > 0
                    ? <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{person.assessmentsPending}</span>
                    : <span className="text-xs text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{person.assessmentsComplete}</span>
                </td>
                <td className="px-4 py-3 text-xs text-indigo-500">View →</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <OwnerDetailPanel person={selected} useCases={USE_CASES} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
```

- [ ] Commit: `feat: add Owners page with accountability table and detail panel`

---

## Task 9: Comply Page

**Files:**
- Create: `app/comply/page.tsx`

- [ ] Create `app/comply/page.tsx`:

```tsx
'use client'
import { USE_CASES } from '@/lib/aimaps-data'
import { ComplianceCoverageCard } from '@/components/compliance-coverage-card'

const FRAMEWORKS = [
  { key: 'euAiAct', name: 'EU AI Act', percentage: 73, gapCount: 13, color: '#22c55e' },
  { key: 'nistAiRmf', name: 'NIST AI RMF', percentage: 61, gapCount: 18, color: '#0ea5e9' },
  { key: 'owaspLlm', name: 'OWASP LLM Top 10', percentage: 48, gapCount: 24, color: '#f59e0b' },
  { key: 'iso42001', name: 'ISO 42001', percentage: 55, gapCount: 21, color: '#8b5cf6' },
] as const

const LEVEL_BADGE: Record<string, string> = {
  covered: 'bg-green-100 text-green-700',
  partial: 'bg-yellow-100 text-yellow-700',
  gap: 'bg-red-100 text-red-700',
}

export default function ComplyPage() {
  const gapUseCases = USE_CASES.filter(uc =>
    uc.complianceStatus.euAiAct === 'gap' ||
    uc.complianceStatus.nistAiRmf === 'gap' ||
    uc.complianceStatus.owaspLlm === 'gap'
  ).slice(0, 12)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Comply</h1>
          <p className="text-sm text-slate-500 mt-0.5">Framework coverage across all AI use cases</p>
        </div>
        <button className="text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg">
          Export Compliance Report
        </button>
      </div>

      {/* Framework cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {FRAMEWORKS.map(fw => (
          <ComplianceCoverageCard key={fw.key} framework={fw} />
        ))}
      </div>

      {/* Gap table */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Compliance Gaps — Action Required</h2>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Use Case', 'Department', 'EU AI Act', 'NIST AI RMF', 'OWASP LLM', 'Action'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gapUseCases.map(uc => (
                <tr key={uc.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{uc.name}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{uc.department}</td>
                  {(['euAiAct', 'nistAiRmf', 'owaspLlm'] as const).map(fw => (
                    <td key={fw} className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEVEL_BADGE[uc.complianceStatus[fw]]}`}>
                        {uc.complianceStatus[fw].charAt(0).toUpperCase() + uc.complianceStatus[fw].slice(1)}
                      </span>
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                      Assign remediation →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
```

- [ ] Commit: `feat: add Comply page with framework coverage and gap table`

---

## Task 10: Demo Journey Overlay

**Files:**
- Create: `components/demo-journey.tsx`
- Modify: `app/layout.tsx`

- [ ] Create `components/demo-journey.tsx`:

```tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const STEPS = [
  {
    step: 1,
    route: '/',
    title: 'Your org has no AI map yet',
    body: 'You\'re starting from zero — like every CISO does. Let\'s find out what AI your organisation is actually using.',
    cta: 'Launch Discovery Agent →',
    duration: 30,
  },
  {
    step: 2,
    route: '/discover',
    title: 'AI Agent is interviewing your employees',
    body: 'Agents are reaching out across Slack and email. Watch as they extract use cases from natural conversations — no forms, no surveys.',
    cta: 'See the map populate →',
    duration: 90,
  },
  {
    step: 3,
    route: '/',
    title: '47 use cases mapped. 12 critical risks identified.',
    body: 'All from agent conversations. No manual entry. Click any node to explore the full risk picture for that use case.',
    cta: 'Assign ownership →',
    duration: 60,
  },
  {
    step: 4,
    route: '/owners',
    title: 'Owners identified and notified',
    body: 'AI suggested owners based on who reported each use case. One click to confirm. Agents automatically send each owner their risk assessment tasks.',
    cta: 'See compliance coverage →',
    duration: 45,
  },
  {
    step: 5,
    route: '/comply',
    title: 'From 0% to 73% EU AI Act coverage — this session.',
    body: 'Every use case is mapped to the frameworks that matter. Gaps are visible. Remediations are one click away. Your AI is now governed.',
    cta: 'Finish demo',
    duration: 45,
    final: true,
  },
]

interface DemoJourneyProps {
  onClose: () => void
}

export function DemoJourney({ onClose }: DemoJourneyProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const step = STEPS[currentStep]

  useEffect(() => {
    router.push(step.route)
  }, [currentStep, step.route, router])

  const handleNext = () => {
    if (step.final) {
      onClose()
      return
    }
    setCurrentStep(s => s + 1)
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-indigo-100 p-5">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-4">
          {STEPS.map((s, i) => (
            <div
              key={s.step}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i < currentStep ? 'bg-indigo-500' : i === currentStep ? 'bg-indigo-300' : 'bg-slate-100'
              }`}
            />
          ))}
          <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600 text-xs">✕</button>
        </div>

        {/* Step label */}
        <div className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">
          Step {step.step} of {STEPS.length} · ~{step.duration}s
        </div>

        {/* Content */}
        <h3 className="text-sm font-bold text-slate-900 mb-1">{step.title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">{step.body}</p>

        {/* CTA */}
        <button
          onClick={handleNext}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          {step.cta}
        </button>
      </div>
    </div>
  )
}
```

- [ ] Update `app/layout.tsx` to wire up `DemoJourney`:

```tsx
'use client'
import './globals.css'
import { useState } from 'react'
import { AppHeader } from '@/components/app-header'
import { DemoJourney } from '@/components/demo-journey'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [demoActive, setDemoActive] = useState(false)

  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen">
        <AppHeader onStartDemo={() => setDemoActive(true)} />
        <main className="max-w-screen-xl mx-auto px-6 py-6">
          {children}
        </main>
        {demoActive && <DemoJourney onClose={() => setDemoActive(false)} />}
      </body>
    </html>
  )
}
```

Note: layout.tsx with `'use client'` means metadata must be moved to a separate file. Remove the `export const metadata` from this file and create `app/metadata.ts` with:
```typescript
import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'AIMaps — AI Use Case Governance',
  description: 'Map your organisation\'s AI use cases to risks, owners, and compliance frameworks',
}
```
Actually in Next.js 15, you can't export metadata from a 'use client' layout. Instead, keep layout as server component and pass `onStartDemo` via a client wrapper. Create `components/demo-wrapper.tsx` as a client component that wraps `AppHeader` + `DemoJourney` state together, and import it into the server layout.

Create `components/demo-wrapper.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { AppHeader } from './app-header'
import { DemoJourney } from './demo-journey'

export function DemoWrapper() {
  const [demoActive, setDemoActive] = useState(false)
  return (
    <>
      <AppHeader onStartDemo={() => setDemoActive(true)} />
      {demoActive && <DemoJourney onClose={() => setDemoActive(false)} />}
    </>
  )
}
```

Then `app/layout.tsx` stays as a server component:
```tsx
import type { Metadata } from 'next'
import './globals.css'
import { DemoWrapper } from '@/components/demo-wrapper'

export const metadata: Metadata = {
  title: 'AIMaps — AI Use Case Governance',
  description: 'Map your organisation\'s AI use cases to risks, owners, and compliance frameworks',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen">
        <DemoWrapper />
        <main className="max-w-screen-xl mx-auto px-6 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
```

- [ ] Run `npm run dev`, click "Start Demo", verify 5-step journey navigates correctly
- [ ] Commit: `feat: add demo journey overlay component`

---

## Task 11: Expand Mock Data to 47 Use Cases

**Files:**
- Modify: `lib/aimaps-data.ts`

Complete all 47 use cases. See Task 12 (now removed — this IS that task). Must be done before the build check.

- [ ] Complete all 47 use cases in `lib/aimaps-data.ts`
- [ ] Verify `USE_CASES.length === 47` in browser console
- [ ] Commit: `feat: complete 47 use case mock dataset`

---

## Task 12: Remove Old Routes + Final Polish

**Files:**
- Delete: `app/ai-governance/`
- Delete: `app/ai-visibility/`
- Delete: `app/model-risk/`
- Delete old data files if unused

- [ ] Delete old route directories:
```bash
rm -rf app/ai-governance app/ai-visibility app/model-risk
```

- [ ] Add `.gitignore` entry for `.superpowers/`:
```bash
echo ".superpowers/" >> .gitignore
```

- [ ] Run `npm run build` and fix any TypeScript errors
- [ ] Final check: all 5 nav pages load, demo journey runs end-to-end, graph renders with nodes
- [ ] Commit: `feat: remove legacy routes, final AIMaps build ready for demo`

---

## Task 12: Expand Mock Data to 47 Use Cases

**Files:**
- Modify: `lib/aimaps-data.ts`

This task fills in the remaining use cases to reach the full 47. The pattern established in Task 2 must be followed for all entries. Each use case needs: id, name, description, department, models, ownerId, dataClassification, risks (2-3 each), mitigations, complianceStatus, discoveryMethod, status.

Departments and their 5 use cases each (already have Legal's 5, IT's, Claims', CS's, HR's, Finance's, Risk's, Underwriting's stubs — flesh out all with realistic descriptions and risks appropriate to department).

Shadow AI use cases (12): discoveryMethod='shadow-ai', ownerId=null, status='discovered'. These represent: ChatPDF, Notion AI, Grammarly, unlicensed GitHub Copilot, Midjourney, Perplexity, Claude.ai personal, Otter.ai, Whisper, Jasper, Copy.ai, ChatGPT personal.

- [ ] Complete all 47 use cases in `lib/aimaps-data.ts`
- [ ] Verify `USE_CASES.length === 47` in browser console
- [ ] Commit: `feat: complete 47 use case mock dataset`
