// _boot_resolver_test.mjs — net for boot-resolver.mjs, THE shared boot resolver (batch 1a,
// Sep 12 2026; why: ../lessons/audit-log.md AL-30 "one shared resolver is missing", AL-32).
// Run from templates/:   node _boot_resolver_test.mjs
// MANDATORY after editing boot-resolver.mjs, either seat script that imports it
// (boot-claudeai.mjs, codex/session-ritual.mjs), or the fixtures under fixtures/.
// Three layers, all raw reads, all mutations on temp copies:
//   A. FIXTURES (fixtures/boot-index.frozen.md + fixtures/boot-expected.json): the resolver's
//      output on the frozen index equals every pinned entry, seat by seat and mode by mode —
//      captured entries are what each seat's pre-extraction script produced at bb9979c, so a
//      pass here IS the compatibility proof; derived entries pin the modes a seat could not
//      reach before 1a (the codex LEAN note in the fixture explains the ~15K it closes).
//   B. LAWS on the frozen index: the ramp is the only per-seat difference (codex = browser
//      minus ramp, cli = codex, every mode); LEAN parks the lean:lookup files and the canon in
//      LOOKUP for every seat; contract first, index next (after the ramp for the browser); no
//      path twice across the two lists; and the failure modes never throw and always name the
//      problem (unknown mode keeps everything else resolvable, unknown seat, no frontmatter,
//      stripped cold_start, missing active_project, a dedup case, CRLF == LF), and R1 (Codex
//      review, Sep 12 2026): inherited object names (constructor, toString, __proto__,
//      hasOwnProperty) as a mode or a seat are "not in the block", named, never thrown, while
//      an OWN entry carrying such a name is a real entry.
//   C. LIVE AGREEMENT: on the live index, the browser boot's printed BOOT/LOOKUP equal the
//      resolver's browser lists, and the Codex ritual's printed Read plan equals the resolver's
//      codex list — two seat scripts and one resolver agreeing on the same file, which no net
//      checked before this batch. Plus: every resolved path exists on disk, and charsOf counts
//      CRLF-normalized.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { SEATS, charsOf, parseIndex, resolveBoot, verifyOnDisk } from "./boot-resolver.mjs";

const TPL = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(TPL, "..");
let fail = 0, ran = 0;
const t = (n, c) => { ran++; if (c) console.log("  ok  " + n); else { fail++; console.log("FAIL  " + n); } };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const paths = (list) => list.map((e) => e.path);

// ---- A. fixtures ---------------------------------------------------------------------------
const expected = JSON.parse(fs.readFileSync(path.join(TPL, "fixtures/boot-expected.json"), "utf8"));
const frozenText = fs.readFileSync(path.join(TPL, "fixtures", expected.index), "utf8");
const frozen = parseIndex(frozenText);
t("frozen index parses with no problems", frozen.problems.length === 0);
t("frozen index: state block (mode_default TRIAL, active_project set, budget 40000)", frozen.state.mode_default === "TRIAL" && /project-canon\.md$/.test(frozen.state.active_project) && frozen.boot.budget_chars === "40000");
t("frozen index: 4 cold-start files, 3 tagged lean:lookup, 5 modes, 12 lookup lines", frozen.coldStart.length === 4 && frozen.coldStart.filter((c) => /lean:lookup/.test(c.comment)).length === 3 && Object.keys(frozen.modes).length === 5 && frozen.lookup.length === 12);
const MODES = Object.keys(frozen.modes);
t("fixture covers every seat in the seat table and every mode in the frozen index", eq(Object.keys(expected.seats).sort(), Object.keys(SEATS).sort()) && Object.values(expected.seats).every((s) => eq(Object.keys(s.modes).sort(), [...MODES].sort())));
let pinned = 0, captured = 0;
for (const [seat, def] of Object.entries(expected.seats)) {
  for (const [mode, want] of Object.entries(def.modes)) {
    const got = resolveBoot(frozen, { seat, mode });
    const withWhy = want.boot.length && typeof want.boot[0] === "object";
    const bootOk = withWhy ? eq(got.boot.map(({ path: p, why }) => ({ path: p, why })), want.boot) : eq(paths(got.boot), want.boot);
    const lookOk = !want.lookup || eq(got.lookup.map(({ path: p, why }) => ({ path: p, why })), want.lookup);
    pinned++; if (want.sourceKind === "captured") captured++;
    t(`${seat}/${mode} (${want.sourceKind}): resolver output equals the fixture${withWhy ? " (path and why, both lists)" : " (boot paths)"}`, got.problems.length === 0 && got.mode === mode && bootOk && lookOk);
  }
}
t(`fixture entries pinned: ${pinned} (${captured} captured from pre-extraction seats)`, pinned === Object.keys(SEATS).length * MODES.length && captured >= 6);

