// verify-install.mjs — is THIS machine fully armed? One command, run from the repo root:
//   node templates/verify-install.mjs
// Checks the whole install chain and exits 1 if anything is wrong, naming it:
//   1. Hook files installed at ~/.claude/hooks/ and BYTE-EQUAL to their templates
//      (session-ritual.mjs, push-guard.mjs) plus the meter (deepseek-meter.mjs).
//   2. User-level settings wired: SessionStart runs the ritual; PreToolUse carries the
//      push-guard with the FULL matcher from the skeleton (trap 1) and `|| exit 2` (trap 2);
//      statusLine points at the meter. The skeleton template is the source of truth.
//   3. LIVE-FIRE probes of the INSTALLED files (not the templates), sandboxed: child env
//      gets a throwaway HOME/USERPROFILE with no token and no keys — a tokenless push must
//      be BLOCKED, the ritual must exit 0 with output, the meter must render.
//   4. Trap-4 shadow scan: warns if any project-level .claude/settings*.json under the repo
//      also wires a push-guard (project scope cannot gate machine-wide pushes and a stale
//      copy confuses debugging).
// HONEST LIMIT (trap 3, printed every run): wired is not loaded. This script proves files
// and wiring; only a RELOAD loads them. If settings or hooks changed this session, reload
// and run this again — the script cannot see inside a running Claude Code process.
// Zero model tokens; safe to run anytime; changes nothing on disk.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOME = process.env.USERPROFILE || process.env.HOME || os.homedir();
const HOOKS = path.join(HOME, ".claude", "hooks");
let fail = 0, warn = 0, ran = 0;
const t = (n, c) => { ran++; if (c) console.log("  ok  " + n); else { fail++; console.log("FAIL  " + n); } };
const w = (n) => { warn++; console.log("  ⚠  " + n); };
const rd = (p) => fs.readFileSync(p);

// 1. files byte-equal to templates
const PAIRS = [
  ["templates/global/session-ritual.mjs", path.join(HOOKS, "session-ritual.mjs")],
  ["templates/hooks/push-guard.mjs", path.join(HOOKS, "push-guard.mjs")],
  ["templates/global/deepseek-meter.mjs", path.join(HOOKS, "deepseek-meter.mjs")],
];
for (const [tpl, inst] of PAIRS) {
  const name = path.basename(inst);
  if (!fs.existsSync(inst)) { t(`${name} installed at ~/.claude/hooks/`, false); continue; }
  const a = rd(path.join(ROOT, tpl)), b = rd(inst);
  if (a.equals(b)) t(`${name} byte-equal to its template`, true);
  else {
    let i = 0; while (i < Math.min(a.length, b.length) && a[i] === b[i]) i++;
    t(`${name} byte-equal to its template (first drift at byte ${i}; lengths ${a.length} vs ${b.length} — reinstall LF byte-for-byte)`, false);
  }
}

