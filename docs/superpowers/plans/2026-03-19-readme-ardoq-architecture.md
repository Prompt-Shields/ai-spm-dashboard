# README Ardoq Complement & Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update `README.md` to add a "Complementing Ardoq" section and a full "Architecture" section, with embedded screenshots, inserted between Overview and Features.

**Architecture:** This is a pure documentation change — no source code is modified. All changes are confined to `README.md` and the creation of a `public/screenshots/` directory placeholder. Screenshots are user-provided assets; image tags are embedded regardless of whether the files exist yet.

**Tech Stack:** Markdown, GitHub-flavoured Markdown rendering, draw.io (user export task only)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `README.md` | Modify — TOC, two new sections, Project Structure tree | Implementer |
| `public/screenshots/` | Create directory | Implementer |
| `public/screenshots/screenshot-map.png` | Place file | User |
| `public/screenshots/screenshot-architecture-ciso.png` | Place file (export from draw.io) | User |
| `public/screenshots/screenshot-architecture-enterprise.png` | Place file (export from draw.io) | User |

---

## Task 1: Create the screenshots directory

**Files:**
- Create: `public/screenshots/.gitkeep`

- [ ] **Step 1: Create the directory with a `.gitkeep` so it is tracked by git**

```bash
mkdir -p public/screenshots
touch public/screenshots/.gitkeep
```

- [ ] **Step 2: Verify the directory exists**

```bash
ls public/screenshots/
```
Expected output: `.gitkeep`

- [ ] **Step 3: Commit**

```bash
git add public/screenshots/.gitkeep
git commit -m "chore: add public/screenshots directory for README assets"
```

---

## Task 2: Update the Table of Contents

**Files:**
- Modify: `README.md` lines 11–19

The current TOC is:
```markdown
1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Roadmap](#roadmap)
7. [Licence](#licence)
```

- [ ] **Step 1: Replace the TOC block with the updated 9-item version**

Replace the entire TOC block (lines 11–19 in the current README) with:

```markdown
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
```

- [ ] **Step 2: Verify the TOC renders correctly**

Open `README.md` and confirm:
- 9 numbered entries
- Items 2 and 3 are "Complementing Ardoq" and "Architecture"
- All other items are renumbered correctly (Features = 4, Licence = 9)

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update README TOC with Ardoq and Architecture entries"
```

---

## Task 3: Add the "Complementing Ardoq" section

**Files:**
- Modify: `README.md` — insert after the `## Overview` section (after line 34, the `---` separator that follows "Atlas AI unifies both perspectives into a single interface.")

- [ ] **Step 1: Insert the full section after the Overview closing `---`**

Insert the following block immediately after the `---` that closes the Overview section (between the Overview `---` and the `## Features` heading):

```markdown
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
```

- [ ] **Step 2: Verify placement**

Confirm the README now reads in this order:
1. Title + intro
2. TOC
3. `## Overview`
4. `## Complementing Ardoq`  ← new
5. `## Features`

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add Complementing Ardoq section to README"
```

---

## Task 4: Add the "Architecture" section

**Files:**
- Modify: `README.md` — insert after the `## Complementing Ardoq` section (after its closing `---`)

- [ ] **Step 1: Insert the full Architecture section**

Insert the following block immediately after the `---` that closes the Complementing Ardoq section (between that `---` and the `## Features` heading):

```markdown
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
```

- [ ] **Step 2: Verify placement**

Confirm the README now reads in this order:
1. Title + intro
2. TOC
3. `## Overview`
4. `## Complementing Ardoq`
5. `## Architecture` ← new
6. `## Features`

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add Architecture section to README"
```

---

## Task 5: Update the Project Structure tree

**Files:**
- Modify: `README.md` — the `## Project Structure` code block

The current tree omits the `public/` directory entirely. Add `public/screenshots/` to reflect the new asset directory.

- [ ] **Step 1: Add `public/` and `public/screenshots/` to the file tree**

In the Project Structure code block, add the following lines after `└── styles/` and before `├── package.json`:

```
├── public/
│   └── screenshots/          # README screenshot assets (user-provided)
```

The updated bottom of the tree should look like:

```
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

- [ ] **Step 2: Verify the tree renders correctly**

Open the file and confirm the tree is valid Markdown code block syntax with no broken indentation.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add public/screenshots to Project Structure tree"
```

---

## Task 6: Final verification and push

- [ ] **Step 1: Read through the full README to confirm correctness**

Check:
- TOC has 9 items, numbered correctly
- `## Complementing Ardoq` appears between Overview and Architecture
- `## Architecture` appears between Complementing Ardoq and Features
- Both sections contain their full content (one-liner, table, narrative, image tag)
- Architecture section has two subsections (CISO view + Enterprise view), each with a table and image tag
- Callout note is present in the Architecture section
- Project Structure tree includes `public/screenshots/`
- No existing sections were removed or reordered

- [ ] **Step 2: Push to origin**

```bash
git push origin main
```

- [ ] **Step 3: Verify on GitHub**

Open the repository on GitHub and confirm:
- The README renders with the two new sections visible
- Tables render correctly
- Image tags show placeholder broken-image icons (expected until user drops in screenshots)
- TOC links anchor correctly to each section

---

## User Actions Required (after implementation)

After the README is merged, the user must:

1. **Export draw.io architecture diagrams** from `docs/atlas-ai-azure-architecture.drawio`:
   - Page 1 → save as `public/screenshots/screenshot-architecture-ciso.png`
   - Page 2 → save as `public/screenshots/screenshot-architecture-enterprise.png`

2. **Capture Map page screenshot** at 1440px viewport width:
   - Save as `public/screenshots/screenshot-map.png`

3. **Commit and push the image files:**
   ```bash
   git add public/screenshots/
   git commit -m "docs: add README screenshots"
   git push origin main
   ```
