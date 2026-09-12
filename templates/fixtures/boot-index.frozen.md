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
  - projects/trial-aug2026/decision-log.md          # reconstructing WHY a trial decision was made
  - projects/trial-aug2026/relay-lessons-day8-9.md  # BINDING: before scanning or changing a Monday board, a client call or deck, or reference-led design
  - projects/trial-aug2026/sales-redesign-resume.md # before resuming the Sales redesign build
  - projects/trial-aug2026/applicant-report-resume.md # before applicant-report work
  - projects/trial-aug2026/mailbox-report-resume.md # before mailbox-report work
  - projects/trial-aug2026/trial-follow-up.md # before trial follow-up or a future build
boot:
  budget_chars: 40000  # ceiling on the BOOT list's bytes; the boot net goes red above it. Ladder in AL-20
metadata:
  type: reference
---

# Frozen index fixture — the memory/MEMORY.md frontmatter as of bb9979c (batch 1a, Sep 12 2026)

This file is a FIXTURE for `templates/_boot_resolver_test.mjs`, never a router: the frontmatter above is the live index's frontmatter frozen at the commit named, verbatim, so the resolver's per-seat outputs can be pinned against inputs that do not move. The prose of the live index is not needed for resolution and is not copied. When the index frontmatter takes a new shape, a NEW fixture is frozen beside this one; this one stays as the record of the shape batch 1a extracted from.