// 2. wiring vs the skeleton (source of truth for the matcher and command shape)
const skel = JSON.parse(fs.readFileSync(path.join(ROOT, "templates/global/settings.global.skeleton.json"), "utf8"));
const skelPre = (skel.hooks?.PreToolUse || []).find((e) => JSON.stringify(e).includes("push-guard"));
const skelMatcher = skelPre?.matcher || "";
const sPath = path.join(HOME, ".claude", "settings.json");
let st = null;
try { st = JSON.parse(fs.readFileSync(sPath, "utf8")); t("~/.claude/settings.json exists and is valid JSON", true); }
catch { t("~/.claude/settings.json exists and is valid JSON", false); }
if (st) {
  const ss = JSON.stringify(st.hooks?.SessionStart || "");
  t("SessionStart wires session-ritual.mjs", ss.includes("session-ritual.mjs"));
  const pre = (st.hooks?.PreToolUse || []).find((e) => JSON.stringify(e).includes("push-guard"));
  if (!pre) t("PreToolUse wires push-guard.mjs", false);
  else {
    t("PreToolUse wires push-guard.mjs", true);
    t(`push-guard matcher equals the skeleton's (trap 1: every shell-capable tool named)`, pre.matcher === skelMatcher);
    const cmd = JSON.stringify(pre);
    t("push-guard command keeps `|| exit 2` (trap 2: load failure blocks, never allows)", cmd.includes("|| exit 2"));
    const m = cmd.match(/node\\?\s+\\?"?([^"\\]+push-guard\.mjs)/) || cmd.match(/([A-Za-z]:[^"']*push-guard\.mjs|\/[^"']*push-guard\.mjs)/);
    t("push-guard command points at an EXISTING absolute file", !!(m && fs.existsSync(m[1])));
  }
  const sl = JSON.stringify(st.statusLine || "");
  t("statusLine wires deepseek-meter.mjs", sl.includes("deepseek-meter.mjs"));
}

// 3. live-fire the INSTALLED files, sandboxed child env (no token, no keys, throwaway home)
const SBH = fs.mkdtempSync(path.join(os.tmpdir(), "arm-check-"));
fs.mkdirSync(path.join(SBH, ".claude"), { recursive: true });
fs.mkdirSync(path.join(SBH, "Claude-Core", "memory"), { recursive: true });
fs.writeFileSync(path.join(SBH, "Claude-Core", "CLAUDE.md"), "# arm-check-contract\nbody\n");
fs.writeFileSync(path.join(SBH, "Claude-Core", "memory", "MEMORY.md"), "# idx\n- x\n");
fs.writeFileSync(path.join(SBH, ".claude", "CLAUDE.md"), "# hub\n@" + path.join(SBH, "Claude-Core", "CLAUDE.md").replace(/\\/g, "/") + "\n");
const env = { PATH: process.env.PATH, USERPROFILE: SBH, HOME: SBH, XDG_DATA_HOME: path.join(SBH, ".local", "share"), TEMP: os.tmpdir(), TMP: os.tmpdir() };
const guard = path.join(HOOKS, "push-guard.mjs");
if (fs.existsSync(guard)) {
  const r = spawnSync(process.execPath, [guard], { input: JSON.stringify({ tool_name: "Bash", tool_input: { command: "git push --dry-run" } }), encoding: "utf8", env, timeout: 20000 });
  t("LIVE: installed push-guard BLOCKS a tokenless push (exit 2 + reason)", r.status === 2 && /BLOCKED/i.test((r.stderr || "") + (r.stdout || "")));
} else t("LIVE: installed push-guard BLOCKS a tokenless push", false);
const rit = path.join(HOOKS, "session-ritual.mjs");
if (fs.existsSync(rit)) {
  const r = spawnSync(process.execPath, [rit, "start"], { input: JSON.stringify({ source: "startup", cwd: SBH }), encoding: "utf8", env, timeout: 30000 });
  t("LIVE: installed session-ritual exits 0 and speaks", r.status === 0 && (r.stdout || "").length > 50);
} else t("LIVE: installed session-ritual exits 0 and speaks", false);
const met = path.join(HOOKS, "deepseek-meter.mjs");
if (fs.existsSync(met)) {
  const r = spawnSync(process.execPath, [met], { input: "{}", encoding: "utf8", env: { ...env, DSMETER_FAKE_BALANCE: "1.00", DSMETER_FAKE_NOW: new Date().toISOString() }, timeout: 20000 });
  t("LIVE: installed meter renders a DS statusline", /DS /.test(r.stdout || ""));
} else t("LIVE: installed meter renders a DS statusline", false);
fs.rmSync(SBH, { recursive: true, force: true });

// 4. trap-4 shadow scan: project-scoped push-guard wiring under this repo.
// FAILURE, not a warning (audit Aug 2026): a single drifted byte failed this check while a
// shadow guard — the ONE condition that can substitute an UNVERIFIED guard for the verified
// one on the next push — only produced a note. The verdict was the defect. Live-firing the
// user-level files proves nothing about a project-level guard that was never fired, so the
// machine is NOT ARMED until the shadow is gone.
for (const f of ["settings.json", "settings.local.json"]) {
  const p = path.join(ROOT, ".claude", f);
  const shadowed = fs.existsSync(p) && fs.readFileSync(p, "utf8").includes("push-guard");
  t(`no project-level shadow guard (trap 4: ${f})`, !shadowed);
  if (shadowed) console.log(`      ${p} wires its own push-guard; the guard live-fired above is the USER-level one. Delete the shadow copy: push gating is user-level by law.`);
}

console.log("\n  ⚠  trap 3 reminder: wired is not LOADED — if settings or hooks changed this session, reload the window and run this again.");
console.log("  repo nets are separate: run every *_test.mjs script for kit behavior; this proves MACHINE arming only.");
console.log(fail ? `\nmachine arming: ${fail} FAILED of ${ran}${warn ? ` (+${warn} warning)` : ""} — NOT armed` : `\nmachine arming: ${ran} passed, 0 failed${warn ? ` (+${warn} warning)` : ""} — ARMED`);
process.exit(fail ? 1 : 0);
