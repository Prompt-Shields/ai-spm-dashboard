// GET / POST  /api/technology-products

import type { ModelCategory, TechnologyProduct } from "@/lib/entities/types"
import { DEFAULT_TENANT_ID, nowIso, slugify } from "@/lib/entities/types"
import { ensureFixturesSeeded } from "@/lib/entities/fixtures"
import { technologyProductsStore } from "@/lib/entities/technology-products-store"
import {
  optionalNumber,
  optionalString,
  optionalStringArray,
  requireOneOf,
  requireString
} from "@/lib/entities/store-base"
import { jsonOk, readJsonBody, withRouteErrors } from "@/lib/entities/route-helpers"

export const dynamic = "force-dynamic"

const MODEL_CATEGORIES: readonly ModelCategory[] = [
  "LLM",
  "Computer Vision",
  "Speech",
  "Image Generation",
  "Machine Learning",
  "Other"
]

const LIFECYCLE_STATUSES = ["Production", "Evaluation", "Deprecated"] as const

export async function GET() {
  ensureFixturesSeeded()
  return jsonOk({ technologyProducts: technologyProductsStore.list() })
}

export async function POST(request: Request) {
  return withRouteErrors(async () => {
    ensureFixturesSeeded()
    const raw = await readJsonBody(request)
    return jsonOk(
      { technologyProduct: technologyProductsStore.upsert(parseTechnologyProductInput(raw)) },
      201
    )
  })
}

export function parseTechnologyProductInput(raw: unknown): TechnologyProduct {
  if (!raw || typeof raw !== "object") throw new Error("body_must_be_object")
  const r = raw as Record<string, unknown>
  const componentName = requireString(r.componentName, "componentName")
  const id = optionalString(r.id, "id") ?? `tp-${slugify(componentName)}`
  return {
    id,
    tenantId: DEFAULT_TENANT_ID,
    componentName,
    description: optionalString(r.description, "description") ?? "",
    provider: requireString(r.provider, "provider"),
    version: optionalString(r.version, "version") ?? "1.0",
    modelCategory: requireOneOf(r.modelCategory ?? "LLM", MODEL_CATEGORIES, "modelCategory"),
    parameters: optionalString(r.parameters, "parameters"),
    lifecycleStatus: requireOneOf(
      r.lifecycleStatus ?? "Production",
      LIFECYCLE_STATUSES,
      "lifecycleStatus"
    ),
    inputCostPerMTokens: optionalString(r.inputCostPerMTokens, "inputCostPerMTokens"),
    outputCostPerMTokens: optionalString(r.outputCostPerMTokens, "outputCostPerMTokens"),
    contextWindow: optionalString(r.contextWindow, "contextWindow"),
    estimatedMonthlySpendNOK: optionalNumber(r.estimatedMonthlySpendNOK, "estimatedMonthlySpendNOK"),
    tags: optionalStringArray(r.tags, "tags"),
    promptlyAppIds: optionalStringArray(r.promptlyAppIds, "promptlyAppIds"),
    createdAt: nowIso(),
    updatedAt: nowIso()
  }
}
