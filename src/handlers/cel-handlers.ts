import type { ServerContext } from "../context.js";
import type { ToolResponse } from "../types.js";
import {
  normalizeParameters,
  validatePath,
  createErrorResponse,
} from "../utils.js";
import { executeOperation } from "../aseprite-executor.js";

export async function handleClearCel(
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
    const { stdout } = await executeOperation(ctx, "clear_cel", {
      inputPath: args.inputPath,
      frameNumber: args.frameNumber,
      layerIndex: args.layerIndex,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to clear cel: ${error?.message ?? "Unknown error"}`,
      ["Ensure the frame and layer exist in the sprite"],
    );
  }
}

export async function handleGetCelInfo(
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
    const { stdout } = await executeOperation(ctx, "get_cel_info", {
      inputPath: args.inputPath,
      frameNumber: args.frameNumber,
      layerIndex: args.layerIndex,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to get cel info: ${error?.message ?? "Unknown error"}`,
      ["Ensure the frame and layer exist in the sprite"],
    );
  }
}

export async function handleCopyCel(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (
    args.sourceFrame == null ||
    args.sourceLayer == null ||
    args.destFrame == null ||
    args.destLayer == null
  ) {
    return createErrorResponse(
      "Missing required parameters: sourceFrame, sourceLayer, destFrame, destLayer",
      ["Provide source and destination frame/layer indices"],
    );
  }

  if (!validatePath(args.inputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide a valid path without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "copy_cel", {
      inputPath: args.inputPath,
      sourceFrame: args.sourceFrame,
      sourceLayer: args.sourceLayer,
      destFrame: args.destFrame,
      destLayer: args.destLayer,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to copy cel: ${error?.message ?? "Unknown error"}`,
      ["Ensure source and destination frames/layers exist"],
    );
  }
}

export async function handleMoveCel(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (args.offsetX == null && args.offsetY == null) {
    return createErrorResponse(
      "At least one of offsetX or offsetY is required",
      ["Provide offsetX and/or offsetY to move the cel"],
    );
  }

  if (!validatePath(args.inputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide a valid path without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "move_cel", {
      inputPath: args.inputPath,
      offsetX: args.offsetX ?? 0,
      offsetY: args.offsetY ?? 0,
      frameNumber: args.frameNumber,
      layerIndex: args.layerIndex,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to move cel: ${error?.message ?? "Unknown error"}`,
      ["Ensure a cel exists at the specified frame/layer"],
    );
  }
}
