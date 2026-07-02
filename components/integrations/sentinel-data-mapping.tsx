'use client'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STREAMS, type StreamId } from '@/lib/integrations/sentinel-demo'

// The "what data gets pushed" table: each AI-SPM signal stream → its Sentinel
// custom-log table, with a per-stream on/off toggle.
export function SentinelDataMapping({
  enabled,
  onToggle,
  disabled,
}: {
  enabled: Record<StreamId, boolean>
  onToggle: (id: StreamId) => void
  disabled?: boolean
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Event streams</h2>
        <p className="text-xs text-slate-500">Choose which AI-SPM signals forward to Sentinel, and where they land.</p>
      </div>
      <ul className="divide-y divide-slate-100">
        {STREAMS.map((s) => {
          const on = enabled[s.id]
          return (
            <li key={s.id} className="flex items-center gap-4 px-5 py-3">
              <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', s.accent.dot)} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900">{s.label}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                    {s.sourceModule}
                  </span>
                </div>
                <p className="truncate text-xs text-slate-500">{s.description}</p>
              </div>

              <ArrowRight size={14} className="hidden shrink-0 text-slate-300 sm:block" />

              <code className="hidden shrink-0 rounded-md bg-slate-900 px-2 py-1 font-mono text-[11px] text-sky-300 sm:block">
                {s.table}
              </code>

              <button
                role="switch"
                aria-checked={on}
                aria-label={`Toggle ${s.label}`}
                disabled={disabled}
                onClick={() => onToggle(s.id)}
                className={cn(
                  'relative ml-1 h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-40',
                  on ? 'bg-indigo-600' : 'bg-slate-300',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                    on ? 'translate-x-4' : 'translate-x-0.5',
                  )}
                />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
