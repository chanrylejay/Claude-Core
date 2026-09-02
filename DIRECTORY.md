# Document Directory — Claude-Core

Every file in this kit, one line each. Keep this current: **any new file added to the kit gets a
line here** (same rule as a memory index). Exception: memory/ files are indexed one line each in
`memory/MEMORY.md` only, never here too.

## Root

- `README.md` — what this kit is, how to use it, what was deliberately left out.
- `CLAUDE.md` — the operating contract; auto-loads into EVERY session via the @import in the global hub.
- `DIRECTORY.md` — this file.
- `.gitignore` — repo exclusions (the repo is PUBLIC by decision, README, so these are the publish line): archives/, LOCAL-ONLY-* files, secret patterns (.env*, keys, credentials, zips), settings files, and *.code-workspace never get committed.
- `.gitattributes` — pins `*.mjs` and `*.js` to LF: hooks and nets are compared byte-for-byte against their installed copies (templates/global/_ritual_test.mjs fails closed on drift), and core.autocrlf would rewrite the working tree to CRLF while the committed blob stays LF, false-failing that check on every fresh checkout (found Aug 11 2026).

## memory/ — who Chan is

- One durable fact per file; every file is indexed in `memory/MEMORY.md`. Read THAT index; it is the only home for memory descriptions.

## workflow/ — how we work together

