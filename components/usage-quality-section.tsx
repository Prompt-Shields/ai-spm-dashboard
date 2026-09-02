// Usage-quality scorecard for the /adoption page.
//
// The whole /adoption page. Replaces the old quantity tiles (DAU/MAU, prompt
// counts) and answers the question the Head of AI actually asks: is the usage
// any good, what's it worth, and is good practice spreading?
//
// Four dimensions, each a card:
//   Q1 Outcome quality   — score distribution + survival rate
//   Q2 Leverage          — complexity-tier mix shifting upward + rework
//   Q3 Trajectory health — abandonment, correction density, trust calibration
//   Q4 Skill diffusion   — mined behaviours packaged as skills, adoption + lift
//
// Then a reference strip showing the transcript→scorecard pipeline so the
// numbers are never mistaken for magic. Static mock data lives in
// lib/usage-quality-data.ts; this file is purely presentational.

"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Gauge,
  Target,
  Layers,
  HeartPulse,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  ArrowRight,
  Banknote,
  GraduationCap,
  Sparkles,
  Boxes,
  Eye,
  Library,
  ShieldCheck,
  Clock3,
  Ban,
  ScanSearch,
  Zap,
  UserCheck,
  Users,
  BookOpen,
  Database,
  Cpu,
  Calculator,
  Network,
  Rocket,
  Lightbulb,
  Store,
} from "lucide-react"
import {
  USAGE_QUALITY,
  QUALITY_PIPELINE,
  healthyShare,
  totalScored,
  leverageShift,
  adoptionRate,
  valueDelivered,
  roiMultiple,
  qualityLeakage,
  seatCoverage,
  visibilityGap,
  personalSpend,
  reviewQueue,
  automatedStageShare,
  type ComplexityTier,
  type QualityBand,
  type ReviewStatus,
} from "@/lib/usage-quality-data"

