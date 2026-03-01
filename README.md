# aseprite-mcp

MCP server for the [Aseprite](https://www.aseprite.org/) pixel art editor. Enables AI assistants to create sprites, draw pixel art, manage layers/frames/palettes, create animations, and export assets through the [Model Context Protocol](https://modelcontextprotocol.io/).

## How It Works

```
AI Assistant  ←→  MCP Server (Node.js)  ←→  Aseprite (batch mode + Lua scripting)
```

The server spawns Aseprite in batch mode (`-b`) with Lua scripts that perform operations and return JSON results via stdout.

## Quickstart

```bash
git clone https://github.com/Vollkorn-Games/aseprite-mcp.git
cd aseprite-mcp
pnpm install
pnpm build
```

## Installation

### Claude Code

```bash
claude mcp add aseprite-mcp -- node /path/to/aseprite-mcp/build/index.js
```

### Claude Desktop / Cline / Cursor

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "aseprite-mcp": {
      "command": "node",
      "args": ["/path/to/aseprite-mcp/build/index.js"]
    }
  }
}
```

Aseprite is auto-detected from common install locations (Steam, `/usr/bin`, `/Applications`, etc.). Set `ASEPRITE_PATH` only if auto-detection fails.

## Requirements

- **Node.js** >= 18.0.0
- **Aseprite** >= 1.2.10 (with Lua scripting support)
- **pnpm** (package manager)

## Environment Variables

| Variable            | Description                                       |
| ------------------- | ------------------------------------------------- |
| `ASEPRITE_PATH`     | Path to the Aseprite executable (auto-detected)   |
| `DEBUG`             | Set to `true` for verbose logging                 |
| `MCP_TOOLSETS`      | Comma-separated list of tool categories to expose |
| `MCP_EXCLUDE_TOOLS` | Comma-separated list of tool names to exclude     |
| `MCP_READ_ONLY`     | Set to `true` to expose only read-only tools      |

## 65 Tools Across 14 Categories

### Sprite Management (5 tools)

| Tool              | Description                                           |
| ----------------- | ----------------------------------------------------- |
| `create_sprite`   | Create a new sprite with width, height, color mode    |
| `open_sprite`     | Open an existing sprite file and return metadata      |
| `get_sprite_info` | Get detailed metadata (layers, frames, tags, palette) |
| `save_sprite`     | Save sprite to file                                   |
| `resize_sprite`   | Resize sprite dimensions                              |

### Layer Operations (5 tools)

| Tool                   | Description                               |
| ---------------------- | ----------------------------------------- |
| `add_layer`            | Add a new layer (normal or group)         |
| `remove_layer`         | Remove a layer by name or index           |
| `set_layer_properties` | Set name, opacity, blend mode, visibility |
| `list_layers`          | List all layers with metadata             |
| `flatten_layers`       | Flatten all layers into one               |

### Frame & Animation (8 tools)

| Tool                  | Description                            |
| --------------------- | -------------------------------------- |
| `add_frame`           | Add new frame (empty or duplicate)     |
| `remove_frame`        | Remove frame by number                 |
| `set_frame_duration`  | Set frame duration in seconds          |
| `list_frames`         | List all frames with durations         |
| `reorder_frames`      | Reverse frame order within a range     |
| `duplicate_frame`     | Clone a frame with all cel content     |
| `add_frames`          | Bulk add multiple empty frames at once |
| `set_frame_durations` | Set durations for multiple frames      |

### Drawing Operations (13 tools)

| Tool            | Description                                  |
| --------------- | -------------------------------------------- |
| `draw_pixel`    | Set a single pixel color                     |
| `draw_pixels`   | Set multiple pixels at once (batch)          |
| `draw_line`     | Draw line between two points                 |
| `draw_rect`     | Draw rectangle (filled or outline)           |
| `draw_ellipse`  | Draw ellipse (filled or outline)             |
| `flood_fill`    | Flood fill from a point with a color         |
| `draw_image`    | Paste an external PNG onto a layer           |
| `draw_circle`   | Draw circle (filled or outline)              |
| `replace_color` | Replace all pixels of one color with another |
| `outline`       | Add outline around non-transparent pixels    |
| `get_pixels`    | Read pixel colors from a canvas region       |
| `draw_polygon`  | Draw polygon (filled or outline) from points |
| `get_canvas`    | Dump full canvas as 2D hex color grid        |

### Palette Management (5 tools)

| Tool                | Description                      |
| ------------------- | -------------------------------- |
| `get_palette`       | Get all palette colors           |
| `set_palette_color` | Set color at palette index       |
| `load_palette`      | Load palette from file           |
| `create_palette`    | Create palette from color list   |
| `resize_palette`    | Change number of palette entries |

### Selection Operations (4 tools)

| Tool               | Description                  |
| ------------------ | ---------------------------- |
| `select_rect`      | Create rectangular selection |
| `select_all`       | Select entire canvas         |
| `deselect`         | Clear selection              |
| `invert_selection` | Invert current selection     |

### Transform Operations (4 tools)

| Tool            | Description                               |
| --------------- | ----------------------------------------- |
| `flip_sprite`   | Flip horizontal/vertical                  |
| `rotate_sprite` | Rotate by 90/180/270 degrees              |
| `crop_sprite`   | Crop to rectangle or auto-crop to content |
| `trim_sprite`   | Auto-trim transparent borders             |

### Tag Operations (4 tools)

| Tool                 | Description                                     |
| -------------------- | ----------------------------------------------- |
| `create_tag`         | Create animation tag over frame range           |
| `remove_tag`         | Remove tag by name                              |
| `list_tags`          | List all tags with frame ranges                 |
| `set_tag_properties` | Modify tag name, color, direction, repeat count |

### Export Operations (3 tools)

| Tool                 | Description                              |
| -------------------- | ---------------------------------------- |
| `export_png`         | Export sprite/frames as PNG              |
| `export_spritesheet` | Generate sprite sheet with JSON metadata |
| `export_gif`         | Export as animated GIF                   |

### Cel Operations (4 tools)

| Tool           | Description                            |
| -------------- | -------------------------------------- |
| `clear_cel`    | Clear cel content                      |
| `get_cel_info` | Get cel position, opacity, bounds      |
| `copy_cel`     | Copy cel content between frames/layers |
| `move_cel`     | Move/translate cel content by offset   |

### Tileset & Tilemap (3 tools)

| Tool                   | Description                              |
| ---------------------- | ---------------------------------------- |
| `create_tilemap_layer` | Create a tilemap layer with tileset grid |
| `set_tile`             | Place a tile at grid coordinates         |
| `get_tileset_info`     | Get tileset metadata and tile count      |

### Batch Operations (3 tools)

| Tool                 | Description                                  |
| -------------------- | -------------------------------------------- |
| `batch_export`       | Export frames/layers as individual PNGs      |
| `batch_resize`       | Resize multiple sprites by scale factor      |
| `import_spritesheet` | Import spritesheet PNG and split into frames |

### Color & Analysis (4 tools)

| Tool               | Description                                |
| ------------------ | ------------------------------------------ |
| `analyze_colors`   | Count unique colors, find most/least used  |
| `quantize_colors`  | Reduce color count to target palette size  |
| `generate_palette` | Auto-generate palette from sprite colors   |
| `color_ramp`       | Generate color gradient between two colors |

## Tool Filtering

Filter which tools are exposed using environment variables:

```bash
# Only expose sprite and drawing tools
MCP_TOOLSETS=sprite,drawing

