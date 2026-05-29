type Dict = Record<string, unknown>

function lookup(obj: Dict, path: string): string | undefined {
  const val = path
    .split('.')
    .reduce<unknown>((acc, k) => (acc && typeof acc === 'object' ? (acc as Dict)[k] : undefined), obj)
  return typeof val === 'string' ? val : undefined
}

function interpolate(s: string, vars?: Record<string, string | number>): string {
  if (!vars) return s
  return s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`))
}

export type TFunc = (path: string, vars?: Record<string, string | number>) => string

// `messages` is the active locale; `fallback` is always the en catalog.
export function createT(messages: Dict, fallback: Dict): TFunc {
  return (path, vars) => {
    const hit = lookup(messages, path) ?? lookup(fallback, path) ?? path
    return interpolate(hit, vars)
  }
}
