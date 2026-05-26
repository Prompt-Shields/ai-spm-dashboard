import { describe, it, expect } from 'vitest'
import { detectPII } from './detector'
import { anonymize, deanonymize } from './anonymizer'

describe('anonymize/deanonymize', () => {
  it('replaces PII with typed placeholders', () => {
    const t = 'email sarah.chen@acme.com'
    const { masked, mapping } = anonymize(t, detectPII(t))
    expect(masked).toBe('email [EMAIL_1]')
    expect(mapping[0]).toEqual({ placeholder: '[EMAIL_1]', value: 'sarah.chen@acme.com', type: 'EMAIL' })
  })
  it('reuses one placeholder for a repeated value', () => {
    const t = 'a@b.com and a@b.com'
    const { masked, mapping } = anonymize(t, detectPII(t))
    expect(masked).toBe('[EMAIL_1] and [EMAIL_1]')
    expect(mapping).toHaveLength(1)
  })
  it('round-trips every example prompt', async () => {
    const { EXAMPLE_PROMPTS } = await import('./examples')
    for (const { text } of EXAMPLE_PROMPTS) {
      const { masked, mapping } = anonymize(text, detectPII(text))
      expect(deanonymize(masked, mapping)).toBe(text)
    }
  })
  it('restore is not corrupted by placeholder prefixes ([EMAIL_1] vs [EMAIL_10])', () => {
    const mapping = [
      { placeholder: '[EMAIL_1]', value: 'one@x.com', type: 'EMAIL' as const },
      { placeholder: '[EMAIL_10]', value: 'ten@x.com', type: 'EMAIL' as const },
    ]
    expect(deanonymize('[EMAIL_10] [EMAIL_1]', mapping)).toBe('ten@x.com one@x.com')
  })
})