# Exclude specific tools
MCP_EXCLUDE_TOOLS=flood_fill,export_gif

# Read-only mode (only get_*, list_*, open_* tools)
MCP_READ_ONLY=true
```

## Development

```bash
pnpm install          # Install dependencies
pnpm build            # Compile TypeScript + copy Lua scripts
pnpm test             # Run all tests (requires Aseprite)
pnpm test:unit        # Run unit tests only
pnpm lint             # ESLint
pnpm format:check     # Prettier check
pnpm typecheck        # TypeScript check
pnpm inspector        # Open MCP Inspector
pnpm watch            # Auto-rebuild on changes
```

## Troubleshooting

### Aseprite not found

The server auto-detects Aseprite from common locations including Steam, `/usr/bin`, `/usr/local/bin`, `/Applications`, and standard Windows paths. If auto-detection fails, set the `ASEPRITE_PATH` environment variable:

```bash
# Linux
export ASEPRITE_PATH=/usr/bin/aseprite

# macOS
export ASEPRITE_PATH=/Applications/Aseprite.app/Contents/MacOS/aseprite

# Windows
set ASEPRITE_PATH=C:\Program Files\Aseprite\Aseprite.exe
```

### Debug output

Set `DEBUG=true` to see detailed operation logs in stderr.

## License

MIT
