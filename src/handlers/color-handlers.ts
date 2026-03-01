import type { ServerContext } from "../context.js";
import type { ToolResponse } from "../types.js";
import {
  normalizeParameters,
  validatePath,
  createErrorResponse,
} from "../utils.js";
import { executeOperation } from "../aseprite-executor.js";

export async function handleAnalyzeColors(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (!validatePath(args.inputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide a valid path without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "analyze_colors", {
      inputPath: args.inputPath,
      frameNumber: args.frameNumber,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to analyze colors: ${error?.message ?? "Unknown error"}`,
      ["Ensure the sprite file exists and is valid"],
    );
  }
}

export async function handleQuantizeColors(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (args.maxColors == null) {
    return createErrorResponse("Missing required parameter: maxColors", [
      "Provide the maximum number of colors",
    ]);
  }

  if (!validatePath(args.inputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide a valid path without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "quantize_colors", {
      inputPath: args.inputPath,
      maxColors: args.maxColors,
      dithering: args.dithering,
      keepRgb: args.keepRgb,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to quantize colors: ${error?.message ?? "Unknown error"}`,
      ["Ensure the sprite file exists"],
    );
  }
}

export async function handleGeneratePalette(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (!validatePath(args.inputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide a valid path without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "generate_palette", {
      inputPath: args.inputPath,
      maxColors: args.maxColors,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to generate palette: ${error?.message ?? "Unknown error"}`,
      ["Ensure the sprite file exists and has pixel content"],
    );
  }
}

export async function handleColorRamp(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.fromColor) {
    return createErrorResponse("Missing required parameter: fromColor", [
      'Provide the start color as hex string (e.g. "#000000")',
    ]);
  }

  if (!args.toColor) {
    return createErrorResponse("Missing required parameter: toColor", [
      'Provide the end color as hex string (e.g. "#ffffff")',
    ]);
  }

  if (args.inputPath && !validatePath(args.inputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide a valid path without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "color_ramp", {
      fromColor: args.fromColor,
      toColor: args.toColor,
      steps: args.steps,
      inputPath: args.inputPath,
      paletteStart: args.paletteStart,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to generate color ramp: ${error?.message ?? "Unknown error"}`,
      ["Ensure colors are valid hex strings"],
    );
  }
}
