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
