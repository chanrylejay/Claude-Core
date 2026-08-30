// _prose_test.mjs — prose-integrity net. Run from templates/:  node _prose_test.mjs
// WHY: every other net pins structure; none can tell whether a sentence is a sentence. A
// paste on Aug 24 2026 split a parenthetical in qa-gauntlet-pattern.md and 627 assertions
// stayed green for six days (why, receipts, and the design trade: ../lessons/audit-log.md AL-21).
// MANDATORY after any edit that rewrites, splices, or reflows prose in a permanent doc.
// Scope: TRACKED .md files only (git ls-files) — never the filesystem walk, so the gitignored
// LOCAL-ONLY-* files on Chan's machine (pasted chat, lawfully lowercase) can never turn it red.
// Pins, per file, on file line numbers (stripped regions are blanked, never removed):
//   A. SENTENCE BOUNDARY — no ". <lowercase word>" sentence start (the orphan tail a splice
//      leaves). Exempt by name with a reason, never by widening the rule: ABBR, enumerators,
//      decimals, paths, identifiers, text inside a verbatim quote (banked as typed), ALLOW.
//   B. SPLICE HEAD — a wrapped line ending on a dangling function word whose next line opens
//      with a sentence OPENER (whitelist: After, The, This, When, If...). A proper-noun
//      blacklist was tried first and failed both ways; the whitelist trades a miss on an
//      unlisted opener for never firing on a new name (AL-21).
//   C. QUOTE PARITY — even count of double quotes. Pin A skips quoted text by parity, so an
//      unmatched quote would silently blind it for the rest of the file; C makes that loud.
// Self-test runs first, every time, on fixtures built here: a net that cannot fail proves nothing.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let fail = 0, ran = 0;
const t = (n, c) => { ran++; if (c) console.log("  ok  " + n); else { fail++; console.log("FAIL  " + n); } };

