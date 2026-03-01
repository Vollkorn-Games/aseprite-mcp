import type { ServerContext } from "../context.js";
import type { ToolResponse } from "../types.js";
import {
  normalizeParameters,
  validatePath,
  createErrorResponse,
} from "../utils.js";
import { executeOperation, executeAsepriteArgs } from "../aseprite-executor.js";

export async function handleExportPng(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (!args.outputPath) {
    return createErrorResponse("Missing required parameter: outputPath", [
      "Provide the absolute path for the output PNG file",
    ]);
  }

  if (!validatePath(args.inputPath) || !validatePath(args.outputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide valid paths without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "export_png", {
      inputPath: args.inputPath,
      outputPath: args.outputPath,
      frameNumber: args.frameNumber,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to export PNG: ${error?.message ?? "Unknown error"}`,
      ["Ensure the sprite file exists and output path is writable"],
    );
  }
}

export async function handleExportSpritesheet(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (!args.outputPath) {
    return createErrorResponse("Missing required parameter: outputPath", [
      "Provide the absolute path for the sprite sheet PNG",
    ]);
  }

  if (!validatePath(args.inputPath) || !validatePath(args.outputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide valid paths without ".."',
    ]);
  }

  try {
    // Use Aseprite CLI directly for sprite sheet export
    const cliArgs = ["-b", args.inputPath, "--sheet", args.outputPath];

    if (args.dataPath) {
      cliArgs.push("--data", args.dataPath);
    }

    if (args.sheetType) {
      cliArgs.push("--sheet-type", args.sheetType);
    }

    if (args.borderPadding != null) {
      cliArgs.push("--border-padding", String(args.borderPadding));
    }

    if (args.shapePadding != null) {
      cliArgs.push("--shape-padding", String(args.shapePadding));
    }

    if (args.innerPadding != null) {
      cliArgs.push("--inner-padding", String(args.innerPadding));
    }

    const { stdout, stderr } = await executeAsepriteArgs(ctx, cliArgs);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            sheetPath: args.outputPath,
            dataPath: args.dataPath ?? null,
            sheetType: args.sheetType ?? "packed",
            stdout: stdout.trim(),
            stderr: stderr.trim(),
          }),
        },
      ],
    };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to export sprite sheet: ${error?.message ?? "Unknown error"}`,
      [
        "Ensure the sprite file exists",
        "Check that the output path is writable",
      ],
    );
  }
}

export async function handleExportGif(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (!args.outputPath) {
    return createErrorResponse("Missing required parameter: outputPath", [
      "Provide the absolute path for the output GIF file",
    ]);
  }

  if (!validatePath(args.inputPath) || !validatePath(args.outputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide valid paths without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "export_gif", {
      inputPath: args.inputPath,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to export GIF: ${error?.message ?? "Unknown error"}`,
      ["Ensure the sprite file exists and output path is writable"],
    );
  }
}
