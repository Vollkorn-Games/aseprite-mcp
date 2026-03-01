import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import type { ServerContext } from "./context.js";
import { logDebug } from "./utils.js";
import { TOOL_DEFINITIONS, type ToolDefinition } from "./tool-definitions.js";
import * as spriteHandlers from "./handlers/sprite-handlers.js";
import * as layerHandlers from "./handlers/layer-handlers.js";
import * as frameHandlers from "./handlers/frame-handlers.js";
import * as drawingHandlers from "./handlers/drawing-handlers.js";
import * as paletteHandlers from "./handlers/palette-handlers.js";
import * as selectionHandlers from "./handlers/selection-handlers.js";
import * as transformHandlers from "./handlers/transform-handlers.js";
import * as tagHandlers from "./handlers/tag-handlers.js";
import * as exportHandlers from "./handlers/export-handlers.js";
import * as celHandlers from "./handlers/cel-handlers.js";
import * as tilemapHandlers from "./handlers/tilemap-handlers.js";
import * as batchHandlers from "./handlers/batch-handlers.js";
import * as colorHandlers from "./handlers/color-handlers.js";

type HandlerFn = (ctx: ServerContext, args: any) => any;

const HANDLER_MAP: Record<string, HandlerFn> = {
  // Sprite management
  create_sprite: spriteHandlers.handleCreateSprite,
  open_sprite: spriteHandlers.handleOpenSprite,
  get_sprite_info: spriteHandlers.handleGetSpriteInfo,
  save_sprite: spriteHandlers.handleSaveSprite,
  resize_sprite: spriteHandlers.handleResizeSprite,

  // Layer operations
  add_layer: layerHandlers.handleAddLayer,
  remove_layer: layerHandlers.handleRemoveLayer,
  set_layer_properties: layerHandlers.handleSetLayerProperties,
  list_layers: layerHandlers.handleListLayers,
  flatten_layers: layerHandlers.handleFlattenLayers,

  // Frame & animation
  add_frame: frameHandlers.handleAddFrame,
  remove_frame: frameHandlers.handleRemoveFrame,
  set_frame_duration: frameHandlers.handleSetFrameDuration,
  list_frames: frameHandlers.handleListFrames,
  reorder_frames: frameHandlers.handleReorderFrames,
  duplicate_frame: frameHandlers.handleDuplicateFrame,

  // Drawing operations
  draw_pixel: drawingHandlers.handleDrawPixel,
  draw_pixels: drawingHandlers.handleDrawPixels,
  draw_line: drawingHandlers.handleDrawLine,
  draw_rect: drawingHandlers.handleDrawRect,
  draw_ellipse: drawingHandlers.handleDrawEllipse,
  flood_fill: drawingHandlers.handleFloodFill,
  draw_image: drawingHandlers.handleDrawImage,
  draw_circle: drawingHandlers.handleDrawCircle,
  replace_color: drawingHandlers.handleReplaceColor,
  outline: drawingHandlers.handleOutline,

  // Palette management
  get_palette: paletteHandlers.handleGetPalette,
  set_palette_color: paletteHandlers.handleSetPaletteColor,
  load_palette: paletteHandlers.handleLoadPalette,
  create_palette: paletteHandlers.handleCreatePalette,
  resize_palette: paletteHandlers.handleResizePalette,

  // Selection operations
  select_rect: selectionHandlers.handleSelectRect,
  select_all: selectionHandlers.handleSelectAll,
  deselect: selectionHandlers.handleDeselect,
  invert_selection: selectionHandlers.handleInvertSelection,

  // Transform operations
  flip_sprite: transformHandlers.handleFlipSprite,
  rotate_sprite: transformHandlers.handleRotateSprite,
  crop_sprite: transformHandlers.handleCropSprite,
  trim_sprite: transformHandlers.handleTrimSprite,

  // Tag operations
  create_tag: tagHandlers.handleCreateTag,
  remove_tag: tagHandlers.handleRemoveTag,
  list_tags: tagHandlers.handleListTags,
  set_tag_properties: tagHandlers.handleSetTagProperties,

  // Export operations
  export_png: exportHandlers.handleExportPng,
  export_spritesheet: exportHandlers.handleExportSpritesheet,
  export_gif: exportHandlers.handleExportGif,

  // Cel operations
  clear_cel: celHandlers.handleClearCel,
  get_cel_info: celHandlers.handleGetCelInfo,
  copy_cel: celHandlers.handleCopyCel,

  // Tilemap operations
  create_tilemap_layer: tilemapHandlers.handleCreateTilemapLayer,
  set_tile: tilemapHandlers.handleSetTile,
  get_tileset_info: tilemapHandlers.handleGetTilesetInfo,

  // Batch operations
  batch_export: batchHandlers.handleBatchExport,
  batch_resize: batchHandlers.handleBatchResize,
  import_spritesheet: batchHandlers.handleImportSpritesheet,

  // Color & analysis
  analyze_colors: colorHandlers.handleAnalyzeColors,
  quantize_colors: colorHandlers.handleQuantizeColors,
  generate_palette: colorHandlers.handleGeneratePalette,
  color_ramp: colorHandlers.handleColorRamp,
};

function getActiveTools(ctx: ServerContext): ToolDefinition[] {
  return TOOL_DEFINITIONS.filter((tool) => {
    if (ctx.toolsets && !ctx.toolsets.has(tool.category)) return false;
    if (ctx.excludeTools.has(tool.name)) return false;
    if (ctx.readOnly && !tool.readOnly) return false;
    return true;
  });
}

export function setupToolHandlers(server: Server, ctx: ServerContext): void {
  server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: getActiveTools(ctx),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    logDebug(ctx.debugMode, `Handling tool request: ${toolName}`);

    const handler = HANDLER_MAP[toolName];
    if (!handler) {
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
    }

    // Verify the tool passes filtering (not excluded/read-only/toolset-filtered)
    const activeTool = getActiveTools(ctx).find((t) => t.name === toolName);
    if (!activeTool) {
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Tool "${toolName}" is not available with current configuration`,
      );
    }

    return await handler(ctx, request.params.arguments);
  });
}
