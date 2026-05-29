"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useT } from "@/lib/i18n/provider"
import type {
  PolicyTemplate,
  PolicyCategory,
  Severity
} from "@/lib/policy-templates/types"

interface Props {
  templates: PolicyTemplate[]
  categoryMeta: Record<
    PolicyCategory,
    { label: string; color: string; icon: string }
  >
}

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3
}

const SEVERITY_BADGE_VARIANT: Record<
  Severity,
  "destructive" | "warning" | "secondary"
> = {
  critical: "destructive",
  high: "destructive",
  medium: "warning",
  low: "secondary"
}

export function TemplateLibraryClient({ templates, categoryMeta }: Props) {
  const t = useT()
  const [query, setQuery] = useState("")
  const [activeCat, setActiveCat] = useState<PolicyCategory | "ALL">("ALL")

  const categories = useMemo(() => {
    const cats = new Set(templates.map((t) => t.category))
    return Array.from(cats)
  }, [templates])

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: templates.length }
    for (const t of templates) c[t.category] = (c[t.category] ?? 0) + 1
    return c
  }, [templates])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return templates
      .filter((t) => activeCat === "ALL" || t.category === activeCat)
      .filter((t) => {
        if (!q) return true
        return (
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          t.owaspReference?.toLowerCase().includes(q) ||
          t.regulatoryReferences.some((r) => r.toLowerCase().includes(q))
        )
      })
      .sort(
        (a, b) =>
          SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
          a.name.localeCompare(b.name)
      )
  }, [templates, query, activeCat])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder={t('policyEnforcement.templatesListClient.searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-[260px] px-3 py-1.5 rounded-md border bg-background text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <CategoryPill
          label={t('policyEnforcement.templatesListClient.allCategory')}
          count={counts.ALL}
          active={activeCat === "ALL"}
          onClick={() => setActiveCat("ALL")}
        />
        {categories.map((c) => (
          <CategoryPill
            key={c}
            label={categoryMeta[c]?.label ?? c}
            count={counts[c] ?? 0}
            active={activeCat === c}
            onClick={() => setActiveCat(c)}
          />
        ))}
      </div>

      {/* Result count */}
      <div className="text-xs text-muted-foreground">
        {t('policyEnforcement.templatesListClient.resultCount', {
          filtered: filtered.length,
          total: templates.length,
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((t) => (
          <TemplateCard key={t.id} template={t} categoryMeta={categoryMeta} />
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="p-8 border-dashed text-center">
          <p className="text-sm text-muted-foreground">
            {t('policyEnforcement.templatesListClient.empty')}
          </p>
        </Card>
      )}
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────

function CategoryPill({
  label,
  count,
  active,
  onClick
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1 rounded-full text-xs border transition-colors",
        active
          ? "bg-foreground text-background border-foreground"
          : "border-input hover:bg-accent"
      )}
    >
      {label} <span className="opacity-60 ml-1">{count}</span>
    </button>
  )
}

function TemplateCard({
  template,
  categoryMeta
}: {
  template: PolicyTemplate
  categoryMeta: Props["categoryMeta"]
}) {
  const t = useT()
  const meta = categoryMeta[template.category]
  return (
    <Link href={`/policy-enforcement/templates/${template.id}`} className="group">
      <Card className="p-4 h-full transition-shadow group-hover:shadow-md flex flex-col gap-3">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <Badge variant="outline" className="text-[10px]">
                {meta?.label ?? template.category}
              </Badge>
              {template.owaspReference && (
                <Badge variant="outline" className="font-mono text-[10px]">
                  {template.owaspReference}
                </Badge>
              )}
              <Badge
                variant={SEVERITY_BADGE_VARIANT[template.severity]}
                className="text-[10px] capitalize"
              >
                {template.severity}
              </Badge>
            </div>
            <h3 className="text-sm font-semibold leading-snug">
              {template.name}
            </h3>
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-3 flex-1">
          {template.description}
        </p>

        <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t">
          <span className="text-muted-foreground">
            {template.detectors.length === 1
              ? t('policyEnforcement.templatesListClient.detectorsOne', {
                  count: template.detectors.length,
                })
              : t('policyEnforcement.templatesListClient.detectorsMany', {
                  count: template.detectors.length,
                })}
          </span>
          <span className="text-muted-foreground">
            {t('policyEnforcement.templatesListClient.versionLabel', {
              version: template.version,
            })}
          </span>
        </div>

        {template.regulatoryReferences.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.regulatoryReferences.slice(0, 2).map((r) => (
              <span
                key={r}
                className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono"
              >
                {r}
              </span>
            ))}
            {template.regulatoryReferences.length > 2 && (
              <span className="text-[10px] text-muted-foreground">
                +{template.regulatoryReferences.length - 2}
              </span>
            )}
          </div>
        )}
      </Card>
    </Link>
  )
}
