import { promisify } from "util";
import { execFile } from "child_process";
import type { ServerContext } from "./context.js";
import type { OperationParams } from "./types.js";
import { logDebug } from "./utils.js";
import { ensureAsepritePath } from "./aseprite-path.js";

const execFileAsync = promisify(execFile);

/**
 * Execute a Lua operation in Aseprite batch mode.
 *
 * Spawns: aseprite -b --script-param operation=<op> --script-param params='<json>' --script <scriptPath>
 *
 * The Lua script reads app.params.operation and app.params.params,
 * performs the operation, and prints JSON results to stdout.
 */
export async function executeOperation(
  ctx: ServerContext,
  operation: string,
  params: OperationParams,
): Promise<{ stdout: string; stderr: string }> {
  logDebug(ctx.debugMode, `Executing operation: ${operation}`);
  logDebug(ctx.debugMode, `Operation params: ${JSON.stringify(params)}`);

  const asepritePath = await ensureAsepritePath(ctx);
  if (!asepritePath) {
    throw new Error("Could not find a valid Aseprite executable path");
  }

  try {
    const paramsJson = JSON.stringify(params);

    const args = [
      "-b",
      "--script-param",
      `operation=${operation}`,
      "--script-param",
      `params=${paramsJson}`,
      "--script",
      ctx.operationsScriptPath,
    ];

    logDebug(ctx.debugMode, `Executing: ${asepritePath} ${args.join(" ")}`);

    const { stdout, stderr } = await execFileAsync(asepritePath, args);

    return { stdout, stderr };
  } catch (error: unknown) {
    if (error instanceof Error && "stdout" in error && "stderr" in error) {
      const execError = error as Error & { stdout: string; stderr: string };
      return {
        stdout: execError.stdout,
        stderr: execError.stderr,
      };
    }

    throw error;
  }
}

/**
 * Run Aseprite with arbitrary CLI arguments.
 * Unlike executeOperation(), this does not assume the operations.lua script —
 * the caller builds the full args array.
 */
export async function executeAsepriteArgs(
  ctx: ServerContext,
  args: string[],
  options?: { timeout?: number },
): Promise<{ stdout: string; stderr: string }> {
  const asepritePath = await ensureAsepritePath(ctx);
  if (!asepritePath) {
    throw new Error("Could not find a valid Aseprite executable path");
  }

  logDebug(ctx.debugMode, `Executing: ${asepritePath} ${args.join(" ")}`);

  try {
    const { stdout, stderr } = await execFileAsync(asepritePath, args, {
      timeout: options?.timeout,
    });
    return { stdout, stderr };
  } catch (error: unknown) {
    if (error instanceof Error && "stdout" in error && "stderr" in error) {
      const execError = error as Error & { stdout: string; stderr: string };
      return { stdout: execError.stdout, stderr: execError.stderr };
    }
    throw error;
  }
}
