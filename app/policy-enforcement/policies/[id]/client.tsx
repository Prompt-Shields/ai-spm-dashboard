"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PolicyModeToggle } from "@/components/policy/mode-toggle"
import { PromotionWizard } from "@/components/policy/promotion-wizard"
import {
  policyClassIcon,
  requiredApproversFor
} from "@/lib/policy-engine/promotion"
import {
  POLICY_CATEGORIES_META
} from "@/lib/policy-templates/templates"
import { classOf } from "@/lib/policy-templates/types"
import type {
  PolicyInstance,
  PolicyTemplate,
  ApprovalRecord,
  RolloutStrategy
} from "@/lib/policy-templates/types"

interface Props {
  initialInstance: PolicyInstance
  template: PolicyTemplate
  applications: Array<{ id: string; name: string }>
}

export function PolicyDetailClient({ initialInstance, template, applications }: Props) {
  const router = useRouter()
  const [instance, setInstance] = useState(initialInstance)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [tab, setTab] = useState<
    "detection" | "scope" | "test" | "approvals" | "history"
  >("detection")
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const cls = classOf(instance.enforcementMode)
  const categoryMeta = POLICY_CATEGORIES_META[template.category]
  const lastEvent = instance.promotionHistory.at(-1)
  const pendingApprovers =
    lastEvent?.to === "strict" && lastEvent.approvers
      ? lastEvent.approvers.filter((a) => a.status === "pending")
      : []

  // ─── API actions ─────────────────────────────────────────────────

  const submitPromotion = async (params: {
    approvers: ApprovalRecord[]
    rolloutStrategy: RolloutStrategy
    rolloutCanaryAppId?: string
    rolloutPercentage?: number
    autoRevertOnHighFp: boolean
    autoRevertThreshold: number
  }) => {
    setError(null)
    const res = await fetch(`/api/policies/${instance.id}/promote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        approverRoles: params.approvers.map((a) => a.role),
        rolloutStrategy: params.rolloutStrategy,
        rolloutCanaryAppId: params.rolloutCanaryAppId,
        rolloutPercentage: params.rolloutPercentage,
        autoRevertOnHighFp: params.autoRevertOnHighFp,
        autoRevertThreshold: params.autoRevertThreshold,
        requestedBy: "admin@demo.local"
      })
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? "Promotion request failed")
      return
    }
    setInstance(data.instance)
    setWizardOpen(false)
    setToast("Promotion request submitted — awaiting approvals")
  }

  const submitApproval = (role: string, decision: "approved" | "rejected") => {
    startTransition(async () => {
      setError(null)
      const res = await fetch(`/api/policies/${instance.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          approverId: `${role.toLowerCase().replace(/\s/g, "-")}@demo.local`,
          decision,
          notes: decision === "approved" ? "Approved via dashboard" : undefined
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Approval failed")
        return
      }
      setInstance(data.instance)
      if (data.promoted) {
        setToast(`✓ Promoted to Strict — all approvals collected`)
      } else if (data.rejected) {
        setToast(`Rejected — policy stays in Guideline`)
      } else {
        setToast(
          `Recorded. ${data.remainingApprovers.length} approval(s) still pending.`
        )
      }
    })
  }

  const submitDemote = () => {
    startTransition(async () => {
      setError(null)
      const res = await fetch(`/api/policies/${instance.id}/demote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          by: "admin@demo.local",
          reason: "Manual demote from dashboard"
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Demotion failed")
        return
      }
      setInstance(data.instance)
      setToast("Demoted to Guideline")
    })
  }

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Title + meta */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{policyClassIcon(cls)}</span>
            <Badge variant="outline" className="text-[10px]">
              {categoryMeta.label}
            </Badge>
            {template.owaspReference && (
              <Badge variant="outline" className="font-mono text-[10px]">
                {template.owaspReference}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              from {template.name} v{template.version}
            </span>
          </div>
          <h1 className="text-2xl font-semibold">{instance.name}</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            {template.description}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      {toast && (
        <div className="rounded-md border bg-blue-50 dark:bg-blue-950/30 px-4 py-2 text-sm">
          {toast}
        </div>
      )}

      {/* Watchdog banner (only when relevant) */}
      <WatchdogBanner instance={instance} />

      {/* Mode toggle (always visible) */}
      <PolicyModeToggle
        instance={instance}
        template={template}
        onPromoteClick={() => setWizardOpen(true)}
        onDemote={submitDemote}
      />

      {/* Pending approvals card (only when relevant) */}
      {pendingApprovers.length > 0 && (
        <PendingApprovalsCard
          instance={instance}
          onApprove={submitApproval}
          disabled={pending}
        />
      )}

      {/* Tabs */}
      <div className="border-b flex gap-4 text-sm">
        {(["detection", "scope", "test", "approvals", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-3 py-2 -mb-px border-b-2 transition-colors capitalize",
              tab === t
                ? "border-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "detection" && <DetectionTab template={template} instance={instance} />}
      {tab === "scope" && <ScopeTab instance={instance} applications={applications} />}
      {tab === "test" && <TestConsoleTab instance={instance} template={template} />}
      {tab === "approvals" && (
        <ApprovalsTab
          instance={instance}
          template={template}
          onApprove={submitApproval}
          disabled={pending}
        />
      )}
      {tab === "history" && <HistoryTab instance={instance} />}

      {/* Wizard modal */}
      {wizardOpen && (
        <PromotionWizard
          instance={instance}
          template={template}
          applications={applications}
          onConfirm={submitPromotion}
          onCancel={() => setWizardOpen(false)}
        />
      )}
    </div>
  )
}

// ─── Sub-views ───────────────────────────────────────────────────────

function PendingApprovalsCard({
  instance,
  onApprove,
  disabled
}: {
  instance: PolicyInstance
  onApprove: (role: string, decision: "approved" | "rejected") => void
  disabled: boolean
}) {
  const lastEvent = instance.promotionHistory.at(-1)
  const approvers = lastEvent?.approvers ?? []
  return (
    <Card className="p-4 border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/10">
      <div className="text-xs uppercase tracking-wider text-amber-900 dark:text-amber-200 font-semibold mb-2">
        Promotion in progress — awaiting approvals
      </div>
      <div className="space-y-2">
        {approvers.map((a) => (
          <div
            key={a.role}
            className="flex items-center justify-between p-2 rounded bg-background/60"
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "size-5 inline-flex items-center justify-center rounded-full text-xs",
                  a.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : a.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {a.status === "approved" ? "✓" : a.status === "rejected" ? "✗" : "○"}
              </span>
              <span className="text-sm font-medium">{a.role}</span>
              {a.at && (
                <span className="text-xs text-muted-foreground">
                  {new Date(a.at).toLocaleString()}
                </span>
              )}
            </div>
            {a.status === "pending" && (
              <div className="flex gap-1">
                <button
                  disabled={disabled}
                  onClick={() => onApprove(a.role, "rejected")}
                  className="text-xs px-2 py-1 rounded border border-input hover:bg-accent disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  disabled={disabled}
                  onClick={() => onApprove(a.role, "approved")}
                  className="text-xs px-2 py-1 rounded font-medium bg-foreground text-background hover:opacity-90 disabled:opacity-50"
                >
                  Approve as {a.role}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 text-[10px] text-muted-foreground">
        Demo mode: any visitor can approve. In production, only signed-in users
        with the listed role can sign off.
      </div>
    </Card>
  )
}

function DetectionTab({
  template,
  instance
}: {
  template: PolicyTemplate
  instance: PolicyInstance
}) {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
          Rationale
        </div>
        <p className="text-sm">{template.rationale}</p>
        <div className="mt-3 text-xs">
          <div className="text-muted-foreground">Example violation:</div>
          <code className="block bg-muted/40 rounded p-2 mt-1 text-[11px] whitespace-pre-wrap">
            {template.exampleViolation}
          </code>
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
          Detectors ({template.detectors.length})
        </div>
        <div className="space-y-2">
          {template.detectors.map((d) => (
            <div key={d.id} className="text-sm border rounded p-2 flex justify-between gap-3">
              <div className="flex-1">
                <div className="font-medium">{d.id}</div>
                <div className="text-xs text-muted-foreground">{d.description}</div>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] self-start">
                {d.type}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
          Tunable parameters
        </div>
        <div className="space-y-2">
          {template.tunableParameters.map((p) => (
            <div key={p.key} className="text-sm border rounded p-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium">{p.label}</span>
                <Badge variant="outline" className="text-[9px] uppercase">
                  {p.level}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{p.helpText}</div>
              <div className="text-[11px] mt-1 font-mono text-muted-foreground">
                Current: {JSON.stringify(instance.parameterValues[p.key])}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function ScopeTab({
  instance,
  applications
}: {
  instance: PolicyInstance
  applications: Array<{ id: string; name: string }>
}) {
  const assignedIds = new Set(instance.appliesTo.applicationIds)
  const assigned = applications.filter((a) => assignedIds.has(a.id))
  const unassigned = applications.filter((a) => !assignedIds.has(a.id))

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
          Applies to
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <ScopeChip label="Data classifications" values={instance.appliesTo.dataClassifications} />
          <ScopeChip label="Risk tiers" values={instance.appliesTo.riskTiers} />
          <ScopeChip label="Departments" values={instance.appliesTo.departments} />
          <ScopeChip
            label="Specific apps"
            values={[`${assigned.length} of ${applications.length}`]}
          />
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
          Assigned applications ({assigned.length})
        </div>
        {assigned.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No specific applications assigned. Currently scoped by classification/tier filters above.
          </p>
        ) : (
          <ul className="text-sm space-y-1">
            {assigned.map((a) => (
              <li key={a.id} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-foreground" />
                {a.name}
                <span className="text-xs text-muted-foreground font-mono">{a.id}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {unassigned.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            {unassigned.length} unassigned application(s) — view all
          </summary>
          <ul className="mt-2 ml-4 space-y-0.5 text-xs text-muted-foreground">
            {unassigned.map((a) => (
              <li key={a.id}>{a.name}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}

function ScopeChip({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="rounded border p-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm mt-0.5">
        {values.length === 0 ? (
          <span className="text-muted-foreground italic">none</span>
        ) : (
          values.join(", ")
        )}
      </div>
    </div>
  )
}

function ApprovalsTab({
  instance,
  template,
  onApprove,
  disabled
}: {
  instance: PolicyInstance
  template: PolicyTemplate
  onApprove: (role: string, decision: "approved" | "rejected") => void
  disabled: boolean
}) {
  const required = requiredApproversFor(template)
  const lastEvent = instance.promotionHistory.at(-1)
  const lastApprovers = lastEvent?.approvers ?? []

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
          Required approvers for promotion
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Promoting this policy from Guideline to Strict requires sign-off from these roles
          (set by template category: <span className="font-medium">{template.category}</span>).
        </p>
        <ul className="space-y-1.5">
          {required.map((role) => {
            const record = lastApprovers.find((a) => a.role === role)
            return (
              <li
                key={role}
                className="flex items-center justify-between p-2 border rounded text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-5 inline-flex items-center justify-center rounded-full text-xs",
                      record?.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : record?.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {record?.status === "approved"
                      ? "✓"
                      : record?.status === "rejected"
                        ? "✗"
                        : "○"}
                  </span>
                  <span className="font-medium">{role}</span>
                </div>
                <div className="flex items-center gap-2">
                  {record?.at && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(record.at).toLocaleString()}
                    </span>
                  )}
                  <Badge
                    variant={
                      record?.status === "approved"
                        ? "success"
                        : record?.status === "rejected"
                          ? "destructive"
                          : "outline"
                    }
                    className="text-[10px] capitalize"
                  >
                    {record?.status ?? "no decision"}
                  </Badge>
                  {record?.status === "pending" && (
                    <button
                      disabled={disabled}
                      onClick={() => onApprove(role, "approved")}
                      className="text-xs px-2 py-1 rounded font-medium bg-foreground text-background hover:opacity-90 disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}

function HistoryTab({ instance }: { instance: PolicyInstance }) {
  return (
    <Card className="p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
        Promotion history
      </div>
      {instance.promotionHistory.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No mode changes yet. This policy has been in Guideline mode since creation.
        </p>
      ) : (
        <ol className="relative ml-4 border-l space-y-4">
          {[...instance.promotionHistory].reverse().map((event, i) => (
            <li key={i} className="ml-4">
              <span
                className={cn(
                  "absolute -left-1.5 mt-1 size-3 rounded-full border-2 border-background",
                  event.to === "strict" ? "bg-foreground" : "bg-amber-500"
                )}
              />
              <div className="text-sm font-medium">
                {event.from} → {event.to}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(event.at).toLocaleString()} by {event.by}
              </div>
              {event.reason && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {event.reason}
                </div>
              )}
              {event.approvers && event.approvers.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {event.approvers.map((a) => (
                    <Badge
                      key={a.role}
                      variant={
                        a.status === "approved"
                          ? "success"
                          : a.status === "rejected"
                            ? "destructive"
                            : "outline"
                      }
                      className="text-[10px]"
                    >
                      {a.role}: {a.status}
                    </Badge>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}

// ─── Test Console Tab ────────────────────────────────────────────────

interface PolicyTestResultUI {
  matched: boolean
  triggeredDetectors: Array<{
    detectorId: string
    confidence: number
    matchedSubstring?: string
    explanation: string
  }>
  actionThatWouldFire: string
  evaluationTimeMs: number
}

function TestConsoleTab({
  instance,
  template
}: {
  instance: PolicyInstance
  template: PolicyTemplate
}) {
  const [prompt, setPrompt] = useState("")
  const [result, setResult] = useState<PolicyTestResultUI | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const samplePrompts = [
    template.exampleViolation,
    template.exampleSafeInput
  ].filter((s): s is string => Boolean(s))

  const runTest = async () => {
    setErr(null)
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`/api/policies/${instance.id}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      })
      const data = await res.json()
      if (!res.ok) {
        setErr(data.error ?? "Test failed")
        return
      }
      setResult(data.result)
    } catch (e) {
      setErr(String(e))
    } finally {
      setLoading(false)
    }
  }

  const cls = classOf(instance.enforcementMode)

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Test console
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dry-run evaluation. No state changes, no violations recorded.
              Returns what the detectors would say against this policy&apos;s
              current parameter values.
            </p>
          </div>
          <Badge variant="outline" className="text-[10px]">
            Mode: <span className="font-mono ml-1">{instance.enforcementMode}</span>
          </Badge>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          placeholder="Paste a prompt or model response to test against this policy..."
          className="w-full px-3 py-2 rounded-md border bg-background text-sm font-mono resize-y"
        />

        {samplePrompts.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-[10px] text-muted-foreground self-center">
              Try a sample:
            </span>
            {samplePrompts.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(s)}
                className="text-[11px] px-2 py-0.5 rounded border hover:bg-accent text-left max-w-md truncate"
                title={s}
              >
                {i === 0 ? "🚨 violation" : "✓ safe"} —{" "}
                <span className="font-mono">{s.slice(0, 60)}…</span>
              </button>
            ))}
          </div>
        )}

        {err && (
          <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {err}
          </div>
        )}

        <div className="mt-3 flex justify-end">
          <button
            onClick={runTest}
            disabled={loading || prompt.trim().length === 0}
            className="px-4 py-1.5 rounded-md text-sm font-medium bg-foreground text-background hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Evaluating…" : "Run test →"}
          </button>
        </div>
      </Card>

      {result && (
        <Card
          className={cn(
            "p-4 border-2",
            result.matched
              ? "border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20"
              : "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20"
          )}
        >
          <div className="flex items-baseline justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{result.matched ? "🚨" : "✓"}</span>
              <div>
                <div className="text-sm font-semibold">
                  {result.matched
                    ? "Policy would fire"
                    : "Clean — no detectors matched"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Evaluated in {result.evaluationTimeMs}ms ·{" "}
                  {result.triggeredDetectors.length} detector
                  {result.triggeredDetectors.length === 1 ? "" : "s"} hit
                </div>
              </div>
            </div>
            {result.matched && (
              <Badge variant="warning" className="text-[10px] capitalize">
                Action: {result.actionThatWouldFire}
              </Badge>
            )}
          </div>

          {result.matched && cls === "guideline" && (
            <div className="mb-3 rounded p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs">
              In Guideline mode this would only be{" "}
              <span className="font-mono">logged</span>. After promotion to
              Strict the action becomes{" "}
              <span className="font-mono">
                {template.defaults.enforcementMode}
              </span>
              .
            </div>
          )}

          {result.triggeredDetectors.length > 0 && (
            <div className="space-y-2">
              {result.triggeredDetectors.map((d) => (
                <div
                  key={d.detectorId}
                  className="rounded p-2.5 border bg-background/60"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium font-mono">
                      {d.detectorId}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      conf {d.confidence.toFixed(2)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {d.explanation}
                  </div>
                  {d.matchedSubstring && (
                    <code className="block text-[11px] mt-1.5 bg-muted/40 rounded px-2 py-1">
                      Match: {d.matchedSubstring}
                    </code>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

// ─── Watchdog Banner ─────────────────────────────────────────────────
//
// Live banner that surfaces auto-demote risk. Polls the read-only
// watchdog snapshot every 15s. Shows nothing in the happy path
// (Strict + low FP, or Guideline mode entirely).

interface WatchdogResult {
  instanceId: string
  name: string
  action: "ok" | "grace_started" | "still_grace" | "auto_demoted" | "recovered"
  fpRate: number
  threshold: number
  graceUntil?: string
  reason?: string
}

function WatchdogBanner({ instance }: { instance: PolicyInstance }) {
  const cls = classOf(instance.enforcementMode)
  const [data, setData] = useState<WatchdogResult | null>(null)

  useEffect(() => {
    if (cls !== "strict") {
      setData(null)
      return
    }
    let cancelled = false

    const fetchSnapshot = async () => {
      try {
        const res = await fetch("/api/policies/watchdog/tick", { method: "GET" })
        if (!res.ok) return
        const body = await res.json()
        if (cancelled) return
        const mine = (body.results as WatchdogResult[]).find(
          (r) => r.instanceId === instance.id
        )
        setData(mine ?? null)
      } catch {
        // ignore — banner just won't update
      }
    }

    fetchSnapshot()
    const t = setInterval(fetchSnapshot, 15_000)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [instance.id, cls])

  if (!data || data.action === "ok") return null

  const tone =
    data.action === "auto_demoted"
      ? "destructive"
      : data.action === "still_grace" || data.action === "grace_started"
        ? "warning"
        : "info"

  return (
    <Card
      className={cn(
        "p-4 border-2",
        tone === "destructive" &&
          "border-destructive bg-destructive/10",
        tone === "warning" &&
          "border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20",
        tone === "info" &&
          "border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/10"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-lg">
            {data.action === "auto_demoted"
              ? "🚨"
              : data.action === "still_grace" || data.action === "grace_started"
                ? "⚠️"
                : "✓"}
          </span>
          <div>
            <div className="text-sm font-semibold">
              {data.action === "auto_demoted" &&
                "Auto-demoted by watchdog"}
              {data.action === "grace_started" && "Watchdog grace period started"}
              {data.action === "still_grace" && "Watchdog grace period active"}
              {data.action === "recovered" && "Recovered — back below threshold"}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              FP rate{" "}
              <span className="font-mono font-medium text-foreground">
                {data.fpRate.toFixed(2)}%
              </span>{" "}
              vs threshold{" "}
              <span className="font-mono">{data.threshold}%</span>
              {data.graceUntil && data.action !== "auto_demoted" && (
                <>
                  {" "}
                  · auto-demote at{" "}
                  <CountdownClock until={data.graceUntil} />
                </>
              )}
            </div>
            {data.reason && (
              <div className="text-xs text-muted-foreground mt-0.5 italic">
                {data.reason}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={async () => {
            await fetch("/api/policies/watchdog/tick", { method: "POST" })
            // Reload to pick up any state change
            window.location.reload()
          }}
          className="text-xs px-3 py-1 rounded border border-input hover:bg-accent shrink-0"
        >
          Run watchdog now
        </button>
      </div>
    </Card>
  )
}

function CountdownClock({ until }: { until: string }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const target = new Date(until).getTime()
  const remainingMs = Math.max(0, target - now)
  const seconds = Math.floor(remainingMs / 1000)
  const m = Math.floor(seconds / 60)
  const s = seconds % 60

  if (remainingMs === 0) {
    return <span className="font-mono text-destructive">imminent</span>
  }
  return (
    <span className="font-mono">
      T-{m}:{s.toString().padStart(2, "0")}
    </span>
  )
}
