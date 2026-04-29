"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { PolicyTemplate } from "@/lib/policy-templates/types"

interface Props {
  template: PolicyTemplate
  applications: Array<{ id: string; name: string }>
}

export function TemplateCloneClient({ template, applications }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(template.name)
  const [selectedAppIds, setSelectedAppIds] = useState<Set<string>>(new Set())
  const [showAppPicker, setShowAppPicker] = useState(false)

  const handleClone = () => {
    setError(null)
    startTransition(async () => {
      const res = await fetch("/api/policies/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template.id,
          name,
          createdBy: "admin@demo.local",
          appliesTo: {
            applicationIds: Array.from(selectedAppIds)
          }
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Clone failed")
        return
      }
      // Redirect to the freshly created policy detail page
      router.push(`/policy-enforcement/policies/${data.instance.id}`)
    })
  }

  const toggleApp = (id: string) => {
    setSelectedAppIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Card className="p-5 border-2 bg-blue-50/30 dark:bg-blue-950/10">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📘</span>
            <span className="text-sm font-semibold">Clone & start observing</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Creates a Guideline policy. Observation only — nothing is blocked
            until you promote to Strict.
          </p>
        </div>
        <Badge variant="outline" className="text-[10px]">
          Mode on clone: <span className="font-mono ml-1">log</span>
        </Badge>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive mb-3">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">
            Policy name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-1.5 rounded-md border bg-background text-sm"
            placeholder="e.g. PII Output - Customer Service"
          />
          <div className="text-[10px] text-muted-foreground mt-1">
            Defaults to template name. Customise to distinguish multiple
            instances of the same template.
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowAppPicker((s) => !s)}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            {showAppPicker ? "▾" : "▸"} Apply to specific applications (optional, {selectedAppIds.size} selected)
          </button>

          {showAppPicker && (
            <div className="mt-2 max-h-60 overflow-y-auto border rounded p-2 bg-background space-y-1">
              {applications.map((a) => (
                <label
                  key={a.id}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1 rounded text-xs cursor-pointer",
                    selectedAppIds.has(a.id) && "bg-accent"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedAppIds.has(a.id)}
                    onChange={() => toggleApp(a.id)}
                  />
                  <span className="flex-1">{a.name}</span>
                  <span className="text-muted-foreground font-mono text-[10px]">
                    {a.id}
                  </span>
                </label>
              ))}
            </div>
          )}
          <div className="text-[10px] text-muted-foreground mt-1">
            Leave empty to apply broadly via the template&apos;s default
            data-classification / risk-tier filters.
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            disabled={pending || !name.trim()}
            onClick={handleClone}
            className="px-4 py-1.5 rounded-md text-sm font-medium bg-foreground text-background hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Cloning…" : "Clone & Customize →"}
          </button>
        </div>
      </div>
    </Card>
  )
}
