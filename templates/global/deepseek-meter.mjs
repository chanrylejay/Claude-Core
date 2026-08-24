// deepseek-meter.mjs — the money meter. One line for VS Code's status bar:
//   DS $8.41 | today -$0.37 | off-peak > 14:00        (normal)
//   DS $8.41 | today -$0.52 | PEAK 2x > 18:00         (peak, red)
// Wired via ~/.claude/settings.json statusLine.command (see settings.global.skeleton.json).
// The status bar renders OUTSIDE the model's context, so this meter costs zero tokens forever.
// Why it exists: the four cost habits in memory/chan-ai-cost-context.md need a scoreboard, and
// Claude Code's own meter has nothing to compute from on the DeepSeek endpoint
// (lessons/platform-gotchas.md, DeepSeek API). Balance endpoint facts live there too — one home.
//
// What it does, and honestly what it does not:
//   - Balance: GET api.deepseek.com/user/balance with the existing key, cached 60s on disk so
//     the status bar never spams the network. Fetch failure = stale render with age, exit 0.
//   - "today": the sum of balance DROPS this meter has itself observed since Manila midnight.
//     A top-up (balance rises) is never counted as negative spend. Spend made while this meter
//     was not running (PC off, another tool) is NOT in "today" — the balance is always live
//     truth, the today figure is what the meter witnessed. Good enough for a scoreboard.
//   - Peak state: same windows as the session-ritual hook. The PEAK_UTC literal is deliberately
//     DUPLICATED between the two files; _meter_test.mjs pins the two literals byte-equal and
//     fails loudly on drift. Change both in the same edit, then run BOTH nets.
//   - The key is read, used for one HTTPS header, and never printed, logged, or written to the
//     state file. The state file holds money numbers only and lives in ~/.claude, outside any repo.
//
// TEST SEAMS (production never sets these; the net sets them per-spawn):
//   DSMETER_HOME          — redirects the state file AND the settings.json read into a sandbox.
//   DSMETER_FAKE_BALANCE  — a decimal string; skips the network and uses this as the live balance.
//   DSMETER_FAKE_NOW      — ISO datetime; overrides the clock for peak windows AND day rollover.
// NEVER blocks, never throws to the caller: a broken meter must render its brokenness, exit 0.

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, openSync, readSync, closeSync } from "node:fs";
import { join } from "node:path";
import https from "node:https";

const HOME = process.env.DSMETER_HOME || process.env.USERPROFILE || process.env.HOME || "C:/Users/Chanryle";
const STATE_PATH = join(HOME, ".claude", "deepseek-meter-state.json");
const FETCH_TTL_MS = 60_000;
const PEAK_UTC = [[60, 240], [360, 600]]; // [01:00,04:00) and [06:00,10:00) UTC — keep byte-equal with session-ritual.mjs
const MANILA_OFFSET_MIN = 480; // UTC+8, no DST

// Claude Code pipes session JSON on stdin and closes it; a manual run from a terminal never
// closes stdin. Read with a 200ms ceiling so neither case can hang the status bar.
function drainStdin() {
  return new Promise((res) => {
    let done = false;
    const fin = () => { if (!done) { done = true; res(); } };
    const t = setTimeout(fin, 200);
    try {
      process.stdin.on("data", () => {});
      process.stdin.on("end", () => { clearTimeout(t); fin(); });
      process.stdin.on("error", () => { clearTimeout(t); fin(); });
    } catch { clearTimeout(t); fin(); }
  });
}

function nowDate() {
  const fake = process.env.DSMETER_FAKE_NOW;
  if (fake) { const d = new Date(fake); if (!Number.isNaN(d.getTime())) return d; }
  return new Date();
}
function utcMinutes(d) { return d.getUTCHours() * 60 + d.getUTCMinutes(); }
function manilaDayKey(d) {
  const shifted = new Date(d.getTime() + MANILA_OFFSET_MIN * 60_000);
  return shifted.toISOString().slice(0, 10); // the DATE in Manila, as YYYY-MM-DD
}
function fmtManila(utcMin) {
  const m = (utcMin + MANILA_OFFSET_MIN) % 1440;
  return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
}
function peakState(d) {
  const mins = utcMinutes(d);
  const inPeak = PEAK_UTC.some(([a, b]) => mins >= a && mins < b);
  const bounds = [60, 240, 360, 600];
  let next = bounds.find((b) => b > mins);
  if (next === undefined) next = bounds[0]; // past 10:00 UTC wraps to tomorrow's first peak
  return { inPeak, nextManila: fmtManila(next) };
}

