# Atlas AI Dashboard — Conversation Export
**Date:** 2026-03-18 / 2026-03-19
**Project:** ai-spm-dashboard → Atlas AI (formerly AIMaps)

---

## Summary

This document captures the design decisions, technical changes, and conceptual discussions from the session where the AI SPM dashboard was redesigned into "Atlas AI — Mapping AI use cases with risks."

---

## Product Renaming: AIMaps → Atlas AI

- **Header** (`components/app-header.tsx`): Updated logo text to "Atlas AI" with tagline "Mapping AI use cases with risks"
- **Page metadata** (`app/layout.tsx`): Title updated to `Atlas AI — Mapping AI Use Cases with Risks`

---

## Map Page — Force Graph Improvements

### Goal
Make the force-directed graph (react-force-graph-2d) readable, with nodes clearly identified by type (use case, model, vendor, owner, risk) and matching the dark visual style of the reference governance dashboard.

### Visual Design
Dark canvas background `#0a0e1a` with subtle 40px grid overlay.

Node type palette (matching reference dashboard):
| Type | Colour | Accent |
|------|--------|--------|
| Use Case | `#00d9ff` cyan | Orchestration style |
| AI Model | `#f59e0b` amber | Agent style |
| Vendor | `#10b981` green | Integration style |
| Owner | `#7c3aed` violet | Identity style |
| Risk | `#ef4444` red | Severity-coded |

### Card Renderer (`paintNode`)
- Dark rounded card (`#141824` bg, `CR=5` radius)
- Left accent bar in node colour
- Top-right type badge (e.g. "USE CASE", "MODEL")
- Title (truncated), sublabel (dept / provider), stat line (risk count / role)
- At zoom < 0.35: renders as a simple coloured dot for performance

### Hit Area Fix (`nodePointerAreaPaint`)
The default circular hit area from `nodeVal` was too small for card-shaped nodes. Fixed by painting the full card rectangle as the pointer area.

### Link Styling (`paintLink`)
- Semi-transparent coloured lines per relationship type
- Dashed lines for `provided-by` and `has-risk`
- Relationship labels at midpoint when zoom ≥ 0.8

### Department Clustering
Use case nodes gravitate toward radial centroid positions per department using `d3Force('x'/'y')` with `strength(0.15)`. Other node types use `strength(0.05)` toward origin.

### Simulation Config (via `useEffect` + `useRef`)
```js
fg.d3Force('charge').strength(-400)
fg.d3Force('link').distance(80).strength(0.5)
fg.d3Force('collision').radius(collide)  // based on card diagonal
fg.d3Force('x').strength(…).x(…)         // department clustering
fg.d3Force('y').strength(…).y(…)
fg.d3ReheatSimulation()
setTimeout(() => fg.zoomToFit(600, 60), 2500)
```

### Clutter Reduction
Only the worst-severity risk per use case is shown as a risk node (reduces node count significantly).

---

## Use Case Detail Panel (`components/use-case-detail-panel.tsx`)

Full dark-theme slide-in panel (380px, fixed right):

| Section | Content |
|---------|---------|
| Header | Status dot + label, use case name, department |
| Description | Full text description |
| Meta grid | Data classification (colour-coded) + discovery method |
| AI Models | Amber-tinted pills with model name and provider |
| Owner | Violet avatar card or red "unowned" warning |
| Risks | Severity-bar cards with OWASP / EU AI Act / NIST chips |
| Mitigations | Icon-coded list (applied ✓ / pending ⏱ / planned ○) |
| Compliance | 2×2 grid: EU AI Act, NIST AI RMF, OWASP LLM, ISO 42001 |
| Footer | "Edit Use Case" + "Assign Owner" CTAs |

---

## Register Page (`app/register/page.tsx`)

Added **status pipeline bar** at top:
- 5 clickable cards: Discovered → Assessed → Owned → Mitigated → Compliant
- Each shows count + coloured accent bar at bottom
- Connector arrows between stages (rotated square border trick)
- Clicking a stage filters the table; clicking again resets

---

## Comply Page (`app/comply/page.tsx`)

Added:
1. **Overall Coverage Breakdown** — stacked horizontal progress bars (covered/partial/gap) per framework
2. **Priority Remediations panel** — 3 cards with urgency badges (critical/high/medium) and deadline dates

---

