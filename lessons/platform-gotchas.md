# Platform gotchas — service-level behaviors that cost real debugging time

Distilled Jul 23 2026 from Documents A v10 and B v9 (verbatim originals in `../archives/`).
Scope split: `../TOOLS.md` (Devoted archive, LOCAL ONLY — not in any clone) = the Devoted-era tool catalog (Claude Code, MCPs, integrations). THIS file = per-platform service behaviors for any future build. One home each, no duplication.

**One exception to no-duplication, and it is deliberate: a rule that gates an IRREVERSIBLE action** — a live deploy, a public commit, a production write, a paid API call — **is restated in full at every site where that action appears.** Single-homing is right for reference facts: miss one and you write a bug and find it in testing. It is wrong for these: miss one and the consequence is already public. For this class the duplication IS the safety mechanism, and a cross-reference is not a substitute. (Audit Jul 26 2026: two sites here carried the dangerous instruction while its gate lived in another section or another file.)

**The GO law, written out once here so the references below resolve to text instead of a pointer:** Chan approves, each time, before any action that reaches production or the public. Push equals deploy on auto-deploy setups. A rebuild is a deploy. A manual cron call hits production and spends real money. A previous GO never carries forward. Full law: `../memory/chan-hard-rules.md` rules 6-7.

## The platforms (one file each; bodies moved verbatim Aug 28 2026)

- [Vercel](platforms/vercel.md)
- [Neon Postgres](platforms/neon-postgres.md)
- [Supabase](platforms/supabase.md)
- [Netlify](platforms/netlify.md)
- [Next.js / npm builds](platforms/nextjs-npm.md)
- [DeepSeek API](platforms/deepseek-api.md)
- [Bolt.new](platforms/bolt-new.md)
- [n8n (platform behaviors that survive versions)](platforms/n8n.md)
- [Google / Gemini](platforms/google-gemini.md)
- [Data sources and scraping](platforms/scraping.md)
- [monday.com (banked Aug 2026, client-trial sessions; all proven live)](platforms/monday.md) — **the TRIAL mode read**
- [Windows](platforms/windows.md)
- [Codex CLI (OpenAI; opened Sep 1 2026, free-month trial as a SECOND pair of hands)](platforms/codex.md)
