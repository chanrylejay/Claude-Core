// boot-claudeai.mjs — the browser half's mechanical boot (Chan GO Aug 28 2026: the CLI
// machine was armed with nets while the claude.ai half booted from prose, unverified).
// Run from the repo root right after the clone:
//   node templates/boot-claudeai.mjs            # resolves mode_default from the state block
//   node templates/boot-claudeai.mjs --mode=JOB_HUNT   # explicit mode override
// What it does — resolve, verify, print; it never reads FOR you:
//   1. prints clone freshness (HEAD hash + commit date) — the relay's staleness signal: the
//      CLI may hold unpushed canon, so the boot report must state this date (relay-boot law).
//   2. parses the state block + cold_start + modes from memory/MEMORY.md frontmatter and
//      prints the ORDERED read list: contract → index (RAW, FULL) → cold_start → mode set →
//      REGISTRY → active_project canon.
//   3. verifies every listed file exists on disk; a missing file is a broken boot: exit 1.
// The reads themselves stay yours and stay RAW (drill law) — this script replaces the
// prose-parsing, never the reading. Net: _boot_claudeai_test.mjs.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = process.argv.find((a) => a.startsWith("--mode="));
const die = (m) => { console.error("BOOT BROKEN: " + m); process.exit(1); };

// ---- 1. clone freshness -----------------------------------------------------------------
let head = "git unavailable — state freshness UNKNOWN, say so in the boot report";
try {
  head = execFileSync("git", ["log", "-1", "--format=%h · committed %ad", "--date=format:%Y-%m-%d %H:%M"], { cwd: ROOT }).toString().trim();
} catch {}
console.log("CLONE HEAD: " + head);
console.log("  ↳ the CLI may hold unpushed canon newer than this. The boot report states this date; if it looks stale for the work at hand, ask Chan before planning against it.\n");

// ---- 2. frontmatter parse (no deps; the shapes here are the only ones the index uses) ----
const idxPath = "memory/MEMORY.md";
const raw = fs.readFileSync(path.join(ROOT, idxPath), "utf8");
const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
if (!fm) die(idxPath + " has no frontmatter block");
const lines = fm[1].split(/\r?\n/);
const strip = (s) => s.replace(/#.*$/, "").trim();

const state = {}, coldStart = [], modes = {};
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
  if (section === "state" && ind === 2 && body.includes(":")) {
    const i = body.indexOf(":");
    state[body.slice(0, i).trim()] = body.slice(i + 1).trim();
  } else if (section === "cold_start" && body.startsWith("- ")) {
    coldStart.push(body.slice(2).trim());
  } else if (section === "modes") {
    if (ind === 2 && body.endsWith(":")) { currentMode = body.slice(0, -1).trim(); modes[currentMode] = []; }
    else if (ind >= 4 && body.startsWith("- ") && currentMode) modes[currentMode].push(body.slice(2).trim());
  }
}
if (!coldStart.length) die("no cold_start list in " + idxPath + " frontmatter");
if (!Object.keys(modes).length) die("no modes block in " + idxPath + " frontmatter");

// ---- 3. resolve mode + assemble the ordered list ----------------------------------------
const mode = arg ? arg.split("=")[1] : (state.mode_default || "");
if (!modes[mode]) die(`mode "${mode}" not in the modes block (have: ${Object.keys(modes).join(", ")})`);

console.log("STATE: " + ["active_track", "mode_default", "trial_active", "active_project"].map((k) => `${k}=${state[k] ?? "?"}`).join(" · "));
console.log("MODE RESOLVED: " + mode + (arg ? " (override)" : " (state block)") + "\n");

const seen = new Set();
const reads = [];
const add = (p, why) => { if (p && !seen.has(p)) { seen.add(p); reads.push([p, why]); } };
add("CLAUDE.md", "frozen core — the contract");
add(idxPath, "RAW and IN FULL — the router (you are past the frontmatter; read the prose too)");
for (const p of coldStart) add(p, "cold-start set");
for (const p of modes[mode]) add(p, "mode: " + mode);
add("projects/REGISTRY.md", "the project map");
add(state.active_project, "active_project — what Chan is working on now");

console.log("ORDERED READS (RAW, in this order — the script never reads them for you):");
let missing = 0;
reads.forEach(([p, why], i) => {
  const ok = fs.existsSync(path.join(ROOT, p));
  if (!ok) missing++;
  console.log(`  ${String(i + 1).padStart(2)}. ${ok ? "    " : "MISSING "}${p}   (${why})`);
});
console.log("");
if (missing) die(missing + " listed file(s) missing on disk — the index and the tree disagree; fix before booting");
console.log("All " + reads.length + " files exist. Boot report line owed to Chan: which reads you did + the CLONE HEAD date above.");
