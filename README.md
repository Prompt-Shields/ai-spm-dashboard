d# AI Governance Control Centre

Combined AI Security Posture Management (AI-SPM) and AI Asset Management Dashboard

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
<img width="1092" height="1174" alt="Screenshot 2025-12-04 at 15 20 16" src="https://github.com/user-attachments/assets/38e43eaa-26c3-41ab-88dd-cf54e2802d2b" />

Displays a combined summary of:

* Overall AI Risk Score
* Compliance Score
* Number of Active AI Assets
* Monthly AI Cloud Cost
* Security risk snapshot
* Operational performance summary

---

### AI Security Posture Management (AI-SPM)

<img width="1089" height="1179" alt="Screenshot 2025-12-04 at 15 20 22" src="https://github.com/user-attachments/assets/eee72cee-0ecb-4f29-b317-38dd485ae6b8" />

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

<img width="1096" height="1097" alt="Screenshot 2025-12-04 at 15 20 37" src="https://github.com/user-attachments/assets/6137cb7d-1e52-4bb3-ad85-886f5de61e85" />

#### Key Features

* Model catalogue (search, filter, sort)
* Model performance charts (latency, drift, accuracy)
* Lifecycle and version timeline
* Cloud cost analysis
* Dependency graph (text-based visual or component)
* Shadow AI identifier
* Usage activity (calls per asset, departments, users)

---

### Model Context Risk



<img width="1096" height="1083" alt="Screenshot 2025-12-04 at 15 20 43" src="https://github.com/user-attachments/assets/97e48c53-24ee-4b8f-aa96-b628ff20e19c" />
<img width="327" height="344" alt="Screenshot 2025-12-04 at 15 20 49" src="https://github.com/user-attachments/assets/56546d31-9888-412d-8294-bb532a63cd3d" />


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
