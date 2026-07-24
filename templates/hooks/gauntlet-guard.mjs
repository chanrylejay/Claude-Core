// gauntlet-guard — makes the QA agents a HARD RULE instead of a thing Claude has to remember.
// ⚠ COPY this file into the project's .claude/hooks/ and run it from THERE. Every path it uses
// (tokens, ledgers, repo root) resolves relative to THIS file: run from Claude-Core it silently
// guards the wrong folder.
//
// Chan, Jul 13: "sometimes you forget to run impeccable and i need to remind you everytime."
// We built client-qa / net-runner / client-ux / spec-reader — but nothing FORCED Claude to invoke them,
// so the forgetting just moved up a level. A written rule ADVISES; a hook BLOCKS. This blocks.
//
// ── WHERE IT BLOCKS (Chan's design call, Jul 13) ─────────────────────────────────────────────
// "do not hard block yourself on commit... it really helps me when you commit it automatically,
//  just hard block yourself on pushing"
//   • COMMIT  → NEVER blocked. Commits are local, reversible, reach nobody. They stay free + automatic.
//   • PUSH    → hard-blocked by push-guard.mjs (unchanged) — push = Netlify deploy = LIVE to the client.
//   • "DONE"  → hard-blocked HERE. Claude cannot END ITS TURN until the review agents have actually run
//               on what it touched. This is the client's QA law made mechanical: understand → build →
//               self-review → test → regression-check → ONLY THEN mark complete.
// So quality is enforced at the moment work is DECLARED DONE, not at the moment it is saved.
//
// ── THE THREE MODES (one script, dispatched by argv[2]; wired in .claude/settings.local.json) ──
//   ui-track    PostToolUse  Edit|Write|mcp__lean-ctx__ctx_patch  → ledgers every code / UI / risk-module file Claude edits (never blocks)
//   done-wall   Stop                     → BLOCKS the turn from ending until the right agents have run
//   spec-nudge  UserPromptSubmit         → nudges spec-reader on a raw requirements dump (never blocks)
//
// ── THE TOKEN PATTERN (same as push-guard) ──
// The wall blocks unless a token exists. CLAUDE creates the token ONLY after actually running the agent:
//   .claude/GATE_OK  ← net-runner ran (type-check + lint + the regression nets for this change) → GREEN
//   .claude/UX_OK    ← client-ux reviewed the UI change (it runs the impeccable detector itself)
//   .claude/QA_OK    ← client-qa acceptance-reviewed the flood-module change
// Tokens are consumed when the turn ends cleanly. The friction lands on CLAUDE, never on Chan.
// No-vision DeepSeek runtime: run the gauntlet CHECKS inline (do NOT spawn the agent fleet) and
// create a token only after actually running that check; UX_OK stays owed to Chan's eyes.
// See Claude-Core/workflow/switch-to-deepseek.md.
//
// ── WHY THIS CAN'T LOCK CHAN OUT (the safety property) ──
// Hooks only intercept CLAUDE's tool calls. Chan commits/pushes from his OWN terminal, which no hook
// touches. Worst case a bug here blocks Claude, and Chan says "fix it". He is never locked out.
// Belt AND braces: `.claude/GAUNTLET_OFF` (any content) disables every mode instantly, and done-wall
// FAILS OPEN after MAX_NAG blocks, so the agent can never be trapped in a Stop loop.
//
// Exit codes: 0 = allow (stdout JSON may inject context), 2 = block (stderr is shown to Claude).
// NOTE (verified against code.claude.com/docs/en/hooks.md, Jul-13): there is NO `stop_hook_active`
// flag — Stop-loop protection MUST be self-tracked, which is what .gauntlet_nag does. Also: on
// UserPromptSubmit an exit 2 REJECTS AND ERASES the user's message, so spec-nudge never exits 2.
// Test (MANDATORY after any edit): _gauntlet_test.mjs in this folder, run: node _gauntlet_test.mjs

