// Regression net for the session-ritual hook — plain node, no framework.
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
  console.error("no installed hook at " + LIVE + " — plant it from templates/global/ first");
  process.exit(1);
}
// MANDATORY-after-edit only means anything if the edit is what runs. Editing the template and
// running this net used to print "all checks pass" over the previously installed copy — a green
// verdict on code that never executed, on the hook whose entire job is preventing silent misses
// (audit Jul 25 2026). Fail CLOSED on drift, same as the unterminated heredoc.
// FAIL CLOSED means closed on EVERY way this check can be defeated, not just the byte diff:
//   missing template              → nothing was compared, and it printed a pass anyway
//   net copied beside the LIVE hook → TEMPLATE resolves to LIVE, a file matches itself, always green
//   bytes differ                  → the original case
// The first two used to pass (audit Jul 26 2026). A guard that skips itself is worse than no
// guard, because it still prints a verdict.
if (path.resolve(TEMPLATE) === path.resolve(LIVE)) {
  console.error("this net is sitting beside the INSTALLED hook — the drift check would compare " + LIVE + " to itself");
  console.error("run it from the templates/global/ copy, where the template it diffs is a different file");
  process.exit(1);
}
if (!fs.existsSync(TEMPLATE)) {
  console.error("no template beside this net at " + TEMPLATE);
  console.error("nothing here verifies the installed hook is the code you edited — refusing to certify");
  process.exit(1);
}
if (fs.readFileSync(TEMPLATE, "utf8") !== fs.readFileSync(LIVE, "utf8")) {
  console.error("INSTALLED hook does not match the template beside this net:");
  console.error("  template:  " + TEMPLATE);
  console.error("  installed: " + LIVE);
  console.error("re-plant, then re-run — a pass here would certify code you did not edit");
  process.exit(1);
}
console.log("testing the INSTALLED hook: " + LIVE);

let fail = 0;
let ran = 0; // the net prints its OWN count: a count copied into a doc goes stale in silence
let reduced = false; // a skipped section can NEVER end in a green verdict (audit Jul 27 2026)
const t = (name, cond) => {
  ran += 1;
  if (cond) console.log("  ok  " + name);
  else { fail += 1; console.log("FAIL  " + name); }
};
// Normalised path compare, shared by the wiring pins and the spawn gate.
const asPath = (x) => path.resolve(String(x)).replace(/\\/g, "/").toLowerCase();

const SB = path.join(os.tmpdir(), "ritual-hook-test");
fs.rmSync(SB, { recursive: true, force: true });
fs.mkdirSync(SB, { recursive: true });
// Workspace paths DECLARED at top scope so the end-of-run containment loop can see all of them.
// SB4 used to be declared inside if(HAVE_EXE), out of scope at the loop, so the loop said
// "every workspace" while covering three of five (audit Jul 27 2026, found by PED on Opus 5).
const SB4 = path.join(os.tmpdir(), "ritual-blindmeta-ws");
const SB6 = path.join(os.tmpdir(), "ritual-zerofile-ws"); // same top-scope law as SB4

// SANDBOX, HOISTED ABOVE EVERY SPAWN (audit Jul 27 2026, found by PED on Fable 5: the first
// sandbox covered section 7 only. Sections 1-6 spawned the hook with NO env override, so the
// graph pre-build ran against the REAL machine: the net's first spawn wrote a permanent live
// graph for this tmp workspace, the containment baseline was captured AFTER that leak, the
// workspace pin watched SB2 while SB leaked, and the old bottom cleanup read the sandbox graphs
// dir after it was deleted. Proven live the same day: a green "49 passed, 0 failed" run,
// containment pins included, while writing real machine state.)
//
// SANDBOX LAW (workflow/tool-playbook.md, "Test sandboxes contain files, never machine state").
// Containment needs TWO DIFFERENT variables because two different programs are involved, and each
// reads its own. MEASURED by isolation Jul 27 2026, one variable at a time:
//     USERPROFILE only  -> LEAKED   (lean-ctx ignores it)
//     HOME only         -> LEAKED   (lean-ctx ignores it too; HOME does nothing here)
//     XDG_DATA_HOME only-> CONTAINED
// So: the HOOK derives its graphs dir and its binary path from USERPROFILE, and lean-ctx.exe puts
// its state under XDG_DATA_HOME. HOME and XDG_STATE_HOME are cheap insurance with NO measured
// effect - do not cite them as the reason this works.
// The binary is hardlinked, not copied: 95 MB, 2ms, no disk cost.
const LIVE_GB = path.join(os.homedir(), ".local", "share", "lean-ctx", "graphs");
const liveGraphCount = () => (fs.existsSync(LIVE_GB) ? fs.readdirSync(LIVE_GB).length : 0);
// A COUNT is not enough: a stable test path means lean-ctx updates an existing live graph dir in
// place and the count never moves during a real leak (measured Jul 27 2026). Ask directly too.
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
const liveBefore = liveGraphCount(); // BEFORE the first spawn, or it proves nothing
const FAKE_HOME = path.join(os.tmpdir(), "ritual-hook-sandbox-home");
const REAL_EXE = path.join(os.homedir(), "AppData", "Roaming", "npm", "node_modules", "lean-ctx-bin", "bin", "lean-ctx.exe");
const FAKE_BIN = path.join(FAKE_HOME, "AppData", "Roaming", "npm", "node_modules", "lean-ctx-bin", "bin");
fs.rmSync(FAKE_HOME, { recursive: true, force: true });
fs.mkdirSync(FAKE_BIN, { recursive: true });
const HAVE_EXE = fs.existsSync(REAL_EXE);
if (HAVE_EXE) {
  try { fs.linkSync(REAL_EXE, path.join(FAKE_BIN, "lean-ctx.exe")); }
  catch { fs.copyFileSync(REAL_EXE, path.join(FAKE_BIN, "lean-ctx.exe")); }
}
// The hook now opens every session with a CONTRACT CHECK read from disk and an index-cap
// measurement. The sandbox provides both files, so every default spawn exercises the healthy
// path; dedicated homes below exercise absence and overflow.
fs.mkdirSync(path.join(FAKE_HOME, "Claude-Core", "memory"), { recursive: true });
fs.writeFileSync(path.join(FAKE_HOME, "Claude-Core", "CLAUDE.md"), "# sandbox-contract-opening-line\nbody of the sandbox contract\n");
fs.writeFileSync(path.join(FAKE_HOME, "Claude-Core", "memory", "MEMORY.md"), "# small index\n- one line\n");
// v3 verifies the @import WIRING, so the sandbox carries a correctly wired hub; broken and
// unreadable wiring get their own homes in 7i.
fs.mkdirSync(path.join(FAKE_HOME, ".claude"), { recursive: true });
fs.writeFileSync(path.join(FAKE_HOME, ".claude", "CLAUDE.md"), "# sandbox hub\n@" + path.join(FAKE_HOME, "Claude-Core", "CLAUDE.md").replace(/\\/g, "/") + "\n");
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
// ONE spawn gate. Default env is the sandbox. A test MAY pass its own env, and the boundary is
// stated AND enforced here instead of left to the caller (audit Jul 28 2026, found by PED on
// Opus 5: "owns its containment" was an undefined boundary - nothing forced a custom env to
// carry XDG_DATA_HOME, the one variable measured load-bearing, so the next custom-env spawn
// could write live machine state with every pin green). It must redirect BOTH USERPROFILE (the
// hook reads it) and XDG_DATA_HOME (lean-ctx.exe reads it), and neither may resolve to the real
// one. Fail CLOSED: refuse to spawn at all.
// The gate also REGISTERS every cwd it spawns into, so the containment loop at the bottom is
// derived from what actually ran instead of a hand-kept list. A list drifts; the live thing
// does not (same audit: the old width pin re-read the same five names it guarded).
const SPAWNED_IN = new Set();
const spawnHook = (args, opts = {}) => {
  if (opts.env) {
    const e = opts.env;
    if (!e.USERPROFILE || !e.XDG_DATA_HOME ||
        asPath(e.USERPROFILE) === asPath(os.homedir()) ||
        asPath(e.XDG_DATA_HOME) === asPath(path.join(os.homedir(), ".local", "share"))) {
      console.error("spawnHook: a custom env must redirect USERPROFILE and XDG_DATA_HOME away from the real home");
      console.error("  refusing to spawn - this is how the net writes live machine state while printing green");
      process.exit(1);
    }
  }
  if (opts.cwd) SPAWNED_IN.add(path.resolve(opts.cwd));
  const env = Object.assign({}, process.env, opts.env || SANDBOX_ENV);
  return spawnSync(process.execPath, [LIVE, ...args], Object.assign({ encoding: "utf8" }, opts, { env }));
};

