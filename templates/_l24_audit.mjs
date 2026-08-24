// _l24_audit.mjs — the L24 rewrite audit as a deterministic script.
// Usage:  node _l24_audit.mjs <file> [<file>...]        (compares worktree vs git HEAD)
//         node _l24_audit.mjs --base <ref> <file>...    (compares worktree vs <ref>)
// Exit 0 = zero LOST tokens. Exit 1 = LOST tokens listed; restore them or get Chan's
// explicit OK for each named drop before the rewrite ships. Triage classes printed:
// IN-PLACE (still in the same file), RELOCATED (found in another tracked .md/.json in the
// repo), LOST (found nowhere).
// Why a script (audit finding, Aug 2026): hand-extraction by a model degrades silently over
// long texts — the exact failure L24 exists to catch. The law's home is
// lessons/universal-patterns.md ("Maintaining documents"); this script implements it and the
// class list below mirrors that home. New fact-bearing class discovered → add it THERE and
// HERE in the same edit; _l24_test.mjs pins the two lists in sync.
// Reads are RAW (git show + fs), never through a compressing layer — exact-token work reads
// raw, always.

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const CLASSES = [
  /\b\d[\d,\.]*%?\b/g,                                            // numbers, percents
  /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* ?\d{1,2},? ?\d{0,4}\b/g, // dates
  /https?:\/\/\S+/g,                                              // urls
  /[\w\-.\/~]+\.(?:md|mjs|js|json|txt|exe|py)\b/g,                // file paths
  /\b[a-z]+(?:[A-Z][a-z0-9]+)+\b/g,                               // CamelCase
  /\b[A-Z][A-Z0-9_]{2,}\b/g,                                      // SCREAMING_SNAKE
  /\b[a-z0-9]+(?:-[a-z0-9]+)+\b/g,                                // kebab-case
  /\b[a-z0-9]+(?:_[a-z0-9]+)+\b/g,                                // snake_case
  /\bv?\d+\.\d+(?:\.\d+)?\b/g,                                    // versions
  /["\u201c]([^"\u201d]{3,60})["\u201d]/g,                        // quoted literals
  /\$\d[\d,\.]*[KMB]?/g,                                          // money
  /\b(?:never|only|unless|always|must|forbidden)\b/gi,            // modals/negations — a rewrite can keep every noun and drop the condition (auditor finding, Aug 2026)
];

const args = process.argv.slice(2);
let base = "HEAD";
if (args[0] === "--base") { base = args[1]; args.splice(0, 2); }
if (!args.length) { console.error("usage: node _l24_audit.mjs [--base <ref>] <file>..."); process.exit(1); }

function tokens(text) {
  const out = new Set();
  for (const re of CLASSES) for (const m of text.matchAll(re)) out.add(m[1] ?? m[0]);
  return out;
}
function repoCorpus() {
  // every tracked-ish doc in the worktree, for RELOCATED checks; raw reads only
  let buf = "";
  const walk = (d) => {
    for (const e of readdirSync(d)) {
      if (e === ".git" || e === "node_modules") continue;
      const p = join(d, e);
      const s = statSync(p);
      if (s.isDirectory()) walk(p);
      else if (/\.(md|json)$/.test(e)) { try { buf += "\n" + readFileSync(p, "utf8"); } catch {} }
    }
  };
  walk(".");
  return buf;
}

let lostTotal = 0;
const corpus = repoCorpus();
for (const f of args) {
  let old = "";
  try { old = execFileSync("git", ["show", `${base}:${f}`], { encoding: "utf8" }); }
  catch { console.log(`${f}: no ${base} version (new file) — nothing to audit`); continue; }
  const now = readFileSync(f, "utf8");
  let inPlace = 0, reloc = 0;
  const lost = [];
  for (const tok of tokens(old)) {
    if (now.includes(tok)) inPlace++;
    else if (corpus.includes(tok)) reloc++;
    else lost.push(tok);
  }
  console.log(`${f}: ${inPlace + reloc + lost.length} tokens — ${inPlace} in place, ${reloc} relocated, ${lost.length} LOST`);
  for (const t of lost.sort()) console.log(`   LOST: ${JSON.stringify(t)}`);
  lostTotal += lost.length;
}
console.log(lostTotal ? `\nL24: FAIL — ${lostTotal} lost token(s); restore or get Chan's explicit OK per token` : "\nL24: PASS — zero fact tokens lost");
process.exit(lostTotal ? 1 : 0);
