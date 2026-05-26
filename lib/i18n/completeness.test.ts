import { describe, it, expect } from 'vitest'
import { en } from './locales/en'
import { nb } from './locales/nb'
import { fr } from './locales/fr'

function leafPaths(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object'
      ? leafPaths(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  )
}

describe('catalog completeness', () => {
  const enKeys = leafPaths(en).sort()
  it('nb has exactly the same keys as en', () => {
    expect(leafPaths(nb as Record<string, unknown>).sort()).toEqual(enKeys)
  })
  it('fr has exactly the same keys as en', () => {
    expect(leafPaths(fr as Record<string, unknown>).sort()).toEqual(enKeys)
  })
})
