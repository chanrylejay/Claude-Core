---
name: chan-ai-cost-context
description: The AI cost posture. During the Devoted engagement (ended Jul 24 2026) the company paid for Claude and effort stayed MAX by Chan's ruling. A Jul 25 2026 revocation of his Claude access was PREDICTED and is NOT confirmed here: never state his current model or provider from this line, and never run the DeepSeek switch until Chan confirms in-session. Keep the kit lean and mechanical so weaker models can run it.
metadata:
  type: user
---

# AI cost context (updated Jul 24 2026, closure day)

**The arc:** while the company paid for Claude, effort stayed MAX by Chan's ruling (his words, Jul 24: he kept max effort because he did not pay for the subscription). The engagement ENDED Jul 24 2026 and his Claude access is expected to be revoked around Jul 25 2026, so that premise is gone.

**Current posture (last updated Jul 29 2026, the switch is now DONE):**
- Chan confirmed in-session Jul 29 2026: his Claude access is gone and he switched to DeepSeek. The model is now deepseek-v4-flash, and this session IS the first proof the kit works on a weaker model. The contract check fired, the drill ran, the rules loaded, the push gate held - all of it worked on first contact with DeepSeek, before any adjustments.
- The first practical note: the context window is smaller, so compacts will hit earlier. The cost so far is about $2 for this session (374k tokens), which is Chan paying his own key for the first time. /compact and /info still work the same way.
- DeepSeek cannot see images. The screenshot save-to-file handoff is now the only path, not a fallback. The contract already covers this (section 3 bullet one).
- Switch instructions: ../workflow/switch-to-deepseek.md (script: templates/apply-deepseek-switch.mjs). No longer blocked; the prediction guard is history.
- The 10/10 workflow goal was always a system that SURVIVES this downgrade: hooks over prose rules, short high-signal files, checklists over judgment calls, one home per fact. That design is now live reality, not insurance.
- A weaker model forgets more and reasons worse: trust the files, follow the checklists, never skip the gates, and do not attempt the heavy multi-agent patterns Claude ran.
- lean-ctx is a COST tool, not a style preference. Chan, Jul 27 2026, asked why he uses it: "its because im broke." Its cached re-reads are the entire reason native Read/Grep/Glob are denied, so routing in-repo file reads through the shell out of habit spends his money for nothing. The routing rule and the measured drift live in ../workflow/tool-playbook.md; the shell still owns git, scripts, computed checks, and every out-of-root path.
- If he ever pays for Claude again, or a future client provides access, revisit effort and model choice then. Financial guard-rail: money decisions get a deliberate slow-down review, see [[chan-career-playbook]].

**The free-tier toolbelt already exists (archive Doc B v9 §5 + §8; verify staleness before relying):** the Msty Studio rig on the ThinkPad (12 configured providers, free-model failover priority chain, snap/load/next snapshot protocol for zero-loss model switches) and the Vibe Coding Stack (Cline + DeepSeek API at ~₱0.50/session, OpenRouter free models 50 req/day as backup, GitHub Copilot Free / Cursor Free quotas, Bolt free-tier economics). Philippines is NOT eligible for DeepSeek's free token grant (May 2026 status; re-verify). Standing money rule: no new AI spend until a client is secured.

Related: [[chan-hard-rules]] · [[chan-career-portfolio-state]]
