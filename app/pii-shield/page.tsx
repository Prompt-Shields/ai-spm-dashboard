'use client'
import { useState } from 'react'
import { User, Shield, ShieldCheck, Sparkles, Undo2, Plus, Mic, ArrowUp, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { detectPII } from '@/lib/pii/detector'
import { anonymize, deanonymize } from '@/lib/pii/anonymizer'
import { simulateReply } from '@/lib/pii/mock-chatgpt'
import { EXAMPLE_PROMPTS } from '@/lib/pii/examples'
import type { MappingEntry, PiiMatch } from '@/lib/pii/types'
import { HighlightedText } from '@/components/pii-shield/highlighted-text'
import { StageCard } from '@/components/pii-shield/stage-card'
import { MappingPanel } from '@/components/pii-shield/mapping-panel'
import { ChatGptReplica } from '@/components/pii-shield/chatgpt-replica'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n/provider'

interface Result {
  matches: PiiMatch[]
  masked: string
  mapping: MappingEntry[]
  raw: string
  restored: string
}

const SEND_DELAY_MS = 900
const DEFAULT_PROMPT = EXAMPLE_PROMPTS[0].text

export default function PiiShieldPage() {
  const t = useT()
  const [input, setInput] = useState(DEFAULT_PROMPT)
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

  function newChat() {
    setStage('idle')
    setResult(null)
  }

  const piiCount = result?.mapping.length ?? 0
  const sentPrompt = result ? input.trim() : ''

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Shield className="text-indigo-600" size={22} /> {t('piiShield.title')}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">{t('piiShield.intro')}</p>
      </div>

      {/* ── ChatGPT replica: the surface a user actually types into ── */}
      <ChatGptReplica onNewChat={newChat}>
        {stage === 'idle' ? (
          <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center pb-10">
            <h2 className="mb-7 text-center text-3xl font-semibold text-slate-800">What’s on the agenda today?</h2>

            {/* Composer */}
            <div className="w-full rounded-[1.75rem] border border-slate-200 bg-white px-4 py-3 shadow-[0_2px_14px_rgba(0,0,0,0.05)]">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={4}
                placeholder={t('piiShield.inputPlaceholder')}
                className="w-full resize-none border-0 bg-transparent text-[15px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <div className="flex items-center justify-between pt-1">
                <button className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100">
                  <Plus size={18} />
                </button>
                <div className="flex items-center gap-1">
                  <button className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100">
                    <Mic size={18} />
                  </button>
                  <button
                    onClick={runShield}
                    disabled={!input.trim()}
                    aria-label={t('piiShield.send')}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white transition-colors enabled:hover:bg-slate-800 disabled:opacity-30"
                  >
                    <ArrowUp size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Demo controls — subtle, below the composer */}
            <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-medium text-slate-400">{t('piiShield.tryExample')}</span>
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => loadExample(ex.text)}
                  className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600"
                >
                  {ex.label}
                </button>
              ))}
            </div>
            <label className="mt-3 flex cursor-pointer select-none items-center gap-1.5 text-xs text-slate-500">
              <input
                type="checkbox"
                checked={showUnprotected}
                onChange={(e) => setShowUnprotected(e.target.checked)}
                className="accent-rose-500"
              />
              {showUnprotected ? <Eye size={13} /> : <EyeOff size={13} />}
              {t('piiShield.showUnprotectedPrefix')}
              <span className="font-medium text-rose-500">{t('piiShield.showUnprotectedEmphasis')}</span>
              {t('piiShield.showUnprotectedSuffix')}
            </label>
          </div>
        ) : (
          /* Conversation thread — what the user sees in ChatGPT */
          <div className="mx-auto max-w-3xl space-y-5 py-6">
            <div className="flex justify-end">
              <div className="max-w-[85%] whitespace-pre-wrap rounded-[1.5rem] bg-slate-100 px-4 py-2.5 text-[15px] leading-relaxed text-slate-800">
                {sentPrompt}
              </div>
            </div>

            <div className="flex justify-center">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
                  piiCount > 0
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700',
                )}
              >
                <ShieldCheck size={12} />
                {piiCount > 0
                  ? t(piiCount === 1 ? 'piiShield.badge.detectedOne' : 'piiShield.badge.detectedMany', { count: piiCount })
                  : t('piiShield.badge.none')}
              </span>
            </div>

            <div className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-white">
                <Sparkles size={14} />
              </div>
              <div className="min-w-0 flex-1 pt-1 text-[15px] leading-relaxed text-slate-800">
                {stage === 'sending' ? (
                  <span className="animate-pulse tracking-widest text-slate-400">● ● ●</span>
                ) : (
                  <HighlightedText text={result!.restored} values={result!.mapping} />
                )}
              </div>
            </div>
          </div>
        )}
      </ChatGptReplica>

      {/* ── What the Shield did (pipeline breakdown) ── */}
      {result && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-3">
            <StageCard index={1} title={t('piiShield.stage.prompt.title')} subtitle={t('piiShield.stage.prompt.subtitle')} Icon={User} tone="user" visible>
              <HighlightedText text={sentPrompt} matches={result.matches} />
              <div className="mt-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                    piiCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700',
                  )}
                >
                  <AlertTriangle size={11} />
                  {piiCount > 0
                    ? t(piiCount === 1 ? 'piiShield.badge.detectedOne' : 'piiShield.badge.detectedMany', { count: piiCount })
                    : t('piiShield.badge.none')}
                </span>
              </div>
            </StageCard>

            <StageCard index={2} title={t('piiShield.stage.anonymized.title')} subtitle={t('piiShield.stage.anonymized.subtitle')} Icon={Shield} tone="shield" visible>
              <HighlightedText text={result.masked} placeholders />
              {showUnprotected && (
                <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/60 p-2.5">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                    <AlertTriangle size={12} /> {t('piiShield.withoutShield')}
                  </div>
                  <HighlightedText text={sentPrompt} matches={result.matches} />
                </div>
              )}
            </StageCard>

            <StageCard index={3} title={t('piiShield.stage.response.title')} subtitle={t('piiShield.stage.response.subtitle')} Icon={Sparkles} tone="chatgpt" visible>
              {stage === 'sending' ? (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="animate-pulse tracking-widest">● ● ●</span> {t('piiShield.responding')}
                </div>
              ) : (
                <HighlightedText text={result.raw} placeholders />
              )}
            </StageCard>

            <StageCard index={4} title={t('piiShield.stage.restored.title')} subtitle={t('piiShield.stage.restored.subtitle')} Icon={Undo2} tone="restored" visible={stage === 'done'}>
              <HighlightedText text={result.restored} values={result.mapping} />
            </StageCard>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-semibold text-slate-800">{t('piiShield.mappingTitle')}</div>
              <MappingPanel mapping={result.mapping} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
