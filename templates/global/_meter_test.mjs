// Regression net for the DeepSeek money meter — plain node, no framework.
// Run:  node _meter_test.mjs   (exit 0 = all pass, 1 = a failure)
// MANDATORY after ANY edit to deepseek-meter.mjs, and after ANY edit to the PEAK_UTC literal
// in session-ritual.mjs (the parity pin below is the ONE guard on that duplication).
// Tests the TEMPLATE copy directly: the meter is display-only glue with no installed-state
// divergence risk beyond bytes, and the settings wiring pin below checks the skeleton names it.
// Every spawn is sandboxed through DSMETER_HOME; the net never touches the real ~/.claude and
// never reaches the network (DSMETER_FAKE_BALANCE is set on every spawn, and a spawn that
// forgets it would try api.deepseek.com and fail the no-network pin by taking >2s — see gate).

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const METER = path.join(HERE, "deepseek-meter.mjs");
const RITUAL = path.join(HERE, "session-ritual.mjs");
const SKELETON = path.join(HERE, "settings.global.skeleton.json");

let fail = 0, ran = 0;
const t = (name, cond) => { ran += 1; if (cond) console.log("  ok  " + name); else { fail += 1; console.log("FAIL  " + name); } };

// ── THE PARITY PIN. PEAK_UTC is deliberately duplicated between the meter and the hook; this
// pin is the one home of that duplication's safety. Extract both literals, compare byte-equal.
const lit = (p) => {
  const m = fs.readFileSync(p, "utf8").match(/const PEAK_UTC = (\[\[[^\]]*\], \[[^\]]*\]\]);/);
  return m ? m[1] : "NOT FOUND in " + path.basename(p);
};
t("PEAK_UTC literal exists in the meter", lit(METER).startsWith("[["));
t("PEAK_UTC literal exists in the hook", lit(RITUAL).startsWith("[["));
t("meter and hook carry the SAME peak windows, byte-equal", lit(METER) === lit(RITUAL));

// ── SANDBOX. One fake home per scenario; the spawn gate refuses any env missing the seams.
const SB = path.join(os.tmpdir(), "dsmeter-test");
fs.rmSync(SB, { recursive: true, force: true });
fs.mkdirSync(SB, { recursive: true });
const mkHome = (name) => {
  const h = path.join(SB, name);
  fs.mkdirSync(path.join(h, ".claude"), { recursive: true });
  return h;
};
const spawnMeter = (env, input) => {
  if (!env.DSMETER_HOME || path.resolve(env.DSMETER_HOME) === path.resolve(os.homedir())) {
    console.error("spawnMeter: every spawn must redirect DSMETER_HOME away from the real home");
    process.exit(1);
  }
  if (!("DSMETER_FAKE_BALANCE" in env)) {
    console.error("spawnMeter: every spawn must set DSMETER_FAKE_BALANCE — this net never touches the network");
    process.exit(1);
  }
  // SANITIZE BY DEFAULT (audit Aug 24 2026, found by the CLI on first contact with a real
  // machine): the old gate merged the host env under the test env, so a machine where Claude
  // Code exports the real ANTHROPIC_AUTH_TOKEN leaked it into the "no key anywhere" spawn and
  // the keyless path never ran — while the planner's clean sandbox printed green. A sandboxed
  // spawn is KEYLESS and SEAMLESS unless the test itself provides the variable; the host env
  // never decides what a pin sees.
  const child = Object.assign({}, process.env);
  for (const k of Object.keys(child)) if (k.startsWith("DSMETER_")) delete child[k];
  delete child.ANTHROPIC_AUTH_TOKEN;
  delete child.DEEPSEEK_API_KEY;
  Object.assign(child, env);
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [METER], { encoding: "utf8", input: input ?? "{}", env: child });
  r.elapsed = Date.now() - t0;
  return r;
};
const keyed = (h, extra) => Object.assign({ DSMETER_HOME: h, DEEPSEEK_API_KEY: "sk-test-net-000", DSMETER_FAKE_BALANCE: "8.41" }, extra);

// 1. basic render, off-peak, fresh state
const H1 = mkHome("basic");
const r1 = spawnMeter(keyed(H1, { DSMETER_FAKE_NOW: "2026-08-24T12:30:00Z" })); // 20:30 Manila, off-peak
t("exits 0", r1.status === 0);
t("renders the balance", /DS .*8\.41/.test(r1.stdout));
t("a fresh day starts at today -$0.00", /today \$0\.00/.test(r1.stdout));
t("off-peak names the NEXT boundary in Manila time", /off-peak.*09:00/.test(r1.stdout));
t("never blocks: a render returns fast", r1.elapsed < 2000);
t("the key never reaches stdout", !r1.stdout.includes("sk-test-net-000"));
t("state file lands in the SANDBOX home", fs.existsSync(path.join(H1, ".claude", "deepseek-meter-state.json")));

