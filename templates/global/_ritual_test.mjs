// Regression net for the session-ritual hook â€” plain node, no framework.
// Run:  node _ritual_test.mjs   (exit 0 = all pass, 1 = a failure)
// MANDATORY after ANY edit. Tests the INSTALLED hook, because that is the one that runs.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const LIVE = path.join(os.homedir(), ".claude", "hooks", "session-ritual.mjs");
const TEMPLATE = path.join(path.dirname(fileURLToPath(import.meta.url)), "session-ritual.mjs");
if (!fs.existsSync(LIVE)) {
  console.error("no installed hook at " + LIVE + " â€” plant it from templates/global/ first");
  process.exit(1);
}
// MANDATORY-after-edit only means anything if the edit is what runs. Editing the template and
// running this net used to print "all checks pass" over the previously installed copy â€” a green
// verdict on code that never executed, on the hook whose entire job is preventing silent misses
// (audit Jul 25 2026). Fail CLOSED on drift, same as the unterminated heredoc.
// FAIL CLOSED means closed on EVERY way this check can be defeated, not just the byte diff:
//   missing template              â†’ nothing was compared, and it printed a pass anyway
//   net copied beside the LIVE hook â†’ TEMPLATE resolves to LIVE, a file matches itself, always green
//   bytes differ                  â†’ the original case
// The first two used to pass (audit Jul 26 2026). A guard that skips itself is worse than no
// guard, because it still prints a verdict.
if (path.resolve(TEMPLATE) === path.resolve(LIVE)) {
  console.error("this net is sitting beside the INSTALLED hook â€” the drift check would compare " + LIVE + " to itself");
  console.error("run it from the templates/global/ copy, where the template it diffs is a different file");
  process.exit(1);
}
if (!fs.existsSync(TEMPLATE)) {
  console.error("no template beside this net at " + TEMPLATE);
  console.error("nothing here verifies the installed hook is the code you edited â€” refusing to certify");
  process.exit(1);
}
if (fs.readFileSync(TEMPLATE, "utf8") !== fs.readFileSync(LIVE, "utf8")) {
  console.error("INSTALLED hook does not match the template beside this net:");
  console.error("  template:  " + TEMPLATE);
  console.error("  installed: " + LIVE);
  console.error("re-plant, then re-run â€” a pass here would certify code you did not edit");
  process.exit(1);
}
console.log("testing the INSTALLED hook: " + LIVE);

let fail = 0;
let ran = 0; // the net prints its OWN count: a count copied into a doc goes stale in silence
const t = (name, cond) => {
  ran += 1;
  if (cond) console.log("  ok  " + name);
  else { fail += 1; console.log("FAIL  " + name); }
};

const SB = path.join(os.tmpdir(), "ritual-hook-test");
fs.rmSync(SB, { recursive: true, force: true });
fs.mkdirSync(SB, { recursive: true });

const run = (source) =>
  spawnSync(process.execPath, [LIVE, "start"], {
    input: JSON.stringify({ source }), encoding: "utf8", cwd: SB,
  });

// 1. normal startup
const a = run("startup");
t("startup exits 0", a.status === 0);
t("startup emits JSON on stdout", /hookSpecificOutput/.test(a.stdout || ""));
t("startup plants the seed", fs.existsSync(path.join(SB, "leanctx-seed.js")));

// 2. compact branch â€” the one that matters most
const b = run("compact");
t("compact exits 0", b.status === 0);
t("compact emits THE DRILL", /Run THE DRILL/.test(b.stdout || ""));
t("compact says OPEN the files, not the index lines", /OPEN the READ-FIRST files themselves/.test(b.stdout || ""));
t("compact demands the failed-read report", /what FAILED to read/.test(b.stdout || ""));

// 3. THE BUG this net exists for (audit Jul 25 2026): the seed write used to share the outer
//    try with emit() and run BEFORE it, so a throw on the write exited 0 having emitted NOTHING
//    â€” a compacted session then got no DRILL and trusted the summary, which is the exact failure
//    the hook exists to prevent. Verified by hand with a deny-write ACL:
//      icacls <dir> /deny "%USERDOMAIN%\%USERNAME%:(WD,AD)"
//    old hook: exit 0, no DRILL. new hook: DRILL emitted plus a seed warning.
//    Not automated: creating that ACL is not portable. Re-run it by hand after touching the
//    seed block. The structural check below is the cheap standing guard.
// 4. SOURCE DETECTION. An unreadable or sourceless payload used to resolve to "startup", which
//    emitted the NORMAL ritual after a compaction â€” a confidently wrong message, worse than a
//    missing one, on the exact path where a silent miss is invisible (audit Jul 25 2026).
//    The asymmetry decides the default: guessing compact costs one unnecessary drill; guessing
//    startup costs the drill. Any unknown source now resolves to compact.
const raw = (input) =>
  spawnSync(process.execPath, [LIVE, "start"], { input, encoding: "utf8", cwd: SB });
