// lib/agent-discovery/export.test.ts
import { describe, it, expect } from 'vitest'
import { formatReportMarkdown } from './export'
import { buildComplianceReport } from './report'
import { CLOUD_AGENTS } from './data'

describe('formatReportMarkdown', () => {
  const md = formatReportMarkdown(buildComplianceReport(CLOUD_AGENTS))

  it('has the report title and CISO line', () => {
    expect(md).toMatch(/# State of AI Compliance/)
    expect(md).toMatch(/Prepared for: CISO/)
  })

  it('includes the headline totals', () => {
    expect(md).toMatch(/Total agents discovered/)
    expect(md).toMatch(/Shadow \(unregistered\)/)
  })

  it('lists every cloud', () => {
    expect(md).toMatch(/AWS/)
    expect(md).toMatch(/Azure/)
    expect(md).toMatch(/GCP/)
  })

  it('renders recommended actions when present', () => {
    expect(md).toMatch(/Recommended actions/)
  })

  it('handles an empty report without throwing', () => {
    const empty = formatReportMarkdown(buildComplianceReport([]))
    expect(empty).toMatch(/# State of AI Compliance/)
    expect(empty).toMatch(/Total agents discovered: 0/)
  })
})