import { existsSync, unlinkSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CLAUDE_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const P = (name) => join(CLAUDE_DIR, name);

const OFF = P("GAUNTLET_OFF");
const GATE_OK = P("GATE_OK");
const UX_OK = P("UX_OK");
const QA_OK = P("QA_OK");
const CODE_TOUCHED = P("CODE_TOUCHED");
const UI_TOUCHED = P("UI_TOUCHED");
const RISK_TOUCHED = P("RISK_TOUCHED");
const NAG = P(".gauntlet_nag");
// Quick-fix streak: turns end freely and the ledger accumulates; the review fires ONCE when it closes.
const BATCH = P("BATCH");

const MAX_NAG = 3; // after this many Stop blocks, FAIL OPEN — never trap the agent

// ── file classifiers ─────────────────────────────────────────────────────
// Anything the type-checker/linter covers → net-runner must have run green before "done".
const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|css|scss|sass|less)$/i;
// Anything with pixels → client-ux (which runs the impeccable detector itself).
const UI_EXT = /\.(tsx|jsx|css|scss|sass|less|vue|svelte|html)$/i;
// The "flood modules" — the code the client FEELS when it regresses (matcher, coverage, caregiver workspace,
// Today/ops brief). A change here needs client-qa's acceptance pass, not just a green type-check.
// ⚠ ADAPT PER PROJECT: ships as NEVER-MATCH so an unadapted copy cannot nag about another
// project's paths — rewrite it for the new repo's high-risk modules. Origin-project example:
// /(lib[\\/](matchEngine|scoring|riskyFlow)|components[\\/](HighRiskArea)|app[\\/]criticalScreen)/i
const RISK_PATH = /$^/; // never-match until adapted (see example above)

// ── helpers ──────────────────────────────────────────────────────────────
function readLines(f) {
  if (!existsSync(f)) return [];
  return readFileSync(f, "utf8").split("\n").map((s) => s.trim()).filter(Boolean);
}
function addLine(f, line) {
  if (readLines(f).includes(line)) return; // dedup
  appendFileSync(f, line + "\n");
}
function consume(f) {
  if (existsSync(f)) unlinkSync(f);
}
function clearTurnState() {
  [CODE_TOUCHED, UI_TOUCHED, RISK_TOUCHED, GATE_OK, UX_OK, QA_OK, NAG].forEach(consume);
}
function emitContext(hookEventName, text) {
  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName, additionalContext: text } }),
  );
}

// ── modes ────────────────────────────────────────────────────────────────
// Every path an edit can arrive on. THIS IS THE LOAD-BEARING BIT: Claude edits this repo with lean-ctx's
// `ctx_patch` (per CLAUDE.md), NOT the native Edit/Write tools. If the hook only read `file_path`, the
// ledger would stay empty on every real edit and the whole gauntlet would be silent theatre.
//   Edit / Write → tool_input.file_path · ctx_patch → tool_input.path (the load-bearing one here).
//   notebook_path stays as a harmless fallback for if NotebookEdit is ever added to the matcher.
function editedPath(payload) {
  const ti = payload?.tool_input ?? {};
  return ti.file_path ?? ti.path ?? ti.notebook_path ?? "";
}

