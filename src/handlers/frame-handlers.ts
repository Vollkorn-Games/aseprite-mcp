import type { ServerContext } from "../context.js";
import type { ToolResponse } from "../types.js";
import {
  normalizeParameters,
  validatePath,
  createErrorResponse,
} from "../utils.js";
import { executeOperation } from "../aseprite-executor.js";

export async function handleAddFrame(
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
    const { stdout } = await executeOperation(ctx, "add_frame", {
      inputPath: args.inputPath,
      copyFrom: args.copyFrom,
      afterFrame: args.afterFrame,
      duration: args.duration,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to add frame: ${error?.message ?? "Unknown error"}`,
      ["Ensure the sprite file exists"],
    );
  }
}

export async function handleRemoveFrame(
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
    const { stdout } = await executeOperation(ctx, "remove_frame", {
      inputPath: args.inputPath,
      frameNumber: args.frameNumber,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to remove frame: ${error?.message ?? "Unknown error"}`,
      ["Cannot remove the last frame from a sprite"],
    );
  }
}

export async function handleSetFrameDuration(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (args.duration == null) {
    return createErrorResponse("Missing required parameter: duration", [
      "Provide duration in seconds (e.g. 0.1 for 100ms)",
    ]);
  }

  if (!validatePath(args.inputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide a valid path without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "set_frame_duration", {
      inputPath: args.inputPath,
      frameNumber: args.frameNumber,
      duration: args.duration,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to set frame duration: ${error?.message ?? "Unknown error"}`,
      ["Ensure the frame number is valid"],
    );
  }
}

export async function handleListFrames(
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
    const { stdout } = await executeOperation(ctx, "list_frames", {
      inputPath: args.inputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to list frames: ${error?.message ?? "Unknown error"}`,
      ["Ensure the sprite file exists and is valid"],
    );
  }
}

export async function handleReorderFrames(
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
    const { stdout } = await executeOperation(ctx, "reorder_frames", {
      inputPath: args.inputPath,
      reverse: args.reverse ?? true,
      fromFrame: args.fromFrame,
      toFrame: args.toFrame,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to reorder frames: ${error?.message ?? "Unknown error"}`,
      ["Ensure the frame range is valid"],
    );
  }
}

export async function handleDuplicateFrame(
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
    const { stdout } = await executeOperation(ctx, "duplicate_frame", {
      inputPath: args.inputPath,
      frameNumber: args.frameNumber,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to duplicate frame: ${error?.message ?? "Unknown error"}`,
      ["Ensure the frame number is valid"],
    );
  }
}

export async function handleAddFrames(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (!args.count || args.count < 1) {
    return createErrorResponse("Missing required parameter: count", [
      "Provide the number of frames to add (must be at least 1)",
    ]);
  }

  if (!validatePath(args.inputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide a valid path without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "add_frames", {
      inputPath: args.inputPath,
      count: args.count,
      duration: args.duration,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to add frames: ${error?.message ?? "Unknown error"}`,
      ["Ensure the sprite file exists"],
    );
  }
}

export async function handleSetFrameDurations(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (!args.durations || typeof args.durations !== "object") {
    return createErrorResponse("Missing required parameter: durations", [
      'Provide an object mapping frame numbers to durations, e.g. {"1": 0.2, "2": 0.1}',
    ]);
  }

  if (!validatePath(args.inputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide a valid path without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "set_frame_durations", {
      inputPath: args.inputPath,
      durations: args.durations,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to set frame durations: ${error?.message ?? "Unknown error"}`,
      ["Ensure the frame numbers are valid"],
    );
  }
}
