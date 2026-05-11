// Person CRUD store.
// Two write paths:
//   1. macOS Promptly app upserts via POST /api/people/me using the
//      Auth0 sub. We dedupe by `auth0Sub` so re-running the macOS app
//      doesn't multiply rows.
//   2. Dashboard admin fills in role / department / etc. via the /admin
//      Persons tab.

import type { Person, Auth0Sub, TenantId } from "./types"
import { createMemoryStore } from "./store-base"
import { DEFAULT_TENANT_ID } from "./types"

export const personsStore = createMemoryStore<Person>("persons")

/// Lookup by Auth0 sub. Used by /api/people/me to dedupe when the macOS
/// app re-emits on every login.
export function findPersonByAuth0Sub(
  sub: Auth0Sub,
  tenantId: TenantId = DEFAULT_TENANT_ID
): Person | undefined {
  return personsStore.list(tenantId).find((p) => p.auth0Sub === sub)
}

/// Lookup by email. Useful when SCIM sync lands and needs to match the
/// macOS-emitted record by email rather than auth0 sub.
export function findPersonByEmail(
  email: string,
  tenantId: TenantId = DEFAULT_TENANT_ID
): Person | undefined {
  const normalised = email.trim().toLowerCase()
  return personsStore
    .list(tenantId)
    .find((p) => p.email.trim().toLowerCase() === normalised)
}
