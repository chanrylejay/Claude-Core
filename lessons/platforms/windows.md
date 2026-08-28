# Windows — platform gotchas

(One platform, one file — split Aug 28 2026 from `../platform-gotchas.md`, which is now the
index. The parent holds the two standing laws that govern every entry here — the
irreversible-action duplication law and the written-out GO law — read them once per session
before acting on anything below. Bodies moved verbatim.)

- Git Bash `tar` is GNU tar: `tar -tf C:/path/x.zip` reads `C:` as a remote host ("Cannot connect to C") and GNU tar cannot read zip; cd in and use a relative name, or use `unzip`.