const run = (source) => spawnHook(["start"], { input: JSON.stringify({ source }), cwd: SB });

// 1. normal startup
const a = run("startup");
t("startup exits 0", a.status === 0);
t("startup emits JSON on stdout", /hookSpecificOutput/.test(a.stdout || ""));
t("startup plants the seed", fs.existsSync(path.join(SB, "leanctx-seed.js")));

// 2. compact branch — the one that matters most
const b = run("compact");
t("compact exits 0", b.status === 0);
t("compact emits THE DRILL", /Run THE DRILL/.test(b.stdout || ""));
t("compact says OPEN the files, not the index lines", /OPEN the READ-FIRST files themselves/.test(b.stdout || ""));
t("compact demands the failed-read report", /what FAILED to read/.test(b.stdout || ""));

// 3. THE BUG this net exists for (audit Jul 25 2026): the seed write used to share the outer
//    try with emit() and run BEFORE it, so a throw on the write exited 0 having emitted NOTHING
//    — a compacted session then got no DRILL and trusted the summary, which is the exact failure
//    the hook exists to prevent. Verified by hand with a deny-write ACL:
//      icacls <dir> /deny "%USERDOMAIN%\%USERNAME%:(WD,AD)"
//    old hook: exit 0, no DRILL. new hook: DRILL emitted plus a seed warning.
//    Not automated: creating that ACL is not portable. Re-run it by hand after touching the
//    seed block. The structural check below is the cheap standing guard.
// 4. SOURCE DETECTION. An unreadable or sourceless payload used to resolve to "startup", which
//    emitted the NORMAL ritual after a compaction — a confidently wrong message, worse than a
//    missing one, on the exact path where a silent miss is invisible (audit Jul 25 2026).
//    The asymmetry decides the default: guessing compact costs one unnecessary drill; guessing
//    startup costs the drill. Any unknown source now resolves to compact.
const raw = (input) => spawnHook(["start"], { input, cwd: SB });
const drills = (r) => /Run THE DRILL/.test(r.stdout || "");
t("explicit compact drills", drills(raw(JSON.stringify({ source: "compact" }))));
t("explicit startup does NOT drill", !drills(raw(JSON.stringify({ source: "startup" }))));
t("EMPTY payload drills", drills(raw("")));
t("MALFORMED payload drills", drills(raw("{not json")));
t("payload with no source key drills", drills(raw('{"cwd":"/x"}')));
t("non-string source drills", drills(raw(JSON.stringify({ source: 42 }))));
// The case three consecutive fixes missed: an UNKNOWN STRING. It is truthy, so it survived every
// falsy-guard and then failed `=== "compact"`, taking the normal-start branch — while the comment
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
//    so the unknown-source allowlist inside the hook — written for "a renamed or added platform
//    source" — could not be REACHED by one: a fifth source fails the matcher, the process never
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
// The wired command must name the file this net TESTS (audit Jul 28 2026, found by PED on
// Opus 5). The pin above proves only that SOMETHING called session-ritual.mjs is wired; a
// command aimed at the template copy, a stale copy, or a path broken by a machine move
// satisfied it while this net certified LIVE - "a pass here would certify code you did not
// edit", the net's own words. Fail CLOSED: an unresolvable path is a FAIL, never a pass.
const wired = ritualEntries.flatMap((e) => (e?.hooks ?? [])
  .map((h) => (typeof h?.command === "string" ? h.command : ""))
  .filter((c) => /session-ritual\.mjs/.test(c))
  .map((c) => {
    const m = c.match(/"([^"]*session-ritual\.mjs)"|'([^']*session-ritual\.mjs)'|(\S*session-ritual\.mjs)/);
    const rawPath = m ? (m[1] ?? m[2] ?? m[3]) : "";
    if (!rawPath) return "";
    return asPath(rawPath
      .replace(/%USERPROFILE%/gi, os.homedir())
      .replace(/\$\{HOME\}|\$HOME\b/g, os.homedir())
      .replace(/^~(?=[\\/])/, os.homedir()));
  }));
