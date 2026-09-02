// lib/marketplace/scan-draft.ts
//
// The scan a builder sees *before* their skill enters the review queue.
//
// The point is to catch the obvious problems at source — a hardcoded external
// endpoint, a customer's email pasted into an example — so the human gate
// spends its time on judgement calls rather than typos. Deterministic and
// offline: same input, same findings, no model call.
//
// SIMULATED. Real pre-share checking would need static analysis of the skill
// body, egress logs and a data-store inventory. The UI labels every scan panel
// accordingly so this is never read as live DLP output.
import { detectPII } from '../pii/detector'
import type { PiiType } from '../pii/types'
import type { RiskFinding, ScanReport } from './types'

/** Hosts we already have a DPA and an allowlist entry for. */
const ALLOWED_HOSTS = [
  'sharepoint.com',
  'induver.internal',
  'guidewire.induver.internal',
  'anthropic.com',
]

const URL_RE = /https?:\/\/([a-z0-9.-]+\.[a-z]{2,})/gi

/** PII classes that make a skill body a compliance conversation, not a note. */
const SENSITIVE_PII: PiiType[] = ['SSN', 'CREDIT_CARD', 'API_KEY']

/**
 * Credential shapes a *skill body* leaks, which the shared PII detector isn't
 * looking for: its API_KEY rule stops at the first hyphen, so provider keys
 * like `sk-ant-api03-…` slip through, and bearer tokens aren't covered at all.
 * Scanned here rather than by widening lib/pii/detector.ts, which the PII
 * Shield feature depends on.
 */
const SECRET_RE =
  /\b(?:sk-[A-Za-z0-9_-]{12,}|(?:ghp|gho|github_pat)_[A-Za-z0-9_]{16,}|xox[baprs]-[A-Za-z0-9-]{10,}|(?:bearer|api[_-]?key|token)(?:\s*[:=]\s*|\s+)["']?[A-Za-z0-9_.-]{16,})/gi

function uniq<T>(xs: T[]): T[] {
  return [...new Set(xs)]
}

/** Hosts referenced by the body that aren't on the allowlist. */
export function externalHosts(body: string): string[] {
  const hosts = [...body.matchAll(URL_RE)].map((m) => m[1].toLowerCase())
  return uniq(hosts.filter((h) => !ALLOWED_HOSTS.some((a) => h === a || h.endsWith(`.${a}`))))
}

/**
 * Scan a pasted skill body. Returns the same ScanReport shape the seeded
 * catalogue uses, so the builder preview and the reviewer panel render through
 * one component.
 */
export function scanDraft(body: string, today = new Date().toISOString().slice(0, 10)): ScanReport {
  const findings: RiskFinding[] = []

  const hosts = externalHosts(body)
  findings.push(
    hosts.length > 0
      ? {
          kind: 'egress',
          severity: 'high',
          label: 'External egress',
          detail: `${hosts.join(', ')} — not on the allowlist`,
        }
      : {
          kind: 'egress',
          severity: 'ok',
          label: 'External egress',
          detail: 'No outbound calls detected',
        },
  )

  const piiTypes = uniq(detectPII(body).map((m) => m.type))
  // A hardcoded credential is a secret regardless of what the PII pass called it.
  const hasSecret = SECRET_RE.test(body)
  SECRET_RE.lastIndex = 0 // /g regex is module-scope — reset or the next call skips ahead
  const sensitive = uniq([
    ...piiTypes.filter((t) => SENSITIVE_PII.includes(t)),
    ...(hasSecret ? (['API_KEY'] as PiiType[]) : []),
  ])
  if (piiTypes.length === 0 && !hasSecret) {
    findings.push({
      kind: 'pii',
      severity: 'ok',
      label: 'PII in prompt',
      detail: 'No personal data found in the submitted body',
    })
  } else {
    findings.push({
      kind: 'pii',
      // Secrets and financial identifiers are a different conversation from a
      // name in an example — grade them apart rather than flattening to one level.
      severity: sensitive.length > 0 ? 'high' : 'medium',
      label: hasSecret ? 'Credentials in body' : 'PII in prompt',
      detail:
        sensitive.length > 0
          ? `Sensitive identifiers in the body: ${sensitive.join(', ')}`
          : `Personal data in the body: ${piiTypes.join(', ')}`,
      piiTypes: uniq([...piiTypes, ...(hasSecret ? (['API_KEY'] as PiiType[]) : [])]),
    })
  }

  // A skill that reaches an unvetted host is a processor question by default.
  if (hosts.length > 0) {
    findings.push({
      kind: 'framework',
      severity: 'medium',
      label: 'GDPR Art. 28',
      detail: 'External processor not on the register — no DPA on file',
      framework: 'gdpr',
    })
  }

  findings.push({
    kind: 'dataStore',
    severity: 'ok',
    label: 'Data store',
    detail: 'Declared on submission — confirmed by the reviewer',
  })

  return { scannedAt: today, findings }
}
