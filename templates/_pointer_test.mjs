// _pointer_test.mjs — pointer-integrity net (auditor finding, Aug 2026: one-fact-per-file
// with pointer-only cross-referencing rots silently on rename). Run from templates/:
//   node _pointer_test.mjs
// MANDATORY after adding, renaming, or deleting any memory/ file or any DIRECTORY-listed
// file. Pins, all raw reads:
//   1. every memory/*.md (except LOCAL-ONLY-*) has EXACTLY ONE link line in memory/MEMORY.md
//   2. every markdown link in MEMORY.md resolves to a file that exists
//   3. MEMORY.md is under the auto-load cap (200 lines / 25KB) with headroom stated
//   4. every non-memory TRACKED file is named somewhere in DIRECTORY.md (memory/ excepted by
//      law; .git and .claude excepted by nature). UNTRACKED files split (found live Aug 24
//      2026, the net's second first-contact catch): the relay's delivery transients
//      (CODING-BRIEF-*.md, FIX-*.md, *.patch) are lawful and pass with a note — they sit in
//      the root until a brief's cleanup step; ANY other untracked file is a stray and FAILS
//      loudly (index it, ignore it, or remove it) — and since "index it" is one of the
//      remedies, an untracked file ALREADY indexed in DIRECTORY.md is a kit addition pending
//      commit and passes with a note (third first-contact catch, Aug 24 2026: the net's own
//      new templates, applied-but-uncommitted mid-batch, were flagged as strays — the fix was
//      proven against the committed state instead of the applied-uncommitted state every
//      delivery lives in). Untracked memory/ files need no branch here: pin 1 already fails
//      any memory file without exactly one index line. If git is unavailable, everything is
//      treated as tracked — degraded-strict, never degraded-loose.
//   5. every `workflow/…`, `lessons/…`, `templates/…`, `memory/…` path mentioned in the two
//      always-load contract files (CLAUDE.md, memory/MEMORY.md) exists on disk
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const rd = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
let fail = 0, ran = 0;
const t = (n, c) => { ran++; if (c) console.log("  ok  " + n); else { fail++; console.log("FAIL  " + n); } };

const idx = rd("memory/MEMORY.md");
// 1 + 2
const memFiles = fs.readdirSync(path.join(ROOT, "memory")).filter(f => f.endsWith(".md") && f !== "MEMORY.md" && !f.startsWith("LOCAL-ONLY-"));
for (const f of memFiles) {
  const n = (idx.match(new RegExp("\\(" + f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\)", "g")) || []).length;
  t(`index links ${f} exactly once (found ${n})`, n === 1);
}
for (const m of idx.matchAll(/\]\(([^)#\s]+\.md)\)/g)) {
  const target = m[1];
  if (/LOCAL-ONLY-/.test(target)) {
    // Gitignored by law: absent on every clone is CORRECT. Pin the honesty instead: the
    // linking line must say so, or a fresh session trusts a pointer to nothing.
    const line = idx.split(/\r?\n/).find((l) => l.includes(target)) || "";
    t(`LOCAL-ONLY link declares its clone-absence: ${target}`, /gitignored|THIS MACHINE ONLY|fresh clone/i.test(line));
    continue;
  }
  const p = target.startsWith("../") ? target.slice(3) : "memory/" + target;
  t(`index link resolves: ${target}`, fs.existsSync(path.join(ROOT, p)));
}
// 3
const lines = idx.split(/\r?\n/).length;
t(`MEMORY.md under cap: ${lines} lines / ${idx.length} chars`, lines <= 200 && idx.length <= 25000);
if (lines > 170 || idx.length > 21000) console.log("  ⚠ headroom low — plan a split before the cap bites silently");
// 4
const dir = rd("DIRECTORY.md");
const walk = (d, acc = []) => {
  for (const e of fs.readdirSync(path.join(ROOT, d))) {
    if ([".git", ".claude", "node_modules", "archives"].includes(e)) continue;
    const rel = d ? d + "/" + e : e;
    const s = fs.statSync(path.join(ROOT, rel));
    if (s.isDirectory()) walk(rel, acc); else acc.push(rel);
  }
  return acc;
};
let tracked = null;
try { tracked = new Set(execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" }).split(/\r?\n/).filter(Boolean)); }
catch { console.log("  ⚠ git unavailable — treating every file as tracked (degraded-strict)"); }
const TRANSIENT = /^(CODING-BRIEF-.*\.md|FIX-.*\.md|.*\.patch)$/;
for (const f of walk("")) {
  if (f.startsWith("memory/")) continue;               // indexed in MEMORY.md by law
  if (/LOCAL-ONLY|\.code-workspace$/.test(f)) continue; // gitignored classes
  const base = path.basename(f);
  if (tracked && !tracked.has(f)) {
    if (TRANSIENT.test(base) && !f.includes("/")) {    // delivery files live in the ROOT only
      console.log("  note  lawful delivery transient present (cleanup step pending): " + f);
      continue;
    }
    if (dir.includes(base)) {                            // indexed = the "index it" remedy, already taken
      console.log("  note  kit addition pending commit (already indexed): " + f);
      continue;
    }
    t(`untracked STRAY needs a decision (index, ignore, or remove): ${f}`, false);
    continue;
  }
  t(`DIRECTORY names ${f}`, dir.includes(base));
}
// 5
for (const src of ["CLAUDE.md", "memory/MEMORY.md"]) {
  const txt = rd(src);
  for (const m of txt.matchAll(/\b(?:\.\.\/)?((?:workflow|lessons|templates|memory|portfolio|projects)\/[\w\-./]+\.(?:md|mjs|js|json))\b/g)) {
    t(`${src} names an existing path: ${m[1]}`, fs.existsSync(path.join(ROOT, m[1])));
  }
}
console.log("\npointer integrity: " + (fail ? fail + " FAILED of " + ran : ran + " passed, 0 failed"));
process.exit(fail ? 1 : 0);
