'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plug } from 'lucide-react'
import {
  STREAMS,
  generateEvent,
  recordBytes,
  type SpmEvent,
  type StreamId,
} from '@/lib/integrations/sentinel-demo'
import { BrandLogo } from '@/components/integrations/brand-logos'
import { SentinelConnectWizard } from '@/components/integrations/sentinel-connect-wizard'
import { SentinelDataMapping } from '@/components/integrations/sentinel-data-mapping'
import { SentinelEventStream } from '@/components/integrations/sentinel-event-stream'
import { SentinelSidePanel } from '@/components/integrations/sentinel-side-panel'

const FEED_CAP = 60 // rows kept in the DOM; counters accumulate beyond this.
const BASE_INTERVAL = 1500 // ms between events at 1×.

function allOn(): Record<StreamId, boolean> {
  return STREAMS.reduce((acc, s) => ({ ...acc, [s.id]: true }), {} as Record<StreamId, boolean>)
}

export default function SentinelIntegrationPage() {
  const [connected, setConnected] = useState(false)
  const [enabled, setEnabled] = useState<Record<StreamId, boolean>>(allOn())
  const [running, setRunning] = useState(true)
  const [speed, setSpeed] = useState(1)

  const [events, setEvents] = useState<SpmEvent[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalBytes, setTotalBytes] = useState(0)

  // Keep the latest enabled-stream list in a ref so the interval reads current
  // values without being torn down and recreated on every toggle.
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  useEffect(() => {
    if (!connected || !running) return
    const id = window.setInterval(() => {
      const on = STREAMS.filter((s) => enabledRef.current[s.id]).map((s) => s.id)
      if (on.length === 0) return
      const evt = generateEvent(on, Date.now())
      setEvents((prev) => [evt, ...prev].slice(0, FEED_CAP))
      setTotalCount((c) => c + 1)
      setTotalBytes((b) => b + recordBytes(evt))
    }, BASE_INTERVAL / speed)
    return () => window.clearInterval(id)
  }, [connected, running, speed])

  const toggleStream = useCallback((id: StreamId) => {
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const clearFeed = useCallback(() => {
    setEvents([])
    setTotalCount(0)
    setTotalBytes(0)
  }, [])

  return (
    <div className="space-y-6">
      {/* Breadcrumb + header */}
      <div>
        <Link
          href="/integrations"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600"
        >
          <ChevronLeft size={13} /> Integrations
        </Link>
        <div className="mt-2 flex items-start gap-3">
          <BrandLogo id="sentinel" className="h-11 w-11 shadow-sm" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Microsoft Sentinel</h1>
              <StatusPill connected={connected} />
            </div>
            <p className="mt-0.5 text-sm text-slate-500">
              Stream AI security-posture events into your cloud-native SIEM &amp; XDR.
            </p>
          </div>
        </div>
      </div>

      {/* Not connected → wizard. Connected → mapping + live demo. */}
      {!connected ? (
        <>
          <SentinelConnectWizard onConnected={() => setConnected(true)} />
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-5">
            <h2 className="text-sm font-semibold text-slate-700">What Atlas will forward</h2>
            <p className="mb-3 text-xs text-slate-500">
              Once connected, these AI-SPM signal streams map into dedicated Sentinel custom-log tables.
            </p>
            <SentinelDataMapping enabled={enabled} onToggle={toggleStream} disabled />
          </div>
        </>
      ) : (
        <>
          <SentinelDataMapping enabled={enabled} onToggle={toggleStream} />
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
            <SentinelEventStream
              events={events}
              running={running}
              speed={speed}
              totalCount={totalCount}
              totalBytes={totalBytes}
              onToggleRunning={() => setRunning((r) => !r)}
              onClear={clearFeed}
              onSpeed={setSpeed}
            />
            <SentinelSidePanel events={events} />
          </div>
          <button
            onClick={() => {
              setConnected(false)
              setRunning(true)
              clearFeed()
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-rose-600"
          >
            <Plug size={13} /> Disconnect
          </button>
        </>
      )}
    </div>
  )
}

function StatusPill({ connected }: { connected: boolean }) {
  return (
    <span
      className={
        connected
          ? 'inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-green-700 ring-1 ring-green-200'
          : 'inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200'
      }
    >
      <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-slate-400'}`} />
      {connected ? 'Connected' : 'Not connected'}
    </span>
  )
}
