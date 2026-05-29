import { describe, it, expect } from 'vitest'
import { createT } from './translate'

const messages = { nav: { map: 'Map' }, common: { greet: 'Hi {name}' } }
const en = messages

describe('createT', () => {
  it('resolves a dot path', () => {
    expect(createT(messages, en)('nav.map')).toBe('Map')
  })
  it('interpolates {vars}', () => {
    expect(createT(messages, en)('common.greet', { name: 'Sara' })).toBe('Hi Sara')
  })
  it('falls back to en when the key is missing in the active locale', () => {
    const partial = { nav: {} }
    expect(createT(partial, en)('nav.map')).toBe('Map')
  })
  it('returns the key when missing everywhere', () => {
    expect(createT(messages, en)('nope.missing')).toBe('nope.missing')
  })
})
