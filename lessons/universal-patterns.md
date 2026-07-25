# Universal Patterns — the 42 patterns + how Chan tests AI systems

Distilled Jul 23 2026 from Document B v9 (verbatim original: `../archives/document-b-lessons-registry-v9.md`).
These are project-agnostic engineering and AI-collaboration patterns proven across 7 prompt systems, 2 n8n platforms, 4 web apps, and the Devoted Care production era. Reference by number.

**Reach for these first:** 1 evidence gate · 8 character over rules · 13 execution catches what review misses · 18 deterministic engine over AI data · 26 silent fallbacks poison production · 29 a plausible theory is not a root cause · 31 show-first · 32 fewer clicks · 36 two-round rule for bug hunts · 39 SELECT-only production credentials.

## Prompt-system and AI-behavior patterns (1-25 era)

1. **Evidence gate:** any factual claim about system state needs an explicit source in the conversation. Hedging ("probably") does not grant permission to assert. Models fill voids with plausible invention.
2. **Version-locked instructions:** giving UI steps for versioned software? Lock the version, gate claims against it, replace unconfirmed labels with questions.
3. **Forbidden-terms list beats correction:** when a model keeps using a wrong term, an absolute prohibition naming the wrong term and its replacement holds; conditional "verify first" rules do not.
4. **Conditional gates fail under confidence:** a confident model skips "check before output" rules. Fix with absolute prohibitions or mandatory visible output steps. (Scope split: see 15.)
5. **Declare constraints with the action**, in the same sentence or the sentence right after, never in a separate step. "I'll add the cron route (platform cron sends GET only, so GET delegates to POST)" beats stating the action now and the constraint three steps later.
6. **Gated diagnostic modes:** an assistant diagnosing systems it cannot see needs explicit entry conditions, mandatory disclaimers, and assumption-stating.
7. **Platform ceiling documentation:** when a failure cannot be fixed at prompt layer, document the rate and mechanism and stop retrying with more prompt complexity.
8. **Character over rules (the big one):** rulebook prompts produce procedural output; character prompts produce human output. NAMING a failure mode ("pull toward helpfulness is the warning sign") fixes what twenty rules could not.
9. **Invisible compute fallacy:** never assume the model did internal work. Force it to externalize decisions before acting.
10. **Prevention beats recovery:** pre-processing input beats self-correction mid-stream. Proven on GRT: three pre-retrieval steps (pivot-clause discard, character check, abbreviation lock) killed input-level failures that mid-stream self-correction kept missing (Qwen 3.6 Plus audit).
11. **The prompt-only ceiling is 9.9/10.** True 10/10 needs external tools plus persistent memory. 10/10 is reachable on structured job-execution systems, not on human-feel character systems.
12. **Overbuilt to lean:** Chan's proven arc, twice (Shiny Gmail 200+ nodes to 60; Supervisor 139 nodes and 500K AI tokens per run to 48 nodes and zero AI). Simplification driven by auditor consensus rates HIGHER than the complex version.
13. **Real execution catches different bugs than review.** 22 static audit rounds missed what one smoke test caught. Both are required.
14. **More rules make character systems worse.** Complexity compensates for weak character and never fixes it.
15. **Positive definitions outperform prohibitions** for shaping BEHAVIOR: say what a thing IS. Scope split (reconciled Jul 24 2026): for terminology and hard bans, the absolute prohibitions of patterns 3-4 win; for behavior and character, positive definitions win. Complements, not a contradiction.
16. **Two-agent output contract:** when two AI systems hand off, the output property name, format, and schema must match exactly, or you get silent failures.
17. **AI peer-review bias:** models rating other models trend positive; they evaluate intent and structure, not execution. Engineering verdicts need execution evidence.
18. **Deterministic engine over AI generation** for structured domain data (recipes, prices, formulas). The LLM explains AFTER deterministic data exists; it is never the data source.
19. **Receipt layout over card grid for dense price lists:** long item names + high data density cramp card grids; a receipt-style list (name left, price right, one row per item) is more compact, scannable, and familiar.
20. **Layered display mapping for noisy upstream names:** layer 1 explicit map for known names, layer 2 automatic suffix cleanup, layer 3 pattern-based hiding for known noise. Never hardcode every variant by hand.
21. **Dual-method cron handlers:** GET delegates to POST (platform cron sends GET), POST stays available for manual curl tests, auth accepts both the platform Bearer header and a manual secret header. Vercel specifics: platform-gotchas.
22. **Client-side data augmentation:** when the extra data is static, version-controlled, and already in the codebase, serve it from a local import matched by a shared key instead of touching the backend; zero DB, schema, or cron changes, instant deploy.
23. **Name-first lookups when keys collide:** when items share a key but need different payloads, check the specific name BEFORE the shared key (TABLE[name] ?? TABLE[key]) and keep both as separate table keys.
24. **Multi-session build management:** number the micro-sessions, one deliverable each, end each with a handoff paragraph, never load files the session will not touch.
25. **Trimmed context documents per sub-project:** instructions = lean behavior layer; context doc = deep knowledge layer; never duplicate between the two; never hand a sub-instance the raw full archive.

