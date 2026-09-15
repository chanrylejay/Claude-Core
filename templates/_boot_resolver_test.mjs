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
//   D. BATCH 1b, ROUTING (Sep 12 2026; why: AL-30, AL-33): the canon rule on the frozen index
//      (its own mode boots the active_project canon, every other KNOWN mode parks it as the
//      first LOOKUP line, an unknown mode keeps it as an anchor, LEAN keeps its 4b line); the
//      workspace mode line (one parser for CLAUDE.md and AGENTS.md, agreement, disagreement
//      named and falling back, bullets and comments, no line = ""); per-mode budgets (nested
//      boot.budget_by_mode parses, budgetFor's precedence, own-entry only); and the LIVE red
//      line AL-30 said only the default mode had: EVERY seat and mode on the live index sits
//      under its budget, the four routed reads (cost file, codex.md, DIRECTORY, REGISTRY) are
//      never in a BOOT list, and the DeepSeek hook (the cli seat's consumer since 1b) prints
//      exactly the resolver's cli plan. Fixture provenance after 1b: captured 3, derived 3,
//      routed 9 (the 1a entry with only the canon moved; routedFrom keeps the 1a label).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { SEATS, WORKSPACE_FILES, WORKSPACE_MODE_LINE, DEFAULT_BUDGET, budgetFor, charsOf, parseIndex, parseWorkspaceMode, readWorkspaceMode, resolveBoot, verifyOnDisk } from "./boot-resolver.mjs";

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
let pinned = 0, captured = 0, routed = 0;
for (const [seat, def] of Object.entries(expected.seats)) {
  for (const [mode, want] of Object.entries(def.modes)) {
    const got = resolveBoot(frozen, { seat, mode });
    const withWhy = want.boot.length && typeof want.boot[0] === "object";
    const bootOk = withWhy ? eq(got.boot.map(({ path: p, why }) => ({ path: p, why })), want.boot) : eq(paths(got.boot), want.boot);
    const lookOk = !want.lookup || eq(got.lookup.map(({ path: p, why }) => ({ path: p, why })), want.lookup);
    pinned++; if (want.sourceKind === "captured") captured++; if (want.sourceKind === "routed") routed++;
    t(`${seat}/${mode} (${want.sourceKind}): resolver output equals the fixture${withWhy ? " (path and why, both lists)" : " (boot paths)"}`, got.problems.length === 0 && got.mode === mode && bootOk && lookOk);
  }
}
t(`fixture entries pinned: ${pinned} (${captured} captured from pre-extraction seats, ${routed} routed by 1b, each keeping its 1a provenance in routedFrom)`, pinned === Object.keys(SEATS).length * MODES.length && captured === 3 && routed === 9 && Object.values(expected.seats).every((s) => Object.values(s.modes).every((w) => w.sourceKind !== "routed" || /^(captured|derived)$/.test(w.routedFrom))));
t("routed entries are the 1a shape with ONLY the canon moved: TRIAL and LEAN entries carry their 1a labels untouched", Object.values(expected.seats).every((s) => s.modes.TRIAL.sourceKind !== "routed" && s.modes.LEAN.sourceKind !== "routed" && ["JOB_HUNT", "ANO_ULAM", "CLIENT_BUILD"].every((m) => s.modes[m].sourceKind === "routed")));

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
t("R1: OWN entries named constructor and __proto__ are real modes (parsed into a null-prototype table, resolved as entries; __proto__ is not the default, so 1b parks the canon)", eq(Object.keys(ownIdx.modes), ["constructor", "__proto__"]) && ownIdx.problems.length === 0 && eq(paths(resolveBoot(ownIdx, { seat: "codex" }).boot), ["CLAUDE.md", "memory/MEMORY.md", "memory/c.md", "memory/own.md", "memory/p.md"]) && resolveBoot(ownIdx, { seat: "codex" }).problems.length === 0 && eq(paths(resolveBoot(ownIdx, { seat: "codex", mode: "__proto__" }).boot), ["CLAUDE.md", "memory/MEMORY.md", "memory/c.md", "memory/proto.md"]) && resolveBoot(ownIdx, { seat: "codex", mode: "__proto__" }).lookup[0].path === "memory/p.md");
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

