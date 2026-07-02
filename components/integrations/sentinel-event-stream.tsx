'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, Pause, Trash2, ChevronDown, CheckCircle2, Radio } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  SEVERITY_STYLE,
  STREAM_BY_ID,
  toIngestionRecord,
  type SpmEvent,
} from '@/lib/integrations/sentinel-demo'

// The theatrical centrepiece: a live-ticking feed of AI-SPM events being
// forwarded to Sentinel. Click a row to reveal the exact ingestion record.
export function SentinelEventStream({
  events,
  running,
  speed,
  totalCount,
  totalBytes,
  onToggleRunning,
  onClear,
  onSpeed,
}: {
  events: SpmEvent[]
  running: boolean
  speed: number
  totalCount: number
  totalBytes: number
  onToggleRunning: () => void
  onClear: () => void
  onSpeed: (s: number) => void
}) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {running && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            )}
            <span className={cn('relative inline-flex h-2.5 w-2.5 rounded-full', running ? 'bg-green-500' : 'bg-slate-300')} />
          </span>
          <h2 className="text-sm font-semibold text-slate-900">Live forwarding to Sentinel</h2>
        </div>

        <div className="ml-auto flex items-center gap-4 text-xs text-slate-500">
          <span>
            <span className="font-semibold text-slate-900 tabular-nums">{totalCount.toLocaleString()}</span> events
          </span>
          <span>
            <span className="font-semibold text-slate-900 tabular-nums">{(totalBytes / 1024).toFixed(1)}</span> KB
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Speed */}
          <div className="mr-1 flex overflow-hidden rounded-lg border border-slate-200">
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => onSpeed(s)}
                className={cn(
                  'px-2 py-1 text-xs font-medium',
                  speed === s ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50',
                )}
              >
                {s}×
              </button>
            ))}
          </div>
          <button
            onClick={onToggleRunning}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
          >
            {running ? <Pause size={13} /> : <Play size={13} />}
            {running ? 'Pause' : 'Resume'}
          </button>
          <button
            onClick={onClear}
            aria-label="Clear feed"
            className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="max-h-[30rem] divide-y divide-slate-50 overflow-y-auto">
        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-slate-400">
            <Radio size={22} />
            <p className="text-sm">Waiting for events…</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {events.map((evt) => {
            const stream = STREAM_BY_ID[evt.streamId]
            const sev = SEVERITY_STYLE[evt.severity]
            const open = openId === evt.id
            return (
              <motion.div
                key={evt.id}
                layout
                initial={{ opacity: 0, backgroundColor: 'rgba(224,231,255,0.6)' }}
                animate={{ opacity: 1, backgroundColor: 'rgba(255,255,255,0)' }}
                transition={{ duration: 0.5 }}
              >
                <button
                  onClick={() => setOpenId(open ? null : evt.id)}
                  className="flex w-full items-center gap-3 px-5 py-2.5 text-left hover:bg-slate-50"
                >
                  <span className="w-16 shrink-0 font-mono text-[11px] text-slate-400 tabular-nums">
                    {new Date(evt.ts).toLocaleTimeString('en-GB')}
                  </span>
                  <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold', sev.chip)}>
                    {evt.severity}
                  </span>
                  <span
                    className={cn(
                      'hidden shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ring-1 sm:inline',
                      stream.accent.chip,
                    )}
                  >
                    {evt.eventType}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{evt.message}</span>
                  <span className="hidden shrink-0 items-center gap-1 text-[11px] font-medium text-green-600 md:inline-flex">
                    <CheckCircle2 size={12} /> ingested
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn('shrink-0 text-slate-300 transition-transform', open && 'rotate-180')}
                  />
                </button>

                {open && (
                  <div className="border-t border-slate-100 bg-slate-950 px-5 py-3">
                    <div className="mb-2 flex items-center gap-2 text-[11px] text-slate-400">
                      <span>POST</span>
                      <code className="text-sky-300">…/streams/Custom-{stream.table.replace('_CL', '')}</code>
                      <span className="ml-auto rounded bg-slate-800 px-1.5 py-0.5 text-slate-300">
                        → {stream.table}
                      </span>
                    </div>
                    <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed text-slate-200">
                      {JSON.stringify(toIngestionRecord(evt), null, 2)}
                    </pre>
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
