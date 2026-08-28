---
name: memory-index
description: The router for all memory reads. The state block below is the machine-readable mirror of the NOW line; the two update together in the same edit, always.
state:
  updated: 2026-08-28
  active_track: client-trial        # 2-week trial, Australian clients, monday.com
  trial_active: true
  job_hunt: backgrounded
  devoted_engagement: ended-2026-07-24
  closure_checklist: complete
  mode_default: TRIAL
  active_project: projects/trial-aug2026/project-canon.md   # the boot read for "what is Chan working on right now"
cold_start:            # opened RAW on every boot, on top of the auto-loaded contract + this index
  - memory/chan-hard-rules.md
  - memory/chan-judgment-mandate.md
  - memory/chan-critique-directives.md
  - memory/chan-review-bottleneck.md
modes:                 # machine-readable mirror of the MODES prose line below; the two update together, always. ADDITIVE: cold_start always loads too.
  JOB_HUNT:
    - memory/chan-career-portfolio-state.md
    - memory/chan-career-playbook.md
    - memory/chan-skills-ledger.md
    - memory/chan-job-application-email-prefs.md
    - memory/chan-freelance-sales-playbook.md
    - portfolio/devoted-project-summary.md
  ANO_ULAM:
    - projects/ano-ulam/project-canon.md
    - lessons/platform-gotchas.md
    - memory/chan-ai-cost-context.md
  CLIENT_BUILD:
    - workflow/new-project-checklist.md
    - workflow/qa-gauntlet-pattern.md
  TRIAL:               # = trial files + the CLIENT_BUILD set + the monday.com platform file
    - memory/chan-trial-aug2026.md
    - projects/trial-aug2026/project-canon.md
    - workflow/new-project-checklist.md
    - workflow/qa-gauntlet-pattern.md
    - lessons/platforms/monday.md
metadata:
  type: reference
---

# Memory Index — Chan (portable)

