---
name: chan-ai-cost-context
description: The AI cost posture. During the Devoted engagement (ended Jul 24 2026) the company paid for Claude and effort stayed MAX by Chan's ruling. His Claude access is expected to be revoked around Jul 25 2026; he switches to cheap models (his own DeepSeek API key). Keep the kit lean and mechanical so weaker models can run it.
metadata:
  type: user
---

# AI cost context (updated Jul 24 2026, closure day)

**The arc:** while the company paid for Claude, effort stayed MAX by Chan's ruling (his words, Jul 24: he kept max effort because he did not pay for the subscription). The engagement ENDED Jul 24 2026 and his Claude access is expected to be revoked around Jul 25 2026, so that premise is gone.

**Current posture (Chan's ruling, Jul 24 2026):**
- He runs Claude Code against his own DeepSeek API key from now on. Switch instructions: ../workflow/switch-to-deepseek.md (the one-shot script lives in templates/apply-deepseek-switch.mjs). The Jul 25 revocation is a PREDICTION, not an event: never run switch-to-deepseek.md or apply-deepseek-switch.mjs until Chan confirms in-session that his Claude access is actually gone. Running it early starts billing his metered key while free access still works.
- The 10/10 workflow goal was always a system that SURVIVES this downgrade: hooks over prose rules, short high-signal files, checklists over judgment calls, one home per fact. That design is now live reality, not insurance.
- A weaker model forgets more and reasons worse: trust the files, follow the checklists, never skip the gates, and do not attempt the heavy multi-agent patterns Claude ran.
- lean-ctx is a COST tool, not a style preference. Chan, Jul 27 2026, asked why he uses it: "its because im broke." Its cached re-reads are the entire reason native Read/Grep/Glob are denied, so routing in-repo file reads through the shell out of habit spends his money for nothing. The routing rule and the measured drift live in ../workflow/tool-playbook.md; the shell still owns git, scripts, computed checks, and every out-of-root path.
- If he ever pays for Claude again, or a future client provides access, revisit effort and model choice then. Financial guard-rail: money decisions get a deliberate slow-down review, see [[chan-career-playbook]].

**The free-tier toolbelt already exists (archive Doc B v9 §5 + §8; verify staleness before relying):** the Msty Studio rig on the ThinkPad (12 configured providers, free-model failover priority chain, snap/load/next snapshot protocol for zero-loss model switches) and the Vibe Coding Stack (Cline + DeepSeek API at ~₱0.50/session, OpenRouter free models 50 req/day as backup, GitHub Copilot Free / Cursor Free quotas, Bolt free-tier economics). Philippines is NOT eligible for DeepSeek's free token grant (May 2026 status; re-verify). Standing money rule: no new AI spend until a client is secured.

Related: [[chan-hard-rules]] · [[chan-career-portfolio-state]]
