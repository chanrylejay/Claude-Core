---
name: ped-prompt-auditor
description: "PED (Nautica) is Chan's validated external prompt auditor on DeepSeek web. THE ASK PICKS THE DEPTH: 'audit' gets a shallow compliance skim, 'stress test + hunt contradictions/loopholes' gets the real adversarial pass. Chan is the courier. Validated by a seeded-defect test Jul 25 2026."
metadata:
  type: reference
---

# PED as the standing prompt auditor (validated Jul 25 2026)

**What it is:** PED (callsign Nautica, production build v6.4.3), Chan's own prompt-engineering system, running in his
DeepSeek web chat (R1, Deep Think on). The prompt itself lives in the private vault
(Downloads/Projects/Prompt Engineering/Nautica) and is NEVER published or pasted into any repo.

**Why we trust it:** a full seeded-defect + red-team program (Jul 25 2026). v6.3 with a bare
"audit" caught only theater (1/3) and blessed a safety loophole as a feature; it also classified
protocol LIGHT vs FULL inconsistently across identical asks on different days. That drove a patch
arc built and A/B kill-suited against v6.3, culminating in v6.4.3, which passed clean: 3/3 fresh
seeds (including the buried equivalence sentence every prior version missed), zero fabrications,
and all five red-team probes held (prompt-injection in the audited doc, collision+QUICK, an
inverse creation-routing trap, QUICK+ambiguous, and LEARN-poisoning).

**PRODUCTION VERSION: v6.4.3** (built Jul 25 2026). Kept in the vault beside v5.8 and v6.3;
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

**v7.0 CLAUDE PORT (Jul 25 2026, CANDIDATE):** the day Opus 5 launched, Fable 5 ported the
v6.4.3 content engine to Claude Opus 5 (claude.ai): "Nautica PED v7.0 CANDIDATE, CLAUDE OPUS 5.txt"
in the vault, beside the older builds. Content rules verbatim; platform layer rebuilt (SCOPE HOLD,
ANTI-SOFTENING, ARTIFACT LOCK; anti-rumination re-aimed at hedge-stacking). Pre-ship QA: a 33-agent
adversarial panel (4 lenses + per-finding refuters) confirmed 13 defects in the first draft, all
fixed; 16 other findings were refuted. Design law learned there: the prompt body carries NO
self-status and no test plan (it primed itself for its own probes); status lives in the filename
and in "PED v7.0 DEPLOYMENT + VALIDATION PLAN (...).txt" beside it, which holds the claude.ai
deployment steps (Project, memory OFF, effort xhigh/High) and the full validation round. v7.0
stays CANDIDATE and v6.4.3 on R1 stays production until Chan couriers a fresh-seed round on
claude.ai. Open items: the v6.4.3 vault file header still says CANDIDATE (stale, Chan flips it),
and the SHADOW TEAM visibility note's missing ENGINE carve-out is a latent defect in v6.4.3 too
(possible v6.4.4 backport). Cost gate: running v7.0 needs Chan's own Claude access; the
no-new-AI-spend-until-a-client rule applies.

Related: [[chan-pre-devoted-assets]] (the vault, DO NOT TOUCH rules) · [[chan-skills-ledger]]
(prompt systems as career assets)
