# lean-ctx Freeze Playbook — the empty-workspace deadlock (root-caused & fixed Jul-22, 2026)

One afternoon, six window reloads, and a full forensic chase, condensed so no future session ever
repeats it. Applies to lean-ctx ≤ 3.9.12 on Windows.

## The symptom (read the REAL ROOT CAUSE below — the trigger is a first build, not an empty repo)

- In a **new workspace** — or one whose only code is a single self-contained `index.html` (teamhubex) —
  the **first `ctx_*` call hangs forever**. The UI shows lean-ctx's "Coalescing…" spinner.
- The whole session wedges behind it: every later tool call queues, and **subagents freeze at
  bootstrap with a 0-byte transcript** (their session hooks block on the same shared state).
- No crash is logged, the server process sits at ~0 CPU (deadlock, not a spin), and MCP calls have
  no client-side timeout — so it looks exactly like "reading the file hangs." The file is never the problem.
- Workspaces with real indexed code files do not freeze, which makes it look haunted. It isn't:
  the variable is files_indexed, NOT the age of the repo. An old HTML-only repo froze for exactly
  this reason on Jul 23 2026 because the rule then said "new or near-empty". Run the seed check in
  EVERY workspace before the first ctx_* call, established or not.

## THE REAL ROOT CAUSE (re-proven Jul 26 2026 — the section below it was WRONG)

**FIRST BUILD INSIDE THE MCP SERVER DEADLOCKS. The same build from the CLI completes in ~8s.**

That is the whole bug. Not the repo, not the file count, not an empty graph.

How it was proven, six eliminations, all offline with a bounded CLI harness (no live session was
ever risked):
- Reproduced with ONE file present — kills the "zero indexable files" theory that this playbook
  used to carry. ano-ulam had 97 files, 72 indexable, and the seed, and still froze.
- Not the repo content: a folder holding only leanctx-seed.js wedges identically.
- Not the shared state: parking archives/index.db-wal changed nothing, and a completely VIRGIN
  state dir wedges too.
- Not the binary: 3.9.12 and the older 3.9.8 both wedge.
- Not a slow build: cpu frozen at exactly 1.62s across a 25s sample, memory static, graph.db never
  grows. Zero cpu = a parked thread waiting on something that never arrives. A hard DEADLOCK.
- The discriminator: builds over an EXISTING graph finish in ~500ms. Only the FIRST build for a
  project wedges — which is why every established workspace works and every new one freezes.

Signature on disk: `graph.db` created, **`graph.meta.json` never written**, and a
`.graph-idx-*.lock` held by a LIVE server pid. A graph dir with no meta is a deadlock corpse.
Last line in the server's own trace log before it dies: `globset: built glob set` — it is setting
up the file walk, then never returns.

## TWO MECHANISMS, TWO DIFFERENT FAILURE MODES — neither one is redundant (measured Jul 26 2026)

The seed file and the graph pre-build look like belt and braces. They are not. They cover
different halves of the bug, and REMOVING EITHER ONE re-opens a freeze:

| mechanism | what it guarantees | what it does NOT cover |
|---|---|---|
| `leanctx-seed.js` | files_indexed >= 1 | first-build-inside-the-server (ano-ulam had the seed and 97 files and STILL froze) |
| graph pre-build | the first build happens OUTSIDE the MCP server | a folder with ZERO indexable files |

Measured with a six-cell matrix, each cell a fresh folder with the shared lean-ctx state purged
between them:
- no fix, no seed -> WEDGE (the control; the bug reproduces)
- pre-build, NO seed, one indexable file -> PASS
- pre-build, NO seed, real code -> PASS
- pre-build, NO seed, only .txt/.md (files_indexed 0) -> **WEDGE**
- pre-build, WITH seed, only .txt/.md -> PASS

So: for any folder holding at least one indexable file the pre-build alone is enough, and for a
folder holding none the SEED is what saves it. Keep both. Do not "simplify" either away; the
ritual net pins both, including that the seed is planted BEFORE the pre-build runs.

