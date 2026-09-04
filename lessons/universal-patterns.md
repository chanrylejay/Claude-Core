# Universal Patterns — the numbered patterns (1–50) + how Chan tests AI systems

Distilled Jul 23 2026 from Document B v9 (verbatim original: `../archives/document-b-lessons-registry-v9.md`).
These are project-agnostic engineering and AI-collaboration patterns proven across 7 prompt systems, 2 n8n platforms, 4 web apps, and the Devoted Care production era. Reference by number.

**Reach for these first:** 1 evidence gate · 8 character over rules · 13 execution catches what review misses · 18 deterministic engine over AI data · 26 silent fallbacks poison production · 29 a plausible theory is not a root cause · 31 show-first · 32 fewer clicks · 36 two-round rule for bug hunts · 39 SELECT-only production credentials.

**Fetching one pattern without loading the file:** every pattern is a single line starting
with its number, so `grep -n "^38\." lessons/universal-patterns.md` returns pattern 38 whole
in one line. Use that for by-number references; open the full file only when working the
category.

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
21. **Dual-method cron handlers:** GET delegates to POST (platform cron sends GET), POST stays available for manual curl tests, auth accepts both the platform Bearer header and a manual secret header. Vercel specifics: platforms/vercel.md.
22. **Client-side data augmentation:** when the extra data is static, version-controlled, and already in the codebase, serve it from a local import matched by a shared key instead of touching the backend; zero DB, schema, or cron changes, instant deploy.
23. **Name-first lookups when keys collide:** when items share a key but need different payloads, check the specific name BEFORE the shared key (TABLE[name] ?? TABLE[key]) and keep both as separate table keys.
24. **Multi-session build management:** number the micro-sessions, one deliverable each, end each with a handoff paragraph, never load files the session will not touch.
25. **Trimmed context documents per sub-project:** instructions = lean behavior layer; context doc = deep knowledge layer; never duplicate between the two; never hand a sub-instance the raw full archive.

## CLI-era patterns (26-50)

26. **Silent fallbacks poison production:** any helper that quietly degrades to mock data WILL feed a real surface. Fallbacks are for layout, never for facts; gate real-record consumers on an explicit live flag.
27. **Racing builds corrupt artifacts:** two builds (or build plus dev server) over one artifact dir corrupt it confusingly. Kill all, wipe, rebuild once. Never use grep-filtered build output as a success signal.
28. **Middleware eats machine traffic:** auth gates built for humans silently 307 scheduled functions and webhooks to login. Exempt the EXACT paths that are failing, one literal route at a time (`/api/cron/daily`, not `/api/*`) — a prefix exemption opens every human-facing endpoint under it with no authentication at all. Each exemption is a hole in an auth gate: name it in the PR, and any exemption broader than a single literal route needs Chan's explicit OK. Diagnose with the platform TRAFFIC log.
29. **A plausible theory is not a root cause.** The same bug survived two wrong-but-plausible theories. No state-changing fix until a log line or probe proves the mechanism.
30. **Caches lie during verification:** bust caches before debugging code; verify the deployed thing, not the local one.
31. **Show-first beats ship-first:** build the real thing, screenshot it, get the nod, THEN it ships — never deploy on assumption. Approval-then-deploy creates closure; never argue "it already works", show it. Mock scope (reconciled Jul 24 2026): a clickable preview mock BEFORE building is the gold standard for client approval; a mock INSTEAD of the real build to demo "finished" work is banned — show-first means the real thing plus screenshots.
32. **Fewer clicks is a law:** REMOVE, then SIMPLIFY, then AUTOMATE, only then ADD. On an EXISTING workflow, validate it through real daily use BEFORE investing in the interface — adding features to an unproven workflow is how you over-build. A client repeating the same feedback twice is a fire alarm. (why: audit-log.md AL-9)
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
43. **When a client's tools contain AI agents, audit provenance before trusting any data you
    import.** Agentic assistants inside SaaS tools generate plausible-looking records —
    named people, complete-looking rows, scaffolding items — indistinguishable from real data
    by inspection. On one engagement, ~97% of a client workspace's boards were agent-generated,
    and agent-invented "workers" were seeded into a product and reached a demo script as its
    hero example. **Most platforms record a creator on every record: use that, not
    name-matching or plausibility.** Store the source-system creator id as a column so the
    filter is structural rather than a blocklist that rots. Boards can be MIXED — classify
    per item, never per source. Corollary: the fabricated rows were the ones with the most
    complete field coverage, because a generator fills every field and humans do not.
    **Completeness is a contamination signal, not a quality signal.**
