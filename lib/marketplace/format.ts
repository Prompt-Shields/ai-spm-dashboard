// lib/marketplace/format.ts — display helpers for the marketplace surfaces.

/** Hours to a short label: 1.5 → "1.5h", 227.3 → "227h". */
export function hours(h: number): string {
  return h < 10 ? `${h.toFixed(1)}h` : `${Math.round(h).toLocaleString('en-GB')}h`
}

/** Euro amounts, abbreviated above 10k so KPI tiles don't wrap. */
export function money(v: number): string {
  if (v >= 10_000) return `€${Math.round(v / 1000).toLocaleString('en-GB')}k`
  return `€${Math.round(v).toLocaleString('en-GB')}`
}

/** 0..1 → "74%". */
export function percent(r: number): string {
  return `${Math.round(r * 100)}%`
}

/** Adoption rate, or an em dash when there's no denominator to divide by. */
export function rateOrDash(adopters: number, reachable: number): string {
  return reachable === 0 ? '—' : percent(adopters / reachable)
}

/** "2026-08-13" → "13 Aug 2026". */
export function shortDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
