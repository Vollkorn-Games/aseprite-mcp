import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { existsSync } from "fs";
import type { ServerContext } from "../../src/context.js";
import { initContext } from "../setup.js";
import { assertSuccess, assertError, TestCleanup } from "../helpers.js";
import {
  handleCreateSprite,
  handleGetSpriteInfo,
  handleResizeSprite,
} from "../../src/handlers/sprite-handlers.js";

describe("Sprite handlers", () => {
  let ctx: ServerContext;
  const cleanup = new TestCleanup();

  beforeAll(async () => {
    ctx = await initContext();
  });

  afterEach(() => {
    cleanup.run();
  });

  it("creates a sprite", async () => {
    const outputPath = cleanup.track("test_created.aseprite");
    const res = await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.width).toBe(16);
    expect(data.height).toBe(16);
    expect(existsSync(outputPath)).toBe(true);
  });

  it("creates a sprite with indexed color mode", async () => {
    const outputPath = cleanup.track("test_indexed.aseprite");
    const res = await handleCreateSprite(ctx, {
      width: 32,
      height: 32,
      colorMode: "indexed",
      outputPath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
  });

  it("returns error for missing outputPath", async () => {
    const res = await handleCreateSprite(ctx, { width: 32, height: 32 });
    assertError(res);
  });

  it("returns error for invalid path", async () => {
    const res = await handleCreateSprite(ctx, {
      width: 32,
      height: 32,
      outputPath: "../escape.aseprite",
    });
    assertError(res);
  });

  it("gets sprite info", async () => {
    const outputPath = cleanup.track("test_info.aseprite");
    await handleCreateSprite(ctx, { width: 24, height: 24, outputPath });

    const res = await handleGetSpriteInfo(ctx, { inputPath: outputPath });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.width).toBe(24);
    expect(data.height).toBe(24);
    expect(data.layers).toBeInstanceOf(Array);
    expect(data.frames).toBeInstanceOf(Array);
  });

  it("resizes a sprite", async () => {
    const outputPath = cleanup.track("test_resize_src.aseprite");
    const resizedPath = cleanup.track("test_resized.aseprite");
    await handleCreateSprite(ctx, { width: 16, height: 16, outputPath });

    const res = await handleResizeSprite(ctx, {
      inputPath: outputPath,
      width: 32,
      height: 32,
      outputPath: resizedPath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.width).toBe(32);
    expect(data.height).toBe(32);
  });
});
