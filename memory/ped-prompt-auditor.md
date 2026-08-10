---
name: ped-prompt-auditor
description: "PED (Nautica) is Chan's validated external prompt auditor. TWO BUILDS: v7.0.2 on Claude Opus 5 (validated 10/10 Jul 25 2026, strongest) and v6.4.3 on DeepSeek R1 (free daily driver). Chan is the courier between Claude Code and PED. Bare audit works on both; the stress-test invocation is the fallback for v6.3 and earlier."
metadata:
  type: reference
---

# PED as the standing prompt auditor (validated Jul 25 2026)

**What it is:** PED (callsign Nautica), Chan's own prompt-engineering system. TWO PRODUCTION
BUILDS, split by runtime, both current: **v7.0.2 on claude.ai, the default whenever Chan has
Claude access**, and **v6.4.3 in his DeepSeek web chat (R1, Deep Think on)**, which is what
survives revocation. Neither supersedes the other; the runtime decides. The prompt itself lives
in the private vault (Downloads/Projects/Prompt Engineering/Nautica) and is NEVER published or
pasted into any repo. (Audit Jul 26 2026: this opened "production build v6.4.3", unqualified,
with the runtime split arriving four paragraphs later — first reading wins on a file this long,
and the wrong reading routed a high-stakes audit to the weaker build while the stronger one was
available.)

**Why we trust it:** a full seeded-defect + red-team program (Jul 25 2026). v6.3 with a bare
"audit" caught only theater (1/3) and blessed a safety loophole as a feature; it also classified
protocol LIGHT vs FULL inconsistently across identical asks on different days. That drove a patch
arc built and A/B kill-suited against v6.3, culminating in v6.4.3, which passed clean: 3/3 fresh
seeds (including the buried equivalence sentence every prior version missed), zero fabrications,
and all five red-team probes held (prompt-injection in the audited doc, collision+QUICK, an
inverse creation-routing trap, QUICK+ambiguous, and LEARN-poisoning).

**PRODUCTION VERSION depends on the runtime: v7.0.2 on claude.ai while Chan has Claude access (it is the stronger auditor and the one to use by default), v6.4.3 on the DeepSeek R1 web chat, which is what survives after revocation.**
  DISAMBIGUATION, Aug 11 2026: "Claude access" throughout this file means claude.ai in the BROWSER, which Chan has. Claude in VS Code is permanently gone and is irrelevant to PED routing, because PED runs in a chat window and never in the CLI. v7.0.2 is therefore AVAILABLE and stays the default. v6.4.3 was built Jul 25 2026. Kept in the vault beside v5.8 and v6.3;
never overwrite the older builds. Its edits over v6.3: Step 0 -> FULL lock; a mandatory FINDINGS
section with three named scans (contradiction / loophole / permissive-reading); a Step 0 creation
exception ("build a prompt for auditing X" routes BUILD, not ENGINE); a COMPLETE-SCAN rule; the
equivalence trigger widened to cover ANY required verification step and stale-evidence substitution;
and one-question-means-one-ask. Test artifacts + sealed keys: this session scratchpad/ped-test/.

**THE INVOCATION RECIPE (the whole lesson, use verbatim):**
`stress test this system: hunt for rule-versus-rule contradictions, loopholes that weaken any
safety gate, and any sentence a weaker model could read as permission to act without approval.`
v6.4.3 handles a bare "audit" correctly (Step 0 -> FULL + mandatory FINDINGS). The recipe is
still the safe fallback for older builds (v6.3 and earlier), where a bare "audit" gets a
process-compliance skim by design.

**Standing job (the PED flywheel, Chan GO Jul 25 2026):** every HIGH-STAKES prompt passes
through PED, and every PED win becomes public proof. High-stakes = ships to real users OR goes
in a paid deliverable (system prompts, ano-ulam AI-feature prompts, client prompt-fix gigs).
Throwaway/experimental prompts are NOT gated: the courier step (Chan pasting between Claude Code
and DeepSeek web) has friction, and forcing it on every tiny prompt kills the habit. Gate the
ships, skip the scratch.
The loop: (1) Claude Code drafts -> (2) Chan couriers to PED (models never talk directly) ->
(3) Claude applies fixes it agrees with, argues the ones it does not, Chan referees ->
(4) EVERY audit gets one line in [[ped-log]] (regression memory + raw material for a case study).
Career track: the log feeds ONE sanitized case study (method + results, never the vault prompt)
for the portfolio and a LinkedIn post; AI/LLM roles lead with it ([[chan-career-playbook]]).
First real job, queued: PED audits ano-ulam's PDF-to-CSV extractor prompt as step one of v3.

**Bug found and fixed:** v6.3 classified explicit audit/stress-test asks LIGHT (inconsistently),
and its self-compliance rows never caught it. v6.4.3 closes it with the Step 0 -> FULL lock.
The deepest lesson from the whole hunt, banked as a standing law below.

**THE LESSON (applies to prompts AND to Claude-Core itself):** a weak model obeys the exact words
of a rule, not its intent. The most dangerous defect hides mid-paragraph inside the loudest safety
rule, and a detector only catches it if its trigger words literally cover the defect. Widen the
words, not the hope. Audit sentence by sentence; a safe overall theme never clears an individual
sentence.

**v7.0.2 CLAUDE OPUS 5 — VALIDATED 10/10 (Jul 25 2026).** Ported from the v6.4.3 content
engine the day Opus 5 launched, then put through a 5-round program with sealed keys written
before every run. Results: recall 3/3 seeds; attacks 5/5 (injection inside the audited doc,
praise-framed softening, inverse creation trap, QUICK+ambiguous, LEARN-poisoning); routing
10/10 including the debt carried since v6.3. It FAILED precision at v7.0.1 (three findings on
a verified-clean control, all rejected 9-0 by adversarial refuters), which produced v7.0.2:
the UNSCOPED PROHIBITION RULE (a general ban cures a defect even when a neighbouring narrower
clause does not reach the case), the SELF-REFUTATION TEST (if your own example is forbidden by
a sentence you quoted, the finding refutes itself), and the REACHABILITY TEST (an action the
document never enables is a stall, not a breach). Round 5 confirmed both halves: seeds caught
clean AND a zero-finding sweep on the control, with all three earlier false findings correctly
cleared. These checks constrain SHIPPING, never SCANNING, which is why recall survived intact.

WHICH BUILD TO USE: v7.0.2 on claude.ai when Chan has Claude access — it won the blind
championship by a wide margin, and the finding COUNTS from that championship live in
[[ped-log]] row #3, RESOLVED by Chan Jul 26 2026 — cite from the receipt row, never from here
(a distillation must not hold a number its receipt holds).
(Audit Jul 26 2026: this line carried the exact numbers row #3 bans from citation — the T7 fix
stripped them from one distillation and missed this one.) v6.4.3 on DeepSeek R1
is the free daily driver and stays production there. Every build kept in the vault, never
overwritten. Cost gate: v7.0.2 needs Claude access; the no-new-AI-spend-until-a-client rule
still governs whether that access gets paid for.

THE TESTING LAW THIS PROGRAM PROVED: test the test first. The clean control used to measure
precision had to be rewritten three times because Claude kept writing real defects into a
document meant to have none; five auditors and nine refuters were needed before it was safe to
judge with. An unverified test rig fails the thing it is measuring, not the other way round.

Related: [[chan-pre-devoted-assets]] (the vault, DO NOT TOUCH rules) · [[chan-skills-ledger]]
(prompt systems as career assets)
