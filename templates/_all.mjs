// _all.mjs — the net runner: EVERY *_test.mjs in one command (reviewer-1 rec 1, Chan GO
// Aug 28 2026). Run from anywhere:
//   node templates/_all.mjs
// Why (P1's post-mortem): the stale verify-install pin shipped because "which nets does this
// edit touch" was a per-commit judgment call, and the net that catches hook drift lives in a
// different directory than the hook edit. The runner RETIRES that judgment call: after ANY
// kit edit, run this; per-net MANDATORY notes remain only as single-net fallbacks.
// Behavior:
//   - discovers templates/**/_*_test.mjs and runs each in its own directory
//   - global/_meter_test.mjs gets a throwaway DSMETER_HOME (the net refuses the real home)
//   - global/_ritual_test.mjs: LIVE against the installed hook when one exists; otherwise
//     TEMPLATE MODE — plants templates/global (hooks + path-substituted settings skeleton)
//     into a throwaway HOME and certifies the TEMPLATE copies. Template mode is how the
//     credential-less relay sandbox proves a session-ritual patch (reviewer-1 rec 2); the
//     MACHINE certification stays the CLI's (verify-install on the real box).
//   - one line per net; exit nonzero if ANY net fails. SKIP/TEMPLATE lines are expected in a
//     sandbox; a red line never is.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const TPL = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(TPL, "..");
const nets = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/^_.*_test\.mjs$/.test(e.name) && e.name !== path.basename(fileURLToPath(import.meta.url))) nets.push(p);
  }
})(TPL);
nets.sort();

const summaryOf = (stdout, stderr) => {
  const last = (x) => (x || "").trim().split(/\r?\n/).filter(Boolean).pop() || "";
  return (last(stdout) || last(stderr)).slice(0, 110);
};
let anyFail = 0;
const rows = [];
// STREAM, never buffer (Sep 1 2026): a command tool with a ~30 s limit saw NOTHING from a 51 s
// LIVE run and reported a false FAIL, because every row used to print only after the last net.
// The pad is known before the first net runs, so each row prints the moment its net finishes.
const pad = Math.max(...nets.map((n) => path.relative(ROOT, n).replace(/\\/g, "/").length));
console.log(`runner: ${nets.length} nets, streaming one line per net as it finishes...`);

for (const net of nets) {
  const rel = path.relative(ROOT, net).replace(/\\/g, "/");
  const env = { ...process.env };
  let label = "";
  let cleanup = null;

  if (rel.endsWith("global/_meter_test.mjs")) {
    env.DSMETER_HOME = fs.mkdtempSync(path.join(os.tmpdir(), "allnet-meter-"));
    cleanup = env.DSMETER_HOME;
  }
  if (rel.endsWith("global/_ritual_test.mjs")) {
    const live = path.join(os.homedir(), ".claude", "hooks", "session-ritual.mjs");
    if (fs.existsSync(live)) label = "LIVE";
    else {
      const TH = fs.mkdtempSync(path.join(os.tmpdir(), "allnet-ritual-"));
      fs.mkdirSync(path.join(TH, ".claude", "hooks"), { recursive: true });
      for (const h of ["session-ritual.mjs", "deepseek-meter.mjs"])
        fs.copyFileSync(path.join(TPL, "global", h), path.join(TH, ".claude", "hooks", h));
      const skel = fs.readFileSync(path.join(TPL, "global", "settings.global.skeleton.json"), "utf8");
      const wired = skel.replace(/([A-Za-z]:[\\/](?:Users[\\/])?[^\\/"]+|\/home\/[^\/"]+|\/root)(?=[\\/]\.claude)/g, TH.replace(/\\/g, "/"));
      fs.writeFileSync(path.join(TH, ".claude", "settings.json"), wired);
      env.HOME = TH; env.USERPROFILE = TH;
      label = "TEMPLATE"; cleanup = TH;
    }
  }

  const r = spawnSync(process.execPath, [net], { cwd: path.dirname(net), env, encoding: "utf8", timeout: 300000 });
  const out = (r.stdout || "") + (r.stderr || "");
  const sum = summaryOf(r.stdout, r.stderr);
  if (cleanup) fs.rmSync(cleanup, { recursive: true, force: true });

  let verdict;
  if (label === "TEMPLATE") {
    // the ritual net honestly refuses to certify a non-machine run; parse its own count
    const m = out.match(/(\d+) ran, (\d+) failed/);
    const failed = m ? Number(m[2]) : 1;
    verdict = failed === 0 ? "PASS·TEMPLATE" : "FAIL·TEMPLATE";
    if (failed !== 0) anyFail++;
  } else {
    verdict = r.status === 0 ? "PASS" + (label ? "·" + label : "") : "FAIL";
    if (r.status !== 0) anyFail++;
  }
  rows.push([verdict, rel, sum]);
  console.log(`${verdict.padEnd(13)} ${rel.padEnd(pad)}  ${sum}`);
}

console.log(`\nrunner: ${rows.length} nets, ${anyFail} failed.` + (anyFail ? " A red line is never expected — fix before shipping." : " TEMPLATE lines certify template copies only; the machine cert is the CLI's verify-install."));
process.exit(anyFail ? 1 : 0);
