---
name: trial-applicant-report-resume
description: Open before applicant-report or scraper work; dated progress and validation limits.
metadata:
  type: reference
---

# Trial applicant report resume (LOOKUP, never at boot)

Open before applicant-report or scraper work. These Sep 11 snapshots moved verbatim from the canon on Sep 12 2026, in their recorded order; the last entry records the live v4 timeout. Earlier diagnostic limits are historical, not fresh validation. The historical handoff filename below is now `LOCAL-ONLY-codex-architect-handoff-2026-09-10.md`, ignored and available only on Chan's machine; open that local file for the detailed handoff. This lookup copies no contents from it. Update this task home in the session that changes its state; the canon keeps the status.

- Sep 11 local: applicant scraper v4 supersedes the earlier diagnostic scripts. Navigation and recovery passed synthetic localhost browser checks; live employer-page validation is still outstanding. Actual elapsed-time tracking replaces the unsupported previous runtime estimate. Detailed handoff is in `codex-architect-handoff-2026-09-10.md`.

- Sep 11 local: banked an authorized, manual Indeed dashboard scraper reference for future applicant-report work; no candidate CSVs were copied into the repository.

- Sep 11 local: audited two manually scraped Indeed CSVs; they are raw one-column records suitable for a parser prototype, not yet a trustworthy direct import. A proposed Indeed Applicants daily-intake board is documented but not created.

- Sep 11 local: added a parser for the Indeed exports and restricted the first report to 7–11 Sep (154 organized applications; positions parsed, locations mostly unresolved). Monday board creation remains pending a stable key and explicit approval.

- Sep 11 local: the requested applicant report needs posting location and a stable Indeed posting/application key, not candidate address. JobAdder integration is a separate later task. The current Indeed exports lack a stable key and a reliable labeled posting-location field, so date and position totals are usable while location totals remain blocked pending an Indeed posting lookup.

- Sep 11 local: the Indeed scraper reference now has a card-based diagnostic mode that exports structured fields and refuses to infer posting location from applicant address text. Full pagination and any Monday import remain pending validation and explicit approval.

- Sep 11 local: the Indeed Manage candidates view is card-based with 20 loaded candidates and a Load more control; a local script can open each card and capture the explicit posting title/location line. It remains diagnostic until a one-page run proves the fields.

- Sep 11 local: the first card-walker test was too slow for the full list, so a local arrow-based scraper now traverses the selected detail pane and validates each transition before recording. It remains a 20-candidate diagnostic until reviewed.

- Sep 11 local: the stopped card sample had 9 plausible latest-posting records but three detail timeouts were masked as zero errors; use the transition-validating arrow scraper for any full run.

- Sep 11 local: live Indeed v4 run captured 19/2,304 candidates before a verified detail timeout and retained the pending transition for same-tab resume; no unverified row was saved.
