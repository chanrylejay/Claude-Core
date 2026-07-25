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
if (fs.existsSync(TEMPLATE) && fs.readFileSync(TEMPLATE, "utf8") !== fs.readFileSync(LIVE, "utf8")) {
  console.error("INSTALLED hook does not match the template beside this net:");
  console.error("  template:  " + TEMPLATE);
  console.error("  installed: " + LIVE);
  console.error("re-plant, then re-run — a pass here would certify code you did not edit");
  process.exit(1);
}
console.log("testing the INSTALLED hook: " + LIVE);

let fail = 0;
const t = (name, cond) => {
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
const raw = (input) =>
  spawnSync(process.execPath, [LIVE, "start"], { input, encoding: "utf8", cwd: SB });
const drills = (r) => /Run THE DRILL/.test(r.stdout || "");
t("explicit compact drills", drills(raw(JSON.stringify({ source: "compact" }))));
t("explicit startup does NOT drill", !drills(raw(JSON.stringify({ source: "startup" }))));
t("EMPTY payload drills", drills(raw("")));
t("MALFORMED payload drills", drills(raw("{not json")));
t("payload with no source key drills", drills(raw('{"cwd":"/x"}')));

const src = fs.readFileSync(LIVE, "utf8");
t("seed write is isolated in its own try/catch", /try \{[\s\S]{0,400}writeFileSync\(seedPath, SEED\)[\s\S]{0,400}\} catch/.test(src));
t("a failed seed write still produces a message", /could NOT be written/.test(src));

fs.rmSync(SB, { recursive: true, force: true });
console.log("\nsession-ritual hook: " + (fail ? fail + " FAILED" : "all checks pass"));
process.exit(fail ? 1 : 0);
