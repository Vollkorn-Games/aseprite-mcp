import type { AsepriteServerConfig } from "./types.js";

export class ServerContext {
  asepritePath: string | null = null;
  validatedPaths = new Map<string, boolean>();
  operationsScriptPath: string;
  debugMode: boolean;

  // Tool filtering
  toolsets: Set<string> | null = null;
  excludeTools = new Set<string>();
  readOnly = false;

  constructor(config: AsepriteServerConfig, operationsScriptPath: string) {
    this.operationsScriptPath = operationsScriptPath;
    this.debugMode = config.debugMode ?? process.env.DEBUG === "true";

    if (config.toolsets && config.toolsets.length > 0) {
      this.toolsets = new Set(config.toolsets);
    }
    if (config.excludeTools && config.excludeTools.length > 0) {
      this.excludeTools = new Set(config.excludeTools);
    }
    if (config.readOnly) {
      this.readOnly = true;
    }
  }
}
