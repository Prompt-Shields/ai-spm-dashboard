import type { PiiMatch, PiiType } from './types'

const NAMES = ['Sarah','John','Michael','Jessica','David','Emily','Daniel','Laura','James','Anna','Robert','Maria','William','Linda','Chen','Priya','Wei','Carlos','Fatima','Hiroshi']
const STREET = 'Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way'

function luhnValid(digits: string): boolean {
  const d = digits.replace(/[^0-9]/g, '')
  if (d.length < 13 || d.length > 19) return false
  let sum = 0, alt = false
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i])
    if (alt) { n *= 2; if (n > 9) n -= 9 }
    sum += n; alt = !alt
  }
  return sum % 10 === 0
}

interface Detector { type: PiiType; regex: RegExp; validate?: (s: string) => boolean }

// Priority order: earlier detectors win overlaps.
const DETECTORS: Detector[] = [
  { type: 'EMAIL', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
  { type: 'API_KEY', regex: /\bsk-(?:proj-)?[A-Za-z0-9]{8,}\b/g },
  { type: 'CREDIT_CARD', regex: /\b\d(?:[ -]?\d){12,18}\b/g, validate: luhnValid },
  { type: 'SSN', regex: /\b\d{3}-\d{2}-\d{4}\b/g },
  { type: 'IP', regex: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g },
  { type: 'PHONE', regex: /(?:\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g },
  { type: 'PERSON', regex: new RegExp(`\\b(?:${NAMES.join('|')})\\s+[A-Z][a-z]+\\b`, 'g') },
  { type: 'ADDRESS', regex: new RegExp(`\\b\\d{1,5}\\s+(?:[A-Z][a-z]+\\s+){1,3}(?:${STREET})\\b\\.?`, 'g') },
]

const overlaps = (a: PiiMatch, s: number, e: number) => a.start < e && s < a.end

export function detectPII(text: string): PiiMatch[] {
  const accepted: PiiMatch[] = []
  for (const d of DETECTORS) {
    for (const m of text.matchAll(d.regex)) {
      const value = m[0]
      const start = m.index ?? 0
      const end = start + value.length
      if (d.validate && !d.validate(value)) continue
      if (accepted.some((a) => overlaps(a, start, end))) continue
      accepted.push({ type: d.type, value, start, end })
    }
  }
  return accepted.sort((a, b) => a.start - b.start)
}
