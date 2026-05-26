import { describe, it, expect } from 'vitest'
import { detectPII } from './detector'

describe('detectPII', () => {
  it('detects email', () => {
    const m = detectPII('reach me at sarah.chen@acme.com please')
    expect(m).toContainEqual(expect.objectContaining({ type: 'EMAIL', value: 'sarah.chen@acme.com' }))
  })
  it('detects a Luhn-valid credit card and ignores invalid digit runs', () => {
    const ok = detectPII('card 4111 1111 1111 1111 here')
    expect(ok.some(x => x.type === 'CREDIT_CARD' && x.value === '4111 1111 1111 1111')).toBe(true)
    const bad = detectPII('order number 1234 5678 1234 5678')
    expect(bad.some(x => x.type === 'CREDIT_CARD')).toBe(false)
  })
  it('detects SSN and does NOT also report it as a phone', () => {
    const m = detectPII('his SSN is 123-45-6789 ok')
    expect(m.filter(x => x.start <= 11 && x.end >= 22).map(x => x.type)).toEqual(['SSN'])
  })
  it('detects phone, IP, and api key', () => {
    expect(detectPII('call +1 (415) 555-0142').some(x => x.type === 'PHONE')).toBe(true)
    expect(detectPII('server 192.168.1.42 down').some(x => x.type === 'IP' && x.value === '192.168.1.42')).toBe(true)
    expect(detectPII('key sk-proj-abc123XYZ456def789 leaked').some(x => x.type === 'API_KEY')).toBe(true)
  })
  it('detects a person from the name dictionary', () => {
    expect(detectPII('email Sarah Chen today').some(x => x.type === 'PERSON' && x.value === 'Sarah Chen')).toBe(true)
  })
  it('returns matches sorted by start, no overlaps', () => {
    const m = detectPII('Sarah Chen at sarah.chen@acme.com card 4111 1111 1111 1111')
    for (let i = 1; i < m.length; i++) expect(m[i].start).toBeGreaterThanOrEqual(m[i - 1].end)
  })
  it('returns empty for clean text', () => {
    expect(detectPII('the quick brown fox jumps')).toEqual([])
  })
})
