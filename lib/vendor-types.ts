import type { Risk, Mitigation, ComplianceStatus } from './aimaps-types'

// A SaaS vendor that has shipped AI features into the tools you already buy.
// Reuses the shared Risk / Mitigation / ComplianceStatus shapes so the vendor
// view speaks the same risk language as the rest of the platform.

export type VendorCategory =
  | 'llm-provider'
  | 'productivity-suite'
  | 'developer-tool'
  | 'crm-support'
  | 'data-analytics'

export type VendorContractStatus = 'active' | 'pending-renewal' | 'expired'

export type VendorDiscoveryMethod =
  | 'endpoint'
  | 'browser-extension'
  | 'sso'
  | 'integration'
  | 'manual'

export type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted'

export interface VendorDataFlow {
  id: string
  /** What data this AI feature touches, e.g. "Support tickets + customer PII". */
  description: string
  classification: DataClassification
  /** Whether the vendor uses this data to train or improve its models. */
  trainsOnData: boolean
}

export interface SaaSVendor {
  id: string
  name: string
  /** The AI capability embedded in the SaaS product. */
  aiFeature: string
  category: VendorCategory
  /** 0–100; higher is riskier. */
  riskScore: number
  discoveredVia: VendorDiscoveryMethod
  /** Foundation models behind the feature. */
  models: string[]
  /** Fourth parties the vendor routes data through. */
  subProcessors: string[]
  dataFlows: VendorDataFlow[]
  certifications: string[]
  /** Data Processing Agreement in place. */
  dpa: boolean
  /** Vendor offers an opt-out from training on your data. */
  trainingOptOut: boolean
  contractStatus: VendorContractStatus
  complianceStatus: ComplianceStatus
  risks: Risk[]
  mitigations: Mitigation[]
  lastReviewedAt: string
}