44. **Revealed preference beats stated requirements.** When users are asked what they want,
    they describe their current workaround. What they have already BUILT for themselves,
    unasked, is the real requirement. On one engagement a client had ~370 auto-generated
    boards, ~90 abandoned template attempts, and exactly one board they made by hand and used
    daily — and that board was the product spec. Look for the artefact people maintain
    without being told to. It outranks any questionnaire, and it changes the pitch from "here
    is what I built for you" to "you already built this; I finished it."
45. **A number shown to a stakeholder gets confirmed by a human, never derived.** A headcount
    moved three times in one session (71 → 53 → 30) because each value was derived from
    whichever data source was in view, and each source counted a different entity: a
    contaminated import, an event log of sessions attended, and the actual roster. One
    question to the person who owns the process settled it in a sentence. **Derivation
    answers "what is in this table"; only a human answers "what does the business count".**
    Before any figure reaches a report, a dashboard or a deck, name the entity and have
    someone who owns it confirm the definition — then write that definition next to the
    number in code, or it drifts again.
46. **Surveillance-shaped features die, and take their data with them.** A per-person work
    view where only the manager watches teaches people to keep real work elsewhere — the
    same mechanism that leaves a "task board" holding placeholder rows and no assignees.
    Three fixes, all cheap: **put the manager in the same view with their own overdue items
    visible**; give the manager COMMENT rights rather than EDIT rights on other people's
    work, matching how bottom-up teams actually operate; and **never describe the feature as
    visibility for the boss** — describe it as "so nothing you are working on gets
    forgotten." Same feature, and the framing decides whether real work goes into it.
    Related: **an empty row for a person with no data says "you belong here"; omitting them
    says "this is not for you."**
47. **Container labels are not item states.** When importing from any tool that groups
    records (board groups, folders, swimlanes, playlist names), never derive a record's
    status from the container it sits in — read the item's own status field. On one import,
    71% of rows (42/59) carried the wrong status because the importer took the group name
    ("Working on it") while the items' own status column said Done — completed work then
    rendered as weeks-overdue, and the resulting UI looked catastrophically red for DATA
    reasons everyone tried to fix with design. Corollary: **when a screen looks wrong,
    audit what it displays before redesigning how it displays.** A stop-gate that reports
    the seed's distribution BEFORE any UI is built is what catches this class.
48. **Automation verifies presence, not judgment.** A browser-automation review
    (logged in, real DOM, all numbers checked, all links followed) passed a dashboard that
    a human rejected on sight — because every fact was present and correct while the
    composition was wrong: a backlog group had invaded the "personal" zone and an empty
    widget dominated the page. Machines confirm that things exist; only human eyes confirm
    that things are right. Keep the human as the explicit visual gate, and treat a passing
    automated review as "renders and links work," never as "looks good."
49. **Triage an external AI design review in three piles.** (a) Craft knowledge — adopt:
    e.g. oldstyle vs lining numerals (serif display fonts default to oldstyle figures whose
    3/4/7/9 descend below the baseline; `font-variant-numeric: lining-nums tabular-nums`
    fixes KPI digits), surface-layer separation, scrollbar styling. (b) Convention that
    contradicts researched decisions — reject with the reasoning: the reviewer prescribed
    a stock alarm-red urgency palette that the project had explicitly removed after user
    research; notably, where it reasoned from the design itself its proposed values
    CONVERGED on the project's own tokens, and where it pattern-matched generic SaaS it
    contradicted them. (c) **Its mockups — check for invented data.** The review's
    "improved" screen contained fabricated counts and wrong task numbers: a polished mock
    with made-up numbers is the same failure as fabricated seed data, in a prettier suit.
    Score the pixels separately from the truth.