// 2. spend accounting: drop counts, top-up never counts negative, rollover resets
const H2 = mkHome("spend");
spawnMeter(keyed(H2, { DSMETER_FAKE_NOW: "2026-08-24T13:00:00Z", DSMETER_FAKE_BALANCE: "9.00" }));
const bump = (iso, bal) => spawnMeter(keyed(H2, { DSMETER_FAKE_NOW: iso, DSMETER_FAKE_BALANCE: bal }));
t("inside the 60s TTL the meter does NOT refetch (cache respected)", /today \$0\.00/.test(bump("2026-08-24T13:00:30Z", "7.00").stdout));
const r2b = bump("2026-08-24T13:05:00Z", "8.60");
t("an observed balance DROP lands in today", /today -\$0\.40/.test(r2b.stdout));
const r2c = bump("2026-08-24T13:10:00Z", "18.60"); // top-up +10
t("a top-up never renders as negative spend", /today -\$0\.40/.test(r2c.stdout));
const r2d = bump("2026-08-24T13:15:00Z", "18.10");
t("spend keeps accumulating after the top-up", /today -\$0\.90/.test(r2d.stdout));
const r2e = bump("2026-08-24T16:30:00Z", "18.10"); // 00:30 Manila NEXT day
t("Manila midnight resets the scoreboard, not UTC midnight", /today \$0\.00/.test(r2e.stdout));

// 3. peak window edges — same truth as the hook, start-inclusive end-exclusive
const edge = (iso) => spawnMeter(keyed(mkHome("edge-" + iso.slice(11, 16).replace(":", "")), { DSMETER_FAKE_NOW: iso })).stdout;
t("00:59 UTC renders off-peak", /off-peak/.test(edge("2026-08-24T00:59:00Z")));
t("01:00 UTC opens PEAK", /PEAK 2x/.test(edge("2026-08-24T01:00:00Z")));
t("03:59 UTC still PEAK", /PEAK 2x/.test(edge("2026-08-24T03:59:00Z")));
t("04:00 UTC closes it", /off-peak/.test(edge("2026-08-24T04:00:00Z")));
t("06:00 UTC opens the second window", /PEAK 2x/.test(edge("2026-08-24T06:00:00Z")));
t("10:00 UTC closes it", /off-peak/.test(edge("2026-08-24T10:00:00Z")));
t("peak names its END in Manila time", /PEAK 2x > 12:00/.test(edge("2026-08-24T01:30:00Z")));
t("late off-peak wraps to tomorrow's first peak", /> .*09:00/.test(edge("2026-08-24T11:00:00Z")));
const one = (s) => (/PEAK 2x/.test(s) ? 1 : 0) + (/off-peak/.test(s) ? 1 : 0);
t("exactly ONE price state per render", one(edge("2026-08-24T02:00:00Z")) === 1 && one(edge("2026-08-24T05:00:00Z")) === 1);

// 4. failure manners
const H4 = mkHome("fail");
const rNoKey = spawnMeter({ DSMETER_HOME: H4, DSMETER_FAKE_BALANCE: "1" }); // no key anywhere in sandbox home
t("no key: says so plainly, exit 0", rNoKey.status === 0 && /no DeepSeek key/.test(rNoKey.stdout));
// THE POISON PIN (Aug 24 2026): reproduce the CLI machine's condition everywhere. Plant a fake
// key in the NET'S OWN environment; the sanitizing gate must keep the child keyless anyway.
// Before the gate fix this fails on any machine, clean sandbox included — the defect the old
// green run could not see is now a permanent red until isolation holds.
process.env.ANTHROPIC_AUTH_TOKEN = "sk-parent-leak-poison";
const rLeak = spawnMeter({ DSMETER_HOME: mkHome("poison"), DSMETER_FAKE_BALANCE: "1" });
delete process.env.ANTHROPIC_AUTH_TOKEN;
t("a key in the net's OWN env never leaks into a sandboxed spawn", /no DeepSeek key/.test(rLeak.stdout));
t("and the poison key never reaches stdout", !rLeak.stdout.includes("sk-parent-leak-poison"));
const H5 = mkHome("stale");
spawnMeter(keyed(H5, { DSMETER_FAKE_NOW: "2026-08-24T12:00:00Z", DSMETER_FAKE_BALANCE: "5.00" }));
const rStale = spawnMeter(keyed(H5, { DSMETER_FAKE_NOW: "2026-08-24T12:10:00Z", DSMETER_FAKE_BALANCE: "not-a-number" }));
t("a failed fetch renders the CACHED balance", /5\.00/.test(rStale.stdout));
t("and marks it stale with its age", /\*10m old/.test(rStale.stdout));
t("and still exits 0", rStale.status === 0);
const H6 = mkHome("low");
const rLow = spawnMeter(keyed(H6, { DSMETER_FAKE_NOW: "2026-08-24T12:00:00Z", DSMETER_FAKE_BALANCE: "1.50" }));
t("under $2 shouts LOW", /LOW/.test(rLow.stdout));
const H7 = mkHome("settingskey");
fs.writeFileSync(path.join(H7, ".claude", "settings.json"), JSON.stringify({ env: { ANTHROPIC_AUTH_TOKEN: "sk-from-settings" } }));
const rSet = spawnMeter({ DSMETER_HOME: H7, DSMETER_FAKE_BALANCE: "3.33" });
t("a standalone run finds the key in settings.json", /3\.33/.test(rSet.stdout));
t("that key never reaches stdout either", !rSet.stdout.includes("sk-from-settings"));

