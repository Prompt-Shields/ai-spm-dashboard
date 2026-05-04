# Ardoq AI Lens Import Package

Restructured data from the AI-SPM Dashboard, formatted to match Ardoq's AI Lens metamodel exactly.

## Import Order (must follow this sequence)

| Step | File | Ardoq Workspace | Component Type | Records |
|------|------|----------------|----------------|---------|
| 1 | `01_technical_capabilities.csv` | Technical Capabilities | Technical Capability | 30 |
| 2 | `02_applications.csv` | Applications | Application | 60 |
| 3 | `03_technology_products.csv` | Technology Products | Technology Product | 22 |
| 4 | `04_technology_services.csv` | Technology Service Repository | Technology Service | 10 |
| 5 | `05_people.csv` | People | Person | 20 |
| 6 | `06_organization.csv` | Organization | Organizational Unit | 19 |
| 7 | `07_data_stores.csv` | Logical Information | Data Store | 5 |
| 8 | `08_compliance_assessments.csv` | Compliance Assurance | Compliance Assessment | 15 |
| 9 | `09_references.csv` | (cross-workspace) | Reference | 128 |

**Total: 309 components + 128 references**

## How AI Lens Detection Works

AI Lens uses two **calculated fields** (you don't create these — they auto-compute):

1. **AI System** (on Applications, Technology Services, Technology Products):
   - `true` if the component realizes a Technical Capability that is a descendant of "Artificial Intelligence"
   - Triggered by `Is Realized By` references in `09_references.csv`

2. **AI Capability** (on Technical Capabilities):
   - `true` if the component is named "Artificial Intelligence" or is a descendant

**Critical:** The `01_technical_capabilities.csv` file contains "Artificial Intelligence" as the Level 1 root. This exact name is required.

## Import Instructions

### Method 1: Excel/CSV Import (Recommended for first load)

1. Go to **Ardoq > Integrations > Import from Excel**
2. Import files in order (Step 1-8 first, then Step 9 for references)
3. For each file:
   - Select the target **Workspace** (create if it doesn't exist)
   - Map **Component Name** → Component name
   - Map **Custom ID** → Custom ID / Import ID
   - Map **Description** → Description
   - Map **Tags** → Tags (comma-separated)
   - Map remaining columns to custom fields
4. For `01_technical_capabilities.csv`:
   - Map **Level 1, Level 2, Level 3** as hierarchy columns (creates parent-child)
5. For `09_references.csv`:
   - Map **Source Custom ID** → Source (by Custom ID)
   - Map **Target Custom ID** → Target (by Custom ID)
   - Map **Reference Type** → Type
6. Save each column mapping as a template for future re-imports

### Method 2: Import API (Programmatic / Repeatable)

```bash
# 1. First create a configuration via the Excel importer UI and save it
# 2. Then use the API for subsequent imports:

curl -X POST "https://<domain>.ardoq.com/api/integrations/tabular/import" \
  -H "Authorization: Token token=<yourAPIToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "config": { "name": "AI Lens Import - Applications" },
    "tables": [{
      "id": "1",
      "rows": [
        {
          "component-name": "Contract Review AI",
          "description": "Uses GPT-4o to review contracts...",
          "custom-id": "app-contract-review",
          "department": "Legal",
          "owner": "Sarah Chen",
          "data-classification": "confidential",
          "deployment-status": "Active",
          "risk-score": "70",
          "tags": "ai-system,legal,gpt-4o,assessed"
        }
      ]
    }]
  }'
```

**Field name convention for API:** lowercase, spaces replaced with hyphens.
E.g., "Component Name" → `component-name`, "Custom ID" → `custom-id`

### Method 3: REST API (Direct CRUD)

```bash
# Create a component
curl -X POST "https://<domain>.ardoq.com/api/component" \
  -H "Authorization: Token token=<yourAPIToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Contract Review AI",
    "rootWorkspace": "<workspace-id>",
    "typeId": "<application-type-id>",
    "description": "Uses GPT-4o to review contracts...",
    "customId": "app-contract-review"
  }'

# Create a reference
curl -X POST "https://<domain>.ardoq.com/api/reference" \
  -H "Authorization: Token token=<yourAPIToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "<source-component-id>",
    "target": "<target-component-id>",
    "rootWorkspace": "<workspace-id>",
    "type": 2,
    "description": "Contract Review AI deploys GPT-4o"
  }'
```

## Reference Types Mapping

| Reference Type in CSV | Ardoq Meaning | Direction |
|----------------------|---------------|-----------|
| `Is Realized By` | Technical Capability → Technology Product | **Triggers AI System detection** |
| `Deploys` | Application → Technology Product | Application uses this model |
| `Is Owner Of` | Person → Application | Ownership accountability |
| `Belongs To` | Person → Organizational Unit | Org structure |
| `Reads From` | Application → Data Store | Data dependency |
| `Runs On` | Application → Technology Service | Infrastructure hosting |
| `Has Subject` | Compliance Assessment → Application | What is being assessed |

## Custom Fields to Create

Before importing, create these custom fields in the relevant workspaces:

### Applications Workspace
| Field Label | Field Type | Description |
|------------|-----------|-------------|
| Department | Text | Business department |
| Owner | Text | Responsible person name |
| Data Classification | List | public, internal, confidential, restricted |
| Deployment Status | List | Active, Shadow, Deprecated, Testing |
| Risk Score | Number | 0-100 risk rating |

### Technology Products Workspace
| Field Label | Field Type | Description |
|------------|-----------|-------------|
| Provider | Text | Model provider/vendor |
| Version | Text | Model version |
| Model Category | List | LLM, Computer Vision, Speech, Image Generation, Machine Learning |
| Parameters | Text | Model parameter count |
| Lifecycle Status | List | Production, Evaluation, Deprecated |
| Input Cost Per M Tokens | Text | Pricing |
| Output Cost Per M Tokens | Text | Pricing |
| Context Window | Text | Token limit |
| Estimated Monthly Spend NOK | Number | Monthly cost |

### Compliance Assessments Workspace
| Field Label | Field Type | Description |
|------------|-----------|-------------|
| Assessment Type | List | EU AI Act, GDPR, NIST AI RMF, ISO 42001 |
| Pass | Checkbox | Pass/fail |
| Rationale | Text paragraph | Assessment rationale |
| Review Date | Date time | When assessed |
| Approval Status | List | Approved, Under Review, Rejected |
| EU AI Act Risk Level | List | Unacceptable Risk, High-Risk, Limited Risk, Minimal Risk |

## Deploying AI Lens

After importing all data:

1. Go to **Ardoq Admin > Solutions > AI Lens**
2. Deploy **Enterprise AI Management** first
3. Then deploy **Enterprise AI Governance**
4. Optionally deploy **EU AI Act** tracking
5. AI Lens will auto-detect AI Systems via the `Is Realized By` references

## Pre-Built Resources to Import

Use the **Frameworks & Resources Importer** in Ardoq to also import:
- AI Principles Model
- EU AI Act Framework (Categories + Requirements)
- AI Health Check surveys
- AI Compliance Assessment surveys
