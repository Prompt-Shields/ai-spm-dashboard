# Atlas AI — Spec

## 1. Project Name

Atlas AI (ai-spm-dashboard)

## 2. Overview

Atlas AI is an AI Security Posture Management (AI-SPM) and AI Asset Management dashboard. It provides a unified interface for mapping an organisation's AI use cases to risks, owners, and compliance frameworks (EU AI Act, NIST AI RMF, OWASP LLM Top 10, ISO 42001). The application is a client-side prototype using simulated data, designed for CISOs and AI platform leaders who need visibility into risk, compliance, and governance posture.

## 3. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI Library | React 19 |
| Styling | Tailwind CSS 4, tw-animate-css |
| Component System | shadcn/ui (New York style), Radix UI primitives |
| Charts | Recharts 2.15 |
| Graph Visualization | react-force-graph-2d |
| Animation | Framer Motion |
| Icons | Lucide React |
| Forms | React Hook Form, Zod validation |
| Package Manager | pnpm |
| Deployment Target | Vercel |
| Testing | Playwright (dev dependency) |

## 4. Architecture

The project is a Next.js App Router application. It runs entirely client-side with no backend -- all data comes from local TypeScript mock data files in `lib/`. The intended production architecture targets Microsoft Azure (Container Apps, Cosmos DB, Azure AD B2C), but the current codebase is a self-contained frontend prototype.

### Folder Structure

```
ai-spm-dashboard/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout (DemoWrapper + main container)
│   ├── page.tsx                # Map page — force-directed AI use case graph
│   ├── globals.css             # Global styles
│   ├── discover/page.tsx       # Discovery campaigns (agent, self-register, Okta)
│   ├── register/page.tsx       # Use case registration/intake
│   ├── owners/page.tsx         # Owner management and assignments
│   ├── comply/page.tsx         # Compliance framework coverage
│   ├── ai-governance/page.tsx  # AI-SPM security dashboard
│   ├── ai-visibility/page.tsx  # Asset visibility and operational metrics
│   └── model-risk/page.tsx     # Model risk assessment
├── components/                 # React components
│   ├── ui/                     # shadcn/ui primitives (card, tabs, badge, etc.)
│   ├── app-header.tsx          # Top navigation bar
│   ├── use-case-graph.tsx      # Force-directed graph (react-force-graph-2d)
│   ├── use-case-detail-panel.tsx
│   ├── owner-detail-panel.tsx
│   ├── agent-conversation-card.tsx
│   ├── compliance-coverage-card.tsx
│   ├── demo-wrapper.tsx        # Demo mode wrapper
│   ├── demo-journey.tsx        # Guided demo flow
│   ├── kpi-card.tsx
│   ├── risk-chip.tsx
│   └── theme-provider.tsx
├── lib/                        # Data layer and utilities
│   ├── aimaps-types.ts         # Core TypeScript interfaces (UseCase, Risk, Person, etc.)
│   ├── aimaps-data.ts          # Primary mock data (use cases, persons, conversations)
│   ├── ai-visibility-data.ts   # AI visibility page data
│   ├── model-risk-data.ts      # Model risk data
│   ├── model-risk-page-data.ts # Model risk page data
│   ├── insurance-data.ts       # Insurance industry mock data (risk register, network)
│   ├── mock-data.ts            # AI-SPM metrics and asset data
│   └── utils.ts                # cn() utility (clsx + tailwind-merge)
├── public/                     # Static assets (icons, screenshots)
├── styles/globals.css          # Additional global styles
├── docs/                       # Documentation and architecture diagrams
└── config files                # tsconfig.json, components.json, next.config.mjs, etc.
```

## 5. Key Features

- **Map**: Interactive force-directed graph visualising AI use cases, models, vendors, owners, and risks. Filterable by department and risk severity. Clicking a node opens a detail panel.
- **Discover**: Three discovery methods — CISO agent-driven campaigns, employee self-registration via shared link, and auto-detection via Okta SaaS estate scanning. Includes simulated AI agent conversations.
- **Register**: AI use case registration and intake workflows.
- **Owners**: Owner management with use case assignments and assessment completion tracking.
- **Comply**: Compliance dashboard showing coverage percentages across EU AI Act, NIST AI RMF, OWASP LLM Top 10, and ISO 42001. Identifies gaps per use case.
- **AI Governance**: AI-SPM security dashboard with risk scores, compliance status, incident tracking, and a network topology view.
- **AI Visibility**: Asset visibility and operational metrics.
- **Model Risk**: Model risk assessment and context analysis.
- **Demo Mode**: A guided demo journey wrapper (DemoWrapper + DemoJourney) for walkthrough presentations.

## 6. Setup & Configuration

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Install

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open http://localhost:3000.

### Production Build

```bash
pnpm build
pnpm start
```

### Lint

```bash
pnpm lint
```

No environment variables or external API keys are required. All data is simulated locally.

## 7. Dependencies

### Key Runtime Dependencies

| Package | Purpose |
|---------|---------|
| next (16.x) | Framework (App Router, SSR/SSG) |
| react / react-dom (19.x) | UI rendering |
| react-force-graph-2d | Force-directed graph for the Map page |
| recharts | Charts and data visualizations |
| framer-motion | Animations and transitions |
| @radix-ui/* (20+ packages) | Accessible UI primitives (dialog, tabs, select, etc.) |
| lucide-react | Icon library |
| react-hook-form + zod | Form handling and schema validation |
| class-variance-authority, clsx, tailwind-merge | Styling utilities for shadcn/ui |
| next-themes | Theme switching (dark/light) |
| sonner | Toast notifications |
| @vercel/analytics | Vercel usage analytics |

### Key Dev Dependencies

| Package | Purpose |
|---------|---------|
| typescript (5.x) | Type checking |
| tailwindcss (4.x) | Utility-first CSS |
| @tailwindcss/postcss | PostCSS integration |
| @playwright/test | End-to-end testing |

## 8. API/Endpoints

The current prototype has no backend API. All pages are client-side rendered using local mock data from `lib/`.

### Navigation Routes (App Router)

| Route | Page |
|-------|------|
| `/` | Map — AI use case force-directed graph |
| `/discover` | Discover — Discovery campaigns and agent conversations |
| `/register` | Register — Use case intake |
| `/owners` | Owners — Owner management |
| `/comply` | Comply — Compliance framework coverage |
| `/ai-governance` | AI Governance — AI-SPM security dashboard |
| `/ai-visibility` | AI Visibility — Asset visibility metrics |
| `/model-risk` | Model Risk — Model risk assessment |

### Planned Production API (not implemented)

The README describes a target Azure architecture with: API Gateway, AI Risk Engine, Compliance Engine, Auth Service (Azure AD B2C), and outbound integrations to GitHub/Azure DevOps, Slack/Teams, Jira/ServiceNow, and an EU AI Act API.
