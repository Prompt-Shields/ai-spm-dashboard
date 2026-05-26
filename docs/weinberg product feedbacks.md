# Curated Demo Spec — Dailyn / Weinberg (May 7 call)

> **Audience:** Jun (build), Tage (run the call).
> 

> **Goal:** Curated demo to use in the May 7 call with Dailyn Fowler-Holmes (IT Lead, Weinberg Foundation). Strip the generic enterprise dashboard down to **only** what helps Dailyn complete jobs he told us he cares about, with realistic Weinberg dummy data. Outcome we want from the call: Dailyn says yes to pitch PS and 10k$ ARR agreement, including a **30-day pilot** with a money-back guarantee.
> 

> **Source of truth for his needs:** [Weinberg Foundation — Client Log](https://www.notion.so/Weinberg-Foundation-Client-Log-34ceef33c03281feb4beeb116cdbd346?pvs=21) · [Pricing Proposal — Weinberg (80 AI users)](https://www.notion.so/Pricing-Proposal-Weinberg-Foundation-80-AI-users-34aeef33c03281daa864f621c0eab68b?pvs=21) · [Daily Coach Feedback — 2026-04-23](https://www.notion.so/Daily-Coach-Feedback-2026-04-23-Thu-34ceef33c032819087cff85fd7fe789e?pvs=21) · Apollo conversation [69ea2f7abfcf7a0011749beb](https://app.apollo.io/#/conversations/69ea2f7abfcf7a0011749beb).
> 

# 1. The thesis behind this rebuild

The current [demo-dashboard.promptshields.com](http://demo-dashboard.promptshields.com) is overkill for Weinberg and most of it duplicates tools they already pay for (Microsoft Purview, Sentinel One, Intune). Dailyn explicitly rejected the **$20K governance** SKU — *"not realistic"* — and said the goal is to **monitor + redact, not block**, with **coaching** for users.

The May 7 demo shuold look like the product he would say yes to and that would end up using: a **lightweight admin console for the Desktop AI Assistant** (the $10/user/mo line), tuned for an **80-user US private foundation**, complementing Purview + Sentinel One rather than competing with them.

---

# 2. Dailyn's confirmed jobs-to-be-done

Verbatim from the April 23 call (Apollo recording 69ea2f7abfcf7a0011749beb), with the dashboard task we should observe him attempting in the demo:

| # | Verbatim need | Demo task we ask him to perform | What page must support it |
| --- | --- | --- | --- |
| 1 | *"Main goal is to monitor and redact sensitive data"* | "Check what was redacted across the org in the last 30 days." | Overview + Activity Log |
| 2 | *"One spot management solution… combined solution"* | "Find the AI usage across Copilot, ChatGPT, Claude and other AI tools." | Overview (AI usage by tool) |
| 3 | *"Tool to teach users"* | "Find one user who keeps leaking PII and see what they've been coached on." | Coaching & Adoption |
| 4 | *"I didn't even think about bias protections"* | "Show prompts flagged as bias-risk in grant decisions." | Activity Log filter |
| 5 | *"Actual download agent rather than an extension"* | "Confirm all 80 users are running the desktop application." | Deployment Health |
| 6 | *"Settings managed at our level using Intune"* | "Push a new policy to the Grants Management team via Intune." | Policy Management |
| 7 | Audit / board / fiduciary | "Pull a 30-day report you can pull to your Director." | Audit & Report |

Secondary signals also worth covering: free-vs-paid clarity, privacy/tracking transparency (what's collected, what isn't), and visible non-overlap with Purview + Sentinel One.

# 3. The curated dashboard — five pages, not eleven

Proposed left-nav for the Weinberg-branded build:

1. **Overview** (what the IT lead checks first)
2. **AI Activity Log** (the thing he'll click into and filter for his own audits of AI use)
3. **Coaching & Adoption** (Dailyn's "teach not block" request)
4. **Policies** (the create-a-policy task)
5. **Deployment** (Intune push status - the proof it's real)
6. **Audit & Report** (the export he takes upstairs)

Logo replacement: top-left, swap **Prompt Shields** wordmark to a co-branded lockup — Prompt Shields × Weinberg Foundation logo (use the foundation's mark from [hjweinbergfoundation.org](http://hjweinbergfoundation.org)). Keep the Prompt Shields shield icon.

## 3.1 Overview - "Am I OK today?"

**One screen, one answer.** Replace the four hero metrics with three honest numbers he can actually show:

- **Active users with agent**: 78 of 80 (97.5%) — *real KPI for the IT Lead*
- **Sensitive prompts redacted (last 30 days)**: 412 — *the value he's paying for*
- **High-severity events needing review**: 2 — *clickable, opens Activity Log filtered*

Replace the bottom widgets:

- **AI tool usage (last 30 days)** — pie/donut: Microsoft Copilot 64%, ChatGPT Business 22%, Claude (shadow) 8%, Gemini (shadow) 4%, Perplexity (shadow) 2%. *Matches their actual stack — Copilot Premium for all, GPT Biz for ~25, the rest shadow.*
- **Usage by department** — horizontal bar: Grants Management, Program Officers — Housing / Health / Jobs / Education / Community Services, Finance, Comms, Executive, HR, IT, Legal & Compliance. *Real Weinberg department names sourced from their five focus areas + standard foundation back-office.*
- **Recent redaction events** — short table (5 rows), names tagged [DEMO] to make it obvious these are seeded. Arbitrary names publicly know to work in Weinberg that may leak data.
- **Footer micro-callout (NEW)**: "Complements Microsoft Purview (data classification) and SentinelOne (endpoint). Prompt Shields handles the in-prompt PII layer those don't see." — kills the overlap objection on slide one.

**Cuts on Overview:**

- ❌ "Compliance Score 94.3%" —No backing data and EU-flavoured. Drop entirely.
- ❌ "Security Risk Score 82/100" — same problem, looks like a Wiz/Bitsight number we can't justify, unless have something to justify
- ❌ "Anonymisation Accuracy 96.7%" — as long as can’t guarantee, model-quality metric Dailyn doesn't buy on. Move to Coaching page if anywhere.
- ❌ "Employee Training Completion" with seven generic departments — rebuild on the Coaching page with Weinberg departments only.

## 3.2 AI Activity Log — the click-around page

This is the single most useful page for Dailyn. Replace today's *"Recent Data Leakage Prevention Events"* mini-table with a full-page filterable log. The “Audit & reports” and User & Admin actions forms a basis.

**Columns:** Timestamp · User · Department · AI tool · Event type · Sensitive type · Action taken · Severity

**Event types in the seed data:**

- `Redacted` — green pill
- `Anonymised` — blue pill
- `Blocked` — red pill (rare, only when user opted block-mode)
- `Coached` — purple pill (nudge shown, user proceeded safely)
- `Bias-flagged` — orange pill (delight hook for Dailyn's grant-bias remark)

**Filters across the top:** Department · AI tool · Event type · Severity · Date range. Filters are the demo task — Dailyn will use them.

**Seed events (≈25 rows; Weinberg-realistic, all marked [DEMO]):**

| User [DEMO] | Dept | AI tool | Event | Detail |
| --- | --- | --- | --- | --- |
| L. Park | Grants Management | ChatGPT | Redacted | Pasted grantee SSN + EIN drafting MOU |
| M. Hayes | Program Officer — Housing | Copilot | Redacted | Beneficiary home address + medical condition in grant memo |
| R. Cohen | Communications | Copilot | Anonymised | Donor list pasted to draft thank-you newsletter |
| J. Tanaka | HR | Claude | Blocked | Salary review for VP-level employee |
| S. Diallo | Finance | ChatGPT | Blocked | Bank routing info in vendor dispute |
| A. Weiss | Executive | Perplexity | Redacted | Grant decision summary w/ health condition |
| P. Nguyen | Program Officer — Health | Copilot | Coached | Drafted on-brand reply, no PII risk |
| K. Brooks | Program Officer — Education | ChatGPT | Bias-flagged | Grant-scoring prompt: "applicants from XYZ neighborhood" |
| D. Okafor | Grants Management | Claude | Bias-flagged | Scoring prompt referenced applicant's age |
| T. Mendel | Legal & Compliance | Copilot | Redacted | 990-PF draft w/ grantee finances |
| … 15 more | … | … | … | … |

All names are placeholder; spec calls them out as `\[DEMO\]` so we never imply real Weinberg staff. **Note:** seed names should be culturally varied, plausible for a Baltimore-based national foundation, and never resemble any real Foundation employee on their public Leadership page.

## 3.3 Coaching & Adoption — the "teach not block" page

Replace the giant `Education & Training` page (training modules, certificates, posture score, etc.) with a tight four-block view:

1. **Active users** — 78 / 80 (% rolling 30 days) — Dailyn explicitly asked for active-user count.
2. Number of prompts - how many successull prompts. Is there an increase or decrease in adoption?
3. **Coaching nudges delivered** — 1,247 last 30 days. Sub-tile: top 3 nudges (e.g. "Don't paste SSN — use anonymised reference", "Try this prompt structure for grant memos", "Switch to enterprise Copilot for confidential queries").
4. Reduction in risky prompts - % decrease in risky prompt, possibly filtered per user. So daily sees that nudges makes people do less risky actions = successful outcome for Weinberg.
5. **Adoption by department** — small bar chart, Weinberg departments only.

Goal: Want to show that our solution help drive AI adoption (# of success prompts) and decrease in # risky prompts. Delete the entire **AI Prompt Safety Education Tracker** module list ("AI Security 101", "Prompt Injection", "Redaction Techniques" etc.). It's an LMS that’t overkill initially, rather*"Coaching is in-line at the prompt — no separate LMS to deploy."* This **is** the differentiator

## 3.4 Policies — the "create-a-policy" task

**This page does not exist in the current demo. We need to add it.** It's the single most important task Dailyn will do in the click-through and the one that converts the demo from a static dashboard into a product he can imagine using on Monday.

Simple page, Intune-flavoured because that's his deployment story:

- List of policies with: Name · Scope (department) · Last updated · Status (Active/Draft).
- Seed 4 policies:
    1. "No grantee PII to external LLMs" — Scope: Grants Management — Active.
    2. "No salary or comp data to any AI" — Scope: HR + Executive — Active.
    3. "Bias check on grant-scoring prompts" — Scope: All Program Officers — Active.
    4. "Donor data redaction" — Scope: Communications + Development — Draft.
- **"+ New Policy"** button → modal with three fields: name, scope (multi-select departments, multi-select people, ), rule (dropdown: redact / coach / block, plus sensitive-type dropdown). On save, write to a fake list and show a toast: *"Pushed to 12 endpoints via Intune — preview rollout in Deployment."*

This is the click-and-impress moment of the demo. Dailyn creates a policy, sees it appear, sees the "pushed via Intune" confirmation. His verbatim from the call — *"Settings managed at our level using Intune"* — is now a feature he just used.

## 3.5 Deployment — proof it's real

The smallest page, but the one that closes the trust gap. Single screen showing:

- **Agents online**: 78 / 80
- **Platform breakdown**: Windows ARM 64 (Surface) — 76, Windows x64 — 1, macOS — 1 (matches what Dailyn told us about their fleet exactly).
- **Agent version**: v1.4.2 — "Up to date".
- **Last Intune sync**: 14 min ago.
- **2 offline agents**: shown by user with last-seen — one offboarded user, one Surface in Hawaii office "sleep mode > 7 days".

This page is what proves to Dailyn the product runs in his actual environment. **Build feasibility flag: we currently do not ship a hardened Windows ARM 64 build (per the open item with Jun in the Weinberg Client Log — "Confirm Windows ARM 64 deployment is bulletproof"). The dashboard can show it; engineering must close the gap before the pilot starts.**

## 3.6 LOG & Report — the upstairs export

Current page is OK basis but too complex - wont be e.g. that much compliance reporting. Instead strip down to 1 log, and chage (`Agent Activity Logs, but replace agent with people. Weinberg likely does not have any agent`). Drop/Question: 

- ❌ User & Admin Actions —(NOTE: overlaps Microsoft Defender / Entra audit logs, clear out if want here)
- ❌ Change History — same overlap.
- ❌ Compliance Reporting — was EU-AI-Act-shaped; rebuild as the export below (they are U.S. based, other laws apply)

Kepp "Generate Report" option, while consider whether to have as a page:

- Date range picker (default Last 30 days).
- Sections to include (checkboxes): redacted prompts summary, top users by event, AI tool usage, policies in force, coaching nudges delivered, bias-flagged grant prompts.
- **"Export PDF"** button → returns a one-pager titled *"Weinberg Foundation — AI Activity Report — [date range]"*. The one-pager is the artifact Dailyn takes to his Director and to the audit committee for IRS 990-PF fiduciary purposes.
- Footer line on the export: *"Frameworks referenced: NIST AI RMF, IRS 990-PF fiduciary duty, MD MPIPA, MD MODPA. EU AI Act not applicable."*

# 4. Pages and subpages to delete entirely

| Page | Why we cut it for Weinberg |
| --- | --- |
| **Data Governance** (all 7 tabs: Overview, Classification, Sensitivity Labeling, Data Access, Policy Enforcement, Data Location, Program Health) | This is **Microsoft Purview's job** and Weinberg already pays for it. Dailyn called Purview *"clunky, very Microsoft, no redaction."* Our wedge is the redaction layer Purview doesn't do — not a re-implementation of Purview itself. Risk if we keep it: Dailyn sees $20K governance overlap and refuses again.  |
| **SLM Performance** (all 4 tabs) | Reads as ML-ops content for an enterprise model team. Weinberg has no ML team. "Wealth Management / Compliance Ops" departments don't exist there. |
| **Policy & Compliance — EU AI Act** | Hard cut. EU AI Act does not apply to a US private foundation. Showing it makes us look like we don't know our buyer. Replaced by the report footer line above. |
| **AI Agents Marketplace** (all 11 agents) | This is AISPM/IAM marketplace content (Identity Graph, Shadow Admin, Secrets Exposure, Policy Drift). Sentinel One + Microsoft Defender already cover this for Weinberg. Not what they're buying. They likely also dont have that many agents. |
| **AI Security** subtree (AI-BOM, Pipeline Risk, Attack Path, Model Risk, Threat Detection, Configuration Assessment) | Enterprise AISPM content for orgs that build their own models. Weinberg consumes SaaS AI; they don't ship LLMs. Zero relevance. |
| **Access Management** subtree (Access Overview, Permission Risk Heatmap, Identity Graph, Anomalous Activity, Access Intelligence, Third-Party Monitoring) | This is identity governance and closer to security — Microsoft Entra + Defener + Sentinel One territory. Dailyn also explicitly said he won't pay for governance. Keeping this triggers the rejection again. Instead only take note that might want this. |
| **Education & Training — module tracker** | Looks like an LMS. Replace with the leaner Coaching & Adoption page. Goal for him to see that people do less risky prompts from our  nudged, thats it. Could |

# 5. Replace EU AI Act → US foundation framework

Wherever the current dashboard references EU AI Act, swap to the **applicable-law set for a US private foundation**, and frame each as "why this view exists":

- **IRS 990-PF (federal)** — board fiduciary duty includes AI risk oversight → drives the "Audit & Report" PDF export.
- **MD Personal Information Protection Act (MPIPA)** — breach notification duty for MD residents' PII → drives PII redaction events.
- **MD Online Data Privacy Act (MODPA)** — MD consumer data rights → drives redaction of consumer/grantee identifiers.
- **CA AI Transparency Act SB 942** (effective Jan 2026) — only if Weinberg generates AI content for CA audiences (their San Francisco grantmaking might trigger this) → mention as "covered if applicable".
- **IL HB 3773** — only if they have IL-based staff → mention as "covered if applicable".
- **TX TDPSA** — only if TX consumers → mention as "covered if applicable".
- **NIST AI RMF 1.0** — voluntary, but the right reference for a US org wanting credible governance language.

Full writeup of these laws is already in the [Pricing Proposal Appendix](https://www.notion.so/Pricing-Proposal-Weinberg-Foundation-80-AI-users-34aeef33c03281daa864f621c0eab68b?pvs=21). Reuse the table verbatim if needed.

# 6. Dummy data spec

## Org constants

- Org name: **Weinberg Foundation** (logo lockup top-left).
- Total AI users in dashboard: **80**.
- Devices: 76 Windows ARM 64 (Surface), 1 Windows x64, 1 macOS Sonoma, 2 offline.
- Stack badges visible on Overview: Microsoft 365 E5 · Copilot Premium · ChatGPT Business · Intune · SentinelOne ("complements").

## Departments and headcount (must reconcile to 80)

| Department | Users |
| --- | --- |
| Grants Management | 12 |
| Program Officer — Housing | 8 |
| Program Officer — Health | 7 |
| Program Officer — Education | 6 |
| Program Officer — Jobs | 5 |
| Program Officer — Community Services | 5 |
| Operations / Admin | 9 |
| Finance | 8 |
| Communications | 6 |
| Executive Office | 4 |
| HR | 4 |
| Legal & Compliance | 3 |
| IT | 3 |
| **Total** | **80** |

Department names map to Weinberg's actual structure: their five public focus areas (Housing, Health, Jobs, Education, Community Services) + standard foundation back-office. Sourced from [hjweinbergfoundation.org/grants/where-we-give](http://hjweinbergfoundation.org/grants/where-we-give).

## AI tool usage mix (last 30 days)

| Tool | Share of prompts | Why |
| --- | --- | --- |
| Microsoft Copilot Premium | 64% | All 80 users licensed (Dailyn's call) |
| ChatGPT Business | 22% | ~25 users (Dailyn's call) |
| Claude | 8% | Shadow — opportunity to surface |
| Gemini | 4% | Shadow |
| Perplexity | 2% | Shadow |

Shadow tools (Claude, Gemini, Perplexity) tagged with a small "Shadow AI" pill. This is one of the strongest pitches: *"These three you don't currently have visibility into — Purview can't see them."*

## Counts to seed

- **Total prompts (30d): 4500**
- **Increase in amount of successull prompts (30d): 10%**
- **Sensitive prompts redacted (30d)**: 412.
- **Coaching nudges delivered (30d)**: 350.
- **Reduction in amount of risky prompts (30d)**: 20%
- **Bias-flagged prompts (30d)**: 9.
- **Active users (30d)**: 78 / 80.
- **High-severity events**: 2 (one HR salary-review block, one Finance routing-info block).
- **Active policies**: 3 + 1 draft.

# 7. The 8-minute click-through we will run with him on May 7 (

We ask Dailyn to achieve tasks but don’t tell him how to do it. He shares his screen of our demo, click around, shares his thoughts while playing with tool, we observe. Sequence:

1. **(0:00–1:00)** *"Open the dashboard and tell us what you'd check first."* — Watch where he clicks. Hypothesis: Overview, then Activity Log.
2. **(1:00–2:30)** *"Find the 30-day redaction count and tell us which department is highest risk."* — Tests the Overview + Activity Log filter UX.
3. **(2:30–4:00)** *"Find one Program Officer who's been coached, that had a reduction in risky prompts and see what they were nudged on."* — Tests Coaching & Adoption page and his "teach not block" requirement.
4. **(4:00–5:30)** *"Create a new policy: 'no salary data to any AI', scope it to HR and Executive, push it via Intune."* — Tests the Policies page. **This is the moment that closes.**
5. **(5:30–6:30)** *"Confirm all 80 of your users are running the agent on their Surfaces."* — Tests Deployment page. Removes the "is this real" objection.
6. **(6:30–8:00)** *"Generate a report you'd take to your Director and the audit committee."* — Tests the export. Hands him the artifact that lets him sell internally.

After the click-through, Tage closes:

> *"You just walked through the product as if it was deployed at Weinberg next month. You get an increase in amount of successfull prompts, and decrease in risky prompts. Like you said, a complete AI management solution. Next, we suggest your procced to pitch to your director our solution, however completely risk free on your end.  $5K, 30-day pilot to one department of your choice — credited 100% toward the annual contract, money-back guarantee if it doesn't deliver. Shall we put that in writing today?"*
> 

# 8. Build feasibility — what we can ship by May 7 vs. what is fakery

Honest table - "Fakery" here means the dashboard shows it but the underlying product doesn't yet do it. Risk = how badly we get caught if Dailyn drills in.

| Item | Status today | Risk of faking on May 7 |
| --- | --- | --- |
| PII redaction across Copilot, ChatGPT (and others) | ✅ Real, demoed April 23 | None — we own this. |
| Admin console / activity log | ⚠️ Partially real, demo dashboard is a v0 prototype | Low — staged data is acceptable; he expects a demo. |
| Bias-flagging on grant-scoring prompts | ❌ Not built | **Medium** — if he asks how, say: *"Pattern-matching layer trained on grant-scoring prompts. Live in pilot. Roadmapped GA Q3."* Don't oversell. |
| Policies create + push via Intune | ❌ Not built | **Medium** — he'll buy the UX. Be honest in the close that Intune push is part of pilot rollout, not live in this dashboard. |
| Windows ARM 64 agent | ⚠️ Open item with Jun (Client Log) | **High** — if not bulletproof by pilot, he kills us. Must close before pilot kickoff. Demo can show it; pilot must deliver it. |
| Deployment / agent online status panel | ❌ Not built | Low — UX only; underlying telemetry is straightforward to wire post-pilot. |
| Report PDF export | ❌ Not built | Low — single page export, easy to add. Even just a stubbed download with watermark is fine for May 7. |

Rule for demo: anything in the demo that Dailyn might ask *"can I try this on a real prompt right now?"* must be real. Anything that's clearly an admin setup task (push policy, Intune sync) can be UX-only with an honest sentence at the close.

# 9. What this changes about the close

The pilot ask gets sharper because the demo is sharper. Updated proposal for the May 7 call (replaces the open Pilot Proposal task in the Client Log):

- **Stage 0 (free, 1 week):** Sandbox + 1-3 IT users. Dailyn + 1 colleague test desktop agent on their Surface fleet. We confirm Windows ARM 64 path.
- **Stage 1 ($5K, 30 days, money-back):** Deploy to **one department** — strong recommendation: **Grants Management (12 users)**. They're the highest-risk group (grantee SSN/EIN, financial data) and the demo seeded data already shows them as top-redaction dept. Real PII redaction in production. Real coaching. Two policies pushed via Intune. Weekly review with Tage + Jun.
- **Stage 2 (annual):** 80 users × $10/mo = **$9,600/year**. $5K pilot fee credited. Net Year-1 spend ≈ $9,600. Net-zero new spend if they retire Prompt Security on the Sentinel One side at renewal.

Money-back guarantee language for the SOW: *"If at the end of the 30-day pilot Dailyn determines Prompt Shields has not delivered material reduction in PII exposure across Weinberg's AI usage, we refund the $5K in full. Standard."*

# 10. Open items before May 7

For Jun:

- [ ]  Branch the demo dashboard repo, build the curated 6-page version above.
- [ ]  Replace logo with Prompt Shields × Weinberg lockup (top-left).
- [ ]  Seed all dummy data per §6. All sample names tagged [DEMO] and culturally varied; do not match any name on Weinberg's public Leadership page.
- [ ]  Wire the "+ New Policy" modal so Dailyn can actually create one in-call (state can live in browser memory; no backend needed for the demo).
- [ ]  Stub a downloadable PDF at the end of Audit & Report (even a single-page mock is enough).
- [ ]  Confirm Windows ARM 64 build path so we can answer his question honestly when it comes up.
- [ ]  Host on a path he can hit live mid-call: e.g. `weinberg.demo-dashboard.promptshields.com`.

For Tage:

- [ ]  Send pre-call recap email in the morning (kills the Sentinel-One-vs-Prompt-Security misread we made on April 23).
- [ ]  Update the [Pricing Proposal page](https://www.notion.so/Pricing-Proposal-Weinberg-Foundation-80-AI-users-34aeef33c03281daa864f621c0eab68b?pvs=21) to reference Grants Management as the recommended pilot dept and add the money-back guarantee clause.
- [ ]  Prepare the SentinelOne + Purview "complements, doesn't compete" 1-pager (open item from Client Log — still required).
- [ ]  Decide if we ask the decision-maker / budget-owner question on this call, or hold for the next. Recommend: ask. Without it the deal stays mid-probability.

---

*Prepared from: Apollo conversation 69ea2f7abfcf7a0011749beb · [Weinberg Foundation — Client Log](https://www.notion.so/Weinberg-Foundation-Client-Log-34ceef33c03281feb4beeb116cdbd346?pvs=21) · [Pricing Proposal — Weinberg Foundation (80 AI users)](https://www.notion.so/Pricing-Proposal-Weinberg-Foundation-80-AI-users-34aeef33c03281daa864f621c0eab68b?pvs=21) · [Daily Coach Feedback — 2026-04-23](https://www.notion.so/Daily-Coach-Feedback-2026-04-23-Thu-34ceef33c032819087cff85fd7fe789e?pvs=21) · live audit of [demo-dashboard.promptshields.com](http://demo-dashboard.promptshields.com) · [hjweinbergfoundation.org](http://hjweinbergfoundation.org).*