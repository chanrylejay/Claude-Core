// judgment-sample.mjs — the judgment layer's DETECTOR. Not a gate, not enforcement.
//   node templates/judgment-sample.mjs [transcriptsRoot] [--sessions N]
// Default root: ~/.claude/projects (Claude Code session transcripts, *.jsonl, any depth).
//
// WHY THIS EXISTS (audit finding, Aug 2026): nine nets cover the executable layer. The
// judgment layer — critique every directive, plain language, small slices, never claim a
// screen looks right — is covered by NOTHING except two behavioral files riding every boot.
// Meanwhile the master cost habit says keep context small. Those two rules pull opposite
// directions on the same bytes, and when the trim comes, no net goes red: prose does not
// report its own erosion. A hook cannot enforce judgment. But drift that cannot be prevented
// can still be OBSERVED, and by this kit's own principle a runner-printed count stays true
// while a count written into prose goes stale silently.
//
// HONEST LIMITS, stated up front and printed every run: these are WEAK keyword detectors.
// They flag SHAPES that often accompany a violation, not violations. A high count is a
// prompt to go read those sessions; a zero is not a certificate. They never block anything.
// The ONLY hard failure here is reading nothing at all (exit 1), because a silent zero from
// an unreadable transcript folder is precisely the false comfort this tool exists to kill.

import { readdirSync, statSync, readFileSync, appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const args = process.argv.slice(2);
const nFlag = args.indexOf("--sessions");
const LIMIT = nFlag >= 0 ? Number(args[nFlag + 1]) || 20 : 20;
// --log [path]: append one dated line of counts (batch 3b, Aug 31 2026; ../lessons/audit-log.md
// AL-23). The session ritual prints the LAST line of that log at every boot with its age, so a
// stale sample reminds instead of being forgotten. Default path: ~/.claude/judgment-log.txt.
const lFlag = args.indexOf("--log");
const LOG = lFlag >= 0 ? ((args[lFlag + 1] && !args[lFlag + 1].startsWith("--")) ? args[lFlag + 1] : join(process.env.USERPROFILE || homedir(), ".claude", "judgment-log.txt")) : null;
const ROOT = args.find((a) => !a.startsWith("--") && a !== String(LIMIT) && a !== LOG) || join(homedir(), ".claude", "projects");

// --- collect the most recent session files, any depth, tolerant of layout ---
function jsonlFiles(dir, out = []) {
  let entries = [];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e);
    let s;
    try { s = statSync(p); } catch { continue; }
    if (s.isDirectory()) jsonlFiles(p, out);
    else if (e.endsWith(".jsonl")) out.push({ p, mtime: s.mtimeMs });
  }
  return out;
}
// --- pull assistant text out of whatever shape a line carries ---
function assistantTexts(file) {
  const out = [];
  let raw = "";
  try { raw = readFileSync(file, "utf8"); } catch { return out; }
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    let o;
    try { o = JSON.parse(line); } catch { continue; }         // skip unparseable, never throw
    const msg = o.message || o;
    const role = msg.role || o.type;
    if (role !== "assistant") continue;
    const c = msg.content;
    if (typeof c === "string") out.push(c);
    else if (Array.isArray(c)) out.push(c.map((b) => (typeof b === "string" ? b : b && b.type === "text" ? b.text || "" : "")).join("\n"));
    else if (typeof msg.text === "string") out.push(msg.text);
  }
  return out;
}

