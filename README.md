d# AI Governance Control Centre

Combined AI Security Posture Management (AI-SPM) and AI Asset Management Dashboard

![Hero Banner](https://via.placeholder.com/1400x300?text=AI+Governance+Control+Centre)

A unified dashboard providing **AI Security Posture Management (AI-SPM)** and **AI Asset Management** within a single codebase.
Designed for CISOs and AI platform leaders requiring visibility into **risk, compliance, operational health, and governance posture**.

All data is simulated for demonstration and prototyping.

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Dashboard Views](#dashboard-views)
4. [Feature Screenshots](#feature-screenshots)
5. [Tech Stack](#tech-stack)
6. [Project Structure](#project-structure)
7. [Getting Started](#getting-started)
8. [Sample Data](#sample-data)
9. [Roadmap](#roadmap)
10. [Licence](#licence)

---

## Overview

AI governance requires **two complementary capabilities**:

| Domain                  | Purpose                                                   | Audience                        |
| ----------------------- | --------------------------------------------------------- | ------------------------------- |
| **AI-SPM (Security)**   | Identify and mitigate risks across AI systems             | CISOs, Security Teams           |
| **AI Asset Management** | Track inventory, lifecycle, dependencies, and performance | AI Platform / Engineering Teams |

The AI Governance Control Centre unifies both perspectives into a single interface.

---

## System Architecture

Below is an architecture diagram illustrating how the dashboards, data layers, and shared components interact.

```
 ┌──────────────────────────────────────────────────────────────┐
 │                   AI Governance Control Centre                │
 └──────────────────────────────────────────────────────────────┘
                │                         │
                ▼                         ▼
     ┌───────────────────┐      ┌────────────────────┐
     │ AI-SPM Dashboard  │      │ Asset Management    │
     │ (Security View)   │      │ Dashboard           │
     └───────────────────┘      └────────────────────┘
                │                         │
                └──────────────┬──────────┘
                               ▼
                     ┌───────────────────┐
                     │ Shared Components │
                     │ KPI Cards, Charts │
                     │ Heatmaps, Tables │
                     └───────────────────┘
                               │
                               ▼
                      ┌────────────────┐
                      │ Simulated Data │
                      ├────────────────┤
                      │ Security Data  │
                      │ Asset Metadata │
                      │ Incident Logs  │
                      │ Usage Metrics  │
                      └────────────────┘
```

---

## Dashboard Views

### Overview Dashboard

![Overview Dashboard](https://via.placeholder.com/1200x500?text=Overview+Dashboard)

Displays a combined summary of:

* Overall AI Risk Score
* Compliance Score
* Number of Active AI Assets
* Monthly AI Cloud Cost
* Security risk snapshot
* Operational performance summary

---

### AI Security Posture Management (AI-SPM)

![Security Dashboard](https://via.placeholder.com/1200x500?text=AI-SPM+Security+Dashboard)

#### Key Features

* Overall AI Risk Score
* Compliance Score (GDPR, EU AI Act, NIST AI RMF)
* Shadow AI detection
* Risk heat map
* Traffic-light indicators (Data Governance, Model Integrity, Runtime Security)
* Incident timeline
* High-risk assets table
* Business impact metrics (MTTD, MTTR, financial exposure)

---

### AI Asset Management

![Asset Management Dashboard](https://via.placeholder.com/1200x500?text=AI+Asset+Management+Dashboard)

#### Key Features

* Model catalogue (search, filter, sort)
* Model performance charts (latency, drift, accuracy)
* Lifecycle and version timeline
* Cloud cost analysis
* Dependency graph (text-based visual or component)
* Shadow AI identifier
* Usage activity (calls per asset, departments, users)

---

## Feature Screenshots

Replace these placeholders with real screenshots once generated.

### Risk Heatmap

![Risk Heatmap](https://via.placeholder.com/900x400?text=Risk+Heatmap)

### Incident Timeline

![Incident Timeline](https://via.placeholder.com/900x300?text=Incident+Timeline)

### Compliance Overview

![Compliance Overview](https://via.placeholder.com/900x300?text=Compliance+Panel)

### Asset Catalogue

![Asset Catalogue](https://via.placeholder.com/900x400?text=Asset+Catalogue)

### Performance Trends

![Performance Trends](https://via.placeholder.com/900x400?text=Performance+Trends)

---

## Tech Stack

| Component           | Technology                                               |
| ------------------- | -------------------------------------------------------- |
| Front-end Framework | React + TypeScript                                       |
| UI Styling          | Tailwind CSS                                             |
| Components          | shadcn/ui or equivalent                                  |
| Data                | Local simulated JSON datasets                            |
| Charts              | Any React chart library (Recharts, Chart.js, Nivo, etc.) |

No backend or external API is required.

---

## Project Structure

```
ai-governance-control-centre/
 ├─ src/
 │   ├─ components/
 │   │   ├─ KpiCard.tsx
 │   │   ├─ HeatMap.tsx
 │   │   ├─ Timeline.tsx
 │   │   ├─ DataTable.tsx
 │   │   ├─ TrafficLight.tsx
 │   │   └─ TrendChart.tsx
 │   ├─ dashboards/
 │   │   ├─ OverviewPage.tsx
 │   │   ├─ SecurityDashboard.tsx
 │   │   └─ AssetManagementDashboard.tsx
 │   ├─ data/
 │   │   ├─ mockAISPMSecurityData.ts
 │   │   ├─ mockAssetManagementData.ts
 │   │   └─ incidentLogs.ts
 │   ├─ AppLayout.tsx
 │   ├─ App.tsx
 │   └─ index.tsx
 ├─ public/
 ├─ package.json
 └─ README.md
```

---

## Getting Started

### Install dependencies

```
npm install
```

### Run development server

```
npm start
```

Then open:

```
http://localhost:3000
```

---

## Sample Data

### AI-SPM (Security)

Includes simulated fields such as:

* Sensitive data classification
* Model misconfigurations
* High-risk vulnerabilities (sample CVEs)
* Prompt injection attempts
* Data exfiltration alerts
* GDPR, EU AI Act, and NIST compliance statuses
* Incident logs with severity and timestamps

---

### AI Asset Management (Operations)

Simulated operational metadata including:

* Model versions and architectures
* Accuracy, latency, throughput
* Drift scores
* Cloud spend (monthly, per-model)
* GPU hours
* Dependency lists
* Lifecycle updates
* Usage activity and top users

---

## Roadmap

Planned enhancements:

* Role-based access control (RBAC)
* Exportable compliance and audit reports
* SIEM integration (Sentinel, Splunk, Chronicle)
* Support for ingesting real telemetry
* Model cluster visualisation
* Agent behaviour analytics

---

## Licence

Released under the MIT Licence.
Usage, modification, and distribution are permitted.
