// boot-claudeai.mjs — the browser half's mechanical boot (Chan GO Aug 28 2026: the CLI
// machine was armed with nets while the claude.ai half booted from prose, unverified).
// Run from the repo root right after the clone:
//   node templates/boot-claudeai.mjs               # resolves mode_default from the state block
//   node templates/boot-claudeai.mjs --mode=LEAN    # override; LEAN = contract + index + hard rules
// What it does — resolve, verify, print; it never reads FOR you:
//   1. prints clone freshness (HEAD hash + commit date) and the state block's age — the
//      relay's staleness signals: the CLI may hold unpushed canon, so the boot report states
//      the HEAD date; a state block older than 14 days prints STALE (confirm with Chan).
//   2. parses state + cold_start + modes + lookup + boot from memory/MEMORY.md frontmatter
//      and prints TWO lists (batch 1, Aug 30 2026; why: ../lessons/audit-log.md AL-20):
//        BOOT   — read now, RAW, in order: contract → relay ramp → index (FULL) → cold_start
//                 → mode set → active_project canon. Character-counted (CRLF-normalized)
//                 against boot.budget_chars.
//        LOOKUP — verified present, NEVER read at boot; each line names its trigger. The
//                 contract and the canon name the same triggers where the work happens.
//   3. verifies every listed file, both lists, exists on disk: a missing file is a broken
//      boot, exit 1. Over budget prints OVER BUDGET but still boots (a session must be able
//      to boot in order to fix it); the boot NET is what turns it red.
// The reads themselves stay yours and stay RAW (drill law) — this script replaces the
// prose-parsing, never the reading. Net: _boot_claudeai_test.mjs.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = process.argv.find((a) => a.startsWith("--mode="));
const die = (m) => { console.error("BOOT BROKEN: " + m); process.exit(1); };
// characters, not bytes, CRLF normalized: both halves of the relay report ONE number (the
// CLI's Windows checkout counted 423 bytes more than the LF sandbox in batch 1; AL-21).
const size = (p) => { try { return fs.readFileSync(path.join(ROOT, p), "utf8").replace(/\r\n/g, "\n").length; } catch { return 0; } };

// ---- 1. clone freshness -----------------------------------------------------------------
let head = "git unavailable — state freshness UNKNOWN, say so in the boot report";
try {
  head = execFileSync("git", ["log", "-1", "--format=%h · committed %ad", "--date=format:%Y-%m-%d %H:%M"], { cwd: ROOT }).toString().trim();
} catch {}
console.log("CLONE HEAD: " + head);
console.log("  ↳ the CLI may hold unpushed canon newer than this. The boot report states this date; if it looks stale for the work at hand, ask Chan before planning against it.");

