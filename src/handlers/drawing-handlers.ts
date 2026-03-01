import type { ServerContext } from "../context.js";
import type { ToolResponse } from "../types.js";
import {
  normalizeParameters,
  validatePath,
  createErrorResponse,
} from "../utils.js";
import { executeOperation } from "../aseprite-executor.js";

export async function handleDrawPixel(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (args.x == null || args.y == null) {
    return createErrorResponse("Missing required parameters: x, y", [
      "Provide x and y coordinates for the pixel",
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
    const { stdout } = await executeOperation(ctx, "draw_pixel", {
      inputPath: args.inputPath,
      x: args.x,
      y: args.y,
      color: args.color,
      frameNumber: args.frameNumber,
      layerIndex: args.layerIndex,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to draw pixel: ${error?.message ?? "Unknown error"}`,
      ["Ensure coordinates are within sprite bounds"],
    );
  }
}

export async function handleDrawPixels(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (!args.pixels || !Array.isArray(args.pixels)) {
    return createErrorResponse("Missing required parameter: pixels", [
      "Provide an array of pixel objects: [{ x, y, color }, ...]",
    ]);
  }

  if (!validatePath(args.inputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide a valid path without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "draw_pixels", {
      inputPath: args.inputPath,
      pixels: args.pixels,
      frameNumber: args.frameNumber,
      layerIndex: args.layerIndex,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to draw pixels: ${error?.message ?? "Unknown error"}`,
      ["Ensure coordinates are within sprite bounds"],
    );
  }
}

export async function handleDrawLine(
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
    args.x1 == null ||
    args.y1 == null ||
    args.x2 == null ||
    args.y2 == null
  ) {
    return createErrorResponse("Missing required parameters: x1, y1, x2, y2", [
      "Provide start and end coordinates for the line",
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
    const { stdout } = await executeOperation(ctx, "draw_line", {
      inputPath: args.inputPath,
      x1: args.x1,
      y1: args.y1,
      x2: args.x2,
      y2: args.y2,
      color: args.color,
      brushSize: args.brushSize,
      frameNumber: args.frameNumber,
      layerIndex: args.layerIndex,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to draw line: ${error?.message ?? "Unknown error"}`,
      ["Ensure coordinates are within sprite bounds"],
    );
  }
}

export async function handleDrawRect(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (args.x == null || args.y == null || !args.width || !args.height) {
    return createErrorResponse(
      "Missing required parameters: x, y, width, height",
      ["Provide rectangle position and dimensions"],
    );
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
    const { stdout } = await executeOperation(ctx, "draw_rect", {
      inputPath: args.inputPath,
      x: args.x,
      y: args.y,
      width: args.width,
      height: args.height,
      color: args.color,
      filled: args.filled,
      brushSize: args.brushSize,
      frameNumber: args.frameNumber,
      layerIndex: args.layerIndex,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to draw rectangle: ${error?.message ?? "Unknown error"}`,
      ["Ensure coordinates are within sprite bounds"],
    );
  }
}

export async function handleDrawEllipse(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (args.x == null || args.y == null || !args.width || !args.height) {
    return createErrorResponse(
      "Missing required parameters: x, y, width, height",
      ["Provide ellipse bounding box position and dimensions"],
    );
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
    const { stdout } = await executeOperation(ctx, "draw_ellipse", {
      inputPath: args.inputPath,
      x: args.x,
      y: args.y,
      width: args.width,
      height: args.height,
      color: args.color,
      filled: args.filled,
      brushSize: args.brushSize,
      frameNumber: args.frameNumber,
      layerIndex: args.layerIndex,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to draw ellipse: ${error?.message ?? "Unknown error"}`,
      ["Ensure coordinates are within sprite bounds"],
    );
  }
}

export async function handleFloodFill(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (args.x == null || args.y == null) {
    return createErrorResponse("Missing required parameters: x, y", [
      "Provide the starting point for flood fill",
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
    const { stdout } = await executeOperation(ctx, "flood_fill", {
      inputPath: args.inputPath,
      x: args.x,
      y: args.y,
      color: args.color,
      frameNumber: args.frameNumber,
      layerIndex: args.layerIndex,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to flood fill: ${error?.message ?? "Unknown error"}`,
      ["Ensure coordinates are within sprite bounds"],
    );
  }
}

export async function handleDrawImage(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (!args.imagePath) {
    return createErrorResponse("Missing required parameter: imagePath", [
      "Provide the absolute path to the external image file (PNG)",
    ]);
  }

  if (!validatePath(args.inputPath) || !validatePath(args.imagePath)) {
    return createErrorResponse("Invalid path", [
      'Provide valid paths without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "draw_image", {
      inputPath: args.inputPath,
      imagePath: args.imagePath,
      x: args.x,
      y: args.y,
      frameNumber: args.frameNumber,
      layerIndex: args.layerIndex,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to draw image: ${error?.message ?? "Unknown error"}`,
      ["Ensure both sprite and image files exist"],
    );
  }
}

export async function handleDrawCircle(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (args.centerX == null || args.centerY == null) {
    return createErrorResponse(
      "Missing required parameters: centerX, centerY",
      ["Provide the center coordinates for the circle"],
    );
  }

  if (args.radius == null) {
    return createErrorResponse("Missing required parameter: radius", [
      "Provide the circle radius in pixels",
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
    const { stdout } = await executeOperation(ctx, "draw_circle", {
      inputPath: args.inputPath,
      centerX: args.centerX,
      centerY: args.centerY,
      radius: args.radius,
      color: args.color,
      filled: args.filled,
      brushSize: args.brushSize,
      frameNumber: args.frameNumber,
      layerIndex: args.layerIndex,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to draw circle: ${error?.message ?? "Unknown error"}`,
      ["Ensure coordinates are within sprite bounds"],
    );
  }
}

export async function handleReplaceColor(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (!args.fromColor) {
    return createErrorResponse("Missing required parameter: fromColor", [
      'Provide the color to replace as hex string (e.g. "#ff0000")',
    ]);
  }

  if (!args.toColor) {
    return createErrorResponse("Missing required parameter: toColor", [
      'Provide the replacement color as hex string (e.g. "#00ff00")',
    ]);
  }

  if (!validatePath(args.inputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide a valid path without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "replace_color", {
      inputPath: args.inputPath,
      fromColor: args.fromColor,
      toColor: args.toColor,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to replace color: ${error?.message ?? "Unknown error"}`,
      ["Ensure the sprite file exists"],
    );
  }
}

export async function handleOutline(
  ctx: ServerContext,
  args: any,
): Promise<ToolResponse> {
  args = normalizeParameters(args);

  if (!args.inputPath) {
    return createErrorResponse("Missing required parameter: inputPath", [
      "Provide the absolute path to the sprite file",
    ]);
  }

  if (!args.color) {
    return createErrorResponse("Missing required parameter: color", [
      'Provide the outline color as hex string (e.g. "#000000")',
    ]);
  }

  if (!validatePath(args.inputPath)) {
    return createErrorResponse("Invalid path", [
      'Provide a valid path without ".."',
    ]);
  }

  try {
    const { stdout } = await executeOperation(ctx, "outline", {
      inputPath: args.inputPath,
      color: args.color,
      frameNumber: args.frameNumber,
      layerIndex: args.layerIndex,
      outputPath: args.outputPath,
    });

    return { content: [{ type: "text", text: stdout }] };
  } catch (error: any) {
    return createErrorResponse(
      `Failed to add outline: ${error?.message ?? "Unknown error"}`,
      ["Ensure the sprite has non-transparent pixels to outline"],
    );
  }
}
