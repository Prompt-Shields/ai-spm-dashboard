// Generic in-memory CRUD store. Every entity store wraps a `Map` keyed
// by CustomId and exposes the same interface — one place to swap when
// real DB persistence lands.
//
// Rules:
// - Stores are module-scoped, so they survive Next.js HMR within a dev
//   session but reset on server restart. Acceptable for v1.
// - All entities must extend the TenantScoped + Timestamped mixins;
//   the base store enforces tenantId scoping and bumps timestamps
//   automatically.
// - Validation lives in the API route, not here — the store accepts
//   whatever is handed to it after the type guard runs.

import type { CustomId, TenantId, TenantScoped, Timestamped } from "./types"
import { DEFAULT_TENANT_ID, nowIso } from "./types"

export interface EntityStore<T extends TenantScoped & Timestamped & { id: CustomId }> {
  list(tenantId?: TenantId): T[]
  get(id: CustomId, tenantId?: TenantId): T | undefined
  /// Upsert by id within the tenant. If a row exists, merges the new
  /// values onto it and bumps `updatedAt`. If not, inserts. Returns the
  /// final stored copy.
  upsert(record: T): T
  /// Patch an existing record by id. Returns undefined if not found.
  patch(id: CustomId, patch: Partial<Omit<T, "id" | "tenantId" | "createdAt">>, tenantId?: TenantId): T | undefined
  delete(id: CustomId, tenantId?: TenantId): boolean
  count(tenantId?: TenantId): number
}

export function createMemoryStore<
  T extends TenantScoped & Timestamped & { id: CustomId }
>(name: string): EntityStore<T> {
  const rows = new Map<string, T>()

  const compositeKey = (tenantId: TenantId, id: CustomId) => `${tenantId}::${id}`

  return {
    list(tenantId = DEFAULT_TENANT_ID) {
      return Array.from(rows.values()).filter((r) => r.tenantId === tenantId)
    },
    get(id, tenantId = DEFAULT_TENANT_ID) {
      return rows.get(compositeKey(tenantId, id))
    },
    upsert(record) {
      const tenantId = record.tenantId ?? DEFAULT_TENANT_ID
      const key = compositeKey(tenantId, record.id)
      const existing = rows.get(key)
      const now = nowIso()
      const merged: T = existing
        ? {
            ...existing,
            ...record,
            tenantId,
            createdAt: existing.createdAt,
            updatedAt: now
          }
        : { ...record, tenantId, createdAt: record.createdAt ?? now, updatedAt: now }
      rows.set(key, merged)
      return merged
    },
    patch(id, patch, tenantId = DEFAULT_TENANT_ID) {
      const key = compositeKey(tenantId, id)
      const existing = rows.get(key)
      if (!existing) return undefined
      const merged: T = {
        ...existing,
        ...patch,
        // patch can never change immutable fields
        id: existing.id,
        tenantId: existing.tenantId,
        createdAt: existing.createdAt,
        updatedAt: nowIso()
      } as T
      rows.set(key, merged)
      return merged
    },
    delete(id, tenantId = DEFAULT_TENANT_ID) {
      return rows.delete(compositeKey(tenantId, id))
    },
    count(tenantId = DEFAULT_TENANT_ID) {
      return Array.from(rows.values()).filter((r) => r.tenantId === tenantId).length
    }
  }
}

// ─── Validation primitives ───────────────────────────────────────────

export class ValidationError extends Error {
  readonly field?: string
  constructor(message: string, field?: string) {
    super(message)
    this.field = field
    this.name = "ValidationError"
  }
}

export function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ValidationError(`${field} is required`, field)
  }
  return value.trim()
}

export function optionalString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === "") return undefined
  if (typeof value !== "string") {
    throw new ValidationError(`${field} must be a string`, field)
  }
  return value
}

export function optionalStringArray(value: unknown, field: string): string[] {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value)) {
    throw new ValidationError(`${field} must be an array`, field)
  }
  for (const item of value) {
    if (typeof item !== "string") {
      throw new ValidationError(`${field} entries must be strings`, field)
    }
  }
  return value as string[]
}

export function optionalNumber(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null || value === "") return undefined
  const num = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(num)) {
    throw new ValidationError(`${field} must be a number`, field)
  }
  return num
}

export function requireOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string
): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new ValidationError(
      `${field} must be one of: ${allowed.join(", ")}`,
      field
    )
  }
  return value as T
}

export function optionalOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string
): T | undefined {
  if (value === undefined || value === null || value === "") return undefined
  return requireOneOf(value, allowed, field)
}

export function optionalBoolean(value: unknown, field: string): boolean | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === "boolean") return value
  if (value === "true") return true
  if (value === "false") return false
  throw new ValidationError(`${field} must be a boolean`, field)
}
