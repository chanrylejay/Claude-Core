# The QA Gauntlet — agent team pattern

Scope (Chan, Jul 23 2026): built for CLIENT work. Claude-Core/CLAUDE.md is AUTHORITATIVE on the
heavy-vs-light class and holds the governing copy of the mechanical test — run it THERE, and never
paraphrase it into this file (a second copy of a rule is a second place for it to rot). Never
classify by a feeling that something is a personal project: that phrase is a CONSEQUENCE of the
test, never an input to it, and a personal project that touches production credentials is HEAVY.
If the class is unclear, ask Chan in one line before starting. If this file ever disagrees with the
contract, the contract wins immediately and you report the disagreement instead of resolving it
yourself. (Audit Jul 25 2026: this line used to say "personal projects keep QA light", which read
as a sufficient classifier and would have shipped a credentials change with no reviewer at all.)

Built on Devoted Care when the client (PO) went on vacation and Claude had to own the QA gate.
It killed the "regression = the enemy" problem: nothing gets called done on the builder's
own say-so. The five project-agnostic agent definitions live in `../templates/agents/`;
the two client-persona roles (`client-qa`, `client-ux`) are described below but must be
**written fresh per project** from the new owner's requirements and design canon (start from
`../templates/agents/client-qa.skeleton.md` / `client-ux.skeleton.md`, six fill-in fields
each, the last being the evidence folder that is their only permitted write) — the Devoted-specific versions were deliberately not carried into this kit.

## The team (run in this order)

1. **spec-reader** — *before* building from any raw ask/message/screenshot. Turns words into a
   numbered spec with verbatim quotes, per-clause acceptance criteria, and an AMBIGUITY list of
   questions only the owner can answer. The ASK-DON'T-ASSUME gate. Never answers FOR the client.
2. *(build happens)*
3. **reviewer** — hostile code review of the diff. Correctness bugs + project-discipline
   violations. Returns verdict + must-fix list, not a rewrite.
4. **net-runner** — the anti-churn gate. Runs type/lint + EVERY regression net in the suite. Skipping any net requires naming it and the reason in the verdict, so a skip is something Chan can audit rather than a judgement made silently inside the word "relevant". Match touched files against net headers to ORDER the run, never to decide what to skip. Also audits whether the change *carries a net* that pins its own fix, raises a CHURN ALERT
   when a repeatedly-fixed module is touched again without one. Green/red verdict.
5. **client-ux** — design-law enforcer. Opens the live screen (read-only), screenshots desktop +
   narrow widths, judges against the project's design canon. CLEAN / POLISH / VIOLATIONS.
6. **client-qa** — acceptance review AS the product owner. Opens the live feature on real data
   and asks: does it do what was asked, is the data honest, did it break anything I care about?
   ACCEPT / SEND-BACK.

7. **challenger** — after the reviewers, before the owner reads anything: adversarially
   re-tests every finding, kills what it can refute, merges duplicates. A kill is never silent: log
   every killed finding with the sentence that refuted it, and state both counts in the turn report
   ("N shipped, M killed") so Chan can ask to see the killed list. He can reinstate any of them; a
   refutation is the challenger's opinion, never a deletion. The owner reads only
   survivors. MANDATORY unless ALL THREE are true — count them, do not weigh them: the change is
   LIGHT by the contract's mechanical test, the reviewers returned fewer than ten findings in
   total, and none of them is rated must-fix. If you cannot tell whether a condition holds, it does
   not hold: run the challenger. Skipping it requires naming the skip and the reason in the turn
   report, so a skip is something Chan can audit rather than a judgement made silently inside the
   word "small". Only Chan can waive this. Note that no passing token exists for this role, so
   `gauntlet-guard.mjs` CANNOT catch a silent skip the way it catches a missing GATE_OK — the turn
   report is the only channel there is, which is why reporting the skip is mandatory and not
   advisory (audit Jul 25 2026).

Plus **recon** — read-only codebase/data-flow tracer for "how does X actually work," returning
cited conclusions instead of file dumps. Use before building, any time.

## Rules that make it real

- **Agents deploy alone.** A subagent loads its own file and nothing else. Any law it must obey at
  runtime has to be written IN that file. This document is a map for Chan, never a runtime
  dependency for an agent: when a rule here constrains an agent's behaviour, it is not enforced
  until the same sentence also appears in that agent's own prompt. That placement is now
  MECHANICALLY CHECKED: `../templates/agents/_lawcheck_test.mjs` pins each load-bearing law to
  the agent file that must carry it and fails when one goes missing. The pinned list lives in the
  NET and nowhere else (a list drifts; the live thing does not). Adding a law to an agent file?
  Add its pin to the net in the same edit. MANDATORY re-run after any agent-file edit, same
  standing as the hook nets.

- **Never fake a gate.** Passing tokens (GATE_OK / UX_OK / QA_OK) exist only if the agent
  actually ran. Enforce with a Stop-hook if the temptation exists (`../templates/hooks/gauntlet-guard.mjs`).
