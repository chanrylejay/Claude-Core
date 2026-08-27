# Client-collaboration lessons (from the Devoted Care engagement)

What two months of high-intensity client work taught about running an AI-assisted build for a
non-technical product owner. The client relationship ended over communication-style
incompatibility — these lessons are what to carry, and what to protect against, next time.

## The workflow that worked
- **Show-first → approve → deploy:** pattern 31 in universal-patterns.md — the full law, build
  mechanics and mock scope included. (Audit Jul 26 2026: this line used to carry the instruction
  body while its pointer covered mock scope only.)
- **One module at a time.** A client's list of 8 asks is a backlog, not a batch. Finishing one
  area completely beats touching all eight.
- **Capture asks VERBATIM** (a spec-reader pass): quote their exact words, extract numbered
  requirements, list ambiguities as ready-to-send questions. The client's phrasing is evidence
  when "that's not what I asked for" comes later.
- **Keep a "Waiting on Decisions" register** — one list of everything blocked on the client's
  answer. Nothing slips, and the relay person's job becomes one glance.
- **Order of operations for an existing workflow:** pattern 32 in universal-patterns.md — the
  one home, validate-first clause included. (Audit Jul 26 2026: this line used to carry the full
  instruction with a scope clause pattern 32 lacked; two homes, divergent text.)

## The review bottleneck (the real root cause of friction)
When one person relays between the client and the AI *and* reviews everything, they drown, and
"the AI decides too much" complaints follow. The full playbook for shrinking that load: ../memory/chan-review-bottleneck.md. One client-report extra:
- Convert relative dates and vague references into absolutes in every report.

## Handling directives
- **Directives are not absolute — critique them.** Full rule: ../memory/chan-critique-directives.md.
- **"So many changes" from a client = learning, not indecision.** A prototype's job is workflow
  discovery. Don't resent revisions; make them cheap and safe (nets, guards, batches).
- **Don't ask the client to define technical "done."** They often can't. Define it yourself from
  an audit, then SHOW them for a yes/no.

## Protecting the relationship (and yourself)
- **Quality > speed when trust is the currency.** One regression costs more trust than ten
  features earn. "Catch it before they see it."
- Communication-style incompatibility is real and doesn't mean the work was bad. Notice early
  whether direction-giving stays respectful under stress; that, not skill, is what ended this one.
- Leave clean: proper handoff, recovered data, documented systems. The exit is part of the
  portfolio too.

## Working with a non-technical owner (the persona-era toolkit, battle-tested for months)

Plain language + numbered steps + one analogy per new technical term (on first use), ending
with a "Your Next Move" label. Every technical error gets restated in plain English before
any fix talk. When two approaches exist, present a structured side-by-side so a non-coder
can decide. These devices are how Chan absorbs best, and they transfer to any future
non-technical client.

## Compliance posture (HIPAA-class data; from archive Doc A v10, banked Jul 24 2026)

Compliance is NOT self-decidable: it attaches by operation of law, and the determination
belongs to the client + their counsel, never to the builder or an AI session. The practical
unblock: Safe-Harbor de-identification done LOCALLY before any vendor sees the data. A vendor
BAA alone is not compliance. BAA vendor reality (as of mid-2026): Supabase needs Team plan +
add-on, Netlify needs Enterprise, Anthropic offers it first-party via API.

- **The stated ask and the real ask live at different altitudes.** A written client request
  described a full end-to-end workflow mock; the daily operator's real pain, surfaced only in
  casual chat, was one status→group auto-sort ("we drag cards manually and lose people").
  Both were true. Build the operator's small ask FIRST (it took minutes on clean data and
  made her the champion), then reveal it as one gear of the owner's big machine. Match
  altitude to audience: recipes with operators, journeys with owners. And when a client asks
  "what should we automate?", their casual chat afterwards IS the answer — capture verbatim.
- **Platform-native beats custom rescue.** Mid-trial doubt ("nothing visual, client won't get
  it") tempts a custom web-app rescue. The client's own words asked for it "in [the platform]
  they pay for"; the fix each time was native features (dashboard, forms, groups, automations)
  plus ONE flow diagram screenshot. A custom app from a week-old contractor is a dependency,
  not a deliverable — park it as a late-phase item. Corollary: when morale says "we built the
  wrong thing," re-read the client's actual request verbatim before building anything new;
  twice the gap was presentation, not substance.

## Two-model relay refinements (client build, Aug 2026)

- **Address model-to-model briefs peer-to-peer, not boss-to-intern.** Peers don't obey
  checkpoints — they agree to them, so every STOP gate ships with its *reason* (e.g. "hold
  after the seed so I can verify counts before we build on them").
- **Division of labor that worked:** web model = architect/reviewer/data authority (cannot
  reach runtime); CLI model = hands with runtime truth (repo, live DB, dev server).
  Disagreements route through the human with evidence; the architect folds to runtime truth
  and better data — and says so explicitly when beaten.
- **Verification checkpoints beat trust:** pre-declare expected artifacts (e.g. exact
  per-table seed counts) and gate the next phase on them.
- **Push-guard ceremony:** the agent never pushes to a deploying branch without the human's
  explicit GO (a one-shot token file works well). Push = deploy, so gates first, always:
  tsc → build → dev-verify → then push.
- **Bank-before-clear:** the agent writes state to repo docs + project memory, the human
  clears context. A daily fresh-session ritual with a NEXT-SESSION-BRIEF file beats riding a
  conversation into auto-compaction.

## Product/demo principles that landed (client build, Aug 2026)

- **Seed the demo with the client's real data.** "A demo" is fine; "a demo that already
  knows your business" makes decisions.
- **Scaffold broad, go deep on one:** build the whole business so the owner sees themselves;
  make exactly one module (the ally's daily pain) deep. Real-but-read-only beats
  fake-but-interactive everywhere else.
- **Wins-first dashboards; "needs attention" panels over feature tours.**
- **Honesty as feature:** "Verified ready: 1/N" + "M unknown" — the gap IS the pitch. Render
  such numbers dynamically; hardcoded figures rot and contradict the UI.
- **Design guardrails must be absolute to survive** ("no <color> anywhere"); when the design
  authority contradicts its own rule, change the spec, not the rule.
- **AI-drafter pattern:** the system prompt carries all the quality; the model is swappable;
  JSON-forcing response modes beat fence-stripping.
- **Free-tier full stack is real:** scaffolder + serverless Postgres + hobby deploy + budget
  LLM API ≈ $0 to a live, branded, data-seeded internal tool in a day.

## Client discovery lessons (client build, Aug 2026)

- **Interview users individually, never as a group.** Separate one-to-one conversations with
  each member of a small team produced a different tool, a different workflow and a different
  constraint from every person — including a whole system nobody had mentioned, and one staff
  member with no access to the tool the engagement was scoped around. A group thread produces
  consensus; individual threads produce the map.
- **Map who can OPEN things, not just who uses them.** A compliance dataset sat unused not
  through neglect but because only two people — both unresponsive — could open the documents;
  everyone else received a read-only email copy. **The bottleneck was permission, not
  capability.** "Why has nobody done this" is often answered by an access list, and that
  reframes a criticism into a problem you can offer to solve.
- **The tool inventory is itself a deliverable.** In small businesses nobody has written down
  what is paid for, who uses it, who can administer it and where it hurts. Assembling that map
  is genuinely valuable to an owner, costs only conversations, and is a legitimate reason to
  ask for a meeting that is not "please look at my work."
