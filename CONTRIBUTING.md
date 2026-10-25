# Contributing

Bug reports, design ideas, documentation improvements, and pull requests are
welcome. For component and interface changes, describe the intended use and
compatibility impact in an issue first.

Use Node.js 24+ and pnpm 10.20.0:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm typecheck
pnpm test
```

Include focused regression coverage for behavior changes. Check component
appearance in light and dark themes, and update examples when the API changes.

Contributions are submitted under Apache-2.0. Contributors retain copyright in
their work.