const pct = (n: number) => `${Math.round(n * 100)}%`
const usd0 = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}k` : `$${Math.round(n)}`

const BAND_META: Record<QualityBand, { label: string; color: string }> = {
  excellent: { label: "Excellent", color: "bg-emerald-500" },
  good: { label: "Good", color: "bg-teal-400" },
  adequate: { label: "Adequate", color: "bg-amber-400" },
  poor: { label: "Poor", color: "bg-red-400" },
}

const TIER_META: Record<ComplexityTier, { label: string; color: string }> = {
  lookup: { label: "Trivial lookup", color: "bg-slate-300" },
  drafting: { label: "Drafting", color: "bg-indigo-300" },
  reasoning: { label: "Multi-step reasoning", color: "bg-indigo-500" },
  agentic: { label: "Agentic / tool-using", color: "bg-violet-600" },
}

const TABS: { value: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { value: "overview", label: "Overview", icon: Gauge },
  { value: "visibility", label: "Visibility", icon: Eye },
  { value: "quality", label: "Quality signals", icon: Target },
  { value: "skills", label: "Skills & governance", icon: Library },
  { value: "guide", label: "How it works", icon: BookOpen },
]

export function UsageQualitySection() {
  return (
    <Tabs defaultValue="overview" className="gap-5">
      {/* Horizontally scrollable on small screens so all five tabs stay reachable. */}
      <div className="overflow-x-auto -mx-1 px-1">
        <TabsList className="bg-slate-100 h-auto p-1 flex-nowrap">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm text-slate-500 gap-1.5 px-3 py-1.5 whitespace-nowrap"
            >
              <Icon size={14} />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="overview" className="space-y-4">
        <TabIntro>
          The headline a Head of AI reports upward — value delivered, return on
          spend, upskilling, and the quality leakage quantity-only dashboards
          hide. Every figure is quality-weighted. Dig into any number in the
          other tabs.
        </TabIntro>
        <RoiBand />
      </TabsContent>

      <TabsContent value="visibility" className="space-y-8">
        <VisibilitySection />
        <UseCaseSection />
      </TabsContent>

      <TabsContent value="quality">
        <QualitySignalsSection />
      </TabsContent>

      <TabsContent value="skills">
        <LibrarySection />
      </TabsContent>

      <TabsContent value="guide">
        <GuideTab />
      </TabsContent>
    </Tabs>
  )
}

function TabIntro({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-500 max-w-3xl">{children}</p>
}

function QualitySignalsSection() {
  return (
    <div className="space-y-4">
      <SectionHeading
        icon={Gauge}
        title="Quality signals behind the number"
        sub="What the quality discount is built from — sampled transcripts scored on a fixed rubric across three dimensions, calibrated to human labels."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <OutcomeCard />
        <LeverageCard />
        <TrajectoryCard />
      </div>
      <PipelineStrip />
    </div>
  )
}

function SectionHeading({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  sub: string
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
        <Icon size={16} className="text-indigo-500" />
        {title}
      </h2>
      <p className="text-xs text-slate-500 mt-0.5 max-w-3xl">{sub}</p>
    </div>
  )
}

// ─── Visibility · what's being built, and how much we can see ────────────
// Eva's #1 pain: "a lot of employees are building things with Claude —
// artifacts, projects, skills — and we don't exactly know."

function VisibilitySection() {
  const inv = USAGE_QUALITY.inventory
  const license = USAGE_QUALITY.license
  const gap = visibilityGap(inv)
  const coverage = seatCoverage(license)
  const built = inv.reduce((a, i) => a + i.built, 0)
  const classified = inv.reduce((a, i) => a + i.classified, 0)

  return (
    <div className="space-y-4">
      <SectionHeading
        icon={Eye}
        title="Visibility — what's actually being built"
        sub="The admin console shows seats and token counts, not what employees create. This accounts for the artifacts, projects and skills living across the org — and flags how much is still unclassified."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-slate-200 lg:col-span-2">
          <CardContent className="py-4 px-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {inv.map((i) => {
                const known = i.built === 0 ? 0 : i.classified / i.built
                return (
                  <div key={i.kind}>
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-500">
                      <Boxes size={11} className="text-slate-400" />
                      {i.kind}
                    </div>
                    <div className="text-2xl font-semibold text-slate-900 tabular-nums mt-0.5">
                      {i.built.toLocaleString()}
                    </div>
                    <Progress value={Math.round(known * 100)} className="h-1 mt-1.5" />
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {i.classified} classified · {i.built - i.classified} unknown
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-100 bg-gradient-to-br from-amber-50/60 to-white">
          <CardContent className="py-4 px-5">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <ScanSearch size={15} className="text-amber-500" />
              Visibility gap
            </div>
            <div className="text-3xl font-bold text-slate-900 tabular-nums mt-1.5">{pct(gap)}</div>
            <div className="text-xs text-slate-500 mt-1">
              of {built.toLocaleString()} built items have no known purpose yet —
              today that lives in AI-champion knowledge and spreadsheets.
            </div>
            <div className="mt-3 border-t border-amber-100 pt-2 grid grid-cols-2 gap-2">
              <MiniStat label="Seat coverage" value={pct(coverage)} hint={`${license.seatsLicensed} of ${license.employees} staff`} />
              <MiniStat
                label="Active seats"
                value={`${Math.round((license.activeSeats / license.seatsLicensed) * 100)}%`}
                hint={`${license.activeSeats} of ${license.seatsLicensed} licensed`}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Use cases · what it's used for, and is it work? ─────────────────────
// Eva: "I have zero view on what it's used for" and "super user… but if he's
// just doing personal stuff, we're paying a lot for that token usage."

function UseCaseSection() {
  const cases = USAGE_QUALITY.useCases
  const split = USAGE_QUALITY.usageSplit
  const wasted = personalSpend(USAGE_QUALITY.roi, split)
  const maxShare = Math.max(...cases.map((c) => c.share))

  return (
    <div className="space-y-4">
      <SectionHeading
        icon={ScanSearch}
        title="What it's actually used for"
        sub="Transcripts classified into use cases and into work-vs-personal, so a 'super user' burning tokens on personal tasks is visible — not mistaken for ROI."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-900">Top use cases</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {cases.map((c) => (
              <div key={c.name} className="space-y-0.5">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-medium truncate ${c.productive ? "text-slate-700" : "text-amber-700"}`}>
                    {c.name}
                  </span>
                  <span className="font-mono text-slate-500 tabular-nums">{pct(c.share)}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={c.productive ? "h-full bg-indigo-500" : "h-full bg-amber-400"}
                    style={{ width: `${(c.share / maxShare) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-900">
              Productive vs personal
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-2.5 rounded-full overflow-hidden flex bg-slate-100">
              <div className="bg-emerald-500" style={{ width: `${split.productive * 100}%` }} title="Productive" />
              <div className="bg-amber-400" style={{ width: `${split.personal * 100}%` }} title="Personal" />
              <div className="bg-slate-300" style={{ width: `${split.unclassified * 100}%` }} title="Unclassified" />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              <Legend color="bg-emerald-500" label={`Productive ${pct(split.productive)}`} />
              <Legend color="bg-amber-400" label={`Personal ${pct(split.personal)}`} />
              <Legend color="bg-slate-300" label={`Unclassified ${pct(split.unclassified)}`} />
            </div>
            <div className="mt-3 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
                <Banknote size={14} />
                ~{usd0(wasted)}/mo on personal usage
              </div>
              <p className="text-[11px] text-amber-600/90 mt-0.5">
                Token spend on non-work tasks — reclaimable seat budget, now that
                it can be told apart from productive use.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Skill library & governance ─────────────────────────────────────────
// Replaces Eva's Excel sheets: a repository where each shareable skill has a
// security/compliance state and cross-team reuse, so "can we allow this
// org-wide, and is anyone finding it?" is answered on one screen.

const STATUS_META: Record<
  ReviewStatus,
  { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; badge: string; dot: string }
> = {
  approved: { label: "Approved", icon: ShieldCheck, badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "text-emerald-500" },
  in_review: { label: "In review", icon: Clock3, badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "text-amber-500" },
  blocked: { label: "Blocked", icon: Ban, badge: "bg-red-50 text-red-700 border-red-200", dot: "text-red-500" },
}

// The automated governance chain — Eva's manual workflow, staged. Discover →
// summarise → reuse-match → compliance review (the human gate) → promote.

function GovernanceChain() {
  const chain = USAGE_QUALITY.governanceChain
  const automated = automatedStageShare(chain)
  return (
    <Card className="border-slate-200 bg-gradient-to-br from-indigo-50/40 to-white">
      <CardHeader className="pb-2 flex-row items-center justify-between gap-2">
        <CardTitle className="text-sm font-semibold text-slate-900">
          Automated governance chain
        </CardTitle>
        <span className="flex items-center gap-1 text-[11px] font-medium text-indigo-600">
          <Zap size={12} />
          {pct(automated)} automated · 1 human gate
        </span>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-2 sm:grid-cols-5">
          {chain.map((stage, i) => (
            <div key={stage.key} className="relative">
              <div
                className={`rounded-lg border p-2.5 h-full ${
                  stage.automated
                    ? "border-indigo-100 bg-white"
                    : "border-amber-200 bg-amber-50/70"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`inline-flex items-center gap-1 text-[9px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded ${
                      stage.automated
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-amber-700 bg-amber-100"
                    }`}
                  >
                    {stage.automated ? <Zap size={9} /> : <UserCheck size={9} />}
                    {stage.automated ? "Auto" : "Human"}
                  </span>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">{stage.count}</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-1.5">{stage.label}</div>
                <p className="text-[10px] text-slate-500 leading-snug mt-0.5">{stage.detail}</p>
              </div>
              {i < chain.length - 1 && (
                <ArrowRight
                  size={12}
                  className="hidden sm:block absolute -right-[7px] top-1/2 -translate-y-1/2 text-slate-300 z-10"
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function LibrarySection() {
  const lib = USAGE_QUALITY.library
  const approved = lib.filter((s) => s.status === "approved").length
  const queue = reviewQueue(lib)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <SectionHeading
          icon={Library}
          title="Skill library & governance"
          sub="The manual chain — dig the analytics, email the creator, canvass teams, chase compliance — run automatically. Every step is automated except the one human gate: security sign-off."
        />
        {/* This tab is the rollup; the marketplace is where the skills actually
            get browsed, submitted and reviewed. Same catalogue either way. */}
        <Link
          href="/marketplace"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <Store size={13} />
          Open marketplace
          <ArrowRight size={12} />
        </Link>
      </div>

      <GovernanceChain />

      <Card className="border-slate-200">
        <CardHeader className="pb-2 flex-row items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold text-slate-900">
            {lib.length} skills in the library
          </CardTitle>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-600">
              <ShieldCheck size={12} />
              {approved} approved
            </span>
            <span className="flex items-center gap-1 text-amber-600">
              <Clock3 size={12} />
              {queue} awaiting review
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0 divide-y divide-slate-100">
          {lib.map((s) => {
            const meta = STATUS_META[s.status]
            const rate = adoptionRate(s)
            const Icon = meta.icon
            return (
              <div key={s.id} className="py-3 first:pt-1 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 sm:gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-800">{s.name}</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${meta.badge}`}>
                      <Icon size={10} />
                      {meta.label}
                    </span>
                    <span className="text-[10px] text-slate-400">{s.sourceTeam}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{s.purpose}</p>
                  {s.suggestedTeams.length > 0 && (
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Users size={10} />
                        suggested for
                      </span>
                      {s.suggestedTeams.map((team) => (
                        <span
                          key={team}
                          className="text-[10px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5"
                        >
                          {team}
                        </span>
                      ))}
                    </div>
                  )}
                  {s.note && (
                    <p className="text-[11px] text-amber-600 leading-snug mt-1 flex items-center gap-1">
                      <Clock3 size={10} className={meta.dot} />
                      {s.note}
                      {s.reviewer && <span className="text-slate-400">· with {s.reviewer}</span>}
                    </p>
                  )}
                </div>
                <div className="sm:text-right sm:w-40 shrink-0">
                  <div className="flex items-center sm:justify-end gap-2">
                    <Progress value={Math.round(rate * 100)} className="h-1.5 w-24" />
                    <span className="text-[10px] font-mono text-slate-500 tabular-nums">{pct(rate)}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {s.adopters}/{s.reachable} adopted · {s.reuseTeams} team{s.reuseTeams === 1 ? "" : "s"} reusing
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
      <DiffusionCard />
    </div>
  )
}

// ─── ROI + upskilling headline ──────────────────────────────────────────
// The four numbers a Head of AI reports upward: quality-weighted value,
// return on spend, workforce upskilled, and the leakage that quantity-only
// dashboards quietly capitalise as "savings".

function RoiBand() {
  const r = USAGE_QUALITY.roi
  const value = valueDelivered(r)
  const roi = roiMultiple(r)
  const leakage = qualityLeakage(r)
  const upskillDelta = r.workforceUpskilledRate - r.priorUpskilledRate

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <RoiStat
        icon={Banknote}
        tone="accent"
        label="Quality-weighted value"
        value={usd0(value)}
        sub={`${r.qualityHoursSaved.toLocaleString()} quality-hrs · this month`}
      />
      <RoiStat
        icon={Sparkles}
        tone="positive"
        label="Return on AI spend"
        value={`${roi.toFixed(1)}×`}
        sub={`${usd0(value)} value on ${usd0(r.monthlyToolCost)} tool cost`}
      />
      <RoiStat
        icon={GraduationCap}
        tone="positive"
        label="Workforce upskilled"
        value={pct(r.workforceUpskilledRate)}
        sub={`${USAGE_QUALITY.library.length} shared skills · adopted ≥1`}
        delta={upskillDelta}
        deltaGood="up"
      />
      <RoiStat
        icon={ArrowDownRight}
        tone="warn"
        label="Quality leakage"
        value={pct(leakage)}
        sub={`${(r.rawHoursSaved - r.qualityHoursSaved).toLocaleString()} hrs of output not counted`}
      />
    </div>
  )
}

function RoiStat({
  icon: Icon,
  tone,
  label,
  value,
  sub,
  delta,
  deltaGood,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  tone: "accent" | "positive" | "warn"
  label: string
  value: string
  sub: string
  delta?: number
  deltaGood?: "up" | "down"
}) {
  const cardTone =
    tone === "positive"
      ? "border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-white"
      : tone === "accent"
        ? "border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-white"
        : "border-amber-100 bg-gradient-to-br from-amber-50/60 to-white"
  const iconTone =
    tone === "positive" ? "text-emerald-500" : tone === "accent" ? "text-indigo-500" : "text-amber-500"

  const pctDelta = delta !== undefined ? delta * 100 : null
  const good =
    pctDelta === null ? false : deltaGood === "up" ? pctDelta > 0 : pctDelta < 0
  const Arrow = pctDelta !== null && pctDelta > 0 ? ArrowUpRight : ArrowDownRight

  return (
    <Card className={cardTone}>
      <CardContent className="py-5 px-6">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Icon size={15} className={iconTone} />
          {label}
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900 tabular-nums">{value}</span>
          {pctDelta !== null && (
            <span
              className={`flex items-center gap-0.5 text-sm font-semibold ${good ? "text-emerald-600" : "text-red-500"}`}
            >
              <Arrow size={14} />
              {Math.abs(pctDelta).toFixed(0)} pts
            </span>
          )}
        </div>
        <div className="mt-1 text-xs text-slate-500">{sub}</div>
      </CardContent>
    </Card>
  )
}

// ─── Q1 · Outcome quality ───────────────────────────────────────────────

function OutcomeCard() {
  const o = USAGE_QUALITY.outcome
  const total = totalScored(o)
  const healthy = healthyShare(o)
  const bands: QualityBand[] = ["excellent", "good", "adequate", "poor"]
  return (
    <DimCard
      code="Q1"
      icon={Target}
      title="Outcome quality"
      question="did the interaction achieve the goal?"
    >
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-900 tabular-nums">{pct(healthy)}</span>
        <span className="text-xs text-slate-500">scored good or better</span>
      </div>
      <div className="mt-3 h-2 rounded-full overflow-hidden flex bg-slate-100">
        {bands.map((b) => (
          <div
            key={b}
            className={BAND_META[b].color}
            style={{ width: `${(o.distribution[b] / total) * 100}%` }}
            title={`${BAND_META[b].label}: ${o.distribution[b]}`}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {bands.map((b) => (
          <Legend key={b} color={BAND_META[b].color} label={`${BAND_META[b].label} ${o.distribution[b]}`} />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
        <MiniStat label="Survival · 7d" value={pct(o.survival7d)} hint="AI output still shipped" />
        <MiniStat label="Survival · 30d" value={pct(o.survival30d)} hint="survives > thumbs-up" />
        <MiniStat label="Judge calibration" value={pct(o.judgeCalibration)} hint="agree w/ humans" />
      </div>
      <Foot>{o.sampled.toLocaleString()} transcripts sampled this window</Foot>
    </DimCard>
  )
}

// ─── Q2 · Leverage ──────────────────────────────────────────────────────

function LeverageCard() {
  const l = USAGE_QUALITY.leverage
  const shift = leverageShift(l)
  const tiers: ComplexityTier[] = ["lookup", "drafting", "reasoning", "agentic"]
  return (
    <DimCard
      code="Q2"
      icon={Layers}
      title="Leverage"
      question="how much work was actually offloaded?"
    >
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-medium text-slate-600">Task-complexity mix</span>
        <Delta value={shift} goodDirection="up" suffix=" tier shift" />
      </div>
      <div className="mt-3 h-2 rounded-full overflow-hidden flex bg-slate-100">
        {tiers.map((t) => (
          <div
            key={t}
            className={TIER_META[t].color}
            style={{ width: `${l.tierMix[t] * 100}%` }}
            title={`${TIER_META[t].label}: ${pct(l.tierMix[t])}`}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {tiers.map((t) => (
          <Legend key={t} color={TIER_META[t].color} label={`${TIER_META[t].label} ${pct(l.tierMix[t])}`} />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
        <MiniStat label="Rework rate" value={pct(l.reworkRate)} hint="output substantially edited" />
        <MiniStat
          label="Turns to resolution"
          value={String(l.medianTurnsToResolution)}
          hint="median · fewer = higher leverage"
        />
      </div>
      <Foot>Distribution shifting upward means more real work offloaded.</Foot>
    </DimCard>
  )
}

// ─── Q3 · Trajectory health ─────────────────────────────────────────────

function TrajectoryCard() {
  const t = USAGE_QUALITY.trajectory
  return (
    <DimCard
      code="Q3"
      icon={HeartPulse}
      title="Trajectory health"
      question="is the interaction itself sound?"
    >
      <div className="grid grid-cols-2 gap-3">
        <Meter label="Abandonment" value={t.abandonmentRate} goodDirection="down" hint="tasks dropped mid-flight" />
        <Meter
          label="Over-trust"
          value={t.overTrustRate}
          goodDirection="down"
          hint="wrong answers accepted"
        />
        <Meter label="Under-use" value={t.underUseRate} goodDirection="down" hint="good output discarded" />
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">Correction density</div>
          <div className="text-2xl font-semibold text-slate-900 tabular-nums mt-0.5">
            {t.correctionDensity.toFixed(1)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">&quot;no, actually…&quot; turns / session</div>
        </div>
      </div>
      <Foot>Trust calibration catches both over-trust and under-use from one sample.</Foot>
    </DimCard>
  )
}

// ─── Q4 · Skill diffusion ───────────────────────────────────────────────

function DiffusionCard() {
  const skills = USAGE_QUALITY.diffusion
  return (
    <DimCard
      code="★"
      icon={Share2}
      title="Behaviours worth packaging"
      question="what top users do that lifts scores — mine these into the library next"
    >
      <div className="space-y-3">
        {skills.map((s) => {
          const rate = adoptionRate(s)
          return (
            <div key={s.id}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-800 truncate">{s.name}</span>
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 shrink-0">
                  <ArrowUpRight size={13} />+{s.scoreLift} pts
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{s.behavior}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <Progress value={Math.round(rate * 100)} className="h-1.5 flex-1" />
                <span className="text-[10px] font-mono text-slate-500 tabular-nums shrink-0">
                  {s.adopters}/{s.reachable} · {pct(rate)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      <Foot>Score lift for adopters is the ROI. Package winners as shared Claude Skills.</Foot>
    </DimCard>
  )
}

// ─── Pipeline reference strip ───────────────────────────────────────────

function PipelineStrip() {
  return (
    <Card className="border-slate-200 bg-slate-50/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-900">
          How it&apos;s built — transcript to scorecard
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-2 sm:grid-cols-5">
          {QUALITY_PIPELINE.map((s, i) => (
            <div key={s.stage} className="relative">
              <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 border-l-2 border-indigo-400 pl-2">
                {s.stage}
              </div>
              <p className="text-[11px] text-slate-500 leading-snug mt-1 pl-2">{s.detail}</p>
              {i < QUALITY_PIPELINE.length - 1 && (
                <ArrowRight
                  size={12}
                  className="hidden sm:block absolute -right-1 top-0 text-slate-300"
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Guide · how we track the quality of AI ROI ─────────────────────────
// A plain-language walkthrough of the method, so the numbers on the other
// tabs are legible to anyone — not just whoever built the pipeline.

const GUIDE_STEPS: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  body: string
  feeds: string
}[] = [
  {
    icon: Database,
    title: "Collect the signals",
    body: "Sample a few hundred transcripts a week (not everything) alongside outcome signals — git history, send/copy events, ratings. Sampling is enough for a trustworthy trend.",
    feeds: "Feeds every tab",
  },
  {
    icon: Calculator,
    title: "Measure what's objective — no model needed",
    body: "Deterministic signals run continuously and cheaply: did the output survive (still shipped after 7/30 days), how much was edited, how many retries, how often a task was abandoned.",
    feeds: "→ Quality signals",
  },
  {
    icon: Cpu,
    title: "Score the rest with an LLM judge",
    body: "A strong grader scores each sampled transcript against a fixed rubric — goal achieved, output correct/safe — and sorts use cases into value tiers. Calibrate it against ~50 human-labelled cases before trusting it.",
    feeds: "→ Quality signals · Visibility",
  },
  {
    icon: Banknote,
    title: "Quality-weight the ROI",
    body: "Raw hours saved × outcome quality = the value that actually landed. Abandoned or reworked output never counts. Usage is split productive vs personal so token spend on non-work is visible, not banked as ROI.",
    feeds: "→ Overview",
  },
  {
    icon: Network,
    title: "Cluster to find what works",
    body: "Embed transcripts and cluster what your best users do differently — context-giving, decomposition, iteration. The behaviour clusters that correlate with high scores are the skills worth teaching.",
    feeds: "→ Skills & governance",
  },
  {
    icon: Rocket,
    title: "Govern, then diffuse",
    body: "Package winners into the skill library, run them through the automated governance chain (one human compliance gate), promote to the teams that would benefit, and track whether adopters' scores rise.",
    feeds: "→ Skills & governance",
  },
]

const GUIDE_PRINCIPLES: { title: string; body: string }[] = [
  { title: "Sample, don't census", body: "Hundreds a week is enough for trend signal — you don't need to score everything." },
  { title: "Calibrate the judge", body: "Check the grader against human labels before any number it produces is trusted." },
  { title: "Govern the data", body: "Score de-identified transcripts; PII handling needs a plan before this runs." },
]

function GuideTab() {
  return (
    <div className="space-y-5">
      <SectionHeading
        icon={BookOpen}
        title="How we track the quality of AI ROI"
        sub="Six steps turn raw transcripts into a quality-weighted scorecard. Adoption tells you usage happened; this tells you whether it was any good — and pays back."
      />

      <Card className="border-slate-200">
        <CardContent className="py-5 px-5 sm:px-6">
          <ol className="relative">
            {GUIDE_STEPS.map((s, i) => {
              const Icon = s.icon
              const last = i === GUIDE_STEPS.length - 1
              return (
                <li key={s.title} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* connector line */}
                  {!last && (
                    <span className="absolute left-[19px] top-10 bottom-0 w-px bg-slate-200" aria-hidden />
                  )}
                  <div className="relative shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 grid place-items-center text-indigo-600">
                      <Icon size={17} />
                    </div>
                    <span className="absolute -top-1 -left-1 h-4 w-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold grid place-items-center">
                      {i + 1}
                    </span>
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-slate-900">{s.title}</h4>
                      <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5">
                        {s.feeds}
                      </span>
                    </div>
                    <p className="text-[13px] text-slate-500 leading-relaxed mt-1 max-w-2xl">{s.body}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </CardContent>
      </Card>

      <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Lightbulb size={15} className="text-indigo-500" />
            Three rules that keep it honest
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 grid gap-3 sm:grid-cols-3">
          {GUIDE_PRINCIPLES.map((p) => (
            <div key={p.title} className="rounded-lg bg-white/70 border border-indigo-100/70 p-3">
              <div className="text-xs font-semibold text-slate-800">{p.title}</div>
              <p className="text-[11px] text-slate-500 leading-snug mt-1">{p.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Shared subcomponents ───────────────────────────────────────────────

function DimCard({
  code,
  icon: Icon,
  title,
  question,
  children,
}: {
  code: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  question: string
  children: React.ReactNode
}) {
  return (
    <Card className="border-slate-200">
      <CardContent className="py-4 px-5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 grid place-items-center text-xs font-mono font-semibold text-indigo-600">
            {code}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <Icon size={14} className="text-indigo-400" />
              {title}
            </h3>
            <p className="text-[11px] text-slate-500 leading-snug">{question}</p>
          </div>
        </div>
        <div className="mt-3">{children}</div>
      </CardContent>
    </Card>
  )
}

function MiniStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-lg font-semibold text-slate-900 tabular-nums leading-tight">{value}</div>
      {hint && <div className="text-[10px] text-slate-400 leading-tight">{hint}</div>}
    </div>
  )
}

function Meter({
  label,
  value,
  goodDirection,
  hint,
}: {
  label: string
  value: number
  goodDirection: "up" | "down"
  hint?: string
}) {
  // Lower is better for these risk-flavoured rates: green when small.
  const good = goodDirection === "down" ? value <= 0.15 : value >= 0.5
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div
        className={`text-2xl font-semibold tabular-nums mt-0.5 ${good ? "text-emerald-600" : "text-amber-600"}`}
      >
        {pct(value)}
      </div>
      {hint && <div className="text-[10px] text-slate-400 leading-tight">{hint}</div>}
    </div>
  )
}

function Delta({
  value,
  goodDirection,
  suffix,
}: {
  value: number
  goodDirection: "up" | "down"
  suffix?: string
}) {
  const isUp = value > 0
  const isGood = goodDirection === "up" ? value > 0 : value < 0
  const color = value === 0 ? "text-slate-400" : isGood ? "text-emerald-600" : "text-red-500"
  const Arrow = isUp ? ArrowUpRight : ArrowDownRight
  return (
    <span className={`flex items-center gap-0.5 text-xs font-semibold ${color}`}>
      <Arrow size={13} />
      {value > 0 ? "+" : ""}
      {value.toFixed(2)}
      {suffix && <span className="font-normal text-slate-400 ml-0.5">{suffix}</span>}
    </span>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1 text-[10px] text-slate-500">
      <span className={`inline-block w-2 h-2 rounded-sm ${color}`} />
      {label}
    </span>
  )
}

function Foot({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 flex items-start gap-1.5 border-t border-slate-100 pt-2 text-[10px] text-slate-400">
      <CheckCircle2 size={11} className="text-slate-300 mt-px shrink-0" />
      <span>{children}</span>
    </div>
  )
}
