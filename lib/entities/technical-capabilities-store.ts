// TechnicalCapability store. READ-ONLY at the API surface — the
// hierarchy is required by Ardoq AI Lens to detect AI Systems via the
// `Is Realized By` reference type, and the Level 1 root must be exactly
// "Artificial Intelligence" (Ardoq enforces this name).
//
// We seed the canonical hierarchy at import time and never mutate it
// from outside. Custom org-specific capabilities go in a separate
// future entity if/when needed.

import type { TechnicalCapability, TenantId } from "./types"
import { createMemoryStore } from "./store-base"
import { DEFAULT_TENANT_ID } from "./types"

export const technicalCapabilitiesStore = createMemoryStore<TechnicalCapability>("technical-capabilities")

/// Find a capability by its level-2 name. Used when seeding "Is
/// Realized By" edges from a TechnologyProduct's modelCategory.
export function findCapabilityByLevel2(
  level2: string,
  tenantId: TenantId = DEFAULT_TENANT_ID
): TechnicalCapability | undefined {
  return technicalCapabilitiesStore
    .list(tenantId)
    .find((c) => c.level1 === "Artificial Intelligence" && c.level2 === level2)
}
