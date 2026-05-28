"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useT } from "@/lib/i18n/provider"
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
  const t = useT()
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
      setError(data.error ?? t('policyEnforcement.policyDetailClient.errors.promotionFailed'))
      return
    }
    setInstance(data.instance)
    setWizardOpen(false)
    setToast(t('policyEnforcement.policyDetailClient.toasts.promotionSubmitted'))
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
        setError(data.error ?? t('policyEnforcement.policyDetailClient.errors.approvalFailed'))
        return
      }
      setInstance(data.instance)
      if (data.promoted) {
        setToast(t('policyEnforcement.policyDetailClient.toasts.promotedAllCollected'))
      } else if (data.rejected) {
        setToast(t('policyEnforcement.policyDetailClient.toasts.rejectedStaysGuideline'))
      } else {
        setToast(
          t('policyEnforcement.policyDetailClient.toasts.recordedRemaining', {
            count: data.remainingApprovers.length,
          })
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
        setError(data.error ?? t('policyEnforcement.policyDetailClient.errors.demotionFailed'))
        return
      }
      setInstance(data.instance)
      setToast(t('policyEnforcement.policyDetailClient.toasts.demotedToGuideline'))
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
              {t('policyEnforcement.shared.fromTemplate', {
                name: template.name,
                version: template.version,
              })}
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
        {(["detection", "scope", "test", "approvals", "history"] as const).map((id) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "px-3 py-2 -mb-px border-b-2 transition-colors capitalize",
              tab === id
                ? "border-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t(`policyEnforcement.policyDetailClient.tabs.${id}`)}
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
  const t = useT()
  const lastEvent = instance.promotionHistory.at(-1)
  const approvers = lastEvent?.approvers ?? []
  return (
    <Card className="p-4 border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/10">
      <div className="text-xs uppercase tracking-wider text-amber-900 dark:text-amber-200 font-semibold mb-2">
        {t('policyEnforcement.policyDetailClient.pendingApprovals.heading')}
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
                  {t('policyEnforcement.shared.actions.reject')}
                </button>
                <button
                  disabled={disabled}
                  onClick={() => onApprove(a.role, "approved")}
                  className="text-xs px-2 py-1 rounded font-medium bg-foreground text-background hover:opacity-90 disabled:opacity-50"
                >
                  {t('policyEnforcement.shared.actions.approveAs', { role: a.role })}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 text-[10px] text-muted-foreground">
        {t('policyEnforcement.policyDetailClient.pendingApprovals.demoNote')}
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
  const t = useT()
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
          {t('policyEnforcement.policyDetailClient.detection.rationale')}
        </div>
        <p className="text-sm">{template.rationale}</p>
        <div className="mt-3 text-xs">
          <div className="text-muted-foreground">
            {t('policyEnforcement.policyDetailClient.detection.exampleViolation')}
          </div>
          <code className="block bg-muted/40 rounded p-2 mt-1 text-[11px] whitespace-pre-wrap">
            {template.exampleViolation}
          </code>
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
          {t('policyEnforcement.policyDetailClient.detection.detectorsCount', {
            count: template.detectors.length,
          })}
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
          {t('policyEnforcement.policyDetailClient.detection.tunableParameters')}
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
                {t('policyEnforcement.policyDetailClient.detection.currentPrefix')}{' '}
                {JSON.stringify(instance.parameterValues[p.key])}
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
  const t = useT()
  const assignedIds = new Set(instance.appliesTo.applicationIds)
  const assigned = applications.filter((a) => assignedIds.has(a.id))
  const unassigned = applications.filter((a) => !assignedIds.has(a.id))

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
          {t('policyEnforcement.policyDetailClient.scope.appliesTo')}
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <ScopeChip
            label={t('policyEnforcement.policyDetailClient.scope.dataClassifications')}
            values={instance.appliesTo.dataClassifications}
          />
          <ScopeChip
            label={t('policyEnforcement.policyDetailClient.scope.riskTiers')}
            values={instance.appliesTo.riskTiers}
          />
          <ScopeChip
            label={t('policyEnforcement.policyDetailClient.scope.departments')}
            values={instance.appliesTo.departments}
          />
          <ScopeChip
            label={t('policyEnforcement.policyDetailClient.scope.specificApps')}
            values={[
              t('policyEnforcement.policyDetailClient.scope.assignedCountOfTotal', {
                assigned: assigned.length,
                total: applications.length,
              }),
            ]}
          />
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
          {t('policyEnforcement.policyDetailClient.scope.assignedApplications', {
            count: assigned.length,
          })}
        </div>
        {assigned.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('policyEnforcement.policyDetailClient.scope.emptyAssigned')}
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
            {t('policyEnforcement.policyDetailClient.scope.unassignedDetails', {
              count: unassigned.length,
            })}
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
  const t = useT()
  return (
    <div className="rounded border p-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm mt-0.5">
        {values.length === 0 ? (
          <span className="text-muted-foreground italic">
            {t('policyEnforcement.policyDetailClient.scope.none')}
          </span>
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
  const t = useT()
  const required = requiredApproversFor(template)
  const lastEvent = instance.promotionHistory.at(-1)
  const lastApprovers = lastEvent?.approvers ?? []

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
          {t('policyEnforcement.policyDetailClient.approvals.requiredHeading')}
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          {t('policyEnforcement.policyDetailClient.approvals.requiredBody', {
            category: template.category,
          })}
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
                    {record?.status
                      ? t(`policyEnforcement.shared.status.${record.status}`)
                      : t('policyEnforcement.shared.status.noDecision')}
                  </Badge>
                  {record?.status === "pending" && (
                    <button
                      disabled={disabled}
                      onClick={() => onApprove(role, "approved")}
                      className="text-xs px-2 py-1 rounded font-medium bg-foreground text-background hover:opacity-90 disabled:opacity-50"
                    >
                      {t('policyEnforcement.shared.actions.approve')}
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
  const t = useT()
  return (
    <Card className="p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
        {t('policyEnforcement.policyDetailClient.history.heading')}
      </div>
      {instance.promotionHistory.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t('policyEnforcement.policyDetailClient.history.empty')}
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
                {t('policyEnforcement.policyDetailClient.history.transition', {
                  from: event.from,
                  to: event.to,
                })}
              </div>
              <div className="text-xs text-muted-foreground">
                {t('policyEnforcement.policyDetailClient.history.byUser', {
                  time: new Date(event.at).toLocaleString(),
                  user: event.by,
                })}
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
                      {a.role}: {t(`policyEnforcement.shared.status.${a.status}`)}
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
  const t = useT()
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
        setErr(data.error ?? t('policyEnforcement.policyDetailClient.errors.testFailed'))
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
              {t('policyEnforcement.policyDetailClient.test.heading')}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('policyEnforcement.policyDetailClient.test.description')}
            </p>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {t('policyEnforcement.policyDetailClient.test.modeLabel')}{' '}
            <span className="font-mono ml-1">{instance.enforcementMode}</span>
          </Badge>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          placeholder={t('policyEnforcement.policyDetailClient.test.promptPlaceholder')}
          className="w-full px-3 py-2 rounded-md border bg-background text-sm font-mono resize-y"
        />

        {samplePrompts.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-[10px] text-muted-foreground self-center">
              {t('policyEnforcement.policyDetailClient.test.trySample')}
            </span>
            {samplePrompts.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(s)}
                className="text-[11px] px-2 py-0.5 rounded border hover:bg-accent text-left max-w-md truncate"
                title={s}
              >
                {i === 0
                  ? t('policyEnforcement.policyDetailClient.test.sampleViolation')
                  : t('policyEnforcement.policyDetailClient.test.sampleSafe')}
                {t('policyEnforcement.policyDetailClient.test.sampleSeparator')}
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
            {loading
              ? t('policyEnforcement.policyDetailClient.test.evaluating')
              : t('policyEnforcement.policyDetailClient.test.runTest')}
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
                    ? t('policyEnforcement.policyDetailClient.test.wouldFire')
                    : t('policyEnforcement.policyDetailClient.test.cleanNoMatch')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {result.triggeredDetectors.length === 1
                    ? t('policyEnforcement.policyDetailClient.test.evaluatedInOne', {
                        ms: result.evaluationTimeMs,
                        count: result.triggeredDetectors.length,
                      })
                    : t('policyEnforcement.policyDetailClient.test.evaluatedInMany', {
                        ms: result.evaluationTimeMs,
                        count: result.triggeredDetectors.length,
                      })}
                </div>
              </div>
            </div>
            {result.matched && (
              <Badge variant="warning" className="text-[10px] capitalize">
                {t('policyEnforcement.policyDetailClient.test.actionLabel', {
                  action: result.actionThatWouldFire,
                })}
              </Badge>
            )}
          </div>

          {result.matched && cls === "guideline" && (
            <div className="mb-3 rounded p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs">
              {t('policyEnforcement.policyDetailClient.test.guidelineNotePrefix')}
              <span className="font-mono">
                {t('policyEnforcement.policyDetailClient.test.guidelineNoteLogged')}
              </span>
              {t('policyEnforcement.policyDetailClient.test.guidelineNoteMiddle')}
              <span className="font-mono">
                {template.defaults.enforcementMode}
              </span>
              {t('policyEnforcement.policyDetailClient.test.guidelineNoteSuffix')}
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
                      {t('policyEnforcement.policyDetailClient.test.confidence', {
                        value: d.confidence.toFixed(2),
                      })}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {d.explanation}
                  </div>
                  {d.matchedSubstring && (
                    <code className="block text-[11px] mt-1.5 bg-muted/40 rounded px-2 py-1">
                      {t('policyEnforcement.policyDetailClient.test.matchLabel', {
                        value: d.matchedSubstring,
                      })}
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
  const t = useT()
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
                t('policyEnforcement.policyDetailClient.watchdog.autoDemoted')}
              {data.action === "grace_started" &&
                t('policyEnforcement.policyDetailClient.watchdog.graceStarted')}
              {data.action === "still_grace" &&
                t('policyEnforcement.policyDetailClient.watchdog.stillGrace')}
              {data.action === "recovered" &&
                t('policyEnforcement.policyDetailClient.watchdog.recovered')}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {t('policyEnforcement.policyDetailClient.watchdog.fpRatePrefix')}
              <span className="font-mono font-medium text-foreground">
                {t('policyEnforcement.policyDetailClient.watchdog.fpRateValue', {
                  value: data.fpRate.toFixed(2),
                })}
              </span>
              {t('policyEnforcement.policyDetailClient.watchdog.vsThreshold')}
              <span className="font-mono">
                {t('policyEnforcement.policyDetailClient.watchdog.thresholdValue', {
                  value: data.threshold,
                })}
              </span>
              {data.graceUntil && data.action !== "auto_demoted" && (
                <>
                  {t('policyEnforcement.policyDetailClient.watchdog.autoDemoteAt')}
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
          {t('policyEnforcement.policyDetailClient.watchdog.runNow')}
        </button>
      </div>
    </Card>
  )
}

function CountdownClock({ until }: { until: string }) {
  const t = useT()
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const target = new Date(until).getTime()
  const remainingMs = Math.max(0, target - now)
  const seconds = Math.floor(remainingMs / 1000)
  const m = Math.floor(seconds / 60)
  const s = seconds % 60

  if (remainingMs === 0) {
    return (
      <span className="font-mono text-destructive">
        {t('policyEnforcement.policyDetailClient.watchdog.imminent')}
      </span>
    )
  }
  return (
    <span className="font-mono">
      {t('policyEnforcement.policyDetailClient.watchdog.countdown', {
        m,
        s: s.toString().padStart(2, '0'),
      })}
    </span>
  )
}
