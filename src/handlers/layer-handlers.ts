import type { ServerContext } from "../context.js";
import type { ToolResponse } from "../types.js";
import {
  normalizeParameters,
  validatePath,
  createErrorResponse,
} from "../utils.js";
import { executeOperation } from "../aseprite-executor.js";

export async function handleAddLayer(
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
    const { stdout } = await executeOperation(ctx, "add_layer", {
      inputPath: args.inputPath,
      name: args.name,
      type: args.type,
      opacity: args.opacity,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to add layer: ${error?.message ?? "Unknown error"}`,
      ["Ensure the sprite file exists and is valid"],
    );
  }
}

export async function handleRemoveLayer(
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

  if (!args.layerName && args.layerIndex == null) {
    return createErrorResponse("Missing layer identifier", [
      "Provide either layerName or layerIndex to identify the layer",
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "remove_layer", {
      inputPath: args.inputPath,
      layerName: args.layerName,
      layerIndex: args.layerIndex,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to remove layer: ${error?.message ?? "Unknown error"}`,
      ["Ensure the layer exists in the sprite"],
    );
  }
}

export async function handleSetLayerProperties(
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

  if (!args.layerName && args.layerIndex == null) {
    return createErrorResponse("Missing layer identifier", [
      "Provide either layerName or layerIndex to identify the layer",
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "set_layer_properties", {
      inputPath: args.inputPath,
      layerName: args.layerName,
      layerIndex: args.layerIndex,
      name: args.name,
      opacity: args.opacity,
      blendMode: args.blendMode,
      isVisible: args.isVisible,
      isEditable: args.isEditable,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to set layer properties: ${error?.message ?? "Unknown error"}`,
      ["Ensure the layer exists in the sprite"],
    );
  }
}

export async function handleListLayers(
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
    const { stdout } = await executeOperation(ctx, "list_layers", {
      inputPath: args.inputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to list layers: ${error?.message ?? "Unknown error"}`,
      ["Ensure the sprite file exists and is valid"],
    );
  }
}

export async function handleFlattenLayers(
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
    const { stdout } = await executeOperation(ctx, "flatten_layers", {
      inputPath: args.inputPath,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to flatten layers: ${error?.message ?? "Unknown error"}`,
      ["Ensure the sprite file exists and is valid"],
    );
  }
}
