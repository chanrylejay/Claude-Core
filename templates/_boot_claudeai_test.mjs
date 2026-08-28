// _boot_claudeai_test.mjs — net for boot-claudeai.mjs. Run from templates/:
//   node _boot_claudeai_test.mjs
// MANDATORY after editing boot-claudeai.mjs or the frontmatter shapes it parses
// (state / cold_start / modes in memory/MEMORY.md). Pins (mutations run against a TEMP COPY,
// never the working tree):
//   1. intact kit boots: exit 0
//   2. output carries the freshness signal (CLONE HEAD)
//   3. default mode resolves from the state block (mode_default)
//   4. --mode override resolves that mode's set
//   5. unknown --mode fails loudly: exit 1
//   6. a mode file deleted from disk fails the boot: exit 1, file named MISSING
//   7. cold_start stripped from the frontmatter fails the boot: exit 1
//   8. no file appears twice in the ordered list (dedup pin)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let fail = 0, ran = 0;
const t = (n, c) => { ran++; if (c) console.log("  ok  " + n); else { fail++; console.log("FAIL  " + n); } };

const run = (cwd, args = []) => {
  try {
    return { code: 0, out: execFileSync("node", [path.join(cwd, "templates/boot-claudeai.mjs"), ...args], { cwd }).toString() };
  } catch (e) {
    return { code: e.status ?? 1, out: ((e.stdout || "") + (e.stderr || "")).toString() };
  }
};

// temp copy of the kit (files only; .git omitted on purpose — pin 1 also proves the
// git-unavailable branch stays non-fatal, degraded-honest)
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "bootnet-"));
fs.cpSync(ROOT, TMP, { recursive: true, filter: (s) => !s.includes(path.sep + ".git" + path.sep) && !s.endsWith(path.sep + ".git") });

// 1-4, 8 on the intact copy
const ok = run(TMP);
t("intact kit exits 0", ok.code === 0);
t("freshness signal present (CLONE HEAD)", /CLONE HEAD:/.test(ok.out));
const fm = fs.readFileSync(path.join(TMP, "memory/MEMORY.md"), "utf8");
const wantDefault = (fm.match(/mode_default:\s*(\S+)/) || [])[1];
t(`default mode resolves from state block (${wantDefault})`, new RegExp("MODE RESOLVED: " + wantDefault).test(ok.out));
const firstMode = (fm.match(/\nmodes:[\s\S]*?\n  (\w+):/) || [])[1];
const over = run(TMP, ["--mode=" + firstMode]);
t(`--mode override resolves (${firstMode})`, over.code === 0 && new RegExp("MODE RESOLVED: " + firstMode + " \\(override\\)").test(over.out));
const listed = [...ok.out.matchAll(/^\s+\d+\.\s+(?:MISSING )?(\S+)/gm)].map((m) => m[1]);
t("no file listed twice (dedup)", new Set(listed).size === listed.length && listed.length > 0);

// 5. unknown mode
const bad = run(TMP, ["--mode=NO_SUCH_MODE"]);
t("unknown mode exits 1 and says so", bad.code === 1 && /not in the modes block/.test(bad.out));

// 6. delete a mode file → MISSING + exit 1 (mutate the temp copy). The victim MUST come from
// the DEFAULT run's own resolved list — a file from an unresolved mode is invisible to the
// boot and proves nothing (this net's first catch was its own first draft doing exactly that).
const victim = ([...ok.out.matchAll(/^\s+\d+\.\s+(\S+)\s+\(mode: /gm)].map((m) => m[1]))[0];
fs.rmSync(path.join(TMP, victim));
const miss = run(TMP);
t(`deleted mode file (${victim}) fails: exit 1 + named MISSING`, miss.code === 1 && miss.out.includes("MISSING " + victim));
fs.cpSync(path.join(ROOT, victim), path.join(TMP, victim)); // restore

// 7. strip cold_start
fs.writeFileSync(path.join(TMP, "memory/MEMORY.md"), fm.replace(/\ncold_start:[\s\S]*?(?=\nmodes:)/, "\n"));
const nocold = run(TMP);
t("stripped cold_start fails: exit 1", nocold.code === 1 && /cold_start/.test(nocold.out));

fs.rmSync(TMP, { recursive: true, force: true });
console.log(`\nboot net: ${ran - fail} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
