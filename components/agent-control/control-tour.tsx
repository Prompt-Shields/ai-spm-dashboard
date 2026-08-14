'use client'
// Spotlight guided tour: dims the page, cuts a hole around the current target
// element (looked up by its data-tour attribute), and anchors a tooltip card
// beside it. The parent owns the step index and runs any side effects (opening
// the drawer, switching its tab) via a useEffect keyed on the step; this
// component is purely presentational and re-measures the target every frame so
// it tracks scrolling, resizing, and the drawer's open animation.
import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { useT } from '@/lib/i18n/provider'
import { cn } from '@/lib/utils'

type T = ReturnType<typeof useT>

export type TourSide = 'top' | 'bottom' | 'left' | 'center'

export interface TourStep {
  id: string
  target: string | null // data-tour value; null ⇒ centered card
  side: TourSide
}

const PAD = 8
const CARD_W = 320

interface Props {
  steps: TourStep[]
  index: number
  t: T
  onBack: () => void
  onNext: () => void
  onClose: () => void
}

export function ControlTour({ steps, index, t, onBack, onNext, onClose }: Props) {
  const step = steps[index]
  const [rect, setRect] = useState<DOMRect | null>(null)
  const raf = useRef<number | null>(null)

  // Track the target rect continuously while the tour is open.
  useEffect(() => {
    let mounted = true
    const tick = () => {
      if (!mounted) return
      if (step?.target) {
        const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`)
        if (el) el.scrollIntoView({ block: 'nearest', behavior: 'auto' })
        setRect(el ? el.getBoundingClientRect() : null)
      } else {
        setRect(null)
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      mounted = false
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [step?.target])

  // Keyboard: Esc closes, ←/→ navigate.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onNext()
      else if (e.key === 'ArrowLeft') onBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onNext, onBack])

  if (!step) return null

  const isFirst = index === 0
  const isLast = index === steps.length - 1
  const centered = !rect || step.side === 'center'

  // Compute the tooltip position from the target rect.
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

  let cardStyle: React.CSSProperties = {}
  let cardTranslate = ''
  if (!centered && rect) {
    if (step.side === 'bottom') {
      cardStyle = { top: rect.bottom + 12, left: clamp(rect.left, 12, vw - CARD_W - 12) }
    } else if (step.side === 'top') {
      cardStyle = { top: rect.top - 12, left: clamp(rect.left, 12, vw - CARD_W - 12) }
      cardTranslate = '-translate-y-full'
    } else {
      // left of the target (used for the right-hand drawer)
      cardStyle = { top: clamp(rect.top, 12, vh - 220), left: rect.left - 12 }
      cardTranslate = '-translate-x-full'
    }
  }

  return (
    <div className="fixed inset-0 z-[70]">
      {/* Interaction blocker (transparent). Clicking the dim does nothing so a
          stray click can't derail the tour. */}
      <div className="absolute inset-0" />

      {/* Spotlight cutout with a dim ring via a giant box-shadow. */}
      {rect && step.side !== 'center' && (
        <div
          className="pointer-events-none absolute rounded-xl transition-all duration-200"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: '0 0 0 9999px rgba(15,23,42,0.55), 0 0 0 2px rgb(99 102 241)',
          }}
        />
      )}
      {/* Full dim when there's no target (centered welcome/finish). */}
      {centered && <div className="absolute inset-0 bg-slate-900/55" />}

      {/* Tooltip card */}
      <div
        className={cn(
          'absolute w-80 max-w-[calc(100vw-24px)] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-indigo-200/50',
          cardTranslate,
          centered && 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
        )}
        style={centered ? undefined : cardStyle}
      >
        {/* Progress dots + close */}
        <div className="mb-3 flex items-center gap-1.5">
          {steps.map((s, i) => (
            <span
              key={s.id}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                i < index ? 'bg-indigo-500' : i === index ? 'bg-indigo-400' : 'bg-slate-100',
              )}
            />
          ))}
          <button onClick={onClose} aria-label={t('agentControl.tour.skip')} className="ml-1.5 text-slate-400 hover:text-slate-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-500">
          {t('agentControl.tour.progress', { current: index + 1, total: steps.length })}
        </div>
        <h3 className="text-sm font-bold text-slate-900">{t(`agentControl.tour.steps.${step.id}.title`)}</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">{t(`agentControl.tour.steps.${step.id}.body`)}</p>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-medium text-slate-400 hover:text-slate-600"
          >
            {t('agentControl.tour.skip')}
          </button>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={onBack}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                {t('agentControl.tour.back')}
              </button>
            )}
            <button
              onClick={onNext}
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              {isLast ? t('agentControl.tour.done') : t('agentControl.tour.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
