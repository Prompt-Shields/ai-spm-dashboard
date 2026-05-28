'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { useT } from '@/lib/i18n/provider'

const STEPS = [
  { step: 1, id: 's1', route: '/',         duration: 30, final: false },
  { step: 2, id: 's2', route: '/discover', duration: 90, final: false },
  { step: 3, id: 's3', route: '/',         duration: 60, final: false },
  { step: 4, id: 's4', route: '/owners',   duration: 45, final: false },
  { step: 5, id: 's5', route: '/comply',   duration: 45, final: true  },
]

interface DemoJourneyProps {
  onClose: () => void
}

export function DemoJourney({ onClose }: DemoJourneyProps) {
  const t = useT()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const step = STEPS[currentStep]

  useEffect(() => {
    router.push(step.route)
  }, [currentStep, step.route, router])

  const handleNext = () => {
    if (step.final) {
      onClose()
      return
    }
    setCurrentStep(s => s + 1)
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-indigo-100 p-5">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-4">
          {STEPS.map((s, i) => (
            <div
              key={s.step}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i < currentStep ? 'bg-indigo-500' : i === currentStep ? 'bg-indigo-300' : 'bg-slate-100'
              }`}
            />
          ))}
          <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600"><X size={14} /></button>
        </div>

        {/* Step label */}
        <div className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">
          {t('demoJourney.progress', { current: step.step, total: STEPS.length, duration: step.duration })}
        </div>

        {/* Content */}
        <h3 className="text-sm font-bold text-slate-900 mb-1">{t(`demoJourney.steps.${step.id}.title`)}</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">{t(`demoJourney.steps.${step.id}.body`)}</p>

        {/* CTA */}
        <button
          onClick={handleNext}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          {t(`demoJourney.steps.${step.id}.cta`)}
        </button>
      </div>
    </div>
  )
}
