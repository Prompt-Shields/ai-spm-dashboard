# AIMaps — AI Use Case Governance Platform
**Design Spec · 2026-03-18**

---

## Overview

AIMaps is a use case-first AI governance platform that maps an organisation's AI usage to risks, mitigations, ownership, and compliance frameworks. It is differentiated from Ardoq by:

1. **AI agents gather information** — no manual data entry; agents interview employees via Slack, email, or web chat
2. **Use case as atomic unit** — not systems or components; everything maps from "what humans do with AI"
3. **Owner accountability** — owners are identified, notified, and guided through risk assessments, not just named
4. **AI-native risk framework** — pre-mapped to OWASP LLM Top 10, NIST AI RMF, EU AI Act, ISO 42001
5. **Guided secure adoption** — prescriptive mitigations per risk type, tracked per use case

**Positioning:** "Ardoq maps your architecture. AIMaps maps your AI behaviour."

---

## Source Repos

- **Primary:** `ai-spm-dashboard` — Next.js 15 + React 19 + TypeScript + Tailwind + shadcn/ui
- **Merge in:** `claude-ai-governance-dashboard` — extract agent chat UI patterns and dark theme elements

---

## Product Name

**AIMaps** (working title). Header updated from "AI SPM Dashboard" to "AIMaps".

---

## Navigation Structure

Five top-level pages:

| Route | Name | Purpose |
|-------|------|---------|
| `/` | Map | Relationship graph homepage — the living state of the org's AI |
| `/discover` | Discover | Agent intake campaigns and live discovery feed |
| `/register` | Register | Filterable use case table with risk scores and ownership status |
| `/owners` | Owners | People directory with AI accountability and assessment tasks |
| `/comply` | Comply | Compliance framework coverage (EU AI Act, NIST AI RMF, OWASP) |

The existing routes (`/ai-governance`, `/ai-visibility`, `/model-risk`) are replaced. The overview page (`/`) becomes the Map.

---

## Design System

- **Style:** Modern SaaS — clean white, subtle card shadows, Linear/Notion aesthetic
- **Primary colour:** Indigo `#6366f1`
- **Status colours:** Red `#ef4444` (risk/critical), Amber `#f59e0b` (warning/pending), Green `#22c55e` (safe/compliant), Blue `#0ea5e9` (info/model)
- **Typography:** Existing Tailwind defaults (sans-serif system font)
- **Components:** shadcn/ui primitives, extended with new custom components

---

## Data Model

### UseCase
```typescript
interface UseCase {
  id: string
  name: string
  description: string
  department: string
  models: AIModel[]           // AI models used
  owner: Person | null
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted'
  risks: Risk[]
  mitigations: Mitigation[]
  complianceStatus: ComplianceStatus
  discoveryMethod: 'agent-campaign' | 'self-register' | 'auto-detect'
  status: 'discovered' | 'assessed' | 'owned' | 'mitigated' | 'compliant'
  createdAt: string
  lastReviewedAt: string
}
```

### AIModel
```typescript
interface AIModel {
  id: string
  name: string
  provider: string
  type: 'llm' | 'classifier' | 'vision' | 'embedding'
}
```

### Mitigation
```typescript
interface Mitigation {
  id: string
  name: string
  description: string
  status: 'applied' | 'pending' | 'not-applied'
  ownerId?: string
  dueDate?: string
}
```

### ComplianceStatus
```typescript
interface ComplianceStatus {
  euAiAct: 'covered' | 'partial' | 'gap'
  nistAiRmf: 'covered' | 'partial' | 'gap'
  owaspLlm: 'covered' | 'partial' | 'gap'
  iso42001: 'covered' | 'partial' | 'gap'
}
```

### Risk
```typescript
interface Risk {
  id: string
  name: string
  category: 'hallucination' | 'data-leakage' | 'prompt-injection' | 'bias' | 'ip-exposure' | 'compliance' | 'shadow-ai'
  severity: 'critical' | 'high' | 'medium' | 'low'
  owaspRef: string | null      // e.g. "LLM01"
  nistRef: string | null
  euAiActRef: string | null
  mitigations: Mitigation[]
}
```

### Person
```typescript
interface Person {
  id: string
  name: string
  email: string
  department: string
  role: string
  useCases: string[]           // UseCase IDs
  assessmentsPending: number
  assessmentsComplete: number
}
```

