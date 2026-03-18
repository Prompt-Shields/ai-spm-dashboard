import { cn } from '@/lib/utils'
import type { Risk } from '@/lib/aimaps-types'

const SEVERITY_STYLES = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-green-100 text-green-700 border-green-200',
}

interface RiskChipProps {
  risk: Risk
  showRef?: boolean
}

export function RiskChip({ risk, showRef = true }: RiskChipProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
      SEVERITY_STYLES[risk.severity]
    )}>
      {risk.name}
      {showRef && risk.owaspRef && (
        <span className="opacity-60 font-mono text-[10px]">{risk.owaspRef}</span>
      )}
    </span>
  )
}
