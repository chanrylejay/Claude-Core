// playwright-guard — DeepSeek CLI PreToolUse containment for the Playwright CLI (Sep 4 2026).
// Scope: denies playwright-cli / `npx @playwright/cli` invocations that navigate anywhere but
// 127.0.0.1/localhost, and denies its file-chooser actions (upload/drop) outright. Mirror of the
// Codex-side containment inside templates/codex/codex-guard.mjs, in the DeepSeek side's own
// exit-2 + stderr house style (push-guard.mjs is never edited; this is a sibling template).
// The CLI is deliberately contained to the local app: it is NOT a general browser. Every deny is
// a UI click / a localhost re-target — never a guard workaround.
//
// Wire (user ~/.claude/settings.json PreToolUse, same slot as push-guard):
//   node "C:/Users/Chanryle/.claude/hooks/playwright-guard.mjs" || exit 2
// It inspects ONLY shell-carrier tools (the command the push-guard comment names); anything else
// passes untouched, so Edit/Write/Read payloads that merely MENTION playwright-cli never trip it.
//
// Exit codes: 0 = allow (no output), 2 = deny (reason on stderr). Fail closed.

import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

// Exact action names only: this is a deny wall, not intent guessing.
const PLAYWRIGHT_CLI_FILE_ACTIONS = new Set(["upload", "drop"]);
const PLAYWRIGHT_CLI_NAV_ACTIONS = new Set(["open", "goto", "tab-new"]);

// Shell carriers whose payload.command is a command to run. Everything else passes.
const SHELL_CARRIERS = /(?:^|[._-])(?:bash|powershell|pwsh|cmd|zsh|dash)(?:\.exe)?$|ctx_call|ctx_execute|ctx_shell|_shell$/i;

function shellWords(value) {
  return value.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)?.map((w) => w.replace(/^(?:"|')|(?:"|')$/g, "")) ?? [];
}

function isPlaywrightCliExecutable(word) {
  return /(?:^|[\\/])playwright-cli(?:\.(?:cmd|exe))?$/i.test(word) || /^playwright-cli(?:\.(?:cmd|exe))?$/i.test(word);
}

function isNpxPlaywrightCli(words, index) {
  if (!/^(?:npx|npx\.cmd)$/i.test(words[index] ?? "")) return false;
  let next = index + 1;
  while (/^--(?:no-install|yes|quiet)$/.test(words[next] ?? "")) next++;
  return /^(?:@playwright\/cli|playwright-cli)$/.test(words[next] ?? "");
}

// Parse every shell segment so a later CLI invocation cannot hide behind an earlier command.
function playwrightCliViolation(command) {
  for (const segment of command.split(/[;&|\n]/)) {
    const words = shellWords(segment);
    for (let i = 0; i < words.length; i++) {
      let firstArg;
      if (isPlaywrightCliExecutable(words[i])) firstArg = i + 1;
      else if (isNpxPlaywrightCli(words, i)) {
        firstArg = i + 1;
        while (/^--(?:no-install|yes|quiet)$/.test(words[firstArg] ?? "")) firstArg++;
        firstArg++;
      } else continue;
      const actionIndex = words.findIndex((word, index) => index >= firstArg &&
        (PLAYWRIGHT_CLI_FILE_ACTIONS.has(word.toLowerCase()) || PLAYWRIGHT_CLI_NAV_ACTIONS.has(word.toLowerCase())));
      if (actionIndex < 0) continue;
      const action = words[actionIndex].toLowerCase();
      if (PLAYWRIGHT_CLI_FILE_ACTIONS.has(action)) return "Playwright CLI " + action + " is disabled; file-chooser actions are never authorized.";
      const target = words.slice(actionIndex + 1).find((word) => /^https?:\/\//i.test(word));
      if (!target) continue;
      try {
        const url = new URL(target);
        if (url.hostname.toLowerCase() === "localhost" || url.hostname === "127.0.0.1") continue;
      } catch {}
      return "Playwright CLI navigation is localhost-only; refusing " + target + ".";
    }
  }
  return null;
}

const deny = (message) => {
  console.error("[playwright-guard] BLOCKED: " + message);
  process.exit(2);
};

// Run the hook only when this file IS the entry point; importing it for a unit net must not
// execute the main block (same pattern as push-guard and codex-guard).
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  let raw = "";
  try {
    for await (const chunk of process.stdin) raw += chunk;
    const payload = JSON.parse(raw || "{}");
    const toolName = payload?.tool_name ?? "";
    if (typeof toolName === "string" && SHELL_CARRIERS.test(toolName)) {
      const command = typeof payload?.tool_input?.command === "string" ? payload.tool_input.command : "";
      if (command) {
        const violation = playwrightCliViolation(command);
        if (violation) deny(violation);
      }
    }
    process.exit(0); // pass
  } catch (err) {
    deny("hook error (" + (err?.message ?? err) + ") — failing closed.");
  }
}

export { playwrightCliViolation, isPlaywrightCliExecutable, SHELL_CARRIERS };