- `the-drill-and-memory.md` — THE DRILL (don't trust summaries; verify disk) + orient-and-report law + "Where new facts go" (one home each; moved from the hub, batch 3a Aug 30 2026) + the memory-system mechanics and discipline.
- `qa-gauntlet-pattern.md` — the 6-role agent review chain and the guard hooks that make it real.
- `tool-playbook.md` — operational lessons: visual verification (incl. the no-vision screenshot hand-off), machine hygiene (subagent deny brief, settings.json; moved from the hub, batch 3a), the ask-measure-sweep rule for visual iteration, diagnose-before-crusading, EOL-aware editing, DB discipline.
- `new-project-checklist.md` — the starting ritual for any real build: docs skeleton, live-data verification, write-safety day one, ship cadence.
- `new-computer-migration.md` — moving Claude's brain to a new PC: what to copy, what to reinstall, the absolute-path gotcha.
- `devoted-closure-checklist.md` — the closure-day runbook (status flips, LinkedIn/resume sweeps, tooling-cost revisit, week-1 momentum kit), COMPLETE: all boxes done, Chan Aug 28 2026; kept as the template for future engagement closures.
- `switch-to-deepseek.md` — the DeepSeek switch runbook, RUN Jul 2026 and now permanent; kept as the re-install / model-change / rollback procedure. NO-vision caveat inside.
- `two-model-relay.md` — the agent + claude.ai collaboration protocol: roles, authority split, the branch-first loop, the brief format, standing rules (REACHABILITY CHECK referenced, not duplicated).
- `relay-boot-claudeai.md` — entry ramp for the claude.ai half of the relay: boot order, sandbox powers and limits, patch-delivery rules. Browser sessions read it first; the CLI never needs it.

## lessons/ — universal lessons (project-agnostic)

- `universal-patterns.md` — the 50 numbered patterns + AI stress-testing + multi-worker governance + the L24 doc diff-audit rule. Reference patterns by number.
- `audit-log.md` — dated audit findings extracted from the hot-path rules (drill, hard rules); rules carry `AL-n` pointers, the history lives here. Read only when asking WHY a rule is shaped as it is.
- `engineering-lessons.md` — migration-cutover trap, regression nets, push=deploy discipline, ranking systems, display≠data.
- `client-collaboration-lessons.md` — show-first→approve→deploy, verbatim ask capture, the review bottleneck, leaving clean.
- `platform-gotchas.md` — the platform INDEX since the Aug 28 2026 split: holds the two standing laws (irreversible-action duplication, the written-out GO law) plus one link per platform file in `platforms/` (Vercel, Neon, Supabase, Netlify, Next/npm, DeepSeek, Bolt, n8n, Google/Gemini, scraping, monday.com, Windows, Codex CLI). Same exception rule as memory/: each `platforms/` child is indexed one line HERE, never in this file too — the pointer net pins it.
- `grounded-agent-playbook.md` — LLM features on real data: claim cages, resolver gates, red-team corpus law. Read before ANY AI feature.
- `lean-ctx-freeze-playbook.md` — the empty-workspace ctx_* freeze: root cause, the seed-file fix, recovery recipe, recurrence log.

## projects/ — per-project canons (read only when working that project)

- `REGISTRY.md` — the project index: every project one line (state, repo, URL, context home). Read at boot with the active canon; a new project gets its line the same session it appears.
- `devoted-care/design-lessons.md` — the Devoted Care design canon (client-era laws, type scale, patterns). Project-specific, NOT Chan's personal defaults.
- `trial-aug2026/project-canon.md` — the ACTIVE project's public-safe canon (Australian services company trial): shape, decisions, build state, blockers; the `active_project` boot read. CLI fills it from the private repo; claude.ai safety-reviews before push.
- `ano-ulam/project-canon.md` — Chan's own product (he continues it post-Devoted): full architecture, recipe-engine laws, closed decisions, bug list. Read before ANY ano-ulam work.

## templates/ — reusable infrastructure

- `verify-install.mjs` — the bootstrap arming check: is THIS machine fully armed? Since batch 3a (Aug 30 2026) also the hub's only net: @import present, fallback layer present and canon-backed, moved-out laws absent, 45-line ceiling, every pointer resolves. Byte-equality of the three installed hooks against their templates, settings wiring (matcher parity = trap 1, `|| exit 2` = trap 2, statusline), an existing absolute path, then LIVE-FIRE of the INSTALLED files in a sandboxed home (tokenless push must be BLOCKED, ritual must speak, meter must render), plus a trap-4 shadow scan for project-level guards. Exits 1 naming what is broken; prints the trap-3 reminder every run. + `_bootstrap_test.mjs`, its net (9 pins: an armed machine, and one mutation per failure mode).
- `judgment-sample.mjs` — the judgment layer's DETECTOR (not a gate); `--log [path]` appends one dated line of counts (carrying det=N, the detector version; v2 since Aug 31 2026 knows the kit's STOP vocabulary) to ~/.claude/judgment-log.txt, which the session ritual prints at every boot with its age (batch 3b): samples recent local session transcripts for the shapes that accompany the violations the two most-violated behavioral files exist to prevent (claimed a screen without the shot, a session with zero pushback, unstructured walls, done-without-evidence) and prints counts. Weak signals, never blocking; the one hard failure is reading nothing. + `_judgment_test.mjs`, its net (14 pins over three transcript shapes).
- `_l24_audit.mjs` — the L24 rewrite audit as a deterministic script (worktree vs a git ref; triage in-place / relocated / LOST; exit 1 on loss) + `_l24_test.mjs`, its net, which also pins the script's class list in sync with the law's floor in universal-patterns. Hand-running L24 is the fallback only.
- `_pointer_test.mjs` — the pointer-integrity net: every memory file indexed exactly once, every index link resolves, cap headroom, DIRECTORY coverage of TRACKED files, contract paths exist; untracked delivery transients (CODING-BRIEF-*/FIX-*/*.patch, root only) and untracked kit additions ALREADY indexed here pass with notes; any other untracked file fails as a stray. MANDATORY after any file add, rename, or delete.
- `raw-read.mjs` — the RAW read on this machine (batch 3b, Aug 31 2026): `node <kit>/templates/raw-read.mjs <file> [--lines A-B | --head N | --tail N]`, verbatim between marker lines, MISSING named and exit 1; replaced the temp .mjs every session wrote. + `_rawread_test.mjs`, its net (8 pins).
- `_prose_test.mjs` — the prose-integrity net (batch 2, Aug 30 2026): tracked .md files only, three pins per file on FILE line numbers — no lowercase sentence start (the orphan tail a splice leaves; exempt by name with a reason), no wrapped line ending on a function word whose next line opens with a sentence OPENER (whitelist, not a proper-noun blacklist), even quote parity (so an unmatched quote fails loud instead of blinding pin A). Self-tests on runtime fixtures first, every run. Why: lessons/audit-log.md AL-21.
- `_safety_test.mjs` — the public-safety scan (batch 2, Aug 30 2026): every tracked file scanned for secret shapes (sk-/GitHub/AWS/Google/Slack keys, private-key blocks, JWTs, user:pass@ URLs, env-style secret lines minus placeholders) and for emails/phones outside an allowlist kept WITH reasons; never prints a match in full. No client-name denylist by decision: Chan's practice is fake names everywhere. Push is publish; this is the seatbelt. Why: AL-21.
- `_all.mjs` — the net runner, THE one mandatory command after ANY kit edit: discovers and runs every `*_test.mjs` under templates/, one line per net STREAMED as each finishes (Sep 1 2026: a 30 s command tool saw nothing from the buffered 51 s LIVE run), exit nonzero on any failure. Ritual runs LIVE against an installed hook or in TEMPLATE MODE (plants templates/global into a throwaway HOME) so the relay sandbox can prove hook patches; the machine certification stays verify-install's on the CLI box. Retires the per-edit "which nets" judgment call (the gap that shipped the stale arming pin, Aug 28 2026); per-net MANDATORY notes remain as single-net fallbacks.
- `boot-claudeai.mjs` — the browser half's mechanical boot (run from repo root right after the clone): prints CLONE HEAD freshness, resolves the state block + cold_start + mode set from the memory index frontmatter, prints BOOT (read now, RAW, in order, character-counted CRLF-normalized against `boot.budget_chars`; OVER BUDGET warns, the net is the red line) and LOOKUP (verified present, opened at the trigger on its line, never at boot), plus the state block's age (STALE past 14 days); exits 1 if any listed file is missing. LEAN mode = contract + index + hard rules, the three `lean:lookup` judgment files and the canon under LOOKUP (batch 4b, Aug 31 2026). Replaces prose-parsing, never the reading (batch 1, Aug 30 2026; why: lessons/audit-log.md AL-20). + `_boot_claudeai_test.mjs`, its net (18 pins: intact boot, freshness, default + override + LEAN resolution, dedup across both lists, ramp before index, LOOKUP exists, byte count honest, within budget (chars, CRLF-normalized), canon placement, lean:lookup placement, and one mutation per failure mode — unknown mode, deleted mode file, deleted lookup file, budget below count, stale state, stripped cold_start).
- `leanctx-seed.js` — copy into any workspace root; gives the lean-ctx graph indexer one parse target so it never freezes (keep + commit it).
- `project-claude-md.md` — starter CLAUDE.md for any new repo: what it is, the stack, the run command.
- `codex-chan-guard.rules` — Codex's push speed bump (Sep 1 2026): prefix rules forbidding git push, send-pack, remote rewrites and the deploy CLIs; installed byte-equal at `~/.codex/rules/chan-guard.rules`. A speed bump, not a gate (the -C spelling walks past it, proven); the gate is the push-guard hook port. Live-fire and clone law: lessons/platforms/codex.md.
- `codex-agents-md.md` — the two Codex doorway blocks (Sep 1 2026): block A is copied to `~/.codex/AGENTS.md` (global), block B to a project root next to its CLAUDE.md. Codex reads AGENTS.md, never CLAUDE.md, so these are its pointers INTO the one kit folder; the kit is never duplicated. Gotchas and the sandbox live-fire: lessons/platforms/codex.md.
- `codex/` — Codex guard layers (Sep 1-2 2026): `session-ritual.mjs` is the sole SessionStart reporter, resolves the kit router and active project at runtime, injects THE DRILL after compaction, reports every failed read plus git state and any stale `PUSH_GO`, and emits one JSON object only; `_session-ritual_test.mjs` stages it without touching the live home. `codex-guard-runner.mjs` preserves raw PreToolUse stdin while launching `codex-guard.mjs`, which imports the existing push parser, consumes only Chan's strict repo-bound `~/.codex/PUSH_GO`, and blocks remote rewrites; `fixtures/pretooluse-bash.json` and `fixtures/pretooluse-mcp-file-upload.json` pin the observed Bash payload and the uploads-only Playwright deny. `hooks.json` is the user-level wiring skeleton with structured JSON denies; `_codexguard_test.mjs` stages the launcher without touching the live home. `go.mjs` writes the token on Chan's chat GO (the DeepSeek protocol; one repo, one push) and refuses to overwrite one. `pre-push` is the byte-identical, per-clone Git gate and `_prepush_test.mjs` proves its strict, one-shot token behavior; the arming check must confirm `<clone>/.git/hooks/pre-push` is installed and equal. Live-fire stays mandatory.
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
- `global/` — dead-disk recovery copies of the machine-global automation (NOT auto-loaded): `session-ritual.mjs` (the seed-planting + drill-injection SessionStart hook) and `settings.global.skeleton.json` (placeholders only; rebuild ~/.claude/settings.json from it). Also `deepseek-meter.mjs` — the money-meter statusline (live balance via the official balance endpoint, today's observed spend, peak/off-peak state; zero token cost) — with its net `_meter_test.mjs` (parity-pins the meter's PEAK_UTC byte-equal to the hook's, MANDATORY after editing either literal or the meter). See `workflow/new-computer-migration.md`. Since batch 3b (Aug 31 2026) the ritual's boot message carries a [pulse] note: the last logged judgment sample with its age, and the dirty-tree count.

## archives/ — frozen originals (verbatim; never edit, never commit; READABLE for source checks, and nothing client-identifying is ever reproduced out of them; stale-lock warnings inside)

- `document-a-operating-briefing-v10.md` + `document-b-lessons-registry-v9.md` + `document-c-deep-archive-v9.md` — the three source docs Claude-Core descends from (operating briefing, lessons registry, deep archive).
- `job-hunting-supplementary.txt` + `ANO_ULAM_CLAUDE_BOSS_CONTEXT.txt` — frozen originals of the Jul 24 2026 absorption (distilled into the sales playbook, leads snapshot, and the ano-ulam canon); moved here from Downloads/Projects.

## portfolio/ — career material

- `devoted-project-summary.md` — internal source-material write-up of the Devoted build for resume/interviews; its numbers are gated by the skills-ledger ceiling (the ledger is the canon for facts and claims, the career state file for confidentiality).
