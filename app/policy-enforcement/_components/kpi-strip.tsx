import { ShieldCheck, Eye, Layers, Ban, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { TFunc } from '@/lib/i18n/translate'
import type { DashboardSnapshot } from '@/lib/policy-engine/server/store'
import { aiSpmAssets } from '@/lib/mock-data'

interface Props {
  snapshot: DashboardSnapshot
  promotionsReady: number
  t: TFunc
}

export function KpiStrip({ snapshot, promotionsReady, t }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <Tile
        Icon={ShieldCheck}
        iconClass="text-red-600 bg-red-50"
        label={t('policyEnforcement.dashboard.kpi.strict')}
        value={snapshot.strictCount}
      />
      <Tile
        Icon={Eye}
        iconClass="text-slate-600 bg-slate-100"
        label={t('policyEnforcement.dashboard.kpi.guideline')}
        value={snapshot.guidelineCount}
      />
      <Tile
        Icon={Layers}
        iconClass="text-indigo-600 bg-indigo-50"
        label={t('policyEnforcement.dashboard.kpi.coverage')}
        value={`${snapshot.coveragePercent}%`}
        sub={t('policyEnforcement.dashboard.kpi.ofApps', { count: aiSpmAssets.length })}
      />
      <Tile
        Icon={Ban}
        iconClass="text-rose-600 bg-rose-50"
        label={t('policyEnforcement.dashboard.kpi.blocks30d')}
        value={snapshot.totalBlocks30d.toLocaleString()}
        trend={snapshot.blocksTrendPercent}
        trendLabel={t('policyEnforcement.dashboard.kpi.delta', {
          value: `${snapshot.blocksTrendPercent > 0 ? '+' : ''}${snapshot.blocksTrendPercent}%`,
        })}
      />
      <Tile
        Icon={ArrowUpRight}
        iconClass="text-emerald-600 bg-emerald-50"
        label={t('policyEnforcement.dashboard.kpi.promotionsReady')}
        value={promotionsReady}
      />
    </div>
  )
}

interface TileProps {
  Icon: LucideIcon
  iconClass: string
  label: string
  value: string | number
  sub?: string
  trend?: number
  trendLabel?: string
}
function Tile({ Icon, iconClass, label, value, sub, trend, trendLabel }: TileProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconClass}`}>
          <Icon size={14} />
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 truncate">{label}</div>
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">{value}</div>
      {(sub || trendLabel) && (
        <div className="flex items-center gap-1 mt-0.5 text-[11px] text-slate-500">
          {trend !== undefined && trendLabel && (
            <span
              className={
                trend > 0 ? 'text-rose-600 flex items-center gap-0.5' : 'text-emerald-600 flex items-center gap-0.5'
              }
            >
              {trend > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {trendLabel}
            </span>
          )}
          {sub && <span>{sub}</span>}
        </div>
      )}
    </div>
  )
}
