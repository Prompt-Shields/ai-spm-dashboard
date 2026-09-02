'use client'
// The pre-share scan, rendered identically wherever it appears: in the
// builder's preview before submitting, in the reviewer's queue, and on the
// detail drawer of an already-approved skill.
//
// Passed checks are shown, not just failures. A panel that only ever lists
// problems tells a reviewer nothing about what was actually looked at, and
// an all-clear skill deserves to show its evidence too.
import { AlertTriangle, CheckCircle2, Database, Globe, Scale, ShieldAlert, UserRound } from 'lucide-react'
import type { FindingKind, ScanReport } from '@/lib/marketplace/types'
import { scanVerdict } from '@/lib/marketplace/derive'
import { shortDate } from '@/lib/marketplace/format'
import { SEVERITY_CLASS, SEVERITY_LABEL } from './badges'

const KIND_ICON: Record<FindingKind, React.ComponentType<{ size?: number; className?: string }>> = {
  egress: Globe,
  pii: UserRound,
  dataStore: Database,
  framework: Scale,
}

export function ScanPanel({ scan, compact = false }: { scan: ScanReport; compact?: boolean }) {
  const verdict = scanVerdict(scan)
  const problems = scan.findings.filter((f) => f.severity !== 'ok').length

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-1.5 min-w-0">
          <ShieldAlert size={13} className="text-slate-400 shrink-0" />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
            Automated scan
          </span>
          {/* Never let this be mistaken for live DLP output. */}
          <span className="text-[10px] text-slate-400 border border-slate-200 rounded px-1 shrink-0">
            simulated
          </span>
        </div>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 ${SEVERITY_CLASS[verdict]}`}>
          {verdict === 'ok'
            ? 'All checks passed'
            : `${problems} finding${problems === 1 ? '' : 's'} · ${SEVERITY_LABEL[verdict].toLowerCase()}`}
        </span>
      </div>

      <ul className="divide-y divide-slate-100">
        {scan.findings.map((f, i) => {
          const Icon = KIND_ICON[f.kind]
          const pass = f.severity === 'ok'
          return (
            <li key={`${f.kind}-${i}`} className="flex items-start gap-2.5 px-3 py-2">
              {pass ? (
                <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-500" />
              ) : (
                <AlertTriangle
                  size={13}
                  className={`mt-0.5 shrink-0 ${f.severity === 'high' ? 'text-red-500' : f.severity === 'medium' ? 'text-amber-500' : 'text-slate-400'}`}
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Icon size={11} className="text-slate-400 shrink-0" />
                  <span className="text-xs font-medium text-slate-800">{f.label}</span>
                  {!pass && (
                    <span className={`text-[9px] font-medium uppercase tracking-wide px-1 py-0.5 rounded border ${SEVERITY_CLASS[f.severity]}`}>
                      {SEVERITY_LABEL[f.severity]}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5 break-words">{f.detail}</p>
              </div>
            </li>
          )
        })}
      </ul>

      {!compact && (
        <div className="px-3 py-1.5 border-t border-slate-100 text-[10px] text-slate-400">
          Scanned {shortDate(scan.scannedAt)}
        </div>
      )}
    </div>
  )
}
