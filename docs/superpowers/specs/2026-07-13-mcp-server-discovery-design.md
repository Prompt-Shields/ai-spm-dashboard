# MCP Server Discovery — /discover/mcp

**Date:** 2026-07-13
**Status:** Approved (user, 2026-07-13)
**Branch:** feat/ai-cost-tracking

## Goal

Add MCP server discovery to the Discover section: a sixth entry card on
`/discover` leading to `/discover/mcp`, where an animated scan "sweeps"
endpoint configs and produces a seeded inventory of MCP servers with
transport, auth, publisher, permissions and risk flags. Mirrors the
voice-interview sub-feature pattern: seeded deterministic demo, no backend.

## Non-goals

- No real scanning, no connectors — all data seeded.
- No changes to /agent-discovery.
- Inventory content (server names, flags) is English-only sample data; UI
  chrome is translated (en/fr/nb) like the rest of the app.

## Data model (`lib/mcp-discovery-data.ts`)

```ts
export type McpTransport = 'stdio' | 'http' | 'sse'
export type McpAuth = 'none' | 'api-key' | 'oauth'
export type McpPublisher = 'verified' | 'community' | 'unknown'
export type RiskSeverity = 'high' | 'medium' | 'low'

export interface McpRiskFlag {
  severity: RiskSeverity
  label: string // e.g. "Unauthenticated remote server"
}

export interface McpServer {
  id: string
  name: string
  source: string // npm package or remote URL
  transport: McpTransport
  clients: string[] // apps whose configs referenced it (≥1)
  endpoints: number // machines running it
  auth: McpAuth
  publisher: McpPublisher
  permissions: string[] // e.g. "Filesystem write", "Shell exec"
  sanctioned: boolean
  riskFlags: McpRiskFlag[]
}
```

- `serverRiskLevel(s: McpServer): RiskSeverity` — highest severity among
  `riskFlags`; `'low'` when there are none. Exported and unit-tested.
- `MCP_SERVERS`: ~8 seeded servers covering the MCP security narrative:
  verified/sanctioned (GitHub, Slack, Notion), a Postgres server with
  production write access (medium), a community filesystem server with broad
  write (medium), an unknown-publisher web-scraper with shell exec (high),
  an unauthenticated remote SSE server (high), and one internal custom server.
- `MCP_SUMMARY: { totalServers, endpointsWithMcp, unsanctioned, highRisk }` —
  `totalServers`, `unsanctioned` and `highRisk` are computed from
  `MCP_SERVERS` (never hardcoded); `endpointsWithMcp` is a named seeded
  fleet-level constant (machines running ≥1 MCP server), since it can't be
  derived from per-server counts without double-counting.
- `SCAN_SOURCES`: `{ id, label, detail, found, durationMs }[]` — the
  animation script (Claude Desktop configs, Claude Code configs, Cursor
  settings, VS Code extensions, network egress). `found` values sum to
  `MCP_SERVERS.length`.

## UI (`app/discover/mcp/page.tsx`)

Client component, two phases in local state:

1. **Scan phase** — hero card with a "Scan for MCP servers" button. On
   click, the `SCAN_SOURCES` checklist animates source-by-source
   (`setTimeout` chain, ~6s total): spinner → check, running found-count.
   A "Skip" link completes instantly. (Timers cleaned up on unmount.)
2. **Results phase** — summary stat strip (4 tiles from `MCP_SUMMARY`),
   then the inventory table: name+source, clients, transport, auth,
   publisher, endpoints, risk badge (destructive/warning/success from
   `serverRiskLevel`). Clicking a row expands it inline to show permissions
   and each risk flag with its severity.

Back-link to /discover at the top, consistent with voice-interview.

## Discover page changes

- Sixth entry card `mcpDiscovery` (icon: `Waypoints`, new `rose` color added
  to the card color union and class maps), `href: '/discover/mcp'`.
- Subtitle updated "Five ways…" → "Six ways…" in en/fr/nb.

## i18n

- `discover.cards.mcpDiscovery.{title,description,action}` in en/fr/nb.
- New `mcpDiscovery` namespace (page title, subtitle, scan CTA, source
  labels stay data-side in English; table headers, phase labels, skip,
  summary tile labels are translated) in en/fr/nb, registered wherever
  namespaces are aggregated (locales/{en,fr,nb}.ts).

## Testing

`lib/mcp-discovery-data.test.ts` (vitest `--pool=forks`):

- `serverRiskLevel`: high beats medium/low; no flags → low.
- `MCP_SUMMARY.totalServers === MCP_SERVERS.length`; `unsanctioned` and
  `highRisk` match recomputation from the list.
- every server has ≥1 client and ≥1 permission label.
- `SCAN_SOURCES` found-counts sum to `MCP_SERVERS.length`.
- Existing `lib/i18n/completeness.test.ts` guards the new keys' parity.

## Verification

Dev server: /discover shows the sixth card and "Six ways" subtitle; card
navigates to /discover/mcp; scan animates then renders the inventory; row
expansion shows flags. Screenshot for the user.
