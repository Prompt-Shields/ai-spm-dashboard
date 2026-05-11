// GET  /api/applications        — list, with ?owner=, ?department=, ?status= filters
// POST /api/applications        — admin-created Application (manual path)
//
// macOS Promptly app uses /api/applications/auto-discovery for the
// shadow-AI insert path.

import type { Application, DataClassification, DeploymentStatus } from "@/lib/entities/types"
import { DEFAULT_TENANT_ID, nowIso, slugify } from "@/lib/entities/types"
import { ensureFixturesSeeded } from "@/lib/entities/fixtures"
import {
  applicationsStore,
  listApplicationsByDepartment,
  listApplicationsByOwner,
  listApplicationsByStatus
} from "@/lib/entities/applications-store"
import {
  optionalBoolean,
  optionalNumber,
  optionalOneOf,
  optionalString,
  optionalStringArray,
  requireOneOf,
  requireString
} from "@/lib/entities/store-base"
import { jsonOk, readJsonBody, withRouteErrors } from "@/lib/entities/route-helpers"

export const dynamic = "force-dynamic"

const DEPLOYMENT_STATUSES: readonly DeploymentStatus[] = [
  "Active",
  "Shadow",
  "Deprecated",
  "Testing"
]

const DATA_CLASSIFICATIONS: readonly DataClassification[] = [
  "public",
  "internal",
  "confidential",
  "restricted"
]

export async function GET(request: Request) {
  ensureFixturesSeeded()
  const url = new URL(request.url)
  const owner = url.searchParams.get("owner")
  const department = url.searchParams.get("department")
  const status = url.searchParams.get("status")

  let applications = applicationsStore.list()
  if (owner) applications = listApplicationsByOwner(owner)
  if (department) applications = listApplicationsByDepartment(department)
  if (status) applications = listApplicationsByStatus(status as DeploymentStatus)

  return jsonOk({ applications })
}

export async function POST(request: Request) {
  return withRouteErrors(async () => {
    ensureFixturesSeeded()
    const raw = await readJsonBody(request)
    return jsonOk({ application: applicationsStore.upsert(parseApplicationInput(raw)) }, 201)
  })
}

export function parseApplicationInput(raw: unknown): Application {
  if (!raw || typeof raw !== "object") {
    throw new Error("body_must_be_object")
  }
  const r = raw as Record<string, unknown>

  const componentName = requireString(r.componentName, "componentName")
  const deploymentStatus = requireOneOf(
    r.deploymentStatus ?? "Active",
    DEPLOYMENT_STATUSES,
    "deploymentStatus"
  )
  const dataClassification = optionalOneOf(
    r.dataClassification,
    DATA_CLASSIFICATIONS,
    "dataClassification"
  )

  const id = optionalString(r.id, "id") ?? `app-${slugify(componentName)}`
  const description = optionalString(r.description, "description") ?? ""
  const organizationalUnitId = optionalString(r.organizationalUnitId, "organizationalUnitId")
  const ownerPersonId = optionalString(r.ownerPersonId, "ownerPersonId")
  const riskScore = Math.max(0, Math.min(100, optionalNumber(r.riskScore, "riskScore") ?? 0))
  const tags = optionalStringArray(r.tags, "tags")
  const autoDiscovered = optionalBoolean(r.autoDiscovered, "autoDiscovered") ?? false
  const autoDiscoveredFromAppId = optionalString(r.autoDiscoveredFromAppId, "autoDiscoveredFromAppId")

  return {
    id,
    tenantId: DEFAULT_TENANT_ID,
    componentName,
    description,
    organizationalUnitId,
    ownerPersonId,
    dataClassification,
    deploymentStatus,
    riskScore,
    tags,
    autoDiscovered,
    autoDiscoveredFromAppId,
    createdAt: nowIso(),
    updatedAt: nowIso()
  }
}
