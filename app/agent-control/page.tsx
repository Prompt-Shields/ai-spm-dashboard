import type { Metadata } from 'next'
import { ControlTower } from '@/components/agent-control/control-tower'

export const metadata: Metadata = {
  title: 'Agents Control Panel',
}

export default function AgentControlPage() {
  return <ControlTower />
}
