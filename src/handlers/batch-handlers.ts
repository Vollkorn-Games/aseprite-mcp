import type { ServerContext } from "../context.js";
import type { ToolResponse } from "../types.js";
import {
  normalizeParameters,
  validatePath,
  createErrorResponse,
} from "../utils.js";
import { executeOperation } from "../aseprite-executor.js";

export async function handleBatchExport(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (!args.outputPattern) {
    return createErrorResponse("Missing required parameter: outputPattern", [
      'Provide an output path pattern with placeholders (e.g. "/path/{frame00}.png")',
    ]);
  }

  if (!validatePath(args.inputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide a valid path without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "batch_export", {
      inputPath: args.inputPath,
      outputPattern: args.outputPattern,
      mode: args.mode,
      fromFrame: args.fromFrame,
      toFrame: args.toFrame,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to batch export: ${error?.message ?? "Unknown error"}`,
      ["Ensure the sprite file exists and output pattern is valid"],
    );
  }
}

export async function handleBatchResize(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPaths || !Array.isArray(args.inputPaths)) {
    return createErrorResponse("Missing required parameter: inputPaths", [
      "Provide an array of absolute paths to sprite files",
    ]);
  }

  if (args.scale == null) {
    return createErrorResponse("Missing required parameter: scale", [
      "Provide a scale factor (e.g. 2 for 2x, 0.5 for half)",
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "batch_resize", {
      inputPaths: args.inputPaths,
      scale: args.scale,
      outputDir: args.outputDir,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to batch resize: ${error?.message ?? "Unknown error"}`,
      ["Ensure all input files exist"],
    );
  }
}

export async function handleImportSpritesheet(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.imagePath) {
    return createErrorResponse("Missing required parameter: imagePath", [
      "Provide the absolute path to the sprite sheet PNG",
    ]);
  }

  if (!args.outputPath) {
    return createErrorResponse("Missing required parameter: outputPath", [
      "Provide the absolute path for the output .aseprite file",
    ]);
  }

  if (!args.frameWidth || !args.frameHeight) {
    return createErrorResponse(
      "Missing required parameters: frameWidth, frameHeight",
      ["Provide the dimensions of each frame in the sprite sheet"],
    );
  }

  if (!validatePath(args.imagePath) || !validatePath(args.outputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide valid paths without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "import_spritesheet", {
      imagePath: args.imagePath,
      outputPath: args.outputPath,
      frameWidth: args.frameWidth,
      frameHeight: args.frameHeight,
      duration: args.duration,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to import spritesheet: ${error?.message ?? "Unknown error"}`,
      ["Ensure the image file exists and frame dimensions are correct"],
    );
  }
}
