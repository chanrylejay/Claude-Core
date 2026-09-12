// boot-resolver.mjs — THE one boot resolver, every seat (batch 1a, Sep 12 2026; why:
// ../lessons/audit-log.md AL-30 "one shared resolver is missing", AL-32 for this extraction).
// Before this file the kit had three boot definitions and two parsers: boot-claudeai.mjs
// (browser) and codex/session-ritual.mjs (Codex) each parsed memory/MEMORY.md's frontmatter
// in its own way, and Codex under LEAN would have read ~15K chars the browser skips. This file
// is an EXTRACTION: the browser parser moved here unchanged in behavior, the read-plan rule
// moved here once, and the per-seat table names the only lawful difference between seats.
// It resolves and counts; it never reads FOR anyone (the drill's raw-read law stays yours).
// Consumers: boot-claudeai.mjs (relative import) and codex/session-ritual.mjs (imported from
// the kit at run time, so the installed hook copy needs no second copy of this file).
// Net: _boot_resolver_test.mjs (frozen-index fixtures under fixtures/, plus live agreement).
// R1 (Codex hostile review, Sep 12 2026): every table lookup here is an OWN-ENTRY lookup, never a
// plain property read. `modes["constructor"]` on a normal object returns the inherited Object
// constructor, passes a truthiness check, and threw where a mode set was expected, taking the
// Codex startup report with it. Parsed tables are null-prototype objects and `resolveBoot` checks
// `Object.hasOwn` on both the seat table and the modes block; an own entry named `constructor`
// or `__proto__` is a real entry, an inherited one is "not in the block", named, never thrown.
// Batch 1b, routing (Sep 12 2026; why: AL-30 "routing is global where the workspace should
// decide", AL-33). Three additions, no removal:
//   1. THE WORKSPACE MODE LINE. `boot_mode: <MODE>` in a workspace's CLAUDE.md or AGENTS.md
//      names that workspace's mode; `readWorkspaceMode(root)` reads both files through ONE
//      parser and names a disagreement. `mode_default` in the index is the fallback (a workspace
//      with no line, the kit itself, the browser sandbox), never the machine-wide truth.
//   2. THE CANON RULE. The `active_project` canon BOOTS only in its own mode (`mode_default`,
//      or any mode whose set already lists it); every other mode carries it in LOOKUP, first
//      line, "open when: the work touches the active project". ANO_ULAM no longer boots two
//      canons; JOB_HUNT and CLIENT_BUILD stop paying for a canon they do not work in.
//   3. PER-MODE BUDGETS. `boot.budget_chars` is the ceiling for every mode unless
//      `boot.budget_by_mode.<MODE>` names a higher one; `budgetFor(index, mode)` is the one rule
//      and the resolver net pins EVERY seat and mode against it on the live index, the red line
//      AL-30 said only the default mode had.
import fs from "node:fs";
import path from "node:path";

// The seat table. `ramp` is the ONLY per-seat difference the resolver knows: the browser
// half reads its entry ramp second (batch 1, Aug 30 2026); the hands never need it. `cli`
// (the DeepSeek Claude Code seat) is consumed by templates/global/session-ritual.mjs since batch
// 1b (the drill's step 2 points here; the hook prints the plan).
export const SEATS = Object.freeze({
  browser: Object.freeze({ ramp: "workflow/relay-boot-claudeai.md" }),
  codex: Object.freeze({ ramp: null }),
  cli: Object.freeze({ ramp: null }),
});
export const INDEX_PATH = "memory/MEMORY.md";
export const CONTRACT_PATH = "CLAUDE.md";
// The workspace files a hand reads for its mode line, in this order. Both are read when both
// exist: the doorway law says the two carry the SAME line, and a disagreement is drift, named.
export const WORKSPACE_FILES = Object.freeze(["CLAUDE.md", "AGENTS.md"]);
export const DEFAULT_BUDGET = 40000;