50. **In a time-grid UI, the past belongs to a summary, the columns belong to the future.**
    A week-grid that renders past days wastes most of its width on columns whose late work
    is ALSO shown in an overdue summary — the grid pays twice for the past and has no room
    left for what's next. Start the window at today, run forward, and compress everything
    late into a per-row indicator (count pill) whose detail lives one click deeper.
    Related: when nearly 100% of items are "urgent," urgency colour carries zero
    information — move severity to a small element (a pill, not the whole chip), scale it
    in a few steps within the brand's palette, and reserve exactly one colour for
    completion so the system has reward as well as warning.

## Day 10 field lessons (4 Sep 2026, kit-day8-lessons)

- **Read the activity log before removing anything a human might be using.** An empty field is not evidence: the log distinguishes abandonment from active resistance. When an owner questions a recommendation, get the data; do not restate the recommendation.
- **Revealed preference beats stated process.** What people create or undo without being asked is the strongest product signal. A self-made grouping should be supported, a repeatedly hand-added value should be automated, and an invented status should be given a proper place. When the owner says to decide by actions rather than ask again, this pattern becomes the decision rule.
- **A data discrepancy may be a vocabulary mismatch.** Before changing records that look wrong, check whether the column label carries an old or misleading meaning. Rename the label when the data is right and the vocabulary is wrong.
- **Preserve before deleting, and say where it went.** Copy human-written prose into the surviving free-text field with a dated provenance tag before retiring a column. Before a merge, move the losing record's unique values to the survivor's notes with the source id; archive, never delete.
- **Verify view and layout writes by reading them back.** API writes can persist without rendering reliably. Read the view after writing, compare the column order, then hand the screen to the owner's eyes.
- **Duplicate detection needs normalisation and more than one key.** Match name, email, and phone after stripping punctuation and case. Time spacing separates same-day duplicates from genuine repeat business; never bulk-archive on a name match alone.
- **Blank is worse than wrong.** A record with no routing status is invisible to automations, filters, and dashboard counts. Hunt blank statuses as their own defect class.

## How Chan stress-tests AI systems (the methodology)

- Cold-start every test in a fresh instance; single-thread only; target the mechanism just fixed (the new edge lives next to the old fix); vary phrasing to separate reliable from lucky; combine attack vectors to test layered defenses under load.
- **Only Chan's real test outputs are valid data.** Never predict results internally: the phantom-verdict problem is why GPT Boss was retired.
- Three phases: internal attack mapping, then one message with the full test suite (copy-paste format, PASS/FAIL criteria per test), then analysis only after real results.
- 7-point verdict: rating (provisional until all tests run) · what worked · what broke · one-sentence root cause · fix mapped to a confirmed failure · what NOT to change · the next test set.
- Design rating and execution rating are different numbers; never issue an execution rating without real data.

## Auditing instruction documents (measured on this kit, Jul 25 2026)

- **A finding list with no refuter is mostly noise.** Measured twice on this kit; the counts live in
  `../memory/ped-log.md` entries #3 and #8, which is the receipt layer and WINS any numeric
  disagreement with this file. (why: audit-log.md AL-10) Never patch from an unrefuted audit. One skeptic per
  file, default-to-refute, checking each claim against the file on disk, is the MINIMUM, and it is
  what clears a finding for PATCHING. It does not make a finding independently confirmed. Pattern
  36's bar is the higher one and it still governs: before a finding is stated as fact to anyone
  outside this machine, or used to justify a change to a live system, an independent blind round
  must rediscover it.
