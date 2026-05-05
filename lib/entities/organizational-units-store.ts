// Organizational Unit CRUD store. Departments / business units / nested
// org-chart subtrees. Today filled manually; SCIM sync replaces the
// manual path when it lands without changing this interface.

import type { OrganizationalUnit, TenantId, CustomId } from "./types"
import { createMemoryStore } from "./store-base"
import { DEFAULT_TENANT_ID } from "./types"

export const organizationalUnitsStore = createMemoryStore<OrganizationalUnit>("organizational-units")

/// Walk up the parent chain. Returns the unit + every ancestor up to
/// the root. Useful when computing tags or for the Belongs To edges.
export function getOrganizationalUnitAncestry(
  id: CustomId,
  tenantId: TenantId = DEFAULT_TENANT_ID
): OrganizationalUnit[] {
  const result: OrganizationalUnit[] = []
  const seen = new Set<CustomId>()
  let cursor = organizationalUnitsStore.get(id, tenantId)
  while (cursor && !seen.has(cursor.id)) {
    seen.add(cursor.id)
    result.push(cursor)
    if (!cursor.parentId) break
    cursor = organizationalUnitsStore.get(cursor.parentId, tenantId)
  }
  return result
}
