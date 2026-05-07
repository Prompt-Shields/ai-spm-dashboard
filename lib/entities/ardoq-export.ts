// Ardoq CSV export — turns the in-memory entity stores into the 9-CSV
// Ardoq AI Lens import package.
//
// Output shape mirrors the static reference files in `ardoq-import/`,
// which are themselves derived from the Ardoq AI Lens import schema.
// The headers (with spaces) match exactly what Ardoq's "Import from
// Excel" expects. Each function:
//
//   1. Pulls every record from the relevant store, scoped to a tenant.
//   2. Resolves cross-entity references via Custom ID lookups (e.g.
//      Application.ownerPersonId → person.componentName for the "Owner"
//      column).
//   3. Emits a CSV string with CRLF line endings (Excel-friendly).
//
// All exports are pure functions of the store contents; calling them
// twice in a row produces byte-identical output.

import { applicationsStore } from "./applications-store"
import { complianceAssessmentsStore } from "./compliance-assessments-store"
import { dataStoresStore } from "./data-stores-store"
import { organizationalUnitsStore } from "./organizational-units-store"
import { personsStore } from "./persons-store"
import { referencesStore } from "./references-store"
import { technicalCapabilitiesStore } from "./technical-capabilities-store"
import { technologyProductsStore } from "./technology-products-store"
import { technologyServicesStore } from "./technology-services-store"
import { DEFAULT_TENANT_ID, type TenantId } from "./types"

// ─── CSV primitives ──────────────────────────────────────────────────

