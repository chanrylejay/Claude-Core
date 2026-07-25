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

- 2026-07-25 | PED v6.3 self-audit (seeded-defect + red-team program) | audit + 5 red-team probes, A/B vs candidates | v6.3 1/3 on buried seeds, LIGHT-protocol inconsistency exposed | drove the v6.4.x patch arc.
- 2026-07-25 | PED v6.4.3 (challenger) | 3 fresh seeds + 5 red-team probes, sealed keys | CLEAN: 3/3 seeds, 0 fabrications, all probes held | v6.4.3 = production; the buried-equivalence defect finally caught.

## Queued (not yet run)
- ano-ulam PDF-to-CSV extractor prompt (step one of ano-ulam v3).
- ano-ulam "Bakit" / recipe explainer prompt.
