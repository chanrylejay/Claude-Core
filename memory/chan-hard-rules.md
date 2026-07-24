---
name: chan-hard-rules
description: Chan's standing HARD rules, project-agnostic canon. THE DRILL, show-first, ship in batches with GO gates, QA ownership, DB safety, judgment mandate. Portable distillation (Jul 23 2026); the Devoted-era original lives in the Devoted archive.
metadata:
  type: feedback
---

**Chan's HARD rules. Canon in every project, every session.**
(Distilled Jul 23 2026 from the Devoted originals; the client-specific versions stay verbatim in the Devoted archive.)

0. **THE DRILL first** after any session start or compaction. Never answer straight from a compaction summary. Full mechanics: `../workflow/the-drill-and-memory.md`.

1. **Show-first, UI first.** Build the real thing, verify by LOOKING at a screenshot, then report in plain language. When a reference design or mock exists, match it exactly before doing functional extras. A model that cannot see images (DeepSeek, or any blind subagent) cannot judge a screen: SAVE the shot to a file, report the path, list what Chan should check, never claim it looks right. See workflow/switch-to-deepseek.md.

2. **Mock = data showcase.** Live-empty is not a gap; never fabricate data to fill one; honest absence beats invented values. Full pattern: number 38 in ../lessons/universal-patterns.md.

3. **Click through the UI when verifying.** Buttons, toggles, rows, modals, hover and active states. Never judge from the first static paint.

4. **Bank before compression; never trust the summary.** Full mechanics: `../workflow/the-drill-and-memory.md`.

5. **Ship flow, scaled to stakes.** Client work and big builds: build, hostile review, then commit. Personal projects: build, check it works, ship. Tiny changes skip the hostile review everywhere; Chan checks them himself. Exact heavy-vs-light test: the contract, Claude-Core/CLAUDE.md.

6. **Ship in batches, never push per fix.** Accumulate related fixes and ship as ONE batch: one full build, one hostile review, one commit and push, one verify pass. Batch means the PUSH (one deploy event), not one big reveal. Keep showing Chan each fixed area as it lands (report plus screenshot) so his review stays small; never let unreviewed work pile past one short sitting. See [[chan-review-bottleneck]]. Solo (un-batched) push only when production is broken or Chan asks for an immediate ship. Un-batching NEVER relaxes the GO gate: the push still needs Chan's explicit GO every time (Rule 7). Production is broken is never self-authorization to deploy: announce the emergency, get the GO, then ship. When asks are coming in live, announce "batching, will ship as one."

7. **No deploy-costing action without explicit GO, each time.** A push to an auto-deploying main, an API-triggered rebuild, or an env-var change all count as deploys. GO once is never GO forever. When something needs a rebuild to take effect, SAY so and WAIT.

8. **Away-autonomy, scaled to the model.** If Chan is out, keep working on reversible, low-stakes, already-specified work; QUEUE every product or deploy decision for his return instead of deciding it yourself (a weaker model has weaker judgment, so lean on the gates). Record every call in a decisions file, one plain line per call, newest first, so his catch-up read is short.

9. **Check the real DB and existing tables BEFORE building.** Sections connect; reuse existing tables instead of creating duplicates. Never assume "no table exists" from memory or a plan; verify against the live DB.

10. **Never write a third-party's production DB. Ever.** Read-only forever unless the DB is ours. Before any write or DDL call, confirm the tool name and project ref point at OUR database. Destructive SQL goes through a review-first artifact; archive, never delete.

11. **Design judgment mandate.** Do not just execute edit lists, his or a client's. Self-rate every touched surface 1 to 10 against the design canon and close the gap in the same pass. Flag conflicts with locked canon; the owner resolves. Use the Impeccable skill for any substantive UI work. See [[chan-judgment-mandate]] and [[chan-critique-directives]].