const drills = (r) => /Run THE DRILL/.test(r.stdout || "");
t("explicit compact drills", drills(raw(JSON.stringify({ source: "compact" }))));
t("explicit startup does NOT drill", !drills(raw(JSON.stringify({ source: "startup" }))));
t("EMPTY payload drills", drills(raw("")));
t("MALFORMED payload drills", drills(raw("{not json")));
t("payload with no source key drills", drills(raw('{"cwd":"/x"}')));
t("non-string source drills", drills(raw(JSON.stringify({ source: 42 }))));
// The case three consecutive fixes missed: an UNKNOWN STRING. It is truthy, so it survived every
// falsy-guard and then failed `=== "compact"`, taking the normal-start branch â€” while the comment
// above it claimed unknown sources resolved to compact (audit Jul 25 2026). The guard allowlists
// the three known-safe sources now, so anything the platform renames or adds fails to the drill.
t("UNKNOWN source string drills", drills(raw(JSON.stringify({ source: "compact_v2" }))));
t("another unknown source drills", drills(raw(JSON.stringify({ source: "restored" }))));
// and the other two known-safe sources must still NOT drill
t("resume does not drill", !drills(raw(JSON.stringify({ source: "resume" }))));
t("clear does not drill", !drills(raw(JSON.stringify({ source: "clear" }))));
// the drill message must name all three files and the tool, not lean on a rule in a file the
// model has not reopened yet
const drillMsg = raw(JSON.stringify({ source: "compact" })).stdout || "";
t("drill names Claude-Core/memory/MEMORY.md", /Claude-Core\/memory\/MEMORY\.md/.test(drillMsg));
t("drill names the out-of-root read tool", /node -e/.test(drillMsg));

// 5. WIRING. Every test above spawns the hook directly, so all of them stay green even when the
//    hook is never invoked at all. The matcher used to enumerate "startup|resume|clear|compact",
//    so the unknown-source allowlist inside the hook â€” written for "a renamed or added platform
//    source" â€” could not be REACHED by one: a fifth source fails the matcher, the process never
//    starts, and the compacted session gets no DRILL (audit Jul 26 2026). "The hook handles
//    unknown sources" and "the hook receives them" are two different claims; this net only ever
//    proved the first.
const SETTINGS = path.join(os.homedir(), ".claude", "settings.json");
let cfg = null;
try { cfg = JSON.parse(fs.readFileSync(SETTINGS, "utf8")); } catch {}
t("~/.claude/settings.json exists and parses", cfg !== null);
const ritualEntries = (cfg?.hooks?.SessionStart ?? []).filter((e) =>
  (e?.hooks ?? []).some((h) => typeof h?.command === "string" && /session-ritual\.mjs/.test(h.command)));
t("settings.json wires session-ritual.mjs on SessionStart", ritualEntries.length > 0);
t("the ritual matcher does NOT enumerate sources", ritualEntries.length > 0 && ritualEntries.every((e) => {
  const m = e.matcher;
  if (m === undefined || m === "" || m === "*" || m === ".*") return true;
  return !/startup|resume|clear|compact/.test(m);
}));

// 6. MODE GATE. argv[2] comes from the settings.json command string â€” the one file the recovery
//    skeleton says to rebuild BY HAND. `mode === "start"` with no else exited 0 emitting nothing
//    on any typo: exit 0, no DRILL, the same signature as the seed-write bug (audit Jul 26 2026).
const withMode = (...args) =>
  spawnSync(process.execPath, [LIVE, ...args], { input: JSON.stringify({ source: "compact" }), encoding: "utf8", cwd: SB });
t("a TYPO'd mode still drills", drills(withMode("srart")));
t("a MISSING mode still drills", drills(withMode()));
t("an unrecognised mode says so out loud", /unrecognised mode/.test(withMode("srart").stdout || ""));

