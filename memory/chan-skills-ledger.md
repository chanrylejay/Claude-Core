---
name: chan-skills-ledger
description: THE canonical skills inventory + tools and technology ledger for Chan's resume, portfolio, proposals, and interview answers. Moved into Claude-Core Jul 23 2026 from Document A v10 section 3 (which lived only in the client's docs folder). Includes the origin story. Pull from here when drafting anything career-facing.
metadata:
  type: user
---

# Chan's skills ledger (canonical, as of July 2026)

**Positioning line:** "AI-native systems builder. Ships production platforms solo: full-stack web, API integrations, and AI automation, proven on a live US healthcare-adjacent operations platform."
**Metrics to cite:** solo-built 10-module production system with live daily users · sanctioned production CRM writes with audit trails and kill switches · SMS automation (10DLC) · AI triage pipeline in production · a 12.5k-line OpenAPI spec read end to end · multi-agent orchestration at scale (143-agent blind bug hunt with adversarial verification).

## Skills inventory
- **Full-stack production:** Next.js 14 + TypeScript + Tailwind · Supabase (Auth, RLS, migrations, PostgREST gotchas) · Neon · Vercel + Netlify (serverless, scheduled functions, deploy debugging via API) · build/CI discipline.
- **Integrations:** REST API auditing and integration from OpenAPI specs (AxisCare: spec read end to end, write semantics empirically proven) · OpenPhone/Quo SMS (10DLC, webhooks, auto-offer flows) · Netlify API · monday.com-adjacent flows.
- **AI engineering:** grounded agents with claim cages and validators · DeepSeek pipelines (care-note triage, structured JSON) · provider-agnostic AI layers · prompt systems (PED/Sentinel/GRT, 9.9-10/10 rated) · multi-agent orchestration · Claude Code power use (MCP toolchain, Playwright verification, persistent memory systems).
- **Automation:** n8n production workflows, error-handling architectures, Telegram bots · cron design · Healthchecks.io.
- **Data:** PostgreSQL · cross-system identity bridging · data-honesty design (honest-empty, provenance) · audit-trail architecture.
- **Product and client:** mock-first delivery · approval-gated shipping · operational workflow design for a real US home-care agency · client-facing reporting · design-system extraction from client artifacts.
- **The Operating Model itself** (memory-driven AI-assisted building; see workflow/ and lessons/): reproducible on any project, and rare in the market.

## Tools and technology ledger (interview answer source)
- **Languages:** TypeScript · JavaScript (Node ESM) · SQL (PostgreSQL) · Python (tooling, docs generation) · HTML/CSS · Bash + PowerShell.
- **Frontend:** React 18 · Next.js 14 App Router · Tailwind · design tokens/type scales extracted from client artifacts · standalone interactive HTML prototypes · PWA basics.
- **Backend and data:** Supabase (Auth, RLS, PostgREST, migrations, service-role patterns) · Neon · REST route design · audit trails · identity bridging · scheduled jobs.
- **Hosting and DevOps:** Netlify (deploys, env, scheduled functions, API debugging) · Vercel (serverless, cron, analytics) · GitHub + GitHub Desktop · ngrok · CI build parity.
- **Third-party APIs:** AxisCare CRM (reads at scale plus the agency's first sanctioned production writes: dummy-proven, kill-switched, audited) · OpenPhone/Quo (10DLC registration, programmatic SMS, inbound webhooks with signature verification) · Netlify API · Healthchecks.io · monday.com.
- **AI:** Claude Code (MCP servers, subagents, Workflow orchestration, persistent file memory) · claude.ai Projects · DeepSeek API · Gemini · grounded-agent architecture · prompt-system engineering.
- **QA:** Playwright (E2E click-throughs, screenshot evidence, authed flows) · adversarial hostile-review workflows · unit test suites · Bruno (API testing) · live production probing · log-proven root-cause analysis.
- **Deliverables:** python-docx and python-pptx client reports/decks in the client's brand · PDF generation · CSV analysis.
- **Domain:** US home-care operations (scheduling, coverage, EVV/attendance, care documentation, on-call workflows) · HIPAA awareness (de-identification, BAA landscape) · SMS compliance (10DLC) · healthcare-adjacent data honesty.

## The origin story (from Document C section J; use it in interviews)
Started non-technical: BS IT but no coding career; customer support, then admin, then content operations. The Clone v15 briefing recorded the starting point: "has four hours of n8n build experience documented."
From that point, evenings and weekends alongside a full-time job (while a 6-month Top Performer at Accenture), by June 2026: 7 production prompt systems · 2 deployed n8n automation systems · 2 deployed web apps · 1 viral product (Ano Ulam, 1K+ likes, 300+ shares, users' comments became the roadmap) · 60+ stress tests, 22+ audit rounds, 40+ bugs fixed · portfolio across 10 platforms.
Then June-July 2026: first paid client, and the entire Devoted Care platform shipped solo (see [[chan-career-portfolio-state]] and `../portfolio/devoted-project-summary.md`).
The arc IS the pitch: proof of learning velocity, discipline, and shipping.

## Employment history and education (canonical; from archive Doc A v10 §3, banked Jul 24 2026)

- Accenture — Content Operations Specialist, May 2025 - Jun 2026 (Top Performer 6 consecutive months).
- Teletech — customer support, Aug 2023 - Sep 2024 (95%+ CSAT).
- Alorica — customer support / CRM, 2022-2023.
- Accenture — Admin & Recruitment coordination, 2021.
- Education: BS Information Technology, QC University, June 2020. Based in Quezon City, PH.
- Then: personal automation era Apr-Jun 2026 → the paid Devoted engagement Jun-Jul 2026 (solo developer, ended cleanly Jul 24 2026).
