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

## Round 2 — Advanced Drawing

- [ ] **`draw_image`** — Paste an external PNG/image onto a layer at a position. Essential for compositing reference art or tilesheet assembly.
- [ ] **`draw_circle`** — Draw filled/outline circle (convenience wrapper around draw_ellipse with equal radii).
- [ ] **`draw_text`** — Render text onto a layer using a bitmap font. Useful for UI mockups and sprite labels.
- [ ] **`replace_color`** — Replace all pixels of one color with another across the sprite or selection.
- [ ] **`outline`** — Add an outline of a given color around non-transparent pixels. Common pixel art operation.

## Round 3 — Animation Workflow

- [ ] **`duplicate_frame`** — Clone an existing frame (with all cel content). More explicit than add_frame with duplicate flag.
- [ ] **`set_tag_properties`** — Modify tag color, animation direction (forward/reverse/ping-pong), repeat count.
- [ ] **`copy_cel`** — Copy cel content from one frame/layer to another.
- [ ] **`onion_skin_export`** — Export frames with onion skinning overlay for animation review.

## Round 4 — Tileset & Tilemap

- [ ] **`create_tilemap_layer`** — Create a tilemap layer with a tileset. Aseprite 1.3+ has native tilemap support.
- [ ] **`set_tile`** — Place a tile at grid coordinates in a tilemap layer.
- [ ] **`get_tileset_info`** — List tiles in a tileset with dimensions and count.

## Round 5 — Batch Operations

- [ ] **`batch_export`** — Export multiple frames/layers as individual PNGs with naming patterns.
- [ ] **`batch_resize`** — Resize multiple sprites at once (useful for generating @1x/@2x/@3x assets).
- [ ] **`import_spritesheet`** — Import a sprite sheet PNG and split into individual frames.

## Round 6 — Color & Analysis

- [ ] **`analyze_colors`** — Count unique colors, find most/least used colors, detect unused palette entries.
- [ ] **`quantize_colors`** — Reduce color count to fit a target palette size.
- [ ] **`generate_palette`** — Auto-generate a palette from sprite colors (median cut, k-means).
- [ ] **`color_ramp`** — Generate a color ramp between two colors for palette building.

## Future Considerations

- [ ] **Publish to NPM** — Make installable via `npx` / `pnpm dlx`.
- [ ] **Aseprite extension support** — Load/manage Aseprite extensions for custom tools and scripts.
- [ ] **Pixel-perfect preview** — Export a scaled-up preview PNG for visual feedback to the AI.