// ---- parse: the index frontmatter, the shapes the index uses and nothing more --------------
// Returns { state, boot, coldStart:[{path, comment}], modes:{MODE:[path]}, lookup:[{path, trigger}],
// problems:[string] }. Never throws on a broken index: problems name what is missing and the
// caller decides (the browser boot exits 1; a hook reports and exits 0).
export function parseIndex(text) {
  // null-prototype tables (R1): a frontmatter key named __proto__ or constructor is an own entry here
  const out = { state: Object.create(null), boot: Object.create(null), coldStart: [], modes: Object.create(null), lookup: [], problems: [] };
  const raw = String(text ?? "").replace(/\r\n/g, "\n");
  const fm = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) { out.problems.push(INDEX_PATH + " has no frontmatter block"); return out; }
  const strip = (s) => s.replace(/#.*$/, "").trim();
  const comment = (s) => (s.match(/#\s*(.*)$/) || [, ""])[1].trim();
  let section = null, currentMode = null;
  for (const l of fm[1].split("\n")) {
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
      const key = body.slice(0, i).trim(), val = body.slice(i + 1).trim();
      // batch 1b: `budget_by_mode:` (a key with no value) opens a nested map; its indent-4
      // pairs land in out.boot.budget_by_mode. Any other bare key stays a "" value as before.
      if (section === "boot" && val === "" && key === "budget_by_mode") { out.boot.budget_by_mode = Object.create(null); currentMode = key; }
      else { out[section][key] = val; currentMode = null; }
    } else if (section === "boot" && ind >= 4 && currentMode === "budget_by_mode" && body.includes(":")) {
      const i = body.indexOf(":");
      out.boot.budget_by_mode[body.slice(0, i).trim()] = body.slice(i + 1).trim();
    } else if (section === "cold_start" && body.startsWith("- ")) {
      out.coldStart.push({ path: body.slice(2).trim(), comment: comment(l) });
    } else if (section === "lookup" && body.startsWith("- ")) {
      out.lookup.push({ path: body.slice(2).trim(), trigger: comment(l) });
    } else if (section === "modes") {
      if (ind === 2 && body.endsWith(":")) { currentMode = body.slice(0, -1).trim(); out.modes[currentMode] = []; }
      else if (ind >= 4 && body.startsWith("- ") && currentMode) out.modes[currentMode].push(body.slice(2).trim());
    }
  }
  if (!out.coldStart.length) out.problems.push("no cold_start list in " + INDEX_PATH + " frontmatter");
  if (!Object.keys(out.modes).length) out.problems.push("no modes block in " + INDEX_PATH + " frontmatter");
  if (!out.state.active_project) out.problems.push("no active_project in " + INDEX_PATH + " state block");
  return out;
}

// ---- budget: one rule for every seat and mode (batch 1b) -----------------------------------
// budgetFor(index, mode) -> { chars, source }: boot.budget_by_mode.<mode> when the index names
// one, else boot.budget_chars, else DEFAULT_BUDGET. A per-mode line is a measured tripwire
// against growth, never a target: the ladder back to the default is stated on the line itself.
export function budgetFor(index, mode) {
  const boot = index?.boot || {};
  const byMode = boot.budget_by_mode || {};
  const own = Object.hasOwn(byMode, mode) ? Number(byMode[mode]) : NaN; // own entry only (R1)
  if (Number.isFinite(own) && own > 0) return { chars: own, source: "boot.budget_by_mode." + mode };
  const dflt = Number(boot.budget_chars);
  if (Number.isFinite(dflt) && dflt > 0) return { chars: dflt, source: "boot.budget_chars" };
  return { chars: DEFAULT_BUDGET, source: "default (no boot.budget_chars in the frontmatter)" };
}

// ---- resolve: the two lists, in order, deduplicated, per seat ----------------------------
// resolveBoot(index, { seat, mode, modeSource }) -> { seat, mode, modeSource, budget:{chars,
// source}, boot:[{path, why}], lookup:[{path, why}], problems:[string] }. `mode` omitted = the
// state block's mode_default; a caller that took the mode from a workspace line passes
// `modeSource` ("workspace AGENTS.md") so the report says where the mode came from.
// Order (batch 1, Aug 30 2026; LEAN carve-out batch 4b, Aug 31 2026): contract → ramp (browser
// only) → index → cold_start → mode set → active_project canon; LOOKUP = the index's lookup
// list, plus under LEAN the `lean:lookup` cold-start files and the canon. THE CANON RULE (batch
// 1b): the active_project canon boots in its OWN mode only — mode_default, or a mode whose set
// already lists it (first listing wins) — and every other KNOWN mode parks it in LOOKUP, first
// line, so a session in another project never pays for a canon it is not working in; an unknown
// mode keeps it as an anchor (1a v2: a broken index leaves a maximal plan). First listing
// wins: a path never appears twice across the two lists. A problem (unknown seat, unknown mode,
// a parse problem carried in from the index) never throws: the lists hold everything that still
// resolves and `problems` names what did not. A consumer must read `problems`: the browser
// boot exits 1 on any; a hook prints them and exits 0 (it may never wedge a session).
export function resolveBoot(index, { seat = "browser", mode = "", modeSource = "" } = {}) {
  const out = { seat, mode: "", modeSource: modeSource || (mode ? "override" : "state block"), budget: budgetFor(index, ""), boot: [], lookup: [], problems: [...(index?.problems || [])] };
  const seatDef = Object.hasOwn(SEATS, seat) ? SEATS[seat] : undefined; // own entry only (R1)
  if (!seatDef) { out.problems.push(`seat "${seat}" not in the seat table (have: ${Object.keys(SEATS).join(", ")})`); return out; }
  const modes = index?.modes || {};
  const modeDefault = index?.state?.mode_default || "";
  const resolved = mode || modeDefault;
  out.mode = resolved;
  out.budget = budgetFor(index, resolved);
  const modeSet = Object.hasOwn(modes, resolved) ? modes[resolved] : undefined; // own entry only (R1)
  if (!modeSet) out.problems.push(`mode "${resolved}" not in the modes block (have: ${Object.keys(modes).join(", ")})`);
  const seen = new Set();
  const add = (list, p, why) => { if (p && !seen.has(p)) { seen.add(p); list.push({ path: p, why }); } };
  add(out.boot, CONTRACT_PATH, "frozen core — the contract");
  if (seatDef.ramp) add(out.boot, seatDef.ramp, "the browser half's entry ramp");
  add(out.boot, INDEX_PATH, "RAW and IN FULL — the router (past the frontmatter, read the prose too)");
  const lean = resolved === "LEAN";
  for (const { path: p, comment } of index?.coldStart || []) {
    if (lean && /lean:lookup/.test(comment)) add(out.lookup, p, "open when: the task touches UI, a client, or a decision for Chan (LEAN skips it)");
    else add(out.boot, p, "cold-start set");
  }
  for (const p of modeSet || []) add(out.boot, p, "mode: " + resolved);
  const canon = index?.state?.active_project;
  // the canon rule: its own mode boots it (mode_default, or a set that already listed it, in
  // which case `add` is a no-op); LEAN keeps its batch-4b line; every other KNOWN mode parks it
  // first. An UNKNOWN mode keeps the canon among its anchors (the 1a v2 ruling: a broken index
  // still leaves the session a maximal plan to fix it with), and the problem line says why.
  if (lean) add(out.lookup, canon, "open when: the task touches the active project (LEAN skips the canon)");
  else if (modeSet && resolved !== modeDefault && !seen.has(canon)) add(out.lookup, canon, `open when: the work touches the active project (mode ${resolved} is not its mode)`);
  else add(out.boot, canon, "active_project — what Chan is working on now");
  for (const { path: p, trigger } of index?.lookup || []) add(out.lookup, p, "open when: " + (trigger || "its trigger fires"));
  return out;
}

// ---- the workspace mode line (batch 1b) ------------------------------------------------------
// One line, one parser, both doorway files: `boot_mode: <MODE>` (a bullet prefix is fine,
// a trailing # comment is fine). parseWorkspaceMode(text, fileName) -> { mode, problems }: no
// line = "" (the caller falls back to mode_default); two lines that disagree = the first wins
// and the second is named. It never validates the NAME against the modes block: resolveBoot
// does that, and an unknown workspace mode degrades exactly like an unknown mode_default
// (everything else resolves, the mode set is dropped, the problem is printed).
// R1 (Codex review of 1b v1, Sep 13 2026): the value lives on the declaration's OWN line. The
// v1 regex used `\s*` around the colon, which spans newlines, so an empty `boot_mode:` followed
// by a blank line and a paragraph starting "LEAN guidance..." silently selected LEAN with no
// problem named. Only horizontal whitespace may appear inside the declaration now, an empty or
// comment-only value is a NAMED problem, and a value never comes from any line but its own.
// R4 (Codex review of 1b v2, Sep 13 2026): the per-file parser names the empty value and claims
// NOTHING about routing; only readWorkspaceMode, having read both doorway files, says "booting
// mode_default", and only when no usable mode exists. v2's parser said it per file, so an empty
// CLAUDE.md beside a valid AGENTS.md announced a fallback that never happened.
export const WORKSPACE_MODE_LINE = /^[ \t]*(?:-[ \t]*)?boot_mode[ \t]*:[ \t]*([^\s#]*)/gm;
export function parseWorkspaceMode(text, fileName = "workspace file") {
  const out = { mode: "", problems: [] };
  const found = [...String(text ?? "").replace(/\r\n/g, "\n").matchAll(WORKSPACE_MODE_LINE)].map((m) => m[1]);
  if (!found.length) return out;
  const named = found.filter(Boolean);
  if (found.length > named.length) out.problems.push(`${fileName} has a boot_mode line with no value (the mode name goes on that same line; a value on a later line is never read)`);
  if (!named.length) return out;
  out.mode = named[0];
  const others = named.slice(1).filter((m) => m !== out.mode);
  if (others.length) out.problems.push(`${fileName} names more than one boot_mode (${[out.mode, ...others].join(", ")}); the first wins, fix the file`);
  return out;
}
// readWorkspaceMode(root) -> { mode, source, problems }: reads WORKSPACE_FILES under `root` (a
// missing file is not a problem; a workspace may carry either doorway). Both present and both
// naming a mode: agreement is the mode; disagreement is drift, named, and the mode is "" so the
// consumer falls back to mode_default rather than picking a side. The only I/O besides the
// counters below; a read error is named, never thrown (a hook may never wedge a session).
export function readWorkspaceMode(root) {
  const out = { mode: "", source: "", problems: [] };
  const seenModes = [];
  for (const f of WORKSPACE_FILES) {
    const p = path.join(root, f);
    let text = "";
    try { if (!fs.existsSync(p)) continue; text = fs.readFileSync(p, "utf8"); }
    catch (e) { out.problems.push(`${f} in the workspace could not be read (${e?.code || e?.message || e})`); continue; }
    const r = parseWorkspaceMode(text, f);
    out.problems.push(...r.problems);
    if (r.mode) seenModes.push({ mode: r.mode, file: f });
  }
  if (!seenModes.length) { if (out.problems.length) out.problems[out.problems.length - 1] += "; booting mode_default"; return out; }
  const modes = [...new Set(seenModes.map((s) => s.mode))];
  if (modes.length > 1) {
    out.problems.push(`the workspace's boot_mode lines disagree (${seenModes.map((s) => s.file + ": " + s.mode).join(", ")}); booting mode_default until the two files carry the same line`);
    return out;
  }
  out.mode = modes[0];
  out.source = "workspace " + seenModes.map((s) => s.file).join(" + ");
  return out;
}

// ---- count and verify (the only I/O in this file) ----------------------------------------
// Characters, not bytes, CRLF normalized: both halves of the relay report ONE number (the
// CLI's Windows checkout counted 423 bytes more than the LF sandbox in batch 1; AL-21).
export function charsOf(root, rel) {
  try { return fs.readFileSync(path.join(root, rel), "utf8").replace(/\r\n/g, "\n").length; } catch { return 0; }
}
// verifyOnDisk(root, entries) -> [{path, why, exists, chars}]; a missing file is a broken boot.
export function verifyOnDisk(root, entries) {
  return entries.map((e) => {
    const exists = fs.existsSync(path.join(root, e.path));
    return { ...e, exists, chars: exists ? charsOf(root, e.path) : 0 };
  });
}
