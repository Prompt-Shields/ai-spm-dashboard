import type { AnonymizeResult, MappingEntry, PiiMatch } from './types'

export function anonymize(text: string, matches: PiiMatch[]): AnonymizeResult {
  const counters: Partial<Record<string, number>> = {}
  const byKey = new Map<string, string>()
  const mapping: MappingEntry[] = []
  for (const m of matches) {
    const key = `${m.type}|${m.value}`
    if (!byKey.has(key)) {
      counters[m.type] = (counters[m.type] ?? 0) + 1
      const placeholder = `[${m.type}_${counters[m.type]}]`
      byKey.set(key, placeholder)
      mapping.push({ placeholder, value: m.value, type: m.type })
    }
  }
  let masked = text
  for (const m of [...matches].sort((a, b) => b.start - a.start)) {
    const ph = byKey.get(`${m.type}|${m.value}`)!
    masked = masked.slice(0, m.start) + ph + masked.slice(m.end)
  }
  return { masked, mapping }
}

export function deanonymize(text: string, mapping: MappingEntry[]): string {
  let out = text
  for (const e of [...mapping].sort((a, b) => b.placeholder.length - a.placeholder.length)) {
    out = out.split(e.placeholder).join(e.value)
  }
  return out
}
