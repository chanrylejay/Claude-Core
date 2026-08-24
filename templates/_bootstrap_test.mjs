// _bootstrap_test.mjs — net for verify-install.mjs. Run from templates/:
//   node _bootstrap_test.mjs
// MANDATORY after any edit to verify-install.mjs or settings.global.skeleton.json.
// Builds a COMPLETE fake machine (fake HOME with hooks installed from the templates and a
// settings.json generated from the skeleton with absolute fake paths), asserts the script
// says ARMED, then mutates one thing at a time and asserts the script names each break.
// Spawns redirect HOME/USERPROFILE and carry no keys, per net law.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const SCRIPT = path.join(HERE, "verify-install.mjs");
let fail = 0, ran = 0;
const t = (n, c) => { ran++; if (c) console.log("  ok  " + n); else { fail++; console.log("FAIL  " + n); } };

const FH = path.join(os.tmpdir(), "bootstrap-net-home");
const install = () => {
  fs.rmSync(FH, { recursive: true, force: true });
  fs.mkdirSync(path.join(FH, ".claude", "hooks"), { recursive: true });
  for (const [src, dst] of [
    ["templates/global/session-ritual.mjs", "session-ritual.mjs"],
    ["templates/hooks/push-guard.mjs", "push-guard.mjs"],
    ["templates/global/deepseek-meter.mjs", "deepseek-meter.mjs"],
  ]) fs.copyFileSync(path.join(ROOT, src), path.join(FH, ".claude", "hooks", dst));
  const skel = JSON.parse(fs.readFileSync(path.join(ROOT, "templates/global/settings.global.skeleton.json"), "utf8"));
  const guardAbs = path.join(FH, ".claude", "hooks", "push-guard.mjs").replace(/\\/g, "/");
  // The skeleton carries a REAL absolute hooks dir (it is Chan's own settings template, not a
  // placeholder file), so the fake machine rewrites whatever path it finds — any
  // <something>/<hook>.mjs becomes the fake home's copy. Generic on purpose: the net must not
  // break the day the skeleton's real path changes.
  const hooksAbs = path.join(FH, ".claude", "hooks").replace(/\\/g, "/");
  const s = JSON.parse(JSON.stringify(skel).replace(
    /[A-Za-z]:[^"'\s]*?\/(push-guard|session-ritual|deepseek-meter)\.mjs|\/[^"'\s]*?\/(push-guard|session-ritual|deepseek-meter)\.mjs/g,
    (m) => hooksAbs + "/" + m.split("/").pop()));
  void guardAbs;
  fs.writeFileSync(path.join(FH, ".claude", "settings.json"), JSON.stringify(s, null, 2));
};
const run = () => spawnSync(process.execPath, [SCRIPT], {
  cwd: ROOT, encoding: "utf8", timeout: 120000,
  env: { PATH: process.env.PATH, USERPROFILE: FH, HOME: FH, XDG_DATA_HOME: path.join(FH, ".local", "share"), TEMP: os.tmpdir(), TMP: os.tmpdir() },
});

// good install → ARMED, and the live-fire block really fired
install();
let r = run();
t("a complete install reports ARMED, exit 0", r.status === 0 && /— ARMED/.test(r.stdout));
t("the tokenless live-fire actually BLOCKED inside the good run", /LIVE: installed push-guard BLOCKS a tokenless push \(exit 2 \+ reason\)/.test(r.stdout) && !/FAIL {2}LIVE: installed push-guard/.test(r.stdout));
t("trap-3 reminder prints on every run", /wired is not LOADED/.test(r.stdout));

// mutation: guard file missing
install(); fs.rmSync(path.join(FH, ".claude", "hooks", "push-guard.mjs"));
r = run();
t("missing push-guard file → named FAIL, exit 1", r.status === 1 && /FAIL {2}push-guard\.mjs installed/.test(r.stdout));

// mutation: byte drift
install(); fs.appendFileSync(path.join(FH, ".claude", "hooks", "session-ritual.mjs"), "\n");
r = run();
t("one drifted byte → named with the drift offset", r.status === 1 && /session-ritual\.mjs byte-equal.*first drift at byte/.test(r.stdout));

// mutation: `|| exit 2` stripped (trap 2)
install();
// Mutate the COMMAND, not the file's prose: the skeleton's _comment documents the `|| exit 2`
// wrapper in words, so a string-level strip hits the documentation first and leaves the real
// command armed — the machine stays correct, the script correctly says so, and only the pin
// looks broken. Config mutations edit config.
let cfg = JSON.parse(fs.readFileSync(path.join(FH, ".claude", "settings.json"), "utf8"));
for (const grp of cfg.hooks.PreToolUse || []) for (const h of grp.hooks || []) {
  if (typeof h.command === "string" && h.command.includes("push-guard.mjs")) h.command = h.command.replace(" || exit 2", "");
}
fs.writeFileSync(path.join(FH, ".claude", "settings.json"), JSON.stringify(cfg, null, 2));
r = run();
t("stripped `|| exit 2` → trap-2 FAIL", r.status === 1 && /trap 2/.test(r.stdout) && /FAIL {2}push-guard command keeps/.test(r.stdout));

// mutation: matcher loses ctx_call (trap 1)
install();
cfg = JSON.parse(fs.readFileSync(path.join(FH, ".claude", "settings.json"), "utf8"));
for (const grp of cfg.hooks.PreToolUse || []) if (typeof grp.matcher === "string" && grp.matcher.includes("ctx_call")) grp.matcher = grp.matcher.replace("|mcp__lean-ctx__ctx_call", "");
fs.writeFileSync(path.join(FH, ".claude", "settings.json"), JSON.stringify(cfg, null, 2));
r = run();
t("matcher missing a shell-capable tool → trap-1 FAIL", r.status === 1 && /FAIL {2}push-guard matcher equals the skeleton/.test(r.stdout));

// mutation: statusLine gone
install();
const st = JSON.parse(fs.readFileSync(path.join(FH, ".claude", "settings.json"), "utf8"));
delete st.statusLine;
fs.writeFileSync(path.join(FH, ".claude", "settings.json"), JSON.stringify(st));
r = run();
t("missing statusLine wiring → named FAIL", r.status === 1 && /FAIL {2}statusLine wires deepseek-meter/.test(r.stdout));

// warning path: project-level shadow guard (trap 4) — must WARN, not fail an armed machine
install();
// the scan reads the REPO's .claude, which we must not touch; assert instead that the good
// run carried zero trap-4 warnings on this clean repo, proving the scan ran quiet.
r = run();
t("clean repo carries no trap-4 shadow finding", r.status === 0 && !/FAIL {2}no project-level shadow guard/.test(r.stdout));

// mutation: a project-level shadow guard must make the machine NOT ARMED (audit Aug 2026 —
// this pin replaces one that certified the old warning-only behaviour)
install();
fs.mkdirSync(path.join(ROOT, ".claude"), { recursive: true });
const shadowPath = path.join(ROOT, ".claude", "settings.local.json");
const hadShadow = fs.existsSync(shadowPath) ? fs.readFileSync(shadowPath, "utf8") : null;
fs.writeFileSync(shadowPath, JSON.stringify({ hooks: { PreToolUse: [{ matcher: "Bash", hooks: [{ command: "node push-guard.mjs || exit 2" }] }] } }, null, 2));
r = run();
t("a project-level shadow guard makes the machine NOT ARMED", r.status === 1 && /FAIL {2}no project-level shadow guard/.test(r.stdout));
t("the shadow finding names the file and the law", /push gating is user-level by law/.test(r.stdout));
if (hadShadow === null) fs.rmSync(shadowPath, { force: true }); else fs.writeFileSync(shadowPath, hadShadow);

fs.rmSync(FH, { recursive: true, force: true });
console.log("\nbootstrap net: " + (fail ? fail + " FAILED of " + ran : ran + " passed, 0 failed"));
process.exit(fail ? 1 : 0);