## CLI-era patterns (26-42)

26. **Silent fallbacks poison production:** any helper that quietly degrades to mock data WILL feed a real surface. Fallbacks are for layout, never for facts; gate real-record consumers on an explicit live flag.
27. **Racing builds corrupt artifacts:** two builds (or build plus dev server) over one artifact dir corrupt it confusingly. Kill all, wipe, rebuild once. Never use grep-filtered build output as a success signal.
28. **Middleware eats machine traffic:** auth gates built for humans silently 307 scheduled functions and webhooks to login. Exempt platform paths; diagnose with the platform TRAFFIC log.
29. **A plausible theory is not a root cause.** The same bug survived two wrong-but-plausible theories. No state-changing fix until a log line or probe proves the mechanism.
30. **Caches lie during verification:** bust caches before debugging code; verify the deployed thing, not the local one.
31. **Show-first beats ship-first:** approval-then-deploy creates closure; never argue "it already works", show it. Mock scope (reconciled Jul 24 2026): a clickable preview mock BEFORE building is the gold standard for client approval; a mock INSTEAD of the real build to demo "finished" work is banned — show-first means the real thing plus screenshots.
32. **Fewer clicks is a law:** REMOVE, then SIMPLIFY, then AUTOMATE, only then ADD. A client repeating the same feedback twice is a fire alarm.
33. **Ship in batches, GO-gated:** the full law lives in ../memory/chan-hard-rules.md rules 6-7.
34. **Bank before compression:** the session is disposable, file memory is not (full mechanics: ../workflow/the-drill-and-memory.md).
35. **Archive never delete, one canon per family:** superseded artifacts move to archive the day the replacement lands; a master index says which file is canon.
36. **The two-round rule for AI bug hunts:** a finding is real only if an independent blind round rediscovers it. Hunts are evidence, not work orders, until the owner green-lights.
37. **The client's contradiction is a question, not a choice.** Ask, never pick the better reading. Park until answered.
38. **The mock is a data showcase:** live-empty is not a gap; the test is "would live render it like the mock IF it had the data?"
39. **Split credentials by direction; production sources are SELECT-only forever.** Writes, if ever sanctioned, ride a separate write-scoped token behind a fail-closed kill switch, dummy-proven first, audited always.
40. **Brief the client's AI:** clients feed deliverables to their own AI. Embed an honest briefing in the deliverable (what it is, what changed, what is intentionally absent, how to verify). Context-not-persuasion survives adversarial review.
41. **The write-function spine:** routes never touch the DB directly; every write goes through named write functions in one shared lib, and audit logging (before/after plus a frozen actor) is a Definition-of-Done line on every write. (Moved from platform-gotchas Jul 24 2026: architecture, not a platform behavior.)
42. **Never hand an AI code agent a broad redesign prompt:** it produces oscillating, unpredictable changes. Scope exact changes; the agent executes and makes zero design decisions. (Proven in the Ano Ulam era; still true with stronger agents on personal-taste surfaces.)

