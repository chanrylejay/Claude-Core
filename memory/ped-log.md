---
name: ped-log
description: "Running receipt log of every PED (Nautica) prompt audit. One line per audit: date, target, ask, verdict, fix applied. Doubles as regression memory (a fixed prompt-bug never returns) and raw material for the AI/prompt-engineering case study. Started Jul 25 2026."
metadata:
  type: reference
---

# PED audit log

One line per audit, newest first. Columns: DATE | TARGET | ASK | VERDICT | FIX / OUTCOME.
The whole point: a prompt bug PED caught once must never ship twice, and every entry is a
sentence of the eventual case study. Full context on PED itself: [[ped-prompt-auditor]].

- 2026-07-25 | PED v7.0.1 (Opus 5) | 5-round program, rounds 1-4, sealed keys | R1 recall 3/3 clean, R3 attacks 5/5, R4 routing 10/10, R2 PRECISION FAIL (3 findings on a verified-clean control, all rejected 9-0 by refuters) | drove v7.0.2.
- 2026-07-25 | PED v7.0.2 (Opus 5) | round 5 both halves: fresh seeds + the proven-clean control | PASS BOTH. Recall: both required seeds caught, quotes verbatim, zero fabrications. Precision: CLEAN SWEEP, zero findings, and all three previously-inflated findings correctly moved to NOTED AND CLEARED | v7.0.2 = 10/10, promoted.
- 2026-07-25 | PED v6.3 self-audit (seeded-defect + red-team program) | audit + 5 red-team probes, A/B vs candidates | v6.3 1/3 on buried seeds, LIGHT-protocol inconsistency exposed | drove the v6.4.x patch arc.
- 2026-07-25 | CHAMPIONSHIP: v6.4.3 (R1) vs v7.0 (Opus 5), both auditing 4 Claude-Core files, blind-judged | bare audit x4 each | v7.0 WON: 13 real findings vs 3, ZERO fabrications from either | 8 real kit defects fixed and pushed (commit bb6ee06); 4 of them were in text Claude wrote the same day.
- 2026-07-25 | Claude-Core hub/contract/index/protocol (the 4 load-bearing files) | external audit + 8-agent adversarial verification | 8 confirmed real, 46 claims rejected as stretches | fixed: self-satisfying presence check, verified-by-SAVING, tiny-change carve-out, deploy-gate parenthetical, undefined READ-FIRST, ungated delete, stale PED note.
- 2026-07-25 | v7.0 5-round validation program AUTHORED (not yet run) | n/a | materials pre-verified; the clean control was rejected twice for containing real defects Claude wrote by accident (v2.0 four, v2.1 three) before clearing five auditors at v2.3 | ready in session scratchpad/v7-rounds/, gated on Chan having Claude access.
- 2026-07-25 | PED v6.4.3 (challenger) | 3 fresh seeds + 5 red-team probes, sealed keys | CLEAN: 3/3 seeds, 0 fabrications, all probes held | v6.4.3 = production; the buried-equivalence defect finally caught.

## Queued (not yet run)
- ano-ulam PDF-to-CSV extractor prompt (step one of ano-ulam v3).
- ano-ulam "Bakit" / recipe explainer prompt.
