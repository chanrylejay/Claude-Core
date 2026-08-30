// _rawread_test.mjs — net for raw-read.mjs. Run from templates/:  node _rawread_test.mjs
// Pins: verbatim bytes (CRLF survives), --lines / --head / --tail slices, a missing file is
// named and exits 1, several files in one call. Fixtures live in a temp dir, never on disk here.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(HERE, "raw-read.mjs");
let fail = 0, ran = 0;
const t = (n, c) => { ran++; if (c) console.log("  ok  " + n); else { fail++; console.log("FAIL  " + n); } };
const run = (...a) => spawnSync(process.execPath, [SCRIPT, ...a], { encoding: "utf8" });

const D = fs.mkdtempSync(path.join(os.tmpdir(), "rawread-"));
const A = path.join(D, "a.md"), B = path.join(D, "b.txt");
fs.writeFileSync(A, "one\r\ntwo\r\nthree \"quoted\"\r\nfour\r\n");
fs.writeFileSync(B, "x\ny\n");

let r = run(A);
t("prints the file verbatim, CRLF intact", r.status === 0 && r.stdout.includes("one\r\ntwo\r\nthree \"quoted\"\r\nfour"));
t("BEGIN/END markers name the file and the line span", /===== BEGIN .*a\.md \(lines 1-4 of 4\) =====/.test(r.stdout) && /===== END .*a\.md =====/.test(r.stdout));
r = run(A, "--lines", "2-3");
t("--lines A-B slices inclusively", r.stdout.includes("two\r\nthree") && !r.stdout.includes("one\r\n") && !r.stdout.includes("four"));
r = run(A, "--head", "1");
t("--head N", r.stdout.includes("one") && !r.stdout.includes("two"));
r = run(A, "--tail", "1");
t("--tail N", r.stdout.includes("four") && !r.stdout.includes("three"));
r = run(A, B);
t("several files in one call, in order", r.stdout.indexOf("a.md") < r.stdout.indexOf("b.txt") && r.stdout.includes("x\ny"));
r = run(A, path.join(D, "nope.md"));
t("a missing file is named MISSING and the run exits 1 (name every read that failed)", r.status === 1 && /===== MISSING .*nope\.md =====/.test(r.stdout) && r.stdout.includes("one"));
r = run();
t("no arguments: usage on stderr, exit 1", r.status === 1 && /usage/.test(r.stderr));

fs.rmSync(D, { recursive: true, force: true });
console.log(`\nraw-read net: ${ran - fail} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
