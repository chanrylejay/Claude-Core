---
name: chan-pre-devoted-assets
description: Full inventory of the pre-Devoted era (Apr-Jun 2026) in C:/Users/Chanryle/Downloads/Projects, from the Jul 23 2026 six-agent study. Live systems, portfolio stories with numbers, the private prompt vault, and the security rulings SETTLED Jul 23 2026 (respect them; do not re-raise).
metadata:
  type: reference
---

# Pre-Devoted assets inventory (studied Jul 23 2026)

**The era:** Apr-Jun 2026. Self-hosted n8n 2.12.3 + Neon Postgres + Telegram + Gemini/DeepSeek, all $0-8/month, plus a 7-persona prompt-engineering ecosystem and the first shipped web apps. This is the direct ancestor of the QA gauntlet: multi-round adversarial AI audits with Do-Not-Repeat blacklists (Supervisor: 22 rounds, 136 DNR items).

**Live/public today:**
- ano-ulam: ma-anoulam.vercel.app, Filipino meal app, DA price-PDF scraper + 47-recipe cost engine. Strongest showable project of the era.
- n8n-project-calculator: n8n-project-calculator.vercel.app. Exposes old budget pricing (T1 $15-20), consider reframing now.
- github.com/chanrylejay: shiny-gmail-automation (60 nodes, V4.0) + supervisor repo (48 nodes, zero-AI); their Neon databases are deliberately ISOLATED from each other. Repo name typo "erorr" worth renaming.
- Profile README frozen Jun 4 2026, pre-Devoted. Needs the Devoted role added.

**Portfolio stories with verified numbers:**
- Supervisor V23 to V1 Lean: 8 workflows/139 nodes/AI-powered (~500K tokens per error) rebuilt to 3 workflows/48 nodes/zero AI/$0 per month, 22 audit rounds, 30+ bugs fixed.
- Shiny Gmail: 200+ nodes rebuilt to 60; Gemini classification with prompt-injection defense and JSON responseSchema.
- Original n8n platform bug discoveries (import corruption of IF/Switch, queryReplacement comma-split, canvas-Y execution order): blog/LinkedIn material.
- The sanitized full-system demo: live and extending; canonical status lives in [[chan-career-portfolio-state]].

**Private methodology vault (NEVER publish, per his own May 27 open-source policy):** Prompt Engineering/ (82 files, 7 personas: Nautica/PED, Ninja, Sentinel, GRT/Ulrich, MIRA, HAWK, Main AI governance docs). PED v6.3 and Ninja v3.1 are still usable tools. HAWK v2.0 + the n8n ARCHITECT PLAYBOOK = ready-to-run Upwork sales system if freelancing resumes. **Chan ruled Jul 23 2026: DO NOT TOUCH or reorganize this folder, ever. Do not re-suggest archiving.** Vault ops facts (recovered Jul 24): the Gemini-hosted personas run Activity ON, Personalization OFF, Instructions OFF, Connected Apps OFF, one dedicated chat per system (all other Gemini accounts: Activity OFF); DeepSeek R1 Expert hosts PED/PMD/Ninja/HAWK. Prompt-systems-in-n8n = NO (API means Deep Think OFF, degrades 10/10 systems; re-open only if that changes). GRT's two designed-but-unbuilt upgrade paths if revived: v7.0 on a Thinking-class model, or a pre-validation wrapper once an application layer exists. Also DEFERRED by Chan: LinkedIn/blog posts from the Supervisor rebuild story and n8n bug discoveries (re-offer only if he brings up content).

**Housekeeping completed Jul 23 2026:** misfiled Shiny Gmail V4.0 rescued to "N8N Workflows/Shiny Gmail v4.0 Lean/"; ano-ulam cleaned (node_modules/.next deleted, .sql.sql renamed, CLAUDE.md + seed tracked, local env synced to prod) committed 0ba2a43; calculator @supabase/supabase-js removed, build green, committed 9168548; both n8n repo READMEs fixed and pushed (shiny 6779dad, supervisor e207fc9).

**Security rulings (SETTLED Jul 23 2026; respect them, do not re-raise):** the six rulings, with site names and paths, live in [[LOCAL-ONLY-security-rulings]] (gitignored, this machine only). Short form: the personal credentials file is untouchable · the n8n launcher script is untouchable · one declined secret rotation stands · one risky worktree was already removed · the DeepSeek migration is fully proven · n8n is upgraded and its pre-upgrade backup awaits his deletion word.

**Housekeeping verdicts:** Claude-Core-OLD-moved-2026-07-23 = DELETED Jul 23 2026 after a re-verified diff (only unique content was an old backup subset). Do NOT purge the Devoted archive; it holds the only originals of the distilled rules.

**Deferred triggers (Doc A v10 §5, banked Jul 24 2026):** Hermes agent on Hetzner CX33 when funded · Cursor Pro when budget allows · n8n Template Gallery submissions (Shiny Gmail + Supervisor) · Moltgate.com storefront evaluation · Odysseus = SKIP (needs local GPU) · Sonnetto = superseded by Hermes · Hetzner CX33 fits the whole plan (Hermes ~2GB + permanent n8n ~2GB + OS ~1GB of 8GB; Hermes is MIT-licensed) · ano-ulam follow-ups now live in ../projects/ano-ulam/project-canon.md.

**Closed-decision registers (never re-raise):** Supervisor V1 Lean has a 12-item never-suggest list (no Redis/queue mode, no Prometheus, no PgBouncer, localhost IS production, no table-partitioning/enterprise-scale, ...) and Ano Ulam's permanent decisions are in the project canon; both verbatim in archive Doc B §7.

Related: [[chan-career-portfolio-state]] · [[chan-hard-rules]]
