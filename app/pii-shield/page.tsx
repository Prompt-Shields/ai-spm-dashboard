'use client'
import { useState } from 'react'
import { User, Shield, Sparkles, Undo2, Send, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { detectPII } from '@/lib/pii/detector'
import { anonymize, deanonymize } from '@/lib/pii/anonymizer'
import { simulateReply } from '@/lib/pii/mock-chatgpt'
import { EXAMPLE_PROMPTS } from '@/lib/pii/examples'
import type { MappingEntry, PiiMatch } from '@/lib/pii/types'
import { HighlightedText } from '@/components/pii-shield/highlighted-text'
import { StageCard } from '@/components/pii-shield/stage-card'
import { MappingPanel } from '@/components/pii-shield/mapping-panel'
import { cn } from '@/lib/utils'

interface Result {
  matches: PiiMatch[]
  masked: string
  mapping: MappingEntry[]
  raw: string
  restored: string
}

const SEND_DELAY_MS = 900

export default function PiiShieldPage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [stage, setStage] = useState<'idle' | 'sending' | 'done'>('idle')
  const [showUnprotected, setShowUnprotected] = useState(false)

  function runShield() {
    const text = input.trim()
    if (!text) return
    const matches = detectPII(text)
    const { masked, mapping } = anonymize(text, matches)
    setResult({ matches, masked, mapping, raw: '', restored: '' })
    setStage('sending')
    setTimeout(() => {
      const raw = simulateReply(masked)
      const restored = deanonymize(raw, mapping)
      setResult({ matches, masked, mapping, raw, restored })
      setStage('done')
    }, SEND_DELAY_MS)
  }

  function loadExample(text: string) {
    setInput(text)
    setStage('idle')
    setResult(null)
  }

  const piiCount = result?.mapping.length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Shield className="text-indigo-600" size={22} /> PII Shield Demo
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Send a prompt to ChatGPT — even one full of personal data. The Shield detects PII locally, swaps it for
          placeholders before anything leaves your browser, and restores the real values only in the reply you see.
          ChatGPT never receives the sensitive data.
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Try an example:</span>
          {EXAMPLE_PROMPTS.map((ex) => (
            <button
              key={ex.label}
              onClick={() => loadExample(ex.text)}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600"
            >
              {ex.label}
            </button>
          ))}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          placeholder="e.g. Draft an email to Sarah Chen at sarah.chen@acme.com about her overdue invoice…"
          className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer select-none items-center gap-1.5 text-xs text-slate-500">
            <input
              type="checkbox"
              checked={showUnprotected}
              onChange={(e) => setShowUnprotected(e.target.checked)}
              className="accent-rose-500"
            />
            {showUnprotected ? <Eye size={13} /> : <EyeOff size={13} />}
            Show what ChatGPT would see <span className="font-medium text-rose-500">without</span> the Shield
          </label>
          <button
            onClick={runShield}
            disabled={!input.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors enabled:hover:bg-indigo-700 disabled:opacity-40"
          >
            <Send size={14} /> Send to ChatGPT
          </button>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-3">
            <StageCard index={1} title="Your prompt" subtitle="What you typed — sensitive values detected locally." Icon={User} tone="user" visible>
              <HighlightedText text={input.trim()} matches={result.matches} />
              <div className="mt-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                    piiCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700',
                  )}
                >
                  <AlertTriangle size={11} />
                  {piiCount > 0 ? `${piiCount} PII item${piiCount === 1 ? '' : 's'} detected` : '0 PII items detected — forwarded unchanged'}
                </span>
              </div>
            </StageCard>

            <StageCard index={2} title="Anonymized — all ChatGPT sees" subtitle="PII swapped for placeholders before sending." Icon={Shield} tone="shield" visible>
              <HighlightedText text={result.masked} placeholders />
              {showUnprotected && (
                <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/60 p-2.5">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                    <AlertTriangle size={12} /> Without Shield — ChatGPT would receive this
                  </div>
                  <HighlightedText text={input.trim()} matches={result.matches} />
                </div>
              )}
            </StageCard>

            <StageCard index={3} title="ChatGPT response" subtitle="Generated from placeholders only — no real PII." Icon={Sparkles} tone="chatgpt" visible>
              {stage === 'sending' ? (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="animate-pulse tracking-widest">● ● ●</span> ChatGPT is responding…
                </div>
              ) : (
                <HighlightedText text={result.raw} placeholders />
              )}
            </StageCard>

            <StageCard index={4} title="Restored for you" subtitle="Placeholders swapped back to the real values — only in your view." Icon={Undo2} tone="restored" visible={stage === 'done'}>
              <HighlightedText text={result.restored} values={result.mapping} />
            </StageCard>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-semibold text-slate-800">Detected PII → placeholders</div>
              <MappingPanel mapping={result.mapping} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