// 7. GRAPH PRE-BUILD (the Jul 26 2026 freeze fix). lean-ctx deadlocks on a project's FIRST graph
//    build when it runs inside the MCP server, so the hook pre-builds from the CLI at session
//    start. Pins: fires on a fresh workspace AND says so in the message, skips when a complete
//    graph already exists, and a missing binary degrades to a NOTE with exit 0 â€” never a throw,
//    never a wedge. The corpse case (graph dir with db but no meta counts as "no graph") is the
//    same code path as fires-on-fresh and cannot be pinned directly: the graph-dir hash for a
//    given root is not computable from out here.
// SANDBOX LAW (workflow/tool-playbook.md, "Test sandboxes contain files, never machine state"):
// these tests used to build and delete graphs in the REAL ~/.local/share/lean-ctx, a machine-state
// write with no skip flag - exactly what that law bans. Found by audit Jul 27 2026.
// Containment needs TWO DIFFERENT variables because two different programs are involved, and each
// reads its own. MEASURED by isolation Jul 27 2026, one variable at a time:
//     USERPROFILE only  -> LEAKED   (lean-ctx ignores it)
//     HOME only         -> LEAKED   (lean-ctx ignores it too; HOME does nothing here)
//     XDG_DATA_HOME only-> CONTAINED
// So: the HOOK derives its graphs dir and its binary path from USERPROFILE, and lean-ctx.exe puts
// its state under XDG_DATA_HOME. Redirect USERPROFILE alone (the obvious fix, and the one two
// separate audits proposed) and the net goes GREEN while lean-ctx writes to the live machine.
// HOME and XDG_STATE_HOME are set below as cheap insurance with NO measured effect - do not cite
// them as the reason this works.
// The binary is hardlinked, not copied: 95 MB, 2ms, no disk cost.
const LIVE_GB = path.join(os.homedir(), ".local", "share", "lean-ctx", "graphs");
const liveGraphCount = () => (fs.existsSync(LIVE_GB) ? fs.readdirSync(LIVE_GB).length : 0);
// A COUNT is not enough: the test workspace path is stable, so lean-ctx updates an existing live
// graph dir rather than adding one, and the count never moves while state is really being written
// (measured Jul 27 2026 - a leak passed this check). Ask the direct question as well.
const liveGraphsFor = (root) => {
  if (!fs.existsSync(LIVE_GB)) return [];
  const want = root.replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
  return fs.readdirSync(LIVE_GB).filter((d) => {
    try {
      const m = JSON.parse(fs.readFileSync(path.join(LIVE_GB, d, "graph.meta.json"), "utf8"));
      return String(m.project_root || "").replace(/\/+$/, "").toLowerCase() === want;
    } catch { return false; }
  });
};
const liveBefore = liveGraphCount();
const FAKE_HOME = path.join(os.tmpdir(), "ritual-hook-sandbox-home");
const REAL_EXE = path.join(os.homedir(), "AppData", "Roaming", "npm", "node_modules", "lean-ctx-bin", "bin", "lean-ctx.exe");
const FAKE_BIN = path.join(FAKE_HOME, "AppData", "Roaming", "npm", "node_modules", "lean-ctx-bin", "bin");
fs.rmSync(FAKE_HOME, { recursive: true, force: true });
fs.mkdirSync(FAKE_BIN, { recursive: true });
const HAVE_EXE = fs.existsSync(REAL_EXE);
if (HAVE_EXE) {
  try { fs.linkSync(REAL_EXE, path.join(FAKE_BIN, "lean-ctx.exe")); }
  catch { fs.copyFileSync(REAL_EXE, path.join(FAKE_BIN, "lean-ctx.exe")); }
} else {
  console.log("  note: lean-ctx binary absent on this machine; the pre-build pins below are SKIPPED, loudly");
}
// Every home-ish variable the toolchain might read, all pointed inside the sandbox.
const SANDBOX_ENV = {
  USERPROFILE: FAKE_HOME,
  HOME: FAKE_HOME,
  XDG_DATA_HOME: path.join(FAKE_HOME, ".local", "share"),
  XDG_STATE_HOME: path.join(FAKE_HOME, ".local", "state"),
};
const GB = path.join(FAKE_HOME, ".local", "share", "lean-ctx", "graphs");
const graphDirsFor = (root) => {
  if (!fs.existsSync(GB)) return [];
  const want = root.replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
  return fs.readdirSync(GB).filter((d) => {
    try {
      const m = JSON.parse(fs.readFileSync(path.join(GB, d, "graph.meta.json"), "utf8"));
      return String(m.project_root || "").replace(/\/+$/, "").toLowerCase() === want;
    } catch { return false; }
  });
};
const runAt = (dir, env) =>
  spawnSync(process.execPath, [LIVE, "start"], { input: JSON.stringify({ source: "startup", cwd: dir }), encoding: "utf8", cwd: dir, env: Object.assign({}, process.env, env || {}) });

