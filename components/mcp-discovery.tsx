'use client'
// MCP Server Discovery — /discover/mcp (see docs/superpowers/specs/2026-07-13-
// mcp-server-discovery-design.md). Replays a simulated endpoint scan from
// SCAN_SOURCES, then renders the seeded MCP server inventory with transport,
// auth, publisher, permissions and risk flags.
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Waypoints,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useT } from '@/lib/i18n/provider'
import {
  MCP_SERVERS,
  MCP_SUMMARY,
  SCAN_SOURCES,
  serverRiskLevel,
  type McpServer,
  type RiskSeverity,
} from '@/lib/mcp-discovery-data'

type Phase = 'idle' | 'scanning' | 'complete'

const RISK_VARIANT: Record<RiskSeverity, 'destructive' | 'warning' | 'success'> = {
  high: 'destructive',
  medium: 'warning',
  low: 'success',
}

const TRANSPORT_LABEL: Record<McpServer['transport'], string> = {
  stdio: 'stdio',
  http: 'HTTP',
  sse: 'SSE',
}

export function McpDiscovery() {
  const t = useT()
  const [phase, setPhase] = useState<Phase>('idle')
  // Index of the source currently being scanned; sources before it are done.
  const [sourceIndex, setSourceIndex] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    },
    [],
  )

  const startScan = () => {
    setPhase('scanning')
    setSourceIndex(0)
    const step = (i: number) => {
      timeoutRef.current = setTimeout(() => {
        if (i + 1 >= SCAN_SOURCES.length) {
          setPhase('complete')
        } else {
          setSourceIndex(i + 1)
          step(i + 1)
        }
      }, SCAN_SOURCES[i].durationMs)
    }
    step(0)
  }

  const skip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setPhase('complete')
  }

  const foundSoFar = SCAN_SOURCES.slice(0, sourceIndex).reduce((s, src) => s + src.found, 0)

  return (
    <div>
      {/* Header */}
      <Link
        href="/discover"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 mb-4"
      >
        <ArrowLeft size={14} />
        {t('mcpDiscovery.backToDiscover')}
      </Link>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
          <Waypoints size={16} />
        </div>
        <h1 className="text-xl font-bold text-slate-900">{t('mcpDiscovery.title')}</h1>
        <span className="text-[10px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full">
          {t('mcpDiscovery.badge')}
        </span>
      </div>
      <p className="text-sm text-slate-500 mb-6 max-w-2xl">{t('mcpDiscovery.subtitle')}</p>

      {/* Scan card */}
      {phase !== 'complete' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-1">{t('mcpDiscovery.scan.heading')}</h2>
          <p className="text-xs text-slate-500 mb-4 max-w-xl">{t('mcpDiscovery.scan.description')}</p>

          {phase === 'idle' ? (
            <button
              onClick={startScan}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors"
            >
              {t('mcpDiscovery.scan.start')}
            </button>
          ) : (
            <div>
              <div className="space-y-2.5 mb-4">
                {SCAN_SOURCES.map((src, i) => {
                  const done = i < sourceIndex
                  const active = i === sourceIndex
                  return (
                    <div key={src.id} className="flex items-center gap-2.5 text-sm">
                      {done ? (
                        <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                      ) : active ? (
                        <Loader2 size={15} className="text-rose-500 animate-spin flex-shrink-0" />
                      ) : (
                        <span className="w-[15px] h-[15px] rounded-full border border-slate-200 flex-shrink-0" />
                      )}
                      <span className={done || active ? 'text-slate-800' : 'text-slate-400'}>{src.label}</span>
                      <span className="text-xs text-slate-400 flex-1 truncate">{src.detail}</span>
                      {done && (
                        <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                          {t('mcpDiscovery.scan.found', { count: src.found })}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {t('mcpDiscovery.scan.found', { count: foundSoFar })}
                </span>
                <button onClick={skip} className="text-xs font-medium text-slate-500 hover:text-slate-800">
                  {t('mcpDiscovery.scan.skip')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {phase === 'complete' && (
        <div>
          {/* Summary strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { label: t('mcpDiscovery.summary.totalServers'), value: MCP_SUMMARY.totalServers, color: 'text-slate-900' },
              { label: t('mcpDiscovery.summary.endpointsWithMcp'), value: MCP_SUMMARY.endpointsWithMcp, color: 'text-indigo-600' },
              { label: t('mcpDiscovery.summary.unsanctioned'), value: MCP_SUMMARY.unsanctioned, color: 'text-amber-600' },
              { label: t('mcpDiscovery.summary.highRisk'), value: MCP_SUMMARY.highRisk, color: 'text-red-500' },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Inventory */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h2 className="text-sm font-bold text-slate-900">{t('mcpDiscovery.table.heading')}</h2>
              <button
                onClick={startScan}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                <RotateCcw size={12} />
                {t('mcpDiscovery.scan.rescan')}
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-2 font-medium">{t('mcpDiscovery.table.server')}</th>
                  <th className="px-4 py-2 font-medium">{t('mcpDiscovery.table.clients')}</th>
                  <th className="px-4 py-2 font-medium">{t('mcpDiscovery.table.transport')}</th>
                  <th className="px-4 py-2 font-medium">{t('mcpDiscovery.table.auth')}</th>
                  <th className="px-4 py-2 font-medium">{t('mcpDiscovery.table.publisher')}</th>
                  <th className="px-4 py-2 font-medium text-right">{t('mcpDiscovery.table.endpoints')}</th>
                  <th className="px-4 py-2 font-medium">{t('mcpDiscovery.table.risk')}</th>
                </tr>
              </thead>
              <tbody>
                {MCP_SERVERS.map((server) => {
                  const risk = serverRiskLevel(server)
                  const expanded = expandedId === server.id
                  return (
                    <ServerRows
                      key={server.id}
                      server={server}
                      risk={risk}
                      expanded={expanded}
                      onToggle={() => setExpandedId(expanded ? null : server.id)}
                    />
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function ServerRows({
  server,
  risk,
  expanded,
  onToggle,
}: {
  server: McpServer
  risk: RiskSeverity
  expanded: boolean
  onToggle: () => void
}) {
  const t = useT()
  const authLabel =
    server.auth === 'api-key' ? t('mcpDiscovery.auth.apiKey') : t(`mcpDiscovery.auth.${server.auth}`)
  return (
    <>
      <tr onClick={onToggle} className="border-t border-slate-100 cursor-pointer hover:bg-slate-50">
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            {expanded ? (
              <ChevronDown size={13} className="text-slate-400 flex-shrink-0" />
            ) : (
              <ChevronRight size={13} className="text-slate-400 flex-shrink-0" />
            )}
            <div>
              <div className="font-medium text-slate-800">{server.name}</div>
              <div className="text-[11px] text-slate-400 font-mono">{server.source}</div>
            </div>
          </div>
        </td>
        <td className="px-4 py-2.5 text-xs text-slate-600">{server.clients.join(', ')}</td>
        <td className="px-4 py-2.5 text-xs text-slate-600">{TRANSPORT_LABEL[server.transport]}</td>
        <td className="px-4 py-2.5 text-xs text-slate-600">{authLabel}</td>
        <td className="px-4 py-2.5 text-xs text-slate-600">
          {t(`mcpDiscovery.publisher.${server.publisher}`)}
        </td>
        <td className="px-4 py-2.5 text-right tabular-nums text-slate-800">{server.endpoints}</td>
        <td className="px-4 py-2.5">
          <Badge variant={RISK_VARIANT[risk]}>{t(`mcpDiscovery.risk.${risk}`)}</Badge>
        </td>
      </tr>
      {expanded && (
        <tr className="border-t border-slate-100 bg-slate-50/60">
          <td colSpan={7} className="px-4 py-3">
            <div className="grid md:grid-cols-2 gap-4 pl-5">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-400 mb-1.5">
                  {t('mcpDiscovery.detail.permissions')}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {server.permissions.map((p) => (
                    <span key={p} className="text-xs bg-white border border-slate-200 rounded-full px-2.5 py-0.5 text-slate-600">
                      {p}
                    </span>
                  ))}
                  <Badge variant={server.sanctioned ? 'success' : 'warning'}>
                    {server.sanctioned
                      ? t('mcpDiscovery.detail.sanctioned')
                      : t('mcpDiscovery.detail.unsanctioned')}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-400 mb-1.5">
                  {t('mcpDiscovery.detail.riskFlags')}
                </div>
                {server.riskFlags.length === 0 ? (
                  <div className="text-xs text-slate-400">{t('mcpDiscovery.detail.noFlags')}</div>
                ) : (
                  <ul className="space-y-1">
                    {server.riskFlags.map((f) => (
                      <li key={f.label} className="flex items-center gap-1.5 text-xs text-slate-700">
                        <ShieldAlert
                          size={13}
                          className={
                            f.severity === 'high'
                              ? 'text-red-500'
                              : f.severity === 'medium'
                                ? 'text-amber-500'
                                : 'text-slate-400'
                          }
                        />
                        {f.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
