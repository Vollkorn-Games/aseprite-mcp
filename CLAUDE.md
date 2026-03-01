# CLAUDE.md — Project Instructions for Claude Code

## Project Overview

Aseprite MCP Server — a Model Context Protocol server for the Aseprite pixel art editor. Enables AI assistants to create sprites, draw pixel art, manage layers/frames/palettes, create animations, and export assets.

## Before Every Commit

**Always run the full CI validation before committing:**

```bash
pnpm lint && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
```

If formatting fails, fix with `npx prettier --write .` and include in the commit.

Do not commit code that fails any of these checks.

## Key Commands

| Command             | What it does                                    |
| ------------------- | ----------------------------------------------- |
| `pnpm build`        | TypeScript compile + copy Lua scripts to build/ |
| `pnpm test`         | Run all vitest tests (requires Aseprite)        |
| `pnpm test:unit`    | Run only unit tests (no Aseprite needed)        |
| `pnpm lint`         | ESLint with strict TypeScript checking          |
| `pnpm format:check` | Prettier formatting check                       |
| `pnpm typecheck`    | `tsc --noEmit`                                  |

## Architecture

- `src/handlers/` — One file per domain (sprite, layer, frame, drawing, palette, selection, transform, tag, export, cel). All handlers: `async (ctx: ServerContext, args: any) => ToolResponse`
- `src/tool-router.ts` — Maps tool names to handler functions
- `src/tool-definitions.ts` — MCP tool schemas (JSON)
- `src/aseprite-executor.ts` — Spawns Aseprite in batch mode with Lua scripts (`execFileAsync`, no shell, args as array)
- `src/aseprite-path.ts` — Aseprite binary path detection/validation
- `src/context.ts` — `ServerContext` class holding runtime state
- `src/utils.ts` — Shared utilities (normalizeParameters, validatePath, killProcess, createErrorResponse)
- `src/index.ts` — Entry point, uses low-level `Server` API (not `McpServer`)
- `src/scripts/operations.lua` — Single Lua script that dispatches all operations in Aseprite

## How Operations Work

All tools spawn Aseprite in batch mode with a Lua script:

```
aseprite -b --script-param operation=<name> --script-param params='<json>' --script operations.lua
```

The Lua script reads `app.params.operation` and `app.params.params`, executes the operation using Aseprite's Lua API, and prints JSON results to stdout.

## Testing

- Tests live in `test/` — unit tests in `test/unit/`, integration in `test/integration/`
- Integration tests call handlers directly against a real Aseprite engine
- No mocking — full stack verification
- Tests run sequentially (`fileParallelism: false`)
- Test files are created in `test/fixture/` and cleaned up after each test

## Conventions

- Use `execFileAsync` (not `execAsync`) for Aseprite — avoids shell, fixes Windows JSON parsing
- Always `normalizeParameters(args)` at handler entry to support both camelCase and snake_case
- Always `validatePath()` user-provided paths before filesystem access
- Error responses use `createErrorResponse()` with helpful `possibleSolutions`
- Use `killProcess()` (awaits exit) instead of bare `.kill()` for process cleanup

## When Adding or Removing Tools

Every new tool must be reflected in **all** of:

1. **Lua script**: Add operation handler in `src/scripts/operations.lua`
2. **Handler**: Add function in the appropriate `src/handlers/*.ts` file
3. **Tool definition**: Add schema in `src/tool-definitions.ts`
4. **Router**: Wire the handler in `src/tool-router.ts`
5. **Tests**: Add at least parameter validation tests in `test/integration/`
6. **README.md**: Update the tool count and the relevant tool table

Do not commit a new tool without updating README and adding tests.
