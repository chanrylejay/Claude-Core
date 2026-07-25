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
//   ui-track    PostToolUse  Edit|Write|mcp__lean-ctx__ctx_patch  → ledgers every file matching CODE_EXT / UI_EXT / RISK_PATH (see the classifiers below; adapt them per project or the wall is blind here) (never blocks)
//   done-wall   Stop                     → BLOCKS the turn from ending until the right agents have run
//   spec-nudge  UserPromptSubmit         → nudges spec-reader on a raw requirements dump (never blocks)
//
// ── THE TOKEN PATTERN (same as push-guard) ──
// The wall blocks unless a token exists. CLAUDE creates the token ONLY after actually running the agent:
//   .claude/GATE_OK  ← net-runner ran (type-check + lint + the regression nets for this change) → GREEN
//   .claude/UX_OK    ← client-ux reviewed the UI change (it runs the impeccable detector itself)
//   .claude/UX_SHOT  no-vision runtime ONLY: the UI screenshot was SAVED to a file for Chan; clears the UX wall WITHOUT claiming a visual pass (the verdict stays owed to Chan's eyes)
//   .claude/QA_OK    ← client-qa acceptance-reviewed the flood-module change
// Tokens are consumed when the turn ends cleanly. The friction lands on CLAUDE, never on Chan.
// No-vision DeepSeek runtime: run the gauntlet CHECKS inline (do NOT spawn the agent fleet) and
// create a token only after actually running that check; UX_OK stays owed to Chan's eyes.
// See Claude-Core/workflow/switch-to-deepseek.md.
//
// ── WHY THIS CAN'T LOCK CHAN OUT (the safety property) ──
// Hooks only intercept CLAUDE's tool calls. Chan commits/pushes from his OWN terminal, which no hook
// touches. Worst case a bug here blocks Claude, and Chan says "fix it". He is never locked out.
// GAUNTLET_OFF is CHAN'S FILE. Claude NEVER creates or restores it — if genuinely stuck, say so in
// one line and ask him for it by name. Same rule as the push token. If it already exists, say so in
// the turn report before claiming anything is done.
// Belt AND braces: `.claude/GAUNTLET_OFF` (any content) disables every mode instantly, and done-wall
// FAILS OPEN after MAX_NAG blocks, so the agent can never be trapped in a Stop loop.
//
// Exit codes: 0 = allow (stdout JSON may inject context), 2 = block (stderr is shown to Claude). ⚠ On exit 0 the DOCUMENTED channel is stdout JSON via
// emitContext(); stderr may or may not reach the model. The two exit-0 disclosures below (the
// fail-open notice and the BATCH warning) are written to stderr, so they are best-effort. What
// makes the FAIL-OPEN one reliable is that it does not clear the touched ledger, so the wall
// fires again next turn and re-states it on the exit-2 path, which IS documented.
// That compensation does NOT hold for the BATCH branch: it sits above the nag counter and exits
// 0 on every turn, so exit 2 is unreachable for the entire life of the batch (audit Jul 25 2026 —
// I wrote the compensation claim an hour before it was caught, and it covered a path it does not
// reach). The BATCH branch therefore emits on BOTH channels, stdout JSON included.
// NOTE (verified against code.claude.com/docs/en/hooks.md, Jul-13): there is NO `stop_hook_active`
// flag — Stop-loop protection MUST be self-tracked, which is what .gauntlet_nag does. Also: on
// UserPromptSubmit an exit 2 REJECTS AND ERASES the user's message, so spec-nudge never exits 2.
// Test (MANDATORY after any edit): _gauntlet_test.mjs in this folder, run: node _gauntlet_test.mjs