- **The scaffolding beats the model.** Opus 5 running a purpose-built audit prompt (PED v7.0.2, in a
  separate claude.ai window, blind to the session) found 8 real defects on 4 files, 3 of which two
  parallel Opus 5 fleets had missed the same day on the same files. Same model on both sides. When an
  audit underperforms, fix the prompt before reaching for more agents.
- **A blind second instance is worth more than a bigger fleet.** The value is that it cannot see what
  the working session already decided, so it does not inherit the session's blind spots.
- **The highest-yield audit is of the patches you just wrote.** Four fixes written in one session on
  this kit each introduced a new defect; a re-audit of only the rewritten passages found three more
  that had not existed that morning. Patch, then audit the patch, every time.
- **ONE INSTRUCTION, ONE HOME.** The single highest-yield law in this kit. When the same
  operational instruction lives in two files, a fix lands in one and the other keeps issuing the
  old order — and the stale copy is usually the one a model reaches first, because it is the file
  that advertises itself as the home for that topic. Only ONE file may CARRY an instruction; every
  other mention points at it by path. It happened NINE times in a single day (Jul 25 2026) on this
  kit alone, the worst being a lessons file that named the wrong test flag for a provider-switch
  script and would have reconfigured the live machine, superseded in the script header that same
  morning. When you cannot avoid a second mention, mark it explicitly as a WARNING that may go
  stale rather than an instruction to follow: a stale warning costs a re-read, a stale instruction
  costs the machine. ENFORCEMENT IS A PRE-WRITE GATE, not a cleanup pass — nine hits in one day
  is what a recovery-only control looks like, and pattern 10 already says prevention beats
  mid-stream self-correction. BEFORE writing any operational instruction: grep the kit for the
  topic's distinctive phrase. One non-pointer hit elsewhere means the home already exists — write
  a pointer, not the instruction. Zero hits means you are creating the home: put it where
  DIRECTORY.md says that topic lives, and if DIRECTORY.md has no line for it, add one in the same
  edit. The GREP is the check and DIRECTORY.md is the index — this kit deliberately keeps no
  separate topic-to-home table, because that table would be a second copy of DIRECTORY.md's job
  and a list that drifts (audit Jul 26 2026).
- **A list drifts; the live thing does not.** Wherever a doc would ENUMERATE — files that hold
  secrets, env vars to delete, flags a script accepts, models a provider serves — write the QUERY
  that regenerates the list and name the live source of truth. Enumerate only when the list is
  short, checkable at a glance, and paired with the query that verifies it. Corollary: a cleanup
  step that lists the files to clean will miss the file the next script version adds.
- **Patch both copies in the same edit.** A rule bounded in one file and left unbounded in its twin
  ships as a defect. The count above is why this is not a soft preference.
- **Never put framing inside an AUDIT input.** An audit input is the document and nothing else.
  Notes explaining what the file is, why it matters, or what to watch for are PRIMING, and the
  auditor spends effort resisting them instead of reading. Measured here Jul 25 2026: a note saying
  "four fixes were made and each historically introduced a problem" was caught by the auditor as a
  quota prior it had to defend against, and a second note was quoted back as if it were evidence.
  Instructions for the human go in a separate file the human never pastes. This is the same defect
  as leaking seed text into a test prompt, which also happened here the same day: TWO STRIKES, so
  it is a standing rule now.
  This rule governs AUDITS — runs whose output you intend to act on. It does not govern auditor
  CALIBRATION, which is the next bullet: there the planted prior IS the experiment, the subject is
  the auditor rather than the document, and the result is never used as findings. Keep the two in
  separate chats and never let a calibration run supply a patch.
  Verify it mechanically, and NOT with a header grep — the strike that made this a rule was bare
  prose with no header, so a header grep returns clean on the exact input class that caused it.
  BUILD the paste file from the source files programmatically, then diff it back: every byte must
  come from a source file or from a separator line the builder itself emitted. The BUILDER is the
  source of truth for the separator format — diff against its output, never against a format
  transcribed into this file, because a transcribed format drifts and the check then fails on
  clean input, and a mechanical gate that fails on its own clean input gets switched off.
  Anything else is framing, whatever it looks like. (why: audit-log.md AL-11)
