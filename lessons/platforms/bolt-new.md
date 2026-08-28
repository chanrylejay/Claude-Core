# Bolt.new — platform gotchas

(One platform, one file — split Aug 28 2026 from `../platform-gotchas.md`, which is now the
index. The parent holds the two standing laws that govern every entry here — the
irreversible-action duplication law and the written-out GO law — read them once per session
before acting on anything below. Bodies moved verbatim.)

- **NEVER connect Bolt to GitHub on a live project: it auto-pushes on any change and triggers auto-deploys (caused a production rollback once).** Bolt is a one-way launchpad: scaffold, download ZIP, VS Code, GitHub Desktop, deploy.
- Verify immediately after scaffold: the DB client (it may swap Neon for Supabase), the schema names, and the full logic flow (it omits critical sections).
- **Token economics observed:** ~100K for a scaffold prompt, ~80K for a single bug-fix
  conversation. Budget accordingly; merge remaining prompts with a strict build ORDER and a
  "finish the current file cleanly and STOP" clause so a token death never leaves half-written
  files.
- **Watch for silent infrastructure substitution:** if the tool can't see your DATABASE_URL it
  may provision its OWN database and invent seed data. Leash clause that fixes it: "The database
  already exists and is populated. Verify with <known-answer query>. If the env var is missing
  or the query fails, STOP and tell me — do not fall back to any other database."
- **Secrets:** create .env files manually in the file tree; never type secrets into an agent
  prompt (it becomes conversation history). Check the tool's default deploy config (it may
  target a different host than yours — harmless, ignorable).
- **"Website" vs "App" mode chips matter** — pick the one that scaffolds a server.
