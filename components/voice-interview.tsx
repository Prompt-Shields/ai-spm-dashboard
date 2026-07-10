'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Mic,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Bot,
  Sparkles,
  Cpu,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { useT } from '@/lib/i18n/provider'
import {
  VOICE_INTERVIEW,
  type VoiceTurn,
  type VoiceExtraction,
  type AiUseCaseExtraction,
  type AgenticUseCaseExtraction,
} from '@/lib/voice-interview-data'

type Status = 'idle' | 'playing' | 'paused' | 'complete'

const BAR_COUNT = 40

// How long a turn stays "on screen"/"spoken" — scaled to text length so the
// playback feels like speech, clamped to a comfortable range.
function durationFor(turn: VoiceTurn): number {
  return Math.min(6500, Math.max(1700, 700 + turn.text.length * 38))
}

export function VoiceInterview() {
  const t = useT()
  const script = VOICE_INTERVIEW
  const { turns } = script

  const [status, setStatus] = useState<Status>('idle')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [revealed, setRevealed] = useState<string[]>([])
  const [muted, setMuted] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(true)

  const mutedRef = useRef(muted)
  mutedRef.current = muted
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const transcriptRef = useRef<HTMLDivElement | null>(null)

  // Load the browser's TTS voices (populated asynchronously in some browsers).
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSpeechSupported(false)
      return
    }
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices()
    }
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load)
      window.speechSynthesis.cancel()
    }
  }, [])

  const speak = useCallback((turn: VoiceTurn) => {
    if (mutedRef.current) return
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const u = new SpeechSynthesisUtterance(turn.text)
    u.lang = 'en-US'
    u.rate = 1.03
    u.pitch = turn.role === 'interviewer' ? 1.08 : 0.9
    const en = voicesRef.current.filter(v => v.lang.startsWith('en'))
    const pick = turn.role === 'interviewer' ? en[0] : en[1] ?? en[0]
    if (pick) u.voice = pick
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  }, [])

  // The playback loop: reveal one turn, "speak" it, then schedule the next.
  useEffect(() => {
    if (status !== 'playing') return
    const next = activeIndex + 1

    if (next >= turns.length) {
      // Hold on the final turn for its duration, then finish.
      const hold = activeIndex >= 0 ? durationFor(turns[activeIndex]) : 0
      const id = setTimeout(() => setStatus('complete'), hold)
      timeoutRef.current = id
      return () => clearTimeout(id)
    }

    const wait = activeIndex < 0 ? 500 : durationFor(turns[activeIndex])
    const id = setTimeout(() => {
      const turn = turns[next]
      setActiveIndex(next)
      if (turn.reveals) {
        setRevealed(ids => (ids.includes(turn.reveals!) ? ids : [...ids, turn.reveals!]))
      }
      speak(turn)
    }, wait)
    timeoutRef.current = id
    return () => clearTimeout(id)
  }, [status, activeIndex, turns, speak])

  // Keep the transcript scrolled to the newest line.
  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' })
  }, [activeIndex])

  const start = () => {
    if (status === 'idle' || status === 'complete') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setActiveIndex(-1)
      setRevealed([])
    }
    setStatus('playing')
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.resume()
  }

  const pause = () => {
    setStatus('paused')
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.pause()
  }

  const restart = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel()
    setActiveIndex(-1)
    setRevealed([])
    setStatus('playing')
  }

  const toggleMute = () => {
    setMuted(m => {
      const nextMuted = !m
      if (nextMuted && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      return nextMuted
    })
  }

  const speaker =
    status === 'playing' || status === 'paused' ? turns[activeIndex]?.role : undefined
  const waveActive = status === 'playing'

  const statusLabel =
    status === 'idle'
      ? t('voiceInterview.status.idle')
      : status === 'paused'
        ? t('voiceInterview.status.paused')
        : status === 'complete'
          ? t('voiceInterview.status.complete')
          : t('voiceInterview.status.interviewing')

  const speakingLabel =
    status === 'playing'
      ? speaker === 'interviewer'
        ? t('voiceInterview.speaking.interviewer')
        : t('voiceInterview.speaking.candidate')
      : status === 'complete'
        ? t('voiceInterview.status.complete')
        : t('voiceInterview.speaking.idle')

  const visibleTurns = activeIndex >= 0 ? turns.slice(0, activeIndex + 1) : []
  const revealedExtractions = useMemo(
    () => revealed.map(id => script.extractions[id]).filter(Boolean),
    [revealed, script.extractions],
  )

  const c = script.candidate

  return (
    <div>
      <style>{`@keyframes vi-wave{0%,100%{transform:scaleY(0.22)}50%{transform:scaleY(1)}}`}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 mb-2"
          >
            <ArrowLeft size={13} />
            {t('voiceInterview.backToDiscover')}
          </Link>
          <h1 className="text-xl font-bold text-slate-900">{t('voiceInterview.title')}</h1>
          <p className="text-sm text-slate-500 mt-0.5 max-w-2xl">{t('voiceInterview.subtitle')}</p>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full whitespace-nowrap">
          {t('voiceInterview.badge')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: interview stage + transcript */}
        <div className="lg:col-span-3 space-y-4">
          {/* Stage card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center text-sm font-bold">
                  {c.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{c.name}</div>
                  <div className="text-xs text-slate-500">
                    {t('voiceInterview.candidateRole', { role: c.role, department: c.department })}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                    status === 'complete'
                      ? 'bg-green-100 text-green-700'
                      : status === 'playing'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {status === 'playing' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  )}
                  {statusLabel}
                </span>
                <div className="text-[11px] text-slate-400 mt-1">
                  {t('voiceInterview.estimated', { minutes: script.estimatedMinutes })}
                </div>
              </div>
            </div>

            {/* Waveform */}
            <div className="rounded-xl bg-slate-50 border border-slate-100 py-6 px-4">
              <div className="flex items-center justify-center gap-[3px] h-16">
                {Array.from({ length: BAR_COUNT }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-[3px] rounded-full ${
                      speaker === 'candidate'
                        ? 'bg-emerald-400'
                        : speaker === 'interviewer'
                          ? 'bg-indigo-400'
                          : 'bg-slate-300'
                    }`}
                    style={{
                      height: '100%',
                      transformOrigin: 'center',
                      animation: `vi-wave ${640 + (i % 7) * 70}ms ease-in-out infinite`,
                      animationDelay: `${(i % 13) * 65}ms`,
                      animationPlayState: waveActive ? 'running' : 'paused',
                      transform: waveActive ? undefined : 'scaleY(0.22)',
                      opacity: waveActive ? 1 : 0.5,
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-500">
                {status === 'complete' ? (
                  <CheckCircle2 size={13} className="text-green-600" />
                ) : (
                  <Mic size={13} className={waveActive ? 'text-indigo-500' : 'text-slate-400'} />
                )}
                <span>{speakingLabel}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 mt-4">
              {status === 'playing' ? (
                <button
                  onClick={pause}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg"
                >
                  <Pause size={13} />
                  {t('voiceInterview.controls.pause')}
                </button>
              ) : (
                <button
                  onClick={start}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg"
                >
                  <Play size={13} />
                  {status === 'paused'
                    ? t('voiceInterview.controls.resume')
                    : t('voiceInterview.controls.start')}
                </button>
              )}
              <button
                onClick={restart}
                disabled={activeIndex < 0 && status !== 'complete'}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RotateCcw size={13} />
                {t('voiceInterview.controls.restart')}
              </button>
              <button
                onClick={toggleMute}
                className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg"
              >
                {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                {muted ? t('voiceInterview.controls.unmute') : t('voiceInterview.controls.mute')}
              </button>
            </div>
            {!speechSupported && (
              <p className="text-[11px] text-slate-400 mt-2">{t('voiceInterview.voiceUnsupported')}</p>
            )}
          </div>

          {/* Transcript */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
              {t('voiceInterview.transcript')}
            </h2>
            <div ref={transcriptRef} className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {visibleTurns.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center">
                  {t('voiceInterview.speaking.idle')}
                </p>
              )}
              {visibleTurns.map((turn, i) => (
                <div key={i}>
                  <div className={`flex gap-2 ${turn.role === 'interviewer' ? '' : 'flex-row-reverse'}`}>
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        turn.role === 'interviewer'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {turn.role === 'interviewer' ? (
                        <Bot size={13} />
                      ) : (
                        <span className="text-[9px] font-bold">{c.initials}</span>
                      )}
                    </div>
                    <div
                      className={`text-xs px-3 py-2 rounded-xl max-w-sm leading-relaxed ${
                        turn.role === 'interviewer'
                          ? 'bg-indigo-50 text-indigo-900 rounded-tl-none'
                          : 'bg-slate-100 text-slate-700 rounded-tr-none'
                      } ${i === activeIndex && status === 'playing' ? 'ring-1 ring-indigo-200' : ''}`}
                    >
                      {turn.text}
                    </div>
                  </div>
                  {turn.reveals && i <= activeIndex && (
                    <div className="mt-1.5 ml-8 inline-flex items-center gap-1.5 text-[10px] font-medium text-green-700 bg-green-50 border border-green-100 rounded-lg px-2.5 py-1">
                      <CheckCircle2 size={11} />
                      {t('voiceInterview.documented')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: documented use cases */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-800">
                {t('voiceInterview.extractionsTitle')}
              </h2>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 rounded-full w-6 h-6 flex items-center justify-center">
                {revealedExtractions.length}
              </span>
            </div>

            {revealedExtractions.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center leading-relaxed">
                {t('voiceInterview.emptyExtractions')}
              </p>
            ) : (
              <div className="space-y-3">
                {revealedExtractions.map((ex, i) => (
                  <ExtractionCard key={i} extraction={ex} />
                ))}
              </div>
            )}

            {status === 'complete' && revealedExtractions.length > 0 && (
              <Link
                href="/register"
                className="mt-4 w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-lg"
              >
                {t('voiceInterview.addToRegistry')}
                <ArrowRight size={13} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const DATA_STYLE: Record<string, string> = {
  public: 'bg-slate-100 text-slate-600',
  internal: 'bg-sky-100 text-sky-700',
  confidential: 'bg-amber-100 text-amber-700',
  restricted: 'bg-red-100 text-red-700',
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-700 font-medium text-right">{value}</span>
    </div>
  )
}

function ExtractionCard({ extraction }: { extraction: VoiceExtraction }) {
  const t = useT()
  const isAi = extraction.kind === 'ai'
  return (
    <div
      className={`rounded-xl border p-3.5 ${
        isAi ? 'border-indigo-100 bg-indigo-50/40' : 'border-violet-100 bg-violet-50/40'
      }`}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            isAi ? 'bg-indigo-100 text-indigo-600' : 'bg-violet-100 text-violet-600'
          }`}
        >
          {isAi ? <Sparkles size={14} /> : <Cpu size={14} />}
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {isAi ? t('voiceInterview.kind.ai') : t('voiceInterview.kind.agentic')}
          </div>
          <div className="text-sm font-semibold text-slate-900 leading-tight truncate">
            {extraction.name}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        {isAi ? <AiRows ex={extraction as AiUseCaseExtraction} /> : <AgenticRows ex={extraction as AgenticUseCaseExtraction} />}
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            DATA_STYLE[extraction.dataClassification]
          }`}
        >
          {extraction.dataClassification}
        </span>
        {isAi ? (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
            {(extraction as AiUseCaseExtraction).flag}
          </span>
        ) : (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
            {(extraction as AgenticUseCaseExtraction).approvalState}
          </span>
        )}
      </div>
    </div>
  )
}

function AiRows({ ex }: { ex: AiUseCaseExtraction }) {
  const t = useT()
  return (
    <>
      <Row label={t('voiceInterview.fields.tool')} value={ex.tool} />
      <Row label={t('voiceInterview.fields.model')} value={ex.model} />
      <Row label={t('voiceInterview.fields.department')} value={ex.department} />
      <Row label={t('voiceInterview.fields.owner')} value={ex.owner} />
    </>
  )
}

function AgenticRows({ ex }: { ex: AgenticUseCaseExtraction }) {
  const t = useT()
  return (
    <>
      <Row label={t('voiceInterview.fields.purpose')} value={ex.purpose} />
      <Row label={t('voiceInterview.fields.framework')} value={ex.framework} />
      <Row label={t('voiceInterview.fields.autonomy')} value={ex.autonomy} />
      <Row label={t('voiceInterview.fields.writesTo')} value={ex.writesTo} />
      <Row label={t('voiceInterview.fields.protocol')} value={ex.protocol} />
    </>
  )
}