- **Plant a quota prior to test an auditor.** Tell it "four things were changed and each usually
  breaks something" when you do NOT know the real count. **The test is PROVENANCE, not arithmetic.**
  A FAIL is a count you cannot trace to per-finding evidence in the document, or any output that
  cites your framing as a reason for a finding. A PASS is any count — INCLUDING one that happens to
  match the plant — where every finding carries its own evidence against the file, and best of all
  an explicit note that the framing was noticed and set aside. A matching count is not yet a
  verdict: go read the findings. Real evidence per finding means a collision, and you record it as
  a collision so the next reader does not misread it; thin or absent evidence means the auditor
  filled a quota, and THAT is the anchor. (why: audit-log.md AL-12) Measured Jul 25 2026: PED got exactly this prior, shipped three, and wrote in its own
  output that the count came from the scan and not the framing.
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
- **Reachability check, both directions.** Before claiming any code is live or any protection is active, name the entry point: which file calls it, at which line. If the chain does not trace to a route, a script, or an INSTALLED hook, it is not live however correct it reads. Cost a wrong conclusion twice in one session, once from each seat (Jul 31 2026): the architect confirmed the push-guard TEMPLATE was well built and never checked it was installed — main had no protection at all; the repo-truth worker confirmed a capless fallback's control flow was reachable INSIDE its function and never checked the function is called — the whole subtree was dead. Local correctness in both cases, reachability asked about in neither. The seat predicts the error: the architect cannot see the machine so it verifies artifacts, the worker is paying per token so it stops at the function boundary.
- **The direction of that failure is stable, so it is predictable.** The architect seat fails by trusting
  documents at full confidence — a banked note, a vendor page, a stale releases listing, a README; a stale
  page reads exactly like a current one. Six instances in one session (Aug 11 2026): endpoint caching, the
  installed version (twice), tiered effort, the daemon, and dropping a scope qualifier while relaying a doc
  — that last one manufactures a claim the source never made. The rule: any claude.ai claim about machine
  state, the bill, or an installed version is a HYPOTHESIS until the CLI measures it, and the brief must
  write it as one. The CLI's counter-rule already exists (push back on wrong briefs); this is the
  drafting-side mirror of it.

## The layer budget: a new layer must retire two
Every mechanism looks cheap the day it ships and costs attention every day after. Standing
rule for this kit (audit Aug 2026, three reviewers converging): do not add a layer — a rule,
a hook, a net, a document — unless it either replaces something that exists or removes work a
human is doing by hand. When a new thing cannot name what it retires, that is the signal to
solve the problem inside an existing layer instead. A rule violated twice becomes a hook or a
test; a rule never exercised in months is a deletion candidate. Growth is not the same as
maturity: a kit that only accretes eventually spends more of its operator on itself than on
the work.

## Gates that always fire teach everyone to ignore them
A staleness (or safety) gate whose condition is satisfied by ordinary activity is worse than
no gate: every session sees it fire, learns the signal means nothing, and stops reading it.
Found Jul 26 2026 in the memory index — the NOW block's staleness test was date-only across
the whole index, so one unrelated dated line satisfied it permanently. The fix is the shape
to copy: require BOTH a newer date AND subject-match on what the block actually asserts.
When a gate fires constantly, tighten its condition; never train the reader to skip it.

## Maintaining documents (applies to Claude-Core itself)

