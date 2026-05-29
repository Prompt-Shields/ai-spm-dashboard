'use client'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const TONES = {
  user: 'border-slate-200 bg-white',
  shield: 'border-indigo-200 bg-indigo-50/50',
  chatgpt: 'border-emerald-200 bg-emerald-50/50',
  restored: 'border-violet-200 bg-violet-50/50',
} as const

const ICON_TONES = {
  user: 'bg-slate-100 text-slate-600',
  shield: 'bg-indigo-100 text-indigo-600',
  chatgpt: 'bg-emerald-100 text-emerald-600',
  restored: 'bg-violet-100 text-violet-600',
} as const

export type StageTone = keyof typeof TONES

interface Props {
  index: number
  title: string
  subtitle?: string
  Icon: LucideIcon
  tone: StageTone
  visible: boolean
  children: ReactNode
}

export function StageCard({ index, title, subtitle, Icon, tone, visible, children }: Props) {
  if (!visible) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn('rounded-xl border shadow-sm p-4', TONES[tone])}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', ICON_TONES[tone])}>
          <Icon size={15} />
        </div>
        <div>
          <div className="text-[10px] font-semibold tracking-wide text-slate-400">STEP {index}</div>
          <div className="text-sm font-semibold text-slate-800 leading-tight">{title}</div>
        </div>
      </div>
      {subtitle && <p className="text-xs text-slate-500 mb-2">{subtitle}</p>}
      {children}
    </motion.div>
  )
}
