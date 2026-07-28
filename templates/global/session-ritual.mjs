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
        let graphDir = ""; // captured for the canary re-nag below
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
                if (haveGraph) graphDir = join(graphsDir, d);
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
            // VERIFY THE BUILD BEFORE TRUSTING IT (audit Jul 28 2026, found by PED on Fable 5):
            // a CLI build over a folder with nothing indexable EXITS 0 and writes a valid meta
            // with files_indexed: 0 - the exact graph the server wedges on. Process success is
            // not usability; the gate below is the SAME predicate the cached-graph check uses.
            // The branch it exists for is real: the seed write FAILED higher up (ACL-proven
            // Jul 25) and the folder held nothing else - the old code called that PRE-BUILT and
            // commanded the probe in the same message as the seed's may-freeze warning.
            let builtIndexed = -1; // -1 = no readable meta found for this root after the build
            let builtDir = "";
            if (existsSync(graphsDir)) {
              for (const d of readdirSync(graphsDir)) {
                const meta = join(graphsDir, d, "graph.meta.json");
                if (!existsSync(meta)) continue;
                try {
                  const m = JSON.parse(readFileSync(meta, "utf8"));
                  if (String(m.project_root || "").replace(/\/+$/, "").toLowerCase() === root.toLowerCase()) {
                    builtIndexed = Number(m.files_indexed) || 0;
                    builtDir = join(graphsDir, d);
                    break;
                  }
                } catch {} // leaves -1; the could-not-be-verified branch below SAYS so out loud
              }
            }
            if (builtIndexed >= 1) {
              // += , never = (audit Jul 27 2026, PED on Opus 5: assignments wiped the warning).
              graphNote += "lean-ctx graph PRE-BUILT for this workspace (" + builtIndexed + " file(s) indexed; first-build-in-server deadlocks; see lessons/lean-ctx-freeze-playbook.md). ";
              // THE CANARY rides a VERIFIED pre-build and NOTHING else (audits Jul 27-28 2026,
              // both PED runs). Failure paths and zero-file "successes" never get it: probing
              // either state IS the deadlock.
              // CANARY PERSISTENCE (built Jul 28 2026 on Chan's GO): a one-shot canary was
              // measured being ignored (Jul 26: 22 shell calls, 0 ctx calls), and once the graph
              // exists the pre-build skips, so the folder stayed unproven FOREVER. The sentinel
              // makes the nag survive being ignored and die when verified. It rides ONLY a
              // VERIFIED build; failure paths and zero-file builds never get one.
              let sentinel = "";
              try {
                if (builtDir) {
                  sentinel = join(builtDir, "canary-pending");
                  writeFileSync(sentinel, "unverified freeze fix: delete this file after one successful ctx_* call in " + root + "\n");
                }
              } catch { sentinel = ""; }
              if (!sentinel) graphNote += "NOTE: canary state could not be persisted; the canary below applies to THIS session only. ";
              graphNote += "CANARY: make ONE deliberate ctx_* call early this session - it is the only proof the freeze fix held for this folder. If it hangs the session is WEDGED: run the freeze playbook's Recovery recipe WHOLE and in order (interrupt, kill lean-ctx.exe, clear the locks, make sure an indexable file exists, reload the window; the recipe is the authority if this list ever drifts), never a bare rebuild-and-retry, then log it in the Recurrence log. ";
              if (sentinel) graphNote += "When the call answers, DELETE the sentinel so future sessions stop nagging: node -e \"require('fs').unlinkSync('" + sentinel.replace(/\\/g, "/") + "')\". ";
            } else {
              const why = builtIndexed === 0 ? "indexed ZERO files" : "could not be verified (no readable graph meta for this root)";
              graphNote += "WARNING: the graph pre-build ran but " + why + " - a zero-file graph is the exact state the server wedges on, so the canary is OFF. Do NOT make ANY ctx_* call here, probe or ordinary read. Use Bash node -e for in-root reads until the fix is done (the section-3 exception; say you took it). Make sure ONE indexable file exists (the seed; plant it by hand if the note above says the hook could not write it), then run 'lean-ctx graph build' here from a shell; after it indexes at least one file, ONE ctx_* call verifies the fix held. ";
            }
          } else {
            graphNote += "WARNING: lean-ctx binary not found, graph NOT pre-built. Do NOT make ANY ctx_* call here, probe or ordinary read - the first build inside the server IS the deadlock and it fires on whichever ctx call comes first (audit Jul 28 2026, PED on Opus 5: the old ban named only the probe, and the model's next ORDINARY read wedged the session). Use Bash node -e for in-root reads until the fix is done (the section-3 exception; say you took it). Make sure ONE indexable file exists (the seed; plant it by hand if the note above says the hook could not write it), then run 'lean-ctx graph build' in this folder from a shell; after it indexes at least one file, ONE ctx_* call verifies the fix held. ";
          }
        } else if (graphDir && existsSync(join(graphDir, "canary-pending"))) {
          // THE RE-NAG (built Jul 28 2026): a usable graph EXISTS here, so a ctx call REBUILDS
          // and never first-builds - the safe case - but no session has ever proven this folder
          // with the one deliberate call. Nag until the sentinel is deleted.
          graphNote += "CANARY (unverified from an earlier session): the freeze fix for this folder has never been proven by a ctx call. Make ONE deliberate ctx_* call early; if it answers, delete " + join(graphDir, "canary-pending").replace(/\\/g, "/") + " so the nagging stops; if it hangs, run the freeze playbook's Recovery recipe WHOLE, then log it in the Recurrence log. ";
        }
      }
    } catch (e) {
      // += so a throw cannot destroy what was already built (the metaErrors warning above),
      // and NO canary here: a folder whose pre-build FAILED is exactly where a deliberate probe
      // wedges the session. Manual build first, then verify (audit Jul 27 2026, both PED runs).
      graphNote += "WARNING: graph pre-build FAILED (" + (e?.message ?? e) + "). Do NOT make ANY ctx_* call here, probe or ordinary read - it fires on whichever ctx call comes first. Use Bash node -e for in-root reads until the fix is done (the section-3 exception; say you took it). Make sure ONE indexable file exists (the seed; plant it by hand if the note above says the hook could not write it), then run 'lean-ctx graph build' in this folder from a shell; after it indexes at least one file, ONE ctx_* call verifies the fix held. ";
    }
    // CONTRACT GROUNDING v3 (rebuilt Jul 28 2026; v2 lived HOURS - both F5 auditors, Fable 5
    // and Opus 5 independently and blind, found that it printed the contract's opening line and
    // then ordered the model to FIND that line in context. The message IS context, so the check
    // passed in BOTH states - the probe-satisfies-itself class this kit's own net kills with
    // split-string signatures, missed in the one new place it mattered. v1 asked for a quote
    // from memory, which a hallucination passes. No hook can see the model's context, so:
    //   1. verify what code CAN verify: the @import WIRING, against disk (Opus's design);
    //   2. broken or unverifiable wiring PASTES the whole contract into the message - the
    //      failure then costs ~1,300 tokens instead of a contract-less session, the same
    //      asymmetry as every default in this file, and UNKNOWN takes the paste (Opus);
    //   3. intact wiring arms the load probe with the opening line SPLIT by an ASCII marker,
    //      join-then-search - the emitted halves can never match the joined search, so a hit
    //      can only be the real loaded contract (Fable's design, the net's own pattern).
    let contractNote = "";
    try {
      const home = process.env.USERPROFILE || "C:/Users/Chanryle";
      const contractPath = join(home, "Claude-Core/CLAUDE.md");
      const c = readFileSync(contractPath, "utf8"); // past this line the contract IS readable
      let wired = null; // null = could not check; UNKNOWN is never "fine", it takes the paste
      let target = "";
      try {
        const hubTxt = readFileSync(join(home, ".claude/CLAUDE.md"), "utf8");
        const imp = hubTxt.match(/^@(.+CLAUDE\.md)\s*$/m);
        target = imp ? imp[1].trim() : "";
        wired = target !== "" && resolve(target).replace(/\\/g, "/").toLowerCase() === resolve(contractPath).replace(/\\/g, "/").toLowerCase();
      } catch { wired = null; }
      if (wired === true) {
        const firstLine = (c.split(/\r?\n/).find((l) => l.trim().length > 0) || "").trim();
        const cut = Math.max(1, Math.floor(firstLine.length / 2));
        contractNote = "CONTRACT CHECK: the hub's @import resolves to the contract on disk (" + c.length + " chars), so the auto-load WIRING is INTACT - which proves the wiring, not the load. Load test: join these two fragments, deleting the <SPLIT> marker, into the contract's real opening line: \"" + firstLine.slice(0, cut) + "<SPLIT>" + firstLine.slice(cut) + "\". FIND that exact joined line, contiguous, in your loaded context OUTSIDE this message - this message never contains it whole, so a hit can only be the real loaded contract. Present means the @import fired; absent means it did NOT, so read " + contractPath.replace(/\\/g, "/") + " with Bash node -e before real work. ";
      } else {
        const why = wired === null
          ? "the hub could not be read, so the wiring is UNVERIFIED"
          : (target ? "the hub's @import points at " + target + ", not at the contract" : "the hub has no @import line");
        contractNote = "WARNING: " + why + " - treat the contract as NOT auto-loaded. Fix both absolute paths per hub section 7. The full contract is pasted below so this session is not flying blind; it IS the operating contract, use it.\n---BEGIN CONTRACT---\n" + c + "\n---END CONTRACT---\n";
      }
    } catch (e) {
      contractNote = "WARNING: the working contract could NOT be read from disk (" + (e?.message ?? e) + "). Assume the @import also failed: enter DEGRADED MODE per hub section 2 and say so in your first line. ";
    }
    // INDEX CAP TRIPWIRE (same GO): the auto-loader reads only the FIRST 200 lines / 25KB of a
    // MEMORY.md index. Anything past that exists on disk and silently never loads - the exact
    // silent-miss class this kit exists to kill. Warn BEFORE it bites, for both indexes.
    let memNote = "";
    try {
      const projKey = resolve(cwd).replace(/^([A-Za-z]):/, (m0, d0) => d0.toLowerCase() + "-").replace(/[\\/]+/g, "-");
      const checks = [
        ["Claude-Core/memory/MEMORY.md", join(process.env.USERPROFILE || "C:/Users/Chanryle", "Claude-Core/memory/MEMORY.md")],
        ["this project's MEMORY.md", join(process.env.USERPROFILE || "C:/Users/Chanryle", ".claude/projects", projKey, "memory/MEMORY.md")],
      ];
      for (const [label, mp] of checks) {
        if (!existsSync(mp)) continue;
        const txt = readFileSync(mp, "utf8");
        const lines = txt.split(/\r?\n/).length;
        if (lines > 200 || txt.length > 25000) {
          memNote += "WARNING: " + label + " is " + lines + " lines / " + txt.length + " chars - PAST the 200-line/25KB auto-load cap, so its tail is silently NOT loading. Trim it this session. ";
        }
      }
    } catch {}
    if (source === "compact") {
      emit(
        "SessionStart",
        "[ritual hook] " + modeNote + "Compaction just ran. Run THE DRILL before your first substantive reply: do NOT trust the summary; OPEN the READ-FIRST files themselves in this project's MEMORY.md, plus Claude-Core/memory/MEMORY.md AND Claude-Core/DIRECTORY.md â€” opened by WHERE THEY SIT: Bash node -e when they are outside THIS workspace root, which is every root except Claude-Core itself; ctx_read when Claude-Core IS the root; and never from the index lines, which are summaries, and summaries are what you are not trusting; verify git and disk state; disk wins over the summary. Then report in one line what you read and what FAILED to read, plus the git head â€” same as a normal start, and more important here, because this is the path where a silent miss is invisible. " +
          seedNote + graphNote + contractNote + memNote,
      );
    } else {
      emit(
        "SessionStart",
        "[ritual hook] " + modeNote + "Session-start ritual: " +
          seedNote + graphNote + contractNote + memNote +
          "Repo CLAUDE.md and the project MEMORY.md index auto-load; still OPEN Claude-Core/DIRECTORY.md and any READ-FIRST files the MEMORY.md index marks â€” the marked lines only say WHICH files to open â€” and verify git state before stating current status. Report the ritual in one line naming what you read AND what FAILED to read, plus the git head. A report that lists only what loaded is how a silent failure stays silent.",
      );
    }
  }
  process.exit(0);
} catch (err) {
  console.error("[ritual hook] error (" + (err?.message ?? err) + ") â€” failing OPEN.");
  process.exit(0);
}