function readState() {
  try { return JSON.parse(readFileSync(STATE_PATH, "utf8")); } catch { return {}; }
}
function writeState(s) {
  try { mkdirSync(join(HOME, ".claude"), { recursive: true }); writeFileSync(STATE_PATH, JSON.stringify(s)); } catch {}
}

// The key: env first (Claude Code loads settings.env into the child environment), then the
// settings file itself for a standalone run. Read, used once, never emitted anywhere.
function findKey() {
  if (process.env.DEEPSEEK_API_KEY) return process.env.DEEPSEEK_API_KEY;
  if (process.env.ANTHROPIC_AUTH_TOKEN) return process.env.ANTHROPIC_AUTH_TOKEN;
  try {
    const s = JSON.parse(readFileSync(join(HOME, ".claude", "settings.json"), "utf8"));
    return s?.env?.DEEPSEEK_API_KEY || s?.env?.ANTHROPIC_AUTH_TOKEN || "";
  } catch { return ""; }
}

// GET /user/balance. balance_infos is an ARRAY; prefer the USD entry, else the first.
// Amounts arrive as decimal STRINGS (platform-gotchas: parse for display only, never re-store
// arithmetic on floats where exactness matters — display to 2dp is all this meter does).
function fetchBalance(key) {
  const fake = process.env.DSMETER_FAKE_BALANCE;
  if (fake !== undefined) {
    const v = Number(fake);
    return Promise.resolve(Number.isFinite(v) ? v : null);
  }
  return new Promise((res) => {
    const req = https.get(
      { host: "api.deepseek.com", path: "/user/balance", headers: { Authorization: "Bearer " + key, Accept: "application/json" }, timeout: 5000 },
      (r) => {
        let body = "";
        r.on("data", (c) => (body += c));
        r.on("end", () => {
          try {
            const j = JSON.parse(body);
            const infos = Array.isArray(j.balance_infos) ? j.balance_infos : [];
            const pick = infos.find((b) => b.currency === "USD") || infos[0];
            const v = pick ? Number(pick.total_balance) : NaN;
            res(Number.isFinite(v) ? v : null);
          } catch { res(null); }
        });
      },
    );
    req.on("timeout", () => { req.destroy(); res(null); });
    req.on("error", () => res(null));
  });
}

function readCtx() {
  // LIVE CONTEXT SIZE — the UI the endpoint denies us (Aug 2026, Chan's finding: the habit
  // said "compact at 400K" on a machine with no way to SEE 400K). Claude Code writes every
  // response's provider-reported usage into the active session's transcript jsonl, so the
  // LAST usage block's input-side tokens ARE the current context, exact, on disk. We read
  // the tail of the most recently written transcript. Zero model tokens; any failure = no
  // segment, silently (this is a gauge, not a gate).
  try {
    const root = process.env.DSMETER_PROJECTS || join(HOME, ".claude", "projects");
    let newest = null;
    const walk = (d) => {
      for (const e of readdirSync(d)) {
        const p = join(d, e);
        const st = statSync(p);
        if (st.isDirectory()) walk(p);
        else if (e.endsWith(".jsonl") && (!newest || st.mtimeMs > newest.m)) newest = { p, m: st.mtimeMs };
      }
    };
    walk(root);
    if (!newest) return null;
    const sz = statSync(newest.p).size;
    const fd = openSync(newest.p, "r");
    const take = Math.min(sz, 262144);
    const buf = Buffer.alloc(take);
    readSync(fd, buf, 0, take, sz - take);
    closeSync(fd);
    const tail = buf.toString("utf8");
    // simpler and robust: find the LAST "usage" block and sum its input-side numbers
    const ui = tail.lastIndexOf('"usage"');
    if (ui < 0) return null;
    const seg = tail.slice(ui, ui + 400);
    let tok = 0;
    for (const m of seg.matchAll(/"(?:input_tokens|cache_read_input_tokens|cache_creation_input_tokens)"\s*:\s*(\d+)/g)) tok += Number(m[1]);
    return tok > 0 ? tok : null;
  } catch { return null; }
}