t("every wired ritual command yields a resolvable path", wired.length > 0 && wired.every(Boolean));
t("the WIRED hook path IS the file this net tests", wired.length > 0 && wired.every((p) => p === asPath(LIVE)));

// 6. MODE GATE. argv[2] comes from the settings.json command string — the one file the recovery
//    skeleton says to rebuild BY HAND. `mode === "start"` with no else exited 0 emitting nothing
//    on any typo: exit 0, no DRILL, the same signature as the seed-write bug (audit Jul 26 2026).
const withMode = (...args) => spawnHook(args, { input: JSON.stringify({ source: "compact" }), cwd: SB });
t("a TYPO'd mode still drills", drills(withMode("srart")));
t("a MISSING mode still drills", drills(withMode()));
t("an unrecognised mode says so out loud", /unrecognised mode/.test(withMode("srart").stdout || ""));

// 4b. DEEPSEEK PEAK-PRICE TRIPWIRE (hook edit Aug 24 2026). The wall clock is driven through
//     RITUAL_HOOK_FAKE_UTC_MIN — passed per-spawn through the ONE sandboxed gate, never exported
//     process-wide, so no other section's spawn can inherit a fake clock. Boundaries are
//     start-inclusive, end-exclusive, and a pin sits ON every edge, because an off-by-one here
//     is not a crash, it is a silent 2x bill.
const atMin = (v) => spawnHook(["start"], {
  input: JSON.stringify({ source: "startup" }), cwd: SB,
  env: Object.assign({}, SANDBOX_ENV, { RITUAL_HOOK_FAKE_UTC_MIN: String(v) }),
});
const costStates = (r) => {
  const s = r.stdout || "";
  return (/PEAK PRICING IS ACTIVE/.test(s) ? 1 : 0) + (/off-peak rate is active/.test(s) ? 1 : 0);
};
t("00:59 UTC is off-peak", /off-peak rate is active/.test(atMin(59).stdout || ""));
t("01:00 UTC opens peak (start-inclusive)", /PEAK PRICING IS ACTIVE/.test(atMin(60).stdout || ""));
t("03:59 UTC is still peak", /PEAK PRICING IS ACTIVE/.test(atMin(239).stdout || ""));
t("04:00 UTC closes peak (end-exclusive)", /off-peak rate is active/.test(atMin(240).stdout || ""));
t("06:00 UTC opens the second window", /PEAK PRICING IS ACTIVE/.test(atMin(360).stdout || ""));
t("10:00 UTC closes it", /off-peak rate is active/.test(atMin(600).stdout || ""));
t("peak names its own END in Manila time", /until 12:00 Manila/.test(atMin(61).stdout || ""));
t("late off-peak wraps to TOMORROW'S first peak", /next boundary 09:00 Manila/.test(atMin(601).stdout || ""));
t("off-peak still teaches the schedule", /peak = 09:00-12:00 and 14:00-18:00 Manila/.test(atMin(241).stdout || ""));
t("exactly ONE cost state per message, never both, never neither",
  costStates(atMin(0)) === 1 && costStates(atMin(100)) === 1);
t("an invalid seam value falls back to the real clock, not to silence", costStates(atMin("banana")) === 1);
t("the COMPACT branch carries the cost state too",
  costStates(spawnHook(["start"], { input: JSON.stringify({ source: "compact" }), cwd: SB,
    env: Object.assign({}, SANDBOX_ENV, { RITUAL_HOOK_FAKE_UTC_MIN: "61" }) })) === 1);
t("a real-clock default spawn carries exactly one cost state", costStates(run("startup")) === 1);

