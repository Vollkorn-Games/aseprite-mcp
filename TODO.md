# MCP Server Enhancement TODO

## Round 1 — Core Tools (Done)

- [x] **Sprite management** — create_sprite, open_sprite, get_sprite_info, save_sprite, resize_sprite
- [x] **Layer operations** — add_layer, remove_layer, set_layer_properties, list_layers, flatten_layers
- [x] **Frame & animation** — add_frame, remove_frame, set_frame_duration, list_frames, reorder_frames
- [x] **Drawing operations** — draw_pixel, draw_pixels, draw_line, draw_rect, draw_ellipse, flood_fill
- [x] **Palette management** — get_palette, set_palette_color, load_palette, create_palette, resize_palette
- [x] **Selection operations** — select_rect, select_all, deselect, invert_selection
- [x] **Transform operations** — flip_sprite, rotate_sprite, crop_sprite, trim_sprite
- [x] **Tag operations** — create_tag, remove_tag, list_tags
- [x] **Export operations** — export_png, export_spritesheet, export_gif
- [x] **Cel operations** — clear_cel, get_cel_info
- [x] **Tool filtering** — MCP_TOOLSETS, MCP_EXCLUDE_TOOLS, MCP_READ_ONLY env vars
- [x] **Infrastructure** — Modular handler architecture, unit + integration tests, CI pipeline

## Round 2 — Advanced Drawing (Done)

- [x] **`draw_image`** — Paste an external PNG/image onto a layer at a position.
- [x] **`draw_circle`** — Draw filled/outline circle (convenience wrapper around draw_ellipse with equal radii).
- [x] **`replace_color`** — Replace all pixels of one color with another across the sprite.
- [x] **`outline`** — Add an outline of a given color around non-transparent pixels.
- ~~**`draw_text`**~~ — Dropped. Aseprite Lua has no text rendering API in batch mode.

## Round 3 — Animation Workflow (Done)

- [x] **`duplicate_frame`** — Clone an existing frame with all cel content.
- [x] **`set_tag_properties`** — Modify tag name, color, animation direction, repeat count.
- [x] **`copy_cel`** — Copy cel content from one frame/layer to another.
- ~~**`onion_skin_export`**~~ — Dropped. Onion skin is a UI-only feature, not available via scripting.

## Round 4 — Tileset & Tilemap (Done)

- [x] **`create_tilemap_layer`** — Create a tilemap layer with a tileset. Requires Aseprite 1.3+.
- [x] **`set_tile`** — Place a tile at grid coordinates in a tilemap layer.
- [x] **`get_tileset_info`** — List tiles in a tileset with dimensions and count.

## Round 5 — Batch Operations (Done)

- [x] **`batch_export`** — Export multiple frames/layers as individual PNGs with naming patterns.
- [x] **`batch_resize`** — Resize multiple sprites at once (useful for generating @1x/@2x/@3x assets).
- [x] **`import_spritesheet`** — Import a sprite sheet PNG and split into individual frames.

## Round 6 — Color & Analysis (Done)

- [x] **`analyze_colors`** — Count unique colors, find most/least used colors, detect unused palette entries.
- [x] **`quantize_colors`** — Reduce color count to fit a target palette size.
- [x] **`generate_palette`** — Auto-generate a palette from sprite colors sorted by frequency.
- [x] **`color_ramp`** — Generate a color ramp between two colors for palette building.

## Future Considerations

- [ ] **Publish to NPM** — Make installable via `npx` / `pnpm dlx`.
- [ ] **Aseprite extension support** — Load/manage Aseprite extensions for custom tools and scripts.
- [ ] **Pixel-perfect preview** — Export a scaled-up preview PNG for visual feedback to the AI.
