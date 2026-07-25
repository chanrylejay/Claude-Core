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
    // UNKNOWN source resolves to "compact", never to "startup". Both the stdin read and the
    // JSON.parse above swallow their errors into an empty payload, and defaulting that to
    // "startup" emitted the normal ritual after a compaction — a confidently wrong message on
    // the one path where a silent miss is invisible (audit Jul 25 2026). The asymmetry decides
    // it: guessing compact costs one unnecessary drill, guessing startup costs the drill.
    const source = typeof payload.source === "string" && payload.source ? payload.source : "compact";
    // Seed check: plant everywhere except the bare home dir and drive roots. The freeze's
    // main victim is a brand-new EMPTY folder, so "looks like a repo" checks miss the worst
    // case (L24-audit finding, Jul 24 2026).
    let seedNote = "";
    const norm = resolve(cwd).replace(/[\\/]+$/, "").toLowerCase();
    const home = resolve(process.env.USERPROFILE || "C:/Users/Chanryle").toLowerCase();
    const plantHere = norm !== home && !/^[a-z]:$/.test(norm);
    // The seed write gets its OWN try. It used to share the outer one and run BEFORE emit(), so a
    // throw here (read-only cwd, permissions) exited 0 having emitted nothing — and after a
    // compaction that means no DRILL, which is the exact failure this hook exists to prevent
    // (audit Jul 25 2026). The message must survive a failed write.
    if (plantHere) {
      try {
        const seedPath = join(cwd, "leanctx-seed.js");
        if (existsSync(seedPath)) {
          seedNote = "leanctx-seed.js present. ";
        } else {
          writeFileSync(seedPath, SEED);
          seedNote = "leanctx-seed.js was MISSING and has been auto-created (freeze prevention; keep it forever). ";
        }
      } catch (e) {
        seedNote = "⚠ leanctx-seed.js could NOT be written here (" + (e?.message ?? e) + ") — the first ctx_* call may freeze this session; plant it by hand or use Bash. ";
      }
    }
    if (source === "compact") {
      emit(
        "SessionStart",
        "[ritual hook] Compaction just ran. Run THE DRILL before your first substantive reply: do NOT trust the summary; OPEN the READ-FIRST files themselves in this project's MEMORY.md plus Claude-Core/DIRECTORY.md (the index lines are summaries, and summaries are what you are not trusting); verify git and disk state; disk wins over the summary. Then report in one line what you read and what FAILED to read, plus the git head — same as a normal start, and more important here, because this is the path where a silent miss is invisible. " +
          seedNote,
      );
    } else {
      emit(
        "SessionStart",
        "[ritual hook] Session-start ritual: " +
          seedNote +
          "Repo CLAUDE.md and the project MEMORY.md index auto-load; still OPEN Claude-Core/DIRECTORY.md and any READ-FIRST files the MEMORY.md index marks — the marked lines only say WHICH files to open — and verify git state before stating current status. Report the ritual in one line naming what you read AND what FAILED to read, plus the git head. A report that lists only what loaded is how a silent failure stays silent.",
      );
    }
  }
  process.exit(0);
} catch (err) {
  console.error("[ritual hook] error (" + (err?.message ?? err) + ") — failing OPEN.");
  process.exit(0);
}
