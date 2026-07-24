// session-ritual.mjs — makes Chan's session ritual and THE DRILL mechanical instead of remembered.
// Modes (argv[2]):
//   start      → SessionStart hook (sources: startup | resume | clear | compact). Plants leanctx-seed.js if
//                missing (lean-ctx empty-workspace freeze prevention, hub section 5 step 1), then
//                injects the ritual (fresh start) or THE DRILL (after compaction) as context.
// Banking before compaction stays MANUAL by Chan's ruling (Jul 24 2026): he signals when the
// context is near auto-compact, Claude banks, then he compacts. No PreCompact hook is wired.
// (If one is ever added: PreCompact rejects additionalContext, only systemMessage works there.)
// NEVER blocks: every path exits 0. A bug here must not wedge a session.
// Installed Jul 24 2026 (Bundle 1 of the 13-agent improvement plan). Playbook:
// Claude-Core/lessons/lean-ctx-freeze-playbook.md and workflow/the-drill-and-memory.md.

import { existsSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const SEED = `// leanctx-seed.js: gives lean-ctx one real parse target so its code graph
// build never deadlocks in an empty workspace. Do not delete this file.
// Full story: Claude-Core/lessons/lean-ctx-freeze-playbook.md
function leanCtxSeed() {
  return "index target for lean-ctx code graph";
}
module.exports = { leanCtxSeed };
`;

let raw = "";
try {
  for await (const chunk of process.stdin) raw += chunk;
} catch {}
let payload = {};
try {
  payload = JSON.parse(raw || "{}");
} catch {}

const mode = process.argv[2];
const cwd = payload.cwd || process.cwd();

function emit(eventName, text) {
  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: eventName, additionalContext: text } }),
  );
}

try {
  if (mode === "start") {
    const source = payload.source || "startup";
    // Seed check: plant everywhere except the bare home dir and drive roots. The freeze's
    // main victim is a brand-new EMPTY folder, so "looks like a repo" checks miss the worst
    // case (L24-audit finding, Jul 24 2026).
    let seedNote = "";
    const norm = resolve(cwd).replace(/[\\/]+$/, "").toLowerCase();
    const home = resolve(process.env.USERPROFILE || "C:/Users/Chanryle").toLowerCase();
    const plantHere = norm !== home && !/^[a-z]:$/.test(norm);
    if (plantHere) {
      const seedPath = join(cwd, "leanctx-seed.js");
      if (existsSync(seedPath)) {
        seedNote = "leanctx-seed.js present. ";
      } else {
        writeFileSync(seedPath, SEED);
        seedNote = "leanctx-seed.js was MISSING and has been auto-created (freeze prevention; keep it forever). ";
      }
    }
    if (source === "compact") {
      emit(
        "SessionStart",
        "[ritual hook] Compaction just ran. Run THE DRILL before your first substantive reply: do NOT trust the summary; re-read the READ-FIRST files in this project's MEMORY.md plus Claude-Core/DIRECTORY.md; verify git and disk state; disk wins over the summary. " +
          seedNote,
      );
    } else {
      emit(
        "SessionStart",
        "[ritual hook] Session-start ritual: " +
          seedNote +
          "Repo CLAUDE.md and the project MEMORY.md index auto-load; still READ Claude-Core/DIRECTORY.md and any READ-FIRST files the MEMORY.md index marks, and verify git state before stating current status. Report the ritual in one line naming what was read plus the git head.",
      );
    }
  }
  process.exit(0);
} catch (err) {
  console.error("[ritual hook] error (" + (err?.message ?? err) + ") — failing OPEN.");
  process.exit(0);
}
