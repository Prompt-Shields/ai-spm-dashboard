# Ardoq-Compatible CSV Export

All dummy data from the AI-SPM Dashboard codebase, formatted for Ardoq import.

## Files

| # | File | Ardoq Component Type | Records |
|---|------|---------------------|---------|
| 01 | `01_ai_models.csv` | AI Model | 14 |
| 02 | `02_ai_use_cases.csv` | AI Use Case | 40 |
| 03 | `03_persons.csv` | Person | 8 |
| 04 | `04_ai_spm_assets.csv` | AI SPM Asset | 15 |
| 05 | `05_ai_asset_operations.csv` | AI Asset | 15 |
| 06 | `06_security_incidents.csv` | Security Incident | 10 |
| 07 | `07_data_sources.csv` | Data Source | 5 |
| 08 | `08_infrastructure.csv` | Infrastructure | 5 |
| 09 | `09_vendors.csv` | Vendor | 5 |
| 10 | `10_prompts.csv` | Prompt Template | 6 |
| 11 | `11_insurance_ai_risks.csv` | AI Risk Category | 9 |
| 12 | `12_network_topology.csv` | Network Node | 15 |
| 13 | `13_visibility_models.csv` | AI Model (Visibility) | 5 |
| 14 | `14_deepseek_applications.csv` | DeepSeek Application | 20 |
| 15 | `15_model_pricing.csv` | Model Pricing | 8 |
| 16 | `16_references.csv` | Reference (relationship) | 85 |

## Ardoq Import Notes

- **Component Name** = Ardoq component name (unique identifier)
- **Component Type** = Maps to Ardoq component type in the metamodel
- **References** (file 16) define relationships between components using Ardoq reference types: `owns`, `uses`, `feeds`, `hosts`, `provides`
- All field names use Ardoq-compatible naming (no special characters, semicolons used as list delimiters within fields)
- Date formats: ISO 8601 (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SSZ)
- Boolean fields: `true`/`false`
- Numeric fields: no currency symbols (stored separately in column headers)

## Suggested Ardoq Workspace Structure

1. **AI Governance** workspace: AI Models, AI Use Cases, Persons, AI Risk Categories
2. **AI Security Posture** workspace: AI SPM Assets, Security Incidents, AI Assets
3. **AI Infrastructure** workspace: Data Sources, Infrastructure, Vendors, Network Nodes
4. **AI Operations** workspace: Prompt Templates, Model Pricing, Visibility Models, DeepSeek Applications
