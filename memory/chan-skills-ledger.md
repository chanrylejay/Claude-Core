---
name: chan-skills-ledger
description: THE canonical skills inventory + tools and technology ledger for Chan's resume, portfolio, proposals, and interview answers. Moved into Claude-Core Jul 23 2026 from Document A v10 section 3 (which lived only in the client's docs folder). Includes the origin story. Pull from here when drafting anything career-facing, and never claim past what is written here.
metadata:
  type: user
  chan_voice: true
---

# Chan's skills ledger (canonical, as of July 2026)

**This file is a CEILING, not a floor, and the ceiling is SYSTEM-WIDE.** Never claim a skill,
tool, metric, employer, date, or number that is not written here, and never restate a number
larger or a qualifier smaller than it is written. A figure in any OTHER file (a project
summary, a case-study draft, a section headed as safe to cite) is SOURCE MATERIAL, not
clearance: it is not usable outbound until it is written here. If something is missing, ask Chan
before writing it; when he confirms it, add it here in the same session, then use it. Asking is
the fast path, not the slow one. (Audit Jul 26 2026: the project summary held five figures this
ledger does not, under a "safe to cite" heading, and nothing ranked the two files.)
**Consent gate.** Resume and interview use is open. Any PUBLIC named case study, proposal, post,
or portfolio entry that uses the client-identifying entries below (Devoted Care, AxisCare, the
agency's production writes) needs that client's written OK on file first; see the confidentiality
rules in [[chan-career-portfolio-state]]. With no recorded OK, anonymize to "a US home-care
agency" or ask Chan.
**All Devoted metrics are frozen as of Jul 24 2026** (engagement ended, no access since). Never
state any of them in the present tense.

**Positioning line:** "AI-native systems builder. Ships production platforms solo: full-stack web, API integrations, and AI automation, proven on a US home-care operations platform he shipped solo (in production Jun-Jul 2026)."
**Metrics to cite:** solo-built 10-module production system, in production with daily users through Jul 2026 · sanctioned production CRM writes with audit trails and kill switches · SMS automation (10DLC) · AI triage pipeline in production · a 12.5k-line OpenAPI spec read end to end · multi-agent orchestration at scale (143-agent blind bug hunt with adversarial verification) · ~50-caregiver roster matched per shift · 15/19 client match-spec fields mapped and overlaid across engines · 36-test taxonomy regression net + 17-test push-guard net · 16-commit reviewed production batches (these five confirmed by Chan, Jul 26 2026, promoted from the project summary per the two-canon precedence rule).

## Skills inventory
- **Full-stack production:** Next.js 14 + TypeScript + Tailwind · Supabase (Auth, RLS, migrations, PostgREST gotchas) · Neon · Vercel + Netlify (serverless, scheduled functions, deploy debugging via API) · build/CI discipline.
- **Integrations:** REST API auditing and integration from OpenAPI specs (AxisCare: spec read end to end, write semantics empirically proven) · OpenPhone/Quo SMS (10DLC, webhooks, auto-offer flows) · Netlify API · monday.com-adjacent flows (no direct monday.com API work on record; ask Chan before claiming any).
- **AI engineering:** grounded agents with claim cages and validators · DeepSeek pipelines (care-note triage, structured JSON) · provider-agnostic AI layers · prompt systems (PED/Sentinel/GRT), self-scored 9.9-10/10 in internal Claude reviews, never to be cited as an external or client rating · multi-agent orchestration · Claude Code power use (MCP toolchain, Playwright verification, persistent memory systems).
- **Automation:** n8n production workflows, error-handling architectures, Telegram bots · cron design · Healthchecks.io.
- **Data:** PostgreSQL · cross-system identity bridging · data-honesty design (honest-empty, provenance) · audit-trail architecture.
- **Product and client:** mock-first delivery · approval-gated shipping · operational workflow design for a real US home-care agency · client-facing reporting · design-system extraction from client artifacts.
- **The Operating Model itself** (memory-driven AI-assisted building; see workflow/ and lessons/): reproduced across his own projects (Devoted, ano-ulam, the n8n systems); Chan's own read is that it is uncommon, which is his opinion and is never presented as a market fact.

## Tools and technology ledger (interview answer source)
- **Languages:** TypeScript · JavaScript (Node ESM) · SQL (PostgreSQL) · Python (tooling, docs generation) · HTML/CSS · Bash + PowerShell.
- **Frontend:** React 18 · Next.js 14 App Router · Tailwind · design tokens/type scales extracted from client artifacts · standalone interactive HTML prototypes · PWA basics.
- **Backend and data:** Supabase (Auth, RLS, PostgREST, migrations, service-role patterns) · Neon · REST route design · audit trails · identity bridging · scheduled jobs.
- **Hosting and DevOps:** Netlify (deploys, env, scheduled functions, API debugging) · Vercel (serverless, cron, analytics) · GitHub + GitHub Desktop · ngrok · CI build parity.
- **Third-party APIs:** AxisCare CRM (reads at scale plus the agency's first sanctioned production writes: dummy-proven, kill-switched, audited) · OpenPhone/Quo (10DLC registration, programmatic SMS, inbound webhooks with signature verification) · Netlify API · Healthchecks.io. (monday.com is deliberately absent here: adjacent flows only, no direct API work on record. See Integrations.)
- **AI:** Claude Code (MCP servers, subagents, Workflow orchestration, persistent file memory) · claude.ai Projects · DeepSeek API · Gemini · grounded-agent architecture · prompt-system engineering.
- **QA:** Playwright (E2E click-throughs, screenshot evidence, authed flows) · adversarial hostile-review workflows · unit test suites · Bruno (API testing) · live production probing · log-proven root-cause analysis.
- **Deliverables:** python-docx and python-pptx client reports/decks in the client's brand · PDF generation · CSV analysis.
- **Domain:** US home-care operations (scheduling, coverage, EVV/attendance, care documentation, on-call workflows) · HIPAA awareness (de-identification, BAA landscape) · SMS compliance (10DLC) · healthcare-adjacent data honesty.

## The origin story (from Document C section J; use it in interviews)
Started non-technical: BS IT but no coding career; customer support, then admin, then content operations. The Clone v15 briefing recorded the starting point: "has four hours of n8n build experience documented."
From that point, evenings and weekends alongside a full-time job (while a 6-month Top Performer at Accenture), by June 2026: 7 production prompt systems · 2 deployed n8n automation systems · 2 deployed web apps · 1 viral product (Ano Ulam; posted to the App Builders PH Facebook group, ~30K members, and per Chan it became the single most viral post in that group and pulled in new members; users' comments became the roadmap. NUMBERS UNSETTLED: the Jun 2026 archive recorded 1K+ likes / 300+ shares, Chan recalls ~7K likes by the time he stopped in Jul 2026 but said "or something". VERIFY against the live post before ANY career-facing use, and cite the verified figure, never the recollection) · 60+ stress tests, 22+ audit rounds, 40+ bugs fixed · portfolio across 10 platforms.
Then June-July 2026: first paid client, and the entire Devoted Care platform shipped solo (see [[chan-career-portfolio-state]] and `../portfolio/devoted-project-summary.md`).
The arc IS the pitch: proof of learning velocity, discipline, and shipping.

## Employment history and education (canonical; from archive Doc A v10 §3, banked Jul 24 2026)

- Accenture - Content Operations Specialist, May 2025 - Jun 2026 (Top Performer 6 consecutive months).
- Teletech - customer support, Aug 2023 - Sep 2024 (95%+ CSAT).
- Alorica - customer support / CRM, 2022-2023 (exact months not recorded: ask Chan, never infer one).
- Sep 2024 - May 2025 is an unrecorded gap between Teletech and Accenture: ask Chan what to put there, never fill it in.
- Accenture - Admin & Recruitment coordination, 2021 (handled 200+ candidates).
- Education: BS Information Technology, QC University, June 2020. Based in Quezon City, PH.
- Then: personal automation era Apr-Jun 2026 → the paid Devoted engagement Jun-Jul 2026 (solo developer, ended cleanly Jul 24 2026).
