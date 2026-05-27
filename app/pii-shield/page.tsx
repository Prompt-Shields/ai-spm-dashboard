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
import { useT } from '@/lib/i18n/provider'

interface Result {
  matches: PiiMatch[]
  masked: string
  mapping: MappingEntry[]
  raw: string
  restored: string
}

const SEND_DELAY_MS = 900

export default function PiiShieldPage() {
  const t = useT()
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
          <Shield className="text-indigo-600" size={22} /> {t('piiShield.title')}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          {t('piiShield.intro')}
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400">{t('piiShield.tryExample')}</span>
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
          placeholder={t('piiShield.inputPlaceholder')}
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
            {t('piiShield.showUnprotectedPrefix')}
            <span className="font-medium text-rose-500">{t('piiShield.showUnprotectedEmphasis')}</span>
            {t('piiShield.showUnprotectedSuffix')}
          </label>
          <button
            onClick={runShield}
            disabled={!input.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors enabled:hover:bg-indigo-700 disabled:opacity-40"
          >
            <Send size={14} /> {t('piiShield.send')}
          </button>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-3">
            <StageCard index={1} title={t('piiShield.stage.prompt.title')} subtitle={t('piiShield.stage.prompt.subtitle')} Icon={User} tone="user" visible>
              <HighlightedText text={input.trim()} matches={result.matches} />
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
                  <HighlightedText text={input.trim()} matches={result.matches} />
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
