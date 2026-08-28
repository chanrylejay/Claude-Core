# Supabase — platform gotchas

(One platform, one file — split Aug 28 2026 from `../platform-gotchas.md`, which is now the
index. The parent holds the two standing laws that govern every entry here — the
irreversible-action duplication law and the written-out GO law — read them once per session
before acting on anything below. Bodies moved verbatim.)

- **SQL-editor-created tables do NOT auto-grant (42501) and can ship id without a default (23502): bake grants including sequence grants into every CREATE TABLE.** RLS without a grant denies even service_role.
- PostgREST schema cache goes stale (PGRST204): NOTIFY pgrst to reload.
- @supabase/ssr cookies are host-only by default: never set a cookie domain, or auth leaks across preview and prod hosts.
- Provisioning is atomic: auth-create plus profile-row-insert is ONE operation; a missed second step silently breaks that user everywhere.
