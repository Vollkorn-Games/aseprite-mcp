import { existsSync } from "fs";
import { normalize } from "path";
import { promisify } from "util";
import { execFile } from "child_process";
import type { ServerContext } from "./context.js";
import { logDebug } from "./utils.js";

const execFileAsync = promisify(execFile);

export function isValidAsepritePathSync(
  path: string,
  debugMode: boolean,
): boolean {
  try {
    logDebug(debugMode, `Quick-validating Aseprite path: ${path}`);
    return path === "aseprite" || existsSync(path);
  } catch (error) {
    logDebug(
      debugMode,
      `Invalid Aseprite path: ${path}, error: ${String(error)}`,
    );
    return false;
  }
}

export async function isValidAsepritePath(
  ctx: ServerContext,
  path: string,
): Promise<boolean> {
  if (ctx.validatedPaths.has(path)) {
    return ctx.validatedPaths.get(path)!;
  }

  try {
    logDebug(ctx.debugMode, `Validating Aseprite path: ${path}`);

    if (path !== "aseprite" && !existsSync(path)) {
      logDebug(ctx.debugMode, `Path does not exist: ${path}`);
      ctx.validatedPaths.set(path, false);
      return false;
    }

    await execFileAsync(path, ["--version"]);

    logDebug(ctx.debugMode, `Valid Aseprite path: ${path}`);
    ctx.validatedPaths.set(path, true);
    return true;
  } catch (error) {
    logDebug(
      ctx.debugMode,
      `Invalid Aseprite path: ${path}, error: ${String(error)}`,
    );
    ctx.validatedPaths.set(path, false);
    return false;
  }
}

export async function detectAsepritePath(ctx: ServerContext): Promise<void> {
  if (ctx.asepritePath && (await isValidAsepritePath(ctx, ctx.asepritePath))) {
    logDebug(
      ctx.debugMode,
      `Using existing Aseprite path: ${ctx.asepritePath}`,
    );
    return;
  }

  if (process.env.ASEPRITE_PATH) {
    const normalizedPath = normalize(process.env.ASEPRITE_PATH);
    logDebug(
      ctx.debugMode,
      `Checking ASEPRITE_PATH environment variable: ${normalizedPath}`,
    );
    if (await isValidAsepritePath(ctx, normalizedPath)) {
      ctx.asepritePath = normalizedPath;
      logDebug(
        ctx.debugMode,
        `Using Aseprite path from environment: ${ctx.asepritePath}`,
      );
      return;
    } else {
      logDebug(ctx.debugMode, `ASEPRITE_PATH environment variable is invalid`);
    }
  }

  const osPlatform = process.platform;
  logDebug(
    ctx.debugMode,
    `Auto-detecting Aseprite path for platform: ${osPlatform}`,
  );

  const possiblePaths: string[] = ["aseprite"];

  if (osPlatform === "darwin") {
    possiblePaths.push(
      "/Applications/Aseprite.app/Contents/MacOS/aseprite",
      `${process.env.HOME}/Applications/Aseprite.app/Contents/MacOS/aseprite`,
      `${process.env.HOME}/Library/Application Support/Steam/steamapps/common/Aseprite/aseprite`,
    );
  } else if (osPlatform === "win32") {
    possiblePaths.push(
      "C:\\Program Files\\Aseprite\\Aseprite.exe",
      "C:\\Program Files (x86)\\Aseprite\\Aseprite.exe",
      "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Aseprite\\Aseprite.exe",
      `${process.env.LOCALAPPDATA}\\Programs\\Aseprite\\Aseprite.exe`,
    );
  } else if (osPlatform === "linux") {
    possiblePaths.push(
      "/usr/bin/aseprite",
      "/usr/local/bin/aseprite",
      `${process.env.HOME}/.local/bin/aseprite`,
      `${process.env.HOME}/.steam/steam/steamapps/common/Aseprite/aseprite`,
      "/snap/bin/aseprite",
    );
  }

  for (const path of possiblePaths) {
    const normalizedPath = normalize(path);
    if (await isValidAsepritePath(ctx, normalizedPath)) {
      ctx.asepritePath = normalizedPath;
      logDebug(ctx.debugMode, `Found Aseprite at: ${normalizedPath}`);
      return;
    }
  }

  logDebug(
    ctx.debugMode,
    `Warning: Could not find Aseprite in common locations for ${osPlatform}`,
  );
  console.error(
    `[SERVER] Could not find Aseprite in common locations for ${osPlatform}`,
  );
  console.error(
    `[SERVER] Set ASEPRITE_PATH=/path/to/aseprite environment variable or pass { asepritePath: '/path/to/aseprite' } in the config to specify the correct path.`,
  );
}

export async function setAsepritePath(
  ctx: ServerContext,
  customPath: string,
): Promise<boolean> {
  if (!customPath) {
    return false;
  }

  const normalizedPath = normalize(customPath);
  if (await isValidAsepritePath(ctx, normalizedPath)) {
    ctx.asepritePath = normalizedPath;
    logDebug(ctx.debugMode, `Aseprite path set to: ${normalizedPath}`);
    return true;
  }

  logDebug(
    ctx.debugMode,
    `Failed to set invalid Aseprite path: ${normalizedPath}`,
  );
  return false;
}

export async function ensureAsepritePath(
  ctx: ServerContext,
): Promise<string | null> {
  if (!ctx.asepritePath) {
    await detectAsepritePath(ctx);
  }
  return ctx.asepritePath;
}
