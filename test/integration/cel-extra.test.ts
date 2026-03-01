import { describe, it, expect, beforeAll, afterEach } from "vitest";
import type { ServerContext } from "../../src/context.js";
import { initContext } from "../setup.js";
import { assertSuccess, assertError, TestCleanup } from "../helpers.js";
import { handleCreateSprite } from "../../src/handlers/sprite-handlers.js";
import { handleAddFrame } from "../../src/handlers/frame-handlers.js";
import { handleDrawPixel } from "../../src/handlers/drawing-handlers.js";
import {
  handleCopyCel,
  handleMoveCel,
} from "../../src/handlers/cel-handlers.js";

describe("Cel extra handlers", () => {
  let ctx: ServerContext;
  const cleanup = new TestCleanup();

  beforeAll(async () => {
    ctx = await initContext();
  });

  afterEach(() => {
    cleanup.run();
  });

  it("copies a cel between frames", async () => {
    const spritePath = cleanup.track("test_copy_cel.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });
    // Draw something on frame 1
    await handleDrawPixel(ctx, {
      inputPath: spritePath,
      x: 5,
      y: 5,
      color: "#ff0000",
      outputPath: spritePath,
    });
    // Add a second frame
    await handleAddFrame(ctx, {
      inputPath: spritePath,
      outputPath: spritePath,
    });

    const res = await handleCopyCel(ctx, {
      inputPath: spritePath,
      sourceFrame: 1,
      sourceLayer: 1,
      destFrame: 2,
      destLayer: 1,
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
  });

  it("returns error for missing params", async () => {
    const res = await handleCopyCel(ctx, {
      inputPath: "/tmp/test.aseprite",
    });
    assertError(res);
  });

  it("moves a cel by offset", async () => {
    const spritePath = cleanup.track("test_move_cel.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });
    await handleDrawPixel(ctx, {
      inputPath: spritePath,
      x: 5,
      y: 5,
      color: "#ff0000",
      outputPath: spritePath,
    });

    const res = await handleMoveCel(ctx, {
      inputPath: spritePath,
      offsetX: 3,
      offsetY: -2,
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.offset.x).toBe(3);
    expect(data.offset.y).toBe(-2);
  });

  it("returns error for missing offset on move_cel", async () => {
    const res = await handleMoveCel(ctx, {
      inputPath: "/tmp/test.aseprite",
    });
    assertError(res);
  });
});
