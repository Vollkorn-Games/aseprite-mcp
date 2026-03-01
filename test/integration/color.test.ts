import { describe, it, expect, beforeAll, afterEach } from "vitest";
import type { ServerContext } from "../../src/context.js";
import { initContext } from "../setup.js";
import { assertSuccess, assertError, TestCleanup } from "../helpers.js";
import { handleCreateSprite } from "../../src/handlers/sprite-handlers.js";
import { handleDrawRect } from "../../src/handlers/drawing-handlers.js";
import {
  handleAnalyzeColors,
  handleQuantizeColors,
  handleGeneratePalette,
  handleColorRamp,
} from "../../src/handlers/color-handlers.js";

describe("Color handlers", () => {
  let ctx: ServerContext;
  const cleanup = new TestCleanup();

  beforeAll(async () => {
    ctx = await initContext();
  });

  afterEach(() => {
    cleanup.run();
  });

  it("analyzes colors in a sprite", async () => {
    const spritePath = cleanup.track("test_analyze_colors.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
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

    const res = await handleAnalyzeColors(ctx, { inputPath: spritePath });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.uniqueColors).toBeGreaterThan(0);
    expect(data.totalPixels).toBe(256);
  });

  it("quantizes colors", async () => {
    const spritePath = cleanup.track("test_quantize.aseprite");
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

    const res = await handleQuantizeColors(ctx, {
      inputPath: spritePath,
      maxColors: 8,
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
  });

  it("generates a palette from sprite colors", async () => {
    const spritePath = cleanup.track("test_gen_palette.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });
    await handleDrawRect(ctx, {
      inputPath: spritePath,
      x: 0,
      y: 0,
      width: 8,
      height: 16,
      color: "#ff0000",
      outputPath: spritePath,
    });
    await handleDrawRect(ctx, {
      inputPath: spritePath,
      x: 8,
      y: 0,
      width: 8,
      height: 16,
      color: "#00ff00",
      outputPath: spritePath,
    });

    const res = await handleGeneratePalette(ctx, {
      inputPath: spritePath,
      maxColors: 4,
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.paletteSize).toBeGreaterThan(0);
  });

  it("generates a color ramp", async () => {
    const res = await handleColorRamp(ctx, {
      fromColor: "#000000",
      toColor: "#ffffff",
      steps: 5,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.steps).toBe(5);
    expect(data.ramp).toHaveLength(5);
    expect(data.appliedToPalette).toBe(false);
  });

  it("applies color ramp to palette", async () => {
    const spritePath = cleanup.track("test_color_ramp.aseprite");
    await handleCreateSprite(ctx, {
      width: 16,
      height: 16,
      outputPath: spritePath,
    });

    const res = await handleColorRamp(ctx, {
      fromColor: "#ff0000",
      toColor: "#0000ff",
      steps: 8,
      inputPath: spritePath,
      paletteStart: 0,
      outputPath: spritePath,
    });
    const text = assertSuccess(res);
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.appliedToPalette).toBe(true);
  });

  it("returns error for missing inputPath on analyze", async () => {
    const res = await handleAnalyzeColors(ctx, {});
    assertError(res);
  });

  it("returns error for missing fromColor on color_ramp", async () => {
    const res = await handleColorRamp(ctx, { toColor: "#ffffff" });
    assertError(res);
  });
});
