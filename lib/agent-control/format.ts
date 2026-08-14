// lib/agent-control/format.ts — pure display helpers (locale-agnostic numbers).
export function formatCost(usd: number): string {
  if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}k`
  return `$${usd.toFixed(0)}`
}

export function formatPct(fraction: number): string {
  return `${(fraction * 100).toFixed(1)}%`
}

export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return `${n}`
}

/** Turn "minutes ago" into a {unit, count} pair so the UI can localize the template. */
export function lastActive(minsAgo: number): { unit: 'mins' | 'hours' | 'days'; count: number } {
  if (minsAgo < 60) return { unit: 'mins', count: Math.max(1, minsAgo) }
  if (minsAgo < 60 * 24) return { unit: 'hours', count: Math.round(minsAgo / 60) }
  return { unit: 'days', count: Math.round(minsAgo / (60 * 24)) }
}
