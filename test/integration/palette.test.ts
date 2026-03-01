import { describe, it, expect, beforeAll, afterEach } from "vitest";
import type { ServerContext } from "../../src/context.js";
import { initContext } from "../setup.js";
import { assertSuccess, assertError, TestCleanup } from "../helpers.js";
import { handleCreateSprite } from "../../src/handlers/sprite-handlers.js";
import {
  handleGetPalette,
  handleSetPaletteColor,
  handleCreatePalette,
} from "../../src/handlers/palette-handlers.js";

describe("Palette handlers", () => {
  let ctx: ServerContext;
  const cleanup = new TestCleanup();

  beforeAll(async () => {
    ctx = await initContext();
  });

  afterEach(() => {
    cleanup.run();
  });

  it("gets palette colors", async () => {
    const spritePath = cleanup.track("test_get_palette.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });

    const res = await handleGetPalette(ctx, { inputPath: spritePath });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.colors).toBeInstanceOf(Array);
    expect(data.count).toBeGreaterThan(0);
  });

  it("sets a palette color", async () => {
    const spritePath = cleanup.track("test_set_palette.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });

    const res = await handleSetPaletteColor(ctx, {
      inputPath: spritePath,
      index: 1,
      color: "#ff0000",
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
  });

  it("creates a custom palette", async () => {
    const spritePath = cleanup.track("test_create_palette.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });

    const res = await handleCreatePalette(ctx, {
      inputPath: spritePath,
      colors: ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff"],
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.paletteSize).toBe(5);
  });

  it("returns error for missing inputPath", async () => {
    const res = await handleGetPalette(ctx, {});
    assertError(res);
  });
});
