// _boot_claudeai_test.mjs — net for boot-claudeai.mjs. Run from templates/:
//   node _boot_claudeai_test.mjs
// MANDATORY after editing boot-claudeai.mjs or the frontmatter shapes it parses
// (state / cold_start / modes / lookup / boot in memory/MEMORY.md). Pins (mutations run
// against a TEMP COPY, never the working tree):
//   1. intact kit boots: exit 0
//   2. output carries the freshness signal (CLONE HEAD)
//   3. default mode resolves from the state block (mode_default)
//   4. --mode override resolves that mode's set
//   5. unknown --mode fails loudly: exit 1
//   6. a mode file deleted from disk fails the boot: exit 1, file named MISSING
//   7. cold_start stripped from the frontmatter fails the boot: exit 1
//   8. no file appears twice across BOOT + LOOKUP (a lookup file in BOOT is a fail)
//   9. the relay ramp is in BOOT and precedes the index (it says "read this first")
//  10. LOOKUP is printed, non-empty, every lookup file exists (batch 1, Aug 30 2026; AL-20)
//  11. BOOT SET carries the count and it equals the sum of the BOOT files' CRLF-normalized chars
//  12. BOOT SET is within boot.budget_chars — THE red line for boot bloat
//  13. mutation: budget set below the count → still exit 0, prints OVER BUDGET (boot survives)
//  14. mutation: a LOOKUP file deleted → exit 1 + named MISSING (fail-closed)
//  15. mutation: state.updated set to 2026-01-01 → STALE printed
//  16. LEAN resolves and its BOOT SET is smaller than the default mode's
//  17. the active canon is in BOOT for the default mode and in LOOKUP for LEAN
//  18. the three lean:lookup judgment files ride BOOT normally and LOOKUP under LEAN (batch 4b)
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
// split the printed lists: everything before the LOOKUP header is BOOT
const lists = (out) => {
  const i = out.indexOf("\nLOOKUP");
  const rx = () => /^\s+\d+\.\s+(?:MISSING )?(\S+)/gm;
  const pick = (s) => [...s.matchAll(rx())].map((m) => m[1]);
  return { boot: pick(i < 0 ? out : out.slice(0, i)), look: i < 0 ? [] : pick(out.slice(i)) };
};
const bootSet = (out) => Number((out.match(/^BOOT SET: (\d+) chars/m) || [])[1]);

// temp copy of the kit (files only; .git omitted on purpose — pin 1 also proves the
// git-unavailable branch stays non-fatal, degraded-honest)
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "bootnet-"));
fs.cpSync(ROOT, TMP, { recursive: true, filter: (s) => !s.includes(path.sep + ".git" + path.sep) && !s.endsWith(path.sep + ".git") });
const IDX = path.join(TMP, "memory/MEMORY.md");
const fm = fs.readFileSync(IDX, "utf8");
const restore = () => fs.writeFileSync(IDX, fm);

// 1-4, 8-12, 17 on the intact copy
const ok = run(TMP);
t("intact kit exits 0", ok.code === 0);
t("freshness signal present (CLONE HEAD)", /CLONE HEAD:/.test(ok.out));
const wantDefault = (fm.match(/mode_default:\s*(\S+)/) || [])[1];
t(`default mode resolves from state block (${wantDefault})`, new RegExp("MODE RESOLVED: " + wantDefault).test(ok.out));
const firstMode = (fm.match(/\nmodes:[\s\S]*?\n  (\w+):/) || [])[1];
const over = run(TMP, ["--mode=" + firstMode]);
t(`--mode override resolves (${firstMode})`, over.code === 0 && new RegExp("MODE RESOLVED: " + firstMode + " \\(override\\)").test(over.out));
const L = lists(ok.out);
const all = [...L.boot, ...L.look];
t("no file listed twice across BOOT + LOOKUP (dedup)", new Set(all).size === all.length && all.length > 0);
const RAMP = "workflow/relay-boot-claudeai.md";
t("relay ramp is in BOOT and precedes the index", L.boot.includes(RAMP) && L.boot.indexOf(RAMP) < L.boot.indexOf("memory/MEMORY.md"));
t("LOOKUP printed, non-empty, every file exists", L.look.length > 0 && L.look.every((p) => fs.existsSync(path.join(TMP, p))));
const chars = (p) => fs.readFileSync(path.join(TMP, p), "utf8").replace(/\r\n/g, "\n").length; // same rule as the script
const sum = L.boot.reduce((s, p) => s + chars(p), 0);
t(`BOOT SET count equals the sum of BOOT file chars, CRLF-normalized (${sum})`, bootSet(ok.out) === sum);
const budget = Number((fm.match(/budget_chars:\s*(\d+)/) || [])[1]);
t(`BOOT SET within boot.budget_chars (${sum} <= ${budget})`, budget > 0 && sum <= budget);
const canon = (fm.match(/active_project:\s*(\S+)/) || [])[1];
const lean = run(TMP, ["--mode=LEAN"]);
const LL = lists(lean.out);
t("LEAN resolves and boots smaller than the default mode", lean.code === 0 && bootSet(lean.out) < bootSet(ok.out));
t("active canon: in BOOT for the default mode, in LOOKUP for LEAN", L.boot.includes(canon) && LL.look.includes(canon) && !LL.boot.includes(canon));
const STAR = [...fm.matchAll(/^\s+- (\S+)\s+# lean:lookup/gm)].map((m) => m[1]);
t(`lean:lookup files (${STAR.length}) ride BOOT in the default mode and LOOKUP under LEAN`, STAR.length === 3 && STAR.every((p) => L.boot.includes(p) && LL.look.includes(p) && !LL.boot.includes(p)));

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

// 14. delete a LOOKUP file → fail-closed the same way
const lv = L.look[0];
fs.rmSync(path.join(TMP, lv));
const lmiss = run(TMP);
t(`deleted LOOKUP file (${lv}) fails: exit 1 + named MISSING`, lmiss.code === 1 && lmiss.out.includes("MISSING " + lv));
fs.cpSync(path.join(ROOT, lv), path.join(TMP, lv)); // restore

// 13. budget below the count → boot survives, OVER BUDGET printed
fs.writeFileSync(IDX, fm.replace(/budget_chars:\s*\d+/, "budget_chars: 1000"));
const tight = run(TMP);
t("budget below count: exit 0 and OVER BUDGET printed (boot survives, net is the red line)", tight.code === 0 && /OVER BUDGET/.test(tight.out));
restore();

// 15. old state block → STALE
fs.writeFileSync(IDX, fm.replace(/updated:\s*\S+/, "updated: 2026-01-01"));
const old = run(TMP);
t("state.updated older than 14 days prints STALE", old.code === 0 && /STALE/.test(old.out));
restore();

// 7. strip cold_start
fs.writeFileSync(IDX, fm.replace(/\ncold_start:[\s\S]*?(?=\nmodes:)/, "\n"));
const nocold = run(TMP);
t("stripped cold_start fails: exit 1", nocold.code === 1 && /cold_start/.test(nocold.out));
restore();

fs.rmSync(TMP, { recursive: true, force: true });
console.log(`\nboot net: ${ran - fail} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
