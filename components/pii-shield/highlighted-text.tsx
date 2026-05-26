'use client'
import type { ReactNode } from 'react'
import type { MappingEntry, PiiMatch, PiiType } from '@/lib/pii/types'
import { cn } from '@/lib/utils'

const TYPE_STYLES: Record<PiiType, string> = {
  EMAIL: 'bg-blue-100 text-blue-700 border-blue-200',
  PHONE: 'bg-amber-100 text-amber-700 border-amber-200',
  SSN: 'bg-red-100 text-red-700 border-red-200',
  CREDIT_CARD: 'bg-rose-100 text-rose-700 border-rose-200',
  IP: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  API_KEY: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  PERSON: 'bg-violet-100 text-violet-700 border-violet-200',
  ADDRESS: 'bg-teal-100 text-teal-700 border-teal-200',
}

export const PII_TYPE_LABEL: Record<PiiType, string> = {
  EMAIL: 'email', PHONE: 'phone', SSN: 'SSN', CREDIT_CARD: 'card',
  IP: 'IP', API_KEY: 'API key', PERSON: 'name', ADDRESS: 'address',
}

function Chip({ type, mono, children }: { type: PiiType; mono?: boolean; children: ReactNode }) {
  return (
    <span className={cn('rounded px-1 py-0.5 border font-medium', mono && 'font-mono text-[0.85em]', TYPE_STYLES[type])}>
      {children}
    </span>
  )
}

const Wrap = ({ children }: { children: ReactNode }) => (
  <p className="whitespace-pre-wrap leading-relaxed text-sm text-slate-700">{children}</p>
)

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

interface Props {
  text: string
  /** span-based highlighting (used on the original prompt) */
  matches?: PiiMatch[]
  /** highlight `[TYPE_n]` placeholder tokens (anonymized prompt / raw response) */
  placeholders?: boolean
  /** value-based highlighting (used on the restored response) */
  values?: MappingEntry[]
}

export function HighlightedText({ text, matches, placeholders, values }: Props) {
  if (placeholders) {
    const parts: ReactNode[] = []
    let last = 0
    let i = 0
    for (const m of text.matchAll(/\[([A-Z_]+)_\d+\]/g)) {
      const idx = m.index ?? 0
      if (idx > last) parts.push(text.slice(last, idx))
      const type = (m[1] in TYPE_STYLES ? m[1] : 'PERSON') as PiiType
      parts.push(<Chip key={i++} type={type} mono>{m[0]}</Chip>)
      last = idx + m[0].length
    }
    if (last < text.length) parts.push(text.slice(last))
    return <Wrap>{parts}</Wrap>
  }

  if (values && values.length > 0) {
    const sorted = [...values].sort((a, b) => b.value.length - a.value.length)
    const typeByValue = new Map(sorted.map((e) => [e.value, e.type]))
    const re = new RegExp(`(${sorted.map((e) => escapeRe(e.value)).join('|')})`, 'g')
    const parts: ReactNode[] = []
    let last = 0
    let i = 0
    for (const m of text.matchAll(re)) {
      const idx = m.index ?? 0
      if (idx > last) parts.push(text.slice(last, idx))
      parts.push(<Chip key={i++} type={typeByValue.get(m[0]) ?? 'PERSON'}>{m[0]}</Chip>)
      last = idx + m[0].length
    }
    if (last < text.length) parts.push(text.slice(last))
    return <Wrap>{parts}</Wrap>
  }

  const ms = (matches ?? []).slice().sort((a, b) => a.start - b.start)
  const parts: ReactNode[] = []
  let last = 0
  ms.forEach((mm, idx) => {
    if (mm.start > last) parts.push(text.slice(last, mm.start))
    parts.push(<Chip key={idx} type={mm.type}>{text.slice(mm.start, mm.end)}</Chip>)
    last = mm.end
  })
  if (last < text.length) parts.push(text.slice(last))
  return <Wrap>{parts}</Wrap>
}
