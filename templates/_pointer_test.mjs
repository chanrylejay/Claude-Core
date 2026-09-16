// _pointer_test.mjs — pointer-integrity net (auditor finding, Aug 2026: one-fact-per-file
// with pointer-only cross-referencing rots silently on rename). Run from templates/:
//   node _pointer_test.mjs
// MANDATORY after adding, renaming, or deleting any memory/ file or any DIRECTORY-listed
// file. Pins, all raw reads:
//   1. every memory/*.md (except LOCAL-ONLY-*) has EXACTLY ONE manifest line in memory/MEMORY.md's
//      frontmatter: in cold_start:, or in lookup: with a trigger (retargeted in batch 2a from the
//      prose catalog, which the manifest replaced; LOCAL-ONLY-* keeps its prose pointer, pin 2)
//   2. every markdown link in MEMORY.md resolves to a file that exists
//   3. MEMORY.md is under the auto-load cap (200 lines / 25KB) with headroom stated
//   4. DIRECTORY is generated from directory-catalog.json with exact tracked-path coverage (memory/ excepted by
//      law; .git and .claude excepted by nature). UNTRACKED files split (found live Aug 24
//      2026, the net's second first-contact catch): the relay's delivery transients
//      (CODING-BRIEF-*.md, FIX-*.md, *.patch) are lawful and pass with a note — they sit in
//      the root until a brief's cleanup step; ANY other untracked file is a stray and FAILS
//      loudly (index it, ignore it, or remove it) — and since "index it" is one of the
//      remedies, an untracked file ALREADY indexed in the catalog is a kit addition pending
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
import os from "node:os";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const rd = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
let fail = 0, ran = 0;
const t = (n, c) => { ran++; if (c) console.log("  ok  " + n); else { fail++; console.log("FAIL  " + n); } };

