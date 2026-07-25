// push-guard — PreToolUse hook: HARD-BLOCKS any `git push` unless the one-shot GO token exists.
// ⚠ COPY this file into the project's .claude/hooks/ and run it from THERE. The GO token resolves
// relative to THIS file (../PUSH_GO): run from Claude-Core it guards templates/, not your repo.
// Why: push -> auto-deploy -> LIVE. The house rule ("no push without Chan's explicit
// GO, each time") used to be vigilance-based; this makes it deterministic — a written rule advises,
// a hook blocks.
//
// Protocol: Chan gives the GO -> Claude creates `.claude/PUSH_GO` (any content) -> the very next push
// attempt consumes the token (deleted BEFORE the push runs — single-attempt, even if the push then
// fails or the session is interrupted; a failed push needs a fresh token, which is the safe default).
// The token also EXPIRES after 30 minutes: an abandoned GO must never authorise a different push
// days later (audit, Jul 25 2026 — existence alone used to stand in for a per-push GO). An expired
// token is consumed and the push is blocked; ask Chan for a fresh GO.
//
// Everything that isn't a git push passes through untouched — meaning this hook does not INSPECT it,
// never that it is approved. Any other command that changes the live site (gh pr merge, vercel --prod,
// a deploy script, a hosting CLI) still needs Chan's explicit GO, and the absence of a block is
// never clearance.
//
// Fail-closed, with one caveat: any error INSIDE the run blocks (exit 2). A LOAD-time failure
// (syntax error, bad import) exits 1, which Claude Code treats as a non-blocking hook error — so
// wire the command as `node .claude/hooks/push-guard.mjs || exit 2` and the whole script fails
// closed. Without that wrapper, a broken hook file is a silent ALLOW.
//
// Wired in the project's .claude/settings.local.json (PreToolUse). The matcher MUST cover every
// shell path. On lean-ctx machines that is:
//   Bash|PowerShell|mcp__lean-ctx__ctx_shell|mcp__lean-ctx__shell|mcp__lean-ctx__ctx_call
// ctx_call is on that list because lean-ctx's ctx_execute — its own documented "trusted script
// path", which runs shell — is not a standalone tool: it is invoked as
// ctx_call({name:"ctx_execute", arguments:{...}}). Miss it and a push walks straight past the
// guard (audit Jul 25 2026). Re-check this list whenever a new shell-capable tool appears. Exit codes: 0 = allow,
// 2 = block (stderr is shown to Claude). Test (MANDATORY after any edit): _pushguard_test.mjs in this folder, run: node _pushguard_test.mjs

