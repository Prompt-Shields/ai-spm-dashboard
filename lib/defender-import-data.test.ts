import { describe, it, expect } from 'vitest'
import {
  DEFENDER_EXTRACTED_APPS,
  ENRICHMENTS,
  extractedAppToApplication,
} from './defender-import-data'

const NOW = '2026-07-13T00:00:00.000Z'

describe('defender import seeded data', () => {
  it('every extracted app has a matching enrichment', () => {
    for (const app of DEFENDER_EXTRACTED_APPS) {
      expect(ENRICHMENTS[app.slug], `missing enrichment for ${app.slug}`).toBeDefined()
    }
  })

  it('slugs are unique', () => {
    const slugs = DEFENDER_EXTRACTED_APPS.map(a => a.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('risk scores are within 0–100', () => {
    for (const e of Object.values(ENRICHMENTS)) {
      expect(e.riskScore).toBeGreaterThanOrEqual(0)
      expect(e.riskScore).toBeLessThanOrEqual(100)
    }
  })
})

describe('extractedAppToApplication', () => {
  const app = DEFENDER_EXTRACTED_APPS[0]
  const record = extractedAppToApplication(app, ENRICHMENTS[app.slug], NOW)

  it('produces a stable, defender-prefixed shadow id', () => {
    expect(record.id).toBe(`app-shadow-defender-${app.slug}`)
    expect(record.autoDiscoveredFromAppId).toBe(`defender-${app.slug}`)
  })

  it('is a Shadow, auto-discovered record with import tags', () => {
    expect(record.deploymentStatus).toBe('Shadow')
    expect(record.autoDiscovered).toBe(true)
    expect(record.tags).toEqual(['ai-system', 'shadow-ai', 'defender-import'])
  })

  it('carries the enrichment risk score and classification', () => {
    expect(record.riskScore).toBe(ENRICHMENTS[app.slug].riskScore)
    expect(record.dataClassification).toBe(ENRICHMENTS[app.slug].dataClassification)
  })

  it('leaves owner and department unset (Defender does not know them)', () => {
    expect(record.ownerPersonId).toBeUndefined()
    expect(record.organizationalUnitId).toBeUndefined()
  })

  it('is deterministic given the same injected timestamp', () => {
    expect(extractedAppToApplication(app, ENRICHMENTS[app.slug], NOW)).toEqual(record)
    expect(record.createdAt).toBe(NOW)
    expect(record.updatedAt).toBe(NOW)
  })
})