### AgentConversation
```typescript
interface AgentConversation {
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

---

## Pages

### 1. Map (`/`)

**Purpose:** The relationship graph showing all use cases and their connections.

**Layout:**
- Header with global KPI strip: Use Cases count, Critical Risks, Owners Assigned, EU AI Act %
- Toolbar: filter by department, risk level, framework, model; zoom controls; legend toggle
- Main area: `UseCaseGraph` component — D3-force-directed graph
  - Use case nodes: indigo circles (size scales with risk count)
  - AI model nodes: blue circles
  - Owner/department nodes: amber circles
  - Risk nodes: red circles (dashed edges)
  - Mitigation nodes: green circles
- Right panel: slides in on node click — `UseCaseDetailPanel`

**Graph interactions:**
- Click use case node → detail panel slides in from right
- Hover node → tooltip with name and key stats
- Drag nodes to reposition
- Filter toolbar updates graph live
- "Focus" button on a use case → collapses graph to just that node's connections

### 2. Discover (`/discover`)

**Purpose:** Launch and monitor AI agent discovery campaigns.

**Layout:**
- Three entry point cards at top:
  - **CISO Campaign** — "Send agents to all departments" — configure scope and launch
  - **Employee Self-Register** — "Share a link for staff to register their AI use" — web chat entry
  - **Auto-Detect** — "Connected to Okta/SaaS tools — 12 new tools detected" — review alerts
- Active campaign section: progress bar, stats (outreach sent, responded, use cases found, shadow AI detected)
- Live feed: `AgentConversation` cards showing real-time conversation excerpts as agents work
- Each conversation card shows: employee name, department, channel icon, status badge, extracted use case chip (when complete)

**Demo mode behaviour:** Pre-loaded conversation timeline that plays out over 30 seconds with typewriter animation, simulating live discovery.

### 3. Register (`/register`)

**Purpose:** Full filterable table of all discovered use cases.

**Layout:**
- Filter bar: department, risk severity, compliance status, owner status, model
- Table columns: Use Case, Department, Model, Owner, Risk Score, Status, Last Updated
- Row expand: shows inline risk list, mitigation status, compliance gaps
- Bulk actions: assign owner, apply mitigation template, export to CSV
- "Add manually" button for edge cases

### 4. Owners (`/owners`)

**Purpose:** People-centric view of AI accountability.

**Layout:**
- Summary cards: Owners Assigned, Pending Assessments, Overdue, Unowned Use Cases
- People table: Name, Department, Use Cases (count), Pending Tasks, Last Active
- Click a person → `OwnerDetailPanel` slides in showing their use cases, pending risk assessments, and a progress checklist
- "Notify All Pending" button → triggers simulated agent outreach
- Unowned use cases section with "Suggest Owner" AI recommendation chip

### 5. Comply (`/comply`)

**Purpose:** Framework coverage across all use cases.

**Layout:**
- Framework coverage cards: EU AI Act (73%), NIST AI RMF (61%), OWASP LLM Top 10 (48%), ISO 42001 (55%)
- Each card: coverage %, gap count, "View gaps" link
- Gap table: Use Case × Framework requirement with status (covered / gap / partial)
- One-click "Assign remediation" per gap → creates task for owner
- Export compliance report button

---

## Onboarding Demo Journey

A persistent `DemoJourney` overlay component mounted in the **root layout**, not a separate route. Activated by a "Start Demo" button in the header. The overlay navigates the user programmatically between `/`, `/discover`, `/owners`, `/comply` as the journey progresses. There is no `/demo` route.

**Step 1 — Empty State** (~30s)
- Map shows zero use cases
- Overlay: "You're starting from zero — like every CISO does. Let's find out what AI your organisation is actually using."
- CTA: "Launch Discovery Agent →"

**Step 2 — Agent Discovery** (~90s)
- Navigates to `/discover`
- Overlay: "Your AI agent is now interviewing employees across 8 departments"
- Animated conversation feed plays out with typewriter effect
- Counter increments: 0 → 47 use cases discovered, 12 shadow AI flagged

**Step 3 — Map Populates** (~60s)
- Navigates to `/`
- Graph animates in with 47 nodes
- Overlay: "47 use cases mapped. 12 critical risks auto-identified. No manual entry."
- Highlight: clicks Contract Review AI node, detail panel slides in showing risks auto-matched from OWASP LLM Top 10

**Step 4 — Ownership** (~45s)
- Navigates to `/owners`
- Overlay: "AI suggests owners based on who reported each use case"
- Demo: click "Confirm Owner" for Sarah Chen → agent sends Slack notification (animated)
- Counter: 34 owned, 13 pending

**Step 5 — Compliance** (~45s)
- Navigates to `/comply`
- Overlay: "From 0% to 73% EU AI Act coverage — in this session"
- Highlight: shows 3 remaining gaps with "Assign remediation" buttons
- Final message: "Your org's AI is now governed. Owners know their responsibilities. Risks have mitigations."

---

## Key New Components

| Component | Description |
|-----------|-------------|
| `UseCaseGraph` | D3-force-directed graph with interactive nodes, filters, and physics |
| `UseCaseDetailPanel` | Slide-in right panel with full use case detail, risks, mitigations |
| `AgentConversationCard` | Animated chat thread (typewriter) showing agent ↔ employee exchange |
| `DiscoveryFeed` | Live-updating list of conversations and extracted use cases |
| `DemoJourney` | Step overlay component with progress indicator and narrative |
| `RiskChip` | Coloured chip with OWASP/NIST/EU AI Act reference |
| `ComplianceCoverageCard` | Framework % coverage with gap count |
| `OwnerDetailPanel` | Slide-in panel with person's AI use cases and tasks |

---

## Tech Stack Changes

**Add:**
- `react-force-graph-2d` — WebGL/Canvas relationship graph with physics (internally uses D3 force — do not add raw D3 alongside it)
- `framer-motion` — Demo journey transitions and node animations

**Keep:**
- Next.js 15, React 19, TypeScript
- Tailwind CSS, shadcn/ui, Radix UI
- Recharts (used in Comply page for framework coverage charts)
- All existing mock data patterns

**No backend.** All data lives in `/lib/` as TypeScript mock data files.

---

## Mock Data Scenario

Insurance company (consistent with existing mock data).

**8 departments, 47 use cases (35 registered + 12 shadow AI):**
- Legal (5): Contract Review AI, Legal Brief Summariser, Clause Extractor, Compliance Checker, NDA Drafting Assistant
- IT (5): Code Assistant, Infrastructure Monitoring, Incident Summariser, Security Log Analyser, Deployment Describer
- Claims (5): Fraud Detection Model, Claims Triage, Damage Assessment AI, Claims Letter Generator, Subrogation Analyser
- Customer Service (5): Customer Chat Bot, Complaint Classifier, Sentiment Tracker, Response Suggester, FAQ Generator
- HR (5): CV Screening, Job Description Generator, Interview Scorer, Onboarding Assistant, Salary Benchmarker
- Finance (5): Report Generator, Budget Forecasting, Invoice Classifier, Expense Anomaly Detector, Earnings Summariser
- Risk & Compliance (5): Risk Scoring Model, Regulatory Change Monitor, Policy Gap Analyser, Audit Trail Summariser, Sanctions Screener
- Underwriting (5): Policy Risk Assessor, Pricing Model Explainer, Risk Appetite Checker, Portfolio Analyser, Renewal Predictor

**12 shadow AI use cases** (not officially registered, discovered by agent): personal ChatGPT use, Notion AI, Grammarly with confidential data, GitHub Copilot (unlicensed), Midjourney for marketing, Perplexity for research, Claude.ai personal account, Otter.ai for client calls, Whisper for meeting transcription, Jasper for content, Copy.ai for sales emails, ChatPDF for contracts. (discovered by agent but not officially registered): personal ChatGPT use, Notion AI, Grammarly with data, etc.

**Risk framework mapping pre-built** for all use cases against OWASP LLM Top 10, NIST AI RMF, EU AI Act.

---

## What Ardoq Cannot Do (Demo Talking Points)

| Capability | Ardoq | AIMaps |
|-----------|-------|--------|
| Discovers AI use cases automatically | ✗ Manual | ✓ AI agents |
| Use case as governance unit | ✗ Component-centric | ✓ Use case-centric |
| Notifies and guides owners | ✗ Just documentation | ✓ Active workflow |
| AI-native risk framework | ✗ Generic | ✓ OWASP LLM, NIST AI RMF |
| Shadow AI detection | ✗ No | ✓ Agent-discovered |
| Time to first map | Weeks | ~4 minutes |
| Employee experience | Forms/surveys | Conversational AI |

---

## Success Criteria for Tomorrow's Demo

1. CISO lands on an empty map, launches discovery agent in one click
2. Agent conversation feed plays out convincingly (typewriter animation, realistic dialogue)
3. 47 use cases populate the relationship graph with smooth animation
4. Click Contract Review AI → detail panel shows risks, owner, mitigations clearly
5. Owners page shows accountability with one-click confirmation
6. Comply page shows 73% EU AI Act coverage with actionable gap list
7. Whole journey takes under 5 minutes