// 4c. SOFT SPEND CAP note (Aug 2026). The hook reads cap + meter state under USERPROFILE, so a
//     dedicated fake home per case keeps this sandboxed like everything else.
const CAP_HOME2 = path.join(os.tmpdir(), "ritual-cap-home");
fs.rmSync(CAP_HOME2, { recursive: true, force: true });
fs.mkdirSync(path.join(CAP_HOME2, ".claude"), { recursive: true });
fs.mkdirSync(path.join(CAP_HOME2, "Claude-Core", "memory"), { recursive: true });
fs.writeFileSync(path.join(CAP_HOME2, "Claude-Core", "CLAUDE.md"), "# cap-sandbox-contract\nbody\n");
fs.writeFileSync(path.join(CAP_HOME2, "Claude-Core", "memory", "MEMORY.md"), "# idx\n- x\n");
fs.writeFileSync(path.join(CAP_HOME2, ".claude", "CLAUDE.md"), "# hub\n@" + path.join(CAP_HOME2, "Claude-Core", "CLAUDE.md").replace(/\\/g, "/") + "\n");
const CAP_ENV = { USERPROFILE: CAP_HOME2, HOME: CAP_HOME2, XDG_DATA_HOME: path.join(CAP_HOME2, ".local", "share"), RITUAL_HOOK_FAKE_UTC_MIN: "300" }; // 300 UTC min = 13:00 Manila on the fake clock's day
const capSpawn = () => spawnHook(["start"], { input: JSON.stringify({ source: "startup", cwd: SB }), cwd: SB, env: CAP_ENV });
t("no cap file: no cap note", !/SPEND CAP HIT/.test(capSpawn().stdout || ""));
const todayManila = new Date(Date.now() + 480 * 60000).toISOString().slice(0, 10);
fs.writeFileSync(path.join(CAP_HOME2, ".claude", "deepseek-meter-state.json"), JSON.stringify({ day_key: todayManila, day_spent: 1.25 }));
fs.writeFileSync(path.join(CAP_HOME2, ".claude", "deepseek-cap.txt"), "1.00");
t("cap met + today's state: the note fires with both numbers", /SPEND CAP HIT today \(-\$1\.25 >= \$1\.00/.test(capSpawn().stdout || ""));
fs.writeFileSync(path.join(CAP_HOME2, ".claude", "deepseek-meter-state.json"), JSON.stringify({ day_key: "2020-01-01", day_spent: 9.99 }));
t("stale (another day's) state stays silent", !/SPEND CAP HIT/.test(capSpawn().stdout || ""));
fs.writeFileSync(path.join(CAP_HOME2, ".claude", "deepseek-meter-state.json"), "{not json");
t("corrupt state stays silent, never a throw", (() => { const r = capSpawn(); return r.status === 0 && !/SPEND CAP HIT/.test(r.stdout || ""); })());
fs.rmSync(CAP_HOME2, { recursive: true, force: true });

// 4e. THE NUDGE (UserPromptSubmit gauge voice, Aug 2026). Sandboxed home per net law.
const NH = path.join(os.tmpdir(), "ritual-nudge-home");
fs.rmSync(NH, { recursive: true, force: true });
fs.mkdirSync(path.join(NH, ".claude"), { recursive: true });
const tjn = (name, ctx) => { const f = path.join(NH, name + ".jsonl");
  fs.writeFileSync(f, JSON.stringify({ message: { usage: { input_tokens: 2000, cache_read_input_tokens: ctx - 2000 } } }) + "\n"); return f; };
const nspawn = (tpath) => spawnHook(["nudge"], { input: JSON.stringify({ transcript_path: tpath }), cwd: SB, env: { USERPROFILE: NH, HOME: NH, XDG_DATA_HOME: path.join(NH, ".local", "share") } });
const said = (r) => { try { return JSON.parse(r.stdout).hookSpecificOutput.additionalContext; } catch { return ""; } };
let NA = tjn("a", 90000);
let rr = nspawn(NA);
t("nudge: dim context is pure silence (no output at all)", rr.status === 0 && !(rr.stdout || "").trim());
fs.writeFileSync(NA, JSON.stringify({ message: { usage: { input_tokens: 2000, cache_read_input_tokens: 161000 } } }) + "\n");
rr = nspawn(NA);
t("nudge: yellow crossing speaks once WITH the relay mandate", /🟡 \*\*\[gauge\] ctx 163K\*\*/.test(said(rr)) && /plan the boundary/.test(said(rr)) && /RELAY THIS LINE VERBATIM/.test(said(rr)) && /your voice is the display/.test(said(rr)));
rr = nspawn(NA);
t("nudge: same band next prompt is silent (crossing remembered)", !(rr.stdout || "").trim());
fs.writeFileSync(NA, JSON.stringify({ message: { usage: { input_tokens: 2000, cache_read_input_tokens: 380000 } } }) + "\n");
rr = nspawn(NA);
t("nudge: red crossing speaks with the free-move advice AND the mandate", /🔴 \*\*\[gauge\] ctx 382K\*\*/.test(said(rr)) && /COMPACT NOW/.test(said(rr)) && /\/clear/.test(said(rr)) && /RELAY THIS LINE VERBATIM/.test(said(rr)));
fs.writeFileSync(NA, JSON.stringify({ message: { usage: { input_tokens: 2000, cache_read_input_tokens: 88000 } } }) + "\n");
rr = nspawn(NA);
t("nudge: dropping back to dim is SILENT (state steps down)", !(rr.stdout || "").trim());
fs.writeFileSync(NA, JSON.stringify({ message: { usage: { input_tokens: 2000, cache_read_input_tokens: 380000 } } }) + "\n");
rr = nspawn(NA);
t("nudge: a RE-crossing after the step-down speaks again", /🔴 \*\*\[gauge\] ctx 382K\*\*/.test(said(rr)));
const NB = tjn("b", 310000);
rr = nspawn(NB);
t("nudge: a DIFFERENT session gets its own crossing (per-transcript state)", /\[gauge\] ctx 310K/.test(said(rr)));
fs.writeFileSync(path.join(NH, "broken.jsonl"), "{not json\n");
rr = nspawn(path.join(NH, "broken.jsonl"));
t("nudge: an unusable transcript is silence, exit 0, never a throw", rr.status === 0 && !(rr.stdout || "").trim());
fs.writeFileSync(path.join(NH, ".claude", "deepseek-cap.txt"), "1.00");
const todayM = new Date(Date.now() + 480 * 60000).toISOString().slice(0, 10);
fs.writeFileSync(path.join(NH, ".claude", "deepseek-meter-state.json"), JSON.stringify({ day_key: todayM, day_spent: 1.5 }));
rr = nspawn(NB);
t("nudge: mid-session cap trip speaks once with the mandate", /SPEND CAP HIT today \(-\$1\.50 >= \$1\.00/.test(said(rr)) && /your voice is the display/.test(said(rr)));
rr = nspawn(NB);
t("nudge: cap already fired for this session stays silent", !(rr.stdout || "").trim());
const hookSrcN = fs.readFileSync(TEMPLATE, "utf8");
const meterSrcN = fs.readFileSync(path.join(path.dirname(TEMPLATE), "deepseek-meter.mjs"), "utf8");
t("nudge thresholds parity: 150000/280000 byte-equal across hook and meter",
  /NUDGE_YELLOW = 150000, NUDGE_RED = 280000/.test(hookSrcN) && /ctx >= 280000/.test(meterSrcN) && /ctx >= 150000/.test(meterSrcN));
fs.rmSync(NH, { recursive: true, force: true });

// 7. GRAPH PRE-BUILD (the Jul 26 2026 freeze fix). lean-ctx deadlocks on a project's FIRST graph
//    build when it runs inside the MCP server, so the hook pre-builds from the CLI at session
//    start. Pins: fires on a fresh workspace AND says so in the message, skips when a complete
//    graph already exists, and a missing binary degrades to a NOTE with exit 0 — never a throw,
//    never a wedge. The corpse case (graph dir with db but no meta counts as "no graph") is the
//    same code path as fires-on-fresh and cannot be pinned directly: the graph-dir hash for a
//    given root is not computable from out here.
const runAt = (dir, env) => spawnHook(["start"], { input: JSON.stringify({ source: "startup", cwd: dir }), cwd: dir, env });
const SB2 = path.join(os.tmpdir(), "ritual-hook-graphtest");
fs.rmSync(SB2, { recursive: true, force: true });
fs.mkdirSync(SB2, { recursive: true });
fs.writeFileSync(path.join(SB2, "app.js"), "module.exports = 1;\n");
for (const d of graphDirsFor(SB2)) fs.rmSync(path.join(GB, d), { recursive: true, force: true });

const g1 = HAVE_EXE ? runAt(SB2, SANDBOX_ENV) : null;
const g2 = HAVE_EXE ? runAt(SB2, SANDBOX_ENV) : null;
if (!HAVE_EXE) {
  reduced = true;
  console.log("  skip  graph pre-build pins (no lean-ctx binary) - REDUCED run, will NOT exit green");
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
  t("second start: the first-time CANARY line is not repeated", !/CANARY:/.test(g2.stdout || ""));
  // C1 (audit Jul 27 2026): the canary used to order a bare rebuild-and-retry on a hang, while
  // the playbook's own recurrence log says a ctx call before the window reload hangs forever.
  t("the canary sends a hang to the FULL recovery, not a bare retry", /reload the window/.test(g1.stdout || ""));
  // A-F1 companion (audit Jul 28 2026): the inline recovery lists dropped the recipe's
  // indexable-file step - the ONE step the seed-failed branch needs, so the reload looped.
  t("the canary's recovery list includes the indexable-file step", /make sure an indexable file exists/.test(g1.stdout || ""));

  // 7g. THE SENTINEL (built Jul 28 2026 on Chan's GO): the canary nag must SURVIVE being ignored
  //     and die only when verified. A fresh VERIFIED build plants canary-pending in the graph
  //     dir; every later start re-nags while it exists; deleting it is the acknowledgment.
  const sbDirs = graphDirsFor(SB2);
  const sent = sbDirs.length === 1 ? path.join(GB, sbDirs[0], "canary-pending") : "";
  t("fresh build PERSISTS the canary sentinel", sent !== "" && fs.existsSync(sent));
  t("the message names the sentinel and how to retire it", /DELETE the sentinel/.test(g1.stdout || ""));
  t("second start with a pending sentinel: the nag RETURNS", /CANARY \(unverified/.test(g2.stdout || ""));
  if (sent) fs.rmSync(sent, { force: true });
  const g2b = runAt(SB2, SANDBOX_ENV);
  t("sentinel deleted: no canary of any kind, the nag is dead", !/CANARY/.test(g2b.stdout || ""));
  t("sentinel deleted: pre-build still SKIPPED", !/PRE-BUILT/.test(g2b.stdout || ""));

  // CONTRACT GROUNDING v3 (audit Jul 28 2026, BOTH F5 auditors, blind and independent): v2
  // emitted the exact string it told the model to find, so it passed in both states. Pins:
  // wiring reported honestly, split form emitted, the JOINED line NEVER emitted, no paste on
  // the healthy path.
  const SB_FIRST = "# sandbox-contract-opening-line";
  const SB_CUT = Math.max(1, Math.floor(SB_FIRST.length / 2));
  t("session start carries the CONTRACT CHECK line", /CONTRACT CHECK/.test(g1.stdout || ""));
  t("intact wiring is reported as WIRING, not as a load", /proves the wiring, not the load/.test(g1.stdout || ""));
  t("the SPLIT form of the opening line is emitted", (g1.stdout || "").includes(SB_FIRST.slice(0, SB_CUT) + "<SPLIT>" + SB_FIRST.slice(SB_CUT)));
  t("the JOINED line is NEVER emitted (a probe must not satisfy itself)", !(g1.stdout || "").includes(SB_FIRST));
  t("the join instruction rides the message", /join these two fragments/.test(g1.stdout || ""));
  t("healthy wiring does NOT paste the contract body", !/BEGIN CONTRACT/.test(g1.stdout || ""));
  t("a healthy small index draws NO cap warning", !/PAST the 200-line/.test(g1.stdout || ""));

}

// a machine without the binary must get a NOTE, exit 0, and a living session — never a throw
const SB3 = path.join(os.tmpdir(), "ritual-hook-graphtest-noexe");
fs.rmSync(SB3, { recursive: true, force: true });
fs.mkdirSync(SB3, { recursive: true });
const fakeHome = path.join(os.tmpdir(), "ritual-fake-home");
fs.mkdirSync(path.join(fakeHome, ".local", "share", "lean-ctx", "graphs"), { recursive: true });
const g3 = runAt(SB3, { USERPROFILE: fakeHome, XDG_DATA_HOME: path.join(fakeHome, ".local", "share") });
t("missing lean-ctx binary: NOTE in message, exit 0", g3.status === 0 && /NOT pre-built/.test(g3.stdout || ""));
// Audit Jul 27 2026, found by PED on Fable 5: the canary used to sit after the if/else, so this
// exact branch told the model the fix was ABSENT and then commanded the probing call that fires
// the deadlock. The missing-binary message must forbid the probe, never order it.
t("missing binary: the CANARY is NOT emitted", !/CANARY:/.test(g3.stdout || ""));
t("missing binary: forbids EVERY ctx call, not just a probe", /Do NOT make ANY ctx_\* call/.test(g3.stdout || ""));
t("missing binary: names the Bash fallback in the same breath", /Use Bash node -e/.test(g3.stdout || ""));
t("missing binary: the note orders an indexable file BEFORE the build", /Make sure ONE indexable file exists/.test(g3.stdout || ""));
// g3's fake home holds no Claude-Core at all, which doubles as the missing-contract case:
// the one state the OLD self-graded check could never distinguish from success.
t("missing contract: the warning is LOUD", /contract could NOT be read from disk/.test(g3.stdout || ""));
t("missing contract: DEGRADED MODE is ordered", /DEGRADED MODE/.test(g3.stdout || ""));

// 7h. THE CAP TRIPWIRE (same GO): an index past 200 lines / 25KB silently stops loading its
//     tail - the silent-miss class. Force a 201-line index and demand the loud warning.
const CAP_HOME = path.join(os.tmpdir(), "ritual-caphome");
fs.rmSync(CAP_HOME, { recursive: true, force: true });
fs.mkdirSync(path.join(CAP_HOME, "Claude-Core", "memory"), { recursive: true });
fs.writeFileSync(path.join(CAP_HOME, "Claude-Core", "CLAUDE.md"), "# cap-home contract\n");
fs.writeFileSync(path.join(CAP_HOME, "Claude-Core", "memory", "MEMORY.md"), Array.from({ length: 201 }, (_, i) => "- line " + i).join("\n"));
const SB7 = path.join(os.tmpdir(), "ritual-capwarn-ws");
fs.rmSync(SB7, { recursive: true, force: true });
fs.mkdirSync(SB7, { recursive: true });
const cap = runAt(SB7, { USERPROFILE: CAP_HOME, XDG_DATA_HOME: path.join(CAP_HOME, ".local", "share") });
t("an over-cap MEMORY.md draws the LOUD warning", /PAST the 200-line/.test(cap.stdout || ""));
t("the warning names the index and its size", /Claude-Core\/memory\/MEMORY\.md is 201 lines/.test(cap.stdout || ""));
fs.rmSync(CAP_HOME, { recursive: true, force: true });
fs.rmSync(SB7, { recursive: true, force: true });

// 7i. THE WIRING CHECK (rebuilt Jul 28 2026, both F5 auditors). v2's check supplied its own
//     evidence. v3 verifies the @import against disk. Three states: intact (pinned above),
//     mispointed, and unreadable hub - and both failure states PASTE the contract, so the
//     session is never without it. UNKNOWN is never fine.
const WIRE_HOME = path.join(os.tmpdir(), "ritual-wire-home");
fs.rmSync(WIRE_HOME, { recursive: true, force: true });
fs.mkdirSync(path.join(WIRE_HOME, "Claude-Core"), { recursive: true });
fs.mkdirSync(path.join(WIRE_HOME, ".claude"), { recursive: true });
fs.writeFileSync(path.join(WIRE_HOME, "Claude-Core", "CLAUDE.md"), "# wire-home contract\nrule zero lives here\n");
fs.writeFileSync(path.join(WIRE_HOME, ".claude", "CLAUDE.md"), "# hub\n@C:/Somewhere/Else/CLAUDE.md\n");
const SB8 = path.join(os.tmpdir(), "ritual-wire-ws");
fs.rmSync(SB8, { recursive: true, force: true });
fs.mkdirSync(SB8, { recursive: true });
const WIRE_ENV = { USERPROFILE: WIRE_HOME, HOME: WIRE_HOME, XDG_DATA_HOME: path.join(WIRE_HOME, ".local", "share") };
const w1 = runAt(SB8, WIRE_ENV);
t("a MISPOINTED @import is reported as NOT auto-loaded", /treat the contract as NOT auto-loaded/.test(w1.stdout || ""));
t("and it names where the import actually points", /Somewhere\/Else/.test(w1.stdout || ""));
t("broken wiring PASTES the contract body", /BEGIN CONTRACT/.test(w1.stdout || "") && /rule zero lives here/.test(w1.stdout || ""));
fs.rmSync(path.join(WIRE_HOME, ".claude", "CLAUDE.md"), { force: true });
const w2 = runAt(SB8, WIRE_ENV);
t("an UNREADABLE hub is UNVERIFIED, never fine", /wiring is UNVERIFIED/.test(w2.stdout || ""));
t("unverified wiring pastes the contract too", /BEGIN CONTRACT/.test(w2.stdout || ""));
fs.rmSync(WIRE_HOME, { recursive: true, force: true });
fs.rmSync(SB8, { recursive: true, force: true });

// The dead class, pinned at the source: the hook may never order a FIND of a line it printed
// whole. The search string is split here so this pin cannot match itself.
t("the hook never orders a FIND of a whole printed line", !fs.readFileSync(LIVE, "utf8").includes("FIND that exact line in your" + " loaded context"));

// 7d. THE WARNING REACHES THE OUTPUT (audit Jul 27 2026, found by PED on Opus 5: both pre-build
//     branches ASSIGNED graphNote, wiping the metaErrors warning one line after building it, and
//     the pin guarding it grepped the SOURCE for the warning string - green forever, through the
//     wipe. This is the runtime replacement: a corrupt meta must WARN in stdout AND survive.)
if (HAVE_EXE) {
  const BLIND_HOME = path.join(os.tmpdir(), "ritual-blindmeta-home");
  fs.rmSync(BLIND_HOME, { recursive: true, force: true });
  fs.mkdirSync(path.join(BLIND_HOME, ".local", "share", "lean-ctx", "graphs", "bogus"), { recursive: true });
  fs.writeFileSync(path.join(BLIND_HOME, ".local", "share", "lean-ctx", "graphs", "bogus", "graph.meta.json"), "{not json");
  const BLIND_BIN = path.join(BLIND_HOME, "AppData", "Roaming", "npm", "node_modules", "lean-ctx-bin", "bin");
  fs.mkdirSync(BLIND_BIN, { recursive: true });
  try { fs.linkSync(REAL_EXE, path.join(BLIND_BIN, "lean-ctx.exe")); }
  catch { fs.copyFileSync(REAL_EXE, path.join(BLIND_BIN, "lean-ctx.exe")); }
  fs.rmSync(SB4, { recursive: true, force: true });
  fs.mkdirSync(SB4, { recursive: true });
  const m1 = runAt(SB4, { USERPROFILE: BLIND_HOME, HOME: BLIND_HOME, XDG_DATA_HOME: path.join(BLIND_HOME, ".local", "share"), XDG_STATE_HOME: path.join(BLIND_HOME, ".local", "state") });
  t("an unreadable graph meta WARNS in the EMITTED message", /running blind/.test(m1.stdout || ""));
  t("the PRE-BUILT note does not WIPE that warning", /running blind/.test(m1.stdout || "") && /PRE-BUILT/.test(m1.stdout || ""));
  fs.rmSync(BLIND_HOME, { recursive: true, force: true });
  fs.rmSync(SB4, { recursive: true, force: true });
}

// 7e. A THROW KEEPS ITS MANNERS (audit Jul 27 2026, PED on Opus 5 found the wipe; its proposed
//     fix - emit the canary on the failure path - was REJECTED, because a deliberate probe on a
//     folder whose build FAILED is the deadlock, which is PED-on-Fable-5's finding re-introduced.
//     The synthesis: report the failure, forbid the probe, order the manual build first.)
//     Forced here: the graphs PATH is a file, so existsSync passes and readdirSync throws.
const THROW_HOME = path.join(os.tmpdir(), "ritual-throw-home");
fs.rmSync(THROW_HOME, { recursive: true, force: true });
fs.mkdirSync(path.join(THROW_HOME, ".local", "share", "lean-ctx"), { recursive: true });
fs.writeFileSync(path.join(THROW_HOME, ".local", "share", "lean-ctx", "graphs"), "not a directory");
const SB5 = path.join(os.tmpdir(), "ritual-throw-ws");
fs.rmSync(SB5, { recursive: true, force: true });
fs.mkdirSync(SB5, { recursive: true });
const m2 = runAt(SB5, { USERPROFILE: THROW_HOME, HOME: THROW_HOME, XDG_DATA_HOME: path.join(THROW_HOME, ".local", "share") });
t("a throwing pre-build still exits 0", m2.status === 0);
t("a throwing pre-build reports the failure", /pre-build FAILED/.test(m2.stdout || ""));
t("a throwing pre-build does NOT emit the canary", !/CANARY:/.test(m2.stdout || ""));
t("a throwing pre-build forbids EVERY ctx call, not just a probe", /Do NOT make ANY ctx_\* call/.test(m2.stdout || ""));
t("a throwing pre-build names the Bash fallback", /Use Bash node -e/.test(m2.stdout || ""));
t("a throwing pre-build orders an indexable file BEFORE the build", /make sure ONE indexable file exists/i.test(m2.stdout || ""));
fs.rmSync(THROW_HOME, { recursive: true, force: true });
fs.rmSync(SB5, { recursive: true, force: true });

// 7f. THE CANARY GATES ON THE BUILT GRAPH, NOT ON EXIT 0 (audit Jul 28 2026, found by PED on
//     Fable 5): a CLI build over a folder with nothing indexable exits 0 and writes
//     files_indexed: 0 - the proven wedge state - and the old success branch then COMMANDED the
//     probe, in the same message as the seed's may-freeze warning. Forcing, no ACLs needed:
//     pre-create leanctx-seed.js as a DIRECTORY, so the hook's existsSync sees it present and
//     skips the write, while the workspace holds only a .txt. If lean-ctx ever starts indexing
//     that state, the forcing pin fails LOUDLY - the forcing needs a new trick then, not the hook.
if (HAVE_EXE) {
  fs.rmSync(SB6, { recursive: true, force: true });
  fs.mkdirSync(path.join(SB6, "leanctx-seed.js"), { recursive: true }); // a DIR wearing the seed's name
  fs.writeFileSync(path.join(SB6, "notes.txt"), "no parse targets here\n");
  const z = runAt(SB6, SANDBOX_ENV);
  t("zero-file build: exits 0", z.status === 0);
  t("zero-file build: the forcing took (sandbox meta says 0 files)", (() => {
    const dirs = graphDirsFor(SB6);
    if (dirs.length !== 1) return false;
    try { return Number(JSON.parse(fs.readFileSync(path.join(GB, dirs[0], "graph.meta.json"), "utf8")).files_indexed) === 0; }
    catch { return false; }
  })());
  t("zero-file build: the CANARY is NOT emitted", !/CANARY:/.test(z.stdout || ""));
  t("zero-file build: says the canary is OFF and why", /canary is OFF/.test(z.stdout || ""));
  t("zero-file build: forbids EVERY ctx call, not just a probe", /Do NOT make ANY ctx_\* call/.test(z.stdout || ""));
  t("zero-file build: names the Bash fallback", /Use Bash node -e/.test(z.stdout || ""));
  t("zero-file build: orders the seed before the rebuild", /plant it by hand/.test(z.stdout || ""));
  fs.rmSync(SB6, { recursive: true, force: true });
}

fs.rmSync(SB2, { recursive: true, force: true });
fs.rmSync(SB3, { recursive: true, force: true });
fs.rmSync(fakeHome, { recursive: true, force: true });

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
// Split-string signatures so no pin can match its own line (the Jul 27 lesson, applied forward).
const SPAWN_SIG = "spawnSync(process.execPath, [" + "LIVE";
t("every hook spawn goes through the ONE sandboxed gate", SELF.split(SPAWN_SIG).length - 1 === 1);
const RED_SIG = "REDUCED" + " RUN";
t("a reduced run exits NON-GREEN", new RegExp(RED_SIG + "[\\s\\S]{0,300}?process\\.exit\\(1\\)").test(SELF));

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
//    inside a swallowing catch is invisible at runtime — so it gets a STATIC check instead.
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

// 9. The graph-meta catch must not be silent — a swallowed error is how the missing import
//    stayed invisible. It counts what it ate and surfaces it.
t("the graph-meta catch is not a bare swallow", /catch \{ metaErrors/.test(src));
// (audit Jul 27 2026, found by PED on Opus 5: the pin that used to sit here grepped the SOURCE
// for the warning string, so it stayed green while runtime assignments destroyed the warning.
// The runtime replacement is 7d above. These two pin the APPEND SHAPE that makes a wipe
// impossible: after the let-init, no plain assignment may touch graphNote again.)
t("the PRE-BUILT note APPENDS, never assigns", /graphNote \+= "lean-ctx graph PRE-BUILT/.test(src));
t("after its init, graphNote is only ever APPENDED to", [...src.matchAll(/graphNote *=[^=+]/g)].length === 1);
// The requirement is a BOUNDARY, not a shape: the path computation AND the write must sit inside
// the same try, because a throw from resolve() used to reach the outer catch and emit nothing.
// The first version of this check measured a character distance and broke the moment the try was
// widened — that is a brittle test, not a real one. Measure the boundary.
const seedBlock = src.slice(src.indexOf("let seedNote"), src.indexOf("catch (e)"));
t("the seed try wraps the PATH computation too", /resolve\(cwd\)/.test(seedBlock));
t("the seed try wraps the WRITE", /writeFileSync\(seedPath, SEED\)/.test(seedBlock));
t("and the try opens before both of them", seedBlock.indexOf("try {") >= 0 && seedBlock.indexOf("try {") < seedBlock.indexOf("resolve(cwd)"));
t("a failed seed write still produces a message", /could NOT be written/.test(src));

// CONTAINMENT, asserted over the ENTIRE run, after every workspace has been exercised. The old
// pins lived inside section 7 with the baseline captured after the leak they existed to catch.
// The set is filled by the ONE spawn gate, so it covers exactly the workspaces this net spawned
// into. The old version was a hand-kept list guarded by a pin that re-read the SAME list, so a
// sixth workspace would have been uncovered with the pin green (audit Jul 28 2026, PED on
// Opus 5). That pin is deleted, not rewritten: there is no list left to drift.
t("the containment check covered at least one workspace", SPAWNED_IN.size > 0);
for (const ws of SPAWNED_IN) t("no LIVE graph exists for " + path.basename(ws), liveGraphsFor(ws).length === 0);
t("the live lean-ctx graph dir did not grow during this run", liveGraphCount() === liveBefore);
// 9. [pulse] line (batch 3b, Aug 31 2026): the last logged judgment sample and the dirty-tree
//    count ride the boot message; the sampler is never run from the hook, its AGE reminds.
const PULSE_HOME = path.join(os.tmpdir(), "ritual-pulse-home");
const SB10 = path.join(os.tmpdir(), "ritual-hook-pulse-ws");
fs.rmSync(PULSE_HOME, { recursive: true, force: true }); fs.rmSync(SB10, { recursive: true, force: true });
fs.mkdirSync(path.join(PULSE_HOME, ".claude"), { recursive: true }); fs.mkdirSync(SB10, { recursive: true });
try { spawnSync("git", ["init", "-q"], { cwd: SB10 }); fs.writeFileSync(path.join(SB10, "untracked.txt"), "x"); } catch {}
const PULSE_ENV = { USERPROFILE: PULSE_HOME, HOME: PULSE_HOME, XDG_DATA_HOME: path.join(PULSE_HOME, ".local", "share") };
const PLOG = path.join(PULSE_HOME, ".claude", "judgment-log.txt");
let pz = runAt(SB10, PULSE_ENV);
t("pulse: no log yet -> the boot line says so and names the sampler command", pz.status === 0 && /\[pulse\] no judgment sample logged yet \(run node .*judgment-sample\.mjs --log\)/.test(pz.stdout || ""));
t("pulse: dirty-tree count is on the boot line", /dirty tree: (\d+ path\(s\)|n\/a)/.test(pz.stdout || ""));
fs.writeFileSync(PLOG, new Date().toISOString().slice(0, 10) + " sessions=16 msgs=4761 claimed_without_eyes=26 execution_streak_no_pushback=15 wall_of_text=0 done_without_evidence=57\n");
pz = runAt(SB10, PULSE_ENV);
t("pulse: a fresh log -> its last line is on the boot line, no staleness note", /last judgment sample: \d{4}-\d{2}-\d{2} sessions=16 .*done_without_evidence=57/.test(pz.stdout || "") && !/days old/.test(pz.stdout || ""));
fs.writeFileSync(PLOG, "2026-01-01 sessions=9 msgs=100 claimed_without_eyes=1 execution_streak_no_pushback=2 wall_of_text=0 done_without_evidence=3\n");
pz = runAt(SB10, PULSE_ENV);
t("pulse: a stale log (>7 days) -> the boot line says how old and names the re-run", /days old: re-run node .*judgment-sample\.mjs --log/.test(pz.stdout || ""));
fs.rmSync(PULSE_HOME, { recursive: true, force: true }); fs.rmSync(SB10, { recursive: true, force: true });

fs.rmSync(FAKE_HOME, { recursive: true, force: true }); // one teardown, takes every sandboxed graph with it
fs.rmSync(SB, { recursive: true, force: true });

// ENCODING PIN (added Aug 11 2026, CODING BRIEF step 7a): the DRILL message used to print
// mojibake while this net reported green. Byte-level: no BOM, no double-encoded C3 A2.
for (const p of [LIVE, TEMPLATE]) {
  const b = fs.readFileSync(p);
  t("no BOM in " + path.basename(p), !(b.length >= 3 && b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF));
  let pairs = 0;
  for (let i = 0; i < b.length - 1; i++) if (b[i] === 0xC3 && b[i + 1] === 0xA2) pairs++;
  t("no double-encoded C3 A2 in " + path.basename(p), pairs === 0);
}

// A REDUCED run never certifies (audit Jul 27 2026, found by PED on Opus 5: with the binary
// absent every graph pin was skipped and this file still printed "N passed, 0 failed" with exit
// 0 - the exact verdict-printing skipped guard its own drift section calls worse than no guard).
if (reduced) {
  console.log("\nsession-ritual hook: REDUCED RUN - " + ran + " ran, " + fail + " failed, graph pins SKIPPED (no lean-ctx binary). NOT a certification.");
  process.exit(1);
}
console.log("\nsession-ritual hook: " + (fail ? fail + " FAILED of " + ran : ran + " passed, 0 failed"));
process.exit(fail ? 1 : 0);
