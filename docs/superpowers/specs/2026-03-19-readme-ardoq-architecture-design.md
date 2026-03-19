---
name: README update — Ardoq complement and Architecture
description: Design spec for adding Ardoq complementary positioning and Azure architecture sections to README.md, with screenshots
type: project
---

# README Update — Ardoq Complement & Architecture Design

**Date:** 2026-03-19
**Project:** Atlas AI (ai-spm-dashboard)

---

## Goal

Update `README.md` to include:
1. A new `## Complementing Ardoq` section positioned after Overview
2. A new `## Architecture` section positioned after the Ardoq section
3. Screenshots embedded in each section (sourced from `public/screenshots/`)

---

## Section Structure

### Table of Contents changes

The existing TOC is a numbered list. Insert the two new entries after item 1 (Overview) and renumber all subsequent items. The resulting full TOC should be:

```
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

---

## Section 1: Complementing Ardoq

**Placement:** Immediately after the existing `## Overview` section.

### Contents

1. **One-liner positioning statement:**
   > "Ardoq tells you what systems you have. Atlas AI tells you what AI those systems are doing — and whether it's safe."

2. **Comparison table** — 5 dimensions:

| Dimension | Ardoq | Atlas AI |
|-----------|-------|----------|
| Primary object | System / Application / Capability | AI Use Case |
| Risk focus | Architectural dependency risk | AI-specific operational risk |
| Compliance | IT governance frameworks | AI regulation (EU AI Act, OWASP LLM, NIST AI RMF) |
| Visualisation | System maps, roadmaps, tech debt | AI use case force graph + risk graph |
| Audience | Enterprise architects, IT | CISOs, AI governance leads, compliance officers |

3. **Complementarity narrative** (2–3 sentences):
   Ardoq owns the IT landscape layer — it maps systems, capabilities, and infrastructure dependencies. Atlas AI owns the AI governance layer that lives *inside* those systems — the use cases, models, risks, owners, and compliance status. They are complementary: Ardoq is the container; Atlas AI is the content.

4. **Screenshot:** `public/screenshots/screenshot-map.png`
   Caption: *The Atlas AI Map — AI use cases, models, vendors, owners, and risks visualised as a force-directed graph.*

---

## Section 2: Architecture

**Placement:** Immediately after `## Complementing Ardoq`.

### Contents

1. **Intro sentence:**
   Atlas AI is designed as a cloud-native platform on Microsoft Azure, structured around two complementary architectural views: one for executive stakeholders, one for enterprise architects.

2. **Diagram A — CISO / Executive View**

   Four swim lanes:

   | Layer | Components |
   |-------|-----------|
   | Users | CISO, AI Governance Lead, AI Product Owner, Compliance Officer, Business Stakeholder |
   | Atlas AI Platform | Dashboard UI, API Gateway, Auth Service, AI Risk Engine, Compliance Engine, Notification Engine |
   | Microsoft Azure | Azure AD B2C, Azure Container Apps, Azure Cosmos DB, Azure AI Services, Azure Monitor, Azure Key Vault |
   | External Integrations | GitHub / Azure DevOps, Slack / Teams, Jira / ServiceNow, EU AI Act API |

   Screenshot: `public/screenshots/screenshot-architecture-ciso.png`
   Caption: *CISO / Executive view — platform layers and external integrations.*

3. **Diagram B — Enterprise Architect View**

   Six layers inside an Azure VNet boundary:

   | Layer | Components |
   |-------|-----------|
   | Client | Next.js SPA, Browser |
   | API & Agent | API Gateway, AI Risk Engine, Compliance Engine, Auth Service |
   | Data | Azure Cosmos DB, Azure Blob Storage |
   | Identity & Security | Azure AD B2C, Azure Key Vault |
   | Observability | Azure Monitor, Application Insights |
   | Outbound Integrations | GitHub/Azure DevOps, Slack/Teams, Jira/ServiceNow, EU AI Act API |

   Screenshot: `public/screenshots/screenshot-architecture-enterprise.png`
   Caption: *Enterprise Architect view — layered components inside Azure VNet.*

4. **Current state callout:**
   > **Note:** The current prototype runs entirely client-side with simulated data — no backend or external API is required to run locally. The architecture above represents the intended production deployment design.

---

## Screenshot Requirements

The user is responsible for:
1. Exporting the draw.io architecture diagrams to PNG from `docs/atlas-ai-azure-architecture.drawio` (requires draw.io desktop app or CLI)
2. Capturing app screenshots at **1440px wide viewport** for consistency
3. Placing all files into `public/screenshots/` (create this directory if it does not exist)

```
public/screenshots/
├── screenshot-map.png                      # Map page force graph
├── screenshot-architecture-ciso.png       # draw.io Diagram A export
└── screenshot-architecture-enterprise.png # draw.io Diagram B export
```

**If screenshots are not yet available at implementation time:** embed the image tags regardless, accepting that they will render as broken images until the user drops in the files. Do not block the README update waiting for assets.

---

## Implementation Notes

- The two new sections insert between `## Overview` and `## Features` in this order: `## Complementing Ardoq` first, then `## Architecture`
- Table of Contents must be updated to include the two new sections (see anchor format above)
- No existing sections are removed or reordered
- Image paths use relative markdown syntax: `![caption](public/screenshots/filename.png)` — this path works correctly for GitHub README rendering
- The `public/screenshots/` directory must be created by the implementer if it does not already exist
- Add `public/screenshots/` to the `Project Structure` file tree in the README (under `public/`)
- The draw.io architecture diagrams live at `docs/atlas-ai-azure-architecture.drawio` — **export to PNG is a user task**, not an implementer task
- Image paths (`public/screenshots/filename.png`) are correct when the README is at the repo root, as it is here
