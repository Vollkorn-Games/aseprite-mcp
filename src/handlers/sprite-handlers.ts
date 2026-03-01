import type { ServerContext } from "../context.js";
import type { ToolResponse } from "../types.js";
import {
  normalizeParameters,
  validatePath,
  createErrorResponse,
} from "../utils.js";
import { executeOperation } from "../aseprite-executor.js";

export async function handleCreateSprite(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.outputPath) {
    return createErrorResponse("Missing required parameter: outputPath", [
      "Provide the absolute path where the sprite should be saved",
    ]);
  }

  if (!validatePath(args.outputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide a valid path without ".." or other potentially unsafe characters',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "create_sprite", {
      width: args.width ?? 32,
      height: args.height ?? 32,
      colorMode: args.colorMode ?? "rgb",
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to create sprite: ${error?.message ?? "Unknown error"}`,
      [
        "Ensure Aseprite is installed correctly",
        "Check if the ASEPRITE_PATH environment variable is set correctly",
      ],
    );
  }
}

export async function handleOpenSprite(
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
    const { stdout } = await executeOperation(ctx, "open_sprite", {
      inputPath: args.inputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to open sprite: ${error?.message ?? "Unknown error"}`,
      ["Ensure the file exists and is a valid sprite format"],
    );
  }
}

export async function handleGetSpriteInfo(
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
    const { stdout } = await executeOperation(ctx, "get_sprite_info", {
      inputPath: args.inputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to get sprite info: ${error?.message ?? "Unknown error"}`,
      ["Ensure the file exists and is a valid sprite format"],
    );
  }
}

export async function handleSaveSprite(
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

  if (args.outputPath && !validatePath(args.outputPath)) {
    return createErrorResponse("Invalid output path", [
      'Provide a valid path without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "save_sprite", {
      inputPath: args.inputPath,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to save sprite: ${error?.message ?? "Unknown error"}`,
      ["Ensure you have write permissions to the target path"],
    );
  }
}

export async function handleResizeSprite(
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
    const { stdout } = await executeOperation(ctx, "resize_sprite", {
      inputPath: args.inputPath,
      width: args.width,
      height: args.height,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to resize sprite: ${error?.message ?? "Unknown error"}`,
      ["Ensure the file exists and dimensions are valid"],
    );
  }
}
