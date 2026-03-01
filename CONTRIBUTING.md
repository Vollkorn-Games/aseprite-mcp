# Contributing to Aseprite MCP

Thank you for considering contributing to Aseprite MCP! This document outlines the process for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

- Check if the bug has already been reported in the Issues section
- Include detailed steps to reproduce the bug
- Include any relevant logs or screenshots
- Specify your environment (OS, Aseprite version, Node.js version)

### Pull Requests

1. Fork the repository
2. Create a new branch for your feature or bugfix (`git checkout -b feature/amazing-feature`)
3. Make your changes following the [tool checklist](#adding-new-tools)
4. Run the full CI validation: `pnpm lint && pnpm format:check && pnpm typecheck && pnpm build && pnpm test`
5. Commit your changes with clear commit messages
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Process

### Setting Up the Development Environment

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Build: `pnpm build`
4. Run tests: `pnpm test` (requires Aseprite installed — set `ASEPRITE_PATH` if not in a standard location)
5. For development with auto-rebuild: `pnpm watch`

### Key Commands

| Command             | What it does                                    |
| ------------------- | ----------------------------------------------- |
| `pnpm build`        | TypeScript compile + copy Lua scripts to build/ |
| `pnpm test`         | Run all vitest tests (requires Aseprite)        |
| `pnpm lint`         | ESLint with strict TypeScript checking          |
| `pnpm format:check` | Prettier formatting check                       |
| `pnpm typecheck`    | `tsc --noEmit`                                  |

### Project Structure

```
aseprite-mcp/
├── src/
│   ├── index.ts                # Entry point, MCP server setup
│   ├── context.ts              # ServerContext class (runtime state)
│   ├── tool-definitions.ts     # MCP tool schemas (JSON)
│   ├── tool-router.ts          # Maps tool names → handler functions
│   ├── aseprite-executor.ts    # Spawns Aseprite in batch mode
│   ├── aseprite-path.ts        # Aseprite binary path resolution
│   ├── types.ts                # Shared TypeScript types
│   ├── utils.ts                # normalizeParameters, validatePath, etc.
│   ├── handlers/               # One file per domain
│   │   ├── sprite-handlers.ts
│   │   ├── layer-handlers.ts
│   │   ├── frame-handlers.ts
│   │   ├── drawing-handlers.ts
│   │   ├── palette-handlers.ts
│   │   ├── selection-handlers.ts
│   │   ├── transform-handlers.ts
│   │   ├── tag-handlers.ts
│   │   ├── export-handlers.ts
│   │   └── cel-handlers.ts
│   └── scripts/
│       └── operations.lua      # Lua operations dispatched by Aseprite
├── test/
│   ├── setup.ts                # Creates ServerContext for tests
│   ├── helpers.ts              # assertSuccess(), assertError(), TestCleanup
│   ├── unit/                   # Pure function tests
│   └── integration/            # Handler tests against real Aseprite
├── build/                      # Compiled output (generated)
├── CLAUDE.md                   # Instructions for Claude Code
└── vitest.config.ts            # Test runner config
```

### Architecture

All tools spawn Aseprite in batch mode with a Lua script:

```
aseprite -b --script-param operation=<name> --script-param params='<json>' --script operations.lua
```

The Lua script (`src/scripts/operations.lua`) reads `app.params.operation` and `app.params.params`, executes the operation using Aseprite's Lua API, and prints JSON results to stdout.

All handlers share the same signature: `async (ctx: ServerContext, args: any) => ToolResponse`.

### Adding New Tools

Every new tool must be reflected in **all** of these:

1. **Lua script** — Add operation handler function in `src/scripts/operations.lua`
2. **Handler** — Add or create a handler function in `src/handlers/*.ts`
3. **Tool definition** — Add the JSON schema in `src/tool-definitions.ts`
4. **Router** — Wire the handler in `src/tool-router.ts`
5. **Tests** — Add at least parameter validation tests in `test/integration/`
6. **README.md** — Update the tool count and the relevant tool table

### Conventions

- Use `pnpm` (not `npm` or `yarn`)
- Use `execFileAsync` (not `execAsync`) for Aseprite — avoids shell, fixes Windows JSON parsing
- Always `normalizeParameters(args)` at handler entry to support both camelCase and snake_case
- Always `validatePath()` on user-provided paths before filesystem access
- Error responses use `createErrorResponse()` with helpful `possibleSolutions`
- Use `killProcess()` (awaits exit) instead of bare `.kill()` for process cleanup

### Cross-Platform Compatibility

- Use `path.join()` instead of hardcoded path separators
- Use `execFileAsync` with args as array (no shell interpolation)
- Consider different Aseprite installation locations (`ASEPRITE_PATH` env var)

### Debugging

1. Set the `DEBUG` environment variable to `true`
2. Use the MCP Inspector: `pnpm inspector`
3. Check stderr output for `[SERVER]` prefixed log messages

## Testing

- Integration tests call handlers directly against a real Aseprite engine
- No mocking — full stack verification (handler → Aseprite executor → Lua script → filesystem)
- Tests run sequentially — Aseprite batch processes on the same files could conflict
- Always run `pnpm test` before submitting a PR

## Questions?

If you have any questions about contributing, feel free to open an issue for discussion.
