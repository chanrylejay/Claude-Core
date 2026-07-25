# Tools encountered on the Devoted Care project

Everything we actually used, Jun–Jul 2026 — what it was for, and the gotcha that cost us time.
Reference list for stocking any future project's toolbelt.
Operational rules have ONE home: `workflow/tool-playbook.md`; duplicated gotchas below were trimmed to pointers (Jul 24 2026). This file is the historical catalog.

## AI / agent tooling

| Tool | What we used it for | Hard-won gotcha |
|---|---|---|
| **Claude Code** (VS Code extension) | The build partner itself — all code, QA, deploys, incident response | An extension *update* once broke thinking blocks; downgrade fixed it. Environment rules: `workflow/tool-playbook.md`. |
| **Subagents** (`.claude/agents/*.md`) | The QA gauntlet (spec-reader → reviewer → net-runner → UX → QA) + recon | Tool-inheritance trap: see `workflow/tool-playbook.md`. |
| **Hooks** (`.claude/settings.json`) | push-guard (PreToolUse, blocks git push without the one-shot GO file — Claude creates that file ONLY on Chan's explicit spoken GO, never on its own, and it expires in 30 min) · gauntlet-guard (Stop, blocks "done" without QA tokens — a token is created only AFTER the agent actually ran; `GAUNTLET_OFF` and `BATCH` are Chan's files and Claude never creates either) | Settings-file safety: `workflow/tool-playbook.md`. |
| **Workflow tool** (multi-agent orchestration) | Parallel readers + synthesizer — produced the matching-logic explainer for the client | Scripts are plain JS; agents reach MCP tools via ToolSearch. |
| **Skills** | `impeccable` (design-quality passes + detector), lean-ctx skill | Skill detector hooks catch design slop mechanically — good as a UX-review step. |
| **lean-ctx MCP** (`ctx_read/search/shell/glob/tree/patch/compose`) | Token-compressed replacements for Read/Grep/Bash/Glob — the default tool layer | Quirks: no redirects/heredocs/`node -e`; compressed output can mangle exact values (re-run tight or read raw); paths outside its project root are unreachable. |
| **Playwright MCP** | Live-app verification, screenshots, login flows, narrow-width tests | Seeing-is-verifying rules: `workflow/tool-playbook.md`. |
| **Supabase MCP** (×2 servers) | Our intel DB (write-enabled) + the client's DB (SELECT-only, forever) | MCP-created tables need service_role GRANTs. DB law: hard rule 10 (`memory/chan-hard-rules.md`). |
| **DeepSeek API** | The LLM behind product AI features (care-note scanning, scheduler summaries, comm-log summaries) — cheap + good enough | One shared key across features; AI output always behind a human review queue. |
| **mem0 MCP** | Tried for memory | File-based `.md` memory won — human-readable, versionable, survives everything. |
| **Artifacts** (claude.ai hosted pages) | Deferred-ledger, scorecards, reports as shareable web pages | Default-private; strict CSP = fully self-contained pages only. |

## Stack

| Tool | Used for | Gotcha |
|---|---|---|
| **Next.js 14** (App Router) | The dashboard app | Build/dev-server clash and stale `.next`: `workflow/tool-playbook.md` + `lessons/platform-gotchas.md`. |
| **Supabase / Postgres** | App DB (profiles, intel tables, audit log) | Keep old columns through migrations (rollback-safe) — it's what made our data recovery possible. Archive-before-drop. |
| **Netlify** | Auto-deploy from `main` = push IS a production event | Middleware needed a `.netlify` matcher fix; cron via scheduled functions (30-min auto-scan). Verify live after every deploy. |
| **Node scripts** | Edits outside tool reach (`writeFileSync`), regression nets, one-off tests | EOL rules: `workflow/tool-playbook.md`. |
| **Python** | `python-docx` (client-facing navy reports) · `python-pptx` (report deck) · demo sanitizer script | Client report style: honest status, no question-lists, warm/plain. |
| **git worktrees** | Isolated proof-runs of risky changes before merging into a batch | Cheap insurance; the gauntlet ran proofs there. |

## External systems integrated

| System | Role | Gotcha |
|---|---|---|
| **AxisCare** | The agency's scheduling system of record — visits, caregivers, clients (read via a synced Supabase, SELECT-only) | Fields go stale: the "preferred caregiver" field was mostly dead records and got retired as a signal. Verify a field is ALIVE before weighting it. |
| **monday.com** | Caregiver availability pipeline (→ synced DB → app) | Name-bridge between systems had gaps — identity bridging needs its own table, not string matching. |
| **OpenPhone (“Quo”)** | SMS: auto-offer texts, send-as, inbound webhook | SMS-only, 10DLC approval required; outward sends gated on client's GO. |
| **TeamHub** | Attendance records (separate Netlify + Supabase) | Lesson: audit RLS on any inherited Supabase before trusting it. |
| **Figma / Google Slides / context7 MCPs** | Connected; lightly used (docs lookups, deck options) | — |
