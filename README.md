# Atlas AI — Mapping AI Use Cases with Risks

A unified dashboard for **AI Security Posture Management (AI-SPM)** and **AI Asset Management**. Map your organisation's AI use cases to risks, owners, and compliance frameworks.

Designed for CISOs and AI platform leaders requiring visibility into **risk, compliance, operational health, and governance posture**.

All data is simulated for demonstration and prototyping.

---

## Table of Contents

1. [Overview](#overview)
2. [Complementing Ardoq](#complementing-ardoq)
3. [Architecture](#architecture)
4. [Features](#features)
5. [Tech Stack](#tech-stack)
6. [Project Structure](#project-structure)
7. [Getting Started](#getting-started)
8. [Roadmap](#roadmap)
9. [Licence](#licence)

---

## Overview

AI governance requires **two complementary capabilities**:

| Domain                  | Purpose                                                   | Audience                        |
| ----------------------- | --------------------------------------------------------- | ------------------------------- |
| **AI-SPM (Security)**   | Identify and mitigate risks across AI systems             | CISOs, Security Teams           |
| **AI Asset Management** | Track inventory, lifecycle, dependencies, and performance | AI Platform / Engineering Teams |

Atlas AI unifies both perspectives into a single interface.

---

## Complementing Ardoq

> "Ardoq tells you what systems you have. Atlas AI tells you what AI those systems are doing — and whether it's safe."

| Dimension | Ardoq | Atlas AI |
|-----------|-------|----------|
| Primary object | System / Application / Capability | AI Use Case |
| Risk focus | Architectural dependency risk | AI-specific operational risk |
| Compliance | IT governance frameworks | AI regulation (EU AI Act, OWASP LLM, NIST AI RMF) |
| Visualisation | System maps, roadmaps, tech debt | AI use case force graph + risk graph |
| Audience | Enterprise architects, IT | CISOs, AI governance leads, compliance officers |

Ardoq owns the IT landscape layer — it maps systems, capabilities, and infrastructure dependencies. Atlas AI owns the AI governance layer that lives *inside* those systems — the use cases, models, risks, owners, and compliance status. They are complementary: Ardoq is the container; Atlas AI is the content.

![The Atlas AI Map — AI use cases, models, vendors, owners, and risks visualised as a force-directed graph.](public/screenshots/screenshot-map.png)

---

## Architecture

Atlas AI is designed as a cloud-native platform on Microsoft Azure, structured around two complementary architectural views: one for executive stakeholders, one for enterprise architects.

### CISO / Executive View

Four swim lanes showing users, platform components, Azure services, and external integrations:

| Layer | Components |
|-------|-----------|
| Users | CISO, AI Governance Lead, AI Product Owner, Compliance Officer, Business Stakeholder |
| Atlas AI Platform | Dashboard UI, API Gateway, Auth Service, AI Risk Engine, Compliance Engine, Notification Engine |
| Microsoft Azure | Azure AD B2C, Azure Container Apps, Azure Cosmos DB, Azure AI Services, Azure Monitor, Azure Key Vault |
| External Integrations | GitHub / Azure DevOps, Slack / Teams, Jira / ServiceNow, EU AI Act API |

![CISO / Executive view — platform layers and external integrations.](public/screenshots/screenshot-architecture-ciso.png)

### Enterprise Architect View

Six layers inside an Azure VNet boundary:

| Layer | Components |
|-------|-----------|
| Client | Next.js SPA, Browser |
| API & Agent | API Gateway, AI Risk Engine, Compliance Engine, Auth Service |
| Data | Azure Cosmos DB, Azure Blob Storage |
| Identity & Security | Azure AD B2C, Azure Key Vault |
| Observability | Azure Monitor, Application Insights |
| Outbound Integrations | GitHub / Azure DevOps, Slack / Teams, Jira / ServiceNow, EU AI Act API |

![Enterprise Architect view — layered components inside Azure VNet.](public/screenshots/screenshot-architecture-enterprise.png)

> **Note:** The current prototype runs entirely client-side with simulated data — no backend or external API is required to run locally. The architecture above represents the intended production deployment design.

---

## Features

### Map
AI use case map with interactive graph showing use cases, models, vendors, owners, and risks. Filter by department and risk severity.

### Discover
Discovery campaigns for AI use cases:
- **CISO Discovery Campaign** — AI agents interview departments
- **Employee Self-Registration** — Conversational intake via shared link
- **Auto-Detect via Okta** — SaaS estate monitoring and alerts

### Register
AI use case registration and intake workflows.

### Owners
Owner management with use case assignments and assessment status.

### Comply
Compliance framework coverage across EU AI Act, NIST AI RMF, OWASP LLM Top 10, and ISO 42001.

### AI Governance
AI-SPM security dashboard with risk scores, compliance status, and incident tracking.

### AI Visibility
Asset visibility and operational metrics.

### Model Risk
Model risk assessment and context analysis.

---

## Tech Stack

| Component           | Technology                                      |
| ------------------- | ----------------------------------------------- |
| Framework           | Next.js 16 (App Router, Turbopack)              |
| UI                  | React 19, TypeScript                            |
| Styling             | Tailwind CSS 4                                  |
| Components          | Radix UI, shadcn/ui patterns                    |
| Charts              | Recharts                                        |
| Graph               | react-force-graph-2d                            |
| Data                | Local simulated datasets (lib/)                 |
| Deployment          | Vercel                                          |

No backend or external API is required.

---

## Project Structure

```
ai-spm-dashboard/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Map (AI use case map)
│   ├── discover/page.tsx
│   ├── register/page.tsx
│   ├── owners/page.tsx
│   ├── comply/page.tsx
│   ├── ai-governance/page.tsx
│   ├── ai-visibility/page.tsx
│   └── model-risk/page.tsx
├── components/
│   ├── app-header.tsx
│   ├── use-case-graph.tsx
│   ├── use-case-detail-panel.tsx
│   ├── agent-conversation-card.tsx
│   ├── compliance-coverage-card.tsx
│   ├── owner-detail-panel.tsx
│   ├── agent-conversation-card.tsx
│   ├── demo-wrapper.tsx
│   └── ui/                   # shadcn components
├── lib/
│   ├── aimaps-data.ts
│   ├── aimaps-types.ts
│   ├── ai-visibility-data.ts
│   ├── model-risk-data.ts
│   ├── insurance-data.ts
│   └── utils.ts
├── public/
│   └── screenshots/          # README screenshot assets (user-provided)
├── styles/
├── package.json
├── pnpm-lock.yaml
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Install dependencies

```bash
pnpm install
```

### Run development server

```bash
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
pnpm build
```

### Start production server

```bash
pnpm start
```

### Lint

```bash
pnpm lint
```

---

## Roadmap

Planned enhancements:

- Role-based access control (RBAC)
- Exportable compliance and audit reports
- SIEM integration (Sentinel, Splunk, Chronicle)
- Support for ingesting real telemetry
- Model cluster visualisation
- Agent behaviour analytics

---

## Licence

Released under the MIT Licence. Usage, modification, and distribution are permitted.
