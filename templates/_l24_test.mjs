// _l24_test.mjs — net for the L24 audit script. Run: node _l24_test.mjs (from templates/).
// MANDATORY after any edit to _l24_audit.mjs or to the class list in the law's home
// (lessons/universal-patterns.md, "Maintaining documents") — the sync pin below is the ONE
// guard on that pairing.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(HERE, "_l24_audit.mjs");
const LAW = path.join(HERE, "..", "lessons", "universal-patterns.md");
let fail = 0, ran = 0;
const t = (n, c) => { ran++; if (c) console.log("  ok  " + n); else { fail++; console.log("FAIL  " + n); } };

// SYNC PIN: every class named in the law's floor list must have a matching regex family here.
const lawTxt = fs.readFileSync(LAW, "utf8");
const src = fs.readFileSync(SCRIPT, "utf8");
for (const [name, probe] of [["numbers", "numbers, percents"], ["dates", "Jan|Feb"],
  ["URLs", "urls"], ["file paths", "file paths"], ["CamelCase", "CamelCase"],
  ["SCREAMING_SNAKE", "SCREAMING_SNAKE"], ["kebab-case", "kebab-case"],
  ["snake_case", "snake_case"], ["versions", "versions"], ["quoted literals", "quoted literals"],
  ["money", "money"], ["modals", "modals/negations"]]) {
  t("law class covered in script: " + name, src.includes(probe));
}
t("the law's floor names modals too (added Aug 2026)", /modal|negation|"never"|\bunless\b/i.test(lawTxt));

// BEHAVIOUR: sandbox repo, plant old/new, assert triage classes and exit codes.
const SB = path.join(os.tmpdir(), "l24-test-repo");
fs.rmSync(SB, { recursive: true, force: true });
fs.mkdirSync(SB, { recursive: true });
const g = (...a) => execFileSync("git", a, { cwd: SB, encoding: "utf8" });
g("init", "-q"); g("config", "user.email", "t@t"); g("config", "user.name", "t");
fs.writeFileSync(path.join(SB, "doc.md"), "Deploy uses API_KEY_MAIN at https://x.example and never on Fridays. Budget $4.50, v2.1.3.\n");
fs.writeFileSync(path.join(SB, "other.md"), "spare home\n");
g("add", "."); g("commit", "-qm", "base");
const run = () => spawnSync(process.execPath, [SCRIPT, "doc.md"], { cwd: SB, encoding: "utf8" });

// unchanged → PASS
let r = run();
t("unchanged file passes, exit 0", r.status === 0 && /PASS/.test(r.stdout));
// relocate a token to another file → still PASS, counted relocated
fs.writeFileSync(path.join(SB, "doc.md"), "Deploy uses the main key at https://x.example and never on Fridays. Budget $4.50, v2.1.3.\n");
fs.writeFileSync(path.join(SB, "other.md"), "spare home API_KEY_MAIN\n");
r = run();
t("relocated token passes", r.status === 0 && /1 relocated/.test(r.stdout));
// drop the modal "never" → LOST, exit 1 (the condition-drop class)
fs.writeFileSync(path.join(SB, "doc.md"), "Deploy uses the main key at https://x.example on Fridays. Budget $4.50, v2.1.3.\n");
r = run();
t("a dropped modal FAILS the audit", r.status === 1 && /LOST: "never"/i.test(r.stdout));
t("failure names the restore-or-OK rule", /Chan's explicit OK/.test(r.stdout));
// money + version loss detected
fs.writeFileSync(path.join(SB, "doc.md"), "Deploy uses the main key at https://x.example and never on Fridays.\n");
r = run();
t("money and version losses are caught", /\$4\.50/.test(r.stdout) && /2\.1\.3/.test(r.stdout) && r.status === 1);
// CRLF pins (Aug 24 2026, the CLI's false-LOST reproduced): a Windows-style CRLF worktree
// over an LF blob must not false-LOST a line-wrapping quoted literal — and normalization must
// not hide a REAL deletion of that same literal.
fs.writeFileSync(path.join(SB, "doc.md"), 'wrapped "cannot\nrun code, or push" stays, budget $4.50, v2.1.3, never.\n');
g("add", "."); g("commit", "-qm", "wrapped");
fs.writeFileSync(path.join(SB, "doc.md"), 'wrapped "cannot\r\nrun code, or push" stays, budget $4.50, v2.1.3, never.\r\n');
r = run();
t("CRLF worktree over LF blob: wrapped quote is NOT lost", r.status === 0 && /PASS/.test(r.stdout));
fs.writeFileSync(path.join(SB, "doc.md"), 'wrapped quote gone, budget $4.50, v2.1.3, never.\r\n');
r = run();
t("normalization does not hide a REAL deletion of the wrapped quote", r.status === 1 && /LOST/.test(r.stdout));
fs.rmSync(SB, { recursive: true, force: true });

console.log("\nl24 audit script: " + (fail ? fail + " FAILED of " + ran : ran + " passed, 0 failed"));
process.exit(fail ? 1 : 0);
