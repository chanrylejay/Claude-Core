#!/usr/bin/env node
// _policy_diff.mjs — the L24 companion for POLICY rewrites (why: audit-log AL-30; findings F18, A4 item 4).
//
// L24 proves fact TOKENS survive a rewrite. It is blind to meaning: "must never push without GO"
// → "must push without GO" passes L24 because "never" still appears somewhere in the file.
// This tool works at the CLAUSE level. For every sentence in the OLD text it finds the best-matching
// sentence in the NEW text and reports each pair whose MODAL/NEGATION/SCOPE word-set changed, plus
// old sentences with no counterpart (dropped) and new sentences that carry a modal but match nothing (added).
// It is a REVIEW LIST, not a verdict: a human (or the reviewing peer) reads each flagged pair.
// It never edits. Exit 0 always; the flagged count is the signal. Dependency-free.
//
// Usage: node templates/_policy_diff.mjs <old-file> <new-file>
//        node templates/_policy_diff.mjs --git <ref> <path>      (old = git show <ref>:<path>, new = worktree)
//        node templates/_policy_diff.mjs --self-test
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const MODALS = /\b(never|not|no|none|nothing|nobody|only|always|must|mustn't|shall|should|shouldn't|may|can|cannot|can't|won't|will|without|unless|except|before|after|until|any|every|all|each|read-only|forbidden|denied|deny|allowed|allow|required|optional|GO)\b/gi;
const norm = (s) => s.replace(/\r\n/g, "\n");
const sentences = (text) =>
  norm(text)
    .replace(/^\s*```[^\n]*$/gm, "")          // keep fenced policy (doorway templates); strip delimiters only
    .split(/\n\s*\n|(?<=[.!?])\s+(?=[A-Z`"(\-*])|\n(?=\s*[-*] )/) // paragraphs, sentence ends, list items
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 12);
const modalSet = (s) => new Set((s.match(MODALS) || []).map((w) => w.toLowerCase()));
const words = (s) => new Set(s.toLowerCase().match(/[a-z0-9']+/g) || []);
const jaccard = (a, b) => { let i = 0; for (const w of a) if (b.has(w)) i++; return i / (a.size + b.size - i || 1); };

export function policyDiff(oldText, newText) {
  const O = sentences(oldText), N = sentences(newText);
  const Nw = N.map(words), used = new Set();
  const changed = [], dropped = [];
  for (const o of O) {
    const ow = words(o);
    let best = -1, bestScore = 0;
    N.forEach((n, i) => { if (used.has(i)) return; const sc = jaccard(ow, Nw[i]); if (sc > bestScore) { bestScore = sc; best = i; } });
    if (best < 0 || bestScore < 0.35) { if (modalSet(o).size) dropped.push(o); continue; }
    used.add(best);
    const a = modalSet(o), b = modalSet(N[best]);
    const lost = [...a].filter((w) => !b.has(w)), gained = [...b].filter((w) => !a.has(w));
    if (lost.length || gained.length) changed.push({ old: o, new: N[best], lost, gained });
  }
  const added = N.filter((n, i) => !used.has(i) && modalSet(n).size);
  return { changed, dropped, added };
}

function report(r, label) {
  const lines = [];
  for (const c of r.changed) lines.push(`CHANGED  lost:[${c.lost.join(",")}] gained:[${c.gained.join(",")}]\n   old: ${c.old}\n   new: ${c.new}`);
  for (const d of r.dropped) lines.push(`DROPPED  ${d}`);
  for (const a of r.added) lines.push(`ADDED    ${a}`);
  const n = r.changed.length + r.dropped.length + r.added.length;
  console.log(`${label}: ${n} clause(s) to read — ${r.changed.length} changed, ${r.dropped.length} dropped, ${r.added.length} added`);
  for (const l of lines) console.log(l);
  return n;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop())) {
  const args = process.argv.slice(2);
  if (args[0] === "--self-test") {
    const a = "Codex must never push without GO. The importer reads the Status column, never the GROUP name. Screenshots are evidence only.";
    const b = "Codex must push without GO. The importer reads the Status column, never the GROUP name. Screenshots are evidence only.";
    const r = policyDiff(a, b);
    const ok = r.changed.length === 1 && r.changed[0].lost.includes("never");
    console.log(ok ? "self-test PASS: negation flip flagged" : "self-test FAIL"); process.exit(ok ? 0 : 1);
  }
  let oldText, newText, label;
  if (args[0] === "--git") {
    const [, ref, path] = args;
    oldText = execFileSync("git", ["show", `${ref}:${path}`], { encoding: "utf8" });
    newText = fs.readFileSync(path, "utf8"); label = `${path} (${ref} → worktree)`;
  } else { oldText = fs.readFileSync(args[0], "utf8"); newText = fs.readFileSync(args[1], "utf8"); label = `${args[0]} → ${args[1]}`; }
  report(policyDiff(oldText, newText), label);
}
