// GET / POST  /api/technology-services

import type { ServiceType, TechnologyService } from "@/lib/entities/types"
import { DEFAULT_TENANT_ID, nowIso, slugify } from "@/lib/entities/types"
import { ensureFixturesSeeded } from "@/lib/entities/fixtures"
import { technologyServicesStore } from "@/lib/entities/technology-services-store"
import {
  optionalNumber,
  optionalString,
  optionalStringArray,
  requireOneOf,
  requireString
} from "@/lib/entities/store-base"
import { jsonOk, readJsonBody, withRouteErrors } from "@/lib/entities/route-helpers"

export const dynamic = "force-dynamic"

const SERVICE_TYPES: readonly ServiceType[] = [
  "Cloud Infrastructure",
  "AI Platform",
  "API Gateway",
  "Identity Provider",
  "Database Service",
  "Other"
]

const STATUSES = ["Active", "Deprecated"] as const

export async function GET() {
  ensureFixturesSeeded()
  return jsonOk({ technologyServices: technologyServicesStore.list() })
}

export async function POST(request: Request) {
  return withRouteErrors(async () => {
    ensureFixturesSeeded()
    const raw = await readJsonBody(request)
    return jsonOk(
      { technologyService: technologyServicesStore.upsert(parseTechnologyServiceInput(raw)) },
      201
    )
  })
}

export function parseTechnologyServiceInput(raw: unknown): TechnologyService {
  if (!raw || typeof raw !== "object") throw new Error("body_must_be_object")
  const r = raw as Record<string, unknown>
  const componentName = requireString(r.componentName, "componentName")
  const id = optionalString(r.id, "id") ?? `svc-${slugify(componentName)}`
  return {
    id,
    tenantId: DEFAULT_TENANT_ID,
    componentName,
    description: optionalString(r.description, "description") ?? "",
    provider: requireString(r.provider, "provider"),
    serviceType: requireOneOf(r.serviceType ?? "Other", SERVICE_TYPES, "serviceType"),
    region: optionalString(r.region, "region") ?? "",
    status: requireOneOf(r.status ?? "Active", STATUSES, "status"),
    uptimePct: optionalNumber(r.uptimePct, "uptimePct"),
    costPerMonthNOK: optionalNumber(r.costPerMonthNOK, "costPerMonthNOK"),
    securityCertifications: optionalStringArray(r.securityCertifications, "securityCertifications"),
    networkIsolation: optionalString(r.networkIsolation, "networkIsolation"),
    scalingPolicy: optionalString(r.scalingPolicy, "scalingPolicy"),
    backupStrategy: optionalString(r.backupStrategy, "backupStrategy"),
    tags: optionalStringArray(r.tags, "tags"),
    createdAt: nowIso(),
    updatedAt: nowIso()
  }
}
