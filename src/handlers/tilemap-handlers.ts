import type { ServerContext } from "../context.js";
import type { ToolResponse } from "../types.js";
import {
  normalizeParameters,
  validatePath,
  createErrorResponse,
} from "../utils.js";
import { executeOperation } from "../aseprite-executor.js";

export async function handleCreateTilemapLayer(
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
    const { stdout } = await executeOperation(ctx, "create_tilemap_layer", {
      inputPath: args.inputPath,
      name: args.name,
      tileWidth: args.tileWidth,
      tileHeight: args.tileHeight,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to create tilemap layer: ${error?.message ?? "Unknown error"}`,
      ["Ensure Aseprite 1.3+ is installed for tilemap support"],
    );
  }
}

export async function handleSetTile(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (args.col == null || args.row == null || args.tileIndex == null) {
    return createErrorResponse(
      "Missing required parameters: col, row, tileIndex",
      ["Provide tile coordinates and tile index"],
    );
  }

  if (!validatePath(args.inputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide a valid path without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "set_tile", {
      inputPath: args.inputPath,
      col: args.col,
      row: args.row,
      tileIndex: args.tileIndex,
      layerIndex: args.layerIndex,
      frameNumber: args.frameNumber,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to set tile: ${error?.message ?? "Unknown error"}`,
      ["Ensure the layer is a tilemap layer"],
    );
  }
}

export async function handleGetTilesetInfo(
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
    const { stdout } = await executeOperation(ctx, "get_tileset_info", {
      inputPath: args.inputPath,
      layerIndex: args.layerIndex,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to get tileset info: ${error?.message ?? "Unknown error"}`,
      ["Ensure the sprite has a tilemap layer"],
    );
  }
}