## Azure Architecture Diagrams (`docs/atlas-ai-azure-architecture.drawio`)

Two-page draw.io file:

### Diagram A — CISO / Executive View
4 swim lanes:
- **Users**: CISO, AI Governance Lead, AI Product Owner, Compliance Officer, Business Stakeholder
- **Atlas AI Platform**: Dashboard UI, API Gateway, Auth Service, AI Risk Engine, Compliance Engine, Notification Engine
- **Microsoft Azure**: Azure AD B2C, Azure Container Apps, Azure Cosmos DB, Azure AI Services, Azure Monitor, Azure Key Vault
- **External Integrations**: GitHub/Azure DevOps, Slack/Teams, Jira/ServiceNow, EU AI Act API

### Diagram B — Enterprise Architect View
6 layers inside VNet boundary:
- Client → API & Agent → Data → Identity & Security → Observability → Outbound Integrations

---

## Errors Fixed

### React key prop warning
**Issue:** `<>` fragment can't accept `key` prop in RegisterPage
**Fix:** Replaced `<>` with `<React.Fragment key={uc.id}>`

### Nodes hard to click / detail panel never opens
**Root cause:** `nodeVal=8` gives ~3px circular hit area that doesn't match 100×40 card
**Fix:** Added `nodePointerAreaPaint` filling full card rectangle + `nodeVal=20`

### Cards overlapping
**Fix:** `charge(-400)`, `link.distance(80)`, department clustering forces, reheat simulation

### 125MB file blocked GitHub push
**File:** `node_modules/.pnpm/@next+swc-darwin-arm64.../next-swc.darwin-arm64.node`
**Fix:**
```bash
git filter-branch --force --index-filter \
  'git rm -r --cached --ignore-unmatch node_modules .next tsconfig.tsbuildinfo' \
  --prune-empty --tag-name-filter cat -- --all
git for-each-ref refs/original/ | xargs git update-ref -d
git reflog expire --expire=now --all && git gc --prune=now
```
Created `.gitignore` to prevent recurrence.

### GitHub push 403
Stored credentials expired. User must run: `git push origin main --force` with a valid GitHub PAT.

---

## Compliance vs Risk — Conceptual Overview

### Risk
Identifying, measuring, and reducing harm from AI systems:
- Bias, hallucination, data leakage, prompt injection, model drift
- Operational and ongoing
- Answered by: "What could go wrong? How bad? What are we doing about it?"

### Compliance
Proving to regulators you've managed risk adequately:
- EU AI Act, NIST AI RMF, OWASP LLM Top 10, ISO 42001
- Audit-time and point-in-time
- Answered by: "Can we show evidence that we've addressed the requirements?"

### How They Relate
> Risk management is the *activity*. Compliance is the *receipt*.

---

## Ardoq — Competitive Positioning

**Ardoq** is an enterprise architecture tool (EA platform) — it maps how systems, applications, and capabilities relate to each other at the *infrastructure and IT landscape level*.

**Atlas AI** maps what's *running inside* those systems — specifically AI use cases, their risks, owners, models, and compliance coverage.

### Comparison

| Dimension | Ardoq | Atlas AI |
|-----------|-------|----------|
| Primary object | System / Application / Capability | AI Use Case |
| Risk focus | Architectural dependency risk | AI-specific operational risk |
| Compliance | IT governance frameworks | AI regulation (EU AI Act, OWASP LLM, NIST AI RMF) |
| Visualization | System maps, roadmaps, tech debt | AI use case force graph + risk graph |
| Audience | Enterprise architects, IT | CISOs, AI governance leads, compliance officers |

### One-liner positioning
> "Ardoq tells you what systems you have. Atlas AI tells you what AI those systems are doing — and whether it's safe."

They are *complementary*, not competitive. Ardoq is the container; Atlas AI is the content.

---

## Git History (Key Commits)

```
a995d0a  Merge pull request #5
a01f891  remove: eliminate redundant Quick Links from Overview page
554b902  Merge pull request #4
df50fc4  refactor: redesign Overview page for CISO AI adoption monitoring
34a3e9d  feat: update design system to modern enterprise theme
```

Latest local commit (unpushed as of session end):
```
feat: improve Map graph, detail panel, Comply and Register pages
```

---

## Pending Action

Push to GitHub requires a valid PAT:
```bash
git push origin main --force
```
