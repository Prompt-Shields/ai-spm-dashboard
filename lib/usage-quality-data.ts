// Usage-quality model for the /adoption page.
//
// The adoption summary answers "is anyone using this" (DAU/MAU, prompt
// counts). This module answers the harder question the Head of AI actually
// cares about: "is the usage any *good*, and is good practice spreading?"
//
// It encodes the four dimensions from the AI-enablement framework:
//   Q1 Outcome quality   — did the interaction achieve the goal, did output survive
//   Q2 Leverage          — how much real work was offloaded (complexity mix, rework)
//   Q3 Trajectory health — is the interaction itself sound (abandon, correction, trust)
//   Q4 Skill diffusion   — are the behaviours of top users spreading, and do they lift scores
//
// All figures are mock telemetry — a placeholder for the transcript-sampling
// + LLM-judge + embedding pipeline described in `pipeline` below. Keeping the
// numbers here (not in the component) mirrors the rest of lib/ and keeps the
// derivations (percentages, lift) unit-testable.

export type QualityBand = "excellent" | "good" | "adequate" | "poor"

// Q1 — a weekly LLM-as-judge sample scored against a fixed rubric, bucketed.
export interface OutcomeQuality {
  sampled: number // transcripts scored this window
  distribution: Record<QualityBand, number> // counts per band, sum ≤ sampled
  survival7d: number // % of committed AI output still present after 7 days
  survival30d: number // …after 30 days
  judgeCalibration: number // agreement % with the human-labelled calibration set
}

// Q2 — value tiers, not message counts. Track the mix shifting upward.
export type ComplexityTier = "lookup" | "drafting" | "reasoning" | "agentic"

export interface Leverage {
  tierMix: Record<ComplexityTier, number> // share of interactions per tier (0..1)
  priorTierMix: Record<ComplexityTier, number> // same, previous window — for the shift arrow
  reworkRate: number // 0..1 — fraction of output the human had to substantially edit
  medianTurnsToResolution: number
}

// Q3 — is the interaction itself sound?
export interface TrajectoryHealth {
  abandonmentRate: number // 0..1 — tasks dropped mid-flight
  correctionDensity: number // avg "no, actually…" turns per session
  overTrustRate: number // 0..1 — accepted outputs judged wrong on independent review
  underUseRate: number // 0..1 — good outputs discarded / ignored
}

// Q4 — mined from transcripts: what the best users do, packaged as skills.
export interface DiffusedSkill {
  id: string
  name: string
  behavior: string // the pattern that correlates with high Q1
  adopters: number // people who have picked it up
  reachable: number // people it's relevant to
  scoreLift: number // avg Q1 delta for adopters vs their own baseline, in points
}

// Top-line ROI + upskilling headline the Head of AI reports upward. Unlike
// raw prompt counts, these are *quality-weighted*: only work that actually
// landed counts, and value is tied to skill diffusion, not seat activation.
export interface RoiHeadline {
  // Raw hours the tool could have saved (interactions × avg minutes),
  // discounted by outcome quality so abandoned / reworked / discarded output
  // doesn't inflate the number. This is the figure that goes to the board.
  qualityHoursSaved: number
  rawHoursSaved: number // before the quality discount — for the "how much we don't count"
  monthlyToolCost: number // fully-loaded seat + usage spend, USD
  hourlyRate: number // blended fully-loaded knowledge-worker cost, USD/hr
  workforceUpskilledRate: number // 0..1 — reachable people who adopted ≥1 mined skill
  priorUpskilledRate: number // same, previous window — for the trend arrow
}

// ── Eva's problem set (AI program lead) ─────────────────────────────────
// The Anthropic admin console gives quantity: seats, tokens, chat/cowork/
// coding counts, project names. It does NOT tell her (1) what's actually
// being built, (2) what it's used for, or (3) how to safely share the good
// stuff. These three structures close those gaps.

// (1) Visibility — what employees are building, and how much of it we can
// actually account for. The "unknown" slice is the whole point: today it's
// AI champions + spreadsheets, so most of what's "living" is invisible.
export interface BuildInventory {
  kind: "Artifacts" | "Projects" | "Skills" | "Connectors"
  built: number // total instances detected across the org
  classified: number // of those, how many we understand the purpose of
}

// License footprint — the denominator behind coverage and wasted-spend.
export interface LicenseFootprint {
  seatsLicensed: number // Claude seats paid for
  employees: number // total headcount (coverage = seats / employees)
  activeSeats: number // seats with real usage this window
}

// (2) What it's used for — the qualitative view the console can't give.
export interface UseCaseShare {
  name: string
  share: number // 0..1 of classified interactions
  productive: boolean // work vs personal — drives wasted-spend
}

