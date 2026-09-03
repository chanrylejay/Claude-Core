---
name: memory-index
description: The router for all memory reads. The state block below is the machine-readable mirror of the NOW line; the two update together in the same edit, always.
state:
  updated: 2026-08-30
  active_track: client-trial        # 2-week trial, Australian clients, monday.com
  trial_active: true
  job_hunt: backgrounded
  devoted_engagement: ended-2026-07-24
  closure_checklist: complete
  mode_default: TRIAL
  active_project: projects/trial-aug2026/project-canon.md   # the boot read for "what is Chan working on right now"
cold_start:            # opened RAW on every boot, on top of the auto-loaded contract + this index
  - memory/chan-hard-rules.md
  - memory/chan-judgment-mandate.md   # lean:lookup
  - memory/chan-critique-directives.md   # lean:lookup
  - memory/chan-review-bottleneck.md   # lean:lookup
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
  TRIAL:               # = trial card + canon (batch 1, Aug 30 2026); the CLIENT_BUILD set + monday.md are LOOKUP below
    - memory/chan-trial-aug2026.md
    - projects/trial-aug2026/project-canon.md
  LEAN:                # trivial tasks: contract + index + hard rules; the canon and the three lean:lookup files go to LOOKUP
lookup:                # verified present at every boot, NEVER read at boot; open at the trigger on the line (why: ../lessons/audit-log.md AL-20)
  - workflow/two-model-relay.md          # cutting a patch or a brief (the ramp points here)
  - workflow/the-drill-and-memory.md     # after a compaction; before any memory-file edit
  - workflow/qa-gauntlet-pattern.md      # the work classifies HEAVY (contract, "The QA gate")
  - workflow/new-project-checklist.md    # a new build starts (CLIENT_BUILD mode still loads it)
  - lessons/platforms/monday.md          # any monday.com work (the trial card and canon point here)
  - projects/REGISTRY.md                 # the work touches a project other than active_project
boot:
  budget_chars: 40000  # ceiling on the BOOT list's bytes; the boot net goes red above it. Ladder in AL-20
metadata:
  type: reference
---

# Memory Index — Chan (portable)

- Person basics: Chan (Chanryle Cagara), chanrylecagara@gmail.com, Quezon City PH. Builds fast with AI help, reviews as the boss. Plain words, no em dashes.
- NOW (Aug 30 2026), mirroring the frontmatter state block, the live-state source: 2-week CLIENT TRIAL ACTIVE (Australian clients, monday.com platform; see chan-trial-aug2026) is the track; job hunt backgrounded behind it; Devoted ENDED Jul 24 2026, closure checklist ALL DONE; portfolio demo v2 live. Edit the block and this line together when any of it stops being true. Staleness test, mechanical, BOTH conditions required: a dated entry elsewhere in this index is NEWER than the block's date AND is about engagement status, active track, or portfolio/demo state; a newer date on any other subject says nothing about this block. When both hold, the dated entry wins: say so and confirm the current state with Chan before this block decides anything (client-active, QA path, mode routing). (why two conditions: ../lessons/universal-patterns.md, "Gates that always fire").
- RUNTIME (PERMANENT, Chan Sep 2 2026): two hands are live on the real machine: Claude Code in VS Code runs the DeepSeek endpoint (blind, so screenshots save to file), and Codex has been the second pair of hands since Sep 1. Codex is on Chan's free month, normally gpt-5.6-terra at medium effort; its meter is separate and the kit stays lean. It remains Chan's own account only: a client-account or client-funded cutover needs Chan's explicit ruling first. Claude access in VS Code is NOT coming back — plan around this, never around its return. Codex can inspect images, but Chan's eyes still sign them off. Who does what is in the frozen core; mechanics in ../workflow/two-model-relay.md.
- Legend: ⭐ core · ⭐⭐ most-violated, read twice · 🛑 hot state, check before acting · 🔒 hard gate.
- MODES, additive (the cold-start set always loads too), read before working: the file lists live in this file's frontmatter `modes:` block (`templates/boot-claudeai.mjs` resolves them); this prose carries only what lists cannot. JOB HUNT caveat: engagement numbers are SOURCE MATERIAL; the skills ledger is the ceiling on what gets cited. TRIAL (client-active) = trial card + canon since Aug 30 2026; the rest of the old set sits in the `lookup:` block, triggers on its lines, loaded when the work needs them (why: ../lessons/audit-log.md AL-20). LEAN (trivial tasks) = contract + index + hard rules; the three ⭐ judgment files tagged `lean:lookup` go to LOOKUP there, since a trivial task writes no UI report and parks no decision, and every other mode carries them on purpose (batch 4b, Aug 31 2026). A project mapped to a mode MUST name that mode's files AND the cold-start set in its own workspace CLAUDE.md READ-FIRST line — a session reading only that line never reaches this index. Prose and frontmatter are mirrors: any mode-set change edits BOTH in the same edit, and the boot net pins that every listed file exists.

Read top-down. COLD START: the frozen core auto-loads via the hub, then OPEN the cold-start set (the frontmatter `cold_start:` list), all RAW (Bash, never ctx_*; the full law is the drill home). The DRILL home (../workflow/the-drill-and-memory.md) opens IN FULL after any COMPACTION and before any memory-file edit. The ⭐⭐ files ride every boot ON PURPOSE, LEAN excepted: they are judgment behaviors no hook can enforce, so repetition is their only mechanism.

- [⭐ Chan's HARD rules](chan-hard-rules.md) — rule-0 THE DRILL · show-first · 🔒 ship in batches (no push/deploy without explicit GO) · DB safety · judgment mandate.
- [⭐ Chan's judgment mandate](chan-judgment-mandate.md) — don't just execute edit lists; self-rate every surface 1-10 and close the gap.
- [⭐ Career/portfolio state](chan-career-portfolio-state.md) — career track state (trial active Aug 2026, job hunt backgrounded); portfolio/resume/LinkedIn state + confidentiality canon. Loads with JOB HUNT mode.
- [⭐⭐ Directives are NOT absolute](chan-critique-directives.md) — critique every directive (client's OR Chan's) + propose better; the owner decides.
- [⭐⭐ The review-bottleneck lesson](chan-review-bottleneck.md) — Chan is often the single reviewer: plain language, screenshots, small slices.
- [⭐ Visual complaint → open the reference first](chan-visual-complaint-open-mock-first.md) — compare anatomy vs the reference image before measuring.
- [Priority: client sprint over hygiene](chan-priority-client-sprint-over-hygiene.md) — WHEN a client sprint is active, it beats internal cleanup: kit ideas go to the backlog (lessons/audit-log.md, newest AL entry), and Chan says when they start. Whether a sprint is active is the state block's `trial_active` line, never this line (why it went stateless: AL-27).
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
