# Document Directory — Claude-Core

Every file in this kit, one line each. Keep this current: **any new file added to the kit gets a
line here** (same rule as a memory index). Exception: memory/ files are indexed one line each in
`memory/MEMORY.md` only, never here too.

## Root

- `README.md` — what this kit is, how to use it, what was deliberately left out.
- `CLAUDE.md` — the operating contract; auto-loads into EVERY session via the @import in the global hub.
- `TOOLS.md` — historical catalog of the Devoted-era tools; operational rules live in `workflow/tool-playbook.md`.
- `DIRECTORY.md` — this file.
- `.gitignore` — repo exclusions (the repo is PUBLIC by decision, README, so these are the publish line): archives/, LOCAL-ONLY-* files, secret patterns (.env*, keys, credentials, zips), settings files, and *.code-workspace never get committed.
- `.gitattributes` — pins `*.mjs` and `*.js` to LF: hooks and nets are compared byte-for-byte against their installed copies (templates/global/_ritual_test.mjs fails closed on drift), and core.autocrlf would rewrite the working tree to CRLF while the committed blob stays LF, false-failing that check on every fresh checkout (found Aug 11 2026).

## memory/ — who Chan is

- One durable fact per file; every file is indexed in `memory/MEMORY.md`. Read THAT index; it is the only home for memory descriptions.

## workflow/ — how we work together

