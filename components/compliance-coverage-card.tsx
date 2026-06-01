interface FrameworkCoverage {
  name: string
  percentage: number
  gapCount: number
  color: string
}

interface ComplianceCoverageCardProps {
  framework: FrameworkCoverage
  gapsLabel: string
}

export function ComplianceCoverageCard({ framework, gapsLabel }: ComplianceCoverageCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-800">{framework.name}</span>
        <span className="text-lg font-bold" style={{ color: framework.color }}>
          {framework.percentage}%
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${framework.percentage}%`, backgroundColor: framework.color }}
        />
      </div>
      <div className="text-xs text-slate-500">
        {gapsLabel}
      </div>
    </div>
  )
}
