import { describe, it, expect, beforeAll, afterEach } from "vitest";
import type { ServerContext } from "../../src/context.js";
import { initContext } from "../setup.js";
import { assertSuccess, assertError, TestCleanup } from "../helpers.js";
import { handleCreateSprite } from "../../src/handlers/sprite-handlers.js";
import {
  handleDrawPixel,
  handleDrawPixels,
  handleDrawLine,
  handleDrawRect,
  handleDrawCircle,
  handleReplaceColor,
  handleOutline,
  handleDrawImage,
  handleGetPixels,
  handleDrawPolygon,
  handleGetCanvas,
} from "../../src/handlers/drawing-handlers.js";
import { handleExportPng } from "../../src/handlers/export-handlers.js";

describe("Drawing handlers", () => {
  let ctx: ServerContext;
  const cleanup = new TestCleanup();

  beforeAll(async () => {
    ctx = await initContext();
  });

  afterEach(() => {
    cleanup.run();
  });

  it("draws a pixel", async () => {
    const spritePath = cleanup.track("test_draw_pixel.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });

    const res = await handleDrawPixel(ctx, {
      inputPath: spritePath,
      x: 5,
      y: 5,
      color: "#ff0000",
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
  });

  it("draws multiple pixels", async () => {
    const spritePath = cleanup.track("test_draw_pixels.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });

    const res = await handleDrawPixels(ctx, {
      inputPath: spritePath,
      pixels: [
        { x: 0, y: 0, color: "#ff0000" },
        { x: 1, y: 0, color: "#00ff00" },
        { x: 2, y: 0, color: "#0000ff" },
      ],
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.pixelsDrawn).toBe(3);
  });

  it("draws a line", async () => {
    const spritePath = cleanup.track("test_draw_line.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });

    const res = await handleDrawLine(ctx, {
      inputPath: spritePath,
      x1: 0,
      y1: 0,
      x2: 15,
      y2: 15,
      color: "#ffffff",
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
  });

  it("draws a rectangle", async () => {
    const spritePath = cleanup.track("test_draw_rect.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });

    const res = await handleDrawRect(ctx, {
      inputPath: spritePath,
      x: 2,
      y: 2,
      width: 10,
      height: 10,
      color: "#00ff00",
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
  });

  it("returns error for missing required params", async () => {
    const res = await handleDrawPixel(ctx, { inputPath: "/tmp/test.aseprite" });
    assertError(res);
  });

  it("draws a circle", async () => {
    const spritePath = cleanup.track("test_draw_circle.aseprite");
    await handleCreateSprite(ctx, {
      width: 32,
      height: 32,
      outputPath: spritePath,
    });

    const res = await handleDrawCircle(ctx, {
      inputPath: spritePath,
      centerX: 16,
      centerY: 16,
      radius: 8,
      color: "#ff0000",
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.radius).toBe(8);
  });

  it("replaces a color", async () => {
    const spritePath = cleanup.track("test_replace_color.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });
    await handleDrawRect(ctx, {
      inputPath: spritePath,
      x: 0,
      y: 0,
      width: 16,
      height: 16,
      color: "#ff0000",
      outputPath: spritePath,
    });

    const res = await handleReplaceColor(ctx, {
      inputPath: spritePath,
      fromColor: "#ff0000",
      toColor: "#00ff00",
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
  });

  it("adds an outline", async () => {
    const spritePath = cleanup.track("test_outline.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });
    await handleDrawRect(ctx, {
      inputPath: spritePath,
      x: 4,
      y: 4,
      width: 8,
      height: 8,
      color: "#ff0000",
      outputPath: spritePath,
    });

    const res = await handleOutline(ctx, {
      inputPath: spritePath,
      color: "#000000",
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.outlinePixelCount).toBeGreaterThan(0);
  });

  it("draws an image", async () => {
    const spritePath = cleanup.track("test_draw_image.aseprite");
    const pngPath = cleanup.track("test_draw_image_src.png");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });
    // Export a small PNG to use as source image
    await handleExportPng(ctx, {
      inputPath: spritePath,
      outputPath: pngPath,
    });

    const res = await handleDrawImage(ctx, {
      inputPath: spritePath,
      imagePath: pngPath,
      x: 0,
      y: 0,
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
  });

  it("returns error for missing color", async () => {
    const res = await handleDrawLine(ctx, {
      inputPath: "/tmp/test.aseprite",
      x1: 0,
      y1: 0,
      x2: 10,
      y2: 10,
    });
    assertError(res);
  });

  it("returns error for missing imagePath", async () => {
    const res = await handleDrawImage(ctx, {
      inputPath: "/tmp/test.aseprite",
    });
    assertError(res);
  });

  it("returns error for missing circle params", async () => {
    const res = await handleDrawCircle(ctx, {
      inputPath: "/tmp/test.aseprite",
    });
    assertError(res);
  });

  it("reads pixels from a region", async () => {
    const spritePath = cleanup.track("test_get_pixels.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });
    await handleDrawRect(ctx, {
      inputPath: spritePath,
      x: 2,
      y: 2,
      width: 4,
      height: 4,
      color: "#ff0000",
      outputPath: spritePath,
    });

    const res = await handleGetPixels(ctx, {
      inputPath: spritePath,
      x: 0,
      y: 0,
      width: 8,
      height: 8,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.pixelCount).toBeGreaterThan(0);
    expect(data.pixels[0]).toHaveProperty("x");
    expect(data.pixels[0]).toHaveProperty("y");
    expect(data.pixels[0]).toHaveProperty("hex");
  });

  it("returns empty pixels for blank sprite", async () => {
    const spritePath = cleanup.track("test_get_pixels_empty.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });

    const res = await handleGetPixels(ctx, { inputPath: spritePath });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.pixelCount).toBe(0);
  });

  it("returns error for missing inputPath on get_pixels", async () => {
    const res = await handleGetPixels(ctx, {});
    assertError(res);
  });

  it("draws a filled polygon", async () => {
    const spritePath = cleanup.track("test_draw_polygon.aseprite");
    await handleCreateSprite(ctx, {
      width: 32,
      height: 32,
      outputPath: spritePath,
    });

    const res = await handleDrawPolygon(ctx, {
      inputPath: spritePath,
      points: [
        { x: 5, y: 5 },
        { x: 25, y: 5 },
        { x: 15, y: 25 },
      ],
      color: "#ff0000",
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.pointCount).toBe(3);
  });

  it("draws a polygon outline", async () => {
    const spritePath = cleanup.track("test_draw_polygon_outline.aseprite");
    await handleCreateSprite(ctx, {
      width: 32,
      height: 32,
      outputPath: spritePath,
    });

    const res = await handleDrawPolygon(ctx, {
      inputPath: spritePath,
      points: [
        { x: 5, y: 5 },
        { x: 25, y: 5 },
        { x: 25, y: 25 },
        { x: 5, y: 25 },
      ],
      color: "#00ff00",
      filled: false,
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.filled).toBe(false);
  });

  it("returns error for too few polygon points", async () => {
    const res = await handleDrawPolygon(ctx, {
      inputPath: "/tmp/test.aseprite",
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
      color: "#ff0000",
    });
    assertError(res);
  });

  it("gets full canvas as grid", async () => {
    const spritePath = cleanup.track("test_get_canvas.aseprite");
    await handleCreateSprite(ctx, {
      width: 8,
      height: 8,
      outputPath: spritePath,
    });
    await handleDrawRect(ctx, {
      inputPath: spritePath,
      x: 0,
      y: 0,
      width: 8,
      height: 8,
      color: "#ff0000",
      outputPath: spritePath,
    });

    const res = await handleGetCanvas(ctx, { inputPath: spritePath });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.width).toBe(8);
    expect(data.height).toBe(8);
    expect(data.grid).toHaveLength(8);
    expect(data.grid[0]).toHaveLength(8);
  });

  it("returns error for missing inputPath on get_canvas", async () => {
    const res = await handleGetCanvas(ctx, {});
    assertError(res);
  });
});
