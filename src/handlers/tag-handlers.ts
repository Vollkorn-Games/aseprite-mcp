import type { ServerContext } from "../context.js";
import type { ToolResponse } from "../types.js";
import {
  normalizeParameters,
  validatePath,
  createErrorResponse,
} from "../utils.js";
import { executeOperation } from "../aseprite-executor.js";

export async function handleCreateTag(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (!args.name) {
    return createErrorResponse("Missing required parameter: name", [
      "Provide a name for the animation tag (e.g. 'idle', 'walk')",
    ]);
  }

  if (!validatePath(args.inputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide a valid path without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "create_tag", {
      inputPath: args.inputPath,
      name: args.name,
      fromFrame: args.fromFrame,
      toFrame: args.toFrame,
      color: args.color,
      aniDir: args.aniDir,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to create tag: ${error?.message ?? "Unknown error"}`,
      ["Ensure the frame range is valid"],
    );
  }
}

export async function handleRemoveTag(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (!args.tagName) {
    return createErrorResponse("Missing required parameter: tagName", [
      "Provide the name of the tag to remove",
    ]);
  }

  if (!validatePath(args.inputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide a valid path without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "remove_tag", {
      inputPath: args.inputPath,
      tagName: args.tagName,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to remove tag: ${error?.message ?? "Unknown error"}`,
      ["Ensure a tag with this name exists in the sprite"],
    );
  }
}

export async function handleListTags(
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
    const { stdout } = await executeOperation(ctx, "list_tags", {
      inputPath: args.inputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to list tags: ${error?.message ?? "Unknown error"}`,
      ["Ensure the sprite file exists and is valid"],
    );
  }
}