// ---- 2. frontmatter parse (no deps; the shapes here are the only ones the index uses) ----
const idxPath = "memory/MEMORY.md";
const raw = fs.readFileSync(path.join(ROOT, idxPath), "utf8");
const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
if (!fm) die(idxPath + " has no frontmatter block");
const lines = fm[1].split(/\r?\n/);
const strip = (s) => s.replace(/#.*$/, "").trim();
const comment = (s) => (s.match(/#\s*(.*)$/) || [, ""])[1].trim();

const state = {}, boot = {}, coldStart = [], modes = {}, lookup = [];
let section = null, currentMode = null;
for (const l of lines) {
  const ind = l.length - l.trimStart().length;
  const body = strip(l);
  if (!body) continue;
  if (ind === 0) {
    section = body.replace(/:$/, "").split(":")[0];
    currentMode = null;
    continue;
  }
  if ((section === "state" || section === "boot") && ind === 2 && body.includes(":")) {
    const i = body.indexOf(":");
    (section === "state" ? state : boot)[body.slice(0, i).trim()] = body.slice(i + 1).trim();
  } else if (section === "cold_start" && body.startsWith("- ")) {
    coldStart.push([body.slice(2).trim(), comment(l)]);
  } else if (section === "lookup" && body.startsWith("- ")) {
    lookup.push([body.slice(2).trim(), comment(l)]);
  } else if (section === "modes") {
    if (ind === 2 && body.endsWith(":")) { currentMode = body.slice(0, -1).trim(); modes[currentMode] = []; }
    else if (ind >= 4 && body.startsWith("- ") && currentMode) modes[currentMode].push(body.slice(2).trim());
  }
}
if (!coldStart.length) die("no cold_start list in " + idxPath + " frontmatter");
if (!Object.keys(modes).length) die("no modes block in " + idxPath + " frontmatter");

// ---- state age ---------------------------------------------------------------------------
const updated = state.updated || "";
const ageDays = updated ? Math.floor((Date.now() - Date.parse(updated)) / 86400000) : NaN;
console.log("STATE BLOCK: updated " + (updated || "?") + (Number.isFinite(ageDays) ? ` (${ageDays} days ago)` : "")
  + (ageDays > 14 ? " — STALE past 14 days: confirm the NOW state with Chan before this block decides anything" : ""));

// ---- 3. resolve mode + assemble the two lists -------------------------------------------
const mode = arg ? arg.split("=")[1] : (state.mode_default || "");
if (!modes[mode]) die(`mode "${mode}" not in the modes block (have: ${Object.keys(modes).join(", ")})`);

console.log("STATE: " + ["active_track", "mode_default", "trial_active", "active_project"].map((k) => `${k}=${state[k] ?? "?"}`).join(" · "));
console.log("MODE RESOLVED: " + mode + (arg ? " (override)" : " (state block)") + "\n");

const seen = new Set();
const bootList = [], lookupList = [];
const add = (list, p, why) => { if (p && !seen.has(p)) { seen.add(p); list.push([p, why]); } };
add(bootList, "CLAUDE.md", "frozen core — the contract");
add(bootList, "workflow/relay-boot-claudeai.md", "the browser half's entry ramp"); // relay ramp rides the boot (batch 1, Aug 30 2026)
add(bootList, idxPath, "RAW and IN FULL — the router (past the frontmatter, read the prose too)");
for (const [p, c] of coldStart) {
  // lean:lookup (batch 4b, Aug 31 2026): under LEAN the three judgment files are LOOKUP; a trivial
  // task writes no UI report and parks no decision. Every other mode carries them on purpose.
  if (mode === "LEAN" && /lean:lookup/.test(c)) add(lookupList, p, "open when: the task touches UI, a client, or a decision for Chan (LEAN skips it)");
  else add(bootList, p, "cold-start set");
}
for (const p of modes[mode]) add(bootList, p, "mode: " + mode);
if (mode === "LEAN") add(lookupList, state.active_project, "open when: the task touches the active project (LEAN skips the canon)");
else add(bootList, state.active_project, "active_project — what Chan is working on now");
for (const [p, trig] of lookup) add(lookupList, p, "open when: " + (trig || "its trigger fires"));

let n = 0, missing = 0;
const show = ([p, why]) => {
  const ok = fs.existsSync(path.join(ROOT, p));
  if (!ok) missing++;
  console.log(`  ${String(++n).padStart(2)}. ${ok ? "    " : "MISSING "}${p}   (${why})${ok ? `   [${size(p)} chars]` : ""}`);
};
console.log("BOOT — read RAW, in this order (the script never reads them for you):");
bootList.forEach(show);
const bytes = bootList.reduce((s, [p]) => s + size(p), 0);
const budget = Number(boot.budget_chars || 0);
console.log(`BOOT SET: ${bytes} chars ≈ ${Math.round(bytes / 4)} tokens` + (budget ? ` · budget ${budget}` : " · no boot.budget_chars in the frontmatter"));
if (budget && bytes > budget) console.log(`  OVER BUDGET by ${bytes - budget} chars — the boot net is red; trim the BOOT list or raise boot.budget_chars with Chan's GO. Booting anyway so you can fix it.`);
console.log("");
console.log("LOOKUP — verified present, NOT read at boot; open at the trigger (fail-closed if missing):");
lookupList.forEach(show);
console.log("");
if (missing) die(missing + " listed file(s) missing on disk — the index and the tree disagree; fix before booting");
console.log("All " + n + " files exist. Boot report line owed to Chan: which BOOT reads you did, the CLONE HEAD date, and the BOOT SET count above.");
