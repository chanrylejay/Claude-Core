// boot-claudeai.mjs — the browser half's mechanical boot (Chan GO Aug 28 2026: the CLI
// machine was armed with nets while the claude.ai half booted from prose, unverified).
// Run from the repo root right after the clone:
//   node templates/boot-claudeai.mjs               # resolves mode_default from the state block
//   node templates/boot-claudeai.mjs --mode=LEAN    # override; LEAN = contract + index + hard rules
// What it does — resolve, verify, print; it never reads FOR you:
//   1. prints clone freshness (HEAD hash + commit date) and the state block's age — the
//      relay's staleness signals: the CLI may hold unpushed canon, so the boot report states
//      the HEAD date; a state block older than 14 days prints STALE (confirm with Chan).
//   2. resolves state + cold_start + modes + lookup + boot from memory/MEMORY.md frontmatter
//      through THE shared resolver (boot-resolver.mjs, batch 1a Sep 12 2026: one parser and
//      one read-plan rule for every seat; this file only prints) and prints TWO lists
//      (batch 1, Aug 30 2026; why: ../lessons/audit-log.md AL-20):
//        BOOT   — read now, RAW, in order: contract → relay ramp → index (FULL) → cold_start
//                 → mode set → active_project canon. Character-counted (CRLF-normalized)
//                 against boot.budget_chars.
//        LOOKUP — verified present, NEVER read at boot; each line names its trigger. The
//                 contract and the canon name the same triggers where the work happens.
//   3. verifies every listed file, both lists, exists on disk: a missing file is a broken
//      boot, exit 1. Over budget prints OVER BUDGET but still boots (a session must be able
//      to boot in order to fix it); the boot NET is what turns it red.
//   A broken index (unknown mode, stripped cold_start, missing active_project, no frontmatter)
//      is ALSO exit 1, but only AFTER everything that still resolves has been printed (batch
//      1a v2, Codex ruling on CLARIFY 3): the session keeps its anchors on screen to fix the
//      index with, and the BOOT BROKEN lines name every problem, not just the first.
// The reads themselves stay yours and stay RAW (drill law) — this script replaces the
// prose-parsing, never the reading. Net: _boot_claudeai_test.mjs (this printer) and
// _boot_resolver_test.mjs (the resolver, per-seat fixtures, live agreement).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { INDEX_PATH, charsOf, parseIndex, resolveBoot } from "./boot-resolver.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = process.argv.find((a) => a.startsWith("--mode="));
const size = (p) => charsOf(ROOT, p);

// ---- 1. clone freshness -----------------------------------------------------------------
let head = "git unavailable — state freshness UNKNOWN, say so in the boot report";
try {
  head = execFileSync("git", ["log", "-1", "--format=%h · committed %ad", "--date=format:%Y-%m-%d %H:%M"], { cwd: ROOT }).toString().trim();
} catch {}
console.log("CLONE HEAD: " + head);
console.log("  ↳ the CLI may hold unpushed canon newer than this. The boot report states this date; if it looks stale for the work at hand, ask Chan before planning against it.");

// ---- 2. parse + resolve (the shared resolver; a parse problem is a broken boot here) ----
const idxPath = INDEX_PATH;
const index = parseIndex(fs.readFileSync(path.join(ROOT, idxPath), "utf8"));
const { state, boot } = index; // parse problems are printed at the end, after the lists (v2)

// ---- state age ---------------------------------------------------------------------------
const updated = state.updated || "";
const ageDays = updated ? Math.floor((Date.now() - Date.parse(updated)) / 86400000) : NaN;
console.log("STATE BLOCK: updated " + (updated || "?") + (Number.isFinite(ageDays) ? ` (${ageDays} days ago)` : "")
  + (ageDays > 14 ? " — STALE past 14 days: confirm the NOW state with Chan before this block decides anything" : ""));

// ---- 3. resolve mode + the two lists (seat: browser) -------------------------------------
const plan = resolveBoot(index, { seat: "browser", mode: arg ? arg.split("=")[1] : "" });
const problems = [...plan.problems]; // carries the parse problems too; printed after the lists
const mode = plan.mode;

console.log("STATE: " + ["active_track", "mode_default", "trial_active", "active_project"].map((k) => `${k}=${state[k] ?? "?"}`).join(" · "));
console.log("MODE RESOLVED: " + mode + (arg ? " (override)" : " (state block)") + "\n");

const bootList = plan.boot.map(({ path: p, why }) => [p, why]);
const lookupList = plan.lookup.map(({ path: p, why }) => [p, why]);

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
if (missing) problems.push(missing + " listed file(s) missing on disk — the index and the tree disagree; fix before booting");
if (problems.length) { for (const p of problems) console.error("BOOT BROKEN: " + p); process.exit(1); }
console.log("All " + n + " files exist. Boot report line owed to Chan: which BOOT reads you did, the CLONE HEAD date, and the BOOT SET count above.");
