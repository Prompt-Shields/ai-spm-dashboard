'use client'
import { useMemo } from 'react'
import { AlertTriangle, Database, TerminalSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SEVERITY_STYLE, STREAM_BY_ID, type SpmEvent } from '@/lib/integrations/sentinel-demo'
import { BrandLogo } from './brand-logos'

// The "inside Microsoft Sentinel" mirror. A read-only KQL query, a results
// table that fills as events arrive, and incidents auto-raised from
// High/Critical events — closing the loop visually.
export function SentinelSidePanel({ events }: { events: SpmEvent[] }) {
  // Summarize by event type (what a `summarize count() by EventType` returns).
  const summary = useMemo(() => {
    const byType = new Map<string, { count: number; table: string; sev: SpmEvent['severity'] }>()
    for (const e of events) {
      const cur = byType.get(e.eventType)
      if (cur) cur.count += 1
      else byType.set(e.eventType, { count: 1, table: STREAM_BY_ID[e.streamId].table, sev: e.severity })
    }
    return [...byType.entries()].map(([type, v]) => ({ type, ...v })).sort((a, b) => b.count - a.count)
  }, [events])

  // Incidents = high-signal events, most recent first.
  const incidents = useMemo(
    () =>
      events
        .filter((e) => e.severity === 'High' || e.severity === 'Critical')
        .slice(0, 6)
        .map((e, i) => ({
          id: `INC-${4400 + ((events.length - i) % 600)}`,
          evt: e,
        })),
    [events],
  )

  const total = events.length

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-slate-100">
      {/* Sentinel chrome header */}
      <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900 px-5 py-3">
        <BrandLogo id="sentinel" className="h-6 w-6" />
        <h2 className="text-sm font-semibold">Inside Microsoft Sentinel</h2>
        <span className="ml-auto rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
          workspace: atlas-aispm
        </span>
      </div>

      {/* KQL query pane */}
      <div className="border-b border-slate-800 px-5 py-4">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-500">
          <TerminalSquare size={13} /> Logs · KQL
        </div>
        <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 font-mono text-[11px] leading-relaxed">
          <span className="text-sky-300">union</span> ATLAS_*_CL{'\n'}
          <span className="text-slate-500">| </span>
          <span className="text-sky-300">where</span> TimeGenerated {'>'} <span className="text-amber-300">ago</span>(1h){'\n'}
          <span className="text-slate-500">| </span>
          <span className="text-sky-300">summarize</span> Events = <span className="text-amber-300">count</span>() <span className="text-sky-300">by</span> EventType, Severity{'\n'}
          <span className="text-slate-500">| </span>
          <span className="text-sky-300">order by</span> Events <span className="text-sky-300">desc</span>
        </pre>
      </div>

      {/* Results */}
      <div className="border-b border-slate-800 px-5 py-4">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-500">
          <Database size={13} /> Results{' '}
          <span className="text-slate-600">
            · {total.toLocaleString()} record{total === 1 ? '' : 's'}
          </span>
        </div>
        {summary.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-600">No records yet — enable streaming.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-[10px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-1.5 font-medium">EventType</th>
                  <th className="px-3 py-1.5 font-medium">Severity</th>
                  <th className="hidden px-3 py-1.5 font-medium sm:table-cell">Table</th>
                  <th className="px-3 py-1.5 text-right font-medium">Events</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {summary.map((r) => (
                  <tr key={r.type} className="hover:bg-slate-900/50">
                    <td className="px-3 py-1.5 font-mono text-slate-200">{r.type}</td>
                    <td className="px-3 py-1.5">
                      <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-semibold', SEVERITY_STYLE[r.sev].chip)}>
                        {r.sev}
                      </span>
                    </td>
                    <td className="hidden px-3 py-1.5 font-mono text-[10px] text-sky-300 sm:table-cell">{r.table}</td>
                    <td className="px-3 py-1.5 text-right font-semibold tabular-nums text-white">{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Incidents */}
      <div className="px-5 py-4">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-500">
          <AlertTriangle size={13} className="text-amber-400" /> Auto-raised incidents
        </div>
        {incidents.length === 0 ? (
          <p className="py-3 text-center text-xs text-slate-600">No high-severity incidents.</p>
        ) : (
          <ul className="space-y-2">
            {incidents.map(({ id, evt }) => (
              <li
                key={evt.id}
                className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2"
              >
                <span className={cn('h-2 w-2 shrink-0 rounded-full', SEVERITY_STYLE[evt.severity].dot)} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium text-slate-100">{evt.message}</div>
                  <div className="text-[10px] text-slate-500">
                    {id} · {evt.eventType} · {evt.actor}
                  </div>
                </div>
                <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold', SEVERITY_STYLE[evt.severity].chip)}>
                  {evt.severity}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
