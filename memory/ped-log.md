---
name: ped-log
description: "Running receipt log of every PED (Nautica) prompt audit. One line per audit: date, target, ask, verdict, fix applied. Doubles as regression memory (a fixed prompt-bug never returns) and raw material for the AI/prompt-engineering case study. Started Jul 25 2026."
metadata:
  type: reference
---

# PED audit log

One line per audit, newest first — and when several land on one date, that order is the ONLY sequencing signal, so keep it exact and never append to the bottom. Columns: DATE | TARGET | ASK | VERDICT | FIX / OUTCOME.
The whole point: a prompt bug PED caught once must never ship twice, and every entry is a
sentence of the eventual case study. Full context on PED itself: [[ped-prompt-auditor]].

- 2026-07-25 | PED v7.0.2 (Opus 5, claude.ai) ROUND 3 | 4 kit files incl. a RE-AUDIT of passages Claude rewrote the same afternoon | 8 real, 0 fabrications. The re-audit found 3 defects that did not exist that morning, all introduced by Claude's own patches. It also refused a planted quota prior (the paste said 'four fixes, each historically introduced a problem'; PED shipped 3 and said so) | all 8 fixed, commit 1054137.
- 2026-07-25 | PED v7.0.2 (Opus 5, claude.ai) ROUND 2 | 4 kit files, sanitised paste, incognito | 8 real, 3 of them missed by BOTH parallel audit fleets running the same day on the same model | all 8 fixed, commit c19e416. THE RESULT THAT MATTERS: same model on both sides, so the prompt scaffolding won, not the model.
- 2026-07-25 | Wave-3 fleet, 16 agents, NO refuter stage | 16 kit files | 57 shipped -> adversarial refutation killed 52, 5 survived. Never patch from an unrefuted fleet | 5 fixed, commit 590cabf.
- 2026-07-25 | PED v7.0.1 (Opus 5) | 5-round program, rounds 1-4, sealed keys | R1 recall 3/3 clean, R3 attacks 5/5, R4 routing 10/10, R2 PRECISION FAIL (3 findings on a verified-clean control, all rejected 9-0 by refuters) | drove v7.0.2.
- 2026-07-25 | PED v7.0.2 (Opus 5) | round 5 both halves: fresh seeds + the proven-clean control | PASS BOTH. Recall: both required seeds caught, quotes verbatim, zero fabrications. Precision: CLEAN SWEEP, zero findings, and all three previously-inflated findings correctly moved to NOTED AND CLEARED | v7.0.2 = 10/10, promoted.
- 2026-07-25 | PED v6.3 self-audit (seeded-defect + red-team program) | audit + 5 red-team probes, A/B vs candidates | v6.3 1/3 on buried seeds, LIGHT-protocol inconsistency exposed | drove the v6.4.x patch arc.
- 2026-07-25 | CHAMPIONSHIP: v6.4.3 (R1) vs v7.0 (Opus 5), both auditing 4 Claude-Core files, blind-judged | bare audit x4 each | v7.0 WON: 13 real findings vs 3, ZERO fabrications from either | 8 real kit defects fixed and pushed (commit bb6ee06); 4 of them were in text Claude wrote the same day.
- 2026-07-25 | Claude-Core hub/contract/index/protocol (the 4 load-bearing files) | external audit + 8-agent adversarial verification | 8 confirmed real, 46 claims rejected as stretches | fixed: self-satisfying presence check, verified-by-SAVING, tiny-change carve-out, deploy-gate parenthetical, undefined READ-FIRST, ungated delete, stale PED note, and the files-are-current-state line in the boss protocol (the eighth; the original entry listed only seven and the count went unrecoverable until PED caught it Jul 25 2026 — every entry now lists as many fixes as it claims).
- 2026-07-25 | v7.0 5-round validation program AUTHORED (not yet run) | n/a | materials pre-verified; the clean control was rejected twice for containing real defects Claude wrote by accident (v2.0 four, v2.1 three) before clearing five auditors at v2.3 | ready in session scratchpad/v7-rounds/, gated on Chan having Claude access.
- 2026-07-25 | PED v6.4.3 (challenger) | 3 fresh seeds + 5 red-team probes, sealed keys | CLEAN: 3/3 seeds, 0 fabrications, all probes held | v6.4.3 = production; the buried-equivalence defect finally caught.

## Queued (not yet run)
- ano-ulam PDF-to-CSV extractor prompt (step one of ano-ulam v3).
- ano-ulam "Bakit" / recipe explainer prompt.