import { existsSync, unlinkSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CLAUDE_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const P = (name) => join(CLAUDE_DIR, name);

const OFF = P("GAUNTLET_OFF");
const GATE_OK = P("GATE_OK");
const UX_OK = P("UX_OK");
const UX_SHOT = P("UX_SHOT");
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
// ⚠ ADAPT PER PROJECT: ships JS/TS-only. In a Python, Go, Ruby, Java, PHP, SQL or shell repo this
// matches NOTHING, the ledger stays empty, and the done-wall reports clean while never having seen
// a single edit. Add this repo's languages (.py .go .rb .java .php .sql .sh .html) before relying
// on the wall — a gate that cannot see the work is the silent theatre this file warns about.
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
  [CODE_TOUCHED, UI_TOUCHED, RISK_TOUCHED, GATE_OK, UX_OK, UX_SHOT, QA_OK, NAG].forEach(consume);
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

  // New work INVALIDATES the token for its own track. Without this, a token created earlier in
  // the turn covered every file edited after it (audit Jul 25 2026): run the agent, create the
  // token, then edit three more files, and the wall let the turn end with those three unchecked.
  // A token attests to the state the agent actually saw, never to a later one.
  if (isCode) { addLine(CODE_TOUCHED, fp); consume(GATE_OK); }
  if (isUI) { addLine(UI_TOUCHED, fp); consume(UX_OK); consume(UX_SHOT); }
  if (isRisk) { addLine(RISK_TOUCHED, fp); consume(QA_OK); }

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

// The ledger only sees edits made through Edit / Write / ctx_patch. A file changed through the
// shell — sed -i, a formatter, codegen, git checkout, an applied patch — never reaches uiTrack, so
// the ledger reads empty and the turn looks clean over unreviewed work (audit Jul 25 2026). Ask
// git what actually changed and fold that in. Best-effort by design: no repo, no git, or any
// failure just leaves the ledger as it was, because this hook must never wedge a turn.
function gitChanged() {
  try {
    const out = execSync("git status --porcelain --untracked-files=all", {
      cwd: join(CLAUDE_DIR, ".."), encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 4000,
    });
    return out.split("\n").map((l) => l.slice(3).trim()).filter(Boolean)
      .map((p) => join(join(CLAUDE_DIR, ".."), p.replace(/^"|"$/g, "")))
      .filter((p) => !outOfScope(p));
  } catch {
    return [];
  }
}

function doneWall() {
  for (const fp of gitChanged()) {
    if (CODE_EXT.test(fp)) addLine(CODE_TOUCHED, fp);
    if (UI_EXT.test(fp)) addLine(UI_TOUCHED, fp);
    if (RISK_PATH.test(fp)) addLine(RISK_TOUCHED, fp);
  }
  const code = readLines(CODE_TOUCHED);
  const ui = readLines(UI_TOUCHED);
  const risk = readLines(RISK_TOUCHED);

  const needGate = code.length > 0 && !existsSync(GATE_OK);
  const needUX = ui.length > 0 && !existsSync(UX_OK) && !existsSync(UX_SHOT);
  const needQA = risk.length > 0 && !existsSync(QA_OK);

  // A UX_SHOT is a DEFERRAL, not a pass: the screenshot is saved and handed over, and Chan's
  // verdict is still owed. Clearing the turn state here would delete UI_TOUCHED and the wall
  // would never fire again — the same cancellation the fail-open branch was patched to stop
  // (audit Jul 25 2026, found the same day the UX_SHOT marker shipped).
  const uxDeferred = ui.length > 0 && !existsSync(UX_OK) && existsSync(UX_SHOT);
  if (!needGate && !needUX && !needQA) {
    if (uxDeferred) {
      consume(NAG);
      console.error(
        "[gauntlet] UX verdict still OWED on: " + ui.join(", ") + "\n" +
          "  The screenshot was saved and handed to Chan; he has not given CLEAN / POLISH / VIOLATIONS yet.\n" +
          "  Do NOT call this verified or done. The ledger is kept and this fires again next turn.\n" +
          "  It clears only when Chan answers and you create .claude/UX_OK.",
      );
      process.exit(0);
    }
    clearTurnState(); // genuinely clean turn — reset so nothing leaks into the next one
    process.exit(0);
  }

  // ── BATCH MODE (Chan, Jul 13) ────────────────────────────────────────────────────────────────
  // "small quick fixes (removing buttons, removing a word, change color) — do you still need to run
  //  these agents every quick fix?" No. Chan works one screenshot per message, so a per-TURN wall
  //  would run a browser agent to verify a one-word deletion. Disproportionate.
  //
  // `.claude/BATCH` is opened by CHAN ONLY (he says "batch of quick fixes"). Claude never creates it,
  // and closes it the moment he says the batch is done. A batch covers same-session fixes of a few
  // lines each; anything larger, or a new file, closes it immediately.
  // With `.claude/BATCH` open, turns end freely and the ledger ACCUMULATES instead of clearing. When
  // the batch closes, ONE gauntlet pass reviews the FINAL state of everything touched — which is
  // strictly BETTER review than N passes over N intermediate states (it sees the screen the client sees).
  //
  // What BATCH actually costs: committed work sits unreviewed. Push is gated ONLY if push-guard.mjs
  // is really wired in THIS project (verify it exists; this template cannot check for you), and Chan
  // pushes from his own terminal, which no hook touches. So name the open batch and its pending files
  // in every reply while it is open, and never call any of it done or push-ready.
  if (existsSync(BATCH)) {
    consume(NAG); // a batch is not a nag loop
    const pending = [...new Set([...code, ...ui, ...risk])];
    // stdout JSON is the DOCUMENTED exit-0 channel. This branch never reaches exit 2, so stderr
    // alone would leave the "do not call this done" instruction on a best-effort channel with no
    // backstop at all.
    emitContext(
      "Stop",
      `[gauntlet] BATCH OPEN — ${pending.length} file(s) still pending review: ${pending.join(", ")}. ` +
        `Do NOT tell Chan this is done or push-ready. The wall fires over all of it when he closes the batch.`,
    );
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
    // Consume the NAG counter ONLY. The touched ledger SURVIVES: failing open defers the review,
    // it never cancels it. clearTurnState() here used to erase the debt, so a skipped pass could
    // never fire again in any later turn (audit Jul 25 2026).
    consume(NAG);
    console.error(
      `[gauntlet] ⚠️ FAILING OPEN after ${MAX_NAG} blocks — allowing the stop so you are not trapped.\n` +
        `  ${skipped} did NOT run on: ${[...new Set([...code, ...ui, ...risk])].join(", ")}\n` +
        `  TELL CHAN PLAINLY, in your reply, that this work shipped WITHOUT its review pass.\n` +
        `  The pass is STILL OWED: the ledger is kept and this wall fires again next turn.`,
    );
    process.exit(0);
  }
  writeFileSync(NAG, String(n));

  const todo = [];
  if (needGate) todo.push(`  • net-runner  — type-check + lint + the nets for: ${code.join(", ")}\n      → then create \`.claude/GATE_OK\``);
  if (needUX) todo.push(`  • client-ux    — design/UX + impeccable detector on: ${ui.join(", ")}\n      → then create \`.claude/UX_OK\``);
  if (needUX) todo.push("      (no-vision runtime: SAVE the screenshot to a FILE, then create .claude/UX_SHOT to clear this wall; the CLEAN / POLISH / VIOLATIONS verdict stays owed to Chan, never faked)");
  if (needQA) todo.push(`  • client-qa    — acceptance + regression on: ${risk.join(", ")}\n      → then create \`.claude/QA_OK\``);

  console.error(
    `[gauntlet] BLOCKED (${n}/${MAX_NAG}) — you cannot call this done yet. The review gate has not run.\n` +
      todo.join("\n") +
      `\n\n  Your COMMITS were never blocked; this is only the "done" gate. The QA law: understand → build →\n` +
      `  self-review → test → regression-check → ONLY THEN mark complete. Run the agent(s), create the\n` +
      `  token(s), then finish. Never create a token without actually running the agent — that is the\n` +
      `  entire point of it. (Escape hatch: ask CHAN for it by name. Claude NEVER creates .claude/GAUNTLET_OFF.)`,
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

// Resolved-path compare, not a filename match: a copy saved under any other name used to run
// no mode at all and silently disable the whole gauntlet (audit Jul 25 2026).
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
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