function readCap() {
  // Soft spend cap: a number (USD) in ~/.claude/deepseek-cap.txt. Absent/invalid = no cap.
  try {
    const v = Number(readFileSync(join(HOME, ".claude", "deepseek-cap.txt"), "utf8").trim());
    return Number.isFinite(v) && v > 0 ? v : null;
  } catch { return null; }
}

function render(balance, staleMin, today, peak, note, cap, ctx) {
  const RED = "\u001b[31m", YEL = "\u001b[33m", DIM = "\u001b[2m", OFF = "\u001b[0m";
  const bal = balance === null ? "?" : "$" + balance.toFixed(2);
  const low = balance !== null && balance < 2;
  const balStr = (low ? RED + bal + " LOW" + OFF : bal) + (staleMin > 0 ? DIM + "*" + staleMin + "m old" + OFF : "");
  // "-$0.00" reads like negative zero (CLI catch, Aug 24 2026): nothing spent renders unsigned.
  const todayStr = today >= 0.005 ? "today -$" + today.toFixed(2) : "today $0.00";
  const peakStr = peak.inPeak
    ? RED + "PEAK 2x > " + peak.nextManila + OFF
    : "off-peak > " + YEL + peak.nextManila + OFF;
  const capStr = cap !== null && today >= cap ? " " + RED + "⚠CAP $" + today.toFixed(2) + "/$" + cap.toFixed(2) + OFF : "";
  // thresholds from the measured economics: under 150K a compact costs ~3 cents and hits are
  // coffee money; past 280K both are real dollars on a long day.
  let ctxStr = "";
  if (ctx !== null) {
    const k = Math.round(ctx / 1000);
    ctxStr = ctx >= 280000 ? " | " + RED + "ctx " + k + "K ⚠compact" + OFF
           : ctx >= 150000 ? " | " + YEL + "ctx " + k + "K" + OFF
           : " | " + DIM + "ctx " + k + "K" + OFF;
  }
  return "DS " + balStr + " | " + todayStr + capStr + ctxStr + " | " + peakStr + (note ? " " + DIM + note + OFF : "");
}

try {
  await drainStdin();
  const now = nowDate();
  const key = findKey();
  if (!key) {
    // No key is a config truth worth showing, not an error worth hiding.
    process.stdout.write("DS meter: no DeepSeek key in env or ~/.claude/settings.json");
    process.exit(0);
  }
  const st = readState();
  const dayKey = manilaDayKey(now);
  if (st.day_key !== dayKey) { st.day_key = dayKey; st.day_spent = 0; } // Manila midnight resets the scoreboard

  let balance = typeof st.balance === "number" ? st.balance : null;
  let staleMin = 0;
  const age = now.getTime() - (st.last_fetch_ms || 0);
  if (age >= FETCH_TTL_MS) {
    const fresh = await fetchBalance(key);
    if (fresh !== null) {
      // Spend = observed DROP only. A rise is a top-up, never negative spend.
      if (typeof st.balance === "number" && fresh < st.balance) {
        st.day_spent = (st.day_spent || 0) + (st.balance - fresh);
      }
      st.balance = fresh;
      st.last_fetch_ms = now.getTime();
      balance = fresh;
    } else if (balance !== null) {
      staleMin = Math.floor(age / 60_000);
    }
  }
  writeState(st);
  process.stdout.write(render(balance, staleMin, st.day_spent || 0, peakState(now), balance === null ? "(balance unreachable)" : "", readCap(), readCtx()));
  process.exit(0);
} catch (e) {
  // A broken meter renders its brokenness and never blocks the status bar.
  try { process.stdout.write("DS meter error: " + (e?.message ?? e)); } catch {}
  process.exit(0);
}