// Productive / personal / unknown split of *all* usage. "Unknown" is the
// slice Eva can't classify today, and personal usage is money on tokens for
// non-work — the thing that makes "super user" an ambiguous signal.
export interface UsageSplit {
  productive: number
  personal: number
  unclassified: number
}

// (3) Share & govern — a real skill library to replace the Excel sheets.
// Every entry carries a review status so "can we allow this org-wide?" is a
// state, not a research project; reuseTeams + adoption answer "is anyone
// actually finding and using it once approved?".
export type ReviewStatus = "approved" | "in_review" | "blocked"

export interface LibrarySkill {
  id: string
  name: string
  purpose: string // one line: what it does / where to use it
  sourceTeam: string
  status: ReviewStatus
  adopters: number
  reachable: number
  reuseTeams: number // teams beyond the origin already using it
  note?: string // compliance / review note when not yet approved
}

export interface UsageQuality {
  roi: RoiHeadline
  license: LicenseFootprint
  inventory: BuildInventory[]
  usageSplit: UsageSplit
  useCases: UseCaseShare[]
  library: LibrarySkill[]
  outcome: OutcomeQuality
  leverage: Leverage
  trajectory: TrajectoryHealth
  diffusion: DiffusedSkill[]
}

export const USAGE_QUALITY: UsageQuality = {
  roi: {
    qualityHoursSaved: 2180,
    rawHoursSaved: 2960,
    monthlyToolCost: 42000,
    hourlyRate: 85,
    workforceUpskilledRate: 0.56,
    priorUpskilledRate: 0.41,
  },
  license: {
    seatsLicensed: 428,
    employees: 580,
    activeSeats: 361,
  },
  inventory: [
    { kind: "Artifacts", built: 640, classified: 214 },
    { kind: "Projects", built: 176, classified: 98 },
    { kind: "Skills", built: 84, classified: 61 },
    { kind: "Connectors", built: 37, classified: 29 },
  ],
  usageSplit: {
    productive: 0.68,
    personal: 0.12,
    unclassified: 0.2,
  },
  useCases: [
    { name: "Claims drafting & summarisation", share: 0.26, productive: true },
    { name: "Policy & compliance Q&A", share: 0.19, productive: true },
    { name: "Code & data tooling", share: 0.17, productive: true },
    { name: "Customer correspondence", share: 0.14, productive: true },
    { name: "Underwriting research", share: 0.12, productive: true },
    { name: "Personal / non-work", share: 0.12, productive: false },
  ],
  library: [
    {
      id: "claims-summary",
      name: "Claims file summariser",
      purpose: "Turns a claims folder into a structured 1-page summary",
      sourceTeam: "Claims · Antwerp",
      status: "approved",
      adopters: 96,
      reachable: 140,
      reuseTeams: 4,
    },
    {
      id: "policy-qa",
      name: "Policy wording Q&A",
      purpose: "Answers coverage questions against the policy library",
      sourceTeam: "Underwriting",
      status: "approved",
      adopters: 71,
      reachable: 120,
      reuseTeams: 3,
    },
    {
      id: "broker-reply",
      name: "Broker reply drafter",
      purpose: "Drafts broker correspondence in house tone",
      sourceTeam: "Distribution · Ghent",
      status: "in_review",
      adopters: 12,
      reachable: 90,
      reuseTeams: 1,
      note: "Pending DLP check — pulls from broker CRM export",
    },
    {
      id: "hr-screening",
      name: "CV screening assistant",
      purpose: "Ranks candidates against a role brief",
      sourceTeam: "HR",
      status: "blocked",
      adopters: 3,
      reachable: 20,
      reuseTeams: 0,
      note: "Blocked — automated profiling of candidates (GDPR Art. 22)",
    },
  ],
  outcome: {
    sampled: 420,
    distribution: { excellent: 148, good: 172, adequate: 71, poor: 29 },
    survival7d: 0.81,
    survival30d: 0.68,
    judgeCalibration: 0.92,
  },
  leverage: {
    tierMix: { lookup: 0.22, drafting: 0.38, reasoning: 0.28, agentic: 0.12 },
    priorTierMix: { lookup: 0.34, drafting: 0.4, reasoning: 0.2, agentic: 0.06 },
    reworkRate: 0.24,
    medianTurnsToResolution: 3,
  },
  trajectory: {
    abandonmentRate: 0.11,
    correctionDensity: 0.6,
    overTrustRate: 0.07,
    underUseRate: 0.14,
  },
  diffusion: [
    {
      id: "context-first",
      name: "Context-first prompting",
      behavior: "Pastes the actual file / ticket / data before asking",
      adopters: 210,
      reachable: 480,
      scoreLift: 14,
    },
    {
      id: "decompose",
      name: "Decompose then delegate",
      behavior: "Breaks a big task into steps the model can each nail",
      adopters: 96,
      reachable: 480,
      scoreLift: 11,
    },
    {
      id: "iterate-critique",
      name: "Ask-for-critique loop",
      behavior: "Has the model red-team its own first draft before shipping",
      adopters: 63,
      reachable: 480,
      scoreLift: 9,
    },
  ],
}