// Lowercase words that lawfully open a sentence in this kit. Reason on every line.
const ALLOW = new Map([
  ["tsconfig", "config filename opening a sentence (lessons/platforms/nextjs-npm.md)"],
]);
const ABBR = /\b(?:e\.g|i\.e|etc|vs|approx|incl|resp|Mr|Ms|Dr|No|cf|al|Fig|Sec|Jr|Sr|St|Inc|Ltd|a\.m|p\.m)$/i;
const DANGLE = /\b(the|a|an|of|to|and|or|in|on|for|with|by|that|this|its|their|is|are|was|were|from|as|at)\s*$/i;
// Sentence openers: words that do not continue a phrase after a dangling function word.
const OPENER = /^(The|This|That|These|Those|It|After|Before|When|If|Then|Once|Also|But|Now|Here|There|Never|Always|Each|Every|Nothing|Do|Don't|Run|Use|Open|Read|Say|Ask|Install|Report|Check|Keep|Stop|Ship|Push|Confirm|Verify)(?=[\s,.:;!?]|$)/; // lookahead, not \b: "Push-guard", "Check-in" continue a phrase

// Blank (never delete) frontmatter and fenced code so line numbers stay true; inline code
// becomes a placeholder so a sentence ending in `code`. is still boundary-checked.
const clean = (txt) => {
  const lines = txt.split(/\r?\n/);
  let fm = lines[0] === "---" ? 1 : 0, fence = false;
  return lines.map((l, i) => {
    if (fm) { if (i > 0 && l === "---") fm = 0; return ""; }
    if (/^\s*```/.test(l)) { fence = !fence; return ""; }
    if (fence) return "";
    return l.replace(/`[^`]*`/g, "\u27E6\u27E7");
  });
};

// Returns { a: [...], b: [...], parity } for one file's text.
const check = (txt) => {
  const lines = clean(txt);
  const bad = { a: [], b: [] };
  let quotes = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let q = quotes; // parity at the start of this line, advanced as we walk it
    for (const m of line.matchAll(/(\S+?)\.[ \t]+([a-z][\w'-]*)/g)) {
      const before = m[1], after = m[2];
      const tail = line.slice(m.index + m[0].length, m.index + m[0].length + 12);
      const inQuote = (q + (line.slice(0, m.index).match(/["\u201C\u201D]/g) || []).length) % 2;
      if (inQuote) continue;                       // verbatim quote, banked as typed
      if (ABBR.test(before)) continue;
      if (before.length < 2) continue;             // enumerators: a.  b.  c.
      if (/\.$/.test(before)) continue;            // ellipsis
      if (/\d$/.test(before)) continue;            // versions, decimals
      if (/[/\\]/.test(before)) continue;          // bare paths
      if (/-/.test(after) || /[A-Z]/.test(after)) continue;   // ano-ulam, staticData
      if (/^[./]/.test(tail)) continue;            // claude.ai, lib/
      if (ALLOW.has(after)) continue;
      bad.a.push(`${i + 1}: ...${before}. ${after}${tail}`);
    }
    quotes += (line.match(/["\u201C\u201D]/g) || []).length;
    const a = line.trimEnd(), b = (lines[i + 1] || "").trim();
    if (DANGLE.test(a) && b && OPENER.test(b)) bad.b.push(`${i + 1}: "...${a.slice(-48)}" then "${b.slice(0, 40)}..."`);
  }
  return { ...bad, parity: quotes % 2 };
};

// ---- self-test on fixtures (built here, never on disk) ----------------------------------
const fx = {
  clean: "Some rule holds here. It says so twice.\nWrap the line on a name for\nLinux users and the\nAnthropic side alike, wired by the\nPush-guard hook.\n",
  splice: "Rule (found live while installing the\nAfter the reload, run the checker. reachability check, applied here.)\n",
  tailOnly: "The hook is byte-equal. reachability check, applied here.\n",
  oddQuote: "He said \"GO and the line stops here.\n",
  quoted: "Chan, verbatim: \"do it now. then tell me\" — banked as typed.\n",
  fenced: "---\nx: 1\n---\nText.\n```\ncode. lowercase inside a fence\n```\nProse continues. fine here\n",
};
t("selftest: clean fixture passes all pins (for/Linux, the/Anthropic, the/Push-guard)", (() => { const r = check(fx.clean); return !r.a.length && !r.b.length && !r.parity; })());
t("selftest: the Aug 24 splice shape fires BOTH pins", (() => { const r = check(fx.splice); return r.a.length === 1 && r.b.length === 1; })());
t("selftest: orphan tail alone still fires pin A", check(fx.tailOnly).a.length === 1);
t("selftest: unmatched quote fires pin C (parity) instead of blinding pin A", check(fx.oddQuote).parity === 1);
t("selftest: lowercase inside a verbatim quote is exempt", check(fx.quoted).a.length === 0);
t("selftest: fenced code + frontmatter blanked, line number is the FILE line (8)", (() => { const r = check(fx.fenced); return r.a.length === 1 && r.a[0].startsWith("8:"); })());
t("selftest: every ALLOW entry carries a reason", [...ALLOW.values()].every((v) => v && v.length > 10));

// ---- the tree: tracked .md only ----------------------------------------------------------
let files;
try {
  files = execFileSync("git", ["ls-files", "*.md"], { cwd: ROOT }).toString().split(/\r?\n/).filter(Boolean);
} catch {
  console.log("FAIL  git ls-files unavailable — this net scans TRACKED files only and cannot fall back to the filesystem (LOCAL-ONLY-* would be swept in)");
  fail++; ran++; files = [];
}
for (const f of files) {
  const r = check(fs.readFileSync(path.join(ROOT, f), "utf8"));
  t(`A sentence boundary: ${f}${r.a.length ? "  <-- " + r.a.join(" | ") : ""}`, r.a.length === 0);
  t(`B no spliced line: ${f}${r.b.length ? "  <-- " + r.b.join(" | ") : ""}`, r.b.length === 0);
  t(`C quote parity even: ${f}`, r.parity === 0);
}
console.log(`\nprose integrity: ${ran - fail} passed, ${fail} failed (${files.length} tracked .md files)`);
process.exit(fail ? 1 : 0);
