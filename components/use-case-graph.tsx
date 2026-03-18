'use client'
import dynamic from 'next/dynamic'
import { useMemo, useCallback } from 'react'
import type { UseCase, Person } from '@/lib/aimaps-types'

// Dynamic import to avoid SSR issues with canvas
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

interface GraphNode {
  id: string
  label: string
  type: 'usecase' | 'model' | 'owner' | 'risk' | 'mitigation'
  severity?: string
  val: number
  color: string
  data?: UseCase
  x?: number
  y?: number
}

interface GraphLink {
  source: string
  target: string
  type: 'uses' | 'owned-by' | 'has-risk' | 'has-mitigation'
  color: string
}

const NODE_COLORS = {
  usecase: '#6366f1',
  model: '#0ea5e9',
  owner: '#f59e0b',
  risk: '#ef4444',
  mitigation: '#22c55e',
}

interface UseCaseGraphProps {
  useCases: UseCase[]
  persons: Person[]
  filterDept?: string
  filterSeverity?: string
  onSelectUseCase: (uc: UseCase) => void
}

export function UseCaseGraph({ useCases, persons, filterDept, filterSeverity, onSelectUseCase }: UseCaseGraphProps) {
  const filtered = useMemo(() =>
    useCases.filter(uc =>
      (!filterDept || filterDept === 'all' || uc.department === filterDept) &&
      (!filterSeverity || filterSeverity === 'all' || uc.risks.some(r => r.severity === filterSeverity))
    ), [useCases, filterDept, filterSeverity])

  const { nodes, links } = useMemo(() => {
    const nodes: GraphNode[] = []
    const links: GraphLink[] = []
    const seenModels = new Set<string>()
    const seenOwners = new Set<string>()

    filtered.forEach(uc => {
      nodes.push({ id: uc.id, label: uc.name, type: 'usecase', val: 8 + uc.risks.length * 2, color: NODE_COLORS.usecase, data: uc })

      uc.models.forEach(m => {
        if (!seenModels.has(m.id)) {
          nodes.push({ id: m.id, label: m.name, type: 'model', val: 5, color: NODE_COLORS.model })
          seenModels.add(m.id)
        }
        links.push({ source: uc.id, target: m.id, type: 'uses', color: '#93c5fd' })
      })

      if (uc.ownerId) {
        const owner = persons.find(p => p.id === uc.ownerId)
        if (owner) {
          if (!seenOwners.has(owner.id)) {
            nodes.push({ id: owner.id, label: owner.name, type: 'owner', val: 5, color: NODE_COLORS.owner })
            seenOwners.add(owner.id)
          }
          links.push({ source: uc.id, target: owner.id, type: 'owned-by', color: '#fcd34d' })
        }
      }

      uc.risks.slice(0, 2).forEach(risk => {
        const riskNodeId = `${uc.id}-${risk.id}`
        nodes.push({ id: riskNodeId, label: risk.name, type: 'risk', severity: risk.severity, val: 4, color: NODE_COLORS.risk })
        links.push({ source: uc.id, target: riskNodeId, type: 'has-risk', color: '#fca5a5' })
      })
    })

    return { nodes, links }
  }, [filtered, persons])

  const handleNodeClick = useCallback((node: object) => {
    const graphNode = node as GraphNode
    if (graphNode.type === 'usecase' && graphNode.data) {
      onSelectUseCase(graphNode.data)
    }
  }, [onSelectUseCase])

  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-white border border-slate-200">
      <ForceGraph2D
        graphData={{ nodes, links } as never}
        nodeLabel="label"
        nodeColor={(n: object) => (n as GraphNode).color}
        nodeVal={(n: object) => (n as GraphNode).val}
        linkColor={(l: object) => (l as GraphLink).color}
        linkWidth={1.5}
        onNodeClick={handleNodeClick}
        backgroundColor="#ffffff"
        nodeCanvasObject={(node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const n = node as GraphNode
          const label = n.label
          const fontSize = Math.max(10 / globalScale, 3)
          ctx.font = `${fontSize}px Sans-Serif`
          ctx.fillStyle = n.color
          ctx.beginPath()
          ctx.arc(n.x ?? 0, n.y ?? 0, n.val / 2, 0, 2 * Math.PI)
          ctx.fill()
          if (globalScale > 0.8) {
            ctx.fillStyle = '#1e293b'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.fillText(label.length > 15 ? label.substring(0, 14) + '…' : label, n.x ?? 0, (n.y ?? 0) + n.val / 2 + 2)
          }
        }}
      />
    </div>
  )
}