const SB2 = path.join(os.tmpdir(), "ritual-hook-graphtest");
fs.rmSync(SB2, { recursive: true, force: true });
fs.mkdirSync(SB2, { recursive: true });
fs.writeFileSync(path.join(SB2, "app.js"), "module.exports = 1;\n");
for (const d of graphDirsFor(SB2)) fs.rmSync(path.join(GB, d), { recursive: true, force: true });

const g1 = HAVE_EXE ? runAt(SB2, SANDBOX_ENV) : null;
const g2 = HAVE_EXE ? runAt(SB2, SANDBOX_ENV) : null;
if (!HAVE_EXE) {
  console.log("  skip  7 pre-build pins (no lean-ctx binary) - a REDUCED run, not a green one");
} else {
  t("fresh workspace: hook PRE-BUILDS the graph and says so", /PRE-BUILT/.test(g1.stdout || ""));
  t("fresh workspace: a COMPLETE graph (with meta) now exists", graphDirsFor(SB2).length === 1);
  t("second start: pre-build SKIPPED, graph already complete", !/PRE-BUILT/.test(g2.stdout || ""));
  t("second start: the ritual message still emits", /Session-start ritual/.test(g2.stdout || ""));

  // 7a. THE CANARY IS EMITTED (audit Jul 27 2026). The freeze fix is proven by a ctx call and by
  //     nothing else, and the instruction used to live only in a playbook the normal session flow
  //     never opens - so Chan's own Jul 26 test ran 22 shell calls, 1 question, 0 ctx calls and
  //     proved nothing. It rides the pre-build, and ONLY the pre-build.
  t("fresh workspace: the CANARY instruction is emitted", /CANARY:/.test(g1.stdout || ""));
  t("second start: the canary does NOT nag again", !/CANARY:/.test(g2.stdout || ""));

  // Containment is MEASURED two ways, because one of them is blind on its own: no live graph may
  // exist for the test workspace (catches an update-in-place leak), and the live dir count may not
  // grow (catches a leak from any other path).
  t("no LIVE graph exists for the test workspace", liveGraphsFor(SB2).length === 0);
  t("the live lean-ctx graph dir did not grow", liveGraphCount() === liveBefore);
}

// a machine without the binary must get a NOTE, exit 0, and a living session â€” never a throw
const SB3 = path.join(os.tmpdir(), "ritual-hook-graphtest-noexe");
fs.rmSync(SB3, { recursive: true, force: true });
fs.mkdirSync(SB3, { recursive: true });
const fakeHome = path.join(os.tmpdir(), "ritual-fake-home");
fs.mkdirSync(path.join(fakeHome, ".local", "share", "lean-ctx", "graphs"), { recursive: true });
const g3 = runAt(SB3, { USERPROFILE: fakeHome });
t("missing lean-ctx binary: NOTE in message, exit 0", g3.status === 0 && /NOT pre-built/.test(g3.stdout || ""));

fs.rmSync(SB2, { recursive: true, force: true });
fs.rmSync(SB3, { recursive: true, force: true });
fs.rmSync(fakeHome, { recursive: true, force: true });
fs.rmSync(FAKE_HOME, { recursive: true, force: true }); // takes every sandboxed graph with it

const src = fs.readFileSync(LIVE, "utf8");