// The transcript → scorecard pipeline the framework prescribes. Rendered as a
// reference strip so the numbers above are never mistaken for magic.
export interface PipelineStage {
  stage: string
  detail: string
}

export const QUALITY_PIPELINE: PipelineStage[] = [
  {
    stage: "Inputs",
    detail:
      "Transcripts + outcome signals (git history, send/copy events, ratings). Sample a few hundred conversations a week.",
  },
  {
    stage: "Deterministic",
    detail: "No model needed: survival rate, edit distance, retries, abandonment. Cheap, objective, continuous.",
  },
  {
    stage: "LLM-judge",
    detail: "Rubric scoring (Q1/Q3) and use-case classification into value tiers (Q2). Calibrated to human labels.",
  },
  {
    stage: "Embedding",
    detail: 'Cluster use cases and cluster "what good users do" — the diffusion engine behind the skill library.',
  },
  {
    stage: "Output",
    detail: "A scorecard: quality distribution, complexity-tier mix, skill-adoption lift. Reviewed monthly.",
  },
]

// ─── Derivations (pure, unit-tested) ────────────────────────────────────

/** Share of sampled transcripts scoring "good" or "excellent". */
export function healthyShare(o: OutcomeQuality): number {
  const good = o.distribution.excellent + o.distribution.good
  const total = totalScored(o)
  return total === 0 ? 0 : good / total
}

export function totalScored(o: OutcomeQuality): number {
  return (
    o.distribution.excellent + o.distribution.good + o.distribution.adequate + o.distribution.poor
  )
}

/** Weighted average complexity on a 1..4 scale — higher means more offloaded. */
export function leverageIndex(mix: Record<ComplexityTier, number>): number {
  const weight: Record<ComplexityTier, number> = { lookup: 1, drafting: 2, reasoning: 3, agentic: 4 }
  return (
    mix.lookup * weight.lookup +
    mix.drafting * weight.drafting +
    mix.reasoning * weight.reasoning +
    mix.agentic * weight.agentic
  )
}

/** Change in leverage index vs the prior window (positive = shifting upward). */
export function leverageShift(l: Leverage): number {
  return leverageIndex(l.tierMix) - leverageIndex(l.priorTierMix)
}

export function adoptionRate(s: DiffusedSkill): number {
  return s.reachable === 0 ? 0 : s.adopters / s.reachable
}

/** Dollar value of the quality-weighted hours saved this window. */
export function valueDelivered(r: RoiHeadline): number {
  return r.qualityHoursSaved * r.hourlyRate
}

/** Return on the tool spend: value delivered per dollar spent (× multiple). */
export function roiMultiple(r: RoiHeadline): number {
  return r.monthlyToolCost === 0 ? 0 : valueDelivered(r) / r.monthlyToolCost
}

/**
 * Share of the raw time-savings that gets thrown away because the output was
 * abandoned, reworked, or discarded — the gap quantity-only dashboards miss.
 */
export function qualityLeakage(r: RoiHeadline): number {
  return r.rawHoursSaved === 0 ? 0 : 1 - r.qualityHoursSaved / r.rawHoursSaved
}

/** Seats licensed as a share of headcount (Eva's ~74% coverage). */
export function seatCoverage(l: LicenseFootprint): number {
  return l.employees === 0 ? 0 : l.seatsLicensed / l.employees
}

/**
 * The visibility gap: share of everything employees have built whose purpose
 * we can't yet account for. This is the number Eva feels — "we don't exactly
 * know what's living."
 */
export function visibilityGap(inv: BuildInventory[]): number {
  const built = inv.reduce((a, i) => a + i.built, 0)
  const classified = inv.reduce((a, i) => a + i.classified, 0)
  return built === 0 ? 0 : 1 - classified / built
}

/**
 * Monthly spend attributable to personal (non-work) usage — the "paying a lot
 * for token usage but he's doing personal stuff" concern, made concrete.
 */
export function personalSpend(r: RoiHeadline, s: UsageSplit): number {
  return r.monthlyToolCost * s.personal
}

/** Count of library skills waiting on a security/compliance decision. */
export function reviewQueue(lib: LibrarySkill[]): number {
  return lib.filter((s) => s.status === "in_review").length
}
