# Tool playbook — hard-won operational lessons

Generalized from the Devoted Care tooling saga (a 4-hour hunt on Jul 14 + weeks of scars).
Environment-specific details (lean-ctx, specific MCPs) may not apply to a new setup —
the *principles* always do.
This file is the ONE home for operational tool lessons; TOOLS.md is the historical catalog and points here.
That claim cuts both ways: because a model treats this file as the destination, a STALE instruction
here is more dangerous than the same staleness anywhere else. Two laws govern how anything is
written into this file, and they live in `../lessons/universal-patterns.md` under "Maintaining
documents": ONE INSTRUCTION, ONE HOME, and a list drifts while the live thing does not. Read them
before adding a rule here that names a flag, a filename, or a count that some other file also owns.

## Seeing is verifying
- **A UI change is verified by LOOKING at it** — take a screenshot and actually view the image.
  Vision model (Claude): omit the `filename` param and the shot returns inline, viewable.
  No-vision model (DeepSeek rejects images): PASS a `filename` so the shot SAVES to a file, then hand Chan the path; his eyes do the looking.
- Computed-style probing (`browser_evaluate`) proves a CSS rule *applied* — it does NOT prove
  the screen *looks right*. Spacing, crowding, and alignment are invisible to it. Never call a
  UI change verified on inference alone.

## Diagnose before crusading
- **Reproduce + isolate first.** The entire Jul-14 "Claude is blind" crisis was one stray
  parameter in Claude's own tool call. When behavior is inexplicable, suspect your own last
  change and VALIDATE THE CONFIG FILE before building workarounds.
- A corrupt settings/config JSON fails *silently* and disables everything in it — always
  JSON-validate after any settings edit. Never race two writers on the same config file.
- When an MCP/tool disconnects: don't panic-fix, don't restart-loop. It usually reconnects.
  Note what still works and route around it.

## Editing files reliably (especially on Windows)
- **EOL-aware editing:** detect `\r\n` vs `\n` before string-matching; normalize for the match,
  write back in the original EOL. CRLF mismatches are the #1 cause of "anchor not found."
- When native file tools are gated/denied, a **node script run through the shell**
  (`writeFileSync`) edits anything — but ONLY when the block is MECHANICAL: a rewrite hook, CRLF
  or anchor trouble, a path outside the project root, a tool that is simply absent. A PERMISSION
  DENY or a guard hook firing is a DECISION, not friction: it is someone saying no. Never route
  around one. Stop, say which gate fired and on what, and ask Chan. Writing past a denial through
  the shell is the single place this kit could talk itself around a closed gate, so it is named
  here and banned here. NEVER ask the user to hand-paste an edit — that's a failure.
- Ask the environment before prescribing fixes: Chan is on the **VS Code extension**, not a
  terminal — keystroke/settings advice differs.

## Test sandboxes contain files, never machine state

A test that redirects HOME/USERPROFILE to a temp folder protects FILES and nothing else. Windows
user environment variables, the registry, installed services, and global npm state are machine-wide
and ignore the redirect completely. Burned here Jul 25 2026: a sandboxed test of
apply-deepseek-switch.mjs correctly left ~/.claude/settings.json untouched and still wrote 12 real
user env vars pointing the live CLI at another provider with a fake key. Caught and reverted before
any restart, but a restart would have broken the very tool being used to fix it.
The rule: before testing any script, list every side effect it has that is NOT a file write inside
the sandbox — user env vars, the registry, services, global npm state, AND any write to a real
config path outside the sandbox. The script needs a flag that skips ALL of them, and the test
always passes that flag.

**Never name that flag here.** Read the script's own usage header and use the flag IT names as
test-safe. A flag name written in a lessons file drifts, because nobody re-reads a lessons file
when a script changes; the script's header is read every time.

Tripwire, because this one already bit: for `apply-deepseek-switch.mjs`, `--no-env` alone does NOT
make a test safe on a normal machine — it skips the machine-wide env vars and still writes the LIVE
settings.json. `--dry-run` is safe unconditionally. The invariant is that the write must not be
able to reach a real path, which is why a test that redirects USERPROFILE into a sandbox may use
the weaker flag and still be safe. Read the header for the current rule. This tripwire may itself
go stale, and that is the point of the split: a stale WARNING costs a re-read of the header, a
stale INSTRUCTION costs the machine.
(Audit Jul 25 2026: this paragraph named `--no-env` as the safe flag. The script header had
already been corrected that same morning and the correction landed in one file only.)

## Long-running work
- **Compressed/summarized shell output can mangle exact values** — re-run tightly scoped or read
  the raw log when an exact value matters.
- A production `npm run build` in a repo with a running dev server can clobber it
  (`.next` BUILD_ID mismatch → 500s). Separate build dirs or restart the dev server after.
- Subagents don't automatically inherit your tool access — verify a spawned agent can actually
  use its tools before trusting its "I couldn't find it."

## Databases
The standing laws live in Chan's hard rules, rule 10: never write a third-party's prod DB, review-first destructive SQL, archive-before-drop (`../memory/chan-hard-rules.md`).
Migration mechanics: `../lessons/engineering-lessons.md`.

## Auditing a new API (the P-API workflow, from archive Doc B, banked Jul 24 2026)

Official spec → distilled catalogued reference doc (a send-on-demand txt, never the raw spec
in context) → live validation via USER-RUN read-only Bruno calls with sanitized paste-back →
bank corrections into the reference (r1.0 → r1.1). Raw specs and dumps stay out of context.
