# Devoted Care design canon (PROJECT-SPECIFIC — not Chan's personal defaults)

The client-specific canon (exact hexes, locked components) stays with that project.
These were the working rules of the Devoted Care build (largely the client's taste). Reuse in a
new project ONLY what that project explicitly adopts. Chan ruled Jul 23 2026: no standing
personal design canon; every project defines its own. Engagement ENDED Jul 24 2026: this
canon is reference and portfolio material now.

## The laws (violate = failed review)
- **Zero guide text.** No helper sentences, no placeholder instructions, no "click here to…".
  A good layout explains itself.
- **Fewest clicks.** Every added click must justify itself. No confirmation steps for
  reversible actions.
- **No duplicated information.** A fact appears in ONE place per screen. Redundant sections are
  the #1 client complaint.
- **Data-only cards.** Cards show data, not decoration. If a card has no data, ask why it exists.
- **One brand color, never used for status.** Brand ≠ semantic. Status gets its own
  colors (amber/red/green); the brand accent never doubles as "warning" or "ok."
- **No banners.** Inline, quiet states over shouting bars.
- **Long scroll is a bug.** If a screen needs a table of contents, it needs a redesign.

## The type scale that worked (a proven register)
Body 14 · labels 12 · section titles 17 · buttons 13. Hierarchy by **size + color**, not by
decoration. Uniform control heights (~34px) across a form. Faint-but-AA labels
(soft ink, not light gray).

## Patterns that earned their place
- **Dot-line values:** selected tags/values as flowing text separated by `•` — calmer than
  bubble-chip walls. Compact native dropdown for "+ Add".
- **Manage rows:** removable items as borderless light-tinted rows with a visible Remove —
  not bare `⋮` menus (undiscoverable = a violation).
- **Edit vs Profile separation:** keep the Edit screen LEAN — don't duplicate pure displays
  that already live read-only on the profile. BUT if the Edit copy carries a needed manage
  action with no other home, keep it COLLAPSED by default rather than deleting it.
- **Collapse, don't delete,** when a section is needed-but-secondary.
- **Empty states tell the truth:** empty-because-no-data ≠ reads-the-wrong-source. Audit which.

## Process
- **Mock = data showcase.** Full rule: pattern 38 in Claude-Core lessons/universal-patterns.md.
- **On a visual complaint ("not aligned"), open the reference image FIRST** and compare anatomy
  before measuring pixels. Red-box annotated screenshots from the user are gold — follow them.
- **Bank a design baseline** once a surface passes review: write down its type scale, control
  heights, and patterns, and hold every next screen to it. Consistency is the compounding win.
- Screenshot desktop AND narrow widths before calling any surface done.
