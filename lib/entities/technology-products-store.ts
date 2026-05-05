// TechnologyProduct CRUD store. The AI models catalogue: GPT-4o,
// Claude 3.5 Sonnet, Gemini 1.5 Pro, etc. Seeded with the most common
// vendors; admins can extend with org-specific or self-hosted models.

import type { TechnologyProduct, TenantId } from "./types"
import { createMemoryStore } from "./store-base"
import { DEFAULT_TENANT_ID } from "./types"

export const technologyProductsStore = createMemoryStore<TechnologyProduct>("technology-products")

/// Return every TechnologyProduct that lists `promptlyAppId` in its
/// `promptlyAppIds`. Used by the auto-discovery + Ardoq exporter to
/// materialise the "Deploys" reference between an Application and the
/// TechnologyProduct(s) backing the AI tool the user was observed in.
export function findProductsByPromptlyAppId(
  promptlyAppId: string,
  tenantId: TenantId = DEFAULT_TENANT_ID
): TechnologyProduct[] {
  return technologyProductsStore
    .list(tenantId)
    .filter((p) => p.promptlyAppIds.includes(promptlyAppId))
}