- Person basics: Chan (Chanryle Cagara), chanrylecagara@gmail.com, Quezon City PH. Builds fast with AI help, reviews as the boss. Plain words, no em dashes.
- NOW (Aug 28 2026): 2-week CLIENT TRIAL ACTIVE (Australian clients, monday.com platform — see chan-trial-aug2026), the current track · job hunt backgrounded behind it · Devoted ENDED Jul 24 2026, closure checklist ALL DONE · portfolio demo v2 live. Update this block when the mode changes OR when any line in it stops being true. It is the live-state source. Staleness test, mechanical, BOTH conditions required: a dated entry elsewhere in this index is NEWER than this blocks date, AND that entry is about one of the three things this block asserts (engagement status, active track, portfolio/demo state). A newer date on any other subject says nothing about this block and does not make it stale. When both hold, the dated entry wins: say so and confirm the current state with Chan before this block decides anything (client-active, QA path, mode routing). (why two conditions: ../lessons/universal-patterns.md, "Gates that always fire").
- RUNTIME (PERMANENT, Chan Aug 11 2026): Claude Code in VS Code runs the DeepSeek endpoint, NO vision, and Claude access there is NOT coming back — plan around this, never around its return. Who does what (planner, CLI, Chan's eyes) is in the frozen core; mechanics in ../workflow/two-model-relay.md.
- Legend: ⭐ core · ⭐⭐ most-violated, read twice · 🛑 hot state, check before acting · 🔒 hard gate.
- MODES (read the matching set BEFORE working; ADDITIVE — the cold-start set always loads too): the file lists live in this file's frontmatter `modes:` block (machine-readable; `templates/boot-claudeai.mjs` resolves them) — the prose here carries only the laws and caveats the lists cannot. JOB HUNT caveat: engagement numbers are SOURCE MATERIAL; the skills ledger is the ceiling on what gets cited. TRIAL (Aug 2026, client-active) = trial files + the CLIENT BUILD set + lessons/platforms/monday.md (platform-gotchas is the index of the per-platform files since the Aug 28 split). A project mapped to a mode MUST name that mode's files AND the cold-start set in its own workspace CLAUDE.md READ-FIRST line — a session reading only that line never reaches this index. Prose and frontmatter are mirrors: any mode-set change edits BOTH in the same edit, and the boot net pins that every listed file exists.

Read top-down. COLD START: the frozen core auto-loads via the hub, then OPEN chan-hard-rules + chan-judgment-mandate + both ⭐⭐ files — all index and READ-FIRST opens are RAW reads (Bash, never ctx_*; full law in the drill home, reachable from BOTH paths since Aug 2026). The DRILL home (../workflow/the-drill-and-memory.md) opens IN FULL after any COMPACTION and before any memory-file edit. The ⭐⭐ files ride every boot ON PURPOSE: they are judgment behaviors no hook can enforce, so repetition is their only mechanism.

- [⭐ Chan's HARD rules](chan-hard-rules.md) — rule-0 THE DRILL · show-first · 🔒 ship in batches (no push/deploy without explicit GO) · DB safety · judgment mandate.
- [⭐ Chan's judgment mandate](chan-judgment-mandate.md) — don't just execute edit lists; self-rate every surface 1-10 and close the gap.
- [⭐ Career/portfolio state](chan-career-portfolio-state.md) — career track state (trial active Aug 2026, job hunt backgrounded); portfolio/resume/LinkedIn state + confidentiality canon. Loads with JOB HUNT mode.
- [⭐⭐ Directives are NOT absolute](chan-critique-directives.md) — critique every directive (client's OR Chan's) + propose better; the owner decides.
- [⭐⭐ The review-bottleneck lesson](chan-review-bottleneck.md) — Chan is often the single reviewer: plain language, screenshots, small slices.
- [⭐ Visual complaint → open the reference first](chan-visual-complaint-open-mock-first.md) — compare anatomy vs the reference image before measuring.
- [Priority: client sprint over hygiene](chan-priority-client-sprint-over-hygiene.md) — WHEN a client sprint is active, it beats internal cleanup (dormant: no active client engagement since Jul 24 2026).
- [Chan-voice writing + job email prefs](chan-job-application-email-prefs.md) — no em dashes in ANY Chan-voice text; cover letters: all 4 links + full legal name + honest fit first; job emails: AI-assisted dev + flexible hours; contact info inside.
- [🛑 Client trial ACTIVE](chan-trial-aug2026.md) — 2-week trial, Australian clients, monday.com platform; the current track (banked Aug 28 2026). Check before routing modes or promising availability.
- [🛑 Devoted Care — ENDED Jul 24 2026](chan-resigned-devoted-jul15.md) — resigned Jul 15, resumed Jul 16-22, wound down Jul 23, handoff complete Jul 24. Fully hands-off: no client-system actions, ever.
- [Pre-Devoted assets (Apr-Jun 2026)](chan-pre-devoted-assets.md) — live apps, portfolio numbers, the private prompt vault (DO NOT TOUCH), security rulings SETTLED, do not re-raise.
- [⭐ Skills ledger + origin story](chan-skills-ledger.md) — THE canonical source for anything career-facing: skills, tools, metrics, the origin arc.
- [⭐ Career Resilience Playbook](chan-career-playbook.md) — standing posture, day-1-if-engagement-ends checklist, side-project flywheel. Devoted closure ran Jul-Aug 2026 and is COMPLETE (Chan, Aug 28 2026); the day-1 checklist fired and is done.
- [⭐ Freelance sales playbook](chan-freelance-sales-playbook.md) — Upwork laws, Zero-Call strategy, rate tiers ($35/hr display, flat T1-T4), no-benefits +₱3-5K rule, interview frames, employment history.
- [LOCAL-ONLY security rulings](LOCAL-ONLY-security-rulings.md) — the six settled rulings with site names and paths; gitignored, THIS MACHINE ONLY (a fresh clone will not have it). Do not re-raise the rulings.
- [Personal facts](chan-personal-facts.md) — married (the MSI is his wife's), cat named Khaku, hardware notes.
- [PED = validated prompt auditor](ped-prompt-auditor.md) — TWO production builds split by runtime: v7.0.2 on claude.ai (default while claude.ai access lives; validated 10/10 Jul 25 2026) and v6.4.3 on DeepSeek web (the free daily driver, survives revocation). Chan is the courier; bare "audit" works on both; the stress-test invocation is the fallback for v6.3 and earlier.
- [PED audit log](ped-log.md) — one line per PED audit; regression memory + case-study raw material; gate any prompt that gets reused, leaves this machine, or touches career/client data; if unsure, gate it or ask.
- [AI cost context](chan-ai-cost-context.md) — engagement ENDED Jul 24 2026, Claude access revoked ~Jul 25; Chan runs on his own DeepSeek key now (switch runbook in workflow/). DeepSeek raised prices Aug 16 2026: peak 09:00-12:00 + 14:00-18:00 Manila is 2x, hits no longer ~free — the four session habits inside are LAW before any CLI work. Keep the kit lean and mechanical for every model that runs it.
