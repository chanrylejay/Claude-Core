# (Project Name)

(One line: what this app is and who uses it.)

- Stack: (framework, language, database)
- Run: (dev command)
- Global context about Chan and the working contract auto-loads from the global hub. Project-only facts go below this line.
- boot_mode: (this project's MODE, a name from Core memory/MEMORY.md `modes:`; the SAME line as this project's AGENTS.md, edited in one commit. Since batch 1b the session hooks read this line and expand it through the kit's one resolver, `templates/boot-resolver.mjs`: the contract, the router, the cold-start set, the mode's files, and the active project's canon in its own mode. Never copy the kit's file lists here or into this project's memory/MEMORY.md; that index keeps its own 🔴 READ-FIRST resume point only. Omit the line for a project with no mode: `mode_default` in the router applies, and the hook says so.)

<!-- Cost line (Aug 28 2026, from Anthropic's session-economics post): list the 2-3 commands
run all day WITH their quiet flags baked in (e.g. "test one file: npx vitest run <file>
--reporter=dot") — every noisy default you leave here reprints into context all session. -->