// 7z. THE GRAPH TESTS STAY SANDBOXED (audit Jul 27 2026). These read this net's OWN source,
//     because the defect they guard against is a future edit re-pointing the tests at live state.
//     XDG_DATA_HOME is the load-bearing one (measured by isolation, see the block above): without
//     it lean-ctx writes to the real dir whatever USERPROFILE says, and this net goes green while
//     polluting the machine.
const SELF = fs.readFileSync(new URL(import.meta.url), "utf8");
// Scoped to the SANDBOX_ENV literal ON PURPOSE. Testing SELF as a whole made these two pins match
// the search strings inside their OWN lines, so they passed with the redirects deleted (caught by
// mutation, Jul 27 2026). A source-reading pin must never be able to satisfy itself.
const ENV_BLOCK = (SELF.match(/const SANDBOX_ENV = \{[\s\S]*?\};/) || [""])[0];
t("the SANDBOX_ENV block is findable at all", ENV_BLOCK.length > 0);
t("graph tests redirect USERPROFILE into a sandbox", /USERPROFILE: FAKE_HOME/.test(ENV_BLOCK));
t("graph tests redirect XDG_DATA_HOME (the ONE that actually contains lean-ctx)", /XDG_DATA_HOME:/.test(ENV_BLOCK));
t("the graphs dir under test is the sandbox, not the live one", /const GB = path\.join\(FAKE_HOME/.test(SELF));
t("the sandbox is removed at the end", /rmSync\(FAKE_HOME/.test(SELF));

// 7b. ZERO-FILE GRAPHS ARE NOT USABLE (audit Jul 26 2026). A graph can be COMPLETE (meta
//     written) with files_indexed = 0, and the server still wedges on it — so trusting meta
//     alone made the hook skip the rebuild forever. Proven: cached 0-file graph + seed planted
//     afterwards = ctx_read WEDGED. Usable now means meta EXISTS **and** files_indexed >= 1.
t("a zero-file graph does not count as usable", /files_indexed\) >= 1/.test(fs.readFileSync(LIVE, "utf8")));

// 7c. THE SEED IS LOAD-BEARING — do not "simplify" it away. Measured Jul 26 2026 with a 6-cell
//     matrix: the graph pre-build alone saves every folder holding >= 1 indexable file, but a
//     folder with ZERO indexable files (only .txt/.md) still WEDGES without the seed and PASSES
//     with it. The two mechanisms cover DIFFERENT failure modes:
//       seed      -> guarantees files_indexed >= 1
//       pre-build -> guarantees the first build happens OUTSIDE the MCP server
//     Neither alone is sufficient: ano-ulam had the seed and 97 files and still froze.
t("the hook still plants the seed", /writeFileSync\(seedPath, SEED\)/.test(fs.readFileSync(LIVE, "utf8")));
t("the seed is planted BEFORE the graph pre-build runs", (() => {
  const s = fs.readFileSync(LIVE, "utf8");
  return s.indexOf("writeFileSync(seedPath, SEED)") < s.indexOf("\"graph\", \"build\"");
})());

// 8. IMPORT COMPLETENESS (audit Jul 26 2026). readFileSync was CALLED and never IMPORTED, so
//    every graph dir holding a meta threw a ReferenceError, the bare catch ate it, and the hook
//    re-built the graph on EVERY session start instead of once per workspace. A ReferenceError
//    inside a swallowing catch is invisible at runtime â€” so it gets a STATIC check instead.
const IMPORTED = new Set();
for (const m of src.matchAll(/^import \{([^}]*)\} from "node:[a-z_]+";$/gm))
  for (const name of m[1].split(",")) IMPORTED.add(name.trim());
const BUILTINS = [
  "existsSync", "writeFileSync", "readFileSync", "readdirSync", "mkdirSync", "statSync",
  "unlinkSync", "appendFileSync", "rmSync", "copyFileSync",
  "join", "resolve", "dirname", "basename",
  "execFileSync", "execSync", "spawnSync",
];
const missing = BUILTINS.filter((fn) => new RegExp("(?<![\\w.])" + fn + "\\s*\\(").test(src) && !IMPORTED.has(fn));
t("every node: builtin the hook CALLS is also IMPORTED", missing.length === 0);
if (missing.length) console.log("     called but not imported: " + missing.join(", "));

// 9. The graph-meta catch must not be silent â€” a swallowed error is how the missing import
//    stayed invisible. It counts what it ate and surfaces it.
t("the graph-meta catch is not a bare swallow", /catch \{ metaErrors/.test(src));
t("swallowed meta errors surface in the message", /could not be read/.test(src));
// The requirement is a BOUNDARY, not a shape: the path computation AND the write must sit inside
// the same try, because a throw from resolve() used to reach the outer catch and emit nothing.
// The first version of this check measured a character distance and broke the moment the try was
// widened â€” that is a brittle test, not a real one. Measure the boundary.
const seedBlock = src.slice(src.indexOf("let seedNote"), src.indexOf("catch (e)"));
t("the seed try wraps the PATH computation too", /resolve\(cwd\)/.test(seedBlock));
t("the seed try wraps the WRITE", /writeFileSync\(seedPath, SEED\)/.test(seedBlock));
t("and the try opens before both of them", seedBlock.indexOf("try {") >= 0 && seedBlock.indexOf("try {") < seedBlock.indexOf("resolve(cwd)"));
t("a failed seed write still produces a message", /could NOT be written/.test(src));

for (const d of graphDirsFor(SB)) fs.rmSync(path.join(GB, d), { recursive: true, force: true });
fs.rmSync(SB, { recursive: true, force: true });
console.log("\nsession-ritual hook: " + (fail ? fail + " FAILED of " + ran : ran + " passed, 0 failed"));
process.exit(fail ? 1 : 0);
