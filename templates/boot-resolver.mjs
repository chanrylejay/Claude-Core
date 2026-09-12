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
import fs from "node:fs";
import path from "node:path";

// The seat table. `ramp` is the ONLY per-seat difference the resolver knows: the browser
// half reads its entry ramp second (batch 1, Aug 30 2026); the hands never need it. `cli`
// (the DeepSeek Claude Code seat) gets its consumer in batch 1b, when the drill's step 2 is
// pointed here; until then the entry is the pinned target and nothing runs it.
export const SEATS = Object.freeze({
  browser: Object.freeze({ ramp: "workflow/relay-boot-claudeai.md" }),
  codex: Object.freeze({ ramp: null }),
  cli: Object.freeze({ ramp: null }),
});
export const INDEX_PATH = "memory/MEMORY.md";
export const CONTRACT_PATH = "CLAUDE.md";

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
      out[section][body.slice(0, i).trim()] = body.slice(i + 1).trim();
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

// ---- resolve: the two lists, in order, deduplicated, per seat ----------------------------
// resolveBoot(index, { seat, mode }) -> { seat, mode, modeSource, boot:[{path, why}],
// lookup:[{path, why}], problems:[string] }. `mode` omitted = the state block's mode_default.
// Order (batch 1, Aug 30 2026; LEAN carve-out batch 4b, Aug 31 2026): contract → ramp (browser
// only) → index → cold_start → mode set → active_project canon; LOOKUP = the index's lookup
// list, plus under LEAN the `lean:lookup` cold-start files and the canon. First listing wins:
// a path never appears twice across the two lists. A problem (unknown seat, unknown mode, a
// parse problem carried in from the index) never throws: the lists hold everything that still
// resolves and `problems` names what did not. A consumer must read `problems`: the browser
// boot exits 1 on any; a hook prints them and exits 0 (it may never wedge a session).
export function resolveBoot(index, { seat = "browser", mode = "" } = {}) {
  const out = { seat, mode: "", modeSource: mode ? "override" : "state block", boot: [], lookup: [], problems: [...(index?.problems || [])] };
  const seatDef = Object.hasOwn(SEATS, seat) ? SEATS[seat] : undefined; // own entry only (R1)
  if (!seatDef) { out.problems.push(`seat "${seat}" not in the seat table (have: ${Object.keys(SEATS).join(", ")})`); return out; }
  const modes = index?.modes || {};
  const resolved = mode || index?.state?.mode_default || "";
  out.mode = resolved;
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
  if (lean) add(out.lookup, canon, "open when: the task touches the active project (LEAN skips the canon)");
  else add(out.boot, canon, "active_project — what Chan is working on now");
  for (const { path: p, trigger } of index?.lookup || []) add(out.lookup, p, "open when: " + (trigger || "its trigger fires"));
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