import { existsSync, unlinkSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const TOKEN = join(dirname(fileURLToPath(import.meta.url)), "..", "PUSH_GO");
const TOKEN_MAX_AGE_MS = 30 * 60 * 1000; // a GO is good for this push, now — not for next week

// A shell that EXECUTES what it is handed: `bash -c "..."`, and also `bash <<EOF ... EOF`.
const RUNNER_WORD = /(?:^|[\s;|&(`])(?:[\w.\/\\:-]*[\\\/])?(?:bash|sh|zsh|dash|ksh|pwsh|powershell|cmd)(?:\.exe)?(?:\s|$)/i;

// Does this shell command contain a git push? Match each chained segment (;, &&, ||, |, newline) so
// `cd repo && git push` is caught but `git log --grep="push"` / `echo push` are not. A segment counts
// when it invokes git (word "git", optionally git.exe / a path to it) AND carries a `push` word arg
// OUTSIDE quoted strings/heredocs — a commit MESSAGE mentioning "push" must never trip the guard
// (live false positive, Jul 13: `git commit -m "... push stays GO-gated ..."` got blocked).
// The push half accepts ANY non-word terminator, not just whitespace or end-of-string. Requiring
// whitespace let every command-substitution and subshell form through, because the character after
// "push" is a paren, a backtick or a quote. All verified ALLOW before this fix, and all found by
// PED AFTER my own first fix had already shipped and been committed (Jul 25 2026):
//   echo $(git push)   ·   backtick git push backtick   ·   x=$(git push)
//   echo "$(git push)" ·   (cd repo && git push)
// The hyphen exclusion keeps real git subcommands like push-to-checkout from matching.
// Steps 1-3 exist because the quote-strip in step 5, on its own, DELETED five real pushes
// (audit, Jul 25 2026 — every one verified ALLOW before the fix).
// ORDER IS LOAD-BEARING: heredoc bodies come out FIRST. Doing the runner recursion first blocked a
// commit whose MESSAGE quoted `bash -c "git push"` as an example (caught live, same day).
function isGitPush(command, depth = 0) {
  if (typeof command !== "string" || !command) return false;

  // 1) Heredoc bodies are DATA, not commands — unless the thing being fed is itself a shell
  //    (`bash <<EOF ... EOF` really does run the body). Recurse into those, drop the rest.
  //    The old code split the command at the first `<<` and threw away everything after it, so
  //    `git commit -F - <<EOF ... EOF` followed by a push walked straight through.
  const HEREDOC = /^([^\n]*?)<<-?\s*(['"]?)([A-Za-z_]\w*)\2[^\n]*\r?\n([\s\S]*?)(?:^|\n)[ \t]*\3[ \t]*(?=\r?\n|$)/gm;
  let bare = "";
  let last = 0;
  for (const m of command.matchAll(HEREDOC)) {
    if (depth < 4 && RUNNER_WORD.test(m[1]) && isGitPush(m[4], depth + 1)) return true;
    bare += command.slice(last, m.index) + m[1] + " ";
    last = m.index + m[0].length;
  }
  bare += command.slice(last);

  // 2) Shell runners and eval carry their payload inside quotes, so step 5 would erase the push
  //    before it could match: `bash -c "git push"` and `powershell -Command "git push"` both
  //    walked through. Recurse into the payload.
  if (depth < 4) {
    const runner =
      /(?:^|[\s;|&(`])(?:[\w.\/\\:-]*[\\\/])?(?:bash|sh|zsh|dash|ksh|pwsh|powershell|cmd)(?:\.exe)?\s+(?:-c|-Command|-command|\/c|\/C)\s+(['"])([\s\S]*?)\1/gi;
    const evals = /(?:^|[\s;|&(`])(?:eval|exec|source)\s+(['"])([\s\S]*?)\1/gi;
    for (const re of [runner, evals]) {
      for (const m of bare.matchAll(re)) {
        if (isGitPush(m[2], depth + 1)) return true;
      }
    }
    // Command substitution EXECUTES, including inside double quotes, so the step-5 quote strip
    // would erase a real push: `echo "$(git push)"` runs the push. Recurse into every $( ) and
    // backtick span before the strip can see them. A substitution inside SINGLE quotes does not
    // execute, so treating it as a push is a false positive — accepted, it fails safe and the
    // form is vanishingly rare.
    const subst = [/\$\(([\s\S]*?)\)/g, /`([^`]*)`/g];
    for (const re of subst) {
      for (const m of bare.matchAll(re)) {
        if (isGitPush(m[1], depth + 1)) return true;
      }
    }
  }

  // 3) `git "push" origin main` — a QUOTED subcommand is erased by step 5. Unquote it. Scoped to a
  //    quote that directly follows git, so `git commit -m "push"` is untouched.
  bare = bare.replace(
    /((?:^|[\s;|&(`])(?:[\w.\/\\:-]*[\\\/])?git(?:\.exe)?\s+)(['"])(\w+)\2/gi,
    "$1$3",
  );

  // 4) Strip quoted spans from the WHOLE command: a chain token inside a string ("a | git push")
  //    used to break quote-pairing after splitting and false-block (header-truth audit, Jul 24 2026).
  bare = bare.replace(/"[^"]*"|'[^']*'/g, " ");

  // 5) A heredoc opener still standing after the quotes are gone means the body was never
  //    terminated and we cannot tell where it ends. Fail CLOSED.
  if (/<<-?\s*['"]?[A-Za-z_]\w*/.test(bare)) return true;

  return bare.split(/(?:&&|\|\||[;|\n])/).some((seg) => {
    return (
      /(?:^|[\s"'(`])(?:[\w.\/\\:-]*[\\\/])?git(?:\.exe)?["']?\s/i.test(" " + seg) &&
      /(?:^|[\s"'(`$])push(?:$|[^\w-])/i.test(" " + seg + " ")
    );
  });
}

export { isGitPush };

// Run the hook only when this file IS the entry point. Comparing resolved paths, not the filename:
// a copy saved under any other name used to skip this block entirely and exit 0 — a silent allow
// of every push (audit, Jul 25 2026).
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
let raw = "";
try {
  for await (const chunk of process.stdin) raw += chunk;
  const payload = JSON.parse(raw || "{}");
  // Take EVERY string anywhere in tool_input, at any nesting, and test all of them. Reading one
  // fixed key and treating a miss as a pass was the defect: a tool that carries the command under
  // any other name (ctx_call nests it under arguments) sailed through with no inspection, no
  // block, and — worse — no token consumed, so the GO stayed valid for its whole 30-minute window
  // (audit Jul 25 2026). Only shell tools reach this hook, so scanning all of tool_input is safe.
  const strings = [];
  (function walk(v, depth) {
    if (v == null || depth > 5) return;
    if (typeof v === "string") return void strings.push(v);
    if (Array.isArray(v)) return void v.forEach((x) => walk(x, depth + 1));
    if (typeof v === "object") return void Object.values(v).forEach((x) => walk(x, depth + 1));
  })(payload?.tool_input, 0);
  if (!strings.some(isGitPush)) process.exit(0); // not a push — pass through

  if (existsSync(TOKEN)) {
    const ageMs = Date.now() - statSync(TOKEN).mtimeMs;
    unlinkSync(TOKEN); // consume BEFORE the push — single-attempt, and a stale token is never left lying around
    if (ageMs <= TOKEN_MAX_AGE_MS) {
      console.error("[push-guard] GO token consumed — push allowed (one-shot).");
      process.exit(0);
    }
    console.error(
      "[push-guard] BLOCKED: the GO token was " + Math.round(ageMs / 60000) + " minutes old (max 30). " +
        "A GO authorises the push Chan approved, at the time he approved it — not a later one. " +
        "The stale token has been deleted. Ask Chan for a fresh GO.",
    );
    process.exit(2);
  }
  console.error(
    "[push-guard] BLOCKED: `git push` requires Chan's explicit GO. Pushing deploys straight to the " +
      "live site (auto-deploy from main). If Chan just gave the word, create the one-shot token " +
      "(.claude/PUSH_GO) and retry — it is consumed per attempt. Never create the token without his GO.",
  );
  process.exit(2);
} catch (err) {
  console.error(`[push-guard] hook error (${err?.message ?? err}) — failing CLOSED, push blocked.`);
  process.exit(2);
}
}