const idx = rd("memory/MEMORY.md");
// 1 (retargeted, batch 2a; why: ../lessons/audit-log.md AL-34): the index is a MANIFEST, so a
//   memory file's one line is a frontmatter list entry, never a prose link. Every tracked
//   memory/*.md (LOCAL-ONLY-* excepted, below) is EITHER in `cold_start:` (once, no lookup line)
//   OR in `lookup:` exactly once, with a trigger on the line; the mode sets are routing
//   references and may list the same path (the resolver dedups, first listing wins). Raw parse
//   on purpose: this net must not depend on the resolver it is partly checking.
const fmText = (idx.match(/^---\r?\n([\s\S]*?)\r?\n---/) || ["", ""])[1];
const listOf = (key) => {
  const m = fmText.match(new RegExp("^" + key + ":[^\\n]*\\n((?:[ \\t]+[^\\n]*\\n?)*)", "m"));
  return (m ? m[1] : "").split(/\r?\n/).map((l) => l.replace(/#.*$/, "").trim()).filter((l) => l.startsWith("- ")).map((l) => l.slice(2).trim());
};
const triggerOf = (p) => ((fmText.split(/\r?\n/).find((l) => new RegExp("^\\s*- " + p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*#").test(l)) || "").match(/#\s*(.*)$/) || [, ""])[1].trim();
const cold = listOf("cold_start"), look = listOf("lookup");
const memFiles = fs.readdirSync(path.join(ROOT, "memory")).filter(f => f.endsWith(".md") && f !== "MEMORY.md" && !f.startsWith("LOCAL-ONLY-"));
for (const f of memFiles) {
  const p = "memory/" + f;
  const c = cold.filter((x) => x === p).length, k = look.filter((x) => x === p).length;
  t(`manifest lists ${f} exactly once: cold_start ${c}, lookup ${k}${k ? " (trigger: " + (triggerOf(p) || "MISSING") + ")" : ""}`, (c === 1 && k === 0) || (c === 0 && k === 1 && triggerOf(p).length > 0));
}
t("the manifest's lookup: and cold_start: carry no LOCAL-ONLY-* path (a missing lookup is a boot error on a clean clone; the machine-only class keeps a prose pointer with its clone-absence disclosure, pin 2)", ![...cold, ...look].some((p) => /LOCAL-ONLY-/.test(p)));
t("the index prose is not a catalog: no markdown link to a tracked memory file (the manifest is the one home; only the LOCAL-ONLY pointer may link)", [...idx.slice(idx.indexOf("\n---", 4) + 4).matchAll(/\]\(([^)#\s]+\.md)\)/g)].every((m) => /LOCAL-ONLY-/.test(m[1])));
// 2
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
let catalog = null;
try { catalog = JSON.parse(rd("templates/directory-catalog.json")); } catch {}
const catalogPaths = Array.isArray(catalog) ? catalog.flatMap((e) => e?.paths || (typeof e?.path === "string" ? [e.path] : [])) : [];
const directoryCheck = spawnSync(process.execPath, [path.join(ROOT, "templates/directory-gen.mjs"), "--check"], { cwd: ROOT, encoding: "utf8" });
t("DIRECTORY render and exact tracked-path coverage pass directory-gen --check", directoryCheck.status === 0);
if (directoryCheck.status !== 0) console.log((directoryCheck.stdout || directoryCheck.stderr || directoryCheck.error?.message || "generator failed without output").trim());
t("every catalog path is tracked (stage pending additions before certification)", Array.isArray(catalog) && catalogPaths.every((p) => (tracked || new Set(walk(""))).has(p)));
t("DIRECTORY's generated header is line 1", dir.split(/\r?\n/)[0] === "<!-- generated by " + "templates/directory-gen.mjs from templates/directory-catalog.json; edit the catalog, then run --write; hand edits here are overwritten and the pointer net goes red -->");
// Mutation checks exercise the CLI's implementation without changing the real kit.
if (fs.existsSync(path.join(ROOT, "templates/directory-gen.mjs"))) {
  const { validateCatalog, renderDirectory, firstDifference, checkDirectory } = await import("./directory-gen.mjs");
  const sample = [{ paths: ["a.md", "sub/a.md"], text: "- a.md and sub/a.md" }, { path: null, text: "prose" }];
  const files = new Set(["a.md", "sub/a.md"]);
  t("catalog self-test: grouped paths preserve one text block", validateCatalog(sample, files).length === 0 && renderDirectory(sample).split("- a.md and sub/a.md").length === 2);
  t("catalog self-test: duplicate path fails", validateCatalog([...sample, sample[0]], files).some((e) => e.includes("more than one")));
  t("catalog self-test: a basename in prose cannot cover another path", validateCatalog([{ path: "a.md", text: "a.md sub/a.md" }], files).some((e) => e.includes("sub/a.md: tracked file has no")));
  t("catalog self-test: untracked path fails", validateCatalog(sample, new Set(["a.md"])).some((e) => e.includes("untracked")));
  t("catalog self-test: exception classes need no catalog entries", validateCatalog(sample, new Set([...files, "memory/extra.md", "lessons/platforms/extra.md"])).length === 0);
  t("catalog self-test: exception classes cannot gain duplicate homes", validateCatalog([...sample, { path: "memory/extra.md", text: "extra" }], new Set([...files, "memory/extra.md"])).some((e) => e.includes("own manifest")));
  t("catalog self-test: malformed or invisible entries fail", validateCatalog([{ path: "a.md", text: 7 }], files).length > 0 && validateCatalog([{ path: "a.md", text: "" }], files).length > 0);
  const rendered = renderDirectory(sample);
  t("catalog self-test: CRLF checkout matches the LF render", firstDifference(rendered.replace(/\n/g, "\r\n"), rendered) === null);
  t("catalog self-test: missing marker names line 1", firstDifference(rendered.split("\n").slice(1).join("\n"), rendered)?.includes("line 1"));
  t("catalog self-test: hand edit names the first differing line", firstDifference(rendered.replace("- a.md", "- changed.md"), rendered)?.includes("line 2"));
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "kit-directory-"));
  try {
    fs.mkdirSync(path.join(temp, "templates"));
    fs.writeFileSync(path.join(temp, "a.md"), "a\n");
    fs.writeFileSync(path.join(temp, "DIRECTORY.md"), "before\n");
    const fixture = [{ path: "a.md", text: "- a.md" }, { path: "DIRECTORY.md", text: "- DIRECTORY.md" }, { path: "templates/directory-catalog.json", text: "- catalog" }];
    fs.writeFileSync(path.join(temp, "templates/directory-catalog.json"), JSON.stringify(fixture));
    const noGit = () => { throw new Error("synthetic git unavailable"); };
    const written = checkDirectory(temp, { write: true, git: noGit });
    t("catalog self-test: write then check works with degraded-strict disk inventory", written.ok && written.notes.some((n) => n.includes("degraded-strict")) && checkDirectory(temp, { git: noGit }).ok);
    fs.writeFileSync(path.join(temp, "stray.md"), "unindexed\n");
    const before = fs.readFileSync(path.join(temp, "DIRECTORY.md"), "utf8");
    const refused = checkDirectory(temp, { write: true, git: noGit });
    t("catalog self-test: degraded-strict detects a stray and invalid write preserves DIRECTORY", !refused.ok && refused.errors.some((e) => e.includes("stray.md")) && fs.readFileSync(path.join(temp, "DIRECTORY.md"), "utf8") === before);
  } finally {
    const resolved = path.resolve(temp), parent = path.resolve(os.tmpdir()) + path.sep;
    if (!resolved.startsWith(parent) || !path.basename(resolved).startsWith("kit-directory-")) throw new Error("refusing cleanup outside the test directory");
    fs.rmSync(resolved, { recursive: true, force: true });
  }
}
for (const f of walk("")) {
  if (f.startsWith("memory/")) continue;               // indexed in MEMORY.md by law
  if (/LOCAL-ONLY|\.code-workspace$/.test(f) || f.startsWith(".playwright-cli/")) continue; // gitignored classes
  const base = path.basename(f);
  if (tracked && !tracked.has(f)) {
    if (TRANSIENT.test(base) && !f.includes("/")) {    // delivery files live in the ROOT only
      console.log("  note  lawful delivery transient present (cleanup step pending): " + f);
      continue;
    }
    if (catalogPaths.includes(f)) {                      // exact path, never a basename substring
      console.log("  note  kit addition pending commit (already indexed): " + f);
      continue;
    }
    t(`untracked STRAY needs a decision (index, ignore, or remove): ${f}`, false);
    continue;
  }
  // Tracked coverage, including the two exception classes, is checked by the generator.
}
// 5
for (const src of ["CLAUDE.md", "memory/MEMORY.md"]) {
  const txt = rd(src);
  for (const m of txt.matchAll(/\b(?:\.\.\/)?((?:workflow|lessons|templates|memory|portfolio|projects)\/[\w\-./]+\.(?:md|mjs|js|json))\b/g)) {
    t(`${src} names an existing path: ${m[1]}`, fs.existsSync(path.join(ROOT, m[1])));
  }
}

// 10. lessons/platforms/ children (split Aug 28 2026): same law as memory/ — each child is
//     linked EXACTLY ONCE in the parent index lessons/platform-gotchas.md, and DIRECTORY names
//     only the parent. A child with zero links is unreachable; two is a fork.
{
  const parent = rd("lessons/platform-gotchas.md");
  for (const f of fs.readdirSync(path.join(ROOT, "lessons/platforms")).filter((x) => x.endsWith(".md"))) {
    const n = (parent.match(new RegExp("\\(platforms/" + f.replace(".", "\\.") + "\\)", "g")) || []).length;
    t(`platform child indexed exactly once in the parent: ${f} (found ${n})`, n === 1);
  }
}

// 6-9 (grown Aug 28 2026, reviewer-2 defect 3: a green run coexisted with a dead wikilink and a
// dangling ../TOOLS.md because nothing scanned wikilinks or prose-layer relative refs):
//   6. every [[wikilink]] in the prose layers resolves to memory/<name>.md ([[name]] is the
//      drill's literal syntax example and exempt)
//   7. every relative .md ref in the prose layers resolves on disk, or its line declares
//      clone-absence (same honesty idiom as pin 2's LOCAL-ONLY branch)
//   8. chan_voice-flagged files (frontmatter or top-comment `chan_voice: true`) carry ZERO em
//      dashes — the ledger/playbook/summary feed Chan-voice career text and the no-em-dash law
//      had no mechanical check (reviewer-1 P5; counts were 7/2/1 when this pin landed)
//   9. every 🛑-marked memory description carries a year, so hot-state files stay datable
// A verbatim retired quote keeps its original relative paths. An explicit fenced origin
// changes their base, never skips existence checks; ordinary text resumes at the close.
function referenceOrigins(text, file) {
  const lines = text.split(/\r?\n/), origins = [], errors = [];
  let source = null;
  for (const [i, line] of lines.entries()) {
    const marker = line.match(/^```md retired-source=(.+)$/);
    if (marker) {
      const p = marker[1];
      if (source || !/^[\w-]+(?:\/[\w.-]+)*\.md$/.test(p) || p.split("/").some((s) => s === "." || s === "..")) errors.push(`invalid retired source at line ${i + 1}`);
      else source = p;
    } else if (line === "```" && source) source = null;
    origins.push(source || file);
  }
  if (source) errors.push("unclosed retired-source fence");
  return { lines, origins, errors };
}
{
  const sample = referenceOrigins("```md retired-source=projects/example/old.md\n../../lessons/audit-log.md\n```\n../lessons/audit-log.md", "lessons/audit-log.md");
  t("retired-source self-test: quoted links use their old base, normal links resume their current base", sample.errors.length === 0 && sample.origins[1] === "projects/example/old.md" && sample.origins[3] === "lessons/audit-log.md");
  t("retired-source self-test: traversal and unclosed quotes fail", referenceOrigins("```md retired-source=../outside.md", "a.md").errors.length > 0 && referenceOrigins("```md retired-source=projects/old.md", "a.md").errors.length > 0);
}
const proseFiles = [];
for (const dir of ["memory", "workflow", "lessons", "projects", "portfolio"]) {
  const walk = (d) => { for (const e of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) {
    if (e.isDirectory()) walk(path.join(d, e.name));
    else if (e.name.endsWith(".md") && !e.name.startsWith("LOCAL-ONLY-")) proseFiles.push(path.join(d, e.name).replace(/\\/g, "/")); } };
  walk(dir);
}
for (const f of proseFiles) {
  const txt = rd(f);
  for (const m of txt.matchAll(/\[\[([\w-]+)\]\]/g)) {
    if (m[1] === "name") continue;
    if (m[1].startsWith("LOCAL-ONLY-")) {
      const line = txt.split(/\r?\n/).find((l) => l.includes("[[" + m[1] + "]]")) || "";
      t(`LOCAL-ONLY wikilink declares its clone-absence: ${f} -> [[${m[1]}]]`, /gitignored|LOCAL[ -]?ONLY|not in (?:any )?clone|this machine only/i.test(line));
      continue;
    }
    t(`wikilink resolves: ${f} -> [[${m[1]}]]`, fs.existsSync(path.join(ROOT, "memory", m[1] + ".md")));
  }
  const { lines, origins, errors: originErrors } = referenceOrigins(txt, f);
  for (const error of originErrors) t(`${f}: ${error}`, false);
  for (let i = 0; i < lines.length; i++) {
    for (const m of lines[i].matchAll(/(?:\.\.\/)+[\w][\w./-]*\.md\b/g)) {
      const target = path.normalize(path.join(ROOT, path.dirname(origins[i]), m[0]));
      if (/(^|\/)archives\//.test(m[0])) { t(`archive-resident ref (gitignored by law): ${f}:${i + 1} ${m[0]}`, true); continue; }
      if (fs.existsSync(target)) { t(`relative ref resolves: ${f}:${i + 1} ${m[0]}`, true); continue; }
      const honest = /gitignored|LOCAL[ -]?ONLY|Devoted archive|not in (?:any )?clone|THIS MACHINE ONLY/i.test(lines[i]);
      t(`relative ref ${honest ? "declares clone-absence" : "resolves"}: ${f}:${i + 1} ${m[0]}`, honest);
    }
  }
  const head = lines.slice(0, 15).join("\n");
  if (/chan_voice:\s*true/.test(head)) {
    const n = (txt.match(/—/g) || []).length;
    t(`chan_voice file carries zero em dashes: ${f} (found ${n})`, n === 0);
  }
  if (f.startsWith("memory/") && /\u{1F6D1}/u.test(txt.split(/\r?\n/).find((l) => l.startsWith("description:")) || "")) {
    const desc = txt.split(/\r?\n/).find((l) => l.startsWith("description:"));
    t(`\u{1F6D1} description carries a year: ${f}`, /20\d{2}/.test(desc));
  }
}

// 11. Pattern numbers belong to the two numbered-pattern sections; the later fan-out
//     lesson has its own local 1-3 list. Check sequence, both summaries, and references.
function patternNumbers(universal, directory, sources) {
  const top = Number(universal.match(/^# Universal Patterns .*\(1[–-](\d+)\)/m)?.[1]);
  const listed = Number(directory.match(/^- `universal-patterns\.md` .*?\b(\d+) numbered patterns/m)?.[1]);
  const cliTop = Number(universal.match(/^## CLI-era patterns \(26-(\d+)\)/m)?.[1]);
  const nums = [];
  let inPatterns = false;
  for (const line of universal.split(/\r?\n/)) {
    if (line.startsWith("## ")) inPatterns = /^## (?:Prompt-system and AI-behavior|CLI-era) patterns \(/.test(line);
    const m = inPatterns && line.match(/^(\d+)\. /);
    if (m) nums.push(Number(m[1]));
  }
  const badRefs = [];
  for (const [file, text] of sources) {
    for (const m of text.matchAll(/\b(?:pattern\s+(\d+)|number\s+(\d+)\s+in\b)/gi)) {
      const n = Number(m[1] ?? m[2]);
      if (!(n >= 1 && n <= top)) badRefs.push(`${file}: ${m[0]}`);
    }
  }
  return {
    top,
    sequence: top > 0 && nums.length === top && nums.every((n, i) => n === i + 1),
    summaries: top > 0 && listed === top && cliTop === top,
    badRefs,
  };
}
{
  const universal = rd("lessons/universal-patterns.md");
  const sources = [...(tracked || walk(""))].filter((f) => f.endsWith(".md")).map((f) => [f, rd(f)]);
  const result = patternNumbers(universal, dir, sources);
  t(`patterns are exactly 1..${result.top}, contiguous and unique`, result.sequence);
  t(`pattern H1, CLI-era heading and DIRECTORY agree on ${result.top}`, result.summaries);
  t(`all tracked by-number pattern references resolve${result.badRefs.length ? ": " + result.badRefs.join("; ") : ""}`, result.badRefs.length === 0);
  t("pattern self-test: duplicate fails", !patternNumbers(universal.replace(/^2\. /m, "1. "), dir, []).sequence);
  t("pattern self-test: missing number fails", !patternNumbers(universal.replace(/^2\. [^\n]*\n/m, ""), dir, []).sequence);
  t("pattern self-test: stale DIRECTORY count fails", !patternNumbers(universal, dir.replace(/\d+ numbered patterns/, "0 numbered patterns"), []).summaries);
  t("pattern self-test: out-of-range reference fails", patternNumbers(universal, dir, [["probe.md", `pattern ${result.top + 1}; number ${result.top + 1} in the pattern file`]]).badRefs.length === 2);
}

console.log("\npointer integrity: " + (fail ? fail + " FAILED of " + ran : ran + " passed, 0 failed"));
process.exit(fail ? 1 : 0);
