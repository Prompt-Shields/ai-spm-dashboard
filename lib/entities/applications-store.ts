// Application CRUD store.
// "Application" = a registered AI use case (e.g. "Contract Review AI").
// Created either manually via /admin or auto-shadowed by the macOS
// Promptly app when it observes usage of an AI tool that has no
// matching record yet.

import type { Application, TenantId, CustomId } from "./types"
import { createMemoryStore } from "./store-base"
import { DEFAULT_TENANT_ID } from "./types"

export const applicationsStore = createMemoryStore<Application>("applications")

/// Look up an existing auto-discovered Application for a given Promptly
/// app id + person. Used by the auto-discovery endpoint to dedupe — one
/// shadow record per (employee, AI tool) pair, not one per observed event.
export function findShadowApplicationFor(
  promptlyAppId: string,
  ownerPersonId: CustomId,
  tenantId: TenantId = DEFAULT_TENANT_ID
): Application | undefined {
  return applicationsStore
    .list(tenantId)
    .find(
      (a) =>
        a.autoDiscovered &&
        a.autoDiscoveredFromAppId === promptlyAppId &&
        a.ownerPersonId === ownerPersonId
    )
}

/// Filter helpers for the admin UI.
export function listApplicationsByOwner(
  ownerPersonId: CustomId,
  tenantId: TenantId = DEFAULT_TENANT_ID
): Application[] {
  return applicationsStore.list(tenantId).filter((a) => a.ownerPersonId === ownerPersonId)
}

export function listApplicationsByDepartment(
  organizationalUnitId: CustomId,
  tenantId: TenantId = DEFAULT_TENANT_ID
): Application[] {
  return applicationsStore
    .list(tenantId)
    .filter((a) => a.organizationalUnitId === organizationalUnitId)
}

export function listApplicationsByStatus(
  status: Application["deploymentStatus"],
  tenantId: TenantId = DEFAULT_TENANT_ID
): Application[] {
  return applicationsStore.list(tenantId).filter((a) => a.deploymentStatus === status)
}
