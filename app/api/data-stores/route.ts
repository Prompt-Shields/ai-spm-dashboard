// GET / POST  /api/data-stores

import type { DataClassification, DataStore, StoreType } from "@/lib/entities/types"
import { DEFAULT_TENANT_ID, nowIso, slugify } from "@/lib/entities/types"
import { dataStoresStore } from "@/lib/entities/data-stores-store"
import { ensureFixturesSeeded } from "@/lib/entities/fixtures"
import {
  optionalBoolean,
  optionalString,
  optionalStringArray,
  requireOneOf,
  requireString
} from "@/lib/entities/store-base"
import { jsonOk, readJsonBody, withRouteErrors } from "@/lib/entities/route-helpers"

export const dynamic = "force-dynamic"

const STORE_TYPES: readonly StoreType[] = [
  "Relational Database",
  "Document Store",
  "Object Store",
  "Data Warehouse",
  "Cache",
  "Search Index",
  "Other"
]

const DATA_CLASSIFICATIONS: readonly DataClassification[] = [
  "public",
  "internal",
  "confidential",
  "restricted"
]

export async function GET() {
  ensureFixturesSeeded()
  return jsonOk({ dataStores: dataStoresStore.list() })
}

export async function POST(request: Request) {
  return withRouteErrors(async () => {
    ensureFixturesSeeded()
    const raw = await readJsonBody(request)
    return jsonOk({ dataStore: dataStoresStore.upsert(parseDataStoreInput(raw)) }, 201)
  })
}

export function parseDataStoreInput(raw: unknown): DataStore {
  if (!raw || typeof raw !== "object") throw new Error("body_must_be_object")
  const r = raw as Record<string, unknown>
  const componentName = requireString(r.componentName, "componentName")
  const id = optionalString(r.id, "id") ?? `ds-${slugify(componentName)}`
  return {
    id,
    tenantId: DEFAULT_TENANT_ID,
    componentName,
    description: optionalString(r.description, "description") ?? "",
    storeType: requireOneOf(r.storeType ?? "Other", STORE_TYPES, "storeType"),
    dataClassification: requireOneOf(
      r.dataClassification ?? "internal",
      DATA_CLASSIFICATIONS,
      "dataClassification"
    ),
    location: optionalString(r.location, "location") ?? "",
    recordCount: optionalString(r.recordCount, "recordCount"),
    refreshFrequency: optionalString(r.refreshFrequency, "refreshFrequency"),
    retentionPeriod: optionalString(r.retentionPeriod, "retentionPeriod"),
    encryption: optionalString(r.encryption, "encryption"),
    accessControls: optionalString(r.accessControls, "accessControls"),
    gdprCompliant: optionalBoolean(r.gdprCompliant, "gdprCompliant") ?? false,
    dataOwnerId: optionalString(r.dataOwnerId, "dataOwnerId"),
    lastAudit: optionalString(r.lastAudit, "lastAudit"),
    tags: optionalStringArray(r.tags, "tags"),
    createdAt: nowIso(),
    updatedAt: nowIso()
  }
}