// Only PRODUCT code in THIS repo can gate a turn. Caught live within seconds of wiring: the hook
// ledgered a throwaway script in the OS temp scratchpad, which would then have demanded a net-runner
// pass to let the turn end — the perpetual-nag failure mode. Scope it hard.
const REPO_ROOT = join(CLAUDE_DIR, "..");
const norm = (p) => p.replace(/\\/g, "/").toLowerCase();
function outOfScope(fp) {
  const p = norm(fp);
  // never product code, even inside the repo
  if (/\/(node_modules|\.next|\.git|out|build|coverage|scratchpad|\.agents|\.impeccable)\//.test(p)) return true;
  if (/\/\.claude\/skills\//.test(p)) return true; // vendored tooling
  // an ABSOLUTE path outside this repo is somebody else's file (OS temp, another project)
  const isAbs = /^[a-z]:\//.test(p) || p.startsWith("/");
  if (isAbs && !p.startsWith(norm(REPO_ROOT) + "/")) return true;
  return false;
}

function uiTrack(payload) {
  // PostToolUse can NEVER block (the edit already happened) — only ledger + remind. Always exit 0.
  const fp = editedPath(payload);
  if (!fp || typeof fp !== "string") process.exit(0);
  if (outOfScope(fp)) process.exit(0);

  const isCode = CODE_EXT.test(fp);
  const isUI = UI_EXT.test(fp);
  const isRisk = RISK_PATH.test(fp);
  if (!isCode && !isUI && !isRisk) process.exit(0);

  if (isCode) addLine(CODE_TOUCHED, fp);
  if (isUI) addLine(UI_TOUCHED, fp);
  if (isRisk) addLine(RISK_TOUCHED, fp);

  const need = [];
  if (isCode) need.push("net-runner (type-check + lint + regression nets)");
  if (isUI) need.push("client-ux (runs the impeccable detector)");
  if (isRisk) need.push("client-qa (flood module — regression risk)");

  emitContext(
    "PostToolUse",
    `[gauntlet] tracked: ${fp}\n` +
      `Commit it freely — commits are never blocked. But BEFORE this turn can END, run: ${need.join(" · ")}.\n` +
      `The Stop hook WILL block you until then. Create the token(s) only after the agent actually runs: ` +
      `${isCode ? "`.claude/GATE_OK` " : ""}${isUI ? "`.claude/UX_OK` " : ""}${isRisk ? "`.claude/QA_OK`" : ""}`,
  );
  process.exit(0);
}

function doneWall() {
  const code = readLines(CODE_TOUCHED);
  const ui = readLines(UI_TOUCHED);
  const risk = readLines(RISK_TOUCHED);

  const needGate = code.length > 0 && !existsSync(GATE_OK);
  const needUX = ui.length > 0 && !existsSync(UX_OK);
  const needQA = risk.length > 0 && !existsSync(QA_OK);

  if (!needGate && !needUX && !needQA) {
    clearTurnState(); // clean turn — reset so nothing leaks into the next one
    process.exit(0);
  }

  // ── BATCH MODE (Chan, Jul 13) ────────────────────────────────────────────────────────────────
  // "small quick fixes (removing buttons, removing a word, change color) — do you still need to run
  //  these agents every quick fix?" No. Chan works one screenshot per message, so a per-TURN wall
  //  would run a browser agent to verify a one-word deletion. Disproportionate.
  //
  // With `.claude/BATCH` open, turns end freely and the ledger ACCUMULATES instead of clearing. When
  // the batch closes, ONE gauntlet pass reviews the FINAL state of everything touched — which is
  // strictly BETTER review than N passes over N intermediate states (it sees the screen the client sees).
  //
  // The safety property is unchanged: nothing can reach the client unreviewed, because PUSH is still
  // gated and Claude must not call a batch push-ready while files are pending.
  if (existsSync(BATCH)) {
    consume(NAG); // a batch is not a nag loop
    const pending = [...new Set([...code, ...ui, ...risk])];
    console.error(
      `[gauntlet] BATCH OPEN — ending the turn WITHOUT review (this is allowed).\n` +
        `  ${pending.length} file(s) pending review, accumulating: ${pending.join(", ")}\n` +
        `  ⛔ Do NOT tell Chan this is done/push-ready. When the batch closes (delete .claude/BATCH),\n` +
        `     the wall fires ONCE over ALL of it: ${[needGate && "net-runner", needUX && "client-ux", needQA && "client-qa"].filter(Boolean).join(" + ")}.`,
    );
    process.exit(0);
  }

  // Self-tracked loop protection (there is NO stop_hook_active flag): after MAX_NAG blocks, FAIL OPEN.
  const n = Number(readLines(NAG)[0] ?? "0") + 1;
  if (n > MAX_NAG) {
    const skipped = [needGate ? "net-runner" : null, needUX ? "client-ux" : null, needQA ? "client-qa" : null]
      .filter(Boolean)
      .join(" + ");
    clearTurnState();
    console.error(
      `[gauntlet] ⚠️ FAILING OPEN after ${MAX_NAG} blocks — allowing the stop so you are not trapped.\n` +
        `  ${skipped} did NOT run on: ${[...new Set([...code, ...ui, ...risk])].join(", ")}\n` +
        `  TELL CHAN PLAINLY, in your reply, that this work shipped WITHOUT its review pass.`,
    );
    process.exit(0);
  }
  writeFileSync(NAG, String(n));

  const todo = [];
  if (needGate) todo.push(`  • net-runner  — type-check + lint + the nets for: ${code.join(", ")}\n      → then create \`.claude/GATE_OK\``);
  if (needUX) todo.push(`  • client-ux    — design/UX + impeccable detector on: ${ui.join(", ")}\n      → then create \`.claude/UX_OK\``);
  if (needQA) todo.push(`  • client-qa    — acceptance + regression on: ${risk.join(", ")}\n      → then create \`.claude/QA_OK\``);

  console.error(
    `[gauntlet] BLOCKED (${n}/${MAX_NAG}) — you cannot call this done yet. The review gate has not run.\n` +
      todo.join("\n") +
      `\n\n  Your COMMITS were never blocked; this is only the "done" gate. The QA law: understand → build →\n` +
      `  self-review → test → regression-check → ONLY THEN mark complete. Run the agent(s), create the\n` +
      `  token(s), then finish. Never create a token without actually running the agent — that is the\n` +
      `  entire point of it. (Escape hatch, only if genuinely stuck: .claude/GAUNTLET_OFF)`,
  );
  process.exit(2);
}

function specNudge(payload) {
  // NEVER exit 2 here — on UserPromptSubmit that REJECTS AND ERASES Chan's message. Always exit 0.
  const prompt = payload?.prompt ?? "";

  // A bare client name is far too loose — it fired on Chan simply ASKING about the client-qa agent (live
  // false positive, Jul-13). Require a RELAY phrase (the client speaking THROUGH Chan), not just a name,
  // and require some bulk: a real requirements drop is never one line.
  // ⚠ ADAPT PER PROJECT: add the client's name-based relay phrases (e.g. "<name> said").
  const relay =
    /(client (said|says|wants|sent|messaged)|from the client|her message|his message|she (said|says|wants|sent)|he (said|says|wants|sent)|new message(s)? from|verbatim|absorb (it|this)|drop (it|them|the message))/i.test(
      prompt,
    );
  const longDump = prompt.length > 700;
  if (!relay && !longDump) process.exit(0);
  if (prompt.length < 100) process.exit(0); // one-liners are chat, never a spec

  emitContext(
    "UserPromptSubmit",
    "[gauntlet] This looks like raw requirements (a long dump and/or a relayed client message).\n" +
      "Before building ANY of it: run the `spec-reader` agent — it turns the words into a numbered, " +
      "buildable spec with per-clause acceptance criteria and an AMBIGUITY list, and it never answers " +
      "FOR the client. This is the ASK-DON'T-ASSUME law. If this is just conversation, ignore this and carry on.",
  );
  process.exit(0);
}

// ── entry ────────────────────────────────────────────────────────────────
const MODE = process.argv[2];

export { CODE_EXT, UI_EXT, RISK_PATH, MAX_NAG }; // for the test net

if (process.argv[1] && process.argv[1].endsWith("gauntlet-guard.mjs")) {
  let raw = "";
  try {
    for await (const chunk of process.stdin) raw += chunk;
    const payload = JSON.parse(raw.trim() || "{}");

    // Global escape hatch — one file disables the whole gauntlet.
    if (existsSync(OFF)) process.exit(0);

    if (MODE === "ui-track") uiTrack(payload);
    else if (MODE === "done-wall") doneWall();
    else if (MODE === "spec-nudge") specNudge(payload);
    else process.exit(0); // unknown mode → never interfere
  } catch (err) {
    // NOTHING here fails closed. This hook never gates a commit or a push, so a bug in it must never
    // wedge the agent mid-turn or eat Chan's prompt. The only hard gate in the repo is push-guard.
    console.error(`[gauntlet] hook error (${err?.message ?? err}) — failing OPEN (${MODE}).`);
    process.exit(0);
  }
}
