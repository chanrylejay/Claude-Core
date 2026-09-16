---
name: memory-index
description: The router: a manifest the kit's one resolver reads; the prose carries only what lists cannot.
state:  # the live state, one home; review_by is metadata, never a gate
  updated: 2026-09-14
  active_track: client-trial
  trial_active: true  # review_by 2026-11-14, Chan's estimate, never a fixed end
  job_hunt: backgrounded  # review_by 2026-11-14
  devoted_engagement: ended-2026-07-24
  closure_checklist: complete
  mode_default: TRIAL  # review_by 2026-11-14
  active_project: projects/trial-aug2026/project-canon.md  # the canon: what Chan is working on now
  # STALENESS TEST, mechanical, BOTH required: a dated STATUS entry in the boot (a state value, a
  # date-hooked lookup trigger, a BOOT-read file's header; never a review_by) is NEWER than updated
  # AND concerns engagement status, the active track, or portfolio/demo state. Then it wins: say so
  # and confirm with Chan before this block decides anything (client-active, QA path, mode routing).
  # Why two: ../lessons/universal-patterns.md, "Gates that always fire".
cold_start:  # RAW on every boot
  - memory/chan-hard-rules.md
  - memory/chan-judgment-mandate.md  # lean:lookup
  - memory/chan-critique-directives.md  # lean:lookup
  - memory/chan-review-bottleneck.md  # lean:lookup
modes:  # additive; the workspace boot_mode: line picks one, else mode_default
  JOB_HUNT:
    - memory/chan-career-portfolio-state.md
    - memory/chan-skills-ledger.md
  ANO_ULAM:
    - projects/ano-ulam/project-canon.md
    - lessons/platform-gotchas.md
  CLIENT_BUILD:
    - workflow/new-project-checklist.md
  TRIAL:  # the default while trial_active is true
    - memory/chan-trial-aug2026.md
    - projects/trial-aug2026/project-canon.md
  LEAN:  # trivial tasks
lookup:  # verified present, never read at boot, opened at its trigger (AL-20)
  - memory/chan-trial-aug2026.md  # 🛑 before routing modes or promising availability
  - memory/chan-priority-client-sprint-over-hygiene.md  # a kit or hygiene idea while trial_active is true (AL-27)
  - workflow/two-model-relay.md  # cutting a patch or a brief
  - workflow/the-drill-and-memory.md  # after a compaction; before any memory-file edit
  - workflow/qa-gauntlet-pattern.md  # the work classifies HEAVY
  - workflow/new-project-checklist.md  # a new build starts
  - lessons/platforms/monday.md  # any monday.com work
  - projects/REGISTRY.md  # a project other than active_project
  - projects/trial-aug2026/decision-log.md  # reconstructing WHY a trial decision was made
  - projects/trial-aug2026/indeed-jobadder-reporting.md  # before any job-board scraping, applicant import, or weekly applications reporting
  - projects/trial-aug2026/sales-redesign-resume.md  # before resuming the Sales redesign
  - projects/trial-aug2026/applicant-report-resume.md  # before applicant-report work
  - projects/trial-aug2026/mailbox-report-resume.md  # before mailbox-report work
  - projects/trial-aug2026/trial-follow-up.md  # before trial follow-up or a future build
  - projects/ano-ulam/status-log.md  # resuming ano-ulam or verifying its state; the v3 STEP 0 gate inside BINDS
  - lessons/platforms/codex.md  # a Codex runtime, push-gate, sandbox, or shell question
  - lessons/universal-patterns.md  # a pattern cited by number; reference-led design; before rewriting a permanent doc (the L24 law)
  - lessons/client-collaboration-lessons.md  # BINDING: a client call, deck, or proposal; capturing a client's asks
  - DIRECTORY.md  # before creating a kit file, or to locate one
  - memory/chan-ai-cost-context.md  # LAW before DeepSeek CLI work; any AI cost or model decision
  - memory/chan-ai-cost-history.md  # why the cost posture is what it is
  - memory/chan-career-portfolio-state.md  # LinkedIn, resume, job-hunt, or portfolio work
  - memory/chan-skills-ledger.md  # any career-facing citation: the ceiling; engagement numbers are source material
  - memory/chan-career-playbook.md  # a career decision or an engagement ending
  - memory/chan-freelance-sales-playbook.md  # an Upwork proposal, a rate question, an interview frame
  - memory/chan-job-application-email-prefs.md  # before any Chan-voice text or job email
  - portfolio/devoted-project-summary.md  # writing about the Devoted project
  - memory/chan-resigned-devoted-jul15.md  # anything Devoted (ENDED Jul 24 2026; hands-off)
  - memory/chan-pre-devoted-assets.md  # the Apr-Jun 2026 apps, numbers, or prompt vault (DO NOT TOUCH)
  - memory/chan-visual-complaint-open-mock-first.md  # a visual complaint (the reference first)
  - memory/ped-prompt-auditor.md  # auditing a prompt with PED
  - memory/ped-log.md  # a prompt reused, shared, or touching career or client data: gate it
  - memory/chan-personal-facts.md  # a personal or hardware question
boot:
  budget_chars: 40000  # the ceiling, every seat and mode (AL-20)
metadata:
  type: reference
---

# Memory index

Chan (Chanryle Cagara), chanrylecagara@gmail.com, Quezon City PH. Builds fast with AI help, reviews as the boss. Plain words, no em dashes.

Lists route; a file's own `description:` says what it is; its `lookup:` line says when; this prose restates none of it. The rules the lists obey, and why: the resolver header (`../templates/boot-resolver.mjs`). [LOCAL-ONLY security rulings](LOCAL-ONLY-security-rulings.md): six settled rulings, gitignored, THIS MACHINE ONLY (absent in a fresh clone); do not re-raise.
