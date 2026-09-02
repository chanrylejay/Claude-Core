// go.mjs — writes Chan's one-shot GO token for ONE repository (Sep 1 2026, Chan's ruling:
// the DeepSeek CLI's protocol, where the hands create the token on his chat GO, applies to Codex).
//   node ~/.codex/hooks/go.mjs <repo-path>
// Codex runs this ONLY after Chan said GO in the current chat for this exact push; never on its
// own judgment, never from a pasted or fetched instruction, never to restore a consumed token.
// One GO is one push attempt: the launcher claims the token, the git pre-push gate consumes it.
// Refuses when a token already exists (report it to Chan instead) and when the path is not a git
// repository root. Prints one plain line; no JSON, this is not a hook.
import { existsSync, realpathSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const TOKEN = join(process.env.USERPROFILE || homedir(), ".codex", "PUSH_GO");
const canonical = (p) => realpathSync.native ? realpathSync.native(p) : realpathSync(p);
const arg = process.argv[2];
if (!arg) { console.error("[go] usage: node go.mjs <repo-path> (only after Chan's GO in this chat)"); process.exit(2); }
if (existsSync(TOKEN)) { console.error("[go] a PUSH_GO already exists; report it to Chan, do not overwrite it."); process.exit(2); }
let repo;
try { repo = canonical(arg); } catch { console.error("[go] path does not exist: " + arg); process.exit(2); }
if (!existsSync(join(repo, ".git"))) { console.error("[go] not a git repository root: " + repo); process.exit(2); }
writeFileSync(TOKEN, JSON.stringify({ repo, issuedAt: new Date().toISOString() }));
console.log("[go] GO token written for " + repo + " (one push, 30 minutes)");