**A zero-file graph is not a usable graph.** A build over a folder with nothing indexable still
writes a valid graph.meta.json with `files_indexed: 0`. The hook used to read "meta exists" as
"graph is fine" and skip the rebuild forever — while a 0-file graph is exactly the state that
wedges. Proven: cache a 0-file graph, plant the seed afterwards, and ctx_read still WEDGED. The
hook now requires meta AND files_indexed >= 1, and since the seed is planted earlier in the same
hook run, the rebuild always finds at least one file. Re-proven after the fix: the identical
scenario now answers in 2.5s.

## THE FIX — automatic, machine-wide, every workspace (Jul 26 2026)

The SessionStart hook (`templates/global/session-ritual.mjs`) now PRE-BUILDS the graph from the
CLI before the model can make its first ctx_* call. The server then finds an existing graph and
does a fast rebuild instead of the deadlocking first build. It runs only when the project has no
COMPLETE graph (a corpse with no meta counts as none), costs ~2s on a small repo and ~8s on
ano-ulam, is bounded by a 90s timeout, and every failure path is a NOTE in the hook message rather
than a throw — a hook that wedges the session would be worse than the bug it fixes. The note names
the manual fallback (`lean-ctx graph build` in that folder) so a failure is never silent.

End-to-end proof on a brand-new folder, Jul 26 2026: same MCP call WEDGED with no hook, then
ANSWERED in 1.9s after the real hook ran. Nothing else changed.

Manual fallback if you are ever mid-freeze without the hook: interrupt, kill lean-ctx.exe, clear
the locks, run `lean-ctx graph build` in the workspace, reload the window.

## THE LIVE CANARY (added Jul 27 2026)

The fix is proven by a ctx call and by nothing else. A session that opens a new workspace, works
happily for an hour and never calls a ctx tool has tested NOTHING, because the deadlock only ever
fires on the first ctx call inside the MCP server. This is not hypothetical: Chan's Jul 26 test
session in ano-ulam ran 22 shell calls, 1 question and 0 ctx calls, so it looked like a pass and
proved nothing. The real proof came from a probe run afterwards (1.95s against the same folder).

**On the first open of any workspace, make ONE deliberate ctx call early.** That is the canary. If
it answers, the fix held for that folder. If it hangs, do not wait: run `lean-ctx graph build` in
that folder from a shell, retry, and add a line to the Recurrence log below.

This is the ONE exception to "Never test by calling `ctx_*` live" in the Diagnostic toolkit below,
and it is bounded three ways: ONE call, on FIRST open, on a workspace with NO reported symptom.
Investigating a folder that has ALREADY hung stays banned and still goes to the bounded CLI repro.
(Audit Jul 27 2026: the canary was added the same day and the two rules did not know about each
other, so a model that recalled the ban would skip the canary and report the ritual complete.)

## The OLD root-cause theory (Jul 22, superseded — kept because the recovery recipe still works)

1. lean-ctx rebuilds its per-project **code graph on EVERY live-session connect** — a valid graph on
   disk does *not* prevent the rebuild. (CLI-spawned servers never build; only real sessions do.)
