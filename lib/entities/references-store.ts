// Reference (entity edges) store. Two flavours:
//   - Manual: an admin draws an edge in the UI, sticks until deleted.
//   - Auto-derived: materialised from telemetry or other entity fields
//     (e.g. Person.organizationalUnitId becomes a Belongs To edge).
//     `autoDerived: true` so a recompute pass can wipe + re-seed them
//     without touching manual edges.
//
// Decision #6: macOS-observed Person→App usage is its own
// "Observed Use" reference type, distinct from the formally-assigned
// "Is Owner Of" — keeps governance clean.

import type { Reference, ReferenceType, CustomId, TenantId } from "./types"
import { createMemoryStore } from "./store-base"
import { DEFAULT_TENANT_ID } from "./types"

export const referencesStore = createMemoryStore<Reference>("references")

export interface ReferenceQuery {
  sourceId?: CustomId
  targetId?: CustomId
  type?: ReferenceType
  autoDerivedOnly?: boolean
  manualOnly?: boolean
}

export function queryReferences(
  q: ReferenceQuery = {},
  tenantId: TenantId = DEFAULT_TENANT_ID
): Reference[] {
  return referencesStore.list(tenantId).filter((r) => {
    if (q.sourceId && r.sourceId !== q.sourceId) return false
    if (q.targetId && r.targetId !== q.targetId) return false
    if (q.type && r.type !== q.type) return false
    if (q.autoDerivedOnly && !r.autoDerived) return false
    if (q.manualOnly && r.autoDerived) return false
    return true
  })
}

/// Idempotent upsert of an auto-derived edge. Looks for an existing
/// edge with the same (source, target, type, autoDerived=true) tuple
/// and refreshes it; otherwise inserts.
export function upsertAutoDerivedReference(
  edge: Omit<Reference, "id" | "autoDerived" | "tenantId" | "createdAt" | "updatedAt"> & {
    id?: string
    tenantId?: TenantId
  }
): Reference {
  const tenantId = edge.tenantId ?? DEFAULT_TENANT_ID
  const existing = queryReferences(
    { sourceId: edge.sourceId, targetId: edge.targetId, type: edge.type, autoDerivedOnly: true },
    tenantId
  )[0]
  const id =
    existing?.id ??
    edge.id ??
    `ref-${tenantId}-${edge.sourceId}-${edge.type.replace(/\s+/g, "_").toLowerCase()}-${edge.targetId}`
  return referencesStore.upsert({
    id,
    sourceId: edge.sourceId,
    targetId: edge.targetId,
    type: edge.type,
    description: edge.description,
    autoDerived: true,
    tenantId,
    createdAt: existing?.createdAt ?? "",
    updatedAt: ""
  })
}

/// Drop every auto-derived edge of a given type for a tenant. Called by
/// the recompute pass before re-seeding from the canonical sources.
export function clearAutoDerivedReferences(
  type: ReferenceType,
  tenantId: TenantId = DEFAULT_TENANT_ID
): number {
  const candidates = queryReferences({ type, autoDerivedOnly: true }, tenantId)
  for (const edge of candidates) {
    referencesStore.delete(edge.id, tenantId)
  }
  return candidates.length
}