/// RFC 4180-style escape: wrap in quotes and double-up internal quotes
/// when the cell contains a comma, quote, CR or LF. Unconditionally
/// quote when the field is a tag list, to be safe.
function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ""
  const s = String(value)
  if (/[",\r\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

function csvRow(cells: unknown[]): string {
  return cells.map(csvEscape).join(",")
}

/// Join header + rows with CRLF. Trailing newline included so files
/// can be appended cleanly.
function csv(header: string[], rows: unknown[][]): string {
  const lines = [csvRow(header), ...rows.map(csvRow)]
  return lines.join("\r\n") + "\r\n"
}

function joinTags(tags: string[]): string {
  return tags.join(",")
}

// ─── 01 Technical Capabilities ───────────────────────────────────────
//
// Header: Level 1 | Level 2 | Level 3 | Description | Custom ID
// Hierarchy is encoded by which level columns are populated. Ardoq
// reads Level 1 as the parent, Level 2 as a child of that name, etc.

export function exportTechnicalCapabilitiesCsv(tenantId: TenantId = DEFAULT_TENANT_ID): string {
  const rows = technicalCapabilitiesStore
    .list(tenantId)
    .map((c) => [c.level1, c.level2 ?? "", c.level3 ?? "", c.description, c.id])
  return csv(["Level 1", "Level 2", "Level 3", "Description", "Custom ID"], rows)
}

// ─── 02 Applications ─────────────────────────────────────────────────
//
// Header: Component Name | Description | Custom ID | Department |
//         Owner | Data Classification | Deployment Status |
//         Risk Score | Tags
// Department resolved from organizationalUnitId → org.componentName.
// Owner resolved from ownerPersonId → person.componentName.

export function exportApplicationsCsv(tenantId: TenantId = DEFAULT_TENANT_ID): string {
  const orgs = new Map(
    organizationalUnitsStore.list(tenantId).map((o) => [o.id, o.componentName]),
  )
  const people = new Map(personsStore.list(tenantId).map((p) => [p.id, p.componentName]))

  const rows = applicationsStore.list(tenantId).map((a) => [
    a.componentName,
    a.description,
    a.id,
    a.organizationalUnitId ? (orgs.get(a.organizationalUnitId) ?? "") : "",
    a.ownerPersonId ? (people.get(a.ownerPersonId) ?? "") : "",
    a.dataClassification ?? "",
    a.deploymentStatus,
    String(a.riskScore),
    joinTags(a.tags),
  ])

  return csv(
    [
      "Component Name",
      "Description",
      "Custom ID",
      "Department",
      "Owner",
      "Data Classification",
      "Deployment Status",
      "Risk Score",
      "Tags",
    ],
    rows,
  )
}

// ─── 03 Technology Products ──────────────────────────────────────────

export function exportTechnologyProductsCsv(tenantId: TenantId = DEFAULT_TENANT_ID): string {
  const rows = technologyProductsStore.list(tenantId).map((p) => [
    p.componentName,
    p.description,
    p.id,
    p.provider,
    p.version,
    p.modelCategory,
    p.parameters ?? "",
    p.lifecycleStatus,
    p.inputCostPerMTokens ?? "",
    p.outputCostPerMTokens ?? "",
    p.contextWindow ?? "",
    p.estimatedMonthlySpendNOK !== undefined ? String(p.estimatedMonthlySpendNOK) : "",
    joinTags(p.tags),
  ])

  return csv(
    [
      "Component Name",
      "Description",
      "Custom ID",
      "Provider",
      "Version",
      "Model Category",
      "Parameters",
      "Lifecycle Status",
      "Input Cost Per M Tokens",
      "Output Cost Per M Tokens",
      "Context Window",
      "Estimated Monthly Spend NOK",
      "Tags",
    ],
    rows,
  )
}

// ─── 04 Technology Services ──────────────────────────────────────────

export function exportTechnologyServicesCsv(tenantId: TenantId = DEFAULT_TENANT_ID): string {
  const rows = technologyServicesStore.list(tenantId).map((s) => [
    s.componentName,
    s.description,
    s.id,
    s.provider,
    s.serviceType,
    s.region,
    s.status,
    s.uptimePct !== undefined ? s.uptimePct.toFixed(2) : "",
    s.costPerMonthNOK !== undefined ? String(s.costPerMonthNOK) : "",
    s.securityCertifications.join("; "),
    s.networkIsolation ?? "",
    s.scalingPolicy ?? "",
    s.backupStrategy ?? "",
    joinTags(s.tags),
  ])

  return csv(
    [
      "Component Name",
      "Description",
      "Custom ID",
      "Provider",
      "Service Type",
      "Region",
      "Status",
      "Uptime Pct",
      "Cost Per Month NOK",
      "Security Certifications",
      "Network Isolation",
      "Scaling Policy",
      "Backup Strategy",
      "Tags",
    ],
    rows,
  )
}

// ─── 05 People ───────────────────────────────────────────────────────

export function exportPeopleCsv(tenantId: TenantId = DEFAULT_TENANT_ID): string {
  const rows = personsStore.list(tenantId).map((p) => [
    p.componentName,
    p.description,
    p.id,
    p.email,
    p.role,
    joinTags(p.tags),
  ])
  return csv(
    ["Component Name", "Description", "Custom ID", "Email", "Role", "Tags"],
    rows,
  )
}

// ─── 06 Organizational Units ─────────────────────────────────────────

export function exportOrganizationsCsv(tenantId: TenantId = DEFAULT_TENANT_ID): string {
  const rows = organizationalUnitsStore.list(tenantId).map((o) => [
    o.componentName,
    o.description,
    o.id,
    joinTags(o.tags),
  ])
  return csv(["Component Name", "Description", "Custom ID", "Tags"], rows)
}

// ─── 07 Data Stores ──────────────────────────────────────────────────

export function exportDataStoresCsv(tenantId: TenantId = DEFAULT_TENANT_ID): string {
  const people = new Map(personsStore.list(tenantId).map((p) => [p.id, p.componentName]))

  const rows = dataStoresStore.list(tenantId).map((d) => [
    d.componentName,
    d.description,
    d.id,
    d.storeType,
    d.dataClassification,
    d.location,
    d.recordCount ?? "",
    d.refreshFrequency ?? "",
    d.retentionPeriod ?? "",
    d.encryption ?? "",
    d.accessControls ?? "",
    d.gdprCompliant ? "true" : "false",
    d.dataOwnerId ? (people.get(d.dataOwnerId) ?? "") : "",
    d.lastAudit ?? "",
    joinTags(d.tags),
  ])

  return csv(
    [
      "Component Name",
      "Description",
      "Custom ID",
      "Store Type",
      "Data Classification",
      "Location",
      "Record Count",
      "Refresh Frequency",
      "Retention Period",
      "Encryption",
      "Access Controls",
      "GDPR Compliant",
      "Data Owner",
      "Last Audit",
      "Tags",
    ],
    rows,
  )
}

// ─── 08 Compliance Assessments ───────────────────────────────────────

export function exportComplianceAssessmentsCsv(tenantId: TenantId = DEFAULT_TENANT_ID): string {
  const apps = new Map(applicationsStore.list(tenantId).map((a) => [a.id, a.componentName]))
  const people = new Map(personsStore.list(tenantId).map((p) => [p.id, p.componentName]))

  const rows = complianceAssessmentsStore.list(tenantId).map((c) => [
    c.componentName,
    c.description,
    c.id,
    c.assessmentType,
    apps.get(c.subjectApplicationId) ?? c.subjectApplicationId,
    c.pass ? "true" : "false",
    c.rationale,
    c.reviewDate,
    c.approvalStatus,
    c.approvedByPersonId ? (people.get(c.approvedByPersonId) ?? "") : "",
    c.euAIActRiskLevel ?? "",
    joinTags(c.tags),
  ])

  return csv(
    [
      "Component Name",
      "Description",
      "Custom ID",
      "Assessment Type",
      "Subject Application",
      "Pass",
      "Rationale",
      "Review Date",
      "Approval Status",
      "Approved By",
      "EU AI Act Risk Level",
      "Tags",
    ],
    rows,
  )
}

// ─── 09 References ───────────────────────────────────────────────────

export function exportReferencesCsv(tenantId: TenantId = DEFAULT_TENANT_ID): string {
  const rows = referencesStore
    .list(tenantId)
    .map((r) => [r.sourceId, r.targetId, r.type, r.description])
  return csv(
    ["Source Custom ID", "Target Custom ID", "Reference Type", "Description"],
    rows,
  )
}

// ─── Bundle ──────────────────────────────────────────────────────────
//
// Returns all 9 CSVs keyed by their canonical filenames so the API
// route can either serve them individually or assemble a ZIP.

export interface ArdoqBundle {
  files: { name: string; csv: string }[]
  generatedAt: string
  tenantId: TenantId
  totals: Record<string, number>
}

export function exportArdoqBundle(tenantId: TenantId = DEFAULT_TENANT_ID): ArdoqBundle {
  const files = [
    { name: "01_technical_capabilities.csv", csv: exportTechnicalCapabilitiesCsv(tenantId) },
    { name: "02_applications.csv", csv: exportApplicationsCsv(tenantId) },
    { name: "03_technology_products.csv", csv: exportTechnologyProductsCsv(tenantId) },
    { name: "04_technology_services.csv", csv: exportTechnologyServicesCsv(tenantId) },
    { name: "05_people.csv", csv: exportPeopleCsv(tenantId) },
    { name: "06_organization.csv", csv: exportOrganizationsCsv(tenantId) },
    { name: "07_data_stores.csv", csv: exportDataStoresCsv(tenantId) },
    { name: "08_compliance_assessments.csv", csv: exportComplianceAssessmentsCsv(tenantId) },
    { name: "09_references.csv", csv: exportReferencesCsv(tenantId) },
  ]

  const totals: Record<string, number> = {
    technicalCapabilities: technicalCapabilitiesStore.count(tenantId),
    applications: applicationsStore.count(tenantId),
    technologyProducts: technologyProductsStore.count(tenantId),
    technologyServices: technologyServicesStore.count(tenantId),
    people: personsStore.count(tenantId),
    organizations: organizationalUnitsStore.count(tenantId),
    dataStores: dataStoresStore.count(tenantId),
    complianceAssessments: complianceAssessmentsStore.count(tenantId),
    references: referencesStore.count(tenantId),
  }

  return {
    files,
    generatedAt: new Date().toISOString(),
    tenantId,
    totals,
  }
}