- `the-drill-and-memory.md` — THE DRILL (don't trust summaries; verify disk) + the memory-system mechanics and discipline.
- `qa-gauntlet-pattern.md` — the 6-role agent review chain and the guard hooks that make it real.
- `tool-playbook.md` — operational lessons: visual verification, the ask-measure-sweep rule for visual iteration, diagnose-before-crusading, EOL-aware editing, DB discipline.
- `new-project-checklist.md` — the starting ritual for any real build: docs skeleton, live-data verification, write-safety day one, ship cadence.
- `new-computer-migration.md` — moving Claude's brain to a new PC: what to copy, what to reinstall, the absolute-path gotcha.
- `devoted-closure-checklist.md` — the closure-day runbook (closure was Jul 24 2026): status flips done, LinkedIn/resume sweeps, tooling-cost revisit, week-1 momentum kit.
- `switch-to-deepseek.md` — the DeepSeek switch runbook, RUN Jul 2026 and now permanent; kept as the re-install / model-change / rollback procedure. NO-vision caveat inside.
- `two-model-relay.md` — the agent + claude.ai collaboration protocol: roles, authority split, the branch-first loop, the brief format, standing rules (REACHABILITY CHECK referenced, not duplicated).

## lessons/ — universal lessons (project-agnostic)

- `universal-patterns.md` — the 42 numbered patterns + AI stress-testing + multi-worker governance + the L24 doc diff-audit rule. Reference patterns by number.
- `engineering-lessons.md` — migration-cutover trap, regression nets, push=deploy discipline, ranking systems, display≠data.
- `client-collaboration-lessons.md` — show-first→approve→deploy, verbatim ask capture, the review bottleneck, leaving clean.
- `platform-gotchas.md` — per-platform behaviors (Vercel, Neon, Supabase, Netlify, Next/npm, DeepSeek, Bolt, n8n, scraping); read before building on any of them.
- `grounded-agent-playbook.md` — LLM features on real data: claim cages, resolver gates, red-team corpus law. Read before ANY AI feature.
- `lean-ctx-freeze-playbook.md` — the empty-workspace ctx_* freeze: root cause, the seed-file fix, recovery recipe, recurrence log.

## projects/ — per-project canons (read only when working that project)

- `devoted-care/design-lessons.md` — the Devoted Care design canon (client-era laws, type scale, patterns). Project-specific, NOT Chan's personal defaults.
- `ano-ulam/project-canon.md` — Chan's own product (he continues it post-Devoted): full architecture, recipe-engine laws, closed decisions, bug list. Read before ANY ano-ulam work.

## templates/ — reusable infrastructure

- `verify-install.mjs` — the bootstrap arming check: is THIS machine fully armed? Byte-equality of the three installed hooks against their templates, settings wiring (matcher parity = trap 1, `|| exit 2` = trap 2, statusline), an existing absolute path, then LIVE-FIRE of the INSTALLED files in a sandboxed home (tokenless push must be BLOCKED, ritual must speak, meter must render), plus a trap-4 shadow scan for project-level guards. Exits 1 naming what is broken; prints the trap-3 reminder every run. + `_bootstrap_test.mjs`, its net (9 pins: an armed machine, and one mutation per failure mode).
- `judgment-sample.mjs` — the judgment layer's DETECTOR (not a gate): samples recent local session transcripts for the shapes that accompany the violations the two most-violated behavioral files exist to prevent (claimed a screen without the shot, a session with zero pushback, unstructured walls, done-without-evidence) and prints counts. Weak signals, never blocking; the one hard failure is reading nothing. + `_judgment_test.mjs`, its net (14 pins over three transcript shapes).
- `_l24_audit.mjs` — the L24 rewrite audit as a deterministic script (worktree vs a git ref; triage in-place / relocated / LOST; exit 1 on loss) + `_l24_test.mjs`, its net, which also pins the script's class list in sync with the law's floor in universal-patterns. Hand-running L24 is the fallback only.
- `_pointer_test.mjs` — the pointer-integrity net: every memory file indexed exactly once, every index link resolves, cap headroom, DIRECTORY coverage of TRACKED files, contract paths exist; untracked delivery transients (CODING-BRIEF-*/FIX-*/*.patch, root only) and untracked kit additions ALREADY indexed here pass with notes; any other untracked file fails as a stray. MANDATORY after any file add, rename, or delete.
- `leanctx-seed.js` — copy into any workspace root; gives the lean-ctx graph indexer one parse target so it never freezes (keep + commit it).
- `project-claude-md.md` — starter CLAUDE.md for any new repo: what it is, the stack, the run command.
- `apply-deepseek-switch.mjs` — the one-shot switch script (backs up settings, merges the env block, validates; --dry-run to rehearse). Never holds the key.
- `agents/` — the QA gauntlet team (5 shipped project-agnostic agents + 2 client-persona skeletons; the review chain is 6 roles):
  - `agents/README.md` — the adaptation checklist and settings.local.json wiring.
  - `agents/_lawcheck_test.mjs` — regression net pinning each load-bearing runtime law to the agent file that must carry it; the pinned list's ONE home. MANDATORY re-run after any agent-file edit.
  - `agents/spec-reader.md` — ASK-DON'T-ASSUME requirements clarifier.
  - `agents/reviewer.md` — hostile code reviewer.
  - `agents/net-runner.md` — regression-net / anti-churn gate.
  - `agents/recon.md` — read-only codebase/data-flow tracer.
  - `agents/challenger.md` — adversarial filter on the other reviewers' findings.
  - `agents/client-qa.skeleton.md` + `agents/client-ux.skeleton.md` — the 2 client-persona SKELETONS, written fresh per project.
- `hooks/` — push-guard.mjs (PreToolUse: `git push` blocked unless a one-shot GO file exists) + gauntlet-guard.mjs (Stop: a build turn can't claim "done" without gauntlet tokens) + `_pushguard_test.mjs` / `_gauntlet_test.mjs` (some of them sandboxed behaviour checks that spawn the real hook) — in-kit regression nets, plain node, MANDATORY re-run after any hook edit. The session-ritual hook has one at `templates/global/_ritual_test.mjs` (tests the INSTALLED hook, not the template copy). The switch script has its own at `templates/_switch_test.mjs`. Assertion counts are deliberately NOT listed here: each net prints its own count when it runs, and a number written here goes stale silently (it did — this line claimed 28/33/9/13 against a real 38/47/22/19 on Jul 25 2026). Run them for the current numbers, and read each script's own header for how it must be invoked; no invocation rule is duplicated into this file.
- `global/` — dead-disk recovery copies of the machine-global automation (NOT auto-loaded): `session-ritual.mjs` (the seed-planting + drill-injection SessionStart hook) and `settings.global.skeleton.json` (placeholders only; rebuild ~/.claude/settings.json from it). Also `deepseek-meter.mjs` — the money-meter statusline (live balance via the official balance endpoint, today's observed spend, peak/off-peak state; zero token cost) — with its net `_meter_test.mjs` (parity-pins the meter's PEAK_UTC byte-equal to the hook's, MANDATORY after editing either literal or the meter). See `workflow/new-computer-migration.md`.

## archives/ — frozen originals (verbatim; never edit, never commit; READABLE for source checks, and nothing client-identifying is ever reproduced out of them; stale-lock warnings inside)

- `document-a-operating-briefing-v10.md` + `document-b-lessons-registry-v9.md` + `document-c-deep-archive-v9.md` — the three source docs Claude-Core descends from (operating briefing, lessons registry, deep archive).
- `job-hunting-supplementary.txt` + `ANO_ULAM_CLAUDE_BOSS_CONTEXT.txt` — frozen originals of the Jul 24 2026 absorption (distilled into the sales playbook, leads snapshot, and the ano-ulam canon); moved here from Downloads/Projects.

## portfolio/ — career material

- `devoted-project-summary.md` — internal source-material write-up of the Devoted build for resume/interviews; its numbers are gated by the skills-ledger ceiling (the ledger is the canon for facts and claims, the career state file for confidentiality).
