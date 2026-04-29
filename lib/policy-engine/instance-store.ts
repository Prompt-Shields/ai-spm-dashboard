// Client-side store for user-created Policy Instances.
// Uses localStorage for persistence. Replace with backend API call when ready.

import type { PolicyInstance, PolicyTemplate, EnforcementMode } from "../policy-templates/types"
import { getTemplateById } from "../policy-templates/templates"

const STORAGE_KEY = "policy-instances-v1"

// ─── Storage primitives ──────────────────────────────────────────────

function loadAll(): PolicyInstance[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as PolicyInstance[]
  } catch (err) {
    console.error("Failed to load policy instances", err)
    return []
  }
}

function saveAll(instances: PolicyInstance[]): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(instances))
}

function generateId(): string {
  return `policy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// ─── Public API ──────────────────────────────────────────────────────

export function listInstances(): PolicyInstance[] {
  return loadAll()
}

export function getInstance(id: string): PolicyInstance | undefined {
  return loadAll().find((i) => i.id === id)
}

export function listInstancesForApplication(applicationId: string): PolicyInstance[] {
  return loadAll().filter(
    (i) => i.appliesTo.applicationIds.includes(applicationId) && i.status === "active"
  )
}

export function listInstancesByTemplate(templateId: string): PolicyInstance[] {
  return loadAll().filter((i) => i.templateId === templateId)
}

/**
 * Clone a template into a new editable Instance.
 * Pre-populates parameter values from template defaults.
 */
export function cloneFromTemplate(
  templateId: string,
  options: { name?: string; createdBy?: string } = {}
): PolicyInstance {
  const template = getTemplateById(templateId)
  if (!template) {
    throw new Error(`Template not found: ${templateId}`)
  }

  const now = new Date().toISOString()
  const instance: PolicyInstance = {
    id: generateId(),
    name: options.name ?? template.name,
    templateId: template.id,
    templateVersion: template.version,
    parameterValues: defaultParameterValues(template),
    enforcementMode: template.defaults.enforcementMode,
    severity: template.severity,
    appliesTo: {
      applicationIds: [],
      dataClassifications: template.defaults.appliesTo.dataClassifications ?? [],
      riskTiers: template.defaults.appliesTo.riskTiers ?? [],
      departments: template.defaults.appliesTo.departments ?? []
    },
    allowList: [],
    reviewers: [],
    notifications: {},
    status: "draft",
    createdBy: options.createdBy ?? "system",
    createdAt: now,
    updatedAt: now
  }

  const all = loadAll()
  all.push(instance)
  saveAll(all)
  return instance
}

export function updateInstance(id: string, updates: Partial<PolicyInstance>): PolicyInstance {
  const all = loadAll()
  const idx = all.findIndex((i) => i.id === id)
  if (idx < 0) throw new Error(`Instance not found: ${id}`)

  const merged: PolicyInstance = {
    ...all[idx],
    ...updates,
    id: all[idx].id, // never let updates change identity
    templateId: all[idx].templateId,
    createdAt: all[idx].createdAt,
    updatedAt: new Date().toISOString()
  }
  all[idx] = merged
  saveAll(all)
  return merged
}

export function updateParameterValue(id: string, key: string, value: unknown): PolicyInstance {
  const instance = getInstance(id)
  if (!instance) throw new Error(`Instance not found: ${id}`)
  return updateInstance(id, {
    parameterValues: { ...instance.parameterValues, [key]: value }
  })
}

export function setEnforcementMode(id: string, mode: EnforcementMode): PolicyInstance {
  return updateInstance(id, { enforcementMode: mode })
}

export function activate(id: string): PolicyInstance {
  return updateInstance(id, {
    status: "active",
    activatedAt: new Date().toISOString()
  })
}

export function pause(id: string): PolicyInstance {
  return updateInstance(id, { status: "paused" })
}

export function archive(id: string): PolicyInstance {
  return updateInstance(id, { status: "archived" })
}

export function deleteInstance(id: string): void {
  const all = loadAll().filter((i) => i.id !== id)
  saveAll(all)
}

// ─── Bulk operations ─────────────────────────────────────────────────

export function assignToApplications(id: string, applicationIds: string[]): PolicyInstance {
  const instance = getInstance(id)
  if (!instance) throw new Error(`Instance not found: ${id}`)
  return updateInstance(id, {
    appliesTo: { ...instance.appliesTo, applicationIds }
  })
}

// ─── Upgrade detection ───────────────────────────────────────────────

export interface UpgradeStatus {
  instanceId: string
  instanceVersion: string
  templateVersion: string
  upgradeAvailable: boolean
}

export function checkUpgrades(): UpgradeStatus[] {
  return loadAll().map((instance) => {
    const template = getTemplateById(instance.templateId)
    return {
      instanceId: instance.id,
      instanceVersion: instance.templateVersion,
      templateVersion: template?.version ?? "unknown",
      upgradeAvailable: !!template && template.version !== instance.templateVersion
    }
  })
}

// ─── Defaults ────────────────────────────────────────────────────────

function defaultParameterValues(template: PolicyTemplate): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (const param of template.tunableParameters) {
    values[param.key] = param.default
  }
  return values
}

// ─── Coverage analytics ──────────────────────────────────────────────

export interface CoverageReport {
  totalApplications: number
  applicationsWithPolicies: number
  applicationsWithoutPolicies: string[]
  policiesPerApp: Record<string, number>
  uncoveredHighRisk: string[]
}

export function buildCoverageReport(
  allApplications: Array<{ id: string; riskTier?: string }>
): CoverageReport {
  const instances = loadAll().filter((i) => i.status === "active")
  const appsWithPolicy = new Set<string>()
  const policiesPerApp: Record<string, number> = {}

  for (const inst of instances) {
    for (const appId of inst.appliesTo.applicationIds) {
      appsWithPolicy.add(appId)
      policiesPerApp[appId] = (policiesPerApp[appId] ?? 0) + 1
    }
  }

  const uncovered = allApplications
    .filter((a) => !appsWithPolicy.has(a.id))
    .map((a) => a.id)

  const uncoveredHighRisk = allApplications
    .filter((a) => !appsWithPolicy.has(a.id) && a.riskTier === "High-Risk")
    .map((a) => a.id)

  return {
    totalApplications: allApplications.length,
    applicationsWithPolicies: appsWithPolicy.size,
    applicationsWithoutPolicies: uncovered,
    policiesPerApp,
    uncoveredHighRisk
  }
}
