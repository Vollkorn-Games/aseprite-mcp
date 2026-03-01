import type { ServerContext } from "../context.js";
import type { ToolResponse } from "../types.js";
import {
  normalizeParameters,
  validatePath,
  createErrorResponse,
} from "../utils.js";
import { executeOperation } from "../aseprite-executor.js";

export async function handleGetPalette(
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
    const { stdout } = await executeOperation(ctx, "get_palette", {
      inputPath: args.inputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to get palette: ${error?.message ?? "Unknown error"}`,
      ["Ensure the sprite file exists and is valid"],
    );
  }
}

export async function handleSetPaletteColor(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (args.index == null) {
    return createErrorResponse("Missing required parameter: index", [
      "Provide the 0-based palette index",
    ]);
  }

  if (!args.color) {
    return createErrorResponse("Missing required parameter: color", [
      'Provide a hex color string (e.g. "#ff0000")',
    ]);
  }

  if (!validatePath(args.inputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide a valid path without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "set_palette_color", {
      inputPath: args.inputPath,
      index: args.index,
      color: args.color,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to set palette color: ${error?.message ?? "Unknown error"}`,
      ["Ensure the palette index is valid"],
    );
  }
}

export async function handleLoadPalette(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (!args.palettePath) {
    return createErrorResponse("Missing required parameter: palettePath", [
      "Provide the absolute path to the palette file (.gpl, .pal, .aseprite)",
    ]);
  }

  if (!validatePath(args.inputPath) || !validatePath(args.palettePath)) {
    return createErrorResponse("Invalid path", [
      'Provide valid paths without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "load_palette", {
      inputPath: args.inputPath,
      palettePath: args.palettePath,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to load palette: ${error?.message ?? "Unknown error"}`,
      ["Ensure the palette file exists and is a valid format"],
    );
  }
}

export async function handleCreatePalette(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (!args.colors || !Array.isArray(args.colors)) {
    return createErrorResponse("Missing required parameter: colors", [
      'Provide an array of hex color strings: ["#000000", "#ffffff"]',
    ]);
  }

  if (!validatePath(args.inputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide a valid path without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "create_palette", {
      inputPath: args.inputPath,
      colors: args.colors,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to create palette: ${error?.message ?? "Unknown error"}`,
      ["Ensure color values are valid hex strings"],
    );
  }
}

export async function handleResizePalette(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (args.size == null) {
    return createErrorResponse("Missing required parameter: size", [
      "Provide the new palette size (number of entries)",
    ]);
  }

  if (!validatePath(args.inputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide a valid path without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "resize_palette", {
      inputPath: args.inputPath,
      size: args.size,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to resize palette: ${error?.message ?? "Unknown error"}`,
      ["Ensure the size is a positive integer"],
    );
  }
}
