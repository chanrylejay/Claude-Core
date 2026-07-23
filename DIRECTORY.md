# Document Directory — Claude-Core

Every file in this kit, one line each. Keep this current: **any new file added to the kit gets a
line here** (same rule as a memory index). Exception: memory/ files are indexed one line each in
`memory/MEMORY.md` only, never here too.

## Root

- `README.md` — what this kit is, how to use it, what was deliberately left out.
- `CLAUDE.md` — the operating contract; auto-loads into EVERY session via the @import in the global hub.
- `TOOLS.md` — historical catalog of the Devoted-era tools; operational rules live in `workflow/tool-playbook.md`.
- `DIRECTORY.md` — this file.
- `.gitignore` — repo exclusions for the private GitHub move: archives/, LOCAL-ONLY-* files, and secret patterns (.env*, keys, credentials, zips) never get committed.

## memory/ — who Chan is

- One durable fact per file; every file is indexed in `memory/MEMORY.md`. Read THAT index; it is the only home for memory descriptions.

## workflow/ — how we work together

- `the-drill-and-memory.md` — THE DRILL (don't trust summaries; verify disk) + the memory-system mechanics and discipline.
- `qa-gauntlet-pattern.md` — the 6-role agent review chain and the guard hooks that make it real.
- `tool-playbook.md` — operational lessons: visual verification, diagnose-before-crusading, EOL-aware editing, DB discipline.
- `new-project-checklist.md` — the starting ritual for any real build: docs skeleton, live-data verification, write-safety day one, ship cadence.
- `new-computer-migration.md` — moving Claude's brain to a new PC: what to copy, what to reinstall, the absolute-path gotcha.
- `devoted-closure-checklist.md` — the closure-day runbook (closure was Jul 24 2026): status flips done, LinkedIn/resume sweeps, tooling-cost revisit, week-1 momentum kit.
- `switch-to-deepseek.md` — pointing Claude Code at DeepSeek the day Claude access dies: one command + one checkbox, models, NO-vision caveat, rollback.

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

- `leanctx-seed.js` — copy into any workspace root; gives the lean-ctx graph indexer one parse target so it never freezes (keep + commit it).
- `project-claude-md.md` — starter CLAUDE.md for any new repo: what it is, the stack, the run command.
- `apply-deepseek-switch.mjs` — the one-shot switch script (backs up settings, merges the env block, validates; --dry-run to rehearse). Never holds the key.
- `agents/` — the gauntlet team: README (adaptation checklist) + spec-reader, reviewer, net-runner, recon, challenger, plus client-qa/client-ux SKELETONS (persona agents are written fresh per project, starting from them).
- `hooks/` — push-guard.mjs (PreToolUse: `git push` blocked unless a one-shot GO file exists) + gauntlet-guard.mjs (Stop: a build turn can't claim "done" without gauntlet tokens).

## archives/ — frozen originals (verbatim, never edit, never commit; stale-lock warnings inside)

- `document-a-operating-briefing-v10.md` + `document-b-lessons-registry-v9.md` + `document-c-deep-archive-v9.md` — the three source docs Claude-Core descends from (operating briefing, lessons registry, deep archive).

## portfolio/ — career material

- `devoted-project-summary.md` — confidentiality-safe write-up of the Devoted build for resume/interviews, incl. safe-to-cite numbers.