// ---- B. laws on the frozen index -----------------------------------------------------------
const RAMP = SEATS.browser.ramp;
t("ramp is the only per-seat difference: codex boot = browser boot minus the ramp, every mode", MODES.every((m) => eq(paths(resolveBoot(frozen, { seat: "browser", mode: m }).boot).filter((p) => p !== RAMP), paths(resolveBoot(frozen, { seat: "codex", mode: m }).boot))));
t("lookup lists identical across seats, every mode", MODES.every((m) => eq(paths(resolveBoot(frozen, { seat: "browser", mode: m }).lookup), paths(resolveBoot(frozen, { seat: "codex", mode: m }).lookup))));
t("cli seat resolves exactly as codex, every mode (the 1b target, nothing runs it yet)", MODES.every((m) => { const a = resolveBoot(frozen, { seat: "cli", mode: m }), b = resolveBoot(frozen, { seat: "codex", mode: m }); return eq(paths(a.boot), paths(b.boot)) && eq(paths(a.lookup), paths(b.lookup)); }));
const STAR = frozen.coldStart.filter((c) => /lean:lookup/.test(c.comment)).map((c) => c.path);
for (const seat of Object.keys(SEATS)) {
  const lean = resolveBoot(frozen, { seat, mode: "LEAN" }), dflt = resolveBoot(frozen, { seat });
  t(`${seat}: LEAN parks the 3 lean:lookup files and the canon in LOOKUP; the default mode boots them`, STAR.concat(frozen.state.active_project).every((p) => paths(lean.lookup).includes(p) && !paths(lean.boot).includes(p) && paths(dflt.boot).includes(p)));
  t(`${seat}: contract first, index ${seat === "browser" ? "third after the ramp" : "second"}, in every mode`, MODES.every((m) => { const b = paths(resolveBoot(frozen, { seat, mode: m }).boot); return b[0] === "CLAUDE.md" && (seat === "browser" ? b[1] === RAMP && b[2] === "memory/MEMORY.md" : b[1] === "memory/MEMORY.md"); }));
  t(`${seat}: no path twice across BOOT + LOOKUP, every mode`, MODES.every((m) => { const r = resolveBoot(frozen, { seat, mode: m }); const all = paths(r.boot).concat(paths(r.lookup)); return new Set(all).size === all.length; }));
}
t("codex LEAN is contract + index + hard rules only (the ~15K the pre-1a hook would have read is gone)", eq(paths(resolveBoot(frozen, { seat: "codex", mode: "LEAN" }).boot), ["CLAUDE.md", "memory/MEMORY.md", "memory/chan-hard-rules.md"]));
t("mode omitted resolves mode_default from the state block, modeSource says so", resolveBoot(frozen, { seat: "codex" }).mode === "TRIAL" && resolveBoot(frozen, { seat: "codex" }).modeSource === "state block" && resolveBoot(frozen, { seat: "codex", mode: "LEAN" }).modeSource === "override");
// failure modes — never throw, always name the problem
let r = resolveBoot(frozen, { seat: "codex", mode: "NO_SUCH_MODE" });
t("unknown mode: problem names it and the modes it has; contract, index, cold start and canon still resolve; no mode files", /mode "NO_SUCH_MODE" not in the modes block \(have: /.test(r.problems[0]) && eq(paths(r.boot), ["CLAUDE.md", "memory/MEMORY.md", ...frozen.coldStart.map((c) => c.path), frozen.state.active_project]));
r = resolveBoot(frozen, { seat: "NO_SUCH_SEAT" });
t("unknown seat: problem names it and the seats it has; lists empty", /seat "NO_SUCH_SEAT" not in the seat table \(have: browser, codex, cli\)/.test(r.problems[0]) && r.boot.length === 0 && r.lookup.length === 0);
const noFm = parseIndex("# not an index\n");
t("no frontmatter: parse names it, resolve carries it and still yields the two anchors", /no frontmatter block/.test(noFm.problems[0]) && eq(paths(resolveBoot(noFm, { seat: "codex" }).boot), ["CLAUDE.md", "memory/MEMORY.md"]) && resolveBoot(noFm, { seat: "codex" }).problems.some((p) => /no frontmatter/.test(p)));
const stripped = parseIndex(frozenText.replace(/\ncold_start:[\s\S]*?(?=\nmodes:)/, "\n"));
t("stripped cold_start: named as a problem (the browser boot exits 1 on it)", stripped.problems.some((p) => /no cold_start list/.test(p)) && stripped.coldStart.length === 0);
const noCanon = parseIndex(frozenText.replace(/\n  active_project:[^\n]*/, ""));
t("missing active_project: named as a problem, no entry carries the active_project reason (the browser boot exits 1; a hook prints it)", noCanon.problems.some((p) => /no active_project/.test(p)) && !resolveBoot(noCanon, { seat: "browser" }).boot.some((e) => /^active_project/.test(e.why)) && resolveBoot(noCanon, { seat: "codex" }).problems.some((p) => /no active_project/.test(p)));
const dupIdx = parseIndex("---\nstate:\n  mode_default: X\n  active_project: memory/a.md\ncold_start:\n  - memory/a.md\nmodes:\n  X:\n    - memory/a.md\n    - memory/b.md\nlookup:\n  - memory/b.md   # never reached\n---\n");
r = resolveBoot(dupIdx, { seat: "codex" });
t("dedup: a path listed as cold start, mode file, canon and lookup appears once, first listing wins", eq(paths(r.boot), ["CLAUDE.md", "memory/MEMORY.md", "memory/a.md", "memory/b.md"]) && r.lookup.length === 0 && r.problems.length === 0);
// checkout-independent (Codex, Sep 12 2026: a Windows checkout had already materialized CRLF, and
// doubling it made CRCRLF): normalize to LF first, then build the CRLF variant
const LF = frozenText.replace(/\r\n/g, "\n");
t("CRLF index parses identically to LF, whatever line ending the checkout gave the fixture", eq(parseIndex(LF.replace(/\n/g, "\r\n")), parseIndex(LF)) && eq(parseIndex(LF), frozen));
// R1: inherited names are not entries; own entries with those names are
const INHERITED = ["constructor", "toString", "__proto__", "hasOwnProperty"];
t("R1: an inherited name as the mode is unknown: named problem, anchors + cold start + canon resolve, no throw", INHERITED.every((m) => { let r; try { r = resolveBoot(frozen, { seat: "codex", mode: m }); } catch { return false; } return new RegExp('mode "' + m.replace(/[$]/g, "") + '" not in the modes block').test(r.problems[0]) && eq(paths(r.boot), ["CLAUDE.md", "memory/MEMORY.md", ...frozen.coldStart.map((c) => c.path), frozen.state.active_project]); }));
t("R1: an inherited name as mode_default in the frontmatter behaves the same (the hook's path)", INHERITED.every((m) => { let r; try { r = resolveBoot(parseIndex(frozenText.replace(/mode_default: TRIAL/, "mode_default: " + m)), { seat: "codex" }); } catch { return false; } return r.mode === m && /not in the modes block/.test(r.problems[0]) && r.boot.length === 2 + frozen.coldStart.length + 1; }));
t("R1: an inherited name as the seat is unknown: named problem, lists empty, no throw", INHERITED.every((sn) => { let r; try { r = resolveBoot(frozen, { seat: sn }); } catch { return false; } return /not in the seat table \(have: browser, codex, cli\)/.test(r.problems[0]) && r.boot.length === 0 && r.lookup.length === 0; }));
const ownIdx = parseIndex("---\nstate:\n  mode_default: constructor\n  active_project: memory/p.md\ncold_start:\n  - memory/c.md\nmodes:\n  constructor:\n    - memory/own.md\n  __proto__:\n    - memory/proto.md\n---\n");
t("R1: OWN entries named constructor and __proto__ are real modes (parsed into a null-prototype table, resolved as entries)", eq(Object.keys(ownIdx.modes), ["constructor", "__proto__"]) && ownIdx.problems.length === 0 && eq(paths(resolveBoot(ownIdx, { seat: "codex" }).boot), ["CLAUDE.md", "memory/MEMORY.md", "memory/c.md", "memory/own.md", "memory/p.md"]) && resolveBoot(ownIdx, { seat: "codex" }).problems.length === 0 && eq(paths(resolveBoot(ownIdx, { seat: "codex", mode: "__proto__" }).boot), ["CLAUDE.md", "memory/MEMORY.md", "memory/c.md", "memory/proto.md", "memory/p.md"]));
t("R1: the seat table exposes exactly browser, codex, cli as own entries", eq(Object.keys(SEATS), ["browser", "codex", "cli"]) && !Object.hasOwn(SEATS, "constructor"));
t("parseIndex never throws on empty or non-string input", parseIndex("").problems.length > 0 && parseIndex(undefined).problems.length > 0);

// ---- C. live agreement ---------------------------------------------------------------------
const live = parseIndex(fs.readFileSync(path.join(ROOT, "memory/MEMORY.md"), "utf8"));
t("live index parses with no problems", live.problems.length === 0);
const rx = () => /^\s+\d+\.\s+(?:MISSING )?(\S+)/gm;
let printed = "";
try { printed = execFileSync("node", [path.join(ROOT, "templates/boot-claudeai.mjs")], { cwd: ROOT }).toString(); } catch (e) { printed = ((e.stdout || "") + (e.stderr || "")).toString(); }
const cut = printed.indexOf("\nLOOKUP");
const pick = (s) => [...s.matchAll(rx())].map((m) => m[1]);
const lb = resolveBoot(live, { seat: "browser" });
t("LIVE: boot-claudeai.mjs prints exactly the resolver's browser BOOT list, in order", cut > 0 && eq(pick(printed.slice(0, cut)), paths(lb.boot)));
t("LIVE: boot-claudeai.mjs prints exactly the resolver's browser LOOKUP list, in order", cut > 0 && eq(pick(printed.slice(cut)), paths(lb.lookup)));
const HOME = fs.mkdtempSync(path.join(os.tmpdir(), "resolvernet-home-"));
const REPO = path.join(HOME, "repo"); fs.mkdirSync(REPO); spawnSync("git", ["init", "-q"], { cwd: REPO });
const hook = spawnSync(process.execPath, [path.join(ROOT, "templates/codex/session-ritual.mjs")], { cwd: ROOT, input: JSON.stringify({ source: "startup", hook_event_name: "SessionStart", cwd: REPO }), encoding: "utf8", timeout: 10000, env: { ...process.env, HOME, USERPROFILE: HOME, CLAUDE_CORE: ROOT } });
fs.rmSync(HOME, { recursive: true, force: true });
let ctx = ""; try { ctx = JSON.parse(hook.stdout).hookSpecificOutput.additionalContext; } catch {}
const plan = ((ctx.match(/Read plan: (.*?)\. Git /) || [])[1] || "").split(", ").filter(Boolean);
const lc = resolveBoot(live, { seat: "codex" });
t("LIVE: codex/session-ritual.mjs prints exactly the resolver's codex read plan, in order, no resolver problems", hook.status === 0 && eq(plan, paths(lc.boot)) && !/Resolver problems/.test(ctx) && new RegExp("Router at runtime: mode " + lc.mode + ";").test(ctx));
t("LIVE: the two seats agree — codex plan = browser BOOT minus the ramp", eq(plan, paths(lb.boot).filter((p) => p !== RAMP)));
const onDisk = verifyOnDisk(ROOT, lb.boot.concat(lb.lookup));
t(`LIVE: every resolved path exists on disk (${onDisk.length} files) and verifyOnDisk counts chars for each`, onDisk.every((e) => e.exists && e.chars > 0));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "resolvernet-chars-"));
fs.writeFileSync(path.join(TMP, "lf.md"), "a\nb\nc\n"); fs.writeFileSync(path.join(TMP, "crlf.md"), "a\r\nb\r\nc\r\n");
t("charsOf counts CRLF-normalized characters (both halves report ONE number) and 0 for a missing file", charsOf(TMP, "lf.md") === 6 && charsOf(TMP, "crlf.md") === 6 && charsOf(TMP, "nope.md") === 0);
fs.rmSync(TMP, { recursive: true, force: true });

console.log(`\nboot resolver net: ${ran - fail} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