// 4b. soft spend cap (Aug 2026): render only when a valid cap is met, silence otherwise
const H8 = mkHome("cap");
const capRun = (bal, capTxt) => {
  if (capTxt !== null) fs.writeFileSync(path.join(H8, ".claude", "deepseek-cap.txt"), capTxt);
  else fs.rmSync(path.join(H8, ".claude", "deepseek-cap.txt"), { force: true });
  return spawnMeter(keyed(H8, { DSMETER_FAKE_NOW: "2026-08-24T12:00:00Z", DSMETER_FAKE_BALANCE: "9.00" })).stdout;
};
capRun("9.00", null); // seed day at 9.00
fs.rmSync(path.join(H8, ".claude", "deepseek-meter-state.json"), { force: true });
spawnMeter(keyed(H8, { DSMETER_FAKE_NOW: "2026-08-24T12:00:00Z", DSMETER_FAKE_BALANCE: "9.00" }));
let out = spawnMeter(keyed(H8, { DSMETER_FAKE_NOW: "2026-08-24T12:05:00Z", DSMETER_FAKE_BALANCE: "8.40" })).stdout; // spent 0.60, no cap yet
t("no cap file: no ⚠CAP segment", !/⚠CAP/.test(out));
fs.writeFileSync(path.join(H8, ".claude", "deepseek-cap.txt"), "0.50");
out = spawnMeter(keyed(H8, { DSMETER_FAKE_NOW: "2026-08-24T12:06:00Z", DSMETER_FAKE_BALANCE: "8.40" })).stdout;
t("cap met renders ⚠CAP with spent/cap", /⚠CAP \$0\.60\/\$0\.50/.test(out));
fs.writeFileSync(path.join(H8, ".claude", "deepseek-cap.txt"), "5.00");
out = spawnMeter(keyed(H8, { DSMETER_FAKE_NOW: "2026-08-24T12:07:00Z", DSMETER_FAKE_BALANCE: "8.40" })).stdout;
t("under a raised cap the segment disappears", !/⚠CAP/.test(out));
fs.writeFileSync(path.join(H8, ".claude", "deepseek-cap.txt"), "banana");
out = spawnMeter(keyed(H8, { DSMETER_FAKE_NOW: "2026-08-24T12:08:00Z", DSMETER_FAKE_BALANCE: "8.40" })).stdout;
t("a malformed cap is silent, never an error", !/⚠CAP/.test(out) && /DS /.test(out));

// 5. wiring: the skeleton must point the statusLine at THIS meter, or a rebuilt machine
//    silently keeps the old ccusage line that cannot see DeepSeek numbers.
try {
  const sk = JSON.parse(fs.readFileSync(SKELETON, "utf8"));
  t("the settings skeleton wires statusLine to deepseek-meter.mjs", /deepseek-meter\.mjs/.test(sk?.statusLine?.command || ""));
} catch { t("the settings skeleton wires statusLine to deepseek-meter.mjs", false); }

// 6. encoding pins, same law as every executable in this kit
for (const p of [METER, fileURLToPath(import.meta.url)]) {
  const b = fs.readFileSync(p);
  t("no BOM in " + path.basename(p), !(b.length >= 3 && b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf));
  t("no CRLF in " + path.basename(p), !b.includes(0x0d));
}

fs.rmSync(SB, { recursive: true, force: true });
console.log("\ndeepseek meter: " + (fail ? fail + " FAILED of " + ran : ran + " passed, 0 failed"));
process.exit(fail ? 1 : 0);
