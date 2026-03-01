#!/usr/bin/env node
/**
 * Aseprite MCP Server
 *
 * This MCP server provides tools for interacting with the Aseprite pixel art editor.
 * It enables AI assistants to create sprites, draw pixel art, manage layers/frames/palettes,
 * create animations, and export assets.
 */

import { fileURLToPath } from "url";
import { join, dirname, normalize } from "path";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import type { AsepriteServerConfig } from "./types.js";
import { ServerContext } from "./context.js";
import {
  detectAsepritePath,
  isValidAsepritePathSync,
} from "./aseprite-path.js";
import { logDebug } from "./utils.js";
import { setupToolHandlers } from "./tool-router.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main(config?: AsepriteServerConfig) {
  // Merge environment variables into config (config values take precedence)
  const mergedConfig: AsepriteServerConfig = { ...config };
  if (!mergedConfig.toolsets && process.env.MCP_TOOLSETS) {
    mergedConfig.toolsets = process.env.MCP_TOOLSETS.split(",").map((s) =>
      s.trim(),
    );
  }
  if (!mergedConfig.excludeTools && process.env.MCP_EXCLUDE_TOOLS) {
    mergedConfig.excludeTools = process.env.MCP_EXCLUDE_TOOLS.split(",").map(
      (s) => s.trim(),
    );
  }
  if (mergedConfig.readOnly == null && process.env.MCP_READ_ONLY === "true") {
    mergedConfig.readOnly = true;
  }

  const operationsScriptPath = join(__dirname, "scripts", "operations.lua");
  const ctx = new ServerContext(mergedConfig, operationsScriptPath);

  if (ctx.debugMode) {
    console.error(`[DEBUG] Operations script path: ${operationsScriptPath}`);
  }

  if (ctx.toolsets) {
    console.error(
      `[SERVER] Toolset filter active: ${[...ctx.toolsets].join(", ")}`,
    );
  }
  if (ctx.excludeTools.size > 0) {
    console.error(
      `[SERVER] Excluded tools: ${[...ctx.excludeTools].join(", ")}`,
    );
  }
  if (ctx.readOnly) {
    console.error("[SERVER] Read-only mode enabled");
  }

  // Handle initial aseprite path from config
  if (config?.asepritePath) {
    const normalizedPath = normalize(config.asepritePath);
    ctx.asepritePath = normalizedPath;
    logDebug(
      ctx.debugMode,
      `Custom Aseprite path provided: ${ctx.asepritePath}`,
    );

    if (!isValidAsepritePathSync(ctx.asepritePath, ctx.debugMode)) {
      console.warn(
        `[SERVER] Invalid custom Aseprite path provided: ${ctx.asepritePath}`,
      );
      ctx.asepritePath = null;
    }
  }

  const server = new Server(
    { name: "aseprite-mcp", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  server.onerror = (error) => console.error("[MCP Error]", error);

  setupToolHandlers(server, ctx);

  // Detect Aseprite path and start
  await detectAsepritePath(ctx);

  if (!ctx.asepritePath) {
    console.error("[SERVER] Failed to find a valid Aseprite executable path");
    console.error(
      "[SERVER] Please set ASEPRITE_PATH environment variable or provide a valid path",
    );
    process.exit(1);
  }

  console.error(`[SERVER] Using Aseprite at: ${ctx.asepritePath}`);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Aseprite MCP server running on stdio");
}

main().catch((error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  console.error("Failed to run server:", errorMessage);
  process.exit(1);
});
