// Template detail — read-only view with a Clone & Customize CTA.

import Link from "next/link"
import { notFound } from "next/navigation"
import {
  POLICY_TEMPLATES,
  POLICY_CATEGORIES_META,
  getTemplateById
} from "@/lib/policy-templates/templates"
import { aiSpmAssets } from "@/lib/mock-data"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TemplateCloneClient } from "./client"

export const dynamic = "force-static"

export function generateStaticParams() {
  return POLICY_TEMPLATES.map((t) => ({ id: t.id }))
}

export default async function TemplateDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const template = getTemplateById(id)
  if (!template) return notFound()

  const meta = POLICY_CATEGORIES_META[template.category]
  const applications = aiSpmAssets.map((a) => ({
    id: a.assetId,
    name: a.modelName
  }))

  return (
    <div className="space-y-6">
      <Link
        href="/policy-enforcement/templates"
        className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        ← Template library
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge variant="outline" className="text-[10px]">
              {meta.label}
            </Badge>
            {template.owaspReference && (
              <Badge variant="outline" className="font-mono text-[10px]">
                {template.owaspReference}
              </Badge>
            )}
            <Badge
              variant={
                template.severity === "critical" || template.severity === "high"
                  ? "destructive"
                  : template.severity === "medium"
                    ? "warning"
                    : "secondary"
              }
              className="text-[10px] capitalize"
            >
              {template.severity}
            </Badge>
            <span className="text-xs text-muted-foreground">
              v{template.version} · {template.author}
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{template.name}</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            {template.description}
          </p>
        </div>
      </div>

      {/* Clone form */}
      <TemplateCloneClient template={template} applications={applications} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rationale */}
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
            Rationale
          </div>
          <p className="text-sm">{template.rationale}</p>
        </Card>

        {/* Examples */}
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
            Example violation
          </div>
          <code className="block text-[11px] bg-muted/40 rounded p-2 whitespace-pre-wrap">
            {template.exampleViolation}
          </code>
          {template.exampleSafeInput && (
            <>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mt-3 mb-2">
                Example safe input
              </div>
              <code className="block text-[11px] bg-green-50/40 dark:bg-green-950/10 rounded p-2 whitespace-pre-wrap">
                {template.exampleSafeInput}
              </code>
            </>
          )}
        </Card>
      </div>

      {/* Triggers + actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
            Triggers ({template.triggers.length})
          </div>
          <ul className="text-sm space-y-1.5">
            {template.triggers.map((t, i) => (
              <li key={i}>
                <Badge variant="outline" className="text-[10px] capitalize mr-2">
                  {t.stage}
                </Badge>
                <span className="text-xs text-muted-foreground">{t.description}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
            Detectors ({template.detectors.length})
          </div>
          <ul className="text-sm space-y-1.5">
            {template.detectors.map((d) => (
              <li key={d.id}>
                <div className="flex items-baseline gap-2">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {d.type}
                  </Badge>
                  <span className="font-medium text-xs">{d.id}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {d.description}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
            Actions ({template.actions.length})
          </div>
          <ul className="text-sm space-y-1.5">
            {template.actions.map((a, i) => (
              <li key={i}>
                <Badge variant="outline" className="text-[10px] capitalize mr-2">
                  {a.type}
                </Badge>
                <span className="text-xs text-muted-foreground">{a.description}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Tunable parameters */}
      <Card className="p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
          Tunable parameters ({template.tunableParameters.length})
        </div>
        <div className="space-y-2">
          {template.tunableParameters.map((p) => (
            <div key={p.key} className="border rounded p-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium">{p.label}</span>
                <div className="flex gap-1.5">
                  <Badge variant="outline" className="text-[9px] uppercase">
                    {p.level}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-[9px]">
                    {p.type}
                  </Badge>
                  {p.locked && (
                    <Badge variant="secondary" className="text-[9px]">
                      🔒 locked
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {p.helpText}
              </div>
              <div className="text-[11px] mt-1.5 font-mono text-muted-foreground">
                Default: {JSON.stringify(p.default)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Regulatory references */}
      {template.regulatoryReferences.length > 0 && (
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
            Regulatory references
          </div>
          <div className="flex flex-wrap gap-1.5">
            {template.regulatoryReferences.map((r) => (
              <span
                key={r}
                className="text-xs px-2 py-1 rounded bg-muted/60 text-foreground font-mono"
              >
                {r}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Defaults */}
      <Card className="p-4 bg-muted/30">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
          Template defaults (suggested target after promotion)
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Suggested mode</div>
            <div className="font-mono capitalize">
              {template.defaults.enforcementMode}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Risk tiers</div>
            <div>
              {template.defaults.appliesTo.riskTiers?.join(", ") ?? "—"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Data classifications</div>
            <div>
              {template.defaults.appliesTo.dataClassifications?.join(", ") ?? "—"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Departments</div>
            <div>
              {template.defaults.appliesTo.departments?.join(", ") ?? "—"}
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 italic">
          Cloned policies start in Guideline mode. Use the promotion wizard
          to flip to Strict once you trust the false-positive rate.
        </p>
      </Card>
    </div>
  )
}
