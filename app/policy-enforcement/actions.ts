'use server'
import { revalidatePath } from 'next/cache'
import { getInstanceById, upsertInstance } from '@/lib/policy-engine/server/store'
import { classOf } from '@/lib/policy-templates/types'
import type { EnforcementMode } from '@/lib/policy-templates/types'

// Pragmatic mode picks. A full implementation would pull the template's
// preferred strict/guideline modes; for now we lock to block/log which
// covers every seeded policy and is correct semantically.
const STRICT_MODE: EnforcementMode = 'block'
const GUIDELINE_MODE: EnforcementMode = 'log'

interface ActionResult {
  ok: boolean
  error?: string
}

export async function promotePolicy(id: string): Promise<ActionResult> {
  const instance = getInstanceById(id)
  if (!instance) return { ok: false, error: 'not-found' }
  if (classOf(instance.enforcementMode) === 'strict') return { ok: false, error: 'already-strict' }

  const now = new Date().toISOString()
  upsertInstance({
    ...instance,
    enforcementMode: STRICT_MODE,
    updatedAt: now,
    activatedAt: instance.activatedAt ?? now,
    promotionHistory: [
      ...instance.promotionHistory,
      { from: 'guideline', to: 'strict', at: now, by: 'demo-user', reason: 'Manual promotion from dashboard' },
    ],
  })
  revalidatePath('/policy-enforcement')
  return { ok: true }
}

export async function demotePolicy(id: string, reason?: string): Promise<ActionResult> {
  const instance = getInstanceById(id)
  if (!instance) return { ok: false, error: 'not-found' }
  if (classOf(instance.enforcementMode) === 'guideline') return { ok: false, error: 'already-guideline' }

  const now = new Date().toISOString()
  upsertInstance({
    ...instance,
    enforcementMode: GUIDELINE_MODE,
    updatedAt: now,
    promotionHistory: [
      ...instance.promotionHistory,
      { from: 'strict', to: 'guideline', at: now, by: 'demo-user', reason: reason ?? 'Manual demotion from dashboard' },
    ],
  })
  revalidatePath('/policy-enforcement')
  return { ok: true }
}

export async function pausePolicy(id: string): Promise<ActionResult> {
  const instance = getInstanceById(id)
  if (!instance) return { ok: false, error: 'not-found' }
  if (instance.status === 'paused') return { ok: false, error: 'already-paused' }
  upsertInstance({ ...instance, status: 'paused', updatedAt: new Date().toISOString() })
  revalidatePath('/policy-enforcement')
  return { ok: true }
}

export async function resumePolicy(id: string): Promise<ActionResult> {
  const instance = getInstanceById(id)
  if (!instance) return { ok: false, error: 'not-found' }
  if (instance.status === 'active') return { ok: false, error: 'already-active' }
  upsertInstance({ ...instance, status: 'active', updatedAt: new Date().toISOString() })
  revalidatePath('/policy-enforcement')
  return { ok: true }
}
