---
name: chan-ai-cost-context
description: The AI cost posture. During the Devoted engagement (ended Jul 24 2026) the company paid for Claude and effort stayed MAX by Chan's ruling. CONFIRMED Aug 11 2026: Claude access in VS Code is gone permanently, the CLI runs DeepSeek v4 flash, and Claude runs as the planning agent at claude.ai. The switch is DONE; do not re-run it. Keep the kit lean and mechanical so any model can run it.
metadata:
  type: user
---

# AI cost context (updated Jul 24 2026, closure day)

**The arc:** while the company paid for Claude, effort stayed MAX by Chan's ruling (his words, Jul 24: he kept max effort because he did not pay for the subscription). The engagement ENDED Jul 24 2026 and his Claude access in VS Code is gone for good (confirmed Aug 11 2026), so that premise is gone. He now runs his own DeepSeek key in the CLI and uses claude.ai as the planning agent.

**Current posture (last updated Jul 29 2026, the switch is now DONE):**
- Chan confirmed in-session Jul 29 2026: his Claude access is gone and he switched to DeepSeek. The model is now deepseek-v4-flash, and this session IS the first proof the kit works on a different, smaller-context model. The contract check fired, the drill ran, the rules loaded, the push gate held - all of it worked on first contact with DeepSeek, before any adjustments.
- The first practical note (Jul 29, SUPERSEDED Aug 24 2026): the window is not smaller — v4-flash carries a 1M-token context — but a big window is a cost trap under the Aug 16 pricing, so the compact-early habit below replaces the old worry. The cost of that first session was about $2 (374k tokens), Chan paying his own key for the first time. /compact and /info still work the same way.
- DeepSeek cannot see images. The screenshot save-to-file handoff is now the only path, not a fallback. The contract already covers this (section 3 bullet one).
- Switch instructions: ../workflow/switch-to-deepseek.md (script: templates/apply-deepseek-switch.mjs). No longer blocked; the prediction guard is history.
- The 10/10 workflow goal was always a system that SURVIVES this downgrade: hooks over prose rules, short high-signal files, checklists over judgment calls, one home per fact. That design is now live reality, not insurance.
- Under a smaller context window ANY model forgets more midstream: trust the files, follow the checklists, never skip the gates, and scale multi-agent patterns to the context window at hand. (Reworded Aug 24 2026 on Chan's fairness ruling — the CLI is a collaborator, not a lesser; the same session it was reworded, the CLI caught a defect the planner's clean sandbox could not see.)
- lean-ctx is a COST tool, not a style preference. Chan, Jul 27 2026, asked why he uses it: "its because im broke." Its cached re-reads are the entire reason native Read/Grep/Glob are denied, so routing in-repo file reads through the shell out of habit spends his money for nothing. The routing rule and the measured drift live in ../workflow/tool-playbook.md; the shell still owns git, scripts, computed checks, and every out-of-root path.
- If he ever pays for Claude again, or a future client provides access, revisit effort and model choice then. Financial guard-rail: money decisions get a deliberate slow-down review, see [[chan-career-playbook]].

**Aug 24 2026 update — DeepSeek raised prices Aug 16 and the workflow adapts, the key stays.**
Chan's ruling Aug 24: fix the workflow, do NOT switch APIs (balance was $9.21 that day; a switch
runbook exists if that ever changes). Full price table, peak windows, and the verified dashboard
reconstruction: ../lessons/platform-gotchas.md, DeepSeek API section — one home, read it before
any cost reasoning. What changed in one line: off-peak is ~2x the old flat rate, PEAK (09:00-12:00
and 14:00-18:00 Manila) is ~4x, and cache hits are no longer ~free, so context size now bills on
every request. The four session habits, in order of dollars saved:
1. **Work off-peak.** Peak = 09:00-12:00 and 14:00-18:00 Manila at double price. The session-ritual
   hook announces the live peak/off-peak state at every session start (installed-hook check: this
   is real only where the Aug 24 hook version is planted; reachability applies). Heavy generation
   waits for off-peak unless Chan says run it now.
2. **Keep the context small.** Cost scales with context x requests even at a 100% hit rate. Working
   at 360K tokens costs ~4x working at 100K, before a single cache miss.
3. **Compact early, never at the wall.** A compaction costs one cold reload of the context you
   compact (~$0.08 at 360K, ~$0.02 at 100K off-peak), and everything after it is cheaper. Waiting
   until near-full is the expensive habit. Bank first (rule 4), then compact small.
4. **One longer session beats several short ones.** Every fresh start, /clear, and expired cache
   (hours-to-days idle) is a cold reload. Measured Aug 24: a 1-hour 73-request session with ~7 cold
   reloads billed $0.80; the all-day 561-request 8/10 session with ~11 billed $1.04 at the OLD rate.
   Batch the day's work into one sitting where life allows.
The scoreboard for all four is the money meter in the VS Code status bar (balance, today's
observed spend, live peak state; zero token cost — it renders outside the model's context).
Installed-hook check applies: it is real only where templates/global/deepseek-meter.mjs is
planted and wired in settings statusLine. If the bar shows nothing, the install slipped — say so.

**The free-tier toolbelt already exists (archive Doc B v9 §5 + §8; verify staleness before relying):** the Msty Studio rig on the ThinkPad (12 configured providers, free-model failover priority chain, snap/load/next snapshot protocol for zero-loss model switches) and the Vibe Coding Stack (Cline + DeepSeek API at ~₱0.50/session, OpenRouter free models 50 req/day as backup, GitHub Copilot Free / Cursor Free quotas, Bolt free-tier economics). Philippines is NOT eligible for DeepSeek's free token grant (May 2026 status; re-verify). Standing money rule: no new AI spend until a client is secured.

Related: [[chan-hard-rules]] · [[chan-career-portfolio-state]]
