// session-ritual.mjs â€” makes Chan's session ritual and THE DRILL mechanical instead of remembered.
// Modes (argv[2]):
//   start      â†’ SessionStart hook (sources: startup | resume | clear | compact). Plants leanctx-seed.js if
//                missing (lean-ctx empty-workspace freeze prevention, hub section 5 step 1), then
//                injects the ritual (fresh start) or THE DRILL (after compaction) as context.
// Banking before compaction stays MANUAL by Chan's ruling (Jul 24 2026): he signals when the
// context is near auto-compact, Claude banks, then he compacts. No PreCompact hook is wired.
// (If one is ever added: PreCompact rejects additionalContext, only systemMessage works there.)
// NEVER blocks: every path exits 0. A bug here must not wedge a session.
// Installed Jul 24 2026 (Bundle 1 of the 13-agent improvement plan). Playbook:
// Claude-Core/lessons/lean-ctx-freeze-playbook.md and workflow/the-drill-and-memory.md.

import { existsSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
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

// MODE GATE. Same asymmetry as the source gate below, and this was the ONE input in the file
// with no unknown-value defence: `mode === "start"` with no else meant any typo in the
// settings.json command string â€” a file the recovery skeleton says to REBUILD BY HAND â€” exited 0
// having emitted nothing. Exit 0, no DRILL: the exact signature of the seed-write bug (audit
// Jul 26 2026). Guessing start costs one unnecessary message; guessing not-start costs the
// drill. Allowlist the modes this file knows; anything else runs start AND says so, because a
// wiring typo must be loud. Add a new mode to KNOWN_MODES in the same edit that adds its branch.
const KNOWN_MODES = new Set(["start"]);
const rawMode = typeof process.argv[2] === "string" ? process.argv[2] : "";
const mode = KNOWN_MODES.has(rawMode) ? rawMode : "start";
const modeNote = KNOWN_MODES.has(rawMode)
  ? ""
  : "âš  this hook was invoked with an unrecognised mode (" + (rawMode || "none") + ") and defaulted to start â€” fix the command string in ~/.claude/settings.json. ";
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
    // "startup" emitted the normal ritual after a compaction â€” a confidently wrong message on
    // the one path where a silent miss is invisible (audit Jul 25 2026). The asymmetry decides
    // it: guessing compact costs one unnecessary drill, guessing startup costs the drill.
    // ONLY these three skip the drill. Everything else takes it: missing, empty, non-string, AND
    // any value this file does not recognise â€” a renamed or added platform source. Matching the
    // one dangerous value instead of allowlisting the safe ones missed unknown STRINGS: truthy, so
    // they survived the guard, failed the equality, and took the else branch, while the comment
    // claimed unknown sources resolved to compact.
    // THIRD incomplete pass at this line (audit Jul 25 2026): first it defaulted to startup, then
    // it caught malformed JSON but not empty input, then empty but not unrecognised. Allowlisting
    // ends the class instead of the instance. The asymmetry never changed: guessing compact costs
    // one unnecessary drill, guessing startup costs the drill.
    const NORMAL_START = new Set(["startup", "resume", "clear"]);
    const rawSource = typeof payload.source === "string" ? payload.source : "";
    const source = NORMAL_START.has(rawSource) ? rawSource : "compact";

    // Seed check: plant everywhere except the bare home dir and drive roots. The freeze's main
    // victim is a brand-new EMPTY folder, so "looks like a repo" checks miss the worst case
    // (L24-audit finding, Jul 24 2026).
    // The ENTIRE block sits in ONE try, path computation included. The earlier fix guarded only
    // the WRITE and left resolve(cwd) and the home resolve outside it, so a throw there still
    // reached the outer catch, exited 0, and emitted nothing â€” the same missed drill that fix was
    // written to kill, one line short. Nothing in here may stop the message.
    let seedNote = "";
    try {
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
      // the home dir and drive roots are a deliberate skip, not a failure: no note, by design
    } catch (e) {
      seedNote = "âš  leanctx-seed.js could NOT be written here (" + (e?.message ?? e) + ") â€” the first ctx_* call may freeze this session; plant it by hand or use Bash. ";
    }

    // â”€â”€ GRAPH PRE-BUILD â€” the machine-wide freeze fix (root-caused Jul 26 2026) â”€â”€
    // lean-ctx's graph builder DEADLOCKS when the FIRST build for a project runs inside the MCP
    // server: it creates graph.db, never writes graph.meta.json, holds .graph-idx-*.lock forever,
    // and burns ZERO cpu (proven: cpu frozen at 1.62s across a 25s sample, threads parked). The
    // SAME build from the CLI finishes in ~8s. Every later session only REBUILDS, which is why the
    // freeze only ever hit brand-new workspaces â€” and why it looked haunted.
    // So: if this project has no graph yet, build it HERE, from the CLI, before the model can make
    // its first ctx_* call. The server then rebuilds instead of first-building, and never deadlocks.
    // Everything is inside ONE try and every failure is a NOTE, never a throw: a hook that wedges
    // the session would be worse than the bug it fixes.
    let graphNote = "";
    try {
      const root = resolve(cwd).replace(/\\/g, "/").replace(/\/+$/, "");
      const isHome = root.toLowerCase() === resolve(process.env.USERPROFILE || "C:/Users/Chanryle").replace(/\\/g, "/").toLowerCase();
      if (!isHome && !/^[a-z]:$/i.test(root)) {
        // Does a COMPLETE graph already exist for this root? A graph dir without graph.meta.json is
        // a deadlock corpse from a previous wedge â€” it must be rebuilt, not trusted.
        const graphsDir = join(process.env.USERPROFILE || "C:/Users/Chanryle", ".local/share/lean-ctx/graphs");
        let haveGraph = false;
        let metaErrors = 0; // a swallowed error is an invisible failure — count them, then say so
        if (existsSync(graphsDir)) {
          for (const d of readdirSync(graphsDir)) {
            const meta = join(graphsDir, d, "graph.meta.json");
            if (!existsSync(meta)) continue; // no meta = deadlock corpse, not a usable graph
            try {
              const m = JSON.parse(readFileSync(meta, "utf8"));
              if (String(m.project_root || "").replace(/\/+$/, "").toLowerCase() === root.toLowerCase()) {
                // A graph with ZERO files indexed is NOT usable: the server still wedges on it,
                // and its meta made this check call it "complete" and skip the rebuild forever
                // (proven Jul 26 2026 — cached 0-file graph + seed planted after = WEDGED). The
                // seed is planted EARLIER in this same hook run, so a rebuild now finds >= 1 file.
                haveGraph = Number(m.files_indexed) >= 1;
                break;
              }
            } catch { metaErrors += 1; }
          }
        }
        // A corrupt meta is expected and skippable. EVERY meta failing is not: that is what a
        // missing import looks like from in here, and a bare catch made it invisible — the hook
        // silently re-built the graph on every single session start (audit Jul 26 2026, caught by
        // this file's own net on its first run).
        if (metaErrors > 0) {
          graphNote += "⚠ " + metaErrors + " lean-ctx graph meta file(s) could not be read; the pre-build check may be running blind. ";
        }
        if (!haveGraph) {
          const exe = join(process.env.USERPROFILE || "C:/Users/Chanryle", "AppData/Roaming/npm/node_modules/lean-ctx-bin/bin/lean-ctx.exe");
          if (existsSync(exe)) {
            // 90s ceiling: ano-ulam (97 files) builds in ~8s, so a timeout here means something is
            // wrong and the session should proceed rather than hang on its own safety net.
            execFileSync(exe, ["graph", "build"], { cwd, timeout: 90000, stdio: "ignore", windowsHide: true });
            graphNote = "lean-ctx graph PRE-BUILT for this workspace (first-build-in-server deadlocks; see lessons/lean-ctx-freeze-playbook.md). ";
          } else {
            graphNote = "âš  lean-ctx binary not found, graph NOT pre-built â€” if the first ctx_* call hangs, that is the first-build deadlock: run 'lean-ctx graph build' in this folder, then retry. ";
          }
        }
      }
    } catch (e) {
      graphNote = "âš  graph pre-build FAILED (" + (e?.message ?? e) + ") â€” if the first ctx_* call hangs, that is the first-build deadlock: run 'lean-ctx graph build' in this folder from a terminal, then retry. Bash/node reads work regardless. ";
    }
    if (source === "compact") {
      emit(
        "SessionStart",
        "[ritual hook] " + modeNote + "Compaction just ran. Run THE DRILL before your first substantive reply: do NOT trust the summary; OPEN the READ-FIRST files themselves in this project's MEMORY.md, plus Claude-Core/memory/MEMORY.md AND Claude-Core/DIRECTORY.md â€” both out-of-root, both via Bash node -e, never ctx_read (the index lines are summaries, and summaries are what you are not trusting); verify git and disk state; disk wins over the summary. Then report in one line what you read and what FAILED to read, plus the git head â€” same as a normal start, and more important here, because this is the path where a silent miss is invisible. " +
          seedNote + graphNote,
      );
    } else {
      emit(
        "SessionStart",
        "[ritual hook] " + modeNote + "Session-start ritual: " +
          seedNote + graphNote +
          "Repo CLAUDE.md and the project MEMORY.md index auto-load; still OPEN Claude-Core/DIRECTORY.md and any READ-FIRST files the MEMORY.md index marks â€” the marked lines only say WHICH files to open â€” and verify git state before stating current status. Report the ritual in one line naming what you read AND what FAILED to read, plus the git head. A report that lists only what loaded is how a silent failure stays silent.",
      );
    }
  }
  process.exit(0);
} catch (err) {
  console.error("[ritual hook] error (" + (err?.message ?? err) + ") â€” failing OPEN.");
  process.exit(0);
}
