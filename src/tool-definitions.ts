export interface ToolDefinition {
  name: string;
  category: string;
  readOnly: boolean;
  description: string;
  inputSchema: Record<string, unknown>;
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  // ── Sprite Management ──────────────────────────────────────
  {
    name: "create_sprite",
    category: "sprite",
    readOnly: false,
    description:
      "Create a new sprite with specified dimensions and color mode. Optionally save to disk. Returns sprite metadata.",
    inputSchema: {
      type: "object",
      properties: {
        width: {
          type: "number",
          description: "Sprite width in pixels (default: 32)",
        },
        height: {
          type: "number",
          description: "Sprite height in pixels (default: 32)",
        },
        colorMode: {
          type: "string",
          enum: ["rgb", "indexed", "grayscale"],
          description: "Color mode (default: rgb)",
        },
        outputPath: {
          type: "string",
          description:
            "Absolute path to save the new sprite (e.g. /path/to/sprite.aseprite)",
        },
      },
      required: ["outputPath"],
    },
  },
  {
    name: "open_sprite",
    category: "sprite",
    readOnly: true,
    description:
      "Open an existing sprite file and return its full metadata including layers, frames, tags, and palette.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description:
            "Absolute path to the sprite file (.aseprite, .png, etc.)",
        },
      },
      required: ["inputPath"],
    },
  },
  {
    name: "get_sprite_info",
    category: "sprite",
    readOnly: true,
    description:
      "Get detailed metadata about a sprite: dimensions, color mode, layers, frames, tags, palette colors, and slices.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
      },
      required: ["inputPath"],
    },
  },
  {
    name: "save_sprite",
    category: "sprite",
    readOnly: false,
    description:
      "Save a sprite to a file. Can save to a new path (save-as) or overwrite the original.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the source sprite file",
        },
        outputPath: {
          type: "string",
          description:
            "Absolute path to save to (defaults to inputPath if not specified)",
        },
      },
      required: ["inputPath"],
    },
  },
  {
    name: "resize_sprite",
    category: "sprite",
    readOnly: false,
    description: "Resize a sprite to new dimensions.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        width: {
          type: "number",
          description: "New width in pixels",
        },
        height: {
          type: "number",
          description: "New height in pixels",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the resized sprite",
        },
      },
      required: ["inputPath"],
    },
  },

  // ── Layer Operations ───────────────────────────────────────
  {
    name: "add_layer",
    category: "layer",
    readOnly: false,
    description:
      "Add a new layer to a sprite. Supports normal layers and group layers.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        name: {
          type: "string",
          description: "Name for the new layer",
        },
        type: {
          type: "string",
          enum: ["normal", "group"],
          description: "Layer type (default: normal)",
        },
        opacity: {
          type: "number",
          description: "Layer opacity 0-255 (default: 255)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath"],
    },
  },
  {
    name: "remove_layer",
    category: "layer",
    readOnly: false,
    description: "Remove a layer from a sprite by name or index.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        layerName: {
          type: "string",
          description: "Name of the layer to remove",
        },
        layerIndex: {
          type: "number",
          description: "1-based index of the layer to remove",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath"],
    },
  },
  {
    name: "set_layer_properties",
    category: "layer",
    readOnly: false,
    description:
      "Modify layer properties: name, opacity, blend mode, visibility, editability.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        layerName: {
          type: "string",
          description: "Name of the layer to modify",
        },
        layerIndex: {
          type: "number",
          description: "1-based index of the layer to modify",
        },
        name: {
          type: "string",
          description: "New name for the layer",
        },
        opacity: {
          type: "number",
          description: "Opacity 0-255",
        },
        blendMode: {
          type: "string",
          enum: [
            "normal",
            "multiply",
            "screen",
            "overlay",
            "darken",
            "lighten",
            "color_dodge",
            "color_burn",
            "hard_light",
            "soft_light",
            "difference",
            "exclusion",
            "hue",
            "saturation",
            "color",
            "luminosity",
            "addition",
            "subtract",
            "divide",
          ],
          description: "Blend mode",
        },
        isVisible: {
          type: "boolean",
          description: "Layer visibility",
        },
        isEditable: {
          type: "boolean",
          description: "Layer editability (lock/unlock)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath"],
    },
  },
  {
    name: "list_layers",
    category: "layer",
    readOnly: true,
    description:
      "List all layers in a sprite with their properties (name, opacity, blend mode, visibility).",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
      },
      required: ["inputPath"],
    },
  },
  {
    name: "flatten_layers",
    category: "layer",
    readOnly: false,
    description: "Flatten all layers in a sprite into a single layer.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the flattened sprite",
        },
      },
      required: ["inputPath"],
    },
  },

  // ── Frame & Animation ─────────────────────────────────────
  {
    name: "add_frame",
    category: "frame",
    readOnly: false,
    description:
      "Add a new frame to a sprite. Can create an empty frame or duplicate an existing one.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        copyFrom: {
          type: "number",
          description:
            "1-based frame number to duplicate (omit for empty frame)",
        },
        afterFrame: {
          type: "number",
          description: "Insert after this frame number (default: last frame)",
        },
        duration: {
          type: "number",
          description: "Frame duration in seconds (e.g. 0.1 for 100ms)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath"],
    },
  },
  {
    name: "remove_frame",
    category: "frame",
    readOnly: false,
    description:
      "Remove a frame from a sprite by frame number. Cannot remove the last frame.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        frameNumber: {
          type: "number",
          description: "1-based frame number to remove (default: last frame)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath"],
    },
  },
  {
    name: "set_frame_duration",
    category: "frame",
    readOnly: false,
    description: "Set the duration of a specific frame.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        frameNumber: {
          type: "number",
          description: "1-based frame number (default: 1)",
        },
        duration: {
          type: "number",
          description: "Duration in seconds (e.g. 0.1 for 100ms)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath", "duration"],
    },
  },
  {
    name: "list_frames",
    category: "frame",
    readOnly: true,
    description:
      "List all frames in a sprite with their frame numbers and durations.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
      },
      required: ["inputPath"],
    },
  },
  {
    name: "reorder_frames",
    category: "frame",
    readOnly: false,
    description:
      "Reverse the order of frames in a sprite, optionally within a specific range.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        reverse: {
          type: "boolean",
          description: "Reverse frame order (default: true)",
        },
        fromFrame: {
          type: "number",
          description: "Start of range to reverse (1-based)",
        },
        toFrame: {
          type: "number",
          description: "End of range to reverse (1-based)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath"],
    },
  },

  // ── Drawing Operations ─────────────────────────────────────
  {
    name: "draw_pixel",
    category: "drawing",
    readOnly: false,
    description:
      "Set a single pixel color at the specified coordinates on a sprite.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        x: {
          type: "number",
          description: "X coordinate (0-based)",
        },
        y: {
          type: "number",
          description: "Y coordinate (0-based)",
        },
        color: {
          type: "string",
          description:
            'Color as hex string (e.g. "#ff0000" for red, "#ff000080" for semi-transparent red)',
        },
        frameNumber: {
          type: "number",
          description: "1-based frame number (default: 1)",
        },
        layerIndex: {
          type: "number",
          description: "1-based layer index (default: 1)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath", "x", "y", "color"],
    },
  },
  {
    name: "draw_pixels",
    category: "drawing",
    readOnly: false,
    description:
      "Set multiple pixel colors at once. More efficient than calling draw_pixel repeatedly.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        pixels: {
          type: "array",
          items: {
            type: "object",
            properties: {
              x: { type: "number", description: "X coordinate" },
              y: { type: "number", description: "Y coordinate" },
              color: {
                type: "string",
                description: "Color as hex string",
              },
            },
            required: ["x", "y", "color"],
          },
          description: "Array of pixel objects with x, y, and color",
        },
        frameNumber: {
          type: "number",
          description: "1-based frame number (default: 1)",
        },
        layerIndex: {
          type: "number",
          description: "1-based layer index (default: 1)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath", "pixels"],
    },
  },
  {
    name: "draw_line",
    category: "drawing",
    readOnly: false,
    description: "Draw a line between two points on a sprite.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        x1: { type: "number", description: "Start X coordinate" },
        y1: { type: "number", description: "Start Y coordinate" },
        x2: { type: "number", description: "End X coordinate" },
        y2: { type: "number", description: "End Y coordinate" },
        color: {
          type: "string",
          description: "Color as hex string",
        },
        brushSize: {
          type: "number",
          description: "Brush size in pixels (default: 1)",
        },
        frameNumber: {
          type: "number",
          description: "1-based frame number (default: 1)",
        },
        layerIndex: {
          type: "number",
          description: "1-based layer index (default: 1)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath", "x1", "y1", "x2", "y2", "color"],
    },
  },
  {
    name: "draw_rect",
    category: "drawing",
    readOnly: false,
    description: "Draw a rectangle on a sprite. Can be filled or outline only.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        x: { type: "number", description: "Top-left X coordinate" },
        y: { type: "number", description: "Top-left Y coordinate" },
        width: { type: "number", description: "Rectangle width" },
        height: { type: "number", description: "Rectangle height" },
        color: {
          type: "string",
          description: "Color as hex string",
        },
        filled: {
          type: "boolean",
          description: "Fill the rectangle (default: true)",
        },
        brushSize: {
          type: "number",
          description: "Brush size for outline (default: 1)",
        },
        frameNumber: {
          type: "number",
          description: "1-based frame number (default: 1)",
        },
        layerIndex: {
          type: "number",
          description: "1-based layer index (default: 1)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath", "x", "y", "width", "height", "color"],
    },
  },
  {
    name: "draw_ellipse",
    category: "drawing",
    readOnly: false,
    description: "Draw an ellipse on a sprite. Can be filled or outline only.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        x: { type: "number", description: "Top-left X of bounding box" },
        y: { type: "number", description: "Top-left Y of bounding box" },
        width: { type: "number", description: "Bounding box width" },
        height: { type: "number", description: "Bounding box height" },
        color: {
          type: "string",
          description: "Color as hex string",
        },
        filled: {
          type: "boolean",
          description: "Fill the ellipse (default: true)",
        },
        brushSize: {
          type: "number",
          description: "Brush size for outline (default: 1)",
        },
        frameNumber: {
          type: "number",
          description: "1-based frame number (default: 1)",
        },
        layerIndex: {
          type: "number",
          description: "1-based layer index (default: 1)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath", "x", "y", "width", "height", "color"],
    },
  },
  {
    name: "flood_fill",
    category: "drawing",
    readOnly: false,
    description: "Flood fill (paint bucket) from a point with a color.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        x: { type: "number", description: "X coordinate to fill from" },
        y: { type: "number", description: "Y coordinate to fill from" },
        color: {
          type: "string",
          description: "Fill color as hex string",
        },
        frameNumber: {
          type: "number",
          description: "1-based frame number (default: 1)",
        },
        layerIndex: {
          type: "number",
          description: "1-based layer index (default: 1)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath", "x", "y", "color"],
    },
  },

  // ── Palette Management ─────────────────────────────────────
  {
    name: "get_palette",
    category: "palette",
    readOnly: true,
    description:
      "Get all palette colors from a sprite. Returns array of colors with index, RGBA values, and hex.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
      },
      required: ["inputPath"],
    },
  },
  {
    name: "set_palette_color",
    category: "palette",
    readOnly: false,
    description:
      "Set a color at a specific palette index. Automatically resizes palette if needed.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        index: {
          type: "number",
          description: "Palette index (0-based)",
        },
        color: {
          type: "string",
          description: "Color as hex string",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath", "index", "color"],
    },
  },
  {
    name: "load_palette",
    category: "palette",
    readOnly: false,
    description:
      "Load a palette from an external file (.gpl, .pal, .aseprite, .png) into a sprite.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        palettePath: {
          type: "string",
          description: "Absolute path to the palette file",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath", "palettePath"],
    },
  },
  {
    name: "create_palette",
    category: "palette",
    readOnly: false,
    description:
      "Create a new palette from a list of colors and apply it to a sprite.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        colors: {
          type: "array",
          items: { type: "string" },
          description:
            'Array of hex color strings (e.g. ["#000000", "#ffffff", "#ff0000"])',
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath", "colors"],
    },
  },
  {
    name: "resize_palette",
    category: "palette",
    readOnly: false,
    description: "Change the number of entries in a sprite's palette.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        size: {
          type: "number",
          description: "New palette size (number of entries)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath", "size"],
    },
  },

  // ── Selection Operations ───────────────────────────────────
  {
    name: "select_rect",
    category: "selection",
    readOnly: false,
    description: "Create a rectangular selection on a sprite.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        x: { type: "number", description: "Selection X origin" },
        y: { type: "number", description: "Selection Y origin" },
        width: { type: "number", description: "Selection width" },
        height: { type: "number", description: "Selection height" },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath", "x", "y", "width", "height"],
    },
  },
  {
    name: "select_all",
    category: "selection",
    readOnly: false,
    description: "Select the entire canvas of a sprite.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath"],
    },
  },
  {
    name: "deselect",
    category: "selection",
    readOnly: false,
    description: "Clear the current selection on a sprite.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath"],
    },
  },
  {
    name: "invert_selection",
    category: "selection",
    readOnly: false,
    description: "Invert the current selection on a sprite.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath"],
    },
  },

  // ── Transform Operations ───────────────────────────────────
  {
    name: "flip_sprite",
    category: "transform",
    readOnly: false,
    description: "Flip a sprite horizontally or vertically.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        orientation: {
          type: "string",
          enum: ["horizontal", "vertical"],
          description: "Flip direction (default: horizontal)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the flipped sprite",
        },
      },
      required: ["inputPath"],
    },
  },
  {
    name: "rotate_sprite",
    category: "transform",
    readOnly: false,
    description: "Rotate a sprite by 90, 180, or 270 degrees.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        angle: {
          type: "number",
          enum: [90, 180, 270],
          description: "Rotation angle in degrees (default: 90)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the rotated sprite",
        },
      },
      required: ["inputPath"],
    },
  },
  {
    name: "crop_sprite",
    category: "transform",
    readOnly: false,
    description:
      "Crop a sprite to a specified rectangle or auto-crop to content.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        x: {
          type: "number",
          description: "Crop X origin (omit all for auto-crop)",
        },
        y: { type: "number", description: "Crop Y origin" },
        width: { type: "number", description: "Crop width" },
        height: { type: "number", description: "Crop height" },
        outputPath: {
          type: "string",
          description: "Absolute path to save the cropped sprite",
        },
      },
      required: ["inputPath"],
    },
  },
  {
    name: "trim_sprite",
    category: "transform",
    readOnly: false,
    description: "Auto-trim transparent borders from a sprite.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the trimmed sprite",
        },
      },
      required: ["inputPath"],
    },
  },

  // ── Tag Operations ─────────────────────────────────────────
  {
    name: "create_tag",
    category: "tag",
    readOnly: false,
    description:
      "Create an animation tag over a frame range. Tags define named animation sequences.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        name: {
          type: "string",
          description: "Tag name (e.g. 'idle', 'walk', 'attack')",
        },
        fromFrame: {
          type: "number",
          description: "Start frame (1-based, default: 1)",
        },
        toFrame: {
          type: "number",
          description: "End frame (1-based, default: last frame)",
        },
        color: {
          type: "string",
          description: "Tag color as hex string (for UI display)",
        },
        aniDir: {
          type: "string",
          enum: ["forward", "reverse", "pingpong"],
          description: "Animation direction (default: forward)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath", "name"],
    },
  },
  {
    name: "remove_tag",
    category: "tag",
    readOnly: false,
    description: "Remove an animation tag by name.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        tagName: {
          type: "string",
          description: "Name of the tag to remove",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath", "tagName"],
    },
  },
  {
    name: "list_tags",
    category: "tag",
    readOnly: true,
    description:
      "List all animation tags in a sprite with their frame ranges and directions.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
      },
      required: ["inputPath"],
    },
  },

  // ── Export Operations ──────────────────────────────────────
  {
    name: "export_png",
    category: "export",
    readOnly: false,
    description:
      'Export a sprite as PNG. Supports single frame or all frames (use {frame} in outputPath for frame pattern, e.g. "frame_{frame00}.png").',
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        outputPath: {
          type: "string",
          description:
            "Absolute path for the output PNG. Use {frame}, {frame00}, etc. for multi-frame export.",
        },
        frameNumber: {
          type: "number",
          description:
            "Export a specific frame (1-based). Only used for single-frame export.",
        },
      },
      required: ["inputPath", "outputPath"],
    },
  },
  {
    name: "export_spritesheet",
    category: "export",
    readOnly: false,
    description:
      "Generate a sprite sheet image with optional JSON metadata. Uses Aseprite's built-in sprite sheet exporter.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        outputPath: {
          type: "string",
          description: "Absolute path for the sprite sheet PNG",
        },
        dataPath: {
          type: "string",
          description: "Absolute path for the JSON metadata file",
        },
        sheetType: {
          type: "string",
          enum: ["horizontal", "vertical", "rows", "columns", "packed"],
          description: "Sheet layout algorithm (default: packed)",
        },
        borderPadding: {
          type: "number",
          description: "Padding on texture borders (default: 0)",
        },
        shapePadding: {
          type: "number",
          description: "Padding between frames (default: 0)",
        },
        innerPadding: {
          type: "number",
          description: "Padding inside each frame (default: 0)",
        },
      },
      required: ["inputPath", "outputPath"],
    },
  },
  {
    name: "export_gif",
    category: "export",
    readOnly: false,
    description: "Export a sprite as an animated GIF.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        outputPath: {
          type: "string",
          description: "Absolute path for the output GIF",
        },
      },
      required: ["inputPath", "outputPath"],
    },
  },

  // ── Cel Operations ─────────────────────────────────────────
  {
    name: "clear_cel",
    category: "cel",
    readOnly: false,
    description:
      "Clear the content of a cel (specific layer+frame intersection).",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        frameNumber: {
          type: "number",
          description: "1-based frame number (default: 1)",
        },
        layerIndex: {
          type: "number",
          description: "1-based layer index (default: 1)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath"],
    },
  },
  {
    name: "get_cel_info",
    category: "cel",
    readOnly: true,
    description:
      "Get information about a cel (position, opacity, bounds) at a specific layer and frame.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        frameNumber: {
          type: "number",
          description: "1-based frame number (default: 1)",
        },
        layerIndex: {
          type: "number",
          description: "1-based layer index (default: 1)",
        },
      },
      required: ["inputPath"],
    },
  },

  // ── Round 2 — Advanced Drawing ───────────────────────────────
  {
    name: "draw_image",
    category: "drawing",
    readOnly: false,
    description:
      "Paste an external PNG/image onto a layer at a position. Useful for compositing reference art or tileset assembly.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        imagePath: {
          type: "string",
          description:
            "Absolute path to the external image file (PNG) to paste",
        },
        x: {
          type: "number",
          description: "X position to paste the image (default: 0)",
        },
        y: {
          type: "number",
          description: "Y position to paste the image (default: 0)",
        },
        frameNumber: {
          type: "number",
          description: "1-based frame number (default: 1)",
        },
        layerIndex: {
          type: "number",
          description: "1-based layer index (default: 1)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath", "imagePath"],
    },
  },
  {
    name: "draw_circle",
    category: "drawing",
    readOnly: false,
    description:
      "Draw a circle (filled or outline) at a center point with a given radius.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        centerX: {
          type: "number",
          description: "X coordinate of the circle center",
        },
        centerY: {
          type: "number",
          description: "Y coordinate of the circle center",
        },
        radius: {
          type: "number",
          description: "Circle radius in pixels",
        },
        color: {
          type: "string",
          description: 'Circle color as hex string (e.g. "#ff0000")',
        },
        filled: {
          type: "boolean",
          description: "Whether to fill the circle (default: true)",
        },
        brushSize: {
          type: "number",
          description: "Brush size in pixels (default: 1)",
        },
        frameNumber: {
          type: "number",
          description: "1-based frame number (default: 1)",
        },
        layerIndex: {
          type: "number",
          description: "1-based layer index (default: 1)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath", "centerX", "centerY", "radius", "color"],
    },
  },
  {
    name: "replace_color",
    category: "drawing",
    readOnly: false,
    description:
      "Replace all pixels of one color with another color across the entire sprite.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        fromColor: {
          type: "string",
          description: 'Color to replace as hex string (e.g. "#ff0000")',
        },
        toColor: {
          type: "string",
          description: 'Replacement color as hex string (e.g. "#00ff00")',
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath", "fromColor", "toColor"],
    },
  },
  {
    name: "outline",
    category: "drawing",
    readOnly: false,
    description:
      "Add an outline of a given color around non-transparent pixels. Common pixel art operation for adding borders to sprites.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        color: {
          type: "string",
          description: 'Outline color as hex string (e.g. "#000000")',
        },
        frameNumber: {
          type: "number",
          description: "1-based frame number (default: 1)",
        },
        layerIndex: {
          type: "number",
          description: "1-based layer index (default: 1)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath", "color"],
    },
  },

  // ── Round 3 — Animation Workflow ─────────────────────────────
  {
    name: "duplicate_frame",
    category: "frame",
    readOnly: false,
    description:
      "Clone an existing frame with all cel content, creating a new frame after the source.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        frameNumber: {
          type: "number",
          description: "1-based frame number to duplicate (default: 1)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath"],
    },
  },
  {
    name: "set_tag_properties",
    category: "tag",
    readOnly: false,
    description:
      "Modify properties of an existing animation tag (name, color, direction, repeat count).",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        tagName: {
          type: "string",
          description: "Name of the tag to modify",
        },
        name: {
          type: "string",
          description: "New name for the tag",
        },
        color: {
          type: "string",
          description: 'Tag color as hex string (e.g. "#ff0000")',
        },
        aniDir: {
          type: "string",
          enum: ["forward", "reverse", "pingpong"],
          description: "Animation direction",
        },
        repeats: {
          type: "number",
          description: "Number of times to repeat the animation (0 = infinite)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath", "tagName"],
    },
  },
  {
    name: "copy_cel",
    category: "cel",
    readOnly: false,
    description:
      "Copy cel content (image and position) from one frame/layer to another.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        sourceFrame: {
          type: "number",
          description: "1-based source frame number",
        },
        sourceLayer: {
          type: "number",
          description: "1-based source layer index",
        },
        destFrame: {
          type: "number",
          description: "1-based destination frame number",
        },
        destLayer: {
          type: "number",
          description: "1-based destination layer index",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: [
        "inputPath",
        "sourceFrame",
        "sourceLayer",
        "destFrame",
        "destLayer",
      ],
    },
  },

  // ── Round 4 — Tileset & Tilemap ──────────────────────────────
  {
    name: "create_tilemap_layer",
    category: "tilemap",
    readOnly: false,
    description:
      "Create a tilemap layer with a tileset grid. Requires Aseprite 1.3+.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        name: {
          type: "string",
          description: 'Layer name (default: "Tilemap")',
        },
        tileWidth: {
          type: "number",
          description: "Tile width in pixels (default: 16)",
        },
        tileHeight: {
          type: "number",
          description: "Tile height in pixels (default: 16)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath"],
    },
  },
  {
    name: "set_tile",
    category: "tilemap",
    readOnly: false,
    description:
      "Place a tile at grid coordinates in a tilemap layer by setting the tile index.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        col: {
          type: "number",
          description: "0-based column in the tilemap grid",
        },
        row: {
          type: "number",
          description: "0-based row in the tilemap grid",
        },
        tileIndex: {
          type: "number",
          description: "Index of the tile in the tileset",
        },
        layerIndex: {
          type: "number",
          description: "1-based layer index (default: 1)",
        },
        frameNumber: {
          type: "number",
          description: "1-based frame number (default: 1)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath", "col", "row", "tileIndex"],
    },
  },
  {
    name: "get_tileset_info",
    category: "tilemap",
    readOnly: true,
    description:
      "Get tileset metadata from a tilemap layer including tile count and grid dimensions.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        layerIndex: {
          type: "number",
          description:
            "1-based layer index (default: first tilemap layer found)",
        },
      },
      required: ["inputPath"],
    },
  },

  // ── Round 5 — Batch Operations ───────────────────────────────
  {
    name: "batch_export",
    category: "batch",
    readOnly: false,
    description:
      "Export multiple frames and/or layers as individual PNG files using a naming pattern with {frame}, {frame00}, {layer} placeholders.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        outputPattern: {
          type: "string",
          description:
            'Output path pattern with placeholders (e.g. "/path/to/{layer}_{frame00}.png")',
        },
        mode: {
          type: "string",
          enum: ["frames", "layers", "both"],
          description:
            'Export mode: "frames" exports all frames, "layers" exports per-layer, "both" exports every layer×frame combination (default: "frames")',
        },
        fromFrame: {
          type: "number",
          description: "1-based start frame (default: 1)",
        },
        toFrame: {
          type: "number",
          description: "1-based end frame (default: last frame)",
        },
      },
      required: ["inputPath", "outputPattern"],
    },
  },
  {
    name: "batch_resize",
    category: "batch",
    readOnly: false,
    description:
      "Resize multiple sprite files by a scale factor. Useful for generating multi-resolution assets.",
    inputSchema: {
      type: "object",
      properties: {
        inputPaths: {
          type: "array",
          items: { type: "string" },
          description: "Array of absolute paths to sprite files",
        },
        scale: {
          type: "number",
          description: "Scale factor (e.g. 2 for 2x, 0.5 for half size)",
        },
        outputDir: {
          type: "string",
          description:
            "Output directory for resized files (default: overwrite originals)",
        },
      },
      required: ["inputPaths", "scale"],
    },
  },
  {
    name: "import_spritesheet",
    category: "batch",
    readOnly: false,
    description:
      "Import a sprite sheet PNG and split it into individual frames based on grid dimensions.",
    inputSchema: {
      type: "object",
      properties: {
        imagePath: {
          type: "string",
          description: "Absolute path to the sprite sheet PNG",
        },
        outputPath: {
          type: "string",
          description:
            "Absolute path to save the resulting .aseprite sprite file",
        },
        frameWidth: {
          type: "number",
          description: "Width of each frame in pixels",
        },
        frameHeight: {
          type: "number",
          description: "Height of each frame in pixels",
        },
        duration: {
          type: "number",
          description:
            "Frame duration in seconds for all frames (e.g. 0.1 for 100ms)",
        },
      },
      required: ["imagePath", "outputPath", "frameWidth", "frameHeight"],
    },
  },

  // ── Round 6 — Color & Analysis ───────────────────────────────
  {
    name: "analyze_colors",
    category: "color",
    readOnly: true,
    description:
      "Analyze sprite colors: count unique colors, find most/least used, detect unused palette entries. Returns a full color histogram.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        frameNumber: {
          type: "number",
          description: "1-based frame number to analyze (default: 1)",
        },
      },
      required: ["inputPath"],
    },
  },
  {
    name: "quantize_colors",
    category: "color",
    readOnly: false,
    description:
      "Reduce the number of colors in a sprite to fit a target palette size using Aseprite's built-in color quantization.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        maxColors: {
          type: "number",
          description: "Maximum number of colors in the palette",
        },
        dithering: {
          type: "string",
          enum: ["none", "ordered", "old"],
          description: 'Dithering algorithm (default: "none")',
        },
        keepRgb: {
          type: "boolean",
          description: "Convert back to RGB after quantization (default: true)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath", "maxColors"],
    },
  },
  {
    name: "generate_palette",
    category: "color",
    readOnly: false,
    description:
      "Auto-generate a palette from the sprite's actual pixel colors, sorted by frequency of use.",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Absolute path to the sprite file",
        },
        maxColors: {
          type: "number",
          description: "Maximum palette size (default: 32)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["inputPath"],
    },
  },
  {
    name: "color_ramp",
    category: "color",
    readOnly: false,
    description:
      "Generate a color ramp (gradient) between two colors. Optionally apply it to a sprite's palette.",
    inputSchema: {
      type: "object",
      properties: {
        fromColor: {
          type: "string",
          description: 'Start color as hex string (e.g. "#000000")',
        },
        toColor: {
          type: "string",
          description: 'End color as hex string (e.g. "#ffffff")',
        },
        steps: {
          type: "number",
          description: "Number of colors in the ramp (default: 5)",
        },
        inputPath: {
          type: "string",
          description:
            "Absolute path to a sprite file — if provided, applies the ramp to its palette",
        },
        paletteStart: {
          type: "number",
          description: "Palette index to start writing the ramp (default: 0)",
        },
        outputPath: {
          type: "string",
          description: "Absolute path to save the modified sprite",
        },
      },
      required: ["fromColor", "toColor"],
    },
  },
];
