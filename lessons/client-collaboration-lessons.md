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