// --- the weak detectors, one per behavior the unenforceable files exist to protect ---
const UI = /\b(screenshot|UI|page|screen|button|layout|design|render)\b/i;
const CLAIMED = /\b(looks (good|right|correct)|renders correctly|verified|confirmed working|looks fine)\b/i;
const SAW = /AWAITING HIS LOOK|screenshot saved|\.png\b|saved the shot/i;
// Detector v2 (batch 4a, Aug 31 2026; ../lessons/audit-log.md AL-24): v1 knew eight phrases and
// missed the kit's own pushback vocabulary; three CLI sessions that stopped on wrong checks,
// diagnosed them and waited for a ruling all logged as zero pushback. STOP is matched
// case-sensitively (the kit's keyword), so "stop the dev server" does not count.
const PUSHBACK = /\b(I'd push back|push back|I disagree|better option|I recommend against|worth challenging|my honest|I'd argue|instead of that|reads wrong|reading was wrong|not drift|your call|stopping here|I'm flagging|propose better|I'd hold|held before)\b/i;
const PUSHBACK_CS = /\bSTOP\b/;
const DET = 2; // bump when the shapes change; the log line carries it so a count jump is explained
const DONE = /\b(done|shipped|complete|all set|finished)\b/i;
const COUNTS = /\d+\s+(passed|failed|pins?|files?|chars?)|\bexit 0\b|\bPASS\b/;
const STRUCTURE = /^\s*([-*]|\d+\.|#{1,6}\s)/m;

const files = jsonlFiles(ROOT).sort((a, b) => b.mtime - a.mtime).slice(0, LIMIT);
let sessions = 0, msgs = 0;
const hits = { claimed_without_eyes: [], execution_streak_no_pushback: [], wall_of_text: [], done_without_evidence: [] };

for (const f of files) {
  const texts = assistantTexts(f.p);
  if (!texts.length) continue;
  sessions++; msgs += texts.length;
  const name = f.p.split(/[\\/]/).slice(-2).join("/");
  let pushbacks = 0;
  for (const t of texts) {
    if (UI.test(t) && CLAIMED.test(t) && !SAW.test(t)) hits.claimed_without_eyes.push(name);
    if (PUSHBACK.test(t) || PUSHBACK_CS.test(t)) pushbacks++;
    if (t.length > 2500 && !STRUCTURE.test(t)) hits.wall_of_text.push(name);
    if (DONE.test(t) && !COUNTS.test(t) && t.length > 400) hits.done_without_evidence.push(name);
  }
  if (texts.length >= 8 && pushbacks === 0) hits.execution_streak_no_pushback.push(name);
}

if (!sessions) {
  console.log(`judgment sampler: read NOTHING under ${ROOT}`);
  console.log("  A silent zero is the false comfort this tool exists to kill, so this is a FAILURE.");
  console.log("  Pass the right root explicitly: node templates/judgment-sample.mjs <path-to-transcripts>");
  process.exit(1);
}

const LABEL = {
  claimed_without_eyes: "claimed a screen looked right without saving/awaiting the shot (hard rule 1)",
  execution_streak_no_pushback: "whole session executed with zero recorded pushback (critique-directives)",
  wall_of_text: "2.5K+ unstructured reply (review-bottleneck: plain language, small slices)",
  done_without_evidence: "claimed done with no counts, PASS, or exit code beside it",
};
console.log(`judgment sampler: ${sessions} session(s), ${msgs} assistant message(s), root ${ROOT}`);
for (const k of Object.keys(hits)) {
  const list = hits[k];
  const where = [...new Set(list)].slice(0, 3).join(", ");
  console.log(`  ${String(list.length).padStart(3)}  ${LABEL[k]}${list.length ? "  [" + where + (new Set(list).size > 3 ? ", …" : "") + "]" : ""}`);
}
if (LOG) {
  const day = new Date().toISOString().slice(0, 10);
  const line = `${day} det=${DET} sessions=${sessions} msgs=${msgs} ` + Object.keys(hits).map((k) => `${k}=${hits[k].length}`).join(" ");
  mkdirSync(join(LOG, ".."), { recursive: true });
  appendFileSync(LOG, line + "\n");
  console.log("  logged: " + LOG);
}
console.log("  WEAK SIGNALS, not verdicts: these flag shapes that often accompany a violation.");
console.log("  A count going UP over weeks is the erosion signal; a zero certifies nothing. Nothing here blocks.");
process.exit(0);
