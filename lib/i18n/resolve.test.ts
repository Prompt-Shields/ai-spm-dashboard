import { describe, it, expect } from 'vitest'
import { resolveLocale } from './resolve'

describe('resolveLocale', () => {
  it('prefers a valid cookie above everything', () => {
    expect(resolveLocale({ cookie: 'fr', country: 'NO', acceptLanguage: 'en' })).toBe('fr')
  })
  it('maps country when no cookie', () => {
    expect(resolveLocale({ country: 'NO' })).toBe('nb')
    expect(resolveLocale({ country: 'FR' })).toBe('fr')
  })
  it('ignores unmapped country and uses Accept-Language', () => {
    expect(resolveLocale({ country: 'US', acceptLanguage: 'fr-FR,fr;q=0.9' })).toBe('fr')
  })
  it('defaults to en', () => {
    expect(resolveLocale({})).toBe('en')
    expect(resolveLocale({ cookie: 'xx', country: 'US' })).toBe('en')
  })
})
