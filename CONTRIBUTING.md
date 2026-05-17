# Contributing to NeXra Agent CLI

Thanks for thinking about it! This is the **MIT-licensed client** for the
[NeXra platform](https://nexra-ai.co). PRs welcome for:

- New LLM providers (OpenAI / Anthropic / Gemini / local Ollama / etc)
- New commands (e.g. `nexra ads create`, `nexra blog publish`)
- Better UX in existing commands (better prompts, colors, error messages)
- Bug fixes
- Tests
- Docs

PRs we won't accept:

- Anything that requires changes to the proprietary Studio / Shop server
  (open an issue first — we'll discuss what API surface to add)
- Telemetry, analytics, or other tracking the user didn't opt into
- Bundling closed-source dependencies

## Dev setup

```bash
git clone https://github.com/nexra-ai/agent-cli
cd agent-cli
npm install
npm run dev -- whoami       # runs from src/ via tsx, no build needed
```

For local testing against a self-hosted backend, set `NEXRA_API_URL`:

```bash
NEXRA_API_URL=http://localhost:20009 npm run dev -- login
```

## Code style

- TypeScript strict mode (`tsc --noEmit` passes)
- 2-space indent
- Imports use `.js` extension (NodeNext ESM)
- Zero runtime dependencies if at all possible — keep CLI lightweight
- Each command in its own file under `src/commands/`

## Tests

There aren't any yet. PRs that add tests are very welcome — vitest is the
preferred runner.

## Sign-off

By contributing you agree your contribution is licensed under the same terms
as the project (BUSL-1.1, converting to Apache-2.0 on 2030-05-17) and you have
the right to submit it.