- **Batch mode** for streaks of tiny fixes: open `.claude/BATCH` (any content) at the start of
  the streak; turns end freely while the touched-file ledger accumulates; delete the file to
  close the batch and the wall fires ONCE over everything touched. Never call a batch done or
  push-ready while it is open. While `.claude/BATCH` is open, say so in the turn report EVERY
  turn, with the files accumulated so far: it is a persistent suppression like GAUNTLET_OFF, not
  a one-shot like PUSH_GO, and an unreported open batch is a done-wall that has been off for an
  unknown number of turns with nothing to notice. (Audit Jul 26 2026: GAUNTLET_OFF carried this
  disclosure duty and BATCH, with the identical persistence property, did not.)
- **Regression nets are deliverables.** A fix without a net that pins it isn't done — that's how
  the same module stops breaking twice.
- **Agents are the owner's review proxy.** Surface their verdicts to the human in plain
  language; that's what shrinks the review bottleneck.
- **The turn report is a fixed block, not prose.** Several disclosure duties land there and
  nowhere else, and an undefined artifact carrying that many duties gets written as one sentence
  that omits most of them. Every build turn ends with:
  ```
  GATES:        tokens earned this turn — GATE_OK / UX_OK / QA_OK, or "none"
  SKIPPED:      each gate or net not run + the named reason, or "none"
  CHALLENGER:   N shipped, M killed — or SKIPPED + which mandatory-skip conditions held
  OFF-SWITCHES: GAUNTLET_OFF present? BATCH open (+ files so far)? or "none"
  PUSH:         PUSH_GO consumed / not requested — push is deploy is LIVE, Chan's GO each time
  ```
  An omitted field is a missing disclosure, not a shorter report; "none" is always writable.
  (No CHALLENGER_OK token exists — the challenger line in this block is the only channel there
  is, which is why the field is mandatory. Adding a real token to the done-wall set stays an open
  option for Chan, raised Jul 25 and again Jul 26 2026.)
- **No-vision model (DeepSeek endpoint).** The UX/visual pass cannot self-verify: capture the screenshots to FILES and hand them to Chan; his eyes give the CLEAN / POLISH / VIOLATIONS verdict. Never self-pass UX_OK blind. See workflow/switch-to-deepseek.md.

## The guard hooks (`../templates/hooks/`)

- **push-guard.mjs** — PreToolUse hook that blocks `git push` unless an explicit GO file
  (`.claude/PUSH_GO`) exists; the file is consumed one-shot. Encodes "push = deploy = LIVE =
  owner's explicit GO each time."
- **gauntlet-guard.mjs** — Stop hook that blocks calling a build turn "done" until the gauntlet
  tokens exist. Commit itself is never blocked; only the *claim of done*. Escape hatch:
  `.claude/GAUNTLET_OFF` — CHAN'S FILE ONLY. Claude never creates or restores it: if genuinely stuck, say so in one line and ask him for it by name. Unlike PUSH_GO it is persistent, not one-shot, so once it exists every mode stays off for all later turns and sessions with nothing to notice. If it already exists, say so in the turn report before calling anything done.

COPY both hooks into the project's `.claude/hooks/` first — run from Claude-Core they silently
guard the wrong folder (their paths resolve relative to the file). Wire them in the project's
`.claude/settings.local.json` — four events: PreToolUse (push-guard), PostToolUse (ui-track),
Stop (done-wall), UserPromptSubmit (spec-nudge). The copy-paste JSON lives in
`../templates/agents/README.md`; the rules HERE govern that JSON, and if the two ever disagree,
the JSON is the bug. Two things the wiring gets wrong by default, both fail-open and both silent:
1. **The shell matcher must name EVERY shell-capable tool this environment exposes.** On lean-ctx
   machines that is `mcp__lean-ctx__ctx_shell`, `mcp__lean-ctx__shell` AND
   `mcp__lean-ctx__ctx_call` — lean-ctx's `ctx_execute` runs shell and is reachable only THROUGH
   `ctx_call`, so dropping that entry is not a weaker guard, it is no guard at all on that path.
   Diff the list against the shell tools THIS environment actually exposes before wiring; the
   shipped list is correct for lean-ctx machines only. (Audit Jul 26 2026: this paragraph named
   only the first two entries while the README carried all three — the fix for the missing third
   landed in one file and skipped the one the README itself calls the rule's home.)
2. **Every BLOCKING hook keeps `|| exit 2` on its command** — push-guard (PreToolUse) and the
   done-wall (Stop). Without it a LOAD-time failure in the hook (syntax error, bad import) exits
   1, which Claude Code treats as non-blocking, and the gate fail-opens with nothing to notice.
   The non-blocking modes (ui-track, spec-nudge) do not need it. Rewriting a hook command for a
   new repo, the suffix goes back on.
Day-one order: push-guard on day one; the done-wall ONLY after client-qa/client-ux exist (a
wall with no agents behind it fail-opens after 3 nags and trains everyone to ignore it).
Harder optional variant: make the done-wall demand a verification ARTIFACT (a screenshot file,
a test log) instead of a bare token, when token-faking temptation is real.
