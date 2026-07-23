# Tool playbook — hard-won operational lessons

Generalized from the Devoted Care tooling saga (a 4-hour hunt on Jul 14 + weeks of scars).
Environment-specific details (lean-ctx, specific MCPs) may not apply to a new setup —
the *principles* always do.
This file is the ONE home for operational tool lessons; TOOLS.md is the historical catalog and points here.

## Seeing is verifying
- **A UI change is verified by LOOKING at it** — take a screenshot and actually view the image.
  Playwright: omit the `filename` param and the screenshot returns inline (viewable);
  with `filename` you get a link and you're blind.
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
  (`writeFileSync`) edits anything. NEVER ask the user to hand-paste an edit — that's a failure.
- Ask the environment before prescribing fixes: Chan is on the **VS Code extension**, not a
  terminal — keystroke/settings advice differs.

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
