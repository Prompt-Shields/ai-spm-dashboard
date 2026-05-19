# Promptly PEP — Multi-Platform Deployment Plan

How to take the policy enforcement features built in the dashboard (PR #10) and run them as Policy Enforcement Points (PEPs) across browsers and native operating systems.

## Frame

The dashboard is the **authoring + governance plane**: where admins design policies, run dry-run tests, request promotions, and watch the watchdog. It does not see end-user traffic.

The PEPs are the **enforcement plane**: software that runs at the user's edge — inside browsers and native apps — observing prompts, applying policies, and reporting back.

This plan covers five PEP surfaces:

| Surface | Status today | New work in this plan |
|---|---|---|
| Chrome extension (MV3) | None | Full build |
| Edge extension (MV3) | None | Repackaging of Chrome build |
| Safari extension (WebExt) | None | Full build, paired with macOS app |
| macOS Promptly | Partial — wire client + Swift PolicyTypes pinned to dashboard ([commit `959d245`](../app/api/policies/route.ts)) | Detector engine, watchdog UX, sign-off integration |
| Windows Promptly | None | Full build |

## Goal & non-goals

**Goal.** Same set of detectors, same policy bundle, same wire format on every platform. An admin promotes a policy in the dashboard; within one polling interval (≤60s), every connected PEP starts enforcing it. A user attempt to violate a Strict policy is blocked locally with a sub-100ms decision; the violation is reported back as a promptHash + detector evidence, never raw text.

**Non-goals.**
- We are not shipping a network proxy or AI gateway. Each PEP intercepts at the *user-interaction* layer of the host platform, not at the network layer.
- We are not blocking AI use wholesale. PEPs only apply policies the admin has actively cloned and promoted.
- We are not building our own browser. We integrate with the user's existing browsers.

---

## Architecture overview

```
            ┌────────────────────────────────────┐
            │    Dashboard (this repo)           │
            │  - Policy authoring + Test Console │
            │  - Approval workflow               │
            │  - Watchdog banner                 │
            └───────────────┬────────────────────┘
                            │
         GET /api/policies  │  POST /api/policies/violations
                            │   (PEP wire format)
                            ▼
       ╔════════════════════════════════════════════╗
       ║          Policy bundle + violation         ║
       ║          ingest (already shipped)          ║
       ╚════════════════════════════════════════════╝
                            │
        ┌───────────────────┼─────────────────────┐
        │                   │                     │
        ▼                   ▼                     ▼
  Browser PEPs      macOS Promptly         Windows Promptly
  (Chrome / Edge /   (menu bar app)        (tray app)
   Safari WebExts)
        │                   │                     │
        ▼                   ▼                     ▼
  AI sites in DOM     ChatGPT/Claude       ChatGPT/Claude
  + fetch wrappers    desktop apps         desktop apps
                      + browsers via       + browsers via
                      AXObserver / CDP     UIA / CDP
```

The dashboard is unchanged. PEPs are independent client implementations that talk to the same two endpoints.

---

## Shared foundation

These pieces are platform-agnostic and must land before any client work.

### 1. Wire format (already pinned)

`lib/policy-templates/types.ts` is the source of truth. The Swift companion in `prompt-shields-macos-widget` already pins to it via `PolicyTypesTests`. New clients (Chrome/Edge/Safari/Windows) must do the same:

- TypeScript clients (browser extensions): import the types directly via a shared package (`@promptly/policy-types`) published from this repo.
- Native clients (Swift, Kotlin, C#): generate language types from a JSON Schema export that we publish at build time, with fixture-pinned tests on each side.

**Action item:** add `scripts/export-policy-schema.ts` that emits a JSON Schema from the TS types. Run on every release; consumed by Swift, Kotlin codegen, and C# codegen.

### 2. Portable detector engine

The dashboard's pure evaluator (`lib/policy-engine/evaluator.ts`) handles regex / keyword / PII / secrets / classifier / LLM-judge / entropy. We need byte-identical decisions on every platform.

Two viable strategies:

- **A. Compile to WebAssembly.** Wrap the evaluator + every detector as a single Wasm module. Browsers and native apps both load the same `.wasm` blob. Detection logic is authored once.
- **B. Re-implement per platform.** TS for web, Swift for macOS, Kotlin or C# for Windows.

Recommendation: **start with B for browsers (TS is portable across MV3 + Safari) and macOS (Swift already exists), then evaluate Wasm once we have detector divergence pain.** Start with shared fixture tests so any divergence is caught in CI.

### 3. Polling, caching, and offline

Each PEP runs the same loop:

1. **On launch:** load cached policy bundle from disk. Apply it immediately.
2. **Every 60s:** `GET /api/policies` with `If-Modified-Since` header. Update cache on 200, no-op on 304.
3. **On violation:** queue locally if offline; flush on reconnect with retries and exponential backoff.
4. **Stale guard:** if the cache is >24h old, surface a "policies stale" indicator in the PEP's UI.

### 4. Violation reporting

Already defined: `POST /api/policies/violations` accepts a `PolicyViolation` envelope. The endpoint hard-rejects payloads where `promptHash` isn't a 64-char hex digest — every PEP must SHA-256-hash before sending.

PEPs do **not** send raw prompts. The dashboard's audit log displays detector evidence, not user content. This is non-negotiable across every platform.

---

## Browser extensions (Chrome, Edge, Safari)

### Why one section

Chrome MV3 and Edge use the same WebExtension manifest, identical APIs. Safari Web Extensions ([WWDC21 session](https://developer.apple.com/videos/play/wwdc2021/10104/)) accept the same manifest with minor adjustments and require a host macOS/iOS app for distribution. Build once, package three ways.

### Scope of coverage

Initial AI host allowlist (matched in `content_scripts.matches`):

- `chat.openai.com`, `chatgpt.com`
- `claude.ai`
- `gemini.google.com`, `bard.google.com`
- `copilot.microsoft.com`, `bing.com/chat`
- `poe.com`
- `perplexity.ai`
- `mistral.ai/chat`
- `huggingface.co/chat`

Coverage list is policy-driven: admins can add internal AI URLs (e.g. `ai-chat.acme.internal`) via the `approved_endpoints` parameter on the Shadow AI template, which the extension consumes.

### Architecture

```
┌────────────────────────────────────────────────┐
│  Background service worker                    │
│  - Polls /api/policies every 60s              │
│  - Holds policy bundle in memory              │
│  - Queues violations for upload               │
│  - Owns the watchdog state observed from API  │
└────┬─────────────────────────────┬─────────────┘
     │                             │
     │ chrome.runtime.sendMessage  │
     ▼                             ▼
┌──────────────────────┐  ┌─────────────────────┐
│ Content script       │  │ Action popup        │
│ (per AI site)        │  │ (extension icon)    │
│ - DOM observer       │  │ - Active policies   │
│ - Input gating       │  │ - Today's blocks    │
│ - Output redaction   │  │ - "Open dashboard"  │
└──────────────────────┘  └─────────────────────┘
```

### Interception points (in priority order)

1. **Pre-submit input gating.** Hook the AI site's submit button + Cmd/Ctrl+Enter. Run input-stage detectors before the prompt leaves the page. If a Strict policy fires, cancel the submit and render an in-DOM block UI ("Blocked by *PII Output Prevention*. [Appeal] [See policy]").

2. **Output redaction.** MutationObserver on the response area. As tokens stream in, scan for output-stage matches (PII output, system prompt leak, toxicity). Redact in-place by replacing matched substrings with `[REDACTED]` styled tokens. The user sees the redaction happen.

3. **Network mirroring (optional, defence-in-depth).** Wrap `fetch` and `XMLHttpRequest` on the page so that even if the user pastes into a non-standard textarea, we observe the outgoing payload. MV3 service workers can't modify request bodies, so this is observe-only — but observation feeds the violation feed for shadow-AI detection.

### Per-platform deltas

| Capability | Chrome | Edge | Safari |
|---|---|---|---|
| Manifest V3 | ✓ | ✓ | ✓ (Safari 15.4+) |
| Service worker background | ✓ | ✓ | ✓ (replaces persistent bg) |
| `webRequest` observe | ✓ | ✓ | ✓ |
| `declarativeNetRequest` for blocking | ✓ | ✓ | ✗ (not yet) |
| Distribution | Chrome Web Store | Edge Add-ons | App Store via paired macOS app |
| Auth | OAuth via dashboard | Same | Same, plus shared keychain on macOS |

Safari packaging requires a `.xcodeproj` that wraps the WebExtension and ships through the Mac App Store. Same `manifest.json`, same content scripts, just an Xcode wrapper. Promptly's existing macOS app project is the natural home for this — we add a Safari Extension target.

### User-visible UX

- **Extension icon** badges with today's would-block count when in Guideline mode, today's blocks when in Strict.
- **Block UI** is a contained DOM overlay (not a browser dialog) — preserves the user's prompt so they can revise. Includes:
  - Friendly explanation ("This prompt looks like it contains personal data.")
  - Which policy fired (linkable to dashboard)
  - **Appeal** button → opens dashboard pre-filled with the masked event ID
  - **Override** button visible only to designated reviewer roles
- **Redaction indicator** highlights redacted tokens with a hoverable tooltip showing the detector that fired.

### Performance budget

| Stage | Budget | How we hit it |
|---|---|---|
| Detection on submit | <50ms p95 | Pre-warmed regex cache; Workers for heavy classifiers |
| Output redaction per token batch | <16ms | Throttled to one frame; never blocks render |
| Background poll | n/a | Off the main thread; debounced |

---

## macOS Promptly (extending existing work)

Promptly already has a Swift PolicyTypes module pinned to the dashboard's wire format ([referenced in commit `959d245`](https://github.com/jun-bit-pulse-ai/ai-spm-dashboard/commit/959d245)). The new work is to bring it to feature parity with PR #10:

### Status quo

- ✅ Policy bundle fetch (`GET /api/policies`)
- ✅ Violation upload (`POST /api/policies/violations`)
- ✅ Type-pinned to dashboard via `PolicyTypesTests`
- ❓ Detector engine (assume partial — at least PII redaction)

### Net new

1. **Full detector parity.** Implement every detector type from `lib/policy-engine/evaluator.ts` in Swift. Pin behaviour to a shared fixture file (`tests/detectors/fixtures.json`) consumed by both the TS evaluator's CI and the Swift `XCTestCase` suite. Any change to fixture inputs/outputs requires updates on both sides.

2. **Coverage for native AI desktop apps.** ChatGPT.app, Claude.app — use `AXObserver` + `AXUIElement` to subscribe to focused-element value changes. Same gating model as the browser extension.

3. **Coverage for browsers without our extension.** Use Chrome DevTools Protocol via locally-attached debugger. This is the fallback for users in corporate environments where extensions are blocked. Trade-offs:
   - Requires Promptly running in the background.
   - Requires the user to launch their browser with `--remote-debugging-port=9222` (we provide a one-click launcher app).
   - More fragile than extensions; ship as a fallback only, not the primary path.

4. **Watchdog awareness.** Promptly's menu-bar item shows a coloured dot:
   - Green: all policies healthy
   - Yellow: at least one policy in watchdog grace
   - Red: a policy auto-demoted in the last hour

5. **Sign-off path for blocks.** When a Strict policy fires, present an OS-native sheet (not a web overlay). User options:
   - Cancel the prompt
   - Edit and retry
   - **Request override** (if reviewer role available) — opens dashboard pre-filled.

### Distribution

- Notarised `.app` bundle, distributed via an in-house update channel for enterprise + Mac App Store for SMB.
- Universal binary (Apple Silicon + Intel).

---

## Windows Promptly

A native counterpart to macOS Promptly with the same role: tray app that adds coverage where browser extensions can't reach.

### Stack

- **Language:** C# / .NET 8.
- **UI:** WinUI 3 for the tray menu and settings; native `MessageBox` not used — we want Promptly-branded sheets.
- **Detection:** UI Automation (UIA) for AI desktop apps; CDP for browsers without extensions; native fetch wrappers for our own Edge extension.

### Coverage

| Surface | Mechanism | Status |
|---|---|---|
| Edge with our extension | The Edge MV3 build, same as Chrome | Day 1 |
| Chrome with our extension | Same | Day 1 |
| Edge / Chrome **without** extension | CDP debugger attach (one-click launcher) | Day 30 |
| ChatGPT desktop (Windows) | UIA `TextPattern` observer on the input field | Day 30 |
| Claude desktop (when shipped) | Same | Day 30 |
| Microsoft 365 Copilot in Office | UIA on the Copilot pane | Day 60 |
| GitHub Copilot in VS Code | VS Code extension (separate; out of this plan's scope) | Future |

### Architecture mirror of macOS

Identical loop: poll → cache → detect → render block UI → report violation. The only platform-specific bits are how we hook the input field (UIA vs AXObserver) and how we render the block sheet (WinUI vs SwiftUI).

### Distribution

- MSIX bundle for enterprise via Intune / SCCM.
- Microsoft Store for SMB.
- Code-signed with EV cert.

---

## Phasing

### Milestone 1 — Foundation (weeks 1–3)

- [ ] Publish `@promptly/policy-types` npm package from this repo
- [ ] Add `scripts/export-policy-schema.ts` and CI gate that fails on schema drift
- [ ] Author shared detector fixture file (`tests/detectors/fixtures.json`)
- [ ] Stand up a `clients/` monorepo or sibling repo with TS + Swift + C# detector modules pinned to the fixtures

### Milestone 2 — Chrome MVP (weeks 3–6)

- [ ] Chrome MV3 extension with input gating on chat.openai.com, claude.ai, gemini.google.com
- [ ] PII output redaction, prompt injection block, secrets scanning
- [ ] Policy bundle fetch + cache + violation upload
- [ ] Block UI overlay + appeal flow
- [ ] Internal dogfood

### Milestone 3 — Edge + Safari (weeks 6–8)

- [ ] Edge: repackaging of Chrome build with Edge-specific manifest tweaks (mostly icon paths)
- [ ] Safari: Xcode wrapper as a target inside the macOS Promptly project
- [ ] Mac App Store TestFlight build

### Milestone 4 — macOS Promptly parity (weeks 4–8, parallel)

- [ ] All detector types from `evaluator.ts` ported to Swift
- [ ] AXObserver coverage for ChatGPT.app + Claude.app
- [ ] Watchdog status in the menu-bar dot
- [ ] Sign-off sheet UX

### Milestone 5 — Windows Promptly MVP (weeks 8–14)

- [ ] C# tray app with policy fetch + cache + violation upload
- [ ] UIA hooks for ChatGPT desktop on Windows
- [ ] CDP fallback for browsers without our extension
- [ ] MSIX bundle, EV-signed

### Milestone 6 — Hardening (weeks 14–18)

- [ ] Telemetry: latency p95 per platform, cache hit rate, violation queue depth
- [ ] Stale-policy detection
- [ ] Auto-update for desktop clients
- [ ] Penetration test focused on bypass attempts (DOM injection, AX entitlement abuse)

---

## Cross-cutting risks

### Bypass via uncovered surfaces

A motivated user can paste into a non-allowlisted AI site, or use a desktop app we don't yet hook. **Mitigation:** the Shadow AI Detection template ships out of the box and surfaces unknown egress points to admins via the violation feed. Coverage expands quarterly.

### Update lag

A 60-second poll means a policy promotion takes up to 60 seconds to propagate. Within that window, end users may slip through. **Mitigation:** add a server-pushed invalidation channel (Server-Sent Events from `/api/policies/stream`) once the polling-only baseline is proven.

### Performance regression

Each new detector adds CPU per keystroke. **Mitigation:** detectors are tagged `cheap` / `expensive` in templates; expensive detectors only run on submit, never on every keystroke.

### MV3 service worker eviction

Chrome aggressively kills idle service workers. Policy state must be reloadable from `chrome.storage.local`, not the SW heap. **Mitigation:** make the SW stateless; use storage for cache + queue.

### Native AX entitlements (macOS)

Promptly needs Accessibility access — a privileged entitlement. Some users won't grant it. **Mitigation:** Promptly degrades gracefully — if AX is denied, it relies on the Safari extension only. Status indicator surfaces what's covered vs not.

### CDP attach is fragile

Relies on the user launching browsers with the debug flag. Not a reliable primary path. **Mitigation:** present extensions as the recommended deployment; CDP attach is a fallback for locked-down environments and clearly labelled as such.

---

## Open questions

1. **Auth model for PEPs.** Each PEP needs to authenticate to the dashboard API. Personal access token in the user's keychain? Org-issued client cert? OAuth device flow?
2. **Tenant isolation.** Does the dashboard support multi-tenancy yet? PEPs need a tenant identifier in the policy bundle URL.
3. **Wasm vs platform-native detectors.** Worth a focused spike in Milestone 1 to decide before splitting the implementation.
4. **iOS Promptly?** Out of this plan, but worth flagging — iOS Safari extensions are a thing, and the existing macOS code reuses well.
5. **VS Code / JetBrains coverage.** Code Assistant policies (Copilot, Cursor) live inside IDEs. Probably an IDE-extension stream of work after Windows ships.

---

## Bootstrap order suggestion

If only one platform can ship next, **build the Chrome extension**. It covers the largest user surface, validates the wire format outside the existing Swift client, and the work transfers near-directly to Edge and Safari. macOS Promptly parity is a parallel track that doesn't block the browser story.