// ---- D. batch 1b: routing ------------------------------------------------------------------
// the canon rule, on the frozen index (mode_default TRIAL; the TRIAL set lists the canon)
const CANON = frozen.state.active_project;
const OTHER = MODES.filter((m) => m !== frozen.state.mode_default && m !== "LEAN");
for (const seat of Object.keys(SEATS)) {
  t(`${seat}: the default mode boots the active_project canon; every other known mode parks it as the FIRST lookup line with its own why`, paths(resolveBoot(frozen, { seat }).boot).includes(CANON) && OTHER.every((m) => { const r = resolveBoot(frozen, { seat, mode: m }); return !paths(r.boot).includes(CANON) && r.lookup[0].path === CANON && r.lookup[0].why === `open when: the work touches the active project (mode ${m} is not its mode)`; }));
}
t("canon rule: a mode whose set already lists the canon boots it once, in the set's position (first listing wins), never twice", (() => { const i = parseIndex("---\nstate:\n  mode_default: A\n  active_project: projects/p/project-canon.md\ncold_start:\n  - memory/c.md\nmodes:\n  A:\n    - memory/a.md\n  B:\n    - projects/p/project-canon.md\n    - memory/b.md\n---\n"); const r = resolveBoot(i, { seat: "codex", mode: "B" }); return eq(paths(r.boot), ["CLAUDE.md", "memory/MEMORY.md", "memory/c.md", "projects/p/project-canon.md", "memory/b.md"]) && !paths(r.lookup).includes("projects/p/project-canon.md"); })());
t("canon rule: an UNKNOWN mode keeps the canon among its anchors (1a v2: a broken index leaves a maximal plan), LEAN keeps its batch-4b line", paths(resolveBoot(frozen, { seat: "codex", mode: "NO_SUCH_MODE" }).boot).includes(CANON) && resolveBoot(frozen, { seat: "codex", mode: "LEAN" }).lookup.find((e) => e.path === CANON).why === "open when: the task touches the active project (LEAN skips the canon)");
t("canon rule: --mode naming the default itself still boots the canon (override of the same mode is not another mode)", paths(resolveBoot(frozen, { seat: "browser", mode: frozen.state.mode_default }).boot).includes(CANON));
// the workspace mode line: one parser, both files
t("workspace line: `boot_mode: X`, with or without a bullet, with a trailing comment, CRLF or LF, parses to X; no line parses to \"\"", parseWorkspaceMode("# P\n- Stack: y\nboot_mode: ANO_ULAM\n").mode === "ANO_ULAM" && parseWorkspaceMode("- boot_mode: JOB_HUNT   # from the modes block\r\n").mode === "JOB_HUNT" && parseWorkspaceMode("  -  boot_mode :  LEAN\n").mode === "LEAN" && parseWorkspaceMode("no line here\nboot mode: X\nbootmode: Y\n").mode === "" && parseWorkspaceMode("").mode === "" && parseWorkspaceMode(undefined).mode === "");
t("workspace line: a prose mention of the word never parses as a mode (the key must open the line)", parseWorkspaceMode("the file carries boot_mode: X somewhere in prose\n").mode === "" && parseWorkspaceMode("`boot_mode: <MODE>` is the shape\n").mode === "");
// R1 (Codex review of 1b v1, Sep 13 2026): the value lives on the declaration's own line. v1's regex spanned
// newlines and an empty `boot_mode:` swallowed the next paragraph's first word (LEAN, silently, no problem).
t("R1: an empty `boot_mode:` followed by a blank line and prose is mode \"\" with the problem NAMED, never the next paragraph's first word; the per-file parser claims nothing about routing (R4)", (() => { const r = parseWorkspaceMode("boot_mode:\n\nLEAN guidance belongs to later prose.\n", "AGENTS.md"); return r.mode === "" && /^AGENTS\.md has a boot_mode line with no value \(the mode name goes on that same line; a value on a later line is never read\)$/.test(r.problems[0]); })());
t("R1: a comment-only value, a bare `boot_mode:` at end of file, and a dash on its own line before the key are all named-empty or line-bound; horizontal whitespace inside the declaration still parses", parseWorkspaceMode("boot_mode:   # fill me in\n").mode === "" && parseWorkspaceMode("boot_mode:   # fill me in\n").problems.length === 1 && parseWorkspaceMode("boot_mode:").mode === "" && parseWorkspaceMode("-\nboot_mode: X\n").mode === "X" && parseWorkspaceMode("\tboot_mode:\tX\t# c\n").mode === "X" && parseWorkspaceMode("boot_mode:X\n").mode === "X");
t("R1/R4: an empty CLAUDE.md line beside a valid AGENTS.md: the valid mode is selected, the empty file is named, and NO \"booting mode_default\" is claimed (Codex's v2 repro, the whole message pinned)", (() => { const r = parseWorkspaceMode("boot_mode:\nboot_mode: B\n", "f"); const W = fs.mkdtempSync(path.join(os.tmpdir(), "resolvernet-r1-")); fs.writeFileSync(path.join(W, "CLAUDE.md"), "boot_mode:\n\nLEAN prose\n"); fs.writeFileSync(path.join(W, "AGENTS.md"), "boot_mode: CLIENT_BUILD\n"); const w = readWorkspaceMode(W); fs.rmSync(W, { recursive: true, force: true }); return r.mode === "B" && r.problems.length === 1 && w.mode === "CLIENT_BUILD" && w.source === "workspace AGENTS.md" && eq(w.problems, ["CLAUDE.md has a boot_mode line with no value (the mode name goes on that same line; a value on a later line is never read)"]); })());
t("R4: an empty declaration ALONE (one file, or both files empty) does claim \"booting mode_default\", once, on the last named problem, because that is what then happens", (() => { const W = fs.mkdtempSync(path.join(os.tmpdir(), "resolvernet-r4-")); fs.writeFileSync(path.join(W, "CLAUDE.md"), "boot_mode:\n"); const a = readWorkspaceMode(W); fs.writeFileSync(path.join(W, "AGENTS.md"), "boot_mode:   # todo\n"); const b = readWorkspaceMode(W); fs.rmSync(W, { recursive: true, force: true }); return a.mode === "" && eq(a.problems, ["CLAUDE.md has a boot_mode line with no value (the mode name goes on that same line; a value on a later line is never read); booting mode_default"]) && b.mode === "" && b.problems.length === 2 && !/booting mode_default/.test(b.problems[0]) && /^AGENTS\.md has a boot_mode line with no value .*; booting mode_default$/.test(b.problems[1]); })());
t("R1: the regex itself is line-bound: no `\\s` between the key, the colon and the value (only spaces and tabs), so it cannot span a newline", !/boot_mode\\s\*:|:\\s\*\(/.test(WORKSPACE_MODE_LINE.source) && /\[ \\t\]\*:\[ \\t\]\*/.test(WORKSPACE_MODE_LINE.source));
t("workspace line: two lines that disagree are a named problem, the first wins; two that agree are silent", /names more than one boot_mode \(A, B\)/.test(parseWorkspaceMode("boot_mode: A\nboot_mode: B\n", "AGENTS.md").problems[0]) && parseWorkspaceMode("boot_mode: A\nboot_mode: B\n").mode === "A" && parseWorkspaceMode("boot_mode: A\n- boot_mode: A\n").problems.length === 0);
const WS = fs.mkdtempSync(path.join(os.tmpdir(), "resolvernet-ws-"));
t("readWorkspaceMode: no doorway file, or files with no line, is mode \"\" with no problems (mode_default applies)", (() => { const a = readWorkspaceMode(WS); fs.writeFileSync(path.join(WS, "CLAUDE.md"), "# p\n- Run: x\n"); const b = readWorkspaceMode(WS); return a.mode === "" && a.problems.length === 0 && b.mode === "" && b.source === "" && b.problems.length === 0; })());
t("readWorkspaceMode: one file with the line names the mode and its source; both files agreeing name both", (() => { fs.writeFileSync(path.join(WS, "CLAUDE.md"), "- boot_mode: ANO_ULAM\n"); const a = readWorkspaceMode(WS); fs.writeFileSync(path.join(WS, "AGENTS.md"), "boot_mode: ANO_ULAM   # same line\n"); const b = readWorkspaceMode(WS); return a.mode === "ANO_ULAM" && a.source === "workspace CLAUDE.md" && b.mode === "ANO_ULAM" && b.source === "workspace CLAUDE.md + AGENTS.md" && b.problems.length === 0; })());
t("readWorkspaceMode: CLAUDE.md and AGENTS.md disagreeing is drift: named, mode \"\" (fall back to mode_default), never a side picked", (() => { fs.writeFileSync(path.join(WS, "AGENTS.md"), "boot_mode: JOB_HUNT\n"); const r = readWorkspaceMode(WS); return r.mode === "" && r.source === "" && /boot_mode lines disagree \(CLAUDE\.md: ANO_ULAM, AGENTS\.md: JOB_HUNT\)/.test(r.problems[0]); })());
t("readWorkspaceMode: an unknown workspace mode reaches resolveBoot as an unknown mode (named, everything else resolves)", (() => { fs.writeFileSync(path.join(WS, "AGENTS.md"), "boot_mode: ANO_ULAM\n"); fs.writeFileSync(path.join(WS, "CLAUDE.md"), "boot_mode: NOT_A_MODE\n"); fs.rmSync(path.join(WS, "AGENTS.md")); const w = readWorkspaceMode(WS); const r = resolveBoot(frozen, { seat: "cli", mode: w.mode, modeSource: w.source }); return w.mode === "NOT_A_MODE" && r.modeSource === "workspace CLAUDE.md" && /mode "NOT_A_MODE" not in the modes block/.test(r.problems[0]) && paths(r.boot).includes("memory/chan-hard-rules.md"); })());
t("readWorkspaceMode: an inherited name on the line is an unknown mode, never a throw; the seat/mode tables stay own-entry", ["constructor", "__proto__"].every((m) => { fs.writeFileSync(path.join(WS, "CLAUDE.md"), "boot_mode: " + m + "\n"); let r; try { r = resolveBoot(frozen, { seat: "codex", mode: readWorkspaceMode(WS).mode }); } catch { return false; } return r.mode === m && /not in the modes block/.test(r.problems[0]); }));
t("WORKSPACE_FILES is CLAUDE.md then AGENTS.md (the two doorway files, the same line in both)", eq([...WORKSPACE_FILES], ["CLAUDE.md", "AGENTS.md"]));
fs.rmSync(WS, { recursive: true, force: true });
// per-mode budgets
const bIdx = parseIndex("---\nstate:\n  mode_default: A\n  active_project: memory/p.md\ncold_start:\n  - memory/c.md\nmodes:\n  A:\n    - memory/a.md\n  B:\n    - memory/b.md\nboot:\n  budget_chars: 40000\n  budget_by_mode:\n    B: 47000\n    constructor: 99\n    C: notanumber\n---\n");
t("budget_by_mode parses as a nested map under boot (indent-4 pairs), and the flat boot keys still parse beside it", bIdx.problems.length === 0 && bIdx.boot.budget_chars === "40000" && eq(Object.keys(bIdx.boot.budget_by_mode), ["B", "constructor", "C"]) && bIdx.boot.budget_by_mode.B === "47000");
t("budgetFor: the mode's own line wins, else budget_chars, else DEFAULT_BUDGET; a non-number line falls through; an inherited name is not a line", eq(budgetFor(bIdx, "B"), { chars: 47000, source: "boot.budget_by_mode.B" }) && eq(budgetFor(bIdx, "A"), { chars: 40000, source: "boot.budget_chars" }) && budgetFor(bIdx, "C").chars === 40000 && budgetFor(bIdx, "toString").chars === 40000 && budgetFor(bIdx, "constructor").chars === 99 && budgetFor(parseIndex("---\nstate:\n  active_project: x\ncold_start:\n  - a\nmodes:\n  A:\n    - b\n---\n"), "A").chars === DEFAULT_BUDGET);
t("resolveBoot carries the resolved mode's budget (and the frozen index, with no map, gives every mode the default)", resolveBoot(bIdx, { seat: "codex", mode: "B" }).budget.chars === 47000 && resolveBoot(bIdx, { seat: "codex" }).budget.chars === 40000 && MODES.every((m) => resolveBoot(frozen, { seat: "browser", mode: m }).budget.chars === 40000));
t("resolveBoot: modeSource passed by a caller is reported verbatim; omitted keeps the 1a strings", resolveBoot(frozen, { seat: "codex", mode: "TRIAL", modeSource: "workspace AGENTS.md" }).modeSource === "workspace AGENTS.md" && resolveBoot(frozen, { seat: "codex" }).modeSource === "state block" && resolveBoot(frozen, { seat: "codex", mode: "LEAN" }).modeSource === "override");
// the LIVE red line: every seat and mode under its budget, on the live tree
const liveModes = Object.keys(live.modes);
const sizes = {};
for (const seat of Object.keys(SEATS)) for (const m of liveModes) { const r = resolveBoot(live, { seat, mode: m }); sizes[seat + "/" + m] = { chars: r.boot.reduce((s, e) => s + charsOf(ROOT, e.path), 0), budget: r.budget.chars, source: r.budget.source }; }
const overs = Object.entries(sizes).filter(([, v]) => v.chars > v.budget).map(([k, v]) => `${k} ${v.chars} > ${v.budget}`);
t(`LIVE: every seat and mode sits under its budget line (${Object.keys(sizes).length} plans; widest ${Object.entries(sizes).sort((a, b) => b[1].chars - a[1].chars)[0].join(" ")}${overs.length ? "; OVER: " + overs.join(", ") : ""})`, overs.length === 0);
t("LIVE: the default mode is measured against boot.budget_chars, and a budget_by_mode line only ever names a KNOWN mode", resolveBoot(live, { seat: "browser" }).budget.source === "boot.budget_chars" && Object.keys(live.boot.budget_by_mode || {}).every((m) => Object.hasOwn(live.modes, m)));
const ROUTED = ["memory/chan-ai-cost-context.md", "lessons/platforms/codex.md", "DIRECTORY.md", "projects/REGISTRY.md"];
t("LIVE: the four routed reads (cost file, codex.md, DIRECTORY, REGISTRY) are in no seat's BOOT list in any mode, and each is verified present as a LOOKUP line (batch 2a: the cost file's line carries the contract's LAW trigger; its prose catalog line is gone)", Object.keys(SEATS).every((seat) => liveModes.every((m) => !paths(resolveBoot(live, { seat, mode: m }).boot).some((p) => ROUTED.includes(p)))) && ROUTED.every((p) => fs.existsSync(path.join(ROOT, p))) && ["lessons/platforms/codex.md", "DIRECTORY.md", "projects/REGISTRY.md"].every((p) => live.lookup.some((l) => l.path === p)) && live.lookup.some((l) => l.path === "memory/chan-ai-cost-context.md" && /LAW before DeepSeek CLI work/.test(l.trigger)));
t("LIVE: the active_project canon boots in the default mode only; every other known mode parks it first", paths(resolveBoot(live, { seat: "codex" }).boot).includes(live.state.active_project) && liveModes.filter((m) => m !== live.state.mode_default && m !== "LEAN").every((m) => resolveBoot(live, { seat: "codex", mode: m }).lookup[0].path === live.state.active_project));
// batch 2a, the boot diet (Sep 14 2026; why: AL-34): the index is a manifest and the overrides are gone.
t("LIVE (2a): the index carries no budget_by_mode override; every seat and mode measures against boot.budget_chars (red on 13f20e0: JOB_HUNT 47,000 and ANO_ULAM 49,000 tripwires)", Object.keys(live.boot.budget_by_mode || {}).length === 0 && Object.values(sizes).every((v) => v.source === "boot.budget_chars"));
t("LIVE (2a): the index prose is not a catalog: no markdown link to a tracked memory file, no NOW, RUNTIME, or MODES mirror line (the frontmatter is the one home)", (() => { const txt = fs.readFileSync(path.join(ROOT, "memory/MEMORY.md"), "utf8").replace(/\r\n/g, "\n"); const prose = txt.slice(txt.indexOf("\n---", 4) + 4); return [...prose.matchAll(/\]\(([^)#\s]+\.md)\)/g)].every((m) => /LOCAL-ONLY-/.test(m[1])) && !/^- (?:NOW|RUNTIME|MODES)\b/m.test(prose); })());
t("LIVE (2a): every tracked memory file outside cold_start has exactly one lookup line with a trigger, and the LOCAL-ONLY class has none (the pointer net pins the same rule raw; this is the resolver's view)", (() => { const mem = fs.readdirSync(path.join(ROOT, "memory")).filter((f) => f.endsWith(".md") && f !== "MEMORY.md" && !f.startsWith("LOCAL-ONLY-")).map((f) => "memory/" + f); const cold = new Set(live.coldStart.map((e) => e.path)); return mem.every((p) => cold.has(p) ? !live.lookup.some((l) => l.path === p) : live.lookup.filter((l) => l.path === p).length === 1 && live.lookup.find((l) => l.path === p).trigger.length > 0) && !live.lookup.some((l) => /LOCAL-ONLY-/.test(l.path)); })());
t("LIVE (2a): no path appears twice across BOOT + LOOKUP for any seat in any mode (a memory file in a mode set and in lookup is listed once: first listing wins)", Object.keys(SEATS).every((seat) => liveModes.every((m) => { const r = resolveBoot(live, { seat, mode: m }); const all = [...paths(r.boot), ...paths(r.lookup)]; return new Set(all).size === all.length; })));
// the cli seat's consumer: the DeepSeek hook prints exactly the resolver's cli plan (batch 1b)
const CH = fs.mkdtempSync(path.join(os.tmpdir(), "resolvernet-clihome-"));
fs.mkdirSync(path.join(CH, ".claude"), { recursive: true });
fs.symlinkSync(ROOT, path.join(CH, "Claude-Core"), "junction");
const CW = path.join(CH, "ws"); fs.mkdirSync(CW); fs.writeFileSync(path.join(CW, "CLAUDE.md"), "# ws\n- boot_mode: CLIENT_BUILD\n");
const cliHook = spawnSync(process.execPath, [path.join(ROOT, "templates/global/session-ritual.mjs"), "start"], { cwd: CW, input: JSON.stringify({ source: "startup", cwd: CW }), encoding: "utf8", timeout: 20000, env: { ...process.env, HOME: CH, USERPROFILE: CH, XDG_DATA_HOME: path.join(CH, ".local", "share") } });
fs.rmSync(CH, { recursive: true, force: true });
let cliCtx = ""; try { cliCtx = JSON.parse(cliHook.stdout).hookSpecificOutput.additionalContext; } catch {}
const cliPlan = ((cliCtx.match(/READ PLAN \(.*?\): (.*?) — open every one RAW/) || [])[1] || "").split(", ").filter(Boolean);
const cliWant = resolveBoot(live, { seat: "cli", mode: "CLIENT_BUILD" });
t("LIVE: the DeepSeek hook prints exactly the resolver's cli plan for the WORKSPACE's boot_mode line (CLIENT_BUILD), in order, exit 0", cliHook.status === 0 && eq(cliPlan, paths(cliWant.boot)) && /READ PLAN \(mode CLIENT_BUILD from workspace CLAUDE\.md/.test(cliCtx));
t("LIVE, C1: the DeepSeek ritual names the contract-mandated cost file beside the plan with its live size, and the file is in no plan's BOOT list (the transitive read is reported, not hidden)", new RegExp("Contract-mandated on this seat, outside the plan's budget: memory/chan-ai-cost-context\\.md \\(" + charsOf(ROOT, "memory/chan-ai-cost-context.md") + " chars\\) is LAW before DeepSeek CLI work").test(cliCtx) && !paths(cliWant.boot).includes("memory/chan-ai-cost-context.md"));
t("LIVE: the three seats agree — cli plan = codex plan (same mode), and neither is the browser's ramp", eq(paths(cliWant.boot), paths(resolveBoot(live, { seat: "codex", mode: "CLIENT_BUILD" }).boot)) && !paths(cliWant.boot).includes(RAMP));
// R2 (Codex review of 1b v1 and v2, Sep 13 2026): the by-hand fallbacks beside the resolver must state the
// SAME rules the resolver applies (LEAN parks the lean:lookup cold-start files and the canon; an unknown mode
// adds no set but KEEPS the canon as an anchor; the canon boots in its own mode only and is a lookup in every
// other KNOWN mode) and must fire only when the PLAN is unavailable, never on an unrelated failed read. v1's
// block A ordered "every cold_start file" on any failed read (a LEAN workspace with a missing project index
// rebuilt a plan 7,492 chars larger than the one just printed); v2's fallbacks parked the canon "in every
// other mode", unknown included, where the resolver keeps it (7,792 chars apart on the recovery path).
// WHAT THESE PINS ARE: wording checks. They hold each home's stated rule in place and go red on a reword,
// which is the point (a same-edit pin update is the price of touching the rule). They do NOT prove the four
// homes agree with the resolver; that agreement is by reading, and the scenario pins at the end are the only
// behavioral checks. Codex named this limit (C10, v2 review) and it is accepted, not papered over.
const readKit = (p) => fs.readFileSync(path.join(ROOT, p), "utf8").replace(/\r\n/g, "\n").replace(/\n\/\/ ?/g, " ").replace(/\s+/g, " "); // wrapped // comments read as one line
const blockA = (readKit("templates/codex-agents-md.md").match(/## Block A[\s\S]*?## Block B/) || [""])[0];
const fallbackA = (blockA.match(/A failed read the ritual reports[\s\S]*?never at boot\./) || [""])[0];
t("R2: block A's by-hand fallback fires only when the plan is unavailable (ritual absent, Read plan line missing, or the resolver itself a failed read), and says an unrelated failed read is a file to fetch, not a reason to rebuild", /only when the ritual did not run, its Read plan line is missing, or it names the resolver itself as a failed read/.test(fallbackA) && /A failed read the ritual reports is a file to fetch or fix, never a reason to rebuild the plan/.test(fallbackA) && !/If the ritual did not run, or names a failed read, assemble/.test(blockA));
t("R2 (wording): block A's by-hand list states the resolver's rules incl. the unknown-mode canon anchor: LEAN's lean:lookup carve-out, an unknown mode adds no set, the canon boots in its own mode AND under an unknown mode, a lookup in every other KNOWN mode and under LEAN", /except under LEAN the files tagged `lean:lookup`, which are lookups there/.test(fallbackA) && /an unknown mode adds none/.test(fallbackA) && /`active_project` canon: a boot read in its own mode \(`mode_default`, or a mode whose set lists it\) and under an UNKNOWN mode \(an anchor while the router is broken\), a lookup in every other known mode and under LEAN/.test(fallbackA) && !/a lookup in every other mode and under LEAN/.test(fallbackA));
const drill = readKit("workflow/the-drill-and-memory.md");
t("R2 (wording): the drill's header and step 2 rebuild only on a missing plan or a failed RESOLVER read, under the resolver's rules incl. the unknown-mode canon anchor; any other failed read is a file to fetch", /If the ritual's printed plan is missing, or the plan itself names the resolver as a failed read, assemble the same plan yourself from the index frontmatter under the resolver's rules/.test(drill) && /a failed read of any other file is a file to fetch, never a reason to rebuild the plan/.test(drill) && /under the resolver's rules \(its header states them: under LEAN the `lean:lookup`-tagged cold-start files and the canon are lookups; an unknown mode adds no set but keeps the canon as an anchor; in every other known mode that is not its own, the canon is a lookup\)/.test(drill) && !/missing or names a failed read/.test(drill) && !/the canon boots in its own mode only\)/.test(drill));
const dsHook = readKit("templates/global/session-ritual.mjs");
t("R2 (wording): the DeepSeek ritual's by-hand strings (both) carry the LEAN carve-out, the unknown-mode rule WITH the canon anchor, and the canon rule for known modes", /assemble the plan by hand from the index frontmatter under the resolver's rules \(cold_start, except under LEAN the lean:lookup-tagged files, which are lookups there; the workspace's mode set, none for an unknown mode; the active_project canon in its own mode and under an unknown mode, a lookup in every other known mode; lookup files at their trigger\)/.test(dsHook) && /under the resolver's rules \(LEAN parks the lean:lookup files and the canon; an unknown mode adds no set but keeps the canon; the canon boots in its own mode only, a lookup in every other known mode\)/.test(dsHook) && !/the active_project canon in its own mode only;/.test(dsHook));
t("R2: the browser ramp's fallback points at the resolver header's rules instead of restating a list", /If the script cannot run, assemble them by hand from the index frontmatter under the resolver header's rules\./.test(readKit("workflow/relay-boot-claudeai.md")));
t("R2: the resolver's header actually states the three rules the fallbacks point at", (() => { const h = readKit("templates/boot-resolver.mjs"); return /the active_project canon boots in its OWN mode only/.test(h) && /every other KNOWN mode parks it in LOOKUP/.test(h) && /an unknown mode keeps it as an anchor/.test(h) && /LEAN carve-out|lean:lookup/.test(h); })());
t("2a (wording): the resolver HEADER, the home the ramp points a scriptless session at, states the KNOWN-mode canon rule with the unknown-mode anchor, and the why behind LEAN's carve-out and the judgment files riding every other boot (moved out of the index prose)", (() => { const h = readKit("templates/boot-resolver.mjs").split("import fs from")[0]; return /every other KNOWN mode carries it in LOOKUP/.test(h) && /an UNKNOWN mode keeps it as an anchor/.test(h) && /no hook can enforce a judgment behavior, so repetition is its only mechanism/.test(h) && /a trivial task writes no UI report and parks no decision/.test(h); })());
t("R2, the scenario itself (behavior): LEAN's resolver plan is three files and the lean:lookup trio plus the canon are lookups; a by-hand list that ignores the carve-out would add 7,492 chars the resolver parks", (() => { const r = resolveBoot(live, { seat: "codex", mode: "LEAN" }); const parked = r.lookup.filter((e) => /LEAN skips/.test(e.why)).map((e) => e.path); const extra = parked.filter((p) => p !== live.state.active_project).reduce((s, p) => s + charsOf(ROOT, p), 0); return r.boot.length === 3 && parked.length === 4 && extra === 7492; })());
t("R2 v2, the scenario itself (behavior): under an UNKNOWN workspace mode the live resolver keeps the canon in BOOT (7,792 chars a by-hand list that parks it would drop from the recovery path) and drops only the mode set", (() => { const r = resolveBoot(live, { seat: "codex", mode: "NOT_A_MODE" }); const c = live.state.active_project; return paths(r.boot).includes(c) && !paths(r.lookup).includes(c) && charsOf(ROOT, c) === 7792 && /not in the modes block/.test(r.problems[0]) && eq(paths(r.boot), ["CLAUDE.md", "memory/MEMORY.md", ...live.coldStart.map((e) => e.path), c]); })());

console.log(`\nboot resolver net: ${ran - fail} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
