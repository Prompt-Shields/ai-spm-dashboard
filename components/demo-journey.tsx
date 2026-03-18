'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

const STEPS = [
  {
    step: 1,
    route: '/',
    title: 'Your org has no AI map yet',
    body: 'You\'re starting from zero — like every CISO does. Let\'s find out what AI your organisation is actually using.',
    cta: 'Launch Discovery Agent →',
    duration: 30,
    final: false,
  },
  {
    step: 2,
    route: '/discover',
    title: 'AI Agent is interviewing your employees',
    body: 'Agents are reaching out across Slack and email. Watch as they extract use cases from natural conversations — no forms, no surveys.',
    cta: 'See the map populate →',
    duration: 90,
    final: false,
  },
  {
    step: 3,
    route: '/',
    title: '47 use cases mapped. 12 critical risks identified.',
    body: 'All from agent conversations. No manual entry. Click any node to explore the full risk picture for that use case.',
    cta: 'Assign ownership →',
    duration: 60,
    final: false,
  },
  {
    step: 4,
    route: '/owners',
    title: 'Owners identified and notified',
    body: 'AI suggested owners based on who reported each use case. One click to confirm. Agents automatically send each owner their risk assessment tasks.',
    cta: 'See compliance coverage →',
    duration: 45,
    final: false,
  },
  {
    step: 5,
    route: '/comply',
    title: 'From 0% to 73% EU AI Act coverage — this session.',
    body: 'Every use case is mapped to the frameworks that matter. Gaps are visible. Remediations are one click away. Your AI is now governed.',
    cta: 'Finish demo',
    duration: 45,
    final: true,
  },
]

interface DemoJourneyProps {
  onClose: () => void
}

export function DemoJourney({ onClose }: DemoJourneyProps) {
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
          Step {step.step} of {STEPS.length} · ~{step.duration}s
        </div>

        {/* Content */}
        <h3 className="text-sm font-bold text-slate-900 mb-1">{step.title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">{step.body}</p>

        {/* CTA */}
        <button
          onClick={handleNext}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          {step.cta}
        </button>
      </div>
    </div>
  )
}
