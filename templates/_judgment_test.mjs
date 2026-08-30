// _judgment_test.mjs — net for judgment-sample.mjs. Run from templates/:
//   node _judgment_test.mjs
// MANDATORY after any edit to judgment-sample.mjs. Builds synthetic transcript folders in
// tmp (three shapes Claude Code has used: content-as-string, content-as-blocks, and a
// message wrapper), proves each weak detector fires on the shape it targets and stays quiet
// on a clean session, and proves the ONLY hard failure — reading nothing — exits 1.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(HERE, "judgment-sample.mjs");
let fail = 0, ran = 0;
const t = (n, c) => { ran++; if (c) console.log("  ok  " + n); else { fail++; console.log("FAIL  " + n); } };

const ROOT = path.join(os.tmpdir(), "judgment-net");
const mk = (name, lines) => {
  const d = path.join(ROOT, name);
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, "session.jsonl"), lines.map((l) => JSON.stringify(l)).join("\n") + "\n");
};
const A = (text) => ({ role: "assistant", content: text });                       // plain string
const Ablocks = (text) => ({ role: "assistant", content: [{ type: "text", text }] }); // block array
const Awrapped = (text) => ({ type: "assistant", message: { role: "assistant", content: text } });
const run = (root, extra = []) => spawnSync(process.execPath, [SCRIPT, root, ...extra], { encoding: "utf8" });
const count = (out, label) => {
  const line = out.split("\n").find((l) => l.includes(label));
  return line ? Number(line.trim().split(/\s+/)[0]) : -1;
};

fs.rmSync(ROOT, { recursive: true, force: true });

// clean session: eight structured, evidenced, pushback-carrying messages → all zeros
mk("clean", Array.from({ length: 8 }, (_, i) =>
  A(`- step ${i}\n- I'd push back on that: a smaller slice is safer.\n- net: 12 passed, 0 failed`)));
let r = run(ROOT);
t("clean session parses and exits 0", r.status === 0 && /1 session/.test(r.stdout));
t("clean session flags nothing", ["claimed a screen", "zero recorded pushback", "unstructured reply", "no counts"].every((l) => count(r.stdout, l) === 0));

// detector 1: claimed a screen looked right, no shot
fs.rmSync(ROOT, { recursive: true, force: true });
mk("eyes", [Ablocks("The layout looks good now, the button renders correctly."), A("- I'd push back here\n- 3 passed")]);
r = run(ROOT);
t("detects a screen claim with no saved/awaited shot", count(r.stdout, "claimed a screen") === 1);
mk("eyes-ok", [Ablocks("The layout looks good — screenshot saved to out.png, AWAITING HIS LOOK."), A("- ok\n- 3 passed")]);
r = run(ROOT);
t("the same claim WITH the shot is not flagged", count(r.stdout, "claimed a screen") === 1);

// detector 2: an execution streak with zero pushback (needs >= 8 assistant messages)
fs.rmSync(ROOT, { recursive: true, force: true });
mk("streak", Array.from({ length: 9 }, (_, i) => Awrapped(`- did step ${i} exactly as asked\n- 2 passed`)));
r = run(ROOT);
t("detects a whole session with zero recorded pushback", count(r.stdout, "zero recorded pushback") === 1);
t("the wrapped message shape parses too", /9 assistant message/.test(r.stdout));

// detector 3: wall of text, unstructured
fs.rmSync(ROOT, { recursive: true, force: true });
mk("wall", [A("word ".repeat(700)), A("- I'd push back\n- 1 passed")]);
r = run(ROOT);
t("detects a 2.5K+ unstructured reply", count(r.stdout, "unstructured reply") === 1);
mk("wall-ok", [A("- bullet\n" + "word ".repeat(700)), A("- I'd push back\n- 1 passed")]);
r = run(ROOT);
t("the same length WITH structure is not flagged", count(r.stdout, "unstructured reply") === 1);

// detector 4: done with no evidence beside it
fs.rmSync(ROOT, { recursive: true, force: true });
mk("done", [A("All set and shipped. " + "prose ".repeat(90)), A("- I'd push back\n- 1 passed")]);
r = run(ROOT);
t("detects a done claim carrying no counts or PASS", count(r.stdout, "no counts") === 1);
mk("done-ok", [A("All set and shipped: 22 passed, 0 failed. " + "prose ".repeat(90)), A("- ok\n- 1 passed")]);
r = run(ROOT);
t("the same claim WITH counts is not flagged", count(r.stdout, "no counts") === 1);

// tolerance + the one hard failure
fs.rmSync(ROOT, { recursive: true, force: true });
mk("junk", [A("- fine\n- 1 passed")]);
fs.appendFileSync(path.join(ROOT, "junk", "session.jsonl"), "{not json at all\n\n");
r = run(ROOT);
t("unparseable lines are skipped, never thrown", r.status === 0 && /1 session/.test(r.stdout));
r = run(path.join(os.tmpdir(), "judgment-net-does-not-exist"));
t("reading NOTHING is the one hard failure (exit 1)", r.status === 1 && /read NOTHING/.test(r.stdout));
t("the failure names how to pass the right root", /node templates\/judgment-sample\.mjs <path/.test(r.stdout));
t("every run prints the weak-signal caveat", /WEAK SIGNALS, not verdicts/.test(run(ROOT === null ? "." : path.join(os.tmpdir(), "judgment-net")).stdout || ""));

// --log (batch 3b): one dated line of counts per run, appended; the ritual reads the last line
const LOGF = path.join(os.tmpdir(), "judgment-net-log", "judgment-log.txt");
fs.rmSync(path.dirname(LOGF), { recursive: true, force: true });
r = run(ROOT, ["--log", LOGF]);
const logTxt = fs.existsSync(LOGF) ? fs.readFileSync(LOGF, "utf8") : "";
t("--log <path> writes one dated line with every counter", r.status === 0 && /^\d{4}-\d{2}-\d{2} sessions=\d+ msgs=\d+ claimed_without_eyes=\d+ execution_streak_no_pushback=\d+ wall_of_text=\d+ done_without_evidence=\d+\n$/.test(logTxt));
t("--log says where it wrote", /logged: /.test(r.stdout));
run(ROOT, ["--log", LOGF]);
t("a second run APPENDS (two lines), never overwrites", fs.readFileSync(LOGF, "utf8").split("\n").filter(Boolean).length === 2);
fs.rmSync(path.dirname(LOGF), { recursive: true, force: true });

fs.rmSync(ROOT, { recursive: true, force: true });
console.log("\njudgment sampler: " + (fail ? fail + " FAILED of " + ran : ran + " passed, 0 failed"));
process.exit(fail ? 1 : 0);
