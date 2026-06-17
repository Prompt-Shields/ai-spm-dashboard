// ISO/IEC 42001 compliance journey — demo data + progress state.
//
// Drives the step-by-step admin guide at /comply/iso-42001. The journey
// walks the seven management-system clauses (4–10) of ISO/IEC 42001:2023;
// completing each step theatrically raises the framework's coverage from
// a starting 55% toward a "certification-ready" 100%.
//
// Progress is illustrative and self-contained — it persists to
// localStorage (no backend) so the /comply page can reflect the climbed
// score after the journey is run. Reset restores the 55% baseline.

export const ISO42001_BASE_COVERAGE = 55
export const ISO42001_TARGET_COVERAGE = 100
export const ISO42001_BASE_GAPS = 21
export const ISO42001_COLOR = '#8b5cf6'
export const ISO42001_STORAGE_KEY = 'aispm.iso42001.journey'

/** An Annex A control reference satisfied by a clause step. */
export interface AnnexControl {
  id: string
  name: string
}

/** One step of the journey — a single ISO 42001 management clause. */
export interface Iso42001Step {
  id: string
  clause: string
  clauseTitle: string
  /** What the admin does in this step. */
  action: string
  /** The evidence/artifact the step produces. */
  artifact: string
  /** Annex A controls this step contributes to. */
  annexControls: AnnexControl[]
}

export const ISO42001_STEPS: Iso42001Step[] = [
  {
    id: 'clause-4',
    clause: 'Clause 4',
    clauseTitle: 'Context of the organization',
    action:
      'Define the scope of your AI management system (AIMS) and identify the internal/external issues and interested parties relevant to your AI use.',
    artifact: 'AIMS Scope Statement & Interested-Parties Register',
    annexControls: [
      { id: 'A.3', name: 'Internal organization' },
      { id: 'A.8', name: 'Information for interested parties' },
    ],
  },
  {
    id: 'clause-5',
    clause: 'Clause 5',
    clauseTitle: 'Leadership',
    action:
      'Publish the organizational AI policy, secure leadership commitment, and assign AI roles, responsibilities and accountabilities (RACI).',
    artifact: 'AI Policy & Roles/Accountability (RACI) matrix',
    annexControls: [
      { id: 'A.2', name: 'Policies related to AI' },
      { id: 'A.3', name: 'Internal organization' },
    ],
  },
  {
    id: 'clause-6',
    clause: 'Clause 6',
    clauseTitle: 'Planning',
    action:
      'Run AI risk assessments and AI system impact assessments across your inventory, and set measurable AI objectives to address risks and opportunities.',
    artifact: 'AI Risk Register & AI System Impact Assessments',
    annexControls: [{ id: 'A.5', name: 'Assessing impacts of AI systems' }],
  },
  {
    id: 'clause-7',
    clause: 'Clause 7',
    clauseTitle: 'Support',
    action:
      'Provision resources, establish competence and awareness for staff working with AI, and bring documented information under version control.',
    artifact: 'Competence & Awareness records · Documented-Information index',
    annexControls: [
      { id: 'A.4', name: 'Resources for AI systems' },
      { id: 'A.7', name: 'Data for AI systems' },
    ],
  },
  {
    id: 'clause-8',
    clause: 'Clause 8',
    clauseTitle: 'Operation',
    action:
      'Implement operational controls, execute the risk treatment plan against open gaps, and record a Statement of Applicability over the Annex A controls.',
    artifact: 'Risk Treatment Plan & Statement of Applicability (SoA)',
    annexControls: [
      { id: 'A.6', name: 'AI system life cycle' },
      { id: 'A.9', name: 'Use of AI systems' },
      { id: 'A.10', name: 'Third-party relationships' },
    ],
  },
  {
    id: 'clause-9',
    clause: 'Clause 9',
    clauseTitle: 'Performance evaluation',
    action:
      'Monitor and measure AIMS performance against your objectives, conduct an internal audit, and hold a management review.',
    artifact: 'Internal Audit Report · Management Review minutes · KPIs',
    annexControls: [{ id: 'A.6', name: 'AI system life cycle' }],
  },
  {
    id: 'clause-10',
    clause: 'Clause 10',
    clauseTitle: 'Improvement',
    action:
      'Log nonconformities, drive corrective actions to closure, and establish a continual-improvement loop for the AIMS.',
    artifact: 'Nonconformity & Corrective-Action log · Improvement plan',
    annexControls: [{ id: 'A.2', name: 'Policies related to AI' }],
  },
]

export const ISO42001_STEP_COUNT = ISO42001_STEPS.length

/** Coverage % derived from how many clauses are complete (55% → 100%). */
export function computeCoverage(completedCount: number): number {
  const ratio = Math.min(completedCount, ISO42001_STEP_COUNT) / ISO42001_STEP_COUNT
  return Math.round(
    ISO42001_BASE_COVERAGE + ratio * (ISO42001_TARGET_COVERAGE - ISO42001_BASE_COVERAGE),
  )
}

/** Remaining gaps, shrinking from 21 to 0 as clauses complete. */
export function computeGapCount(completedCount: number): number {
  const ratio = Math.min(completedCount, ISO42001_STEP_COUNT) / ISO42001_STEP_COUNT
  return Math.round(ISO42001_BASE_GAPS * (1 - ratio))
}

export function isCertificationReady(completedCount: number): boolean {
  return completedCount >= ISO42001_STEP_COUNT
}

/** Read the completed-step ids from localStorage (SSR-safe). */
export function readCompletedSteps(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(ISO42001_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // Keep only ids we recognise, in canonical step order.
    return ISO42001_STEPS.map((s) => s.id).filter((id) => parsed.includes(id))
  } catch {
    return []
  }
}

/** Persist the completed-step ids to localStorage. */
export function writeCompletedSteps(ids: string[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ISO42001_STORAGE_KEY, JSON.stringify(ids))
}
