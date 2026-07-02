'use client'
import { useState } from 'react'
import { Check, Loader2, Wand2, ShieldCheck, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// The staged "Connect to Microsoft Sentinel" flow. Pure theatre: the
// connection test is a scripted fake handshake — no request leaves the browser.

export type ConnectState = 'disconnected' | 'connected'

interface Fields {
  workspaceId: string
  dce: string
  dcrImmutableId: string
  region: string
}

const DEMO: Fields = {
  workspaceId: 'a1b2c3d4-5e6f-7890-abcd-ef1234567890',
  dce: 'atlas-aispm-dce.eastus-1.ingest.monitor.azure.com',
  dcrImmutableId: 'dcr-8f3c2a1b9d7e4f60a5c1e2d3b4a59687',
  region: 'East US',
}

type TestPhase = 'idle' | 'testing' | 'ok'

export function SentinelConnectWizard({
  onConnected,
}: {
  onConnected: () => void
}) {
  const [step, setStep] = useState(0)
  const [fields, setFields] = useState<Fields>({ workspaceId: '', dce: '', dcrImmutableId: '', region: 'East US' })
  const [test, setTest] = useState<TestPhase>('idle')

  const filled = fields.workspaceId.trim() && fields.dce.trim() && fields.dcrImmutableId.trim()

  function useDemo() {
    setFields(DEMO)
  }

  function runTest() {
    setTest('testing')
    // Scripted handshake — resolves to a green check after a beat.
    window.setTimeout(() => setTest('ok'), 1400)
  }

  const steps = ['Endpoint', 'Test connection', 'Enable']

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      {/* Stepper header */}
      <div className="mb-5 flex items-center">
        {steps.map((label, i) => (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  i < step && 'bg-green-500 text-white',
                  i === step && 'bg-indigo-600 text-white',
                  i > step && 'bg-slate-100 text-slate-400',
                )}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={cn('text-sm font-medium', i <= step ? 'text-slate-900' : 'text-slate-400')}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn('mx-3 h-px flex-1', i < step ? 'bg-green-400' : 'bg-slate-200')} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0 — endpoint */}
      {step === 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Point Atlas at your Log Analytics workspace and Data Collection Rule.
            </p>
            <button
              onClick={useDemo}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100"
            >
              <Wand2 size={13} /> Use demo workspace
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="Log Analytics Workspace ID"
              value={fields.workspaceId}
              onChange={(v) => setFields((f) => ({ ...f, workspaceId: v }))}
              placeholder="00000000-0000-0000-0000-000000000000"
            />
            <Field
              label="Region"
              value={fields.region}
              onChange={(v) => setFields((f) => ({ ...f, region: v }))}
              placeholder="East US"
            />
            <Field
              label="Data Collection Endpoint (DCE)"
              value={fields.dce}
              onChange={(v) => setFields((f) => ({ ...f, dce: v }))}
              placeholder="…ingest.monitor.azure.com"
              className="sm:col-span-2"
            />
            <Field
              label="DCR immutable ID"
              value={fields.dcrImmutableId}
              onChange={(v) => setFields((f) => ({ ...f, dcrImmutableId: v }))}
              placeholder="dcr-…"
              className="sm:col-span-2"
            />
          </div>
          <div className="flex justify-end">
            <button
              disabled={!filled}
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Step 1 — test */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            We&apos;ll authenticate with Entra ID and send a probe record to the DCR ingestion endpoint.
          </p>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-600">
            <div>POST https://{fields.dce || DEMO.dce}/dataCollectionRules/{'{dcr}'}/streams/Custom-Atlas…</div>
            <div className="mt-1 text-slate-400">Authorization: Bearer eyJ0eXAiOiJKV1Qi… (Entra ID)</div>
            {test === 'ok' && (
              <div className="mt-2 space-y-0.5 text-green-600">
                <div>← 204 No Content · authenticated</div>
                <div>← round-trip 14 ms · region {fields.region || DEMO.region}</div>
                <div>← DCR reachable · stream declarations validated ✓</div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <button onClick={() => setStep(0)} className="text-sm font-medium text-slate-500 hover:text-slate-700">
              Back
            </button>
            {test !== 'ok' ? (
              <button
                onClick={runTest}
                disabled={test === 'testing'}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-70"
              >
                {test === 'testing' ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Testing…
                  </>
                ) : (
                  <>Test connection</>
                )}
              </button>
            ) : (
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
              >
                <Check size={15} /> Looks good — continue
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 2 — enable */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <ShieldCheck size={20} className="mt-0.5 shrink-0 text-green-600" />
            <div className="text-sm text-green-800">
              <p className="font-semibold">Connection verified.</p>
              <p className="text-green-700">
                Turn on the event streams below and Atlas will begin forwarding AI-SPM events to Sentinel in real time.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button onClick={() => setStep(1)} className="text-sm font-medium text-slate-500 hover:text-slate-700">
              Back
            </button>
            <button
              onClick={onConnected}
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-500"
            >
              Enable & start streaming <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  )
}
