import { describe, expect, it } from 'vitest'
import { externalHosts, scanDraft } from './scan-draft'
import { scanVerdict } from './derive'

const find = (body: string, kind: string) =>
  scanDraft(body, '2026-09-02').findings.find((f) => f.kind === kind)!

describe('externalHosts', () => {
  it('finds hosts that are not on the allowlist', () => {
    expect(externalHosts('POST https://crm.brokerportal.eu/v1/contacts')).toEqual([
      'crm.brokerportal.eu',
    ])
  })

  it('allows approved hosts and their subdomains', () => {
    expect(externalHosts('https://induver.sharepoint.com/policies https://anthropic.com')).toEqual([])
  })

  it('de-duplicates repeated hosts', () => {
    expect(externalHosts('https://a.io/x https://a.io/y')).toEqual(['a.io'])
  })

  it('finds nothing in a body with no URLs', () => {
    expect(externalHosts('Summarise the claim and list open questions.')).toEqual([])
  })
})

describe('scanDraft', () => {
  it('passes a clean body on every check', () => {
    const report = scanDraft('Summarise the attached claim in one page.', '2026-09-02')
    expect(scanVerdict(report)).toBe('ok')
    expect(report.scannedAt).toBe('2026-09-02')
  })

  it('flags an unvetted endpoint as high, and raises the processor question', () => {
    const body = 'Fetch context from https://serpapi.com/search then answer.'
    expect(find(body, 'egress')).toMatchObject({ severity: 'high' })
    expect(find(body, 'framework')).toMatchObject({ severity: 'medium', framework: 'gdpr' })
  })

  it('does not raise the processor question when nothing leaves the tenant', () => {
    const report = scanDraft('No calls here.', '2026-09-02')
    expect(report.findings.some((f) => f.kind === 'framework')).toBe(false)
  })

  it('grades a name in an example below a leaked secret', () => {
    const namey = find('Reply to Jan Peeters at jan.peeters@induver.be', 'pii')
    expect(namey.severity).toBe('medium')
    expect(namey.label).toBe('PII in prompt')
  })

  it.each([
    ['anthropic key', 'Use sk-ant-api03-AbCdEfGhIjKlMnOpQrStUvWx'],
    ['github token', 'Auth with ghp_AbCdEfGhIjKlMnOpQrStUvWxYz0123'],
    ['slack token', 'Post via xoxb-1234567890-AbCdEfGh'],
    ['bearer header', 'Authorization: bearer AbCdEfGhIjKlMnOpQrStUvWx'],
  ])('catches a hardcoded %s the shared PII pass misses', (_label, body) => {
    const finding = find(body, 'pii')
    expect(finding.severity).toBe('high')
    expect(finding.label).toBe('Credentials in body')
    expect(finding.piiTypes).toContain('API_KEY')
  })

  it('does not treat a plain digit run as a credential', () => {
    expect(find('Reference 0123456789 in the reply', 'pii').label).toBe('PII in prompt')
  })

  it('is deterministic — same body, same findings', () => {
    const body = 'Call https://x.io and email jan@induver.be'
    expect(scanDraft(body, '2026-09-02')).toEqual(scanDraft(body, '2026-09-02'))
  })

  it('always reports on all four check kinds it can', () => {
    const report = scanDraft('Post to https://x.io with jan@induver.be', '2026-09-02')
    expect(new Set(report.findings.map((f) => f.kind))).toEqual(
      new Set(['egress', 'pii', 'framework', 'dataStore']),
    )
  })
})
