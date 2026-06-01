import type { DailyBucket } from '@/lib/policy-engine/server/store'

interface Props {
  buckets: DailyBucket[]
  blocksLabel: string
  wouldBlockLabel: string
  emptyLabel: string
}

// Stacked daily bars: blocks (red) on top, would-block (slate) on bottom.
// Pure SVG, server-renderable. Native <title> elements give hover tooltips.
export function TimeSeriesChart({ buckets, blocksLabel, wouldBlockLabel, emptyLabel }: Props) {
  const totals = buckets.map((b) => b.blocks + b.wouldBlock)
  const max = Math.max(1, ...totals)
  const isEmpty = totals.every((t) => t === 0)

  if (isEmpty) {
    return (
      <div className="h-32 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
        {emptyLabel}
      </div>
    )
  }

  const VIEWBOX_W = 600
  const VIEWBOX_H = 140
  const PAD_X = 24
  const PAD_TOP = 8
  const PAD_BOTTOM = 22
  const innerW = VIEWBOX_W - PAD_X * 2
  const innerH = VIEWBOX_H - PAD_TOP - PAD_BOTTOM
  const slot = innerW / buckets.length
  const barW = Math.max(3, slot * 0.7)
  const barOff = (slot - barW) / 2

  // Y-axis grid lines (3 ticks: 0, mid, max).
  const ticks = [0, Math.round(max / 2), max]

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`} className="w-full h-36" role="img">
        {/* Y grid */}
        {ticks.map((t) => {
          const y = PAD_TOP + innerH - (t / max) * innerH
          return (
            <g key={t}>
              <line x1={PAD_X} x2={VIEWBOX_W - PAD_X} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="2 3" />
              <text x={PAD_X - 4} y={y + 3} textAnchor="end" className="fill-slate-400" fontSize="9">
                {t}
              </text>
            </g>
          )
        })}

        {/* Bars */}
        {buckets.map((b, i) => {
          const xBar = PAD_X + i * slot + barOff
          const total = b.blocks + b.wouldBlock
          const totalH = (total / max) * innerH
          const blocksH = (b.blocks / max) * innerH
          const wbH = (b.wouldBlock / max) * innerH
          const baseY = PAD_TOP + innerH
          const dateLabel = new Date(b.date + 'T00:00:00Z').toLocaleDateString('en', {
            month: 'short',
            day: 'numeric',
          })
          return (
            <g key={b.date}>
              {/* Would-block (bottom, slate) */}
              {wbH > 0 && (
                <rect
                  x={xBar}
                  y={baseY - wbH}
                  width={barW}
                  height={wbH}
                  fill="#cbd5e1"
                  rx={1}
                >
                  <title>
                    {dateLabel} · {b.wouldBlock} {wouldBlockLabel}
                  </title>
                </rect>
              )}
              {/* Blocks (top, red) */}
              {blocksH > 0 && (
                <rect
                  x={xBar}
                  y={baseY - totalH}
                  width={barW}
                  height={blocksH}
                  fill="#ef4444"
                  rx={1}
                >
                  <title>
                    {dateLabel} · {b.blocks} {blocksLabel}
                  </title>
                </rect>
              )}
              {/* Day-of-month label every 5 days */}
              {i % 5 === 0 && (
                <text
                  x={xBar + barW / 2}
                  y={VIEWBOX_H - 6}
                  textAnchor="middle"
                  className="fill-slate-400"
                  fontSize="9"
                >
                  {new Date(b.date + 'T00:00:00Z').getUTCDate()}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-500" /> {blocksLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" /> {wouldBlockLabel}
        </span>
      </div>
    </div>
  )
}
