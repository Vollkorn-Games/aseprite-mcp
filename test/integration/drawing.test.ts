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
} from "../../src/handlers/drawing-handlers.js";

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
});
