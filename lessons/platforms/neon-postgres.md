# Neon Postgres — platform gotchas

(One platform, one file — split Aug 28 2026 from `../platform-gotchas.md`, which is now the
index. The parent holds the two standing laws that govern every entry here — the
irreversible-action duplication law and the written-out GO law — read them once per session
before acting on anything below. Bodies moved verbatim.)

- **NUMERIC returns STRINGS in JS: always parseFloat before the frontend.** TEXT-stored JSON needs JSON.parse, and `::jsonb` casts before JSON operators in SQL.
- ON CONFLICT DO UPDATE cannot touch the same row twice in one batch insert: DISTINCT ON in SQL plus a JS Map dedup plus DO NOTHING.
- Multiple rows per date: never LIMIT 1 alone; ORDER BY generated_at DESC NULLS LAST, id DESC.
- Sequence names survive table renames. Free tier: 100 projects; Singapore region for PH.