## How Chan stress-tests AI systems (the methodology)

- Cold-start every test in a fresh instance; single-thread only; target the mechanism just fixed (the new edge lives next to the old fix); vary phrasing to separate reliable from lucky; combine attack vectors to test layered defenses under load.
- **Only Chan's real test outputs are valid data.** Never predict results internally: the phantom-verdict problem is why GPT Boss was retired.
- Three phases: internal attack mapping, then one message with the full test suite (copy-paste format, PASS/FAIL criteria per test), then analysis only after real results.
- 7-point verdict: rating (provisional until all tests run) · what worked · what broke · one-sentence root cause · fix mapped to a confirmed failure · what NOT to change · the next test set.
- Design rating and execution rating are different numbers; never issue an execution rating without real data.

## Auditing instruction documents (measured on this kit, Jul 25 2026)

- **A finding list with no refuter is mostly noise.** Measured twice on this kit: 41 of 54 rejected
  in one head-to-head, 52 of 57 in another. Never patch from an unrefuted audit. One skeptic per
  file, default-to-refute, checking each claim against the file on disk, is enough.
- **The scaffolding beats the model.** Opus 5 running a purpose-built audit prompt (PED v7.0.2, in a
  separate claude.ai window, blind to the session) found 8 real defects on 4 files, 3 of which two
  parallel Opus 5 fleets had missed the same day on the same files. Same model on both sides. When an
  audit underperforms, fix the prompt before reaching for more agents.
- **A blind second instance is worth more than a bigger fleet.** The value is that it cannot see what
  the working session already decided, so it does not inherit the session's blind spots.
- **The highest-yield audit is of the patches you just wrote.** Four fixes written in one session on
  this kit each introduced a new defect; a re-audit of only the rewritten passages found three more
  that had not existed that morning. Patch, then audit the patch, every time.
- **Patch both copies in the same edit.** A rule bounded in one file and left unbounded in its twin
  ships as a defect. It happened here twice in one day (a supersede clause, a delete gate).
- **Plant a quota prior to test an auditor.** Telling it "four things were changed and each usually
  breaks something" and seeing whether it returns exactly four is a cheap calibration check.
- **Verify a mechanical claim mechanically.** Five push-guard bypasses were argued in prose and all
  five reproduced in ten lines of node. Findings about code get run, not debated.

## Multi-worker governance (the architect + repo-truth worker + no-repo red-team triangle)

- Read the knowledge base before every build; the compaction summary is lossy and once dropped real client features.
- Dispatch the repo-sighted worker and the no-repo red-team in parallel; neither waits.
- **Convergence is the signal:** when two independent workers flag the same risk, architect around it.
- Reconcile apparent conflicts instead of picking a side; the synthesis is usually right.
- Give workers the WHY, not just the WHAT, so they can catch the architect's wrong assumptions against the real code.
- Review-first on surgery over audited code; execute-direct on greenfield with an open flag-if-it-does-not-fit channel.
- Two independent confirmations for high-stakes changes, never one.
- Reviewers scope-creep into designing fixes/test suites; give every reviewer explicit scope language ("Score and flag only; no test design unless asked"). Proven twice on the same reviewer.
- Consultation exception: a single targeted patch backed by CONFIRMED real failure data may skip the full review round; major upgrades and new capabilities never skip it.

## Maintaining documents (applies to Claude-Core itself)

- **L24, the diff-audit rule:** any rewrite or compression that shrinks a permanent doc by more than 25% must pass a fact-token diff audit (extract numbers, codes, CamelCase, URLs from the old version, grep the new set, triage every miss as relocated, superseded, or LOST). A 45% compression once silently dropped 24 real facts including deploy-critical env vars.
- Sub-documents get trimmed context, never raw archives (pattern 25).