2. The build itself always completes (~400 ms) and writes `graph.meta.json`. But when the workspace has
   **zero indexable files** (`files_indexed: 0` — a lone big HTML file doesn't count), the **post-build
   merge stage deadlocks on empty input** and takes the whole server down with it.
3. Workspaces with real code files merge fine every time — that's the entire difference between the
   "haunted" workspace and the healthy one.

Historical red herrings that were fixed along the way but were NOT the cause: stale locks from dead
PIDs, orphaned vector stores for deleted projects (`doctor --fix` cleaned those), the shared
`archives/index.db` WAL, multi-window contention, and the lean-ctx version itself.

## THE FIX

Drop a small real `.js` file in the repo root so `files_indexed ≥ 1`:

- Template: `Claude-Core/templates/leanctx-seed.js` — copy it in, keep it, commit it.
- Verified live on teamhubex (Jul-22): rebuild indexed the seed, merge completed, `ctx_read`
  returned instantly — including on the exact call that previously hung 10 minutes.
- **Do not delete the seed file** until the upstream bug is fixed — deleting it re-arms the
  deadlock on the next session connect.

## Recovery recipe (when a session is already frozen)

1. Interrupt the hung call (Esc / stop button).
2. `taskkill //F //IM lean-ctx.exe` (Git Bash syntax; from PowerShell: `taskkill /F /IM lean-ctx.exe`).
3. Delete stale locks: `~/.local/share/lean-ctx/.graph-idx-*.lock` and any `knowledge/*/.knowledge.lock`.
   (The 5-byte graph-idx lock files contain the owner PID — a dead owner = stale lock.)
4. Ensure the workspace has an indexable file (see THE FIX), then reload the VS Code window.

## Diagnostic toolkit (how to investigate lean-ctx without hanging yourself)

- **Never call `ctx_*` live to INVESTIGATE a suspected freeze** — a wedged server hangs your
  session; its `timeout_ms` params are enforced by the wedged server itself and never fire. The
  ONE exception is the first-open canary above: a single deliberate call on a workspace with no
  reported symptom, which is the only thing that proves the fix held there.
- **The hook and lean-ctx read DIFFERENT variables to find the same folder** (measured by
  isolation, Jul 27 2026, one variable at a time). The hook derives the graphs dir and the binary
  path from `USERPROFILE`. lean-ctx.exe puts its state under `XDG_DATA_HOME`. Results:
  USERPROFILE alone LEAKED, HOME alone LEAKED (HOME does nothing here), XDG_DATA_HOME alone
  CONTAINED. Nothing is wrong in a normal session, where both resolve under the real home. It
  matters when you sandbox: **a test that redirects only USERPROFILE does not contain lean-ctx at
  all** — it writes to live state while the hook reads an empty fake and reports success. Redirect
  `USERPROFILE` **and** `XDG_DATA_HOME`, and provision the binary inside the fake home (hardlink
  it, it is 95 MB, 2ms). (This bullet first said HOME was the load-bearing variable. That was
  inferred from an all-four test and was WRONG; isolating each variable is what found it.)
- **Bounded CLI repro** (safe, definitive): pipe JSON-RPC into the binary under `timeout`:
  `( printf '%s\n' "$INIT"; sleep 1; printf '%s\n' "$INITIALIZED"; sleep 1; printf '%s\n' "$TOOLS_CALL"; sleep 5 ) | timeout 30 lean-ctx.exe`
  ⚠ INLINE the JSON-RPC payloads as literals. Do NOT put them in shell variables: the Bash-tool
  rewrite hook strips leading VAR= assignments, so the variables arrive empty, empty lines pipe
  into the binary, and it exits 0 — see Known Bugs. That is a broken test, not a clean result.
  — rc 124 = froze; check whether a `.graph-idx-*.lock` appears (build fired) and clears (build completed).
  — exited 0 with NO lock and NO build = the command never ran properly. Conclude NOTHING and
    re-run with the payloads inlined. This state is not "not reproducible".
- **Monitor tool = shell escape hatch** in Claude Code when natives are denied and ctx_* are dead —
  it executes bash and is not on the deny list. (Since Jul 23 2026 native Bash itself works; Monitor is the backup.)
  This escape applies to the lean-ctx hook deny and NOTHING else: a deny a person placed, and any
  guard hook firing, is a DECISION and is never routed around. The boundary rule lives in
  `../workflow/tool-playbook.md` under "Editing files reliably" (audit Jul 26 2026 — this bullet
  used to offer the shell with no boundary at all, one file away from the ban it walked past).
- **Canary pattern** for live verification: background Agent → TaskOutput with a hard timeout →
  TaskStop if it never returns. A canary with a 0-byte transcript = wedged at bootstrap.
- `lean-ctx doctor` (and `--fix`) is the first official check on any weirdness.
- State lives in `~/.local/share/lean-ctx` (XDG layout since `doctor --fix` Jul-22); crash log at
  `.../logs/crash.log`.

- ctx_* failing INSTANTLY with InputValidationError is NOT the freeze: the tool schema loaded deferred; load it first (ToolSearch select:<tool>) and retry. Do not start freeze recovery for this.

## Known lean-ctx bugs on this machine (report to https://github.com/yvgude/lean-ctx)

1. **Empty-graph merge deadlock** — this playbook's subject. Repro: new workspace with no
   indexable files → connect a live session → first ctx call hangs; `graph.meta.json` shows
   `files_indexed: 0` and a `.graph-idx-*.lock` persists, owned by the live server PID.
2. **npm installer broken on Windows** — postinstall runs `tar -xf "C:\..."`; bsdtar parses the
   drive letter as a remote host ("Cannot connect to C: resolve failed"). Manual update: download
   `releases/latest/download/lean-ctx-x86_64-pc-windows-msvc.zip`, extract with PowerShell
   `Expand-Archive` (NOT tar), swap the exe in `%APPDATA%/npm/node_modules/lean-ctx-bin/bin/`.
3. **The native-tool deny re-adds itself** — lean-ctx's SessionStart hook re-writes
   the deny list into `~/.claude/settings.json` on every
   session start. Removing it never sticks; treat the entries it writes as permanent machinery.
   **WHAT IT COVERS IS VOLATILE, so never reason from a remembered deny list.** Verified Jul 23
   2026 as Read/Grep/Glob only, with native Bash working. Then on Jul 26 2026 the Bash TOOL ITSELF
   went denied mid-session, on even `echo` (Recurrence log). Both are true of their own date; this
   line is the one home for the current answer, so update it here when it changes again.
   **The one standing rule for a denied tool, and it fails closed:** if no person and no permission
   prompt placed that deny this session, it is this machinery — switch to the next working shell
   (PowerShell is the proven escape, Jul 26 2026; Monitor is the backup), keep going, and SAY that
   you did. If a person or a prompt placed it, or **you cannot tell which**, it is a DECISION and
   is never routed around: stop and ask Chan. That precedence, and the ban it is an exception to,
   live in `../workflow/tool-playbook.md` under "Diagnose before crusading"; this rule is the
   machinery-side exception to it and nothing wider.

- The Bash-tool rewrite hook STRIPS leading VAR= assignments from commands before they run. On Jul 23 2026 this caused 3 silent failures in a row: commands ran with empty variables and reported success. Workaround (now a hub section 3 rule): use literal absolute paths, and node -e when a value must be read and used without printing it.

## Recurrence log
- Jul 26 2026, ano-ulam: froze ~10 min on its first ctx call. The repo had 97 files AND the seed,
  which disproved the empty-graph theory this playbook had carried since Jul 22. Root-caused
  offline the same day (see THE REAL ROOT CAUSE) and FIXED machine-wide in the SessionStart hook.
  Also learned that day: the Bash TOOL itself went denied mid-session, not just Read/Grep/Glob —
  PowerShell was the working escape hatch. This entry is the dated OBSERVATION only. The standing
  rule for classifying a deny and escaping it lives in Known Bugs #3 above, one home, and it fails
  closed when the class is unclear. (Audit Jul 27 2026: this used to end with an unconditional
  "switch to PowerShell and keep going", which is a standing order to route around any future Bash
  deny, including one a person placed. It was the last word in the file and nothing overrode it.)
- Jul 23 2026, my-portfolio-v1: froze again. The repo was OLD but HTML-only, and the global rule
only said "new or near-empty workspace", so the seed never got written. Fix: global CLAUDE.md
sections 3 and 5 now require the seed check in EVERY workspace before the first ctx_* call.
- Second lesson, same day: after killing lean-ctx.exe, the VS Code window reload is MANDATORY
before any ctx call. A ctx call made before the reload hangs on the dead connection forever and
looks exactly like the original bug. Full recovery order: kill, clear stale locks, seed, reload.
