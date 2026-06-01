import { describe, it, expect } from 'vitest'
import { detectPII } from './detector'
import { anonymize } from './anonymizer'
import { simulateReply } from './mock-chatgpt'
import { EXAMPLE_PROMPTS } from './examples'

describe('simulateReply', () => {
  it('never leaks raw PII — output may only contain placeholder tokens', () => {
    for (const { text } of EXAMPLE_PROMPTS) {
      const { masked, mapping } = anonymize(text, detectPII(text))
      const reply = simulateReply(masked)
      for (const e of mapping) expect(reply).not.toContain(e.value)
    }
  })
  it('returns a non-empty string for a no-PII prompt', () => {
    expect(simulateReply('what is the capital of France?').length).toBeGreaterThan(0)
  })
})