- **L24, the diff-audit rule:** ANY rewrite of a permanent doc runs the fact-token diff audit, whatever happens to its length. The trigger used to be "shrinks by more than 25%", which measures the wrong thing: the harm is fact LOSS, so a rewrite that deletes env vars and adds replacement prose lands at net zero shrinkage, fires nothing, and needs no approval. Size is a hint, never the gate. A rewrite that shrinks a permanent doc by more than 25% of its characters is simply the case where you should expect the audit to find something. The audit: extract every fact-carrying token from the old version — numbers, dates, URLs, file paths, CamelCase identifiers, SCREAMING_SNAKE names (env vars, secrets, constants), kebab-case and snake_case names, commit hashes, version strings, flag names, and any quoted literal — grep the new set for each, and triage every miss as relocated, superseded, or LOST. Also grep for modal/negation words — "never", "only", "unless", "always", "must", "forbidden" — because a rewrite can keep every noun and drop the condition (auditor class, Aug 2026). That list is a FLOOR, never a ceiling: if the old version carries a fact-bearing token class not named there, add it before you run — in the SAME edit, add it to the shipped implementation `templates/_l24_audit.mjs` (its net `templates/_l24_test.mjs` pins the two lists in sync). RUN THE SCRIPT, never the hand version: hand-extraction by a model degrades silently over long texts, the exact failure this rule exists to catch (auditor finding, Aug 2026); hand-run only if the script is unavailable, and say so. Audit reads are RAW reads — git show and plain file reads, never a compressing layer. (why: audit-log.md AL-13) A LOST item FAILS the audit: restore it to the new version, or get Chan's explicit OK to drop that specific fact, before the rewrite ships. Triage alone is not a pass — labelling all 24 facts LOST and shipping satisfies every other word of this rule, which is precisely what happened: a 45% compression once silently dropped 24 real facts including deploy-critical env vars.
- **The self-conformance check.** Any document that states a law gets read once against its OWN
  contents with that law in hand: do the rows, entries, examples and instructions already in this
  file obey the rule it just wrote? A law contradicted by its own file is a defect in one of the
  two, and WHICH one is a question for Chan, never a pick. Run it on every permanent doc that
  carries rules, and again on any edit that adds or changes a rule. Measured Jul 25 2026: four of
  five defects in one audit of this kit were a rule disagreeing with its own file — an enumeration
  invariant four of its own rows broke, a pass/fail criterion that scored a correct result as a
  failure, a distilled count that disagreed with its receipt, and an extraction mechanism blind to
  the exact fact class its own worked example was written from. The two-round rule and L24 both
  check a document against REALITY; this one checks it against ITSELF, and nothing else here does.
- Sub-documents get trimmed context, never raw archives (pattern 25).

## Briefing a fan-out: the schema IS the contract

Earned on ano-ulam, 29 Jul 2026. A 14-agent workflow found 203 good Filipino
dishes and then drafted 203 unusable recipes. The research half was fine; the
drafting half failed, and every systematic cause was in MY brief, not in the
agents.

1. **I invented a field that did not exist.** The schema told agents to flag
   unpriceable items in `needsManualPrice`. The codebase has no such thing; the
   real mechanism was a 7th positional argument. 54 drafts were therefore
   silently unusable. **Grep the codebase for every field name you put in a
   schema before you send it.** A schema is a contract with the code, not a
   wish.
2. **I handed over a vocabulary that then changed underneath them.** Halfway
   through the run the unit system gained a new member, so the drafts encode a
   convention that no longer exists. **Freeze the inputs, or re-run the phase
   that consumed the stale ones.**
3. **I never mentioned a transform that silently rewrites their output.** A
   cost function quietly raised some quantities and not others, so identical
   authoring produced two behaviours. **Tell agents about the code that will
   mutate what they write.**

The reviewer agent caught all three, which is the argument for always having
one. But a reviewer finding your own brief was wrong is expensive: it costs the
whole generation phase. Ten minutes checking the schema against the repo would
have saved 861k tokens of drafting.

**Why:** in a fan-out, the brief is the only thing every agent shares, so a
flaw there is the one bug that reproduces perfectly across all of them.
**How to apply:** before launching, verify every field name, every enum and
every convention in the prompt against the actual code. Then ask what will
transform the output after they hand it over, and say so in the prompt.
